-- Create entries in public.users table with exact UUIDs
INSERT INTO public.users (
  id,
  email,
  first_name,
  last_name,
  role,
  company_id,
  created_at,
  updated_at
) VALUES
  -- Rachel Patel
  (
    '7fd51219-da96-4262-9c96-a17ce50c64e6',
    'rachel.patel@company.com',
    'Rachel',
    'Patel',
    'agent',
    'fc4e47ce-e1d8-480d-bc3f-787f46f77b1a',
    NOW(),
    NOW()
  ),
  -- David Kim
  (
    '739090ab-00cb-401e-9d63-d3fa8fab20c1',
    'david.kim@company.com',
    'David',
    'Kim',
    'agent',
    'fc4e47ce-e1d8-480d-bc3f-787f46f77b1a',
    NOW(),
    NOW()
  ),
  -- Emily Taylor
  (
    'e22d39e6-1230-413c-bef4-070707100e44',
    'emily.taylor@company.com',
    'Emily',
    'Taylor',
    'agent',
    'fc4e47ce-e1d8-480d-bc3f-787f46f77b1a',
    NOW(),
    NOW()
  ),
  -- Michael Rodriguez
  (
    '027d8ca7-2cd0-4c98-9d90-fbaf2e1c46a8',
    'michael.rodriguez@company.com',
    'Michael',
    'Rodriguez',
    'agent',
    'fc4e47ce-e1d8-480d-bc3f-787f46f77b1a',
    NOW(),
    NOW()
  ),
  -- Sarah Chen
  (
    'c2b952a7-b333-4f77-bea5-d23e8ddaf4ff',
    'sarah.chen@company.com',
    'Sarah',
    'Chen',
    'agent',
    'fc4e47ce-e1d8-480d-bc3f-787f46f77b1a',
    NOW(),
    NOW()
  ); 