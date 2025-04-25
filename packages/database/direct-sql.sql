-- Direct SQL insert to create a test user
INSERT INTO users (
  username, 
  password_hash, 
  role_id, 
  tfa_enabled, 
  first_login, 
  is_active, 
  created_at, 
  updated_at
) 
VALUES (
  'direct_sql_user', 
  '$2b$10$abcdefghijklmnopqrstuv', -- Fake hash 
  10, -- ADMIN role 
  false, 
  true, 
  true, 
  NOW(), 
  NOW()
); 