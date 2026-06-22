-- ============================================================================
-- SIMONA — self-service PINs (force PIN change on first login)
--   * profiles.must_change_pin (default true) — new accounts must set their PIN.
--   * Signup trigger sets it true.
--   * clear_must_change_pin(): SECURITY DEFINER so a user can clear ONLY their
--     own flag (RLS forbids client writes to profiles, and we never want a user
--     able to change their own role).
-- Run AFTER 0001–0004. Paste into the Supabase SQL editor.
-- ============================================================================

alter table public.profiles
  add column if not exists must_change_pin boolean not null default true;

-- IMPORTANT: existing real accounts already have a permanent PIN. Exempt them
-- so they aren't forced to reset. Adjust the email list as needed:
update public.profiles set must_change_pin = false
where id in (
  select id from auth.users
  where email in ('admin@simona.local', 'user1@simona.local')
);

-- New signups: create the profile with must_change_pin = true.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, role, display_name, must_change_pin)
  values (
    new.id,
    'user',
    coalesce(new.raw_user_meta_data ->> 'display_name', new.email),
    true
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

-- A user clears ONLY their own must_change_pin flag. Cannot touch role or other
-- users' rows. Called via rpc after they set their new PIN.
create or replace function public.clear_must_change_pin()
returns void
language sql
security definer
set search_path = ''
as $$
  update public.profiles
  set must_change_pin = false
  where id = (select auth.uid());
$$;

grant execute on function public.clear_must_change_pin() to authenticated;

-- ============================================================================
-- End. (auth.updateUser changes only the logged-in user's password / PIN.)
-- ============================================================================
