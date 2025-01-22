

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


CREATE SCHEMA IF NOT EXISTS "drizzle";


ALTER SCHEMA "drizzle" OWNER TO "postgres";


CREATE EXTENSION IF NOT EXISTS "pgsodium" WITH SCHEMA "pgsodium";








ALTER SCHEMA "public" OWNER TO "postgres";


CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgjwt" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE TYPE "public"."app_permission" AS ENUM (
    'channels.delete',
    'messages.delete',
    'users.insert',
    'users.select',
    'users.update',
    'users.delete',
    'user_teams.insert',
    'user_teams.select'
);


ALTER TYPE "public"."app_permission" OWNER TO "postgres";


CREATE TYPE "public"."app_role" AS ENUM (
    'admin',
    'moderator'
);


ALTER TYPE "public"."app_role" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."custom_access_token_hook"("event" "jsonb") RETURNS "jsonb"
    LANGUAGE "plpgsql" STABLE
    AS $$
  declare
    claims jsonb;
    user_role public.app_role;
  begin
    -- Fetch the user role in the user_roles table
    select role into user_role from public.user_roles where user_id = (event->>'user_id')::uuid;

    claims := event->'claims';

    if user_role is not null then
      -- Set the claim
      claims := jsonb_set(claims, '{user_role}', to_jsonb(user_role));
    else
      claims := jsonb_set(claims, '{user_role}', 'null');
    end if;

    -- Update the 'claims' object in the original event
    event := jsonb_set(event, '{claims}', claims);

    -- Return the modified or original event
    return event;
  end;
$$;


ALTER FUNCTION "public"."custom_access_token_hook"("event" "jsonb") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."insert_into_ticket_events"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$BEGIN
  -- Subject changed
  IF NEW.subject IS DISTINCT FROM OLD.subject THEN
    INSERT INTO ticket_events (
      id,
      ticket_id,
      event_type,
      old_value,
      new_value,
      triggered_by,
      created_at
    )
    VALUES (
      gen_random_uuid(),
      OLD.id,
      'subject_changed',
      OLD.subject::text,
      NEW.subject::text,
      NULL,  -- or your logic for capturing the current user
      NOW()
    );
  END IF;

  -- Description changed
  IF NEW.description IS DISTINCT FROM OLD.description THEN
    INSERT INTO ticket_events (
      id,
      ticket_id,
      event_type,
      old_value,
      new_value,
      triggered_by,
      created_at
    )
    VALUES (
      gen_random_uuid(),
      OLD.id,
      'description_changed',
      OLD.description::text,
      NEW.description::text,
      NULL,
      NOW()
    );
  END IF;

  -- Status changed
  IF NEW.status IS DISTINCT FROM OLD.status THEN
    INSERT INTO ticket_events (
      id,
      ticket_id,
      event_type,
      old_value,
      new_value,
      triggered_by,
      created_at
    )
    VALUES (
      gen_random_uuid(),
      OLD.id,
      'status_changed',
      OLD.status::text,
      NEW.status::text,
      NULL,
      NOW()
    );
  END IF;

  -- Assigned_to changed
  IF NEW.assigned_to IS DISTINCT FROM OLD.assigned_to THEN
    INSERT INTO ticket_events (
      id,
      ticket_id,
      event_type,
      old_value,
      new_value,
      triggered_by,
      created_at
    )
    VALUES (
      gen_random_uuid(),
      OLD.id,
      'assigned_to_changed',
      OLD.assigned_to::text,
      NEW.assigned_to::text,
      NULL,
      NOW()
    );
  END IF;

  -- Priority changed
  IF NEW.priority IS DISTINCT FROM OLD.priority THEN
    INSERT INTO ticket_events (
      id,
      ticket_id,
      event_type,
      old_value,
      new_value,
      triggered_by,
      created_at
    )
    VALUES (
      gen_random_uuid(),
      OLD.id,
      'priority_changed',
      OLD.priority::text,
      NEW.priority::text,
      NULL,
      NOW()
    );
  END IF;

  -- Topic changed
  IF NEW.topic IS DISTINCT FROM OLD.topic THEN
    INSERT INTO ticket_events (
      id,
      ticket_id,
      event_type,
      old_value,
      new_value,
      triggered_by,
      created_at
    )
    VALUES (
      gen_random_uuid(),
      OLD.id,
      'topic_changed',
      OLD.topic::text,
      NEW.topic::text,
      NULL,
      NOW()
    );
  END IF;

  -- Type changed
  IF NEW.type IS DISTINCT FROM OLD.type THEN
    INSERT INTO ticket_events (
      id,
      ticket_id,
      event_type,
      old_value,
      new_value,
      triggered_by,
      created_at
    )
    VALUES (
      gen_random_uuid(),
      OLD.id,
      'type_changed',
      OLD.type::text,
      NEW.type::text,
      NULL,
      NOW()
    );
  END IF;
  

  RETURN NEW;
END;$$;


ALTER FUNCTION "public"."insert_into_ticket_events"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "drizzle"."__drizzle_migrations" (
    "id" integer NOT NULL,
    "hash" "text" NOT NULL,
    "created_at" bigint
);


ALTER TABLE "drizzle"."__drizzle_migrations" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "drizzle"."__drizzle_migrations_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "drizzle"."__drizzle_migrations_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "drizzle"."__drizzle_migrations_id_seq" OWNED BY "drizzle"."__drizzle_migrations"."id";



CREATE TABLE IF NOT EXISTS "public"."companies" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "domain" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."companies" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."role_permissions" (
    "id" bigint NOT NULL,
    "role" "public"."app_role" NOT NULL,
    "permission" "public"."app_permission" NOT NULL
);


ALTER TABLE "public"."role_permissions" OWNER TO "postgres";


COMMENT ON TABLE "public"."role_permissions" IS 'Application permissions for each role.';



ALTER TABLE "public"."role_permissions" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."role_permissions_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."tags" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "color" character varying(7) NOT NULL,
    "company_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."tags" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."teams" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "company_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."teams" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."ticket_events" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "ticket_id" "uuid" NOT NULL,
    "event_type" character varying(50) NOT NULL,
    "old_value" "text",
    "new_value" "text",
    "triggered_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."ticket_events" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."ticket_messages" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "ticket_id" "uuid" NOT NULL,
    "sender_id" "uuid" NOT NULL,
    "message_type" character varying(50) NOT NULL,
    "body" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."ticket_messages" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."ticket_tags" (
    "ticket_id" "uuid" NOT NULL,
    "tag_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."ticket_tags" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."tickets" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "subject" "text" NOT NULL,
    "description" "text",
    "status" character varying(50) DEFAULT 'open'::character varying NOT NULL,
    "priority" character varying(50) DEFAULT 'medium'::character varying NOT NULL,
    "company_id" "uuid" NOT NULL,
    "created_by" "uuid" NOT NULL,
    "assigned_to" "uuid",
    "topic" "text",
    "type" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."tickets" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_roles" (
    "id" bigint NOT NULL,
    "user_id" "uuid" NOT NULL,
    "role" "public"."app_role" NOT NULL
);


ALTER TABLE "public"."user_roles" OWNER TO "postgres";


COMMENT ON TABLE "public"."user_roles" IS 'Application roles for each user.';



ALTER TABLE "public"."user_roles" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."user_roles_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."user_teams" (
    "user_id" "uuid" NOT NULL,
    "team_id" "uuid" NOT NULL,
    "assigned_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "assigned_by" "uuid"
);


ALTER TABLE "public"."user_teams" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."users" (
    "id" "uuid" NOT NULL,
    "email" "text" NOT NULL,
    "first_name" "text",
    "last_name" "text",
    "role" character varying(50) NOT NULL,
    "company_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."users" OWNER TO "postgres";


ALTER TABLE ONLY "drizzle"."__drizzle_migrations" ALTER COLUMN "id" SET DEFAULT "nextval"('"drizzle"."__drizzle_migrations_id_seq"'::"regclass");



ALTER TABLE ONLY "drizzle"."__drizzle_migrations"
    ADD CONSTRAINT "__drizzle_migrations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."companies"
    ADD CONSTRAINT "companies_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."role_permissions"
    ADD CONSTRAINT "role_permissions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."role_permissions"
    ADD CONSTRAINT "role_permissions_role_permission_key" UNIQUE ("role", "permission");



ALTER TABLE ONLY "public"."tags"
    ADD CONSTRAINT "tags_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."teams"
    ADD CONSTRAINT "teams_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."ticket_events"
    ADD CONSTRAINT "ticket_events_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."ticket_messages"
    ADD CONSTRAINT "ticket_messages_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."ticket_tags"
    ADD CONSTRAINT "ticket_tags_ticket_id_tag_id_pk" PRIMARY KEY ("ticket_id", "tag_id");



ALTER TABLE ONLY "public"."tickets"
    ADD CONSTRAINT "tickets_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_roles"
    ADD CONSTRAINT "user_roles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_roles"
    ADD CONSTRAINT "user_roles_user_id_role_key" UNIQUE ("user_id", "role");



ALTER TABLE ONLY "public"."user_teams"
    ADD CONSTRAINT "user_teams_user_id_team_id_pk" PRIMARY KEY ("user_id", "team_id");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_pkey" PRIMARY KEY ("id");



CREATE INDEX "idx_companies_domain" ON "public"."companies" USING "btree" ("domain");



CREATE INDEX "idx_companies_name" ON "public"."companies" USING "btree" ("name");



CREATE INDEX "idx_tags_company_id" ON "public"."tags" USING "btree" ("company_id");



CREATE INDEX "idx_tags_name" ON "public"."tags" USING "btree" ("name");



CREATE INDEX "idx_teams_company_id" ON "public"."teams" USING "btree" ("company_id");



CREATE INDEX "idx_teams_name" ON "public"."teams" USING "btree" ("name");



CREATE INDEX "idx_ticket_events_event_type" ON "public"."ticket_events" USING "btree" ("event_type");



CREATE INDEX "idx_ticket_events_ticket_id" ON "public"."ticket_events" USING "btree" ("ticket_id");



CREATE INDEX "idx_ticket_events_triggered_by" ON "public"."ticket_events" USING "btree" ("triggered_by");



CREATE INDEX "idx_ticket_messages_sender_id" ON "public"."ticket_messages" USING "btree" ("sender_id");



CREATE INDEX "idx_ticket_messages_ticket_id" ON "public"."ticket_messages" USING "btree" ("ticket_id");



CREATE INDEX "idx_ticket_tags_tag_id" ON "public"."ticket_tags" USING "btree" ("tag_id");



CREATE INDEX "idx_ticket_tags_ticket_id" ON "public"."ticket_tags" USING "btree" ("ticket_id");



CREATE INDEX "idx_tickets_assigned_to" ON "public"."tickets" USING "btree" ("assigned_to");



CREATE INDEX "idx_tickets_company_id" ON "public"."tickets" USING "btree" ("company_id");



CREATE INDEX "idx_tickets_created_by" ON "public"."tickets" USING "btree" ("created_by");



CREATE INDEX "idx_tickets_priority" ON "public"."tickets" USING "btree" ("priority");



CREATE INDEX "idx_tickets_status" ON "public"."tickets" USING "btree" ("status");



CREATE INDEX "idx_user_teams_team_id" ON "public"."user_teams" USING "btree" ("team_id");



CREATE INDEX "idx_user_teams_user_id" ON "public"."user_teams" USING "btree" ("user_id");



CREATE INDEX "idx_users_company_id" ON "public"."users" USING "btree" ("company_id");



CREATE INDEX "idx_users_email" ON "public"."users" USING "btree" ("email");



CREATE INDEX "idx_users_role" ON "public"."users" USING "btree" ("role");



CREATE OR REPLACE TRIGGER "ticket_event" AFTER DELETE OR UPDATE ON "public"."tickets" FOR EACH ROW EXECUTE FUNCTION "public"."insert_into_ticket_events"();



ALTER TABLE ONLY "public"."tags"
    ADD CONSTRAINT "tags_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."teams"
    ADD CONSTRAINT "teams_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."ticket_events"
    ADD CONSTRAINT "ticket_events_ticket_id_tickets_id_fk" FOREIGN KEY ("ticket_id") REFERENCES "public"."tickets"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."ticket_events"
    ADD CONSTRAINT "ticket_events_triggered_by_users_id_fk" FOREIGN KEY ("triggered_by") REFERENCES "public"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."ticket_messages"
    ADD CONSTRAINT "ticket_messages_sender_id_users_id_fk" FOREIGN KEY ("sender_id") REFERENCES "public"."users"("id");



ALTER TABLE ONLY "public"."ticket_messages"
    ADD CONSTRAINT "ticket_messages_ticket_id_tickets_id_fk" FOREIGN KEY ("ticket_id") REFERENCES "public"."tickets"("id");



ALTER TABLE ONLY "public"."ticket_tags"
    ADD CONSTRAINT "ticket_tags_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."ticket_tags"
    ADD CONSTRAINT "ticket_tags_ticket_id_tickets_id_fk" FOREIGN KEY ("ticket_id") REFERENCES "public"."tickets"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."tickets"
    ADD CONSTRAINT "tickets_assigned_to_users_id_fk" FOREIGN KEY ("assigned_to") REFERENCES "public"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."tickets"
    ADD CONSTRAINT "tickets_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."tickets"
    ADD CONSTRAINT "tickets_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."user_roles"
    ADD CONSTRAINT "user_roles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_teams"
    ADD CONSTRAINT "user_teams_assigned_by_users_id_fk" FOREIGN KEY ("assigned_by") REFERENCES "public"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."user_teams"
    ADD CONSTRAINT "user_teams_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_teams"
    ADD CONSTRAINT "user_teams_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE CASCADE;



CREATE POLICY "Allow auth admin to read user roles" ON "public"."user_roles" FOR SELECT TO "supabase_auth_admin" USING (true);



CREATE POLICY "admin_access_test_without_text" ON "public"."users" FOR SELECT TO "authenticated" USING (((("current_setting"('request.jwt.claims'::"text", true))::"jsonb" ->> 'user_role'::"text") = 'admin'::"text"));



CREATE POLICY "admin_access_to_all_users_within_company" ON "public"."users" FOR SELECT TO "authenticated" USING (("auth"."role"() = 'admin'::"text"));



CREATE POLICY "select_users_policy" ON "public"."users" FOR SELECT TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "id"));



ALTER TABLE "public"."users" ENABLE ROW LEVEL SECURITY;


CREATE PUBLICATION "realtime_messages_publication_v2_34_0" WITH (publish = 'insert, update, delete, truncate');



CREATE PUBLICATION "realtime_messages_publication_v2_34_1" WITH (publish = 'insert, update, delete, truncate');





ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";


ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."ticket_events";



ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."ticket_messages";



REVOKE USAGE ON SCHEMA "public" FROM PUBLIC;
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "supabase_auth_admin";




















































































































































































REVOKE ALL ON FUNCTION "public"."custom_access_token_hook"("event" "jsonb") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."custom_access_token_hook"("event" "jsonb") TO "supabase_auth_admin";


















GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "public"."companies" TO "authenticated";



GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "public"."role_permissions" TO "authenticated";



GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "public"."tags" TO "authenticated";



GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "public"."teams" TO "authenticated";



GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "public"."ticket_events" TO "authenticated";



GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "public"."ticket_messages" TO "authenticated";



GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "public"."ticket_tags" TO "authenticated";



GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "public"."tickets" TO "authenticated";



GRANT ALL ON TABLE "public"."user_roles" TO "supabase_auth_admin";



GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "public"."user_teams" TO "authenticated";



GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "public"."users" TO "authenticated";



ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT SELECT,INSERT,DELETE,UPDATE ON TABLES  TO "authenticated";



























RESET ALL;
