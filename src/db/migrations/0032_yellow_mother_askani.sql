ALTER POLICY "Allow auth admin to read user roles" ON "user_roles" RENAME TO "any_authenticated_user";--> statement-breakpoint
CREATE POLICY "insert_user_roles" ON "user_roles" AS PERMISSIVE FOR INSERT TO "anon";--> statement-breakpoint
CREATE POLICY "Allow all users to insert into user_roles" ON "user_roles" AS PERMISSIVE FOR INSERT TO "anon", "authenticated";--> statement-breakpoint
CREATE POLICY "any_authenticated_user_can_add_self" ON "users" AS PERMISSIVE FOR INSERT TO "authenticated";--> statement-breakpoint
CREATE POLICY "Enable update for users based on email" ON "users" AS PERMISSIVE FOR UPDATE TO public;--> statement-breakpoint
CREATE POLICY "Enable read access for all users" ON "users" AS PERMISSIVE FOR SELECT TO public;--> statement-breakpoint
CREATE POLICY "users_can_update_their_own_information" ON "users" AS PERMISSIVE FOR UPDATE TO "authenticated";--> statement-breakpoint
CREATE POLICY "check_agent_role" ON "users" AS PERMISSIVE FOR INSERT TO "authenticated";