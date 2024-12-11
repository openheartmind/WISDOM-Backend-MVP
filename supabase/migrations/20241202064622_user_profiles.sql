create table public.user_profiles(
  id uuid not null references auth.users on delete cascade,
  full_name text,
  display_name text,
  phone text,
  dob date,
  primary key (id)
);

alter table public.user_profiles enable row level security;

-- create an entry in user_profiles table every time a user is registered
create or replace function wisdom.trigger_auth_user_created()
  returns trigger
  language plpgsql
  security definer
  set search_path = public
  as $$
declare
  generated_display_name text;
begin
  if new.email is not null then
    generated_display_name := split_part(new.email, '@', 1);
  end if;
  insert into public.user_profiles(id, display_name)
    values (new.id, generated_display_name);
  return new;
end
$$;

create trigger on_auth_user_created
  after insert on auth.users for each row
  execute procedure wisdom.trigger_auth_user_created();

create policy "users can view user_profiles" on public.user_profiles
  for select to authenticated
    using (true);

create policy "users can update their own profiles" on public.user_profiles
  for update to authenticated
    using (id =(
      select
        auth.uid()));

