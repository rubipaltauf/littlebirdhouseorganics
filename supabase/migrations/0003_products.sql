-- Products catalog table.
-- Admins manage rows; the storefront reads them publicly.

create table if not exists public.products (
  id          uuid        primary key default gen_random_uuid(),
  name        text        not null,
  price       text        not null,        -- display string, e.g. "$28"
  description text        not null,
  details     text        not null default '', -- eyebrow / ingredient note
  sort_order  integer     not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

alter table public.products enable row level security;

-- Anyone (including unauthenticated visitors) can read products.
create policy "products public read" on public.products
  for select using (true);

-- Only admins can insert, update, or delete.
create policy "products admin insert" on public.products
  for insert with check (
    exists (
      select 1 from public.admin_roles
      where admin_roles.user_id = auth.uid()
    )
  );

create policy "products admin update" on public.products
  for update using (
    exists (
      select 1 from public.admin_roles
      where admin_roles.user_id = auth.uid()
    )
  );

create policy "products admin delete" on public.products
  for delete using (
    exists (
      select 1 from public.admin_roles
      where admin_roles.user_id = auth.uid()
    )
  );
