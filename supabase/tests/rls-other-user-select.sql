-- 다른 사용자(존재하지 않는 id)로 조회하면 본인 행이 없으므로 아무것도 보이지 않는다.
-- 기대 결과: visible_rows = 0
begin;
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-000000000000","role":"authenticated"}', true);
select count(*) as visible_rows from public.profiles;
rollback;
