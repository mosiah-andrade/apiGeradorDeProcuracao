


SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


CREATE EXTENSION IF NOT EXISTS "pg_cron" WITH SCHEMA "pg_catalog";






CREATE EXTENSION IF NOT EXISTS "pg_net" WITH SCHEMA "extensions";






COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE SCHEMA IF NOT EXISTS "stripe";


ALTER SCHEMA "stripe" OWNER TO "postgres";


COMMENT ON SCHEMA "stripe" IS '{"status":"installed","newVersion":"1.0.31"}';



CREATE EXTENSION IF NOT EXISTS "btree_gist" WITH SCHEMA "stripe";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgmq";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE OR REPLACE FUNCTION "public"."can_user_create_proposta"("target_user_id" "uuid") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
declare
    is_pro boolean;
    proposta_count int;
begin
    -- 1. Verifica se o usuário tem uma assinatura ativa
    select exists (
        select 1 from public.subscriptions 
        where user_id = target_user_id and status = 'active'
    ) into is_pro;

    -- 2. Se for PRO, acesso liberado (true)
    if is_pro then
        return true;
    end if;

    -- 3. Se não for PRO, conta quantas propostas ele fez no mês atual
    select count(*)
    from public.propostas
    where user_id = target_user_id
    and created_at >= date_trunc('month', now())
    into proposta_count;

    -- 4. Retorna true se ele tiver feito menos de 20 propostas
    return proposta_count < 20;
end;
$$;


ALTER FUNCTION "public"."can_user_create_proposta"("target_user_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
begin
  perform
    net.http_post(
      url := 'https://[SEU-PROJECT-ID].supabase.co/functions/v1/create-stripe-customer',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || '[SUA_SERVICE_ROLE_KEY]'
      ),
      body := jsonb_build_object('record', row_to_json(new))
    );
  return new;
end;
$$;


ALTER FUNCTION "public"."handle_new_user"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."rls_auto_enable"() RETURNS "event_trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'pg_catalog'
    AS $$
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
$$;


ALTER FUNCTION "public"."rls_auto_enable"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "stripe"."check_rate_limit"("rate_key" "text", "max_requests" integer, "window_seconds" integer) RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$
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
$$;


ALTER FUNCTION "stripe"."check_rate_limit"("rate_key" "text", "max_requests" integer, "window_seconds" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "stripe"."set_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
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
$$;


ALTER FUNCTION "stripe"."set_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "stripe"."set_updated_at_metadata"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "stripe"."set_updated_at_metadata"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."prices" (
    "id" "text" NOT NULL,
    "product_id" "text",
    "active" boolean,
    "description" "text",
    "unit_amount" bigint,
    "currency" "text",
    "type" "text",
    "interval" "text",
    "interval_count" integer,
    "metadata" "jsonb",
    CONSTRAINT "prices_currency_check" CHECK (("char_length"("currency") = 3)),
    CONSTRAINT "prices_interval_check" CHECK (("interval" = ANY (ARRAY['day'::"text", 'week'::"text", 'month'::"text", 'year'::"text"]))),
    CONSTRAINT "prices_type_check" CHECK (("type" = ANY (ARRAY['one_time'::"text", 'recurring'::"text"])))
);


ALTER TABLE "public"."prices" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."products" (
    "id" "text" NOT NULL,
    "active" boolean,
    "name" "text",
    "description" "text",
    "image" "text",
    "metadata" "jsonb"
);


ALTER TABLE "public"."products" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."profiles" (
    "id" "uuid" NOT NULL,
    "full_name" "text",
    "company_name" "text",
    "phone" "text",
    "website" "text",
    "avatar_url" "text",
    "company_logo_url" "text",
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()),
    "stripe_customer_id" "text",
    "stripe_subscription_id" "text",
    "stripe_price_id" "text"
);


ALTER TABLE "public"."profiles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."propostas" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "user_id" "uuid" NOT NULL,
    "cliente_name" "text" NOT NULL,
    "valor_total" numeric NOT NULL,
    "potencia_kwp" numeric NOT NULL,
    "cliente_email" "text",
    "itens_config" "jsonb" DEFAULT '[]'::"jsonb",
    "consumo_mensal" numeric,
    "geracao_estimada" numeric,
    "payback_anos" numeric,
    "tipo_telhado" "text"
);


ALTER TABLE "public"."propostas" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."subscriptions" (
    "id" "text" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "status" "text",
    "metadata" "jsonb",
    "price_id" "text",
    "quantity" integer,
    "cancel_at_period_end" boolean,
    "created" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "current_period_start" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "current_period_end" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "ended_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()),
    "cancel_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()),
    "canceled_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()),
    "trial_start" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()),
    "trial_end" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()),
    CONSTRAINT "subscriptions_status_check" CHECK (("status" = ANY (ARRAY['trialing'::"text", 'active'::"text", 'canceled'::"text", 'incomplete'::"text", 'incomplete_expired'::"text", 'past_due'::"text", 'unpaid'::"text"])))
);


ALTER TABLE "public"."subscriptions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "stripe"."_managed_webhooks" (
    "id" "text" NOT NULL,
    "object" "text",
    "url" "text" NOT NULL,
    "enabled_events" "jsonb" NOT NULL,
    "description" "text",
    "enabled" boolean,
    "livemode" boolean,
    "metadata" "jsonb",
    "secret" "text" NOT NULL,
    "status" "text",
    "api_version" "text",
    "created" bigint,
    "last_synced_at" timestamp with time zone,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "account_id" "text" NOT NULL
);


ALTER TABLE "stripe"."_managed_webhooks" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "stripe"."_migrations" (
    "id" integer NOT NULL,
    "name" character varying(100) NOT NULL,
    "hash" character varying(40) NOT NULL,
    "executed_at" timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE "stripe"."_migrations" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "stripe"."_rate_limits" (
    "key" "text" NOT NULL,
    "count" integer DEFAULT 0 NOT NULL,
    "window_start" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "stripe"."_rate_limits" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "stripe"."_sync_obj_runs" (
    "_account_id" "text" NOT NULL,
    "run_started_at" timestamp with time zone NOT NULL,
    "object" "text" NOT NULL,
    "status" "text" DEFAULT 'pending'::"text" NOT NULL,
    "started_at" timestamp with time zone,
    "completed_at" timestamp with time zone,
    "processed_count" integer DEFAULT 0 NOT NULL,
    "cursor" "text",
    "page_cursor" "text",
    "created_gte" integer DEFAULT 0 NOT NULL,
    "created_lte" integer DEFAULT 0 NOT NULL,
    "priority" integer DEFAULT 0 NOT NULL,
    "error_message" "text",
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "_sync_obj_runs_status_check" CHECK (("status" = ANY (ARRAY['pending'::"text", 'running'::"text", 'complete'::"text", 'error'::"text"])))
);


ALTER TABLE "stripe"."_sync_obj_runs" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "stripe"."_sync_runs" (
    "_account_id" "text" NOT NULL,
    "started_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "closed_at" timestamp with time zone,
    "max_concurrent" integer DEFAULT 3 NOT NULL,
    "triggered_by" "text",
    "error_message" "text",
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "stripe"."_sync_runs" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "stripe"."accounts" (
    "_raw_data" "jsonb" NOT NULL,
    "id" "text" GENERATED ALWAYS AS (("_raw_data" ->> 'id'::"text")) STORED NOT NULL,
    "api_key_hashes" "text"[] DEFAULT '{}'::"text"[] NOT NULL,
    "first_synced_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "_last_synced_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "_updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "stripe"."accounts" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "stripe"."active_entitlements" (
    "_raw_data" "jsonb" NOT NULL,
    "_last_synced_at" timestamp with time zone,
    "_updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "_account_id" "text" NOT NULL,
    "id" "text" GENERATED ALWAYS AS (("_raw_data" ->> 'id'::"text")) STORED NOT NULL,
    "customer" "text" GENERATED ALWAYS AS (("_raw_data" ->> 'customer'::"text")) STORED,
    "feature" "text" GENERATED ALWAYS AS (("_raw_data" ->> 'feature'::"text")) STORED,
    "livemode" boolean GENERATED ALWAYS AS ((NULLIF(("_raw_data" ->> 'livemode'::"text"), ''::"text"))::boolean) STORED,
    "lookup_key" "text" GENERATED ALWAYS AS (("_raw_data" ->> 'lookup_key'::"text")) STORED,
    "object" "text" GENERATED ALWAYS AS (("_raw_data" ->> 'object'::"text")) STORED
);


ALTER TABLE "stripe"."active_entitlements" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "stripe"."charges" (
    "_raw_data" "jsonb" NOT NULL,
    "_last_synced_at" timestamp with time zone,
    "_updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "_account_id" "text" NOT NULL,
    "id" "text" GENERATED ALWAYS AS (("_raw_data" ->> 'id'::"text")) STORED NOT NULL,
    "amount" bigint GENERATED ALWAYS AS ((NULLIF(("_raw_data" ->> 'amount'::"text"), ''::"text"))::bigint) STORED,
    "amount_refunded" bigint GENERATED ALWAYS AS ((NULLIF(("_raw_data" ->> 'amount_refunded'::"text"), ''::"text"))::bigint) STORED,
    "application" "text" GENERATED ALWAYS AS (
CASE
    WHEN (("jsonb_typeof"(("_raw_data" -> 'application'::"text")) = 'object'::"text") AND (("_raw_data" -> 'application'::"text") ? 'id'::"text")) THEN (("_raw_data" -> 'application'::"text") ->> 'id'::"text")
    ELSE ("_raw_data" ->> 'application'::"text")
END) STORED,
    "application_fee" "text" GENERATED ALWAYS AS (
CASE
    WHEN (("jsonb_typeof"(("_raw_data" -> 'application_fee'::"text")) = 'object'::"text") AND (("_raw_data" -> 'application_fee'::"text") ? 'id'::"text")) THEN (("_raw_data" -> 'application_fee'::"text") ->> 'id'::"text")
    ELSE ("_raw_data" ->> 'application_fee'::"text")
END) STORED,
    "application_fee_amount" bigint GENERATED ALWAYS AS ((NULLIF(("_raw_data" ->> 'application_fee_amount'::"text"), ''::"text"))::bigint) STORED,
    "balance_transaction" "text" GENERATED ALWAYS AS (
CASE
    WHEN (("jsonb_typeof"(("_raw_data" -> 'balance_transaction'::"text")) = 'object'::"text") AND (("_raw_data" -> 'balance_transaction'::"text") ? 'id'::"text")) THEN (("_raw_data" -> 'balance_transaction'::"text") ->> 'id'::"text")
    ELSE ("_raw_data" ->> 'balance_transaction'::"text")
END) STORED,
    "billing_details" "jsonb" GENERATED ALWAYS AS (("_raw_data" -> 'billing_details'::"text")) STORED,
    "calculated_statement_descriptor" "text" GENERATED ALWAYS AS (("_raw_data" ->> 'calculated_statement_descriptor'::"text")) STORED,
    "captured" boolean GENERATED ALWAYS AS ((NULLIF(("_raw_data" ->> 'captured'::"text"), ''::"text"))::boolean) STORED,
    "created" bigint GENERATED ALWAYS AS ((NULLIF(("_raw_data" ->> 'created'::"text"), ''::"text"))::bigint) STORED,
    "currency" "text" GENERATED ALWAYS AS (("_raw_data" ->> 'currency'::"text")) STORED,
    "customer" "text" GENERATED ALWAYS AS (
CASE
    WHEN (("jsonb_typeof"(("_raw_data" -> 'customer'::"text")) = 'object'::"text") AND (("_raw_data" -> 'customer'::"text") ? 'id'::"text")) THEN (("_raw_data" -> 'customer'::"text") ->> 'id'::"text")
    ELSE ("_raw_data" ->> 'customer'::"text")
END) STORED,
    "description" "text" GENERATED ALWAYS AS (("_raw_data" ->> 'description'::"text")) STORED,
    "disputed" boolean GENERATED ALWAYS AS ((NULLIF(("_raw_data" ->> 'disputed'::"text"), ''::"text"))::boolean) STORED,
    "failure_code" "text" GENERATED ALWAYS AS (("_raw_data" ->> 'failure_code'::"text")) STORED,
    "failure_message" "text" GENERATED ALWAYS AS (("_raw_data" ->> 'failure_message'::"text")) STORED,
    "fraud_details" "jsonb" GENERATED ALWAYS AS (("_raw_data" -> 'fraud_details'::"text")) STORED,
    "invoice" "text" GENERATED ALWAYS AS (
CASE
    WHEN (("jsonb_typeof"(("_raw_data" -> 'invoice'::"text")) = 'object'::"text") AND (("_raw_data" -> 'invoice'::"text") ? 'id'::"text")) THEN (("_raw_data" -> 'invoice'::"text") ->> 'id'::"text")
    ELSE ("_raw_data" ->> 'invoice'::"text")
END) STORED,
    "livemode" boolean GENERATED ALWAYS AS ((NULLIF(("_raw_data" ->> 'livemode'::"text"), ''::"text"))::boolean) STORED,
    "metadata" "jsonb" GENERATED ALWAYS AS (("_raw_data" -> 'metadata'::"text")) STORED,
    "object" "text" GENERATED ALWAYS AS (("_raw_data" ->> 'object'::"text")) STORED,
    "on_behalf_of" "text" GENERATED ALWAYS AS (
CASE
    WHEN (("jsonb_typeof"(("_raw_data" -> 'on_behalf_of'::"text")) = 'object'::"text") AND (("_raw_data" -> 'on_behalf_of'::"text") ? 'id'::"text")) THEN (("_raw_data" -> 'on_behalf_of'::"text") ->> 'id'::"text")
    ELSE ("_raw_data" ->> 'on_behalf_of'::"text")
END) STORED,
    "order" "text" GENERATED ALWAYS AS (
CASE
    WHEN (("jsonb_typeof"(("_raw_data" -> 'order'::"text")) = 'object'::"text") AND (("_raw_data" -> 'order'::"text") ? 'id'::"text")) THEN (("_raw_data" -> 'order'::"text") ->> 'id'::"text")
    ELSE ("_raw_data" ->> 'order'::"text")
END) STORED,
    "outcome" "jsonb" GENERATED ALWAYS AS (("_raw_data" -> 'outcome'::"text")) STORED,
    "paid" boolean GENERATED ALWAYS AS ((NULLIF(("_raw_data" ->> 'paid'::"text"), ''::"text"))::boolean) STORED,
    "payment_intent" "text" GENERATED ALWAYS AS (
CASE
    WHEN (("jsonb_typeof"(("_raw_data" -> 'payment_intent'::"text")) = 'object'::"text") AND (("_raw_data" -> 'payment_intent'::"text") ? 'id'::"text")) THEN (("_raw_data" -> 'payment_intent'::"text") ->> 'id'::"text")
    ELSE ("_raw_data" ->> 'payment_intent'::"text")
END) STORED,
    "payment_method" "text" GENERATED ALWAYS AS (("_raw_data" ->> 'payment_method'::"text")) STORED,
    "payment_method_details" "jsonb" GENERATED ALWAYS AS (("_raw_data" -> 'payment_method_details'::"text")) STORED,
    "receipt_email" "text" GENERATED ALWAYS AS (("_raw_data" ->> 'receipt_email'::"text")) STORED,
    "receipt_number" "text" GENERATED ALWAYS AS (("_raw_data" ->> 'receipt_number'::"text")) STORED,
    "receipt_url" "text" GENERATED ALWAYS AS (("_raw_data" ->> 'receipt_url'::"text")) STORED,
    "refunded" boolean GENERATED ALWAYS AS ((NULLIF(("_raw_data" ->> 'refunded'::"text"), ''::"text"))::boolean) STORED,
    "refunds" "jsonb" GENERATED ALWAYS AS (("_raw_data" -> 'refunds'::"text")) STORED,
    "review" "text" GENERATED ALWAYS AS (
CASE
    WHEN (("jsonb_typeof"(("_raw_data" -> 'review'::"text")) = 'object'::"text") AND (("_raw_data" -> 'review'::"text") ? 'id'::"text")) THEN (("_raw_data" -> 'review'::"text") ->> 'id'::"text")
    ELSE ("_raw_data" ->> 'review'::"text")
END) STORED,
    "shipping" "jsonb" GENERATED ALWAYS AS (("_raw_data" -> 'shipping'::"text")) STORED,
    "source_transfer" "text" GENERATED ALWAYS AS (
CASE
    WHEN (("jsonb_typeof"(("_raw_data" -> 'source_transfer'::"text")) = 'object'::"text") AND (("_raw_data" -> 'source_transfer'::"text") ? 'id'::"text")) THEN (("_raw_data" -> 'source_transfer'::"text") ->> 'id'::"text")
    ELSE ("_raw_data" ->> 'source_transfer'::"text")
END) STORED,
    "statement_descriptor" "text" GENERATED ALWAYS AS (("_raw_data" ->> 'statement_descriptor'::"text")) STORED,
    "statement_descriptor_suffix" "text" GENERATED ALWAYS AS (("_raw_data" ->> 'statement_descriptor_suffix'::"text")) STORED,
    "status" "text" GENERATED ALWAYS AS (("_raw_data" ->> 'status'::"text")) STORED,
    "transfer" "text" GENERATED ALWAYS AS (
CASE
    WHEN (("jsonb_typeof"(("_raw_data" -> 'transfer'::"text")) = 'object'::"text") AND (("_raw_data" -> 'transfer'::"text") ? 'id'::"text")) THEN (("_raw_data" -> 'transfer'::"text") ->> 'id'::"text")
    ELSE ("_raw_data" ->> 'transfer'::"text")
END) STORED,
    "transfer_data" "jsonb" GENERATED ALWAYS AS (("_raw_data" -> 'transfer_data'::"text")) STORED,
    "transfer_group" "text" GENERATED ALWAYS AS (("_raw_data" ->> 'transfer_group'::"text")) STORED
);


ALTER TABLE "stripe"."charges" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "stripe"."checkout_session_line_items" (
    "_raw_data" "jsonb" NOT NULL,
    "_last_synced_at" timestamp with time zone,
    "_updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "_account_id" "text" NOT NULL,
    "id" "text" GENERATED ALWAYS AS (("_raw_data" ->> 'id'::"text")) STORED NOT NULL,
    "amount_discount" bigint GENERATED ALWAYS AS ((NULLIF(("_raw_data" ->> 'amount_discount'::"text"), ''::"text"))::bigint) STORED,
    "amount_subtotal" bigint GENERATED ALWAYS AS ((NULLIF(("_raw_data" ->> 'amount_subtotal'::"text"), ''::"text"))::bigint) STORED,
    "amount_tax" bigint GENERATED ALWAYS AS ((NULLIF(("_raw_data" ->> 'amount_tax'::"text"), ''::"text"))::bigint) STORED,
    "amount_total" bigint GENERATED ALWAYS AS ((NULLIF(("_raw_data" ->> 'amount_total'::"text"), ''::"text"))::bigint) STORED,
    "checkout_session" "text" GENERATED ALWAYS AS (("_raw_data" ->> 'checkout_session'::"text")) STORED,
    "currency" "text" GENERATED ALWAYS AS (("_raw_data" ->> 'currency'::"text")) STORED,
    "description" "text" GENERATED ALWAYS AS (("_raw_data" ->> 'description'::"text")) STORED,
    "discounts" "jsonb" GENERATED ALWAYS AS (("_raw_data" -> 'discounts'::"text")) STORED,
    "object" "text" GENERATED ALWAYS AS (("_raw_data" ->> 'object'::"text")) STORED,
    "price" "jsonb" GENERATED ALWAYS AS (("_raw_data" -> 'price'::"text")) STORED,
    "quantity" bigint GENERATED ALWAYS AS ((NULLIF(("_raw_data" ->> 'quantity'::"text"), ''::"text"))::bigint) STORED,
    "taxes" "jsonb" GENERATED ALWAYS AS (("_raw_data" -> 'taxes'::"text")) STORED
);


ALTER TABLE "stripe"."checkout_session_line_items" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "stripe"."checkout_sessions" (
    "_raw_data" "jsonb" NOT NULL,
    "_last_synced_at" timestamp with time zone,
    "_updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "_account_id" "text" NOT NULL,
    "id" "text" GENERATED ALWAYS AS (("_raw_data" ->> 'id'::"text")) STORED NOT NULL,
    "allow_promotion_codes" boolean GENERATED ALWAYS AS ((NULLIF(("_raw_data" ->> 'allow_promotion_codes'::"text"), ''::"text"))::boolean) STORED,
    "amount_subtotal" bigint GENERATED ALWAYS AS ((NULLIF(("_raw_data" ->> 'amount_subtotal'::"text"), ''::"text"))::bigint) STORED,
    "amount_total" bigint GENERATED ALWAYS AS ((NULLIF(("_raw_data" ->> 'amount_total'::"text"), ''::"text"))::bigint) STORED,
    "billing_address_collection" "text" GENERATED ALWAYS AS (("_raw_data" ->> 'billing_address_collection'::"text")) STORED,
    "cancel_url" "text" GENERATED ALWAYS AS (("_raw_data" ->> 'cancel_url'::"text")) STORED,
    "client_reference_id" "text" GENERATED ALWAYS AS (("_raw_data" ->> 'client_reference_id'::"text")) STORED,
    "currency" "text" GENERATED ALWAYS AS (("_raw_data" ->> 'currency'::"text")) STORED,
    "customer" "text" GENERATED ALWAYS AS (
CASE
    WHEN (("jsonb_typeof"(("_raw_data" -> 'customer'::"text")) = 'object'::"text") AND (("_raw_data" -> 'customer'::"text") ? 'id'::"text")) THEN (("_raw_data" -> 'customer'::"text") ->> 'id'::"text")
    ELSE ("_raw_data" ->> 'customer'::"text")
END) STORED,
    "customer_email" "text" GENERATED ALWAYS AS (("_raw_data" ->> 'customer_email'::"text")) STORED,
    "line_items" "jsonb" GENERATED ALWAYS AS (("_raw_data" -> 'line_items'::"text")) STORED,
    "livemode" boolean GENERATED ALWAYS AS ((NULLIF(("_raw_data" ->> 'livemode'::"text"), ''::"text"))::boolean) STORED,
    "locale" "text" GENERATED ALWAYS AS (("_raw_data" ->> 'locale'::"text")) STORED,
    "metadata" "jsonb" GENERATED ALWAYS AS (("_raw_data" -> 'metadata'::"text")) STORED,
    "mode" "text" GENERATED ALWAYS AS (("_raw_data" ->> 'mode'::"text")) STORED,
    "object" "text" GENERATED ALWAYS AS (("_raw_data" ->> 'object'::"text")) STORED,
    "payment_intent" "text" GENERATED ALWAYS AS (
CASE
    WHEN (("jsonb_typeof"(("_raw_data" -> 'payment_intent'::"text")) = 'object'::"text") AND (("_raw_data" -> 'payment_intent'::"text") ? 'id'::"text")) THEN (("_raw_data" -> 'payment_intent'::"text") ->> 'id'::"text")
    ELSE ("_raw_data" ->> 'payment_intent'::"text")
END) STORED,
    "payment_method_types" "jsonb" GENERATED ALWAYS AS (("_raw_data" -> 'payment_method_types'::"text")) STORED,
    "setup_intent" "text" GENERATED ALWAYS AS (
CASE
    WHEN (("jsonb_typeof"(("_raw_data" -> 'setup_intent'::"text")) = 'object'::"text") AND (("_raw_data" -> 'setup_intent'::"text") ? 'id'::"text")) THEN (("_raw_data" -> 'setup_intent'::"text") ->> 'id'::"text")
    ELSE ("_raw_data" ->> 'setup_intent'::"text")
END) STORED,
    "shipping" "jsonb" GENERATED ALWAYS AS (("_raw_data" -> 'shipping'::"text")) STORED,
    "shipping_address_collection" "jsonb" GENERATED ALWAYS AS (("_raw_data" -> 'shipping_address_collection'::"text")) STORED,
    "submit_type" "text" GENERATED ALWAYS AS (("_raw_data" ->> 'submit_type'::"text")) STORED,
    "subscription" "text" GENERATED ALWAYS AS (
CASE
    WHEN (("jsonb_typeof"(("_raw_data" -> 'subscription'::"text")) = 'object'::"text") AND (("_raw_data" -> 'subscription'::"text") ? 'id'::"text")) THEN (("_raw_data" -> 'subscription'::"text") ->> 'id'::"text")
    ELSE ("_raw_data" ->> 'subscription'::"text")
END) STORED,
    "success_url" "text" GENERATED ALWAYS AS (("_raw_data" ->> 'success_url'::"text")) STORED,
    "total_details" "jsonb" GENERATED ALWAYS AS (("_raw_data" -> 'total_details'::"text")) STORED
);


ALTER TABLE "stripe"."checkout_sessions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "stripe"."coupons" (
    "_raw_data" "jsonb" NOT NULL,
    "_last_synced_at" timestamp with time zone,
    "_updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "_account_id" "text" NOT NULL,
    "id" "text" GENERATED ALWAYS AS (("_raw_data" ->> 'id'::"text")) STORED NOT NULL,
    "amount_off" bigint GENERATED ALWAYS AS ((NULLIF(("_raw_data" ->> 'amount_off'::"text"), ''::"text"))::bigint) STORED,
    "applies_to" "jsonb" GENERATED ALWAYS AS (("_raw_data" -> 'applies_to'::"text")) STORED,
    "created" bigint GENERATED ALWAYS AS ((NULLIF(("_raw_data" ->> 'created'::"text"), ''::"text"))::bigint) STORED,
    "currency" "text" GENERATED ALWAYS AS (("_raw_data" ->> 'currency'::"text")) STORED,
    "duration" "text" GENERATED ALWAYS AS (("_raw_data" ->> 'duration'::"text")) STORED,
    "duration_in_months" bigint GENERATED ALWAYS AS ((NULLIF(("_raw_data" ->> 'duration_in_months'::"text"), ''::"text"))::bigint) STORED,
    "livemode" boolean GENERATED ALWAYS AS ((NULLIF(("_raw_data" ->> 'livemode'::"text"), ''::"text"))::boolean) STORED,
    "max_redemptions" bigint GENERATED ALWAYS AS ((NULLIF(("_raw_data" ->> 'max_redemptions'::"text"), ''::"text"))::bigint) STORED,
    "metadata" "jsonb" GENERATED ALWAYS AS (("_raw_data" -> 'metadata'::"text")) STORED,
    "name" "text" GENERATED ALWAYS AS (("_raw_data" ->> 'name'::"text")) STORED,
    "object" "text" GENERATED ALWAYS AS (("_raw_data" ->> 'object'::"text")) STORED,
    "percent_off" numeric GENERATED ALWAYS AS ((NULLIF(("_raw_data" ->> 'percent_off'::"text"), ''::"text"))::numeric) STORED,
    "redeem_by" bigint GENERATED ALWAYS AS ((NULLIF(("_raw_data" ->> 'redeem_by'::"text"), ''::"text"))::bigint) STORED,
    "times_redeemed" bigint GENERATED ALWAYS AS ((NULLIF(("_raw_data" ->> 'times_redeemed'::"text"), ''::"text"))::bigint) STORED,
    "valid" boolean GENERATED ALWAYS AS ((NULLIF(("_raw_data" ->> 'valid'::"text"), ''::"text"))::boolean) STORED
);


ALTER TABLE "stripe"."coupons" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "stripe"."credit_notes" (
    "_raw_data" "jsonb" NOT NULL,
    "_last_synced_at" timestamp with time zone,
    "_updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "_account_id" "text" NOT NULL,
    "id" "text" GENERATED ALWAYS AS (("_raw_data" ->> 'id'::"text")) STORED NOT NULL,
    "amount" bigint GENERATED ALWAYS AS ((NULLIF(("_raw_data" ->> 'amount'::"text"), ''::"text"))::bigint) STORED,
    "created" bigint GENERATED ALWAYS AS ((NULLIF(("_raw_data" ->> 'created'::"text"), ''::"text"))::bigint) STORED,
    "currency" "text" GENERATED ALWAYS AS (("_raw_data" ->> 'currency'::"text")) STORED,
    "customer" "text" GENERATED ALWAYS AS (
CASE
    WHEN (("jsonb_typeof"(("_raw_data" -> 'customer'::"text")) = 'object'::"text") AND (("_raw_data" -> 'customer'::"text") ? 'id'::"text")) THEN (("_raw_data" -> 'customer'::"text") ->> 'id'::"text")
    ELSE ("_raw_data" ->> 'customer'::"text")
END) STORED,
    "customer_balance_transaction" "text" GENERATED ALWAYS AS (
CASE
    WHEN (("jsonb_typeof"(("_raw_data" -> 'customer_balance_transaction'::"text")) = 'object'::"text") AND (("_raw_data" -> 'customer_balance_transaction'::"text") ? 'id'::"text")) THEN (("_raw_data" -> 'customer_balance_transaction'::"text") ->> 'id'::"text")
    ELSE ("_raw_data" ->> 'customer_balance_transaction'::"text")
END) STORED,
    "discount_amount" bigint GENERATED ALWAYS AS ((NULLIF(("_raw_data" ->> 'discount_amount'::"text"), ''::"text"))::bigint) STORED,
    "discount_amounts" "jsonb" GENERATED ALWAYS AS (("_raw_data" -> 'discount_amounts'::"text")) STORED,
    "invoice" "text" GENERATED ALWAYS AS (
CASE
    WHEN (("jsonb_typeof"(("_raw_data" -> 'invoice'::"text")) = 'object'::"text") AND (("_raw_data" -> 'invoice'::"text") ? 'id'::"text")) THEN (("_raw_data" -> 'invoice'::"text") ->> 'id'::"text")
    ELSE ("_raw_data" ->> 'invoice'::"text")
END) STORED,
    "lines" "jsonb" GENERATED ALWAYS AS (("_raw_data" -> 'lines'::"text")) STORED,
    "livemode" boolean GENERATED ALWAYS AS ((NULLIF(("_raw_data" ->> 'livemode'::"text"), ''::"text"))::boolean) STORED,
    "memo" "text" GENERATED ALWAYS AS (("_raw_data" ->> 'memo'::"text")) STORED,
    "metadata" "jsonb" GENERATED ALWAYS AS (("_raw_data" -> 'metadata'::"text")) STORED,
    "number" "text" GENERATED ALWAYS AS (("_raw_data" ->> 'number'::"text")) STORED,
    "object" "text" GENERATED ALWAYS AS (("_raw_data" ->> 'object'::"text")) STORED,
    "out_of_band_amount" bigint GENERATED ALWAYS AS ((NULLIF(("_raw_data" ->> 'out_of_band_amount'::"text"), ''::"text"))::bigint) STORED,
    "pdf" "text" GENERATED ALWAYS AS (("_raw_data" ->> 'pdf'::"text")) STORED,
    "reason" "text" GENERATED ALWAYS AS (("_raw_data" ->> 'reason'::"text")) STORED,
    "refund" "text" GENERATED ALWAYS AS (
CASE
    WHEN (("jsonb_typeof"(("_raw_data" -> 'refund'::"text")) = 'object'::"text") AND (("_raw_data" -> 'refund'::"text") ? 'id'::"text")) THEN (("_raw_data" -> 'refund'::"text") ->> 'id'::"text")
    ELSE ("_raw_data" ->> 'refund'::"text")
END) STORED,
    "status" "text" GENERATED ALWAYS AS (("_raw_data" ->> 'status'::"text")) STORED,
    "subtotal" bigint GENERATED ALWAYS AS ((NULLIF(("_raw_data" ->> 'subtotal'::"text"), ''::"text"))::bigint) STORED,
    "tax_amounts" "jsonb" GENERATED ALWAYS AS (("_raw_data" -> 'tax_amounts'::"text")) STORED,
    "total" bigint GENERATED ALWAYS AS ((NULLIF(("_raw_data" ->> 'total'::"text"), ''::"text"))::bigint) STORED,
    "type" "text" GENERATED ALWAYS AS (("_raw_data" ->> 'type'::"text")) STORED,
    "voided_at" bigint GENERATED ALWAYS AS ((NULLIF(("_raw_data" ->> 'voided_at'::"text"), ''::"text"))::bigint) STORED
);


ALTER TABLE "stripe"."credit_notes" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "stripe"."customers" (
    "_raw_data" "jsonb" NOT NULL,
    "_last_synced_at" timestamp with time zone,
    "_updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "_account_id" "text" NOT NULL,
    "id" "text" GENERATED ALWAYS AS (("_raw_data" ->> 'id'::"text")) STORED NOT NULL,
    "address" "jsonb" GENERATED ALWAYS AS (("_raw_data" -> 'address'::"text")) STORED,
    "balance" bigint GENERATED ALWAYS AS ((NULLIF(("_raw_data" ->> 'balance'::"text"), ''::"text"))::bigint) STORED,
    "created" bigint GENERATED ALWAYS AS ((NULLIF(("_raw_data" ->> 'created'::"text"), ''::"text"))::bigint) STORED,
    "currency" "text" GENERATED ALWAYS AS (("_raw_data" ->> 'currency'::"text")) STORED,
    "default_source" "text" GENERATED ALWAYS AS (
CASE
    WHEN (("jsonb_typeof"(("_raw_data" -> 'default_source'::"text")) = 'object'::"text") AND (("_raw_data" -> 'default_source'::"text") ? 'id'::"text")) THEN (("_raw_data" -> 'default_source'::"text") ->> 'id'::"text")
    ELSE ("_raw_data" ->> 'default_source'::"text")
END) STORED,
    "deleted" boolean GENERATED ALWAYS AS ((NULLIF(("_raw_data" ->> 'deleted'::"text"), ''::"text"))::boolean) STORED,
    "delinquent" boolean GENERATED ALWAYS AS ((NULLIF(("_raw_data" ->> 'delinquent'::"text"), ''::"text"))::boolean) STORED,
    "description" "text" GENERATED ALWAYS AS (("_raw_data" ->> 'description'::"text")) STORED,
    "discount" "jsonb" GENERATED ALWAYS AS (("_raw_data" -> 'discount'::"text")) STORED,
    "email" "text" GENERATED ALWAYS AS (("_raw_data" ->> 'email'::"text")) STORED,
    "invoice_prefix" "text" GENERATED ALWAYS AS (("_raw_data" ->> 'invoice_prefix'::"text")) STORED,
    "invoice_settings" "jsonb" GENERATED ALWAYS AS (("_raw_data" -> 'invoice_settings'::"text")) STORED,
    "livemode" boolean GENERATED ALWAYS AS ((NULLIF(("_raw_data" ->> 'livemode'::"text"), ''::"text"))::boolean) STORED,
    "metadata" "jsonb" GENERATED ALWAYS AS (("_raw_data" -> 'metadata'::"text")) STORED,
    "name" "text" GENERATED ALWAYS AS (("_raw_data" ->> 'name'::"text")) STORED,
    "next_invoice_sequence" bigint GENERATED ALWAYS AS ((NULLIF(("_raw_data" ->> 'next_invoice_sequence'::"text"), ''::"text"))::bigint) STORED,
    "object" "text" GENERATED ALWAYS AS (("_raw_data" ->> 'object'::"text")) STORED,
    "phone" "text" GENERATED ALWAYS AS (("_raw_data" ->> 'phone'::"text")) STORED,
    "preferred_locales" "jsonb" GENERATED ALWAYS AS (("_raw_data" -> 'preferred_locales'::"text")) STORED,
    "shipping" "jsonb" GENERATED ALWAYS AS (("_raw_data" -> 'shipping'::"text")) STORED,
    "sources" "jsonb" GENERATED ALWAYS AS (("_raw_data" -> 'sources'::"text")) STORED,
    "subscriptions" "jsonb" GENERATED ALWAYS AS (("_raw_data" -> 'subscriptions'::"text")) STORED,
    "tax_exempt" "text" GENERATED ALWAYS AS (("_raw_data" ->> 'tax_exempt'::"text")) STORED,
    "tax_ids" "jsonb" GENERATED ALWAYS AS (("_raw_data" -> 'tax_ids'::"text")) STORED
);


ALTER TABLE "stripe"."customers" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "stripe"."disputes" (
    "_raw_data" "jsonb" NOT NULL,
    "_last_synced_at" timestamp with time zone,
    "_updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "_account_id" "text" NOT NULL,
    "id" "text" GENERATED ALWAYS AS (("_raw_data" ->> 'id'::"text")) STORED NOT NULL,
    "amount" bigint GENERATED ALWAYS AS ((NULLIF(("_raw_data" ->> 'amount'::"text"), ''::"text"))::bigint) STORED,
    "balance_transactions" "jsonb" GENERATED ALWAYS AS (("_raw_data" -> 'balance_transactions'::"text")) STORED,
    "charge" "text" GENERATED ALWAYS AS (
CASE
    WHEN (("jsonb_typeof"(("_raw_data" -> 'charge'::"text")) = 'object'::"text") AND (("_raw_data" -> 'charge'::"text") ? 'id'::"text")) THEN (("_raw_data" -> 'charge'::"text") ->> 'id'::"text")
    ELSE ("_raw_data" ->> 'charge'::"text")
END) STORED,
    "created" bigint GENERATED ALWAYS AS ((NULLIF(("_raw_data" ->> 'created'::"text"), ''::"text"))::bigint) STORED,
    "currency" "text" GENERATED ALWAYS AS (("_raw_data" ->> 'currency'::"text")) STORED,
    "evidence" "jsonb" GENERATED ALWAYS AS (("_raw_data" -> 'evidence'::"text")) STORED,
    "evidence_details" "jsonb" GENERATED ALWAYS AS (("_raw_data" -> 'evidence_details'::"text")) STORED,
    "is_charge_refundable" boolean GENERATED ALWAYS AS ((NULLIF(("_raw_data" ->> 'is_charge_refundable'::"text"), ''::"text"))::boolean) STORED,
    "livemode" boolean GENERATED ALWAYS AS ((NULLIF(("_raw_data" ->> 'livemode'::"text"), ''::"text"))::boolean) STORED,
    "metadata" "jsonb" GENERATED ALWAYS AS (("_raw_data" -> 'metadata'::"text")) STORED,
    "object" "text" GENERATED ALWAYS AS (("_raw_data" ->> 'object'::"text")) STORED,
    "payment_intent" "text" GENERATED ALWAYS AS (
CASE
    WHEN (("jsonb_typeof"(("_raw_data" -> 'payment_intent'::"text")) = 'object'::"text") AND (("_raw_data" -> 'payment_intent'::"text") ? 'id'::"text")) THEN (("_raw_data" -> 'payment_intent'::"text") ->> 'id'::"text")
    ELSE ("_raw_data" ->> 'payment_intent'::"text")
END) STORED,
    "reason" "text" GENERATED ALWAYS AS (("_raw_data" ->> 'reason'::"text")) STORED,
    "status" "text" GENERATED ALWAYS AS (("_raw_data" ->> 'status'::"text")) STORED
);


ALTER TABLE "stripe"."disputes" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "stripe"."early_fraud_warnings" (
    "_raw_data" "jsonb" NOT NULL,
    "_last_synced_at" timestamp with time zone,
    "_updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "_account_id" "text" NOT NULL,
    "id" "text" GENERATED ALWAYS AS (("_raw_data" ->> 'id'::"text")) STORED NOT NULL,
    "actionable" boolean GENERATED ALWAYS AS ((NULLIF(("_raw_data" ->> 'actionable'::"text"), ''::"text"))::boolean) STORED,
    "charge" "text" GENERATED ALWAYS AS (
CASE
    WHEN (("jsonb_typeof"(("_raw_data" -> 'charge'::"text")) = 'object'::"text") AND (("_raw_data" -> 'charge'::"text") ? 'id'::"text")) THEN (("_raw_data" -> 'charge'::"text") ->> 'id'::"text")
    ELSE ("_raw_data" ->> 'charge'::"text")
END) STORED,
    "created" bigint GENERATED ALWAYS AS ((NULLIF(("_raw_data" ->> 'created'::"text"), ''::"text"))::bigint) STORED,
    "fraud_type" "text" GENERATED ALWAYS AS (("_raw_data" ->> 'fraud_type'::"text")) STORED,
    "livemode" boolean GENERATED ALWAYS AS ((NULLIF(("_raw_data" ->> 'livemode'::"text"), ''::"text"))::boolean) STORED,
    "object" "text" GENERATED ALWAYS AS (("_raw_data" ->> 'object'::"text")) STORED,
    "payment_intent" "text" GENERATED ALWAYS AS (("_raw_data" ->> 'payment_intent'::"text")) STORED
);


ALTER TABLE "stripe"."early_fraud_warnings" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "stripe"."features" (
    "_raw_data" "jsonb" NOT NULL,
    "_last_synced_at" timestamp with time zone,
    "_updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "_account_id" "text" NOT NULL,
    "id" "text" GENERATED ALWAYS AS (("_raw_data" ->> 'id'::"text")) STORED NOT NULL,
    "active" boolean GENERATED ALWAYS AS ((NULLIF(("_raw_data" ->> 'active'::"text"), ''::"text"))::boolean) STORED,
    "livemode" boolean GENERATED ALWAYS AS ((NULLIF(("_raw_data" ->> 'livemode'::"text"), ''::"text"))::boolean) STORED,
    "lookup_key" "text" GENERATED ALWAYS AS (("_raw_data" ->> 'lookup_key'::"text")) STORED,
    "metadata" "jsonb" GENERATED ALWAYS AS (("_raw_data" -> 'metadata'::"text")) STORED,
    "name" "text" GENERATED ALWAYS AS (("_raw_data" ->> 'name'::"text")) STORED,
    "object" "text" GENERATED ALWAYS AS (("_raw_data" ->> 'object'::"text")) STORED
);


ALTER TABLE "stripe"."features" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "stripe"."invoices" (
    "_raw_data" "jsonb" NOT NULL,
    "_last_synced_at" timestamp with time zone,
    "_updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "_account_id" "text" NOT NULL,
    "id" "text" GENERATED ALWAYS AS (("_raw_data" ->> 'id'::"text")) STORED NOT NULL,
    "account_country" "text" GENERATED ALWAYS AS (("_raw_data" ->> 'account_country'::"text")) STORED,
    "account_name" "text" GENERATED ALWAYS AS (("_raw_data" ->> 'account_name'::"text")) STORED,
    "amount_due" bigint GENERATED ALWAYS AS ((NULLIF(("_raw_data" ->> 'amount_due'::"text"), ''::"text"))::bigint) STORED,
    "amount_paid" bigint GENERATED ALWAYS AS ((NULLIF(("_raw_data" ->> 'amount_paid'::"text"), ''::"text"))::bigint) STORED,
    "amount_remaining" bigint GENERATED ALWAYS AS ((NULLIF(("_raw_data" ->> 'amount_remaining'::"text"), ''::"text"))::bigint) STORED,
    "application_fee_amount" bigint GENERATED ALWAYS AS ((NULLIF(("_raw_data" ->> 'application_fee_amount'::"text"), ''::"text"))::bigint) STORED,
    "attempt_count" bigint GENERATED ALWAYS AS ((NULLIF(("_raw_data" ->> 'attempt_count'::"text"), ''::"text"))::bigint) STORED,
    "attempted" boolean GENERATED ALWAYS AS ((NULLIF(("_raw_data" ->> 'attempted'::"text"), ''::"text"))::boolean) STORED,
    "auto_advance" boolean GENERATED ALWAYS AS ((NULLIF(("_raw_data" ->> 'auto_advance'::"text"), ''::"text"))::boolean) STORED,
    "billing_reason" "text" GENERATED ALWAYS AS (("_raw_data" ->> 'billing_reason'::"text")) STORED,
    "charge" "text" GENERATED ALWAYS AS (
CASE
    WHEN (("jsonb_typeof"(("_raw_data" -> 'charge'::"text")) = 'object'::"text") AND (("_raw_data" -> 'charge'::"text") ? 'id'::"text")) THEN (("_raw_data" -> 'charge'::"text") ->> 'id'::"text")
    ELSE ("_raw_data" ->> 'charge'::"text")
END) STORED,
    "collection_method" "text" GENERATED ALWAYS AS (("_raw_data" ->> 'collection_method'::"text")) STORED,
    "created" bigint GENERATED ALWAYS AS ((NULLIF(("_raw_data" ->> 'created'::"text"), ''::"text"))::bigint) STORED,
    "currency" "text" GENERATED ALWAYS AS (("_raw_data" ->> 'currency'::"text")) STORED,
    "custom_fields" "jsonb" GENERATED ALWAYS AS (("_raw_data" -> 'custom_fields'::"text")) STORED,
    "customer" "text" GENERATED ALWAYS AS (
CASE
    WHEN (("jsonb_typeof"(("_raw_data" -> 'customer'::"text")) = 'object'::"text") AND (("_raw_data" -> 'customer'::"text") ? 'id'::"text")) THEN (("_raw_data" -> 'customer'::"text") ->> 'id'::"text")
    ELSE ("_raw_data" ->> 'customer'::"text")
END) STORED,
    "customer_address" "jsonb" GENERATED ALWAYS AS (("_raw_data" -> 'customer_address'::"text")) STORED,
    "customer_email" "text" GENERATED ALWAYS AS (("_raw_data" ->> 'customer_email'::"text")) STORED,
    "customer_name" "text" GENERATED ALWAYS AS (("_raw_data" ->> 'customer_name'::"text")) STORED,
    "customer_phone" "text" GENERATED ALWAYS AS (("_raw_data" ->> 'customer_phone'::"text")) STORED,
    "customer_shipping" "jsonb" GENERATED ALWAYS AS (("_raw_data" -> 'customer_shipping'::"text")) STORED,
    "customer_tax_exempt" "text" GENERATED ALWAYS AS (("_raw_data" ->> 'customer_tax_exempt'::"text")) STORED,
    "customer_tax_ids" "jsonb" GENERATED ALWAYS AS (("_raw_data" -> 'customer_tax_ids'::"text")) STORED,
    "default_payment_method" "text" GENERATED ALWAYS AS (
CASE
    WHEN (("jsonb_typeof"(("_raw_data" -> 'default_payment_method'::"text")) = 'object'::"text") AND (("_raw_data" -> 'default_payment_method'::"text") ? 'id'::"text")) THEN (("_raw_data" -> 'default_payment_method'::"text") ->> 'id'::"text")
    ELSE ("_raw_data" ->> 'default_payment_method'::"text")
END) STORED,
    "default_source" "text" GENERATED ALWAYS AS (
CASE
    WHEN (("jsonb_typeof"(("_raw_data" -> 'default_source'::"text")) = 'object'::"text") AND (("_raw_data" -> 'default_source'::"text") ? 'id'::"text")) THEN (("_raw_data" -> 'default_source'::"text") ->> 'id'::"text")
    ELSE ("_raw_data" ->> 'default_source'::"text")
END) STORED,
    "default_tax_rates" "jsonb" GENERATED ALWAYS AS (("_raw_data" -> 'default_tax_rates'::"text")) STORED,
    "description" "text" GENERATED ALWAYS AS (("_raw_data" ->> 'description'::"text")) STORED,
    "discount" "jsonb" GENERATED ALWAYS AS (("_raw_data" -> 'discount'::"text")) STORED,
    "discounts" "jsonb" GENERATED ALWAYS AS (("_raw_data" -> 'discounts'::"text")) STORED,
    "due_date" bigint GENERATED ALWAYS AS ((NULLIF(("_raw_data" ->> 'due_date'::"text"), ''::"text"))::bigint) STORED,
    "ending_balance" bigint GENERATED ALWAYS AS ((NULLIF(("_raw_data" ->> 'ending_balance'::"text"), ''::"text"))::bigint) STORED,
    "footer" "text" GENERATED ALWAYS AS (("_raw_data" ->> 'footer'::"text")) STORED,
    "hosted_invoice_url" "text" GENERATED ALWAYS AS (("_raw_data" ->> 'hosted_invoice_url'::"text")) STORED,
    "invoice_pdf" "text" GENERATED ALWAYS AS (("_raw_data" ->> 'invoice_pdf'::"text")) STORED,
    "lines" "jsonb" GENERATED ALWAYS AS (("_raw_data" -> 'lines'::"text")) STORED,
    "livemode" boolean GENERATED ALWAYS AS ((NULLIF(("_raw_data" ->> 'livemode'::"text"), ''::"text"))::boolean) STORED,
    "metadata" "jsonb" GENERATED ALWAYS AS (("_raw_data" -> 'metadata'::"text")) STORED,
    "next_payment_attempt" bigint GENERATED ALWAYS AS ((NULLIF(("_raw_data" ->> 'next_payment_attempt'::"text"), ''::"text"))::bigint) STORED,
    "number" "text" GENERATED ALWAYS AS (("_raw_data" ->> 'number'::"text")) STORED,
    "object" "text" GENERATED ALWAYS AS (("_raw_data" ->> 'object'::"text")) STORED,
    "paid" boolean GENERATED ALWAYS AS ((NULLIF(("_raw_data" ->> 'paid'::"text"), ''::"text"))::boolean) STORED,
    "payment_intent" "text" GENERATED ALWAYS AS (
CASE
    WHEN (("jsonb_typeof"(("_raw_data" -> 'payment_intent'::"text")) = 'object'::"text") AND (("_raw_data" -> 'payment_intent'::"text") ? 'id'::"text")) THEN (("_raw_data" -> 'payment_intent'::"text") ->> 'id'::"text")
    ELSE ("_raw_data" ->> 'payment_intent'::"text")
END) STORED,
    "period_end" bigint GENERATED ALWAYS AS ((NULLIF(("_raw_data" ->> 'period_end'::"text"), ''::"text"))::bigint) STORED,
    "period_start" bigint GENERATED ALWAYS AS ((NULLIF(("_raw_data" ->> 'period_start'::"text"), ''::"text"))::bigint) STORED,
    "post_payment_credit_notes_amount" bigint GENERATED ALWAYS AS ((NULLIF(("_raw_data" ->> 'post_payment_credit_notes_amount'::"text"), ''::"text"))::bigint) STORED,
    "pre_payment_credit_notes_amount" bigint GENERATED ALWAYS AS ((NULLIF(("_raw_data" ->> 'pre_payment_credit_notes_amount'::"text"), ''::"text"))::bigint) STORED,
    "receipt_number" "text" GENERATED ALWAYS AS (("_raw_data" ->> 'receipt_number'::"text")) STORED,
    "starting_balance" bigint GENERATED ALWAYS AS ((NULLIF(("_raw_data" ->> 'starting_balance'::"text"), ''::"text"))::bigint) STORED,
    "statement_descriptor" "text" GENERATED ALWAYS AS (("_raw_data" ->> 'statement_descriptor'::"text")) STORED,
    "status" "text" GENERATED ALWAYS AS (("_raw_data" ->> 'status'::"text")) STORED,
    "status_transitions" "jsonb" GENERATED ALWAYS AS (("_raw_data" -> 'status_transitions'::"text")) STORED,
    "subscription" "text" GENERATED ALWAYS AS (
CASE
    WHEN (("jsonb_typeof"(("_raw_data" -> 'subscription'::"text")) = 'object'::"text") AND (("_raw_data" -> 'subscription'::"text") ? 'id'::"text")) THEN (("_raw_data" -> 'subscription'::"text") ->> 'id'::"text")
    ELSE ("_raw_data" ->> 'subscription'::"text")
END) STORED,
    "subscription_proration_date" bigint GENERATED ALWAYS AS ((NULLIF(("_raw_data" ->> 'subscription_proration_date'::"text"), ''::"text"))::bigint) STORED,
    "subtotal" bigint GENERATED ALWAYS AS ((NULLIF(("_raw_data" ->> 'subtotal'::"text"), ''::"text"))::bigint) STORED,
    "tax" bigint GENERATED ALWAYS AS ((NULLIF(("_raw_data" ->> 'tax'::"text"), ''::"text"))::bigint) STORED,
    "threshold_reason" "jsonb" GENERATED ALWAYS AS (("_raw_data" -> 'threshold_reason'::"text")) STORED,
    "total" bigint GENERATED ALWAYS AS ((NULLIF(("_raw_data" ->> 'total'::"text"), ''::"text"))::bigint) STORED,
    "total_discount_amounts" "jsonb" GENERATED ALWAYS AS (("_raw_data" -> 'total_discount_amounts'::"text")) STORED,
    "total_tax_amounts" "jsonb" GENERATED ALWAYS AS (("_raw_data" -> 'total_tax_amounts'::"text")) STORED,
    "transfer_data" "jsonb" GENERATED ALWAYS AS (("_raw_data" -> 'transfer_data'::"text")) STORED,
    "webhooks_delivered_at" bigint GENERATED ALWAYS AS ((NULLIF(("_raw_data" ->> 'webhooks_delivered_at'::"text"), ''::"text"))::bigint) STORED
);


ALTER TABLE "stripe"."invoices" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "stripe"."payment_intents" (
    "_raw_data" "jsonb" NOT NULL,
    "_last_synced_at" timestamp with time zone,
    "_updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "_account_id" "text" NOT NULL,
    "id" "text" GENERATED ALWAYS AS (("_raw_data" ->> 'id'::"text")) STORED NOT NULL,
    "amount" bigint GENERATED ALWAYS AS ((NULLIF(("_raw_data" ->> 'amount'::"text"), ''::"text"))::bigint) STORED,
    "amount_capturable" bigint GENERATED ALWAYS AS ((NULLIF(("_raw_data" ->> 'amount_capturable'::"text"), ''::"text"))::bigint) STORED,
    "amount_received" bigint GENERATED ALWAYS AS ((NULLIF(("_raw_data" ->> 'amount_received'::"text"), ''::"text"))::bigint) STORED,
    "application" "text" GENERATED ALWAYS AS (
CASE
    WHEN (("jsonb_typeof"(("_raw_data" -> 'application'::"text")) = 'object'::"text") AND (("_raw_data" -> 'application'::"text") ? 'id'::"text")) THEN (("_raw_data" -> 'application'::"text") ->> 'id'::"text")
    ELSE ("_raw_data" ->> 'application'::"text")
END) STORED,
    "application_fee_amount" bigint GENERATED ALWAYS AS ((NULLIF(("_raw_data" ->> 'application_fee_amount'::"text"), ''::"text"))::bigint) STORED,
    "canceled_at" bigint GENERATED ALWAYS AS ((NULLIF(("_raw_data" ->> 'canceled_at'::"text"), ''::"text"))::bigint) STORED,
    "cancellation_reason" "text" GENERATED ALWAYS AS (("_raw_data" ->> 'cancellation_reason'::"text")) STORED,
    "capture_method" "text" GENERATED ALWAYS AS (("_raw_data" ->> 'capture_method'::"text")) STORED,
    "charges" "jsonb" GENERATED ALWAYS AS (("_raw_data" -> 'charges'::"text")) STORED,
    "client_secret" "text" GENERATED ALWAYS AS (("_raw_data" ->> 'client_secret'::"text")) STORED,
    "confirmation_method" "text" GENERATED ALWAYS AS (("_raw_data" ->> 'confirmation_method'::"text")) STORED,
    "created" bigint GENERATED ALWAYS AS ((NULLIF(("_raw_data" ->> 'created'::"text"), ''::"text"))::bigint) STORED,
    "currency" "text" GENERATED ALWAYS AS (("_raw_data" ->> 'currency'::"text")) STORED,
    "customer" "text" GENERATED ALWAYS AS (
CASE
    WHEN (("jsonb_typeof"(("_raw_data" -> 'customer'::"text")) = 'object'::"text") AND (("_raw_data" -> 'customer'::"text") ? 'id'::"text")) THEN (("_raw_data" -> 'customer'::"text") ->> 'id'::"text")
    ELSE ("_raw_data" ->> 'customer'::"text")
END) STORED,
    "description" "text" GENERATED ALWAYS AS (("_raw_data" ->> 'description'::"text")) STORED,
    "invoice" "text" GENERATED ALWAYS AS (
CASE
    WHEN (("jsonb_typeof"(("_raw_data" -> 'invoice'::"text")) = 'object'::"text") AND (("_raw_data" -> 'invoice'::"text") ? 'id'::"text")) THEN (("_raw_data" -> 'invoice'::"text") ->> 'id'::"text")
    ELSE ("_raw_data" ->> 'invoice'::"text")
END) STORED,
    "last_payment_error" "jsonb" GENERATED ALWAYS AS (("_raw_data" -> 'last_payment_error'::"text")) STORED,
    "livemode" boolean GENERATED ALWAYS AS ((NULLIF(("_raw_data" ->> 'livemode'::"text"), ''::"text"))::boolean) STORED,
    "metadata" "jsonb" GENERATED ALWAYS AS (("_raw_data" -> 'metadata'::"text")) STORED,
    "next_action" "jsonb" GENERATED ALWAYS AS (("_raw_data" -> 'next_action'::"text")) STORED,
    "object" "text" GENERATED ALWAYS AS (("_raw_data" ->> 'object'::"text")) STORED,
    "on_behalf_of" "text" GENERATED ALWAYS AS (
CASE
    WHEN (("jsonb_typeof"(("_raw_data" -> 'on_behalf_of'::"text")) = 'object'::"text") AND (("_raw_data" -> 'on_behalf_of'::"text") ? 'id'::"text")) THEN (("_raw_data" -> 'on_behalf_of'::"text") ->> 'id'::"text")
    ELSE ("_raw_data" ->> 'on_behalf_of'::"text")
END) STORED,
    "payment_method" "text" GENERATED ALWAYS AS (
CASE
    WHEN (("jsonb_typeof"(("_raw_data" -> 'payment_method'::"text")) = 'object'::"text") AND (("_raw_data" -> 'payment_method'::"text") ? 'id'::"text")) THEN (("_raw_data" -> 'payment_method'::"text") ->> 'id'::"text")
    ELSE ("_raw_data" ->> 'payment_method'::"text")
END) STORED,
    "payment_method_options" "jsonb" GENERATED ALWAYS AS (("_raw_data" -> 'payment_method_options'::"text")) STORED,
    "payment_method_types" "jsonb" GENERATED ALWAYS AS (("_raw_data" -> 'payment_method_types'::"text")) STORED,
    "receipt_email" "text" GENERATED ALWAYS AS (("_raw_data" ->> 'receipt_email'::"text")) STORED,
    "review" "text" GENERATED ALWAYS AS (
CASE
    WHEN (("jsonb_typeof"(("_raw_data" -> 'review'::"text")) = 'object'::"text") AND (("_raw_data" -> 'review'::"text") ? 'id'::"text")) THEN (("_raw_data" -> 'review'::"text") ->> 'id'::"text")
    ELSE ("_raw_data" ->> 'review'::"text")
END) STORED,
    "setup_future_usage" "text" GENERATED ALWAYS AS (("_raw_data" ->> 'setup_future_usage'::"text")) STORED,
    "shipping" "jsonb" GENERATED ALWAYS AS (("_raw_data" -> 'shipping'::"text")) STORED,
    "statement_descriptor" "text" GENERATED ALWAYS AS (("_raw_data" ->> 'statement_descriptor'::"text")) STORED,
    "statement_descriptor_suffix" "text" GENERATED ALWAYS AS (("_raw_data" ->> 'statement_descriptor_suffix'::"text")) STORED,
    "status" "text" GENERATED ALWAYS AS (("_raw_data" ->> 'status'::"text")) STORED,
    "transfer_data" "jsonb" GENERATED ALWAYS AS (("_raw_data" -> 'transfer_data'::"text")) STORED,
    "transfer_group" "text" GENERATED ALWAYS AS (("_raw_data" ->> 'transfer_group'::"text")) STORED
);


ALTER TABLE "stripe"."payment_intents" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "stripe"."payment_methods" (
    "_raw_data" "jsonb" NOT NULL,
    "_last_synced_at" timestamp with time zone,
    "_updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "_account_id" "text" NOT NULL,
    "id" "text" GENERATED ALWAYS AS (("_raw_data" ->> 'id'::"text")) STORED NOT NULL,
    "alipay" "jsonb" GENERATED ALWAYS AS (("_raw_data" -> 'alipay'::"text")) STORED,
    "au_becs_debit" "jsonb" GENERATED ALWAYS AS (("_raw_data" -> 'au_becs_debit'::"text")) STORED,
    "bacs_debit" "jsonb" GENERATED ALWAYS AS (("_raw_data" -> 'bacs_debit'::"text")) STORED,
    "bancontact" "jsonb" GENERATED ALWAYS AS (("_raw_data" -> 'bancontact'::"text")) STORED,
    "billing_details" "jsonb" GENERATED ALWAYS AS (("_raw_data" -> 'billing_details'::"text")) STORED,
    "card" "jsonb" GENERATED ALWAYS AS (("_raw_data" -> 'card'::"text")) STORED,
    "card_present" "jsonb" GENERATED ALWAYS AS (("_raw_data" -> 'card_present'::"text")) STORED,
    "created" bigint GENERATED ALWAYS AS ((NULLIF(("_raw_data" ->> 'created'::"text"), ''::"text"))::bigint) STORED,
    "customer" "text" GENERATED ALWAYS AS (
CASE
    WHEN (("jsonb_typeof"(("_raw_data" -> 'customer'::"text")) = 'object'::"text") AND (("_raw_data" -> 'customer'::"text") ? 'id'::"text")) THEN (("_raw_data" -> 'customer'::"text") ->> 'id'::"text")
    ELSE ("_raw_data" ->> 'customer'::"text")
END) STORED,
    "eps" "jsonb" GENERATED ALWAYS AS (("_raw_data" -> 'eps'::"text")) STORED,
    "fpx" "jsonb" GENERATED ALWAYS AS (("_raw_data" -> 'fpx'::"text")) STORED,
    "giropay" "jsonb" GENERATED ALWAYS AS (("_raw_data" -> 'giropay'::"text")) STORED,
    "ideal" "jsonb" GENERATED ALWAYS AS (("_raw_data" -> 'ideal'::"text")) STORED,
    "interac_present" "jsonb" GENERATED ALWAYS AS (("_raw_data" -> 'interac_present'::"text")) STORED,
    "livemode" boolean GENERATED ALWAYS AS ((NULLIF(("_raw_data" ->> 'livemode'::"text"), ''::"text"))::boolean) STORED,
    "metadata" "jsonb" GENERATED ALWAYS AS (("_raw_data" -> 'metadata'::"text")) STORED,
    "object" "text" GENERATED ALWAYS AS (("_raw_data" ->> 'object'::"text")) STORED,
    "p24" "jsonb" GENERATED ALWAYS AS (("_raw_data" -> 'p24'::"text")) STORED,
    "sepa_debit" "jsonb" GENERATED ALWAYS AS (("_raw_data" -> 'sepa_debit'::"text")) STORED,
    "type" "text" GENERATED ALWAYS AS (("_raw_data" ->> 'type'::"text")) STORED
);


ALTER TABLE "stripe"."payment_methods" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "stripe"."plans" (
    "_raw_data" "jsonb" NOT NULL,
    "_last_synced_at" timestamp with time zone,
    "_updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "_account_id" "text" NOT NULL,
    "id" "text" GENERATED ALWAYS AS (("_raw_data" ->> 'id'::"text")) STORED NOT NULL,
    "active" boolean GENERATED ALWAYS AS ((NULLIF(("_raw_data" ->> 'active'::"text"), ''::"text"))::boolean) STORED,
    "aggregate_usage" "text" GENERATED ALWAYS AS (("_raw_data" ->> 'aggregate_usage'::"text")) STORED,
    "amount" bigint GENERATED ALWAYS AS ((NULLIF(("_raw_data" ->> 'amount'::"text"), ''::"text"))::bigint) STORED,
    "amount_decimal" "text" GENERATED ALWAYS AS (("_raw_data" ->> 'amount_decimal'::"text")) STORED,
    "billing_scheme" "text" GENERATED ALWAYS AS (("_raw_data" ->> 'billing_scheme'::"text")) STORED,
    "created" bigint GENERATED ALWAYS AS ((NULLIF(("_raw_data" ->> 'created'::"text"), ''::"text"))::bigint) STORED,
    "currency" "text" GENERATED ALWAYS AS (("_raw_data" ->> 'currency'::"text")) STORED,
    "interval" "text" GENERATED ALWAYS AS (("_raw_data" ->> 'interval'::"text")) STORED,
    "interval_count" bigint GENERATED ALWAYS AS ((NULLIF(("_raw_data" ->> 'interval_count'::"text"), ''::"text"))::bigint) STORED,
    "livemode" boolean GENERATED ALWAYS AS ((NULLIF(("_raw_data" ->> 'livemode'::"text"), ''::"text"))::boolean) STORED,
    "metadata" "jsonb" GENERATED ALWAYS AS (("_raw_data" -> 'metadata'::"text")) STORED,
    "nickname" "text" GENERATED ALWAYS AS (("_raw_data" ->> 'nickname'::"text")) STORED,
    "object" "text" GENERATED ALWAYS AS (("_raw_data" ->> 'object'::"text")) STORED,
    "product" "text" GENERATED ALWAYS AS (
CASE
    WHEN (("jsonb_typeof"(("_raw_data" -> 'product'::"text")) = 'object'::"text") AND (("_raw_data" -> 'product'::"text") ? 'id'::"text")) THEN (("_raw_data" -> 'product'::"text") ->> 'id'::"text")
    ELSE ("_raw_data" ->> 'product'::"text")
END) STORED,
    "tiers" "jsonb" GENERATED ALWAYS AS (("_raw_data" -> 'tiers'::"text")) STORED,
    "tiers_mode" "text" GENERATED ALWAYS AS (("_raw_data" ->> 'tiers_mode'::"text")) STORED,
    "transform_usage" "jsonb" GENERATED ALWAYS AS (("_raw_data" -> 'transform_usage'::"text")) STORED,
    "trial_period_days" bigint GENERATED ALWAYS AS ((NULLIF(("_raw_data" ->> 'trial_period_days'::"text"), ''::"text"))::bigint) STORED,
    "usage_type" "text" GENERATED ALWAYS AS (("_raw_data" ->> 'usage_type'::"text")) STORED
);


ALTER TABLE "stripe"."plans" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "stripe"."prices" (
    "_raw_data" "jsonb" NOT NULL,
    "_last_synced_at" timestamp with time zone,
    "_updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "_account_id" "text" NOT NULL,
    "id" "text" GENERATED ALWAYS AS (("_raw_data" ->> 'id'::"text")) STORED NOT NULL,
    "active" boolean GENERATED ALWAYS AS ((NULLIF(("_raw_data" ->> 'active'::"text"), ''::"text"))::boolean) STORED,
    "billing_scheme" "text" GENERATED ALWAYS AS (("_raw_data" ->> 'billing_scheme'::"text")) STORED,
    "created" bigint GENERATED ALWAYS AS ((NULLIF(("_raw_data" ->> 'created'::"text"), ''::"text"))::bigint) STORED,
    "currency" "text" GENERATED ALWAYS AS (("_raw_data" ->> 'currency'::"text")) STORED,
    "livemode" boolean GENERATED ALWAYS AS ((NULLIF(("_raw_data" ->> 'livemode'::"text"), ''::"text"))::boolean) STORED,
    "lookup_key" "text" GENERATED ALWAYS AS (("_raw_data" ->> 'lookup_key'::"text")) STORED,
    "metadata" "jsonb" GENERATED ALWAYS AS (("_raw_data" -> 'metadata'::"text")) STORED,
    "nickname" "text" GENERATED ALWAYS AS (("_raw_data" ->> 'nickname'::"text")) STORED,
    "object" "text" GENERATED ALWAYS AS (("_raw_data" ->> 'object'::"text")) STORED,
    "product" "text" GENERATED ALWAYS AS (
CASE
    WHEN (("jsonb_typeof"(("_raw_data" -> 'product'::"text")) = 'object'::"text") AND (("_raw_data" -> 'product'::"text") ? 'id'::"text")) THEN (("_raw_data" -> 'product'::"text") ->> 'id'::"text")
    ELSE ("_raw_data" ->> 'product'::"text")
END) STORED,
    "recurring" "jsonb" GENERATED ALWAYS AS (("_raw_data" -> 'recurring'::"text")) STORED,
    "tiers" "jsonb" GENERATED ALWAYS AS (("_raw_data" -> 'tiers'::"text")) STORED,
    "tiers_mode" "text" GENERATED ALWAYS AS (("_raw_data" ->> 'tiers_mode'::"text")) STORED,
    "transform_quantity" "jsonb" GENERATED ALWAYS AS (("_raw_data" -> 'transform_quantity'::"text")) STORED,
    "type" "text" GENERATED ALWAYS AS (("_raw_data" ->> 'type'::"text")) STORED,
    "unit_amount" bigint GENERATED ALWAYS AS ((NULLIF(("_raw_data" ->> 'unit_amount'::"text"), ''::"text"))::bigint) STORED,
    "unit_amount_decimal" "text" GENERATED ALWAYS AS (("_raw_data" ->> 'unit_amount_decimal'::"text")) STORED
);


ALTER TABLE "stripe"."prices" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "stripe"."products" (
    "_raw_data" "jsonb" NOT NULL,
    "_last_synced_at" timestamp with time zone,
    "_updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "_account_id" "text" NOT NULL,
    "id" "text" GENERATED ALWAYS AS (("_raw_data" ->> 'id'::"text")) STORED NOT NULL,
    "active" boolean GENERATED ALWAYS AS ((NULLIF(("_raw_data" ->> 'active'::"text"), ''::"text"))::boolean) STORED,
    "attributes" "jsonb" GENERATED ALWAYS AS (("_raw_data" -> 'attributes'::"text")) STORED,
    "caption" "text" GENERATED ALWAYS AS (("_raw_data" ->> 'caption'::"text")) STORED,
    "created" bigint GENERATED ALWAYS AS ((NULLIF(("_raw_data" ->> 'created'::"text"), ''::"text"))::bigint) STORED,
    "deactivate_on" "jsonb" GENERATED ALWAYS AS (("_raw_data" -> 'deactivate_on'::"text")) STORED,
    "description" "text" GENERATED ALWAYS AS (("_raw_data" ->> 'description'::"text")) STORED,
    "images" "jsonb" GENERATED ALWAYS AS (("_raw_data" -> 'images'::"text")) STORED,
    "livemode" boolean GENERATED ALWAYS AS ((NULLIF(("_raw_data" ->> 'livemode'::"text"), ''::"text"))::boolean) STORED,
    "metadata" "jsonb" GENERATED ALWAYS AS (("_raw_data" -> 'metadata'::"text")) STORED,
    "name" "text" GENERATED ALWAYS AS (("_raw_data" ->> 'name'::"text")) STORED,
    "object" "text" GENERATED ALWAYS AS (("_raw_data" ->> 'object'::"text")) STORED,
    "package_dimensions" "jsonb" GENERATED ALWAYS AS (("_raw_data" -> 'package_dimensions'::"text")) STORED,
    "shippable" boolean GENERATED ALWAYS AS ((NULLIF(("_raw_data" ->> 'shippable'::"text"), ''::"text"))::boolean) STORED,
    "statement_descriptor" "text" GENERATED ALWAYS AS (("_raw_data" ->> 'statement_descriptor'::"text")) STORED,
    "type" "text" GENERATED ALWAYS AS (("_raw_data" ->> 'type'::"text")) STORED,
    "unit_label" "text" GENERATED ALWAYS AS (("_raw_data" ->> 'unit_label'::"text")) STORED,
    "updated" bigint GENERATED ALWAYS AS ((NULLIF(("_raw_data" ->> 'updated'::"text"), ''::"text"))::bigint) STORED,
    "url" "text" GENERATED ALWAYS AS (("_raw_data" ->> 'url'::"text")) STORED
);


ALTER TABLE "stripe"."products" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "stripe"."refunds" (
    "_raw_data" "jsonb" NOT NULL,
    "_last_synced_at" timestamp with time zone,
    "_updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "_account_id" "text" NOT NULL,
    "id" "text" GENERATED ALWAYS AS (("_raw_data" ->> 'id'::"text")) STORED NOT NULL,
    "amount" bigint GENERATED ALWAYS AS ((NULLIF(("_raw_data" ->> 'amount'::"text"), ''::"text"))::bigint) STORED,
    "balance_transaction" "text" GENERATED ALWAYS AS (
CASE
    WHEN (("jsonb_typeof"(("_raw_data" -> 'balance_transaction'::"text")) = 'object'::"text") AND (("_raw_data" -> 'balance_transaction'::"text") ? 'id'::"text")) THEN (("_raw_data" -> 'balance_transaction'::"text") ->> 'id'::"text")
    ELSE ("_raw_data" ->> 'balance_transaction'::"text")
END) STORED,
    "charge" "text" GENERATED ALWAYS AS (
CASE
    WHEN (("jsonb_typeof"(("_raw_data" -> 'charge'::"text")) = 'object'::"text") AND (("_raw_data" -> 'charge'::"text") ? 'id'::"text")) THEN (("_raw_data" -> 'charge'::"text") ->> 'id'::"text")
    ELSE ("_raw_data" ->> 'charge'::"text")
END) STORED,
    "created" bigint GENERATED ALWAYS AS ((NULLIF(("_raw_data" ->> 'created'::"text"), ''::"text"))::bigint) STORED,
    "currency" "text" GENERATED ALWAYS AS (("_raw_data" ->> 'currency'::"text")) STORED,
    "description" "text" GENERATED ALWAYS AS (("_raw_data" ->> 'description'::"text")) STORED,
    "failure_balance_transaction" "text" GENERATED ALWAYS AS (
CASE
    WHEN (("jsonb_typeof"(("_raw_data" -> 'failure_balance_transaction'::"text")) = 'object'::"text") AND (("_raw_data" -> 'failure_balance_transaction'::"text") ? 'id'::"text")) THEN (("_raw_data" -> 'failure_balance_transaction'::"text") ->> 'id'::"text")
    ELSE ("_raw_data" ->> 'failure_balance_transaction'::"text")
END) STORED,
    "failure_reason" "text" GENERATED ALWAYS AS (("_raw_data" ->> 'failure_reason'::"text")) STORED,
    "metadata" "jsonb" GENERATED ALWAYS AS (("_raw_data" -> 'metadata'::"text")) STORED,
    "object" "text" GENERATED ALWAYS AS (("_raw_data" ->> 'object'::"text")) STORED,
    "payment_intent" "text" GENERATED ALWAYS AS (
CASE
    WHEN (("jsonb_typeof"(("_raw_data" -> 'payment_intent'::"text")) = 'object'::"text") AND (("_raw_data" -> 'payment_intent'::"text") ? 'id'::"text")) THEN (("_raw_data" -> 'payment_intent'::"text") ->> 'id'::"text")
    ELSE ("_raw_data" ->> 'payment_intent'::"text")
END) STORED,
    "reason" "text" GENERATED ALWAYS AS (("_raw_data" ->> 'reason'::"text")) STORED,
    "receipt_number" "text" GENERATED ALWAYS AS (("_raw_data" ->> 'receipt_number'::"text")) STORED,
    "source_transfer_reversal" "text" GENERATED ALWAYS AS (
CASE
    WHEN (("jsonb_typeof"(("_raw_data" -> 'source_transfer_reversal'::"text")) = 'object'::"text") AND (("_raw_data" -> 'source_transfer_reversal'::"text") ? 'id'::"text")) THEN (("_raw_data" -> 'source_transfer_reversal'::"text") ->> 'id'::"text")
    ELSE ("_raw_data" ->> 'source_transfer_reversal'::"text")
END) STORED,
    "status" "text" GENERATED ALWAYS AS (("_raw_data" ->> 'status'::"text")) STORED,
    "transfer_reversal" "text" GENERATED ALWAYS AS (
CASE
    WHEN (("jsonb_typeof"(("_raw_data" -> 'transfer_reversal'::"text")) = 'object'::"text") AND (("_raw_data" -> 'transfer_reversal'::"text") ? 'id'::"text")) THEN (("_raw_data" -> 'transfer_reversal'::"text") ->> 'id'::"text")
    ELSE ("_raw_data" ->> 'transfer_reversal'::"text")
END) STORED
);


ALTER TABLE "stripe"."refunds" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "stripe"."reviews" (
    "_raw_data" "jsonb" NOT NULL,
    "_last_synced_at" timestamp with time zone,
    "_updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "_account_id" "text" NOT NULL,
    "id" "text" GENERATED ALWAYS AS (("_raw_data" ->> 'id'::"text")) STORED NOT NULL,
    "billing_zip" "text" GENERATED ALWAYS AS (("_raw_data" ->> 'billing_zip'::"text")) STORED,
    "charge" "text" GENERATED ALWAYS AS (
CASE
    WHEN (("jsonb_typeof"(("_raw_data" -> 'charge'::"text")) = 'object'::"text") AND (("_raw_data" -> 'charge'::"text") ? 'id'::"text")) THEN (("_raw_data" -> 'charge'::"text") ->> 'id'::"text")
    ELSE ("_raw_data" ->> 'charge'::"text")
END) STORED,
    "closed_reason" "text" GENERATED ALWAYS AS (("_raw_data" ->> 'closed_reason'::"text")) STORED,
    "created" bigint GENERATED ALWAYS AS ((NULLIF(("_raw_data" ->> 'created'::"text"), ''::"text"))::bigint) STORED,
    "ip_address" "text" GENERATED ALWAYS AS (("_raw_data" ->> 'ip_address'::"text")) STORED,
    "ip_address_location" "jsonb" GENERATED ALWAYS AS (("_raw_data" -> 'ip_address_location'::"text")) STORED,
    "livemode" boolean GENERATED ALWAYS AS ((NULLIF(("_raw_data" ->> 'livemode'::"text"), ''::"text"))::boolean) STORED,
    "object" "text" GENERATED ALWAYS AS (("_raw_data" ->> 'object'::"text")) STORED,
    "open" boolean GENERATED ALWAYS AS ((NULLIF(("_raw_data" ->> 'open'::"text"), ''::"text"))::boolean) STORED,
    "opened_reason" "text" GENERATED ALWAYS AS (("_raw_data" ->> 'opened_reason'::"text")) STORED,
    "payment_intent" "text" GENERATED ALWAYS AS (
CASE
    WHEN (("jsonb_typeof"(("_raw_data" -> 'payment_intent'::"text")) = 'object'::"text") AND (("_raw_data" -> 'payment_intent'::"text") ? 'id'::"text")) THEN (("_raw_data" -> 'payment_intent'::"text") ->> 'id'::"text")
    ELSE ("_raw_data" ->> 'payment_intent'::"text")
END) STORED,
    "reason" "text" GENERATED ALWAYS AS (("_raw_data" ->> 'reason'::"text")) STORED,
    "session" "jsonb" GENERATED ALWAYS AS (("_raw_data" -> 'session'::"text")) STORED
);


ALTER TABLE "stripe"."reviews" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "stripe"."setup_intents" (
    "_raw_data" "jsonb" NOT NULL,
    "_last_synced_at" timestamp with time zone,
    "_updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "_account_id" "text" NOT NULL,
    "id" "text" GENERATED ALWAYS AS (("_raw_data" ->> 'id'::"text")) STORED NOT NULL,
    "application" "text" GENERATED ALWAYS AS (
CASE
    WHEN (("jsonb_typeof"(("_raw_data" -> 'application'::"text")) = 'object'::"text") AND (("_raw_data" -> 'application'::"text") ? 'id'::"text")) THEN (("_raw_data" -> 'application'::"text") ->> 'id'::"text")
    ELSE ("_raw_data" ->> 'application'::"text")
END) STORED,
    "cancellation_reason" "text" GENERATED ALWAYS AS (("_raw_data" ->> 'cancellation_reason'::"text")) STORED,
    "client_secret" "text" GENERATED ALWAYS AS (("_raw_data" ->> 'client_secret'::"text")) STORED,
    "created" bigint GENERATED ALWAYS AS ((NULLIF(("_raw_data" ->> 'created'::"text"), ''::"text"))::bigint) STORED,
    "customer" "text" GENERATED ALWAYS AS (
CASE
    WHEN (("jsonb_typeof"(("_raw_data" -> 'customer'::"text")) = 'object'::"text") AND (("_raw_data" -> 'customer'::"text") ? 'id'::"text")) THEN (("_raw_data" -> 'customer'::"text") ->> 'id'::"text")
    ELSE ("_raw_data" ->> 'customer'::"text")
END) STORED,
    "description" "text" GENERATED ALWAYS AS (("_raw_data" ->> 'description'::"text")) STORED,
    "last_setup_error" "jsonb" GENERATED ALWAYS AS (("_raw_data" -> 'last_setup_error'::"text")) STORED,
    "livemode" boolean GENERATED ALWAYS AS ((NULLIF(("_raw_data" ->> 'livemode'::"text"), ''::"text"))::boolean) STORED,
    "mandate" "text" GENERATED ALWAYS AS (
CASE
    WHEN (("jsonb_typeof"(("_raw_data" -> 'mandate'::"text")) = 'object'::"text") AND (("_raw_data" -> 'mandate'::"text") ? 'id'::"text")) THEN (("_raw_data" -> 'mandate'::"text") ->> 'id'::"text")
    ELSE ("_raw_data" ->> 'mandate'::"text")
END) STORED,
    "metadata" "jsonb" GENERATED ALWAYS AS (("_raw_data" -> 'metadata'::"text")) STORED,
    "next_action" "jsonb" GENERATED ALWAYS AS (("_raw_data" -> 'next_action'::"text")) STORED,
    "object" "text" GENERATED ALWAYS AS (("_raw_data" ->> 'object'::"text")) STORED,
    "on_behalf_of" "text" GENERATED ALWAYS AS (
CASE
    WHEN (("jsonb_typeof"(("_raw_data" -> 'on_behalf_of'::"text")) = 'object'::"text") AND (("_raw_data" -> 'on_behalf_of'::"text") ? 'id'::"text")) THEN (("_raw_data" -> 'on_behalf_of'::"text") ->> 'id'::"text")
    ELSE ("_raw_data" ->> 'on_behalf_of'::"text")
END) STORED,
    "payment_method" "text" GENERATED ALWAYS AS (
CASE
    WHEN (("jsonb_typeof"(("_raw_data" -> 'payment_method'::"text")) = 'object'::"text") AND (("_raw_data" -> 'payment_method'::"text") ? 'id'::"text")) THEN (("_raw_data" -> 'payment_method'::"text") ->> 'id'::"text")
    ELSE ("_raw_data" ->> 'payment_method'::"text")
END) STORED,
    "payment_method_options" "jsonb" GENERATED ALWAYS AS (("_raw_data" -> 'payment_method_options'::"text")) STORED,
    "payment_method_types" "jsonb" GENERATED ALWAYS AS (("_raw_data" -> 'payment_method_types'::"text")) STORED,
    "single_use_mandate" "text" GENERATED ALWAYS AS (
CASE
    WHEN (("jsonb_typeof"(("_raw_data" -> 'single_use_mandate'::"text")) = 'object'::"text") AND (("_raw_data" -> 'single_use_mandate'::"text") ? 'id'::"text")) THEN (("_raw_data" -> 'single_use_mandate'::"text") ->> 'id'::"text")
    ELSE ("_raw_data" ->> 'single_use_mandate'::"text")
END) STORED,
    "status" "text" GENERATED ALWAYS AS (("_raw_data" ->> 'status'::"text")) STORED,
    "usage" "text" GENERATED ALWAYS AS (("_raw_data" ->> 'usage'::"text")) STORED
);


ALTER TABLE "stripe"."setup_intents" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "stripe"."subscription_items" (
    "_raw_data" "jsonb" NOT NULL,
    "_last_synced_at" timestamp with time zone,
    "_updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "_account_id" "text" NOT NULL,
    "id" "text" GENERATED ALWAYS AS (("_raw_data" ->> 'id'::"text")) STORED NOT NULL,
    "billing_thresholds" "jsonb" GENERATED ALWAYS AS (("_raw_data" -> 'billing_thresholds'::"text")) STORED,
    "created" bigint GENERATED ALWAYS AS ((NULLIF(("_raw_data" ->> 'created'::"text"), ''::"text"))::bigint) STORED,
    "deleted" boolean GENERATED ALWAYS AS ((NULLIF(("_raw_data" ->> 'deleted'::"text"), ''::"text"))::boolean) STORED,
    "metadata" "jsonb" GENERATED ALWAYS AS (("_raw_data" -> 'metadata'::"text")) STORED,
    "object" "text" GENERATED ALWAYS AS (("_raw_data" ->> 'object'::"text")) STORED,
    "price" "jsonb" GENERATED ALWAYS AS (("_raw_data" -> 'price'::"text")) STORED,
    "quantity" bigint GENERATED ALWAYS AS ((NULLIF(("_raw_data" ->> 'quantity'::"text"), ''::"text"))::bigint) STORED,
    "subscription" "text" GENERATED ALWAYS AS (("_raw_data" ->> 'subscription'::"text")) STORED,
    "tax_rates" "jsonb" GENERATED ALWAYS AS (("_raw_data" -> 'tax_rates'::"text")) STORED
);


ALTER TABLE "stripe"."subscription_items" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "stripe"."subscription_schedules" (
    "_raw_data" "jsonb" NOT NULL,
    "_last_synced_at" timestamp with time zone,
    "_updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "_account_id" "text" NOT NULL,
    "id" "text" GENERATED ALWAYS AS (("_raw_data" ->> 'id'::"text")) STORED NOT NULL,
    "canceled_at" bigint GENERATED ALWAYS AS ((NULLIF(("_raw_data" ->> 'canceled_at'::"text"), ''::"text"))::bigint) STORED,
    "completed_at" bigint GENERATED ALWAYS AS ((NULLIF(("_raw_data" ->> 'completed_at'::"text"), ''::"text"))::bigint) STORED,
    "created" bigint GENERATED ALWAYS AS ((NULLIF(("_raw_data" ->> 'created'::"text"), ''::"text"))::bigint) STORED,
    "current_phase" "jsonb" GENERATED ALWAYS AS (("_raw_data" -> 'current_phase'::"text")) STORED,
    "customer" "text" GENERATED ALWAYS AS (
CASE
    WHEN (("jsonb_typeof"(("_raw_data" -> 'customer'::"text")) = 'object'::"text") AND (("_raw_data" -> 'customer'::"text") ? 'id'::"text")) THEN (("_raw_data" -> 'customer'::"text") ->> 'id'::"text")
    ELSE ("_raw_data" ->> 'customer'::"text")
END) STORED,
    "default_settings" "jsonb" GENERATED ALWAYS AS (("_raw_data" -> 'default_settings'::"text")) STORED,
    "end_behavior" "text" GENERATED ALWAYS AS (("_raw_data" ->> 'end_behavior'::"text")) STORED,
    "livemode" boolean GENERATED ALWAYS AS ((NULLIF(("_raw_data" ->> 'livemode'::"text"), ''::"text"))::boolean) STORED,
    "metadata" "jsonb" GENERATED ALWAYS AS (("_raw_data" -> 'metadata'::"text")) STORED,
    "object" "text" GENERATED ALWAYS AS (("_raw_data" ->> 'object'::"text")) STORED,
    "phases" "jsonb" GENERATED ALWAYS AS (("_raw_data" -> 'phases'::"text")) STORED,
    "released_at" bigint GENERATED ALWAYS AS ((NULLIF(("_raw_data" ->> 'released_at'::"text"), ''::"text"))::bigint) STORED,
    "released_subscription" "text" GENERATED ALWAYS AS (("_raw_data" ->> 'released_subscription'::"text")) STORED,
    "status" "text" GENERATED ALWAYS AS (("_raw_data" ->> 'status'::"text")) STORED,
    "subscription" "text" GENERATED ALWAYS AS (
CASE
    WHEN (("jsonb_typeof"(("_raw_data" -> 'subscription'::"text")) = 'object'::"text") AND (("_raw_data" -> 'subscription'::"text") ? 'id'::"text")) THEN (("_raw_data" -> 'subscription'::"text") ->> 'id'::"text")
    ELSE ("_raw_data" ->> 'subscription'::"text")
END) STORED
);


ALTER TABLE "stripe"."subscription_schedules" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "stripe"."subscriptions" (
    "_raw_data" "jsonb" NOT NULL,
    "_last_synced_at" timestamp with time zone,
    "_updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "_account_id" "text" NOT NULL,
    "id" "text" GENERATED ALWAYS AS (("_raw_data" ->> 'id'::"text")) STORED NOT NULL,
    "application_fee_percent" numeric GENERATED ALWAYS AS ((NULLIF(("_raw_data" ->> 'application_fee_percent'::"text"), ''::"text"))::numeric) STORED,
    "billing_cycle_anchor" bigint GENERATED ALWAYS AS ((NULLIF(("_raw_data" ->> 'billing_cycle_anchor'::"text"), ''::"text"))::bigint) STORED,
    "billing_thresholds" "jsonb" GENERATED ALWAYS AS (("_raw_data" -> 'billing_thresholds'::"text")) STORED,
    "cancel_at" bigint GENERATED ALWAYS AS ((NULLIF(("_raw_data" ->> 'cancel_at'::"text"), ''::"text"))::bigint) STORED,
    "cancel_at_period_end" boolean GENERATED ALWAYS AS ((NULLIF(("_raw_data" ->> 'cancel_at_period_end'::"text"), ''::"text"))::boolean) STORED,
    "canceled_at" bigint GENERATED ALWAYS AS ((NULLIF(("_raw_data" ->> 'canceled_at'::"text"), ''::"text"))::bigint) STORED,
    "collection_method" "text" GENERATED ALWAYS AS (("_raw_data" ->> 'collection_method'::"text")) STORED,
    "created" bigint GENERATED ALWAYS AS ((NULLIF(("_raw_data" ->> 'created'::"text"), ''::"text"))::bigint) STORED,
    "current_period_end" bigint GENERATED ALWAYS AS ((NULLIF(("_raw_data" ->> 'current_period_end'::"text"), ''::"text"))::bigint) STORED,
    "current_period_start" bigint GENERATED ALWAYS AS ((NULLIF(("_raw_data" ->> 'current_period_start'::"text"), ''::"text"))::bigint) STORED,
    "customer" "text" GENERATED ALWAYS AS (
CASE
    WHEN (("jsonb_typeof"(("_raw_data" -> 'customer'::"text")) = 'object'::"text") AND (("_raw_data" -> 'customer'::"text") ? 'id'::"text")) THEN (("_raw_data" -> 'customer'::"text") ->> 'id'::"text")
    ELSE ("_raw_data" ->> 'customer'::"text")
END) STORED,
    "days_until_due" bigint GENERATED ALWAYS AS ((NULLIF(("_raw_data" ->> 'days_until_due'::"text"), ''::"text"))::bigint) STORED,
    "default_payment_method" "text" GENERATED ALWAYS AS (
CASE
    WHEN (("jsonb_typeof"(("_raw_data" -> 'default_payment_method'::"text")) = 'object'::"text") AND (("_raw_data" -> 'default_payment_method'::"text") ? 'id'::"text")) THEN (("_raw_data" -> 'default_payment_method'::"text") ->> 'id'::"text")
    ELSE ("_raw_data" ->> 'default_payment_method'::"text")
END) STORED,
    "default_source" "text" GENERATED ALWAYS AS (
CASE
    WHEN (("jsonb_typeof"(("_raw_data" -> 'default_source'::"text")) = 'object'::"text") AND (("_raw_data" -> 'default_source'::"text") ? 'id'::"text")) THEN (("_raw_data" -> 'default_source'::"text") ->> 'id'::"text")
    ELSE ("_raw_data" ->> 'default_source'::"text")
END) STORED,
    "default_tax_rates" "jsonb" GENERATED ALWAYS AS (("_raw_data" -> 'default_tax_rates'::"text")) STORED,
    "discount" "jsonb" GENERATED ALWAYS AS (("_raw_data" -> 'discount'::"text")) STORED,
    "ended_at" bigint GENERATED ALWAYS AS ((NULLIF(("_raw_data" ->> 'ended_at'::"text"), ''::"text"))::bigint) STORED,
    "items" "jsonb" GENERATED ALWAYS AS (("_raw_data" -> 'items'::"text")) STORED,
    "latest_invoice" "text" GENERATED ALWAYS AS (
CASE
    WHEN (("jsonb_typeof"(("_raw_data" -> 'latest_invoice'::"text")) = 'object'::"text") AND (("_raw_data" -> 'latest_invoice'::"text") ? 'id'::"text")) THEN (("_raw_data" -> 'latest_invoice'::"text") ->> 'id'::"text")
    ELSE ("_raw_data" ->> 'latest_invoice'::"text")
END) STORED,
    "livemode" boolean GENERATED ALWAYS AS ((NULLIF(("_raw_data" ->> 'livemode'::"text"), ''::"text"))::boolean) STORED,
    "metadata" "jsonb" GENERATED ALWAYS AS (("_raw_data" -> 'metadata'::"text")) STORED,
    "next_pending_invoice_item_invoice" bigint GENERATED ALWAYS AS ((NULLIF(("_raw_data" ->> 'next_pending_invoice_item_invoice'::"text"), ''::"text"))::bigint) STORED,
    "object" "text" GENERATED ALWAYS AS (("_raw_data" ->> 'object'::"text")) STORED,
    "pause_collection" "jsonb" GENERATED ALWAYS AS (("_raw_data" -> 'pause_collection'::"text")) STORED,
    "pending_invoice_item_interval" "jsonb" GENERATED ALWAYS AS (("_raw_data" -> 'pending_invoice_item_interval'::"text")) STORED,
    "pending_setup_intent" "text" GENERATED ALWAYS AS (
CASE
    WHEN (("jsonb_typeof"(("_raw_data" -> 'pending_setup_intent'::"text")) = 'object'::"text") AND (("_raw_data" -> 'pending_setup_intent'::"text") ? 'id'::"text")) THEN (("_raw_data" -> 'pending_setup_intent'::"text") ->> 'id'::"text")
    ELSE ("_raw_data" ->> 'pending_setup_intent'::"text")
END) STORED,
    "pending_update" "jsonb" GENERATED ALWAYS AS (("_raw_data" -> 'pending_update'::"text")) STORED,
    "quantity" bigint GENERATED ALWAYS AS ((NULLIF(("_raw_data" ->> 'quantity'::"text"), ''::"text"))::bigint) STORED,
    "schedule" "text" GENERATED ALWAYS AS (
CASE
    WHEN (("jsonb_typeof"(("_raw_data" -> 'schedule'::"text")) = 'object'::"text") AND (("_raw_data" -> 'schedule'::"text") ? 'id'::"text")) THEN (("_raw_data" -> 'schedule'::"text") ->> 'id'::"text")
    ELSE ("_raw_data" ->> 'schedule'::"text")
END) STORED,
    "start_date" bigint GENERATED ALWAYS AS ((NULLIF(("_raw_data" ->> 'start_date'::"text"), ''::"text"))::bigint) STORED,
    "status" "text" GENERATED ALWAYS AS (("_raw_data" ->> 'status'::"text")) STORED,
    "transfer_data" "jsonb" GENERATED ALWAYS AS (("_raw_data" -> 'transfer_data'::"text")) STORED,
    "trial_end" bigint GENERATED ALWAYS AS ((NULLIF(("_raw_data" ->> 'trial_end'::"text"), ''::"text"))::bigint) STORED,
    "trial_start" bigint GENERATED ALWAYS AS ((NULLIF(("_raw_data" ->> 'trial_start'::"text"), ''::"text"))::bigint) STORED
);


ALTER TABLE "stripe"."subscriptions" OWNER TO "postgres";


CREATE OR REPLACE VIEW "stripe"."sync_obj_progress" AS
 SELECT "_account_id" AS "account_id",
    "run_started_at",
    "object",
    "round"(((100.0 * ("count"(*) FILTER (WHERE ("status" = 'complete'::"text")))::numeric) / (NULLIF("count"(*), 0))::numeric), 1) AS "pct_complete",
    COALESCE("sum"("processed_count"), (0)::bigint) AS "processed"
   FROM "stripe"."_sync_obj_runs" "r"
  WHERE ("run_started_at" = ( SELECT "max"("s"."started_at") AS "max"
           FROM "stripe"."_sync_runs" "s"
          WHERE ("s"."_account_id" = "r"."_account_id")))
  GROUP BY "_account_id", "run_started_at", "object";


ALTER VIEW "stripe"."sync_obj_progress" OWNER TO "postgres";


CREATE OR REPLACE VIEW "stripe"."sync_runs" AS
 SELECT "r"."_account_id" AS "account_id",
    "r"."started_at",
    "r"."closed_at",
    "r"."triggered_by",
    "r"."max_concurrent",
    COALESCE("sum"("o"."processed_count"), (0)::bigint) AS "total_processed",
    "count"("o".*) AS "total_objects",
    "count"(*) FILTER (WHERE ("o"."status" = 'complete'::"text")) AS "complete_count",
    "count"(*) FILTER (WHERE ("o"."status" = 'error'::"text")) AS "error_count",
    "count"(*) FILTER (WHERE ("o"."status" = 'running'::"text")) AS "running_count",
    "count"(*) FILTER (WHERE ("o"."status" = 'pending'::"text")) AS "pending_count",
    "string_agg"("o"."error_message", '; '::"text") FILTER (WHERE ("o"."error_message" IS NOT NULL)) AS "error_message",
        CASE
            WHEN (("r"."closed_at" IS NULL) AND ("count"(*) FILTER (WHERE ("o"."status" = 'running'::"text")) > 0)) THEN 'running'::"text"
            WHEN (("r"."closed_at" IS NULL) AND (("count"("o".*) = 0) OR ("count"("o".*) = "count"(*) FILTER (WHERE ("o"."status" = 'pending'::"text"))))) THEN 'pending'::"text"
            WHEN ("r"."closed_at" IS NULL) THEN 'running'::"text"
            WHEN ("count"(*) FILTER (WHERE ("o"."status" = 'error'::"text")) > 0) THEN 'error'::"text"
            ELSE 'complete'::"text"
        END AS "status"
   FROM ("stripe"."_sync_runs" "r"
     LEFT JOIN "stripe"."_sync_obj_runs" "o" ON ((("o"."_account_id" = "r"."_account_id") AND ("o"."run_started_at" = "r"."started_at"))))
  GROUP BY "r"."_account_id", "r"."started_at", "r"."closed_at", "r"."triggered_by", "r"."max_concurrent";


ALTER VIEW "stripe"."sync_runs" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "stripe"."tax_ids" (
    "_raw_data" "jsonb" NOT NULL,
    "_last_synced_at" timestamp with time zone,
    "_updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "_account_id" "text" NOT NULL,
    "id" "text" GENERATED ALWAYS AS (("_raw_data" ->> 'id'::"text")) STORED NOT NULL,
    "country" "text" GENERATED ALWAYS AS (("_raw_data" ->> 'country'::"text")) STORED,
    "created" bigint GENERATED ALWAYS AS ((NULLIF(("_raw_data" ->> 'created'::"text"), ''::"text"))::bigint) STORED,
    "customer" "text" GENERATED ALWAYS AS (
CASE
    WHEN (("jsonb_typeof"(("_raw_data" -> 'customer'::"text")) = 'object'::"text") AND (("_raw_data" -> 'customer'::"text") ? 'id'::"text")) THEN (("_raw_data" -> 'customer'::"text") ->> 'id'::"text")
    ELSE ("_raw_data" ->> 'customer'::"text")
END) STORED,
    "livemode" boolean GENERATED ALWAYS AS ((NULLIF(("_raw_data" ->> 'livemode'::"text"), ''::"text"))::boolean) STORED,
    "object" "text" GENERATED ALWAYS AS (("_raw_data" ->> 'object'::"text")) STORED,
    "type" "text" GENERATED ALWAYS AS (("_raw_data" ->> 'type'::"text")) STORED,
    "value" "text" GENERATED ALWAYS AS (("_raw_data" ->> 'value'::"text")) STORED,
    "verification" "jsonb" GENERATED ALWAYS AS (("_raw_data" -> 'verification'::"text")) STORED
);


ALTER TABLE "stripe"."tax_ids" OWNER TO "postgres";


ALTER TABLE ONLY "public"."prices"
    ADD CONSTRAINT "prices_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."products"
    ADD CONSTRAINT "products_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_stripe_customer_id_key" UNIQUE ("stripe_customer_id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_stripe_subscription_id_key" UNIQUE ("stripe_subscription_id");



ALTER TABLE ONLY "public"."propostas"
    ADD CONSTRAINT "propostas_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."subscriptions"
    ADD CONSTRAINT "subscriptions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "stripe"."_managed_webhooks"
    ADD CONSTRAINT "_managed_webhooks_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "stripe"."_migrations"
    ADD CONSTRAINT "_migrations_name_key" UNIQUE ("name");



ALTER TABLE ONLY "stripe"."_migrations"
    ADD CONSTRAINT "_migrations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "stripe"."_rate_limits"
    ADD CONSTRAINT "_rate_limits_pkey" PRIMARY KEY ("key");



ALTER TABLE ONLY "stripe"."_sync_obj_runs"
    ADD CONSTRAINT "_sync_obj_runs_pkey" PRIMARY KEY ("_account_id", "run_started_at", "object", "created_gte", "created_lte");



ALTER TABLE ONLY "stripe"."_sync_runs"
    ADD CONSTRAINT "_sync_runs_pkey" PRIMARY KEY ("_account_id", "started_at");



ALTER TABLE ONLY "stripe"."accounts"
    ADD CONSTRAINT "accounts_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "stripe"."active_entitlements"
    ADD CONSTRAINT "active_entitlements_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "stripe"."charges"
    ADD CONSTRAINT "charges_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "stripe"."checkout_session_line_items"
    ADD CONSTRAINT "checkout_session_line_items_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "stripe"."checkout_sessions"
    ADD CONSTRAINT "checkout_sessions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "stripe"."coupons"
    ADD CONSTRAINT "coupons_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "stripe"."credit_notes"
    ADD CONSTRAINT "credit_notes_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "stripe"."customers"
    ADD CONSTRAINT "customers_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "stripe"."disputes"
    ADD CONSTRAINT "disputes_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "stripe"."early_fraud_warnings"
    ADD CONSTRAINT "early_fraud_warnings_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "stripe"."features"
    ADD CONSTRAINT "features_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "stripe"."invoices"
    ADD CONSTRAINT "invoices_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "stripe"."_managed_webhooks"
    ADD CONSTRAINT "managed_webhooks_url_account_unique" UNIQUE ("url", "account_id");



ALTER TABLE ONLY "stripe"."_sync_runs"
    ADD CONSTRAINT "one_active_run_per_account_triggered_by" EXCLUDE USING "btree" ("_account_id" WITH =, COALESCE("triggered_by", 'default'::"text") WITH =) WHERE (("closed_at" IS NULL));



ALTER TABLE ONLY "stripe"."payment_intents"
    ADD CONSTRAINT "payment_intents_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "stripe"."payment_methods"
    ADD CONSTRAINT "payment_methods_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "stripe"."plans"
    ADD CONSTRAINT "plans_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "stripe"."prices"
    ADD CONSTRAINT "prices_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "stripe"."products"
    ADD CONSTRAINT "products_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "stripe"."refunds"
    ADD CONSTRAINT "refunds_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "stripe"."reviews"
    ADD CONSTRAINT "reviews_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "stripe"."setup_intents"
    ADD CONSTRAINT "setup_intents_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "stripe"."subscription_items"
    ADD CONSTRAINT "subscription_items_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "stripe"."subscription_schedules"
    ADD CONSTRAINT "subscription_schedules_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "stripe"."subscriptions"
    ADD CONSTRAINT "subscriptions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "stripe"."tax_ids"
    ADD CONSTRAINT "tax_ids_pkey" PRIMARY KEY ("id");



CREATE INDEX "idx_profiles_stripe_customer_id" ON "public"."profiles" USING "btree" ("stripe_customer_id");



CREATE INDEX "idx_accounts_api_key_hashes" ON "stripe"."accounts" USING "gin" ("api_key_hashes");



CREATE INDEX "idx_active_entitlements_account_id" ON "stripe"."active_entitlements" USING "btree" ("_account_id");



CREATE INDEX "idx_charges_account_id" ON "stripe"."charges" USING "btree" ("_account_id");



CREATE INDEX "idx_checkout_session_line_items_account_id" ON "stripe"."checkout_session_line_items" USING "btree" ("_account_id");



CREATE INDEX "idx_checkout_sessions_account_id" ON "stripe"."checkout_sessions" USING "btree" ("_account_id");



CREATE INDEX "idx_coupons_account_id" ON "stripe"."coupons" USING "btree" ("_account_id");



CREATE INDEX "idx_credit_notes_account_id" ON "stripe"."credit_notes" USING "btree" ("_account_id");



CREATE INDEX "idx_customers_account_id" ON "stripe"."customers" USING "btree" ("_account_id");



CREATE INDEX "idx_disputes_account_id" ON "stripe"."disputes" USING "btree" ("_account_id");



CREATE INDEX "idx_early_fraud_warnings_account_id" ON "stripe"."early_fraud_warnings" USING "btree" ("_account_id");



CREATE INDEX "idx_features_account_id" ON "stripe"."features" USING "btree" ("_account_id");



CREATE INDEX "idx_invoices_account_id" ON "stripe"."invoices" USING "btree" ("_account_id");



CREATE INDEX "idx_managed_webhooks_enabled" ON "stripe"."_managed_webhooks" USING "btree" ("enabled");



CREATE INDEX "idx_managed_webhooks_status" ON "stripe"."_managed_webhooks" USING "btree" ("status");



CREATE INDEX "idx_payment_intents_account_id" ON "stripe"."payment_intents" USING "btree" ("_account_id");



CREATE INDEX "idx_payment_methods_account_id" ON "stripe"."payment_methods" USING "btree" ("_account_id");



CREATE INDEX "idx_plans_account_id" ON "stripe"."plans" USING "btree" ("_account_id");



CREATE INDEX "idx_prices_account_id" ON "stripe"."prices" USING "btree" ("_account_id");



CREATE INDEX "idx_products_account_id" ON "stripe"."products" USING "btree" ("_account_id");



CREATE INDEX "idx_refunds_account_id" ON "stripe"."refunds" USING "btree" ("_account_id");



CREATE INDEX "idx_reviews_account_id" ON "stripe"."reviews" USING "btree" ("_account_id");



CREATE INDEX "idx_setup_intents_account_id" ON "stripe"."setup_intents" USING "btree" ("_account_id");



CREATE INDEX "idx_subscription_items_account_id" ON "stripe"."subscription_items" USING "btree" ("_account_id");



CREATE INDEX "idx_subscription_schedules_account_id" ON "stripe"."subscription_schedules" USING "btree" ("_account_id");



CREATE INDEX "idx_subscriptions_account_id" ON "stripe"."subscriptions" USING "btree" ("_account_id");



CREATE INDEX "idx_sync_obj_runs_priority" ON "stripe"."_sync_obj_runs" USING "btree" ("_account_id", "run_started_at", "status", "priority");



CREATE INDEX "idx_sync_obj_runs_status" ON "stripe"."_sync_obj_runs" USING "btree" ("_account_id", "run_started_at", "status");



CREATE INDEX "idx_sync_runs_account_status" ON "stripe"."_sync_runs" USING "btree" ("_account_id", "closed_at");



CREATE INDEX "idx_tax_ids_account_id" ON "stripe"."tax_ids" USING "btree" ("_account_id");



CREATE OR REPLACE TRIGGER "handle_updated_at" BEFORE UPDATE ON "stripe"."_managed_webhooks" FOR EACH ROW EXECUTE FUNCTION "stripe"."set_updated_at_metadata"();



CREATE OR REPLACE TRIGGER "handle_updated_at" BEFORE UPDATE ON "stripe"."_sync_obj_runs" FOR EACH ROW EXECUTE FUNCTION "stripe"."set_updated_at_metadata"();



CREATE OR REPLACE TRIGGER "handle_updated_at" BEFORE UPDATE ON "stripe"."_sync_runs" FOR EACH ROW EXECUTE FUNCTION "stripe"."set_updated_at_metadata"();



CREATE OR REPLACE TRIGGER "handle_updated_at" BEFORE UPDATE ON "stripe"."accounts" FOR EACH ROW EXECUTE FUNCTION "stripe"."set_updated_at"();



CREATE OR REPLACE TRIGGER "handle_updated_at" BEFORE UPDATE ON "stripe"."active_entitlements" FOR EACH ROW EXECUTE FUNCTION "stripe"."set_updated_at"();



CREATE OR REPLACE TRIGGER "handle_updated_at" BEFORE UPDATE ON "stripe"."charges" FOR EACH ROW EXECUTE FUNCTION "stripe"."set_updated_at"();



CREATE OR REPLACE TRIGGER "handle_updated_at" BEFORE UPDATE ON "stripe"."checkout_session_line_items" FOR EACH ROW EXECUTE FUNCTION "stripe"."set_updated_at"();



CREATE OR REPLACE TRIGGER "handle_updated_at" BEFORE UPDATE ON "stripe"."checkout_sessions" FOR EACH ROW EXECUTE FUNCTION "stripe"."set_updated_at"();



CREATE OR REPLACE TRIGGER "handle_updated_at" BEFORE UPDATE ON "stripe"."coupons" FOR EACH ROW EXECUTE FUNCTION "stripe"."set_updated_at"();



CREATE OR REPLACE TRIGGER "handle_updated_at" BEFORE UPDATE ON "stripe"."credit_notes" FOR EACH ROW EXECUTE FUNCTION "stripe"."set_updated_at"();



CREATE OR REPLACE TRIGGER "handle_updated_at" BEFORE UPDATE ON "stripe"."customers" FOR EACH ROW EXECUTE FUNCTION "stripe"."set_updated_at"();



CREATE OR REPLACE TRIGGER "handle_updated_at" BEFORE UPDATE ON "stripe"."disputes" FOR EACH ROW EXECUTE FUNCTION "stripe"."set_updated_at"();



CREATE OR REPLACE TRIGGER "handle_updated_at" BEFORE UPDATE ON "stripe"."early_fraud_warnings" FOR EACH ROW EXECUTE FUNCTION "stripe"."set_updated_at"();



CREATE OR REPLACE TRIGGER "handle_updated_at" BEFORE UPDATE ON "stripe"."features" FOR EACH ROW EXECUTE FUNCTION "stripe"."set_updated_at"();



CREATE OR REPLACE TRIGGER "handle_updated_at" BEFORE UPDATE ON "stripe"."invoices" FOR EACH ROW EXECUTE FUNCTION "stripe"."set_updated_at"();



CREATE OR REPLACE TRIGGER "handle_updated_at" BEFORE UPDATE ON "stripe"."payment_intents" FOR EACH ROW EXECUTE FUNCTION "stripe"."set_updated_at"();



CREATE OR REPLACE TRIGGER "handle_updated_at" BEFORE UPDATE ON "stripe"."payment_methods" FOR EACH ROW EXECUTE FUNCTION "stripe"."set_updated_at"();



CREATE OR REPLACE TRIGGER "handle_updated_at" BEFORE UPDATE ON "stripe"."plans" FOR EACH ROW EXECUTE FUNCTION "stripe"."set_updated_at"();



CREATE OR REPLACE TRIGGER "handle_updated_at" BEFORE UPDATE ON "stripe"."prices" FOR EACH ROW EXECUTE FUNCTION "stripe"."set_updated_at"();



CREATE OR REPLACE TRIGGER "handle_updated_at" BEFORE UPDATE ON "stripe"."products" FOR EACH ROW EXECUTE FUNCTION "stripe"."set_updated_at"();



CREATE OR REPLACE TRIGGER "handle_updated_at" BEFORE UPDATE ON "stripe"."refunds" FOR EACH ROW EXECUTE FUNCTION "stripe"."set_updated_at"();



CREATE OR REPLACE TRIGGER "handle_updated_at" BEFORE UPDATE ON "stripe"."reviews" FOR EACH ROW EXECUTE FUNCTION "stripe"."set_updated_at"();



CREATE OR REPLACE TRIGGER "handle_updated_at" BEFORE UPDATE ON "stripe"."setup_intents" FOR EACH ROW EXECUTE FUNCTION "stripe"."set_updated_at"();



CREATE OR REPLACE TRIGGER "handle_updated_at" BEFORE UPDATE ON "stripe"."subscription_items" FOR EACH ROW EXECUTE FUNCTION "stripe"."set_updated_at"();



CREATE OR REPLACE TRIGGER "handle_updated_at" BEFORE UPDATE ON "stripe"."subscription_schedules" FOR EACH ROW EXECUTE FUNCTION "stripe"."set_updated_at"();



CREATE OR REPLACE TRIGGER "handle_updated_at" BEFORE UPDATE ON "stripe"."subscriptions" FOR EACH ROW EXECUTE FUNCTION "stripe"."set_updated_at"();



CREATE OR REPLACE TRIGGER "handle_updated_at" BEFORE UPDATE ON "stripe"."tax_ids" FOR EACH ROW EXECUTE FUNCTION "stripe"."set_updated_at"();



ALTER TABLE ONLY "public"."prices"
    ADD CONSTRAINT "prices_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."propostas"
    ADD CONSTRAINT "propostas_profile_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."propostas"
    ADD CONSTRAINT "propostas_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."subscriptions"
    ADD CONSTRAINT "subscriptions_price_id_fkey" FOREIGN KEY ("price_id") REFERENCES "public"."prices"("id");



ALTER TABLE ONLY "public"."subscriptions"
    ADD CONSTRAINT "subscriptions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "stripe"."active_entitlements"
    ADD CONSTRAINT "fk_active_entitlements_account" FOREIGN KEY ("_account_id") REFERENCES "stripe"."accounts"("id");



ALTER TABLE ONLY "stripe"."charges"
    ADD CONSTRAINT "fk_charges_account" FOREIGN KEY ("_account_id") REFERENCES "stripe"."accounts"("id");



ALTER TABLE ONLY "stripe"."checkout_session_line_items"
    ADD CONSTRAINT "fk_checkout_session_line_items_account" FOREIGN KEY ("_account_id") REFERENCES "stripe"."accounts"("id");



ALTER TABLE ONLY "stripe"."checkout_sessions"
    ADD CONSTRAINT "fk_checkout_sessions_account" FOREIGN KEY ("_account_id") REFERENCES "stripe"."accounts"("id");



ALTER TABLE ONLY "stripe"."coupons"
    ADD CONSTRAINT "fk_coupons_account" FOREIGN KEY ("_account_id") REFERENCES "stripe"."accounts"("id");



ALTER TABLE ONLY "stripe"."credit_notes"
    ADD CONSTRAINT "fk_credit_notes_account" FOREIGN KEY ("_account_id") REFERENCES "stripe"."accounts"("id");



ALTER TABLE ONLY "stripe"."customers"
    ADD CONSTRAINT "fk_customers_account" FOREIGN KEY ("_account_id") REFERENCES "stripe"."accounts"("id");



ALTER TABLE ONLY "stripe"."disputes"
    ADD CONSTRAINT "fk_disputes_account" FOREIGN KEY ("_account_id") REFERENCES "stripe"."accounts"("id");



ALTER TABLE ONLY "stripe"."early_fraud_warnings"
    ADD CONSTRAINT "fk_early_fraud_warnings_account" FOREIGN KEY ("_account_id") REFERENCES "stripe"."accounts"("id");



ALTER TABLE ONLY "stripe"."features"
    ADD CONSTRAINT "fk_features_account" FOREIGN KEY ("_account_id") REFERENCES "stripe"."accounts"("id");



ALTER TABLE ONLY "stripe"."invoices"
    ADD CONSTRAINT "fk_invoices_account" FOREIGN KEY ("_account_id") REFERENCES "stripe"."accounts"("id");



ALTER TABLE ONLY "stripe"."_managed_webhooks"
    ADD CONSTRAINT "fk_managed_webhooks_account" FOREIGN KEY ("account_id") REFERENCES "stripe"."accounts"("id");



ALTER TABLE ONLY "stripe"."payment_intents"
    ADD CONSTRAINT "fk_payment_intents_account" FOREIGN KEY ("_account_id") REFERENCES "stripe"."accounts"("id");



ALTER TABLE ONLY "stripe"."payment_methods"
    ADD CONSTRAINT "fk_payment_methods_account" FOREIGN KEY ("_account_id") REFERENCES "stripe"."accounts"("id");



ALTER TABLE ONLY "stripe"."plans"
    ADD CONSTRAINT "fk_plans_account" FOREIGN KEY ("_account_id") REFERENCES "stripe"."accounts"("id");



ALTER TABLE ONLY "stripe"."prices"
    ADD CONSTRAINT "fk_prices_account" FOREIGN KEY ("_account_id") REFERENCES "stripe"."accounts"("id");



ALTER TABLE ONLY "stripe"."products"
    ADD CONSTRAINT "fk_products_account" FOREIGN KEY ("_account_id") REFERENCES "stripe"."accounts"("id");



ALTER TABLE ONLY "stripe"."refunds"
    ADD CONSTRAINT "fk_refunds_account" FOREIGN KEY ("_account_id") REFERENCES "stripe"."accounts"("id");



ALTER TABLE ONLY "stripe"."reviews"
    ADD CONSTRAINT "fk_reviews_account" FOREIGN KEY ("_account_id") REFERENCES "stripe"."accounts"("id");



ALTER TABLE ONLY "stripe"."setup_intents"
    ADD CONSTRAINT "fk_setup_intents_account" FOREIGN KEY ("_account_id") REFERENCES "stripe"."accounts"("id");



ALTER TABLE ONLY "stripe"."subscription_items"
    ADD CONSTRAINT "fk_subscription_items_account" FOREIGN KEY ("_account_id") REFERENCES "stripe"."accounts"("id");



ALTER TABLE ONLY "stripe"."subscription_schedules"
    ADD CONSTRAINT "fk_subscription_schedules_account" FOREIGN KEY ("_account_id") REFERENCES "stripe"."accounts"("id");



ALTER TABLE ONLY "stripe"."subscriptions"
    ADD CONSTRAINT "fk_subscriptions_account" FOREIGN KEY ("_account_id") REFERENCES "stripe"."accounts"("id");



ALTER TABLE ONLY "stripe"."_sync_obj_runs"
    ADD CONSTRAINT "fk_sync_obj_runs_parent" FOREIGN KEY ("_account_id", "run_started_at") REFERENCES "stripe"."_sync_runs"("_account_id", "started_at");



ALTER TABLE ONLY "stripe"."_sync_runs"
    ADD CONSTRAINT "fk_sync_runs_account" FOREIGN KEY ("_account_id") REFERENCES "stripe"."accounts"("id");



ALTER TABLE ONLY "stripe"."tax_ids"
    ADD CONSTRAINT "fk_tax_ids_account" FOREIGN KEY ("_account_id") REFERENCES "stripe"."accounts"("id");



CREATE POLICY "Permitir tudo para o próprio usuário" ON "public"."profiles" USING (("auth"."uid"() = "id")) WITH CHECK (("auth"."uid"() = "id"));



CREATE POLICY "Usuarios podem gerenciar suas próprias propostas" ON "public"."propostas" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Usuários podem inserir suas próprias propostas" ON "public"."propostas" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Usuários podem ler suas próprias assinaturas" ON "public"."subscriptions" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Usuários podem ver a própria assinatura" ON "public"."subscriptions" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Usuários podem ver suas próprias propostas" ON "public"."propostas" FOR SELECT USING (("auth"."uid"() = "user_id"));



ALTER TABLE "public"."prices" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."products" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."propostas" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."subscriptions" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";








GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";











































































































































































GRANT ALL ON FUNCTION "public"."can_user_create_proposta"("target_user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."can_user_create_proposta"("target_user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."can_user_create_proposta"("target_user_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "service_role";



GRANT ALL ON FUNCTION "public"."rls_auto_enable"() TO "anon";
GRANT ALL ON FUNCTION "public"."rls_auto_enable"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."rls_auto_enable"() TO "service_role";
























GRANT ALL ON TABLE "public"."prices" TO "anon";
GRANT ALL ON TABLE "public"."prices" TO "authenticated";
GRANT ALL ON TABLE "public"."prices" TO "service_role";



GRANT ALL ON TABLE "public"."products" TO "anon";
GRANT ALL ON TABLE "public"."products" TO "authenticated";
GRANT ALL ON TABLE "public"."products" TO "service_role";



GRANT ALL ON TABLE "public"."profiles" TO "anon";
GRANT ALL ON TABLE "public"."profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."profiles" TO "service_role";



GRANT ALL ON TABLE "public"."propostas" TO "anon";
GRANT ALL ON TABLE "public"."propostas" TO "authenticated";
GRANT ALL ON TABLE "public"."propostas" TO "service_role";



GRANT ALL ON TABLE "public"."subscriptions" TO "anon";
GRANT ALL ON TABLE "public"."subscriptions" TO "authenticated";
GRANT ALL ON TABLE "public"."subscriptions" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";



































