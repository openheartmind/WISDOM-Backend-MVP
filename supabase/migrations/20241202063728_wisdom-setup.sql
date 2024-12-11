-- revoke execution of functions by default from public
alter default privileges revoke execute on functions from public;

alter default privileges in schema public revoke execute on functions from anon, authenticated;


/**
 * Private schema for internal wisdom objects
 */
create schema if not exists wisdom;

-- open up access
grant usage on schema wisdom to authenticated, service_role;


/**
 * Utilities
 */
-- automatic management of created_at and created_by fields
create or replace function wisdom.trigger_set_created()
  returns trigger
  as $$
begin
  new.created_at = now();
  new.created_by = auth.uid();
  return new;
end
$$
language plpgsql;

-- automatic management of updated_at and updated_by fields
create or replace function wisdom.trigger_set_updated()
  returns trigger
  as $$
begin
  new.updated_at = now();
  new.updated_by = auth.uid();
  return new;
end
$$
language plpgsql;

