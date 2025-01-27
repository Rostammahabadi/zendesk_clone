CREATE POLICY "admin_can_insert_into_users" ON "users" AS PERMISSIVE FOR INSERT TO public;--> statement-breakpoint
CREATE POLICY "enable_update_to_user" ON "users" AS PERMISSIVE FOR UPDATE TO public;