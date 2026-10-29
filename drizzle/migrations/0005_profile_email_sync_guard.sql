CREATE OR REPLACE FUNCTION public.guard_pitchfolio_profile()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
BEGIN
  -- Email always mirrors the auth account; users cannot overwrite it.
  SELECT COALESCE(u.email,'') INTO NEW.email FROM auth.users u WHERE u.id = NEW.id;
  NEW.id := OLD.id;
  NEW.created_at := OLD.created_at;
  NEW.full_name := left(btrim(regexp_replace(COALESCE(NEW.full_name,''), '[[:cntrl:]<>]', '', 'g')), 120);
  NEW.updated_at := now();
  RETURN NEW;
END; $$;
DROP TRIGGER IF EXISTS pitchfolio_profile_guard ON public.profiles;
CREATE TRIGGER pitchfolio_profile_guard BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.guard_pitchfolio_profile();

CREATE OR REPLACE FUNCTION public.sync_pitchfolio_profile_email()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
BEGIN
  UPDATE public.profiles SET email = COALESCE(NEW.email,'') WHERE id = NEW.id;
  RETURN NEW;
END; $$;
DROP TRIGGER IF EXISTS pitchfolio_profile_email_sync ON auth.users;
CREATE TRIGGER pitchfolio_profile_email_sync AFTER UPDATE OF email ON auth.users FOR EACH ROW WHEN (OLD.email IS DISTINCT FROM NEW.email) EXECUTE FUNCTION public.sync_pitchfolio_profile_email();
REVOKE EXECUTE ON FUNCTION public.guard_pitchfolio_profile(), public.sync_pitchfolio_profile_email() FROM PUBLIC, anon, authenticated;