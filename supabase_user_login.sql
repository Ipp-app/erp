-- Supabase Auth Table: users (custom profile)
-- This table is for storing additional user profile data, not for authentication itself (Supabase uses auth.users for auth)

create table public.user_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username varchar(50) unique not null,
  first_name varchar(100),
  last_name varchar(100),
  department varchar(100),
  position varchar(100),
  phone varchar(20),
  is_active boolean default true,
  last_login timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  profile_picture_url text
);

-- Index for quick lookup
create index idx_user_profiles_username on public.user_profiles(username);

-- Example: Insert a user profile after signup (use Supabase triggers or client code)
-- insert into public.user_profiles (id, username, first_name, last_name) values ('<user-uuid>', 'johndoe', 'John', 'Doe');

-- You can extend this table as needed for your ERP app.

-- Contoh data user login (pastikan UUID sesuai dengan user di auth.users Supabase Anda)
insert into public.user_profiles (
  id, username, first_name, last_name, department, position, phone, is_active, last_login, profile_picture_url
) values
  ('00000000-0000-0000-0000-000000000001', 'admin', 'Super', 'Admin', 'IT', 'Administrator', '+628123456789', true, now(), 'https://ui-avatars.com/api/?name=Super+Admin'),
  ('00000000-0000-0000-0000-000000000002', 'operator1', 'Budi', 'Operator', 'Produksi', 'Operator Mesin', '+628111111111', true, now(), 'https://ui-avatars.com/api/?name=Budi+Operator'),
  ('00000000-0000-0000-0000-000000000003', 'quality1', 'Sari', 'Quality', 'QC', 'Quality Inspector', '+628122222222', true, now(), 'https://ui-avatars.com/api/?name=Sari+Quality');

-- Pastikan UUID di atas sudah ada di tabel auth.users Supabase Anda.
