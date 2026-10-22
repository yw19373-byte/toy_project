-- 사용자가 본 표현. 같은 표현은 한 번만 기록한다.
create table public.slang_views (
  user_id uuid not null references auth.users on delete cascade,
  expression text not null,
  first_seen_at timestamptz not null default now(),

  primary key (user_id, expression)
);

-- 퀴즈 답안. 답할 때마다 한 행을 쌓는다.
create table public.quiz_answers (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users on delete cascade,
  expression text not null,
  correct boolean not null,
  answered_at timestamptz not null default now()
);

-- 외래 키 열에는 인덱스를 둔다. 통계는 사용자별로 집계한다.
create index quiz_answers_user_id_idx on public.quiz_answers (user_id);

alter table public.slang_views enable row level security;
alter table public.quiz_answers enable row level security;

-- 기본 권한을 모두 걷어내고 필요한 것만 준다. 수정과 삭제는 열어 두지 않는다.
revoke all on public.slang_views from anon, authenticated;
revoke all on public.quiz_answers from anon, authenticated;

grant select, insert on public.slang_views to authenticated;
grant select, insert on public.quiz_answers to authenticated;

grant select, insert, update, delete on public.slang_views to service_role;
grant select, insert, update, delete on public.quiz_answers to service_role;

create policy "slang_views_select_own" on public.slang_views
  for select
  to authenticated
  using ( (select auth.uid()) = user_id );

create policy "slang_views_insert_own" on public.slang_views
  for insert
  to authenticated
  with check ( (select auth.uid()) = user_id );

create policy "quiz_answers_select_own" on public.quiz_answers
  for select
  to authenticated
  using ( (select auth.uid()) = user_id );

create policy "quiz_answers_insert_own" on public.quiz_answers
  for insert
  to authenticated
  with check ( (select auth.uid()) = user_id );
