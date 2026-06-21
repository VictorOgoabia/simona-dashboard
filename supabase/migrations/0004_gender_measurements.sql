-- ============================================================================
-- SIMONA — gender + gender-specific measurement field sets (NON-DESTRUCTIVE)
--   * Adds `gender` + the new measurement columns to clients AND orders.
--   * KEEPS the old generic columns (bust_in, waist_in, hip_in, high_hip_in,
--     shoulder_in, sleeve_in, back_in, torso_in) so NO data is lost.
--   * Best-effort maps old -> new; anything without a clean home is preserved
--     in fit_notes as a [Legacy] line.
-- Run AFTER 0001/0002/0003. Paste into the Supabase SQL editor.
-- ============================================================================

-- New measurement columns (text, free-form, nullable). Union of Man + Woman sets.
-- Man:   shoulder, sleeve_length, sleeve_width, chest, tummy, waist, hip, thigh,
--        pants_length, calf, shirt_length
-- Woman: bust, waist, hip, shoulder, sleeve_length, sleeve_width, pants_length,
--        short_dress_length, long_dress_length, skirt_length

-- 1. clients --------------------------------------------------------------
alter table public.clients add column if not exists gender text;
alter table public.clients add column if not exists shoulder text;
alter table public.clients add column if not exists sleeve_length text;
alter table public.clients add column if not exists sleeve_width text;
alter table public.clients add column if not exists chest text;
alter table public.clients add column if not exists tummy text;
alter table public.clients add column if not exists waist text;
alter table public.clients add column if not exists hip text;
alter table public.clients add column if not exists thigh text;
alter table public.clients add column if not exists pants_length text;
alter table public.clients add column if not exists calf text;
alter table public.clients add column if not exists shirt_length text;
alter table public.clients add column if not exists bust text;
alter table public.clients add column if not exists short_dress_length text;
alter table public.clients add column if not exists long_dress_length text;
alter table public.clients add column if not exists skirt_length text;

-- 2. orders (per-order measurements + gender) -----------------------------
alter table public.orders add column if not exists gender text;
alter table public.orders add column if not exists shoulder text;
alter table public.orders add column if not exists sleeve_length text;
alter table public.orders add column if not exists sleeve_width text;
alter table public.orders add column if not exists chest text;
alter table public.orders add column if not exists tummy text;
alter table public.orders add column if not exists waist text;
alter table public.orders add column if not exists hip text;
alter table public.orders add column if not exists thigh text;
alter table public.orders add column if not exists pants_length text;
alter table public.orders add column if not exists calf text;
alter table public.orders add column if not exists shirt_length text;
alter table public.orders add column if not exists bust text;
alter table public.orders add column if not exists short_dress_length text;
alter table public.orders add column if not exists long_dress_length text;
alter table public.orders add column if not exists skirt_length text;

-- 3. Best-effort map of old generic -> new fields (only fills empty new cols).
--    bust_in -> BOTH bust (woman) and chest (man) so the value shows whichever
--    gender is later selected. sleeve_in -> sleeve_length.
update public.clients set
  shoulder      = coalesce(nullif(shoulder, ''),      nullif(shoulder_in, '')),
  waist         = coalesce(nullif(waist, ''),         nullif(waist_in, '')),
  hip           = coalesce(nullif(hip, ''),           nullif(hip_in, '')),
  bust          = coalesce(nullif(bust, ''),          nullif(bust_in, '')),
  chest         = coalesce(nullif(chest, ''),         nullif(bust_in, '')),
  sleeve_length = coalesce(nullif(sleeve_length, ''), nullif(sleeve_in, ''));

-- 4. Preserve old values that have no clean new home (+ keep any existing
--    fit_notes) as a [Legacy] line so nothing is lost and it stays visible.
update public.clients
set fit_notes = btrim(
  coalesce(fit_notes, '') ||
  case
    when coalesce(high_hip_in, '') <> ''
      or coalesce(back_in, '') <> ''
      or coalesce(torso_in, '') <> ''
    then E'\n[Legacy measurements] ' || concat_ws(', ',
           nullif('High hip: ' || high_hip_in, 'High hip: '),
           nullif('Back: '     || back_in,     'Back: '),
           nullif('Torso: '    || torso_in,    'Torso: '))
    else ''
  end
)
where coalesce(high_hip_in, '') <> ''
   or coalesce(back_in, '') <> ''
   or coalesce(torso_in, '') <> '';

-- 5. Backfill existing orders' measurements + gender from their linked client.
update public.orders o set
  gender             = coalesce(o.gender, c.gender),
  shoulder           = coalesce(nullif(o.shoulder, ''),           c.shoulder),
  sleeve_length      = coalesce(nullif(o.sleeve_length, ''),      c.sleeve_length),
  sleeve_width       = coalesce(nullif(o.sleeve_width, ''),       c.sleeve_width),
  chest              = coalesce(nullif(o.chest, ''),              c.chest),
  tummy              = coalesce(nullif(o.tummy, ''),              c.tummy),
  waist              = coalesce(nullif(o.waist, ''),              c.waist),
  hip                = coalesce(nullif(o.hip, ''),                c.hip),
  thigh              = coalesce(nullif(o.thigh, ''),              c.thigh),
  pants_length       = coalesce(nullif(o.pants_length, ''),       c.pants_length),
  calf               = coalesce(nullif(o.calf, ''),               c.calf),
  shirt_length       = coalesce(nullif(o.shirt_length, ''),       c.shirt_length),
  bust               = coalesce(nullif(o.bust, ''),               c.bust),
  short_dress_length = coalesce(nullif(o.short_dress_length, ''), c.short_dress_length),
  long_dress_length  = coalesce(nullif(o.long_dress_length, ''),  c.long_dress_length),
  skirt_length       = coalesce(nullif(o.skirt_length, ''),       c.skirt_length)
from public.clients c
where o.client_id = c.id;

-- 6. orders_safe: pass gender + per-order measurements through (appended at end;
--    financial masking on amount/payment_status unchanged).
create or replace view public.orders_safe
with (security_invoker = false) as
select
  id, order_code, client_name, order_type, item, collection,
  case when public.get_my_role() = 'admin' then amount end          as amount,
  case when public.get_my_role() = 'admin' then payment_status end  as payment_status,
  order_date, due_date, status, assigned_to, notes, qc_note, ops_note, created_at, client_id,
  gender, shoulder, sleeve_length, sleeve_width, chest, tummy, waist, hip, thigh,
  pants_length, calf, shirt_length, bust, short_dress_length, long_dress_length, skirt_length
from public.orders;

-- ============================================================================
-- Note on gender for existing clients: left NULL (not guessed from names). An
-- admin sets it via Edit Client; the detail page shows a prompt until then.
-- ============================================================================
