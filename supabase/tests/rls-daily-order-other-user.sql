-- 다른 사용자의 하루 순서는 읽을 수 없고, 다른 사용자의 id로 끼워 넣을 수도 없다.
-- 기대 결과: visible_rows = 0 (조회), 아래 insert는 row-level security policy 위반 오류
begin;
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-000000000000","role":"authenticated"}', true);
select count(*) as visible_rows from public.daily_slang_order;
insert into public.daily_slang_order (user_id, day, expressions)
values ('11111111-1111-1111-1111-111111111111', '2026-10-22', array['tea']);
rollback;
