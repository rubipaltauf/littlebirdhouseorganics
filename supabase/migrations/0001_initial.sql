create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  email text not null unique,
  phone text,
  birthday date,
  marketing_consent boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.admin_roles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'admin',
  created_at timestamptz not null default now()
);

create table if not exists public.customer_notes (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.profiles(id) on delete cascade,
  note text not null,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.customer_tags (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.profiles(id) on delete cascade,
  tag text not null,
  created_at timestamptz not null default now(),
  unique (customer_id, tag)
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references public.profiles(id) on delete set null,
  stripe_session_id text unique,
  amount_cents integer not null default 0,
  currency text not null default 'usd',
  status text not null default 'pending',
  created_at timestamptz not null default now()
);

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references auth.users(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.admin_roles enable row level security;
alter table public.customer_notes enable row level security;
alter table public.customer_tags enable row level security;
alter table public.orders enable row level security;
alter table public.audit_logs enable row level security;

create policy "profiles read own profile" on public.profiles
  for select using (auth.uid() = id);

create policy "profiles read admin" on public.profiles
  for select using (
    exists (
      select 1 from public.admin_roles
      where admin_roles.user_id = auth.uid()
    )
  );

create policy "profiles insert own profile" on public.profiles
  for insert with check (auth.uid() = id);

create policy "profiles update own profile" on public.profiles
  for update using (auth.uid() = id);

create policy "profiles update admin" on public.profiles
  for update using (
    exists (
      select 1 from public.admin_roles
      where admin_roles.user_id = auth.uid()
    )
  );

create policy "admin roles read own role" on public.admin_roles
  for select using (auth.uid() = user_id);

create policy "customer notes admin read" on public.customer_notes
  for select using (
    exists (
      select 1 from public.admin_roles
      where admin_roles.user_id = auth.uid()
    )
  );

create policy "customer notes admin write" on public.customer_notes
  for insert with check (
    exists (
      select 1 from public.admin_roles
      where admin_roles.user_id = auth.uid()
    )
  );

create policy "customer notes admin update" on public.customer_notes
  for update using (
    exists (
      select 1 from public.admin_roles
      where admin_roles.user_id = auth.uid()
    )
  );

create policy "customer notes admin delete" on public.customer_notes
  for delete using (
    exists (
      select 1 from public.admin_roles
      where admin_roles.user_id = auth.uid()
    )
  );

create policy "customer tags admin read" on public.customer_tags
  for select using (
    exists (
      select 1 from public.admin_roles
      where admin_roles.user_id = auth.uid()
    )
  );

create policy "customer tags admin write" on public.customer_tags
  for insert with check (
    exists (
      select 1 from public.admin_roles
      where admin_roles.user_id = auth.uid()
    )
  );

create policy "customer tags admin update" on public.customer_tags
  for update using (
    exists (
      select 1 from public.admin_roles
      where admin_roles.user_id = auth.uid()
    )
  );

create policy "customer tags admin delete" on public.customer_tags
  for delete using (
    exists (
      select 1 from public.admin_roles
      where admin_roles.user_id = auth.uid()
    )
  );

create policy "orders read own" on public.orders
  for select using (customer_id = auth.uid());

create policy "orders read admin" on public.orders
  for select using (
    exists (
      select 1 from public.admin_roles
      where admin_roles.user_id = auth.uid()
    )
  );

create policy "audit logs admin read" on public.audit_logs
  for select using (
    exists (
      select 1 from public.admin_roles
      where admin_roles.user_id = auth.uid()
    )
  );
