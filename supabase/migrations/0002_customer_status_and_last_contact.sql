alter table public.profiles
  add column if not exists customer_status text not null default 'Prospect';

alter table public.profiles
  add column if not exists last_contact text;
