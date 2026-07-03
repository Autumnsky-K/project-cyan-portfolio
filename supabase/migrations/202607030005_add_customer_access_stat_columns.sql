alter table public.customer_access_log
  add column if not exists event_source varchar(30) not null default 'SERVER_REQUEST',
  add column if not exists route_name varchar(80),
  add column if not exists page_title varchar(120),
  add column if not exists referrer_host varchar(255),
  add column if not exists utm_source varchar(120),
  add column if not exists utm_medium varchar(120),
  add column if not exists utm_campaign varchar(120),
  add column if not exists utm_content varchar(120),
  add column if not exists utm_term varchar(120),
  add column if not exists device_type varchar(30),
  add column if not exists browser_name varchar(80),
  add column if not exists os_name varchar(80),
  add column if not exists language varchar(40),
  add column if not exists timezone varchar(80),
  add column if not exists viewport_width integer,
  add column if not exists viewport_height integer,
  add column if not exists screen_width integer,
  add column if not exists screen_height integer,
  add column if not exists analytics_consent boolean not null default false,
  add column if not exists session_hash varchar(64);

create index if not exists idx_customer_access_log_event_source_time
  on public.customer_access_log (event_source, occurred_at desc);

create index if not exists idx_customer_access_log_route_time
  on public.customer_access_log (route_name, occurred_at desc)
  where route_name is not null;

create index if not exists idx_customer_access_log_utm_source_time
  on public.customer_access_log (utm_source, occurred_at desc)
  where utm_source is not null;

create index if not exists idx_customer_access_log_device_time
  on public.customer_access_log (device_type, occurred_at desc)
  where device_type is not null;

create index if not exists idx_customer_access_log_session_hash
  on public.customer_access_log (session_hash)
  where session_hash is not null;

comment on column public.customer_access_log.event_source is 'SERVER_REQUEST, PAGE_VIEW, RATE_LIMIT_BLOCK 등 통계 이벤트 출처.';
comment on column public.customer_access_log.route_name is '프론트 라우트 표시명. 예: 상품, 상품 상세, FAQ.';
comment on column public.customer_access_log.browser_fingerprint_hash is '동의 기반 익명 브라우저 식별값의 SHA-256 해시. 원본 식별값은 저장하지 않는다.';
comment on column public.customer_access_log.session_hash is '동의 기반 익명 세션 식별값의 SHA-256 해시. 원본 세션값은 저장하지 않는다.';
