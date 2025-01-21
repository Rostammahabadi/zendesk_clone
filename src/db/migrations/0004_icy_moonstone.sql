ALTER TABLE "tags" DROP CONSTRAINT "tags_name_unique";--> statement-breakpoint
ALTER TABLE "users" DROP CONSTRAINT "users_auth_id_unique";--> statement-breakpoint
ALTER TABLE "users" DROP CONSTRAINT "users_email_unique";--> statement-breakpoint
ALTER TABLE "companies" DROP CONSTRAINT "companies_owner_id_users_user_id_fk";
--> statement-breakpoint
ALTER TABLE "ticket_events" DROP CONSTRAINT "ticket_events_triggered_by_users_user_id_fk";
--> statement-breakpoint
ALTER TABLE "ticket_messages" DROP CONSTRAINT "ticket_messages_sender_id_users_user_id_fk";
--> statement-breakpoint
ALTER TABLE "tickets" DROP CONSTRAINT "tickets_created_by_users_user_id_fk";
--> statement-breakpoint
ALTER TABLE "tickets" DROP CONSTRAINT "tickets_assigned_to_users_user_id_fk";
--> statement-breakpoint
ALTER TABLE "user_teams" DROP CONSTRAINT "user_teams_user_id_users_user_id_fk";
--> statement-breakpoint
ALTER TABLE "user_teams" DROP CONSTRAINT "user_teams_assigned_by_users_user_id_fk";
--> statement-breakpoint
DROP INDEX "companies_domain_idx";--> statement-breakpoint
DROP INDEX "idx_ticket_tags_ticket";--> statement-breakpoint
DROP INDEX "idx_ticket_tags_tag";--> statement-breakpoint
DROP INDEX "idx_users_auth_id";--> statement-breakpoint
DROP INDEX "idx_tickets_custom_fields_gin";--> statement-breakpoint
ALTER TABLE "companies" ALTER COLUMN "name" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "companies" ALTER COLUMN "domain" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "companies" ALTER COLUMN "domain" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "companies" ALTER COLUMN "created_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "companies" ALTER COLUMN "created_at" SET DEFAULT NOW();--> statement-breakpoint
ALTER TABLE "tags" ALTER COLUMN "name" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "tags" ALTER COLUMN "color" SET DATA TYPE varchar(7);--> statement-breakpoint
ALTER TABLE "tags" ALTER COLUMN "color" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "teams" ALTER COLUMN "name" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "tickets" ALTER COLUMN "subject" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "tickets" ALTER COLUMN "custom_fields" SET DEFAULT '{}';--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "email" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "first_name" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "last_name" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "ticket_tags" ADD CONSTRAINT "ticket_tags_ticket_id_tag_id_pk" PRIMARY KEY("ticket_id","tag_id");--> statement-breakpoint
ALTER TABLE "user_teams" ADD CONSTRAINT "user_teams_user_id_team_id_pk" PRIMARY KEY("user_id","team_id");--> statement-breakpoint
ALTER TABLE "companies" ADD COLUMN "updated_at" timestamp with time zone DEFAULT NOW() NOT NULL;--> statement-breakpoint
ALTER TABLE "tags" ADD COLUMN "company_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "teams" ADD COLUMN "company_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "ticket_events" ADD COLUMN "created_at" timestamp with time zone DEFAULT NOW() NOT NULL;--> statement-breakpoint
ALTER TABLE "ticket_tags" ADD COLUMN "created_at" timestamp with time zone DEFAULT NOW() NOT NULL;--> statement-breakpoint
ALTER TABLE "tickets" ADD COLUMN "company_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "tickets" ADD COLUMN "topic" text;--> statement-breakpoint
ALTER TABLE "tickets" ADD COLUMN "type" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "company_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "tags" ADD CONSTRAINT "tags_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "teams" ADD CONSTRAINT "teams_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ticket_events" ADD CONSTRAINT "ticket_events_triggered_by_users_id_fk" FOREIGN KEY ("triggered_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ticket_messages" ADD CONSTRAINT "ticket_messages_sender_id_users_id_fk" FOREIGN KEY ("sender_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_assigned_to_users_id_fk" FOREIGN KEY ("assigned_to") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_teams" ADD CONSTRAINT "user_teams_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_teams" ADD CONSTRAINT "user_teams_assigned_by_users_id_fk" FOREIGN KEY ("assigned_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_companies_name" ON "companies" USING btree ("name");--> statement-breakpoint
CREATE INDEX "idx_companies_domain" ON "companies" USING btree ("domain");--> statement-breakpoint
CREATE INDEX "idx_tags_name" ON "tags" USING btree ("name");--> statement-breakpoint
CREATE INDEX "idx_tags_company_id" ON "tags" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "idx_teams_company_id" ON "teams" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "idx_ticket_tags_ticket_id" ON "ticket_tags" USING btree ("ticket_id");--> statement-breakpoint
CREATE INDEX "idx_ticket_tags_tag_id" ON "ticket_tags" USING btree ("tag_id");--> statement-breakpoint
CREATE INDEX "idx_tickets_company_id" ON "tickets" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "idx_users_company_id" ON "users" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "idx_tickets_custom_fields_gin" ON "tickets" USING btree (("custom_fields") using gin);--> statement-breakpoint
ALTER TABLE "companies" DROP COLUMN "owner_id";--> statement-breakpoint
ALTER TABLE "ticket_events" DROP COLUMN "event_timestamp";--> statement-breakpoint
ALTER TABLE "tickets" DROP COLUMN "last_activity_at";--> statement-breakpoint
ALTER TABLE "user_teams" DROP COLUMN "id";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "user_id";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "auth_id";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "status";