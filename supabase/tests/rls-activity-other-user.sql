-- 다른 사용자(존재하지 않는 id)로 조회하면 본인 기록이 없으므로 아무것도 보이지 않는다.
-- 기대 결과: views = 0, answers = 0
begin;
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-000000000000","role":"authenticated"}', true);
select
  (select count(*) from public.slang_views) as views,
  (select count(*) from public.quiz_answers) as answers;
rollback;
