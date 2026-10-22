-- 건강 모음을 MedlinePlus 주제 설명에서 연구 논문 소개로 바꿨다.
-- 이전 건강 기록의 항목 이름(주제 이름)은 새 모음에 없으므로 대응하는 기록을 모두 비운다.
delete from public.daily_health_order;
delete from public.health_quiz_answers;
delete from public.health_views;

-- 하루 순서를 분류별로 따로 저장한다. 분류를 고르지 않은 전체 순서는 'all'이다.
alter table public.daily_slang_order
  add column category text not null default 'all';
alter table public.daily_slang_order drop constraint daily_slang_order_pkey;
alter table public.daily_slang_order add primary key (user_id, day, category);

alter table public.daily_health_order
  add column category text not null default 'all';
alter table public.daily_health_order drop constraint daily_health_order_pkey;
alter table public.daily_health_order add primary key (user_id, day, category);
