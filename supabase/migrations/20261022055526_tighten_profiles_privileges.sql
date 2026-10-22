-- Supabase는 public 스키마의 새 테이블에 anon, authenticated 역할의 기본 권한을 미리 부여한다.
-- 첫 마이그레이션의 grant는 권한을 더하기만 했으므로, 기본 권한을 모두 걷어낸 뒤 필요한 것만 다시 준다.
-- RLS가 켜져 있어 행은 이미 보호되지만, 권한도 최소로 맞춘다.
revoke all on public.profiles from anon, authenticated;

grant select on public.profiles to authenticated;
grant update (display_name) on public.profiles to authenticated;
