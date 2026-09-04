-- Reflex Delivery MVP — run this entire file in Supabase SQL Editor.
create extension if not exists pgcrypto;

do $$ begin
  create type public.user_role as enum ('retailer','dispatcher','rider');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.delivery_status as enum ('pending','assigned','picked_up','delivered');
exception when duplicate_object then null; end $$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  role public.user_role not null,
  created_at timestamptz not null default now()
);

create table if not exists public.deliveries (
  id uuid primary key default gen_random_uuid(),
  retailer_id uuid not null references public.profiles(id),
  customer_name text not null,
  phone text not null,
  address text not null,
  item text not null,
  status public.delivery_status not null default 'pending',
  rider_id uuid references public.profiles(id),
  proof_scan text,
  confirmation_code uuid not null default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;

drop trigger if exists deliveries_set_updated_at on public.deliveries;
create trigger deliveries_set_updated_at before update on public.deliveries
for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare chosen_role public.user_role;
begin
  chosen_role := coalesce((new.raw_user_meta_data->>'role')::public.user_role, 'retailer'::public.user_role);
  insert into public.profiles(id, full_name, role)
  values(new.id, coalesce(nullif(new.raw_user_meta_data->>'full_name',''), split_part(new.email,'@',1)), chosen_role)
  on conflict (id) do nothing;
  return new;
exception when invalid_text_representation then
  insert into public.profiles(id, full_name, role)
  values(new.id, coalesce(nullif(new.raw_user_meta_data->>'full_name',''), split_part(new.email,'@',1)), 'retailer')
  on conflict (id) do nothing;
  return new;
end; $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
for each row execute function public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.deliveries enable row level security;

-- Profiles: authenticated users may read names/roles so dispatchers can list riders.
drop policy if exists "authenticated can read profiles" on public.profiles;
create policy "authenticated can read profiles" on public.profiles for select to authenticated using (true);


-- Retailers can create deliveries only for themselves.
drop policy if exists "retailers insert own deliveries" on public.deliveries;
create policy "retailers insert own deliveries" on public.deliveries for insert to authenticated
with check (
  retailer_id = auth.uid()
  and exists(select 1 from public.profiles p where p.id=auth.uid() and p.role='retailer')
);

-- Role-scoped reads.
drop policy if exists "role scoped delivery reads" on public.deliveries;
create policy "role scoped delivery reads" on public.deliveries for select to authenticated using (
  retailer_id = auth.uid()
  or rider_id = auth.uid()
  or exists(select 1 from public.profiles p where p.id=auth.uid() and p.role='dispatcher')
);

-- No general UPDATE policy. State changes happen only through validated RPC functions below.

create or replace function public.assign_delivery(p_delivery_id uuid, p_rider_id uuid)
returns public.deliveries
language plpgsql security definer set search_path = public as $$
declare result public.deliveries;
begin
  if not exists(select 1 from public.profiles where id=auth.uid() and role='dispatcher') then
    raise exception 'Only dispatchers can assign deliveries';
  end if;
  if not exists(select 1 from public.profiles where id=p_rider_id and role='rider') then
    raise exception 'Selected user is not a rider';
  end if;
  update public.deliveries set rider_id=p_rider_id, status='assigned'
  where id=p_delivery_id and status='pending'
  returning * into result;
  if result.id is null then raise exception 'Delivery is no longer open or does not exist'; end if;
  return result;
end; $$;

create or replace function public.rider_mark_picked_up(p_delivery_id uuid)
returns public.deliveries
language plpgsql security definer set search_path = public as $$
declare result public.deliveries;
begin
  update public.deliveries set status='picked_up'
  where id=p_delivery_id and rider_id=auth.uid() and status='assigned'
  returning * into result;
  if result.id is null then raise exception 'Delivery must be assigned to you before pickup'; end if;
  return result;
end; $$;

create or replace function public.rider_confirm_delivery(p_delivery_id uuid, p_confirmation_code text)
returns public.deliveries
language plpgsql security definer set search_path = public as $$
declare result public.deliveries;
begin
  update public.deliveries
  set status='delivered', proof_scan='qr-confirmed:' || now()::text
  where id=p_delivery_id
    and rider_id=auth.uid()
    and status='picked_up'
    and confirmation_code::text=p_confirmation_code
  returning * into result;
  if result.id is null then raise exception 'Invalid QR code, wrong rider, or delivery is not ready for confirmation'; end if;
  return result;
end; $$;

grant execute on function public.assign_delivery(uuid,uuid) to authenticated;
grant execute on function public.rider_mark_picked_up(uuid) to authenticated;
grant execute on function public.rider_confirm_delivery(uuid,text) to authenticated;

-- Enable realtime for deliveries (ignore duplicate publication membership errors if already added).
do $$ begin
  alter publication supabase_realtime add table public.deliveries;
exception when duplicate_object then null; end $$;
