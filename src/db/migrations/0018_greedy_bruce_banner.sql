ALTER TABLE "role_permissions" ALTER COLUMN "id" SET MAXVALUE 9223372036854776000;--> statement-breakpoint
ALTER TABLE "role_permissions" ALTER COLUMN "permission" SET DATA TYPE varchar(50);