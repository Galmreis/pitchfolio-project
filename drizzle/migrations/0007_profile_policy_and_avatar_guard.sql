DROP POLICY IF EXISTS profiles_owner ON public.profiles;
CREATE POLICY profiles_owner_select ON public.profiles FOR SELECT TO authenticated USING (id = auth.uid());
CREATE POLICY profiles_owner_update ON public.profiles FOR UPDATE TO authenticated USING (id = auth.uid()) WITH CHECK (id = auth.uid());
REVOKE INSERT, DELETE ON public.profiles FROM authenticated, anon;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_avatar_url_safe CHECK (avatar_url IS NULL OR (length(avatar_url) <= 500 AND (avatar_url ~ '^avatars/[0-9a-f-]{36}/avatar\.(jpg|png|webp)$' OR avatar_url ~ '^https://[^\s<>"'']+$')));
ALTER TABLE public.portfolios ADD CONSTRAINT portfolios_photo_url_safe CHECK (photo_url IS NULL OR (length(photo_url) <= 500 AND (photo_url ~ '^avatars/[0-9a-f-]{36}/avatar\.(jpg|png|webp)$' OR photo_url ~ '^https://[^\s<>"'']+$')));