-- 비로그인(anon) 사용자는 본 표현과 퀴즈 답안을 읽을 수 없다.
-- 기대 결과: permission denied for table slang_views 오류
begin;
set local role anon;
select count(*) from public.slang_views;
rollback;
