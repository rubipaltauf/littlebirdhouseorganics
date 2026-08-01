-- Standalone customers table for admin-managed CRM records.
-- Unlike profiles (which is a 1:1 extension of auth.users), this table
-- has its own generated UUID so admins can create customers who have not
-- signed up through Supabase Auth.

create table if not exists public.customers (
  id               uuid primary key default gen_random_uuid(),
  full_name        text not null default '',
  email            text not null,
  phone            text,
  birthday         date,
  marketing_consent boolean not null default false,
  customer_status  text not null default 'Prospect',
  last_contact     text,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

alter table public.customers enable row level security;

-- Admins can read, insert, update, and delete any customer row.
create policy "customers admin all" on public.customers
  for all
  using (
    exists (select 1 from public.admin_roles where admin_roles.user_id = auth.uid())
  )
  with check (
    exists (select 1 from public.admin_roles where admin_roles.user_id = auth.uid())
  );

-- Re-point customer_notes and customer_tags to the new customers table.
-- (Previously they referenced profiles, which required an auth.users entry.)
alter table public.customer_notes
  drop constraint if exists customer_notes_customer_id_fkey,
  add  constraint customer_notes_customer_id_fkey
       foreign key (customer_id) references public.customers(id) on delete cascade;

alter table public.customer_tags
  drop constraint if exists customer_tags_customer_id_fkey,
  add  constraint customer_tags_customer_id_fkey
       foreign key (customer_id) references public.customers(id) on delete cascade;

-- Also update assigned_to in discount_codes to allow referencing customers.
-- The column is nullable so existing rows are unaffected.
alter table public.discount_codes
  drop constraint if exists discount_codes_assigned_to_fkey;
-- (No FK re-add — assigned_to stays a plain uuid; app-level lookup handles it.)
