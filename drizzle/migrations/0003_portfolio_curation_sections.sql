CREATE TYPE public.skill_category AS ENUM ('hard_skill','soft_skill','tool','language');
CREATE TYPE public.skill_source AS ENUM ('github','linkedin','manual');

CREATE TABLE public.user_projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  portfolio_id uuid NOT NULL REFERENCES public.portfolios(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  name text NOT NULL CHECK (char_length(name) BETWEEN 1 AND 160),
  description text NOT NULL DEFAULT '' CHECK (char_length(description) <= 1000),
  technologies text[] NOT NULL DEFAULT '{}' CHECK (cardinality(technologies) <= 20),
  repository_url text CHECK (repository_url IS NULL OR repository_url ~ '^https://'),
  deploy_url text CHECK (deploy_url IS NULL OR deploy_url ~ '^https://'),
  stars integer NOT NULL DEFAULT 0 CHECK (stars >= 0),
  is_highlight boolean NOT NULL DEFAULT false,
  is_visible boolean NOT NULL DEFAULT true,
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
-- Slide 4 shows exactly one highlight per portfolio.
CREATE UNIQUE INDEX user_projects_one_highlight ON public.user_projects(portfolio_id) WHERE is_highlight;

CREATE TABLE public.user_skills (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  portfolio_id uuid NOT NULL REFERENCES public.portfolios(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  name text NOT NULL CHECK (char_length(name) BETWEEN 1 AND 80),
  category public.skill_category NOT NULL DEFAULT 'hard_skill',
  source public.skill_source NOT NULL DEFAULT 'manual',
  is_visible boolean NOT NULL DEFAULT true,
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (portfolio_id, name)
);

CREATE TABLE public.user_certifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  portfolio_id uuid NOT NULL REFERENCES public.portfolios(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  title text NOT NULL CHECK (char_length(title) BETWEEN 1 AND 200),
  issuer text NOT NULL DEFAULT '' CHECK (char_length(issuer) <= 160),
  issue_date date,
  credential text CHECK (credential IS NULL OR char_length(credential) <= 300),
  is_visible boolean NOT NULL DEFAULT true,
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.professional_timeline (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  portfolio_id uuid NOT NULL REFERENCES public.portfolios(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  role text NOT NULL CHECK (char_length(role) BETWEEN 1 AND 160),
  organization text NOT NULL DEFAULT '' CHECK (char_length(organization) <= 160),
  start_date date,
  end_date date,
  is_current boolean NOT NULL DEFAULT false,
  description text NOT NULL DEFAULT '' CHECK (char_length(description) <= 2000),
  is_visible boolean NOT NULL DEFAULT true,
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  CHECK (end_date IS NULL OR start_date IS NULL OR end_date >= start_date)
);

DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['user_projects','user_skills','user_certifications','professional_timeline'] LOOP
    EXECUTE format('GRANT SELECT, INSERT, UPDATE, DELETE ON public.%I TO authenticated', t);
    EXECUTE format('GRANT SELECT ON public.%I TO anon', t);
    EXECUTE format('GRANT ALL ON public.%I TO service_role', t);
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format('CREATE INDEX %I ON public.%I(portfolio_id, display_order)', t || '_order_idx', t);
    -- Owner sees and edits hidden items; the parent portfolio must also be theirs.
    EXECUTE format($p$CREATE POLICY "Owner manages %1$s" ON public.%1$I FOR ALL TO authenticated
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id AND EXISTS (SELECT 1 FROM public.portfolios p WHERE p.id = portfolio_id AND p.user_id = auth.uid()))$p$, t);
    -- Public reads only visible items of published portfolios, so unchecked items never leak.
    EXECUTE format($p$CREATE POLICY "Public reads visible %1$s" ON public.%1$I FOR SELECT TO anon, authenticated
      USING (is_visible AND EXISTS (SELECT 1 FROM public.portfolios p WHERE p.id = portfolio_id AND p.is_published))$p$, t);
  END LOOP;
END $$;

-- Batch curation in one transaction. SECURITY INVOKER: RLS limits updates to the caller's rows.
CREATE OR REPLACE FUNCTION public.apply_portfolio_curation(p_portfolio_id uuid, p_items jsonb)
RETURNS integer LANGUAGE plpgsql SECURITY INVOKER SET search_path = public AS $$
DECLARE item jsonb; n integer := 0; c integer; tbl text;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'UNAUTHORIZED'; END IF;
  IF NOT EXISTS (SELECT 1 FROM portfolios WHERE id = p_portfolio_id AND user_id = auth.uid()) THEN
    RAISE EXCEPTION 'NOT_FOUND';
  END IF;
  IF jsonb_typeof(p_items) <> 'array' OR jsonb_array_length(p_items) > 300 THEN RAISE EXCEPTION 'INVALID'; END IF;
  -- Clear the old highlight first so the unique index accepts the new one.
  IF EXISTS (SELECT 1 FROM jsonb_array_elements(p_items) e WHERE e->>'section' = 'projects' AND (e->>'is_highlight')::boolean) THEN
    UPDATE user_projects SET is_highlight = false WHERE portfolio_id = p_portfolio_id AND is_highlight;
  END IF;
  FOR item IN SELECT * FROM jsonb_array_elements(p_items) LOOP
    tbl := CASE item->>'section' WHEN 'projects' THEN 'user_projects' WHEN 'skills' THEN 'user_skills'
      WHEN 'certifications' THEN 'user_certifications' WHEN 'timeline' THEN 'professional_timeline' END;
    IF tbl IS NULL THEN RAISE EXCEPTION 'INVALID'; END IF;
    IF item ? 'is_highlight' AND tbl <> 'user_projects' THEN RAISE EXCEPTION 'INVALID'; END IF;
    EXECUTE format('UPDATE public.%I SET is_visible = COALESCE(($1->>''is_visible'')::boolean, is_visible),
      display_order = COALESCE(($1->>''display_order'')::int, display_order)%s
      WHERE id = ($1->>''id'')::uuid AND portfolio_id = $2', tbl,
      CASE WHEN tbl = 'user_projects' THEN ', is_highlight = COALESCE(($1->>''is_highlight'')::boolean, is_highlight), updated_at = now()' ELSE '' END)
      USING item, p_portfolio_id;
    GET DIAGNOSTICS c = ROW_COUNT;
    IF c = 0 THEN RAISE EXCEPTION 'ITEM_NOT_FOUND'; END IF;
    n := n + c;
  END LOOP;
  RETURN n;
END $$;
REVOKE ALL ON FUNCTION public.apply_portfolio_curation(uuid, jsonb) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.apply_portfolio_curation(uuid, jsonb) TO authenticated;