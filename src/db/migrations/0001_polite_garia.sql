ALTER TABLE "ticket_messages" ALTER COLUMN "message_id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "ticket_messages" ALTER COLUMN "message_id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "ticket_messages" ALTER COLUMN "ticket_id" SET DATA TYPE uuid;