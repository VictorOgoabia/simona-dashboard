-- ============================================================================
-- SIMONA — link orders to a real client record
--   orders.client_id (uuid FK -> clients.id) becomes the real link.
--   orders.client_name is kept for display / backwards-compat.
-- Paste into the Supabase SQL editor and run once.
-- ============================================================================

-- 1. Add the nullable FK (nullable so existing rows don't break).
alter table public.orders
  add column if not exists client_id uuid references public.clients (id) on delete set null;

-- 2. Best-effort backfill: match existing orders to a client by full name.
update public.orders o
set client_id = c.id
from public.clients c
where o.client_id is null
  and o.client_name = (c.first_name || ' ' || c.last_name);

-- 3. Index the new link.
create index if not exists idx_orders_client_id on public.orders (client_id);

-- 4. Pass client_id through orders_safe (appended at the end of the column list
--    so CREATE OR REPLACE is allowed). Financial masking is unchanged.
create or replace view public.orders_safe
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
  created_at,
  client_id
from public.orders;

-- ============================================================================
-- End of migration. (Existing grants on orders_safe are preserved by REPLACE.)
-- ============================================================================
