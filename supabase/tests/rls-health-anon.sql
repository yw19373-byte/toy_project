-- 비로그인(anon) 사용자는 건강 기록 테이블을 읽을 수 없다.
-- 기대 결과: permission denied for table health_views 오류
begin;
set local role anon;
select count(*) from public.health_views;
rollback;
