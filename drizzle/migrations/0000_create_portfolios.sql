CREATE TABLE public.portfolios (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  slug text NOT NULL UNIQUE,
  theme text NOT NULL DEFAULT 'moderno',
  data jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.portfolios TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.portfolios TO authenticated;
GRANT ALL ON public.portfolios TO service_role;
ALTER TABLE public.portfolios ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view portfolios" ON public.portfolios FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Owners insert" ON public.portfolios FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Owners update" ON public.portfolios FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Owners delete" ON public.portfolios FOR DELETE TO authenticated USING (auth.uid() = user_id);