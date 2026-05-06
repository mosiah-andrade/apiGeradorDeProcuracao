alter table "stripe"."_managed_webhooks" enable row level security;

alter table "stripe"."_migrations" enable row level security;

alter table "stripe"."_rate_limits" enable row level security;

alter table "stripe"."_sync_obj_runs" enable row level security;

alter table "stripe"."_sync_runs" enable row level security;

alter table "stripe"."accounts" enable row level security;

alter table "stripe"."active_entitlements" enable row level security;

alter table "stripe"."charges" enable row level security;

alter table "stripe"."checkout_session_line_items" enable row level security;

alter table "stripe"."checkout_sessions" enable row level security;

alter table "stripe"."coupons" enable row level security;

alter table "stripe"."credit_notes" enable row level security;

alter table "stripe"."customers" enable row level security;

alter table "stripe"."disputes" enable row level security;

alter table "stripe"."early_fraud_warnings" enable row level security;

alter table "stripe"."features" enable row level security;

alter table "stripe"."invoices" enable row level security;

alter table "stripe"."payment_intents" enable row level security;

alter table "stripe"."payment_methods" enable row level security;

alter table "stripe"."plans" enable row level security;

alter table "stripe"."prices" enable row level security;

alter table "stripe"."products" enable row level security;

alter table "stripe"."refunds" enable row level security;

alter table "stripe"."reviews" enable row level security;

alter table "stripe"."setup_intents" enable row level security;

alter table "stripe"."subscription_items" enable row level security;

alter table "stripe"."subscription_schedules" enable row level security;

alter table "stripe"."subscriptions" enable row level security;

alter table "stripe"."tax_ids" enable row level security;

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.rls_auto_enable()
 RETURNS event_trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'pg_catalog'
AS $function$
DECLARE
  cmd record;
BEGIN
  FOR cmd IN
    SELECT *
    FROM pg_event_trigger_ddl_commands()
    WHERE command_tag IN ('CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO')
      AND object_type IN ('table','partitioned table')
  LOOP
     IF cmd.schema_name IS NOT NULL AND cmd.schema_name IN ('public') AND cmd.schema_name NOT IN ('pg_catalog','information_schema') AND cmd.schema_name NOT LIKE 'pg_toast%' AND cmd.schema_name NOT LIKE 'pg_temp%' THEN
      BEGIN
        EXECUTE format('alter table if exists %s enable row level security', cmd.object_identity);
        RAISE LOG 'rls_auto_enable: enabled RLS on %', cmd.object_identity;
      EXCEPTION
        WHEN OTHERS THEN
          RAISE LOG 'rls_auto_enable: failed to enable RLS on %', cmd.object_identity;
      END;
     ELSE
        RAISE LOG 'rls_auto_enable: skip % (either system schema or not in enforced list: %.)', cmd.object_identity, cmd.schema_name;
     END IF;
  END LOOP;
END;
$function$
;

CREATE OR REPLACE FUNCTION stripe.check_rate_limit(rate_key text, max_requests integer, window_seconds integer)
 RETURNS void
 LANGUAGE plpgsql
AS $function$
DECLARE
  now TIMESTAMPTZ := clock_timestamp();
  window_length INTERVAL := make_interval(secs => window_seconds);
  current_count INTEGER;
BEGIN
  PERFORM pg_advisory_xact_lock(hashtext(rate_key));

  INSERT INTO "stripe"."_rate_limits" (key, count, window_start)
  VALUES (rate_key, 1, now)
  ON CONFLICT (key) DO UPDATE
  SET count = CASE
                WHEN "_rate_limits".window_start + window_length <= now
                  THEN 1
                  ELSE "_rate_limits".count + 1
              END,
      window_start = CASE
                       WHEN "_rate_limits".window_start + window_length <= now
                         THEN now
                         ELSE "_rate_limits".window_start
                     END;

  SELECT count INTO current_count FROM "stripe"."_rate_limits" WHERE key = rate_key;

  IF current_count > max_requests THEN
    RAISE EXCEPTION 'Rate limit exceeded for %', rate_key;
  END IF;
END;
$function$
;

CREATE OR REPLACE FUNCTION stripe.set_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  -- Support both legacy "updated_at" and newer "_updated_at" columns.
  -- jsonb_populate_record silently ignores keys that are not present on NEW.
  NEW := jsonb_populate_record(
    NEW,
    jsonb_build_object(
      'updated_at', now(),
      '_updated_at', now()
    )
  );
  RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION stripe.set_updated_at_metadata()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$
;


