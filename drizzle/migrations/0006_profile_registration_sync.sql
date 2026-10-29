ALTER TABLE public.profiles
  ADD COLUMN first_name text NOT NULL DEFAULT '',
  ADD COLUMN last_name text NOT NULL DEFAULT '',
  ADD COLUMN phone_number text NOT NULL DEFAULT '',
  ADD COLUMN linkedin_url text,
  ADD COLUMN github_url text;

-- Backfill names from the legacy full_name column.
UPDATE public.profiles SET first_name = split_part(full_name,' ',1), last_name = btrim(substr(full_name, length(split_part(full_name,' ',1))+1)) WHERE full_name <> '';

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_first_name_len CHECK (char_length(first_name) <= 60),
  ADD CONSTRAINT profiles_last_name_len CHECK (char_length(last_name) <= 60),
  ADD CONSTRAINT profiles_phone_format CHECK (phone_number = '' OR phone_number ~ '^\+[1-9][0-9]{7,14}$'),
  ADD CONSTRAINT profiles_linkedin_format CHECK (linkedin_url IS NULL OR linkedin_url ~ '^https://(www\.)?linkedin\.com/in/[A-Za-z0-9_-]{3,100}/?$'),
  ADD CONSTRAINT profiles_github_format CHECK (github_url IS NULL OR github_url ~ '^https://(www\.)?github\.com/[A-Za-z0-9-]{1,39}/?$');
CREATE UNIQUE INDEX profiles_email_unique ON public.profiles (lower(email)) WHERE email <> '';
COMMENT ON COLUMN public.profiles.full_name IS 'DERIVED: first_name + last_name, kept for older clients';

-- Signup: copy first/last name and phone from auth metadata.
CREATE OR REPLACE FUNCTION public.create_pitchfolio_profile()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE fn text; ln text; ph text;
BEGIN
  fn := left(btrim(regexp_replace(COALESCE(NEW.raw_user_meta_data->>'first_name',''), '[[:cntrl:]<>]', '', 'g')), 60);
  ln := left(btrim(regexp_replace(COALESCE(NEW.raw_user_meta_data->>'last_name',''), '[[:cntrl:]<>]', '', 'g')), 60);
  ph := COALESCE(NEW.raw_user_meta_data->>'phone_number','');
  IF ph !~ '^\+[1-9][0-9]{7,14}$' THEN ph := ''; END IF;
  INSERT INTO public.profiles(id,email,first_name,last_name,phone_number,full_name)
  VALUES (NEW.id, COALESCE(NEW.email,''), fn, ln, ph,
    left(COALESCE(NULLIF(btrim(fn||' '||ln),''), NEW.raw_user_meta_data->>'full_name', ''),120))
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END; $$;

-- Update guard: email mirrors auth, names sanitized, full_name derived.
CREATE OR REPLACE FUNCTION public.guard_pitchfolio_profile()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  SELECT COALESCE(u.email,'') INTO NEW.email FROM auth.users u WHERE u.id = NEW.id;
  NEW.id := OLD.id;
  NEW.created_at := OLD.created_at;
  NEW.first_name := left(btrim(regexp_replace(COALESCE(NEW.first_name,''), '[[:cntrl:]<>]', '', 'g')), 60);
  NEW.last_name := left(btrim(regexp_replace(COALESCE(NEW.last_name,''), '[[:cntrl:]<>]', '', 'g')), 60);
  IF NEW.first_name IS DISTINCT FROM OLD.first_name OR NEW.last_name IS DISTINCT FROM OLD.last_name THEN
    NEW.full_name := left(btrim(NEW.first_name||' '||NEW.last_name), 120);
  ELSE
    NEW.full_name := left(btrim(regexp_replace(COALESCE(NEW.full_name,''), '[[:cntrl:]<>]', '', 'g')), 120);
  END IF;
  NEW.updated_at := now();
  RETURN NEW;
END; $$;

-- Deck slide 5 may carry the profile phone when the portfolio data has one.
CREATE OR REPLACE FUNCTION public.validate_pitchfolio_records() RETURNS trigger LANGUAGE plpgsql SET search_path=public AS $$ DECLARE field text; value jsonb; expected jsonb; contact jsonb; BEGIN
 NEW.updated_at=now();
 IF TG_TABLE_NAME='portfolios' THEN
  IF jsonb_typeof(NEW.data) IS DISTINCT FROM 'object' OR octet_length(NEW.data::text)>40000 THEN RAISE EXCEPTION 'Invalid portfolio payload'; END IF;
  FOREACH field IN ARRAY ARRAY['name','role','headline','bio','projectTitle','challenge','action','result','goal','linkedin','github','email'] LOOP
   IF jsonb_typeof(NEW.data->field) IS DISTINCT FROM 'string' OR length(NEW.data->>field)>3000 OR (NEW.data->>field) ~ '[<>]' THEN RAISE EXCEPTION 'Invalid portfolio text'; END IF;
  END LOOP;
  IF NEW.data ? 'phone' AND (jsonb_typeof(NEW.data->'phone') IS DISTINCT FROM 'string' OR (NEW.data->>'phone') !~ '^(\+[1-9][0-9]{7,14})?$') THEN RAISE EXCEPTION 'Invalid portfolio phone'; END IF;
  IF length(NEW.data->>'name') NOT BETWEEN 1 AND 120 OR length(NEW.data->>'email')>254 OR NEW.slug !~ '^[a-z0-9]+(-[a-z0-9]+)*$' OR length(NEW.slug)>80 THEN RAISE EXCEPTION 'Invalid portfolio identity'; END IF;
  FOREACH field IN ARRAY ARRAY['linkedin','github'] LOOP
   IF COALESCE(NEW.data->>field,'')<>'' AND ((NEW.data->>field) ~* '^(javascript|data|vbscript|file):' OR (NEW.data->>field) ~ '[[:space:]]') THEN RAISE EXCEPTION 'Unsafe contact URL'; END IF;
  END LOOP;
  FOREACH field IN ARRAY ARRAY['metrics','skills','journey'] LOOP
   IF jsonb_typeof(NEW.data->field) IS DISTINCT FROM 'array' THEN RAISE EXCEPTION 'Invalid portfolio list'; END IF;
   IF jsonb_array_length(NEW.data->field)>(CASE field WHEN 'metrics' THEN 4 WHEN 'skills' THEN 6 ELSE 5 END) THEN RAISE EXCEPTION 'Too many list entries'; END IF;
   FOR value IN SELECT * FROM jsonb_array_elements(NEW.data->field) LOOP
    IF jsonb_typeof(value) IS DISTINCT FROM 'string' OR length(value#>>'{}')>500 OR (value#>>'{}') ~ '[<>]' THEN RAISE EXCEPTION 'Invalid portfolio list entry'; END IF;
   END LOOP;
  END LOOP;
  NEW.name=NEW.data->>'name'; NEW.about_me=NEW.data->>'bio'; NEW.theme=NEW.selected_theme::text;
  NEW.experience=jsonb_build_array(jsonb_build_object('title',NEW.data->>'projectTitle','challenge',NEW.data->>'challenge','action',NEW.data->>'action','result',NEW.data->>'result'));
 ELSE
  SELECT data INTO value FROM public.portfolios WHERE id=NEW.portfolio_id AND user_id=NEW.user_id;
  IF value IS NULL THEN RAISE EXCEPTION 'Deck owner does not match portfolio'; END IF;
  expected=jsonb_build_object('name',value->>'name','role',value->>'role','headline',value->>'headline','bio',value->>'bio');
  contact=jsonb_build_object('goal',value->>'goal','email',value->>'email','linkedin',value->>'linkedin','github',value->>'github');
  IF value ? 'phone' AND NEW.slide_5_contact ? 'phone' THEN contact=contact||jsonb_build_object('phone',value->>'phone'); END IF;
  IF NEW.slide_1_who_i_am IS DISTINCT FROM expected OR NEW.slide_2_what_i_did IS DISTINCT FROM jsonb_build_object('challenge',value->>'challenge','action',value->>'action','result',value->>'result') OR NEW.slide_3_skills IS DISTINCT FROM jsonb_build_object('skills',value->'skills') OR NEW.slide_4_highlight IS DISTINCT FROM jsonb_build_object('title',value->>'projectTitle','metrics',value->'metrics','journey',value->'journey') OR NEW.slide_5_contact IS DISTINCT FROM contact THEN RAISE EXCEPTION 'Deck must match the five portfolio slides'; END IF;
 END IF;
 RETURN NEW; END; $$;

-- Profile -> portfolios + slide 1/5 sync, one transaction with the profile update.
CREATE OR REPLACE FUNCTION public.sync_profile_to_portfolio()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_name text := left(btrim(NEW.first_name||' '||NEW.last_name),120);
BEGIN
  UPDATE public.portfolios p SET
    data = p.data
      || CASE WHEN v_name <> '' THEN jsonb_build_object('name', v_name) ELSE '{}'::jsonb END
      || jsonb_build_object('email', NEW.email, 'phone', NEW.phone_number,
           'linkedin', COALESCE(NEW.linkedin_url, p.data->>'linkedin', ''),
           'github', COALESCE(NEW.github_url, p.data->>'github', '')),
    photo_url = COALESCE(NEW.avatar_url, p.photo_url)
  WHERE p.user_id = NEW.id;
  UPDATE public.pitch_decks d SET
    slide_1_who_i_am = d.slide_1_who_i_am || jsonb_build_object('name', p.data->>'name'),
    slide_5_contact = jsonb_build_object('goal',p.data->>'goal','email',p.data->>'email','linkedin',p.data->>'linkedin','github',p.data->>'github','phone',p.data->>'phone')
  FROM public.portfolios p WHERE d.portfolio_id = p.id AND p.user_id = NEW.id;
  RETURN NEW;
END; $$;
CREATE TRIGGER sync_profile_to_portfolio AFTER UPDATE ON public.profiles FOR EACH ROW
  WHEN (OLD.first_name IS DISTINCT FROM NEW.first_name OR OLD.last_name IS DISTINCT FROM NEW.last_name OR OLD.avatar_url IS DISTINCT FROM NEW.avatar_url OR OLD.phone_number IS DISTINCT FROM NEW.phone_number OR OLD.linkedin_url IS DISTINCT FROM NEW.linkedin_url OR OLD.github_url IS DISTINCT FROM NEW.github_url OR OLD.email IS DISTINCT FROM NEW.email)
  EXECUTE FUNCTION public.sync_profile_to_portfolio();
REVOKE EXECUTE ON FUNCTION public.sync_profile_to_portfolio(), public.create_pitchfolio_profile() FROM PUBLIC, anon, authenticated;

-- Avatars accept only image extensions (bytes are also checked server-side).
CREATE POLICY avatars_mime_guard ON storage.objects AS RESTRICTIVE FOR INSERT TO authenticated
  WITH CHECK (bucket_id <> 'avatars' OR lower(storage.extension(name)) IN ('jpg','jpeg','png','webp'));