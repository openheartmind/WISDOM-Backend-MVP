create type public.instance_role as enum(
  'manager',
  'meta-reviewer',
  'reviewer'
);

create table public.instances(
  id uuid unique not null default extensions.uuid_generate_v4(),
  title text,
  description text,
  created_at timestamp with time zone,
  -- todo: should instances disappear if their creator is deleted?
  created_by uuid references public.user_profiles on delete set null,
  primary key (id)
);

alter table public.instances enable row level security;

-- membership
create table public.instance_members(
  instance_id uuid references public.instances on delete cascade not null,
  member_id uuid references public.user_profiles on delete cascade not null,
  member_role public.instance_role not null,
  -- member has single role in instance
  primary key (instance_id, member_id)
);

alter table public.instance_members enable row level security;

-- allows authenticated users to insert a new row in the instances and instance_members tables
create or replace function public.create_instance(title text, description text default null)
  returns public.instances
  language plpgsql
  security definer
  set search_path = public
  as $$
declare
  new_instance public.instances;
  creator_id uuid;
begin
  creator_id := auth.uid();
  insert into public.instances(title, description, created_at, created_by)
    values (create_instance.title, create_instance.description, now(), creator_id)
  returning
    * into new_instance;
  if creator_id is not null then
    -- when an instance is created, we add the current user to the instance with role `manager`
    insert into public.instance_members(instance_id, member_id, member_role)
      values (new_instance.id, creator_id, 'manager');
  end if;
  return new_instance;
end;
$$;

grant execute on function public.create_instance(text, text) to authenticated;


/**
 * Returns true if the current user has the pass in role on the passed in instance
 * If no role is sent, will return true if the user is a member of the instance.
 */
create or replace function wisdom.user_has_role_on_instance(instance_id uuid, member_role public.instance_role default null)
  returns boolean
  language sql
  security definer
  set search_path = public
  as $$
  select
    exists(
      select
        1
      from
        public.instance_members im
      where
        im.member_id = auth.uid()
        and im.instance_id = user_has_role_on_instance.instance_id
        and(im.member_role = user_has_role_on_instance.member_role
          or user_has_role_on_instance.member_role is null));
$$;

grant execute on function wisdom.user_has_role_on_instance(uuid, public.instance_role) to authenticated;

create policy "users can view all instances" on public.instances
  for select to authenticated
    using (true);

-- todo: what is the best way to restrict updating to specific fields (title, description)?
-- 1. add a `with check` clause to the policy
-- 2. use a trigger on update to check the fields
-- 3. use a function to control how and which data is updated
create policy "managers can update instances" on public.instances
  for update to authenticated
    using (true =(
      select
        wisdom.user_has_role_on_instance(id, 'manager')));

create policy "users can view their instance memberships" on public.instance_members
  for select to authenticated
    using (member_id =(
      select
        auth.uid()));

create policy "users can view their teammates" on public.instance_members
  for select to authenticated
    using (true =(
      select
        wisdom.user_has_role_on_instance(instance_id)));

create policy "managers can delete other instance members" on public.instance_members
  for delete to authenticated
    using (member_id !=(
      select
        auth.uid())
        and true =(
          select
            wisdom.user_has_role_on_instance(instance_id, 'manager')));

