CREATE FUNCTION public.validate_pitchfolio_records() RETURNS trigger LANGUAGE plpgsql SET search_path=public AS $$ DECLARE field text; value jsonb; expected jsonb; BEGIN
 NEW.updated_at=now();
 IF TG_TABLE_NAME='portfolios' THEN
  IF jsonb_typeof(NEW.data) IS DISTINCT FROM 'object' OR octet_length(NEW.data::text)>40000 THEN RAISE EXCEPTION 'Invalid portfolio payload'; END IF;
  FOREACH field IN ARRAY ARRAY['name','role','headline','bio','projectTitle','challenge','action','result','goal','linkedin','github','email'] LOOP
   IF jsonb_typeof(NEW.data->field) IS DISTINCT FROM 'string' OR length(NEW.data->>field)>3000 OR (NEW.data->>field) ~ '[<>]' THEN RAISE EXCEPTION 'Invalid portfolio text'; END IF;
  END LOOP;
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
  IF NEW.slide_1_who_i_am IS DISTINCT FROM expected OR NEW.slide_2_what_i_did IS DISTINCT FROM jsonb_build_object('challenge',value->>'challenge','action',value->>'action','result',value->>'result') OR NEW.slide_3_skills IS DISTINCT FROM jsonb_build_object('skills',value->'skills') OR NEW.slide_4_highlight IS DISTINCT FROM jsonb_build_object('title',value->>'projectTitle','metrics',value->'metrics','journey',value->'journey') OR NEW.slide_5_contact IS DISTINCT FROM jsonb_build_object('goal',value->>'goal','email',value->>'email','linkedin',value->>'linkedin','github',value->>'github') THEN RAISE EXCEPTION 'Deck must match the five portfolio slides'; END IF;
 END IF;
 RETURN NEW; END; $$;
CREATE TRIGGER validate_portfolios BEFORE INSERT OR UPDATE ON public.portfolios FOR EACH ROW EXECUTE FUNCTION public.validate_pitchfolio_records();
CREATE TRIGGER validate_decks BEFORE INSERT OR UPDATE ON public.pitch_decks FOR EACH ROW EXECUTE FUNCTION public.validate_pitchfolio_records();
CREATE FUNCTION public.publish_pitchfolio_draft(p_data jsonb,p_theme public.portfolio_theme,p_slug text DEFAULT NULL,p_input_method public.portfolio_input_method DEFAULT 'guided_questions',p_photo_url text DEFAULT NULL) RETURNS TABLE(portfolio_id uuid,slug text) LANGUAGE plpgsql SECURITY INVOKER SET search_path=public AS $$ DECLARE owner_id uuid:=auth.uid(); saved public.portfolios; next_slug text; BEGIN
 IF owner_id IS NULL THEN RAISE EXCEPTION 'Authentication required'; END IF;
 IF p_photo_url IS NOT NULL THEN RAISE EXCEPTION 'Public photos are not enabled'; END IF;
 IF p_slug IS NULL THEN
  next_slug=left(trim(both '-' FROM regexp_replace(lower(p_data->>'name'),'[^a-z0-9]+','-','g')),40)||'-'||replace(gen_random_uuid()::text,'-','');
  IF next_slug LIKE '-%' THEN next_slug='portfolio'||next_slug; END IF;
  INSERT INTO public.portfolios(user_id,slug,data,selected_theme,theme,is_published,input_method,photo_url) VALUES(owner_id,next_slug,p_data,p_theme,p_theme::text,true,p_input_method,p_photo_url) RETURNING * INTO saved;
 ELSE
  UPDATE public.portfolios SET data=p_data,selected_theme=p_theme,is_published=true,input_method=p_input_method,photo_url=p_photo_url WHERE portfolios.slug=p_slug AND user_id=owner_id RETURNING * INTO saved;
  IF saved.id IS NULL THEN RAISE EXCEPTION 'Portfolio not found or not owned'; END IF;
 END IF;
 INSERT INTO public.pitch_decks(portfolio_id,user_id,slide_1_who_i_am,slide_2_what_i_did,slide_3_skills,slide_4_highlight,slide_5_contact)
 VALUES(saved.id,owner_id,jsonb_build_object('name',p_data->>'name','role',p_data->>'role','headline',p_data->>'headline','bio',p_data->>'bio'),jsonb_build_object('challenge',p_data->>'challenge','action',p_data->>'action','result',p_data->>'result'),jsonb_build_object('skills',p_data->'skills'),jsonb_build_object('title',p_data->>'projectTitle','metrics',p_data->'metrics','journey',p_data->'journey'),jsonb_build_object('goal',p_data->>'goal','email',p_data->>'email','linkedin',p_data->>'linkedin','github',p_data->>'github'))
 ON CONFLICT(portfolio_id) DO UPDATE SET slide_1_who_i_am=EXCLUDED.slide_1_who_i_am,slide_2_what_i_did=EXCLUDED.slide_2_what_i_did,slide_3_skills=EXCLUDED.slide_3_skills,slide_4_highlight=EXCLUDED.slide_4_highlight,slide_5_contact=EXCLUDED.slide_5_contact;
 RETURN QUERY SELECT saved.id,saved.slug; END; $$;
REVOKE ALL ON FUNCTION public.publish_pitchfolio_draft(jsonb,public.portfolio_theme,text,public.portfolio_input_method,text) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.publish_pitchfolio_draft(jsonb,public.portfolio_theme,text,public.portfolio_input_method,text) TO authenticated;