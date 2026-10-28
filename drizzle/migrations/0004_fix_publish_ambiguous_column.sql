CREATE OR REPLACE FUNCTION public.publish_pitchfolio_draft(p_data jsonb, p_theme portfolio_theme, p_slug text DEFAULT NULL::text, p_input_method portfolio_input_method DEFAULT 'guided_questions'::portfolio_input_method, p_photo_url text DEFAULT NULL::text)
 RETURNS TABLE(portfolio_id uuid, slug text)
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
#variable_conflict use_column
DECLARE owner_id uuid:=auth.uid(); saved public.portfolios; next_slug text; BEGIN
 IF owner_id IS NULL THEN RAISE EXCEPTION 'Authentication required'; END IF;
 IF p_photo_url IS NOT NULL THEN RAISE EXCEPTION 'Public photos are not enabled'; END IF;
 IF p_slug IS NULL THEN
  next_slug=left(trim(both '-' FROM regexp_replace(lower(p_data->>'name'),'[^a-z0-9]+','-','g')),40)||'-'||replace(gen_random_uuid()::text,'-','');
  IF next_slug LIKE '-%' THEN next_slug='portfolio'||next_slug; END IF;
  INSERT INTO public.portfolios(user_id,slug,data,selected_theme,theme,is_published,input_method,photo_url) VALUES(owner_id,next_slug,p_data,p_theme,p_theme::text,true,p_input_method,p_photo_url) RETURNING * INTO saved;
 ELSE
  UPDATE public.portfolios SET data=p_data,selected_theme=p_theme,is_published=true,input_method=p_input_method,photo_url=p_photo_url WHERE portfolios.slug=p_slug AND portfolios.user_id=owner_id RETURNING * INTO saved;
  IF saved.id IS NULL THEN RAISE EXCEPTION 'Portfolio not found or not owned'; END IF;
 END IF;
 INSERT INTO public.pitch_decks AS pd(portfolio_id,user_id,slide_1_who_i_am,slide_2_what_i_did,slide_3_skills,slide_4_highlight,slide_5_contact)
 VALUES(saved.id,owner_id,jsonb_build_object('name',p_data->>'name','role',p_data->>'role','headline',p_data->>'headline','bio',p_data->>'bio'),jsonb_build_object('challenge',p_data->>'challenge','action',p_data->>'action','result',p_data->>'result'),jsonb_build_object('skills',p_data->'skills'),jsonb_build_object('title',p_data->>'projectTitle','metrics',p_data->'metrics','journey',p_data->'journey'),jsonb_build_object('goal',p_data->>'goal','email',p_data->>'email','linkedin',p_data->>'linkedin','github',p_data->>'github'))
 ON CONFLICT(portfolio_id) DO UPDATE SET slide_1_who_i_am=EXCLUDED.slide_1_who_i_am,slide_2_what_i_did=EXCLUDED.slide_2_what_i_did,slide_3_skills=EXCLUDED.slide_3_skills,slide_4_highlight=EXCLUDED.slide_4_highlight,slide_5_contact=EXCLUDED.slide_5_contact;
 RETURN QUERY SELECT saved.id,saved.slug; END; $function$;