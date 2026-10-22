-- 건강 정보용 기록 테이블. 영어 표현(slang_views, quiz_answers, daily_slang_order)과 같은 모양이고 서로 섞이지 않게 따로 둔다.

-- 사용자가 본 건강 항목. 같은 항목은 한 번만 기록한다.
create table public.health_views (
  user_id uuid not null references auth.users on delete cascade,
  expression text not null,
  first_seen_at timestamptz not null default now(),

  primary key (user_id, expression)
);

-- 건강 퀴즈 답안. 답할 때마다 한 행을 쌓는다.
create table public.health_quiz_answers (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users on delete cascade,
  expression text not null,
  correct boolean not null,
  answered_at timestamptz not null default now()
);

-- 외래 키 열에는 인덱스를 둔다. 통계는 사용자별로 집계한다.
create index health_quiz_answers_user_id_idx on public.health_quiz_answers (user_id);

-- 사용자가 그날 처음 열 때 정해 저장하는 건강 하루 순서.
create table public.daily_health_order (
  user_id uuid not null references auth.users on delete cascade,
  day date not null,
  expressions text[] not null,

  primary key (user_id, day)
);

alter table public.health_views enable row level security;
alter table public.health_quiz_answers enable row level security;
alter table public.daily_health_order enable row level security;

-- 기본 권한을 모두 걷어내고 필요한 것만 준다. 수정과 삭제는 열어 두지 않는다.
revoke all on public.health_views from anon, authenticated;
revoke all on public.health_quiz_answers from anon, authenticated;
revoke all on public.daily_health_order from anon, authenticated;

grant select, insert on public.health_views to authenticated;
grant select, insert on public.health_quiz_answers to authenticated;
grant select, insert on public.daily_health_order to authenticated;

grant select, insert, update, delete on public.health_views to service_role;
grant select, insert, update, delete on public.health_quiz_answers to service_role;
grant select, insert, update, delete on public.daily_health_order to service_role;

create policy "health_views_select_own" on public.health_views
  for select
  to authenticated
  using ( (select auth.uid()) = user_id );

create policy "health_views_insert_own" on public.health_views
  for insert
  to authenticated
  with check ( (select auth.uid()) = user_id );

create policy "health_quiz_answers_select_own" on public.health_quiz_answers
  for select
  to authenticated
  using ( (select auth.uid()) = user_id );

create policy "health_quiz_answers_insert_own" on public.health_quiz_answers
  for insert
  to authenticated
  with check ( (select auth.uid()) = user_id );

create policy "daily_health_order_select_own" on public.daily_health_order
  for select
  to authenticated
  using ( (select auth.uid()) = user_id );

create policy "daily_health_order_insert_own" on public.daily_health_order
  for insert
  to authenticated
  with check ( (select auth.uid()) = user_id );
