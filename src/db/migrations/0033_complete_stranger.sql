CREATE TABLE "agent_ticket_stats" (
	"agent_id" uuid NOT NULL,
	"stats_date" date NOT NULL,
	"open_count" integer DEFAULT 0 NOT NULL,
	"resolved_count" integer DEFAULT 0 NOT NULL,
	"pending_count" integer DEFAULT 0 NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "agent_ticket_stats_agent_id_stats_date_pk" PRIMARY KEY("agent_id","stats_date")
);
--> statement-breakpoint
CREATE TABLE "faqs" (
	"id" serial PRIMARY KEY NOT NULL,
	"category" varchar(255),
	"question" text NOT NULL,
	"answer" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"published" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
ALTER TABLE "agent_ticket_stats" ADD CONSTRAINT "agent_ticket_stats_agent_id_users_id_fk" FOREIGN KEY ("agent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_agent_ticket_stats_agent_id" ON "agent_ticket_stats" USING btree ("agent_id");--> statement-breakpoint
CREATE INDEX "idx_agent_ticket_stats_stats_date" ON "agent_ticket_stats" USING btree ("stats_date");