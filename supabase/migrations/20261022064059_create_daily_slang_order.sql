-- 사용자가 그날 처음 열 때 정해 저장하는 하루 순서. 하루 동안 바뀌지 않게 한다.
create table public.daily_slang_order (
  user_id uuid not null references auth.users on delete cascade,
  day date not null,
  expressions text[] not null,

  primary key (user_id, day)
);

alter table public.daily_slang_order enable row level security;

-- 기본 권한을 모두 걷어내고 필요한 것만 준다. 수정과 삭제는 열어 두지 않는다.
revoke all on public.daily_slang_order from anon, authenticated;

grant select, insert on public.daily_slang_order to authenticated;
grant select, insert, update, delete on public.daily_slang_order to service_role;

create policy "daily_slang_order_select_own" on public.daily_slang_order
  for select
  to authenticated
  using ( (select auth.uid()) = user_id );

create policy "daily_slang_order_insert_own" on public.daily_slang_order
  for insert
  to authenticated
  with check ( (select auth.uid()) = user_id );
