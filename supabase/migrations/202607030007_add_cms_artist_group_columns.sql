alter table if exists public.cms_artist_profile
  add column if not exists group_key varchar(120),
  add column if not exists group_sort_order integer not null default 999,
  add column if not exists group_visible boolean not null default true,
  add column if not exists group_hero_image_url text,
  add column if not exists group_summary varchar(700);

update public.cms_artist_profile
set group_key = lower(regexp_replace(trim(coalesce(group_name, name, 'project-cyan')), '\s+', '-', 'g'))
where group_key is null or trim(group_key) = '';

create index if not exists idx_cms_artist_profile_group_sort
on public.cms_artist_profile (group_sort_order, group_key, sort_order);
