-- Add stock tracking to the products catalog.

alter table public.products
  add column if not exists stock_quantity integer not null default 0;

-- Append-only ledger of every inventory movement.
create table if not exists public.inventory_transactions (
  id          uuid        primary key default gen_random_uuid(),
  product_id  uuid        not null references public.products(id) on delete cascade,
  change      integer     not null,           -- positive = stock added, negative = removed/sold
  reason      text        not null default 'adjustment',
  note        text,
  created_by  uuid        references auth.users(id) on delete set null,
  created_at  timestamptz not null default now()
);

alter table public.inventory_transactions enable row level security;

create policy "inventory admin read" on public.inventory_transactions
  for select using (
    exists (select 1 from public.admin_roles where admin_roles.user_id = auth.uid())
  );

create policy "inventory admin insert" on public.inventory_transactions
  for insert with check (
    exists (select 1 from public.admin_roles where admin_roles.user_id = auth.uid())
  );
