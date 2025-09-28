-- Create admin account for EllarukumFood
-- This script should be run in Supabase SQL Editor

-- 1. First, create the admin user in Supabase Auth (this needs to be done via Supabase dashboard or auth.admin.createUser)
-- Email: admin@ellarukumfood.org
-- Password: EllarukumFood@2024!

-- 2. Insert admin profile (run this after creating the auth user)
INSERT INTO profiles (
    id,
    user_id,
    name,
    email,
    phone,
    role,
    created_at,
    updated_at
) VALUES (
    gen_random_uuid(),
    -- Replace USER_ID with the actual UUID from auth.users table
    'REPLACE_WITH_ADMIN_USER_ID',
    'EllarukumFood Administrator',
    'admin@ellarukumfood.org',
    '+91 9876543210',
    'admin',
    now(),
    now()
) ON CONFLICT (email) DO UPDATE SET
    name = EXCLUDED.name,
    role = EXCLUDED.role,
    updated_at = now();

-- 3. Verify admin account
SELECT * FROM profiles WHERE email = 'admin@ellarukumfood.org';

-- Note: The admin user must be created through Supabase Auth first:
-- 1. Go to Supabase Dashboard > Authentication > Users
-- 2. Click "Add user"
-- 3. Email: admin@ellarukumfood.org
-- 4. Password: EllarukumFood@2024!
-- 5. Then run this SQL script with the user ID