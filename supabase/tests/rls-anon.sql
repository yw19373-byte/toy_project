-- 비로그인(anon) 사용자는 profiles를 읽을 수 없다.
-- 기대 결과: permission denied for table profiles 오류
begin;
set local role anon;
select count(*) from public.profiles;
rollback;
