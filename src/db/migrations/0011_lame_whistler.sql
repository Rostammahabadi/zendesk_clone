CREATE VIEW "public"."team_user_groups" AS (
    SELECT
      t.name AS team_name,
      array_agg(u.first_name) AS user_first_names
    FROM user_teams ut
    JOIN users u ON ut.user_id = u.id
    JOIN teams t ON ut.team_id = t.id
    WHERE u.company_id = t.company_id
    GROUP BY t.name
  );