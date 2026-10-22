-- 다른 사용자의 id로 답안을 끼워 넣을 수 없다.
-- 기대 결과: new row violates row-level security policy for table "quiz_answers" 오류
begin;
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-000000000000","role":"authenticated"}', true);
insert into public.quiz_answers (user_id, expression, correct)
values ('11111111-1111-1111-1111-111111111111', 'tea', true);
rollback;
