
WITH new_auth_users AS (
  SELECT id, email 
  FROM auth.users 
  WHERE email IN (
    'sarah.chen@company.com',
    'michael.rodriguez@company.com',
    'emily.taylor@company.com',
    'david.kim@company.com',
    'rachel.patel@company.com'
  )
)
INSERT INTO public.users (
  id,
  email,
  first_name,
  last_name,
  role,
  company_id,
  created_at,
  updated_at
)
SELECT
  auth.id,
  auth.email,
  CASE 
    WHEN auth.email LIKE 'sarah.chen%' THEN 'Sarah'
    WHEN auth.email LIKE 'michael.rodriguez%' THEN 'Michael'
    WHEN auth.email LIKE 'emily.taylor%' THEN 'Emily'
    WHEN auth.email LIKE 'david.kim%' THEN 'David'
    WHEN auth.email LIKE 'rachel.patel%' THEN 'Rachel'
  END as first_name,
  CASE 
    WHEN auth.email LIKE 'sarah.chen%' THEN 'Chen'
    WHEN auth.email LIKE 'michael.rodriguez%' THEN 'Rodriguez'
    WHEN auth.email LIKE 'emily.taylor%' THEN 'Taylor'
    WHEN auth.email LIKE 'david.kim%' THEN 'Kim'
    WHEN auth.email LIKE 'rachel.patel%' THEN 'Patel'
  END as last_name,
  'agent' as role,
  'fc4e47ce-e1d8-480d-bc3f-787f46f77b1a' as company_id,
  NOW() as created_at,
  NOW() as updated_at
FROM new_auth_users auth;