-- Criar um usuário admin inicial
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  'admin-id-123',
  'authenticated',
  'authenticated',
  'admin@example.com',
  crypt('admin123', gen_salt('bf')),
  now(),
  '{"provider": "email", "providers": ["email"]}',
  '{"full_name": "Admin User"}',
  now(),
  now(),
  '',
  '',
  '',
  ''
) ON CONFLICT DO NOTHING;

-- Inserir perfil de admin
INSERT INTO public.user_profiles (
  id,
  email,
  full_name,
  is_admin
) VALUES (
  'admin-id-123',
  'admin@example.com',
  'Admin User',
  true
) ON CONFLICT DO NOTHING; 