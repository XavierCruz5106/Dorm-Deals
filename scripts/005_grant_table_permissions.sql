-- Ensure API roles can read/write app tables when RLS is disabled.
-- Without these GRANTs, PostgREST can return PGRST205 on insert/update/delete.

GRANT USAGE ON SCHEMA public TO anon, authenticated;

DO $$
DECLARE
  tbl text;
BEGIN
  FOREACH tbl IN ARRAY ARRAY[
    'items',
    'profiles',
    'ratings',
    'favorites',
    'purchases',
    'conversations',
    'messages'
  ]
  LOOP
    IF to_regclass('public.' || tbl) IS NOT NULL THEN
      EXECUTE format(
        'GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.%I TO anon, authenticated;',
        tbl
      );
    END IF;
  END LOOP;
END $$;
