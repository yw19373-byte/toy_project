-- 사용자별 프로필. 표시 이름 하나만 두고, 본인 행만 읽고 고칠 수 있게 한다.
create table public.profiles (
  id uuid not null references auth.users on delete cascade,
  display_name text check (char_length(display_name) <= 40),

  primary key (id)
);

alter table public.profiles enable row level security;

-- 로그인하지 않은 사용자(anon)에게는 권한을 주지 않는다.
grant select on public.profiles to authenticated;
grant update (display_name) on public.profiles to authenticated;
grant select, insert, update, delete on public.profiles to service_role;

create policy "profiles_select_own" on public.profiles
  for select
  to authenticated
  using ( (select auth.uid()) = id );

create policy "profiles_update_own" on public.profiles
  for update
  to authenticated
  using ( (select auth.uid()) = id )
  with check ( (select auth.uid()) = id );

-- 새 사용자가 만들어지면 프로필 행을 만든다.
create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id)
  values (new.id);
  return new;
end;
$$;

-- security definer 함수가 API로 직접 호출되지 않게 막는다. 트리거 실행에는 영향이 없다.
revoke execute on function public.handle_new_user() from public, anon, authenticated;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 이미 있는 사용자의 프로필 행을 채운다.
insert into public.profiles (id)
select id from auth.users
on conflict (id) do nothing;
