create or replace function public.update_instance_member_role(target_instance_id uuid, target_member_id uuid, new_member_role public.instance_role)
  returns void
  security definer
  set search_path = public
  language plpgsql
  as $$
begin
  if not wisdom.user_has_role_on_instance(target_instance_id, 'manager') then
    raise exception 'You do not have permission to perform this action';
  end if;
  if target_member_id = auth.uid() then
    raise exception 'You can not manage your own role';
  end if;
  update
    public.instance_members
  set
    member_role = new_member_role
  where
    member_id = target_member_id
    and instance_id = target_instance_id;
end
$$;

grant execute on function public.update_instance_member_role(uuid, uuid, public.instance_role) to authenticated;

