-- Discount codes for promotions, birthday rewards, and manual sends.

create table if not exists public.discount_codes (
  id            uuid        primary key default gen_random_uuid(),
  code          text        not null unique,
  type          text        not null default 'percent'  check (type in ('percent', 'fixed')),
  value         numeric(8,2) not null,                   -- 20 = 20 % off  or  $5.00 off
  min_order     numeric(8,2) not null default 0,         -- minimum cart total to apply
  max_uses      integer,                                  -- null = unlimited
  uses_count    integer      not null default 0,
  expires_at    timestamptz,                              -- null = never expires
  is_active     boolean      not null default true,
  trigger_type  text         not null default 'manual'   check (trigger_type in ('manual', 'birthday')),
  assigned_to   uuid         references auth.users(id) on delete set null,  -- null = any user
  created_by    uuid         references auth.users(id) on delete set null,
  created_at    timestamptz  not null default now()
);

alter table public.discount_codes enable row level security;

-- Admins have full access.
create policy "discount codes admin all" on public.discount_codes
  using (
    exists (select 1 from public.admin_roles where admin_roles.user_id = auth.uid())
  )
  with check (
    exists (select 1 from public.admin_roles where admin_roles.user_id = auth.uid())
  );

-- Any visitor can look up a code by its value (needed for cart validation).
-- Only active, non-expired, under-max-uses codes are visible.
create policy "discount codes public validate" on public.discount_codes
  for select
  using (
    is_active = true
    and (expires_at is null or expires_at > now())
    and (max_uses is null or uses_count < max_uses)
  );

-- Increment uses_count when a code is redeemed at checkout (admin only for now;
-- wire to a server-side function when real checkout is added).
create policy "discount codes admin update uses" on public.discount_codes
  for update
  using (
    exists (select 1 from public.admin_roles where admin_roles.user_id = auth.uid())
  );
