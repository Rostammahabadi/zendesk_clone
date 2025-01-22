import { sql } from 'drizzle-orm';
import type { Migration } from 'drizzle-orm';

export const up: Migration = async (db) => {
  // If all existing data in "permission" matches your app_permission values:
  await db.execute(sql`
    ALTER TABLE "role_permissions"
    ALTER COLUMN "permission"
    TYPE app_permission
    USING permission::app_permission
  `);

  // If you also want NOT NULL, do:
  // ALTER COLUMN "permission" SET NOT NULL;
};

export const down: Migration = async (db) => {
  // Roll back to varchar(50) if needed:
  await db.execute(sql`
    ALTER TABLE "role_permissions"
    ALTER COLUMN "permission"
    TYPE varchar(50)
    USING permission::varchar
  `);
};