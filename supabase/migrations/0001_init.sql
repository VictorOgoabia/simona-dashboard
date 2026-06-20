-- ============================================================================
-- SIMONA Operations Dashboard — schema + security
-- Roles: 'admin' and 'user'. Both read/write all operational data.
-- Only difference: orders.amount & orders.payment_status (and revenue derived
-- from them) are readable by admin only — enforced in the DB, not just the app.
-- Paste this whole file into the Supabase SQL editor.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. profiles
-- ----------------------------------------------------------------------------
create table if not exists public.profiles (
  id           uuid primary key references auth.users (id) on delete cascade,
  role         text not null default 'user' check (role in ('admin', 'user')),
  display_name text,
  created_at   timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- 2. get_my_role() — role of the current user, for use inside RLS / views.
--    SECURITY DEFINER so it can read profiles regardless of that table's RLS.
-- ----------------------------------------------------------------------------
create or replace function public.get_my_role()
returns text
language sql
stable
security definer
set search_path = ''
as $$
  select role from public.profiles where id = (select auth.uid());
$$;

grant execute on function public.get_my_role() to authenticated;

-- Auto-create a profile (role 'user') whenever a new auth user signs up.
-- Role changes are done by an admin via the dashboard / service role / SQL editor.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, role, display_name)
  values (
    new.id,
    'user',
    coalesce(new.raw_user_meta_data ->> 'display_name', new.email)
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ----------------------------------------------------------------------------
-- 3. clients
-- ----------------------------------------------------------------------------
create table if not exists public.clients (
  id            uuid primary key default gen_random_uuid(),
  first_name    text not null,
  last_name     text not null,
  phone         text,
  email         text,
  location      text,
  tag           text default 'New' check (tag in ('New', 'Active', 'VIP', 'Diaspora')),
  notes         text,
  fit_notes     text,
  uk_size       text,
  height_cm     text,
  bust_in       text,
  waist_in      text,
  hip_in        text,
  high_hip_in   text,
  shoulder_in   text,
  sleeve_in     text,
  back_in       text,
  torso_in      text,
  created_at    timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- 4. orders   (amount & payment_status are the admin-only financial fields)
-- ----------------------------------------------------------------------------
create table if not exists public.orders (
  id             uuid primary key default gen_random_uuid(),
  order_code     text unique,
  client_name    text not null,
  order_type     text,
  item           text not null,
  collection     text,
  amount         numeric,        -- financial — admin only
  payment_status text,           -- financial — admin only
  order_date     date,
  due_date       date,
  status         text default 'Inquiry' check (status in (
                   'Inquiry', 'Confirmed', 'In Production', 'QC',
                   'Ready', 'Dispatched', 'Delivered')),
  assigned_to    text,
  notes          text,
  qc_note        text,
  ops_note       text,
  created_at     timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- 5. tasks
-- ----------------------------------------------------------------------------
create table if not exists public.tasks (
  id          uuid primary key default gen_random_uuid(),
  task        text not null,
  due_date    date,
  pillar      text,
  assigned_to text,
  priority    text default 'Normal' check (priority in ('Normal', 'High', 'Urgent')),
  done        boolean not null default false,
  created_at  timestamptz not null default now()
);

-- ============================================================================
-- 6. Row Level Security
-- ============================================================================
alter table public.profiles enable row level security;
alter table public.clients  enable row level security;
alter table public.orders   enable row level security;
alter table public.tasks    enable row level security;

-- profiles: a user can read only their own row. No client-side writes
-- (inserts happen via the signup trigger; role edits via service role / SQL).
drop policy if exists profiles_select_own on public.profiles;
create policy profiles_select_own on public.profiles
  for select to authenticated
  using (id = (select auth.uid()));

-- clients: full access for any authenticated user.
drop policy if exists clients_all on public.clients;
create policy clients_all on public.clients
  for all to authenticated
  using (true) with check (true);

-- tasks: full access for any authenticated user.
drop policy if exists tasks_all on public.tasks;
create policy tasks_all on public.tasks
  for all to authenticated
  using (true) with check (true);

-- orders: every authenticated user may select / insert / update / delete every
-- row. Column-level visibility of the financial fields is handled in section 7.
drop policy if exists orders_all on public.orders;
create policy orders_all on public.orders
  for all to authenticated
  using (true) with check (true);

-- Belt-and-braces: the anon (logged-out) role gets nothing on operational data.
revoke all on public.profiles, public.clients, public.orders, public.tasks from anon;

-- ============================================================================
-- 7. Financial protection on orders  (the admin-only split)
-- ============================================================================
-- (a) Remove blanket SELECT and re-grant SELECT on every column EXCEPT the two
--     financial ones. Now no API client — admin or user — can read amount /
--     payment_status straight off the base table.
revoke select on public.orders from authenticated;
grant select (
  id, order_code, client_name, order_type, item, collection,
  order_date, due_date, status, assigned_to, notes, qc_note, ops_note, created_at
) on public.orders to authenticated;

-- Writes still go to the base table (insert/update/delete on all columns).
grant insert, update, delete on public.orders to authenticated;

-- (b) The single read source for the app. SECURITY DEFINER (runs as the table
--     owner) so it can read the financial columns, but it only *reveals* them
--     when the caller is an admin; everyone else sees NULL.
drop view if exists public.orders_safe;
create view public.orders_safe
with (security_invoker = false) as
select
  id,
  order_code,
  client_name,
  order_type,
  item,
  collection,
  case when public.get_my_role() = 'admin' then amount end          as amount,
  case when public.get_my_role() = 'admin' then payment_status end  as payment_status,
  order_date,
  due_date,
  status,
  assigned_to,
  notes,
  qc_note,
  ops_note,
  created_at
from public.orders;

grant select on public.orders_safe to authenticated;

-- ============================================================================
-- 8. Seed data (ported from the dashboard mockup)
-- ============================================================================
insert into public.clients
  (first_name, last_name, phone, email, location, tag, notes, fit_notes,
   uk_size, height_cm, bust_in, waist_in, hip_in, high_hip_in, shoulder_in,
   sleeve_in, back_in, torso_in)
values
  ('Adaeze', 'Okafor', '+234 803 111 2222', 'adaeze@email.com', 'Lagos - Lekki',
   'VIP', 'Loves wrap silhouettes. Referred by Tolu.',
   'Extra ease at hips. Narrow shoulders.',
   'UK 12', '163', '37', '29', '41', '37', '14', '22', '15.5', '57'),
  ('Chisom', 'Eze', '+234 807 333 4444', '', 'Abuja',
   'Active', 'Orders for events mostly.', '',
   'UK 14', '', '', '', '', '', '', '', '', ''),
  ('Funke', 'Balogun', '+44 7700 900123', 'funke.b@gmail.com', 'London - Diaspora',
   'Diaspora', 'Ships to UK. Lead time 3 weeks.', 'Petite. Needs hem adjustments.',
   'UK 8', '155', '33', '25', '36', '33', '13', '21', '14', '54');

insert into public.orders
  (order_code, client_name, order_type, item, collection, amount, payment_status,
   order_date, due_date, status, assigned_to, notes, qc_note, ops_note)
values
  ('ORD-001', 'Adaeze Okafor', 'MTM (Made-to-Measure)',
   'Soleil Wrap Dress - Burnt Orange', 'Soleil Collection',
   95000, 'Paid in Full', '2026-05-28', '2026-06-14', 'In Production', 'Jennifer',
   'Check stitching on left seam.', '', ''),
  ('ORD-002', 'Chisom Eze', 'MTM (Made-to-Measure)',
   'Ankara Co-ord Set', 'Ankara Line',
   65000, '50% Deposit', '2026-05-30', '2026-06-20', 'Confirmed', 'Simona',
   'Confirm fabric before cutting.', '', ''),
  ('ORD-003', 'Funke Balogun', 'Pre-Order',
   'Linen Midi Skirt - Warm Sand', 'Soleil Collection',
   48000, 'Paid in Full', '2026-06-01', '2026-06-28', 'In Production', 'Tailor',
   'Ship to UK. DHL Express.', '', ''),
  ('ORD-004', 'Temi Adeyemi', 'MTM (Made-to-Measure)',
   'Custom Evening Gown', 'Custom / Bespoke',
   180000, '50% Deposit', '2026-06-03', '2026-07-02', 'Inquiry', 'Simona',
   'Awaiting design confirmation.', '', ''),
  ('ORD-005', 'Adaeze Okafor', 'MTM (Made-to-Measure)',
   'Simona Man - Linen Set', 'Simona Man',
   55000, 'Paid in Full', '2026-05-20', '2026-06-07', 'QC', 'Jennifer',
   'Check hem and lining.', 'Seam on right sleeve needs pressing.',
   'Client called - expects delivery Sat.');

insert into public.tasks
  (task, due_date, pillar, assigned_to, priority, done)
values
  ('Shoot Ankara pieces for IG content', '2026-06-09', 'Content and Marketing', 'Simona', 'High', false),
  ('Follow up on ORD-002 fabric confirmation', '2026-06-08', 'Client Relations', 'Jennifer', 'Urgent', false),
  ('Update Bumpa product listings - Soleil', '2026-06-10', 'Operations', 'Simona', 'Normal', false),
  ('Send ORD-005 delivery notification', '2026-06-07', 'Client Relations', 'Jennifer', 'High', false),
  ('Review fabric stock for July', '2026-06-12', 'Production', 'Simona', 'Normal', false);

-- ============================================================================
-- End of migration.
-- Note: the Supabase advisor may flag orders_safe as a "Security Definer View".
-- That is intentional here — the view RESTRICTS data (masks financials by role)
-- rather than leaking it, which is exactly what we want.
-- ============================================================================
