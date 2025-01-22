DROP VIEW "public"."team_user_groups";--> statement-breakpoint
CREATE VIEW "public"."team_user_groups" AS (
    SELECT 
      t.name AS team_name,
      COALESCE(json_agg(
        CASE WHEN u.id IS NOT NULL THEN
          json_build_object(
            'first_name', u.first_name,
            'title', u.title
          )
        END
      ), '[]') AS users,
      t.company_id
    FROM teams t
    LEFT JOIN user_teams ut ON t.id = ut.team_id 
    LEFT JOIN users u ON ut.user_id = u.id AND u.company_id = t.company_id
    GROUP BY t.name, t.company_id
  );