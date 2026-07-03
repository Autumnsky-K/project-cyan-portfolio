package com.projectcyan.cms;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Types;
import java.time.LocalDate;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.projectcyan.admin.SupabaseUsageCounter;

@Service
public class CmsContentService {

	private static final List<String> ALLOWED_PAGE_KEYS = List.of("home", "artists");
	private static final TypeReference<Map<String, String>> COPY_SETTINGS_TYPE = new TypeReference<>() {
	};

	private final JdbcTemplate jdbcTemplate;
	private final SupabaseUsageCounter supabaseUsageCounter;
	private final ObjectMapper objectMapper = new ObjectMapper();

	public CmsContentService(JdbcTemplate jdbcTemplate, SupabaseUsageCounter supabaseUsageCounter) {
		this.jdbcTemplate = jdbcTemplate;
		this.supabaseUsageCounter = supabaseUsageCounter;
	}

	@Transactional
	public CmsPageResponse findPage(String pageKey) {
		ensureSchema();
		String normalizedPageKey = normalizePageKey(pageKey);
		List<CmsPageResponse> pages = jdbcTemplate.query(
			"""
			select page_key, eyebrow, title, summary_title, summary_body, primary_color, accent_color, background_color, hero_image_url, copy_settings::text as copy_settings
			from cms_page_setting
			where page_key = ?
			""",
			this::mapPage,
			normalizedPageKey
		);

		if (!pages.isEmpty()) {
			return normalizeLegacyPage(pages.get(0));
		}
		return defaultPage(normalizedPageKey);
	}

	@Transactional
	public CmsPageResponse savePage(String pageKey, CmsPageRequest request) {
		ensureSchema();
		String normalizedPageKey = normalizePageKey(pageKey);
		CmsPageResponse fallback = findStoredPage(normalizedPageKey)
			.orElseGet(() -> defaultPage(normalizedPageKey));
		CmsPageResponse nextPage = new CmsPageResponse(
			normalizedPageKey,
			valueOrDefault(request.eyebrow(), fallback.eyebrow()),
			valueOrDefault(request.title(), fallback.title()),
			valueOrDefault(request.summaryTitle(), fallback.summaryTitle()),
			valueOrDefault(request.summaryBody(), fallback.summaryBody()),
			colorOrDefault(request.primaryColor(), fallback.primaryColor()),
			colorOrDefault(request.accentColor(), fallback.accentColor()),
			colorOrDefault(request.backgroundColor(), fallback.backgroundColor()),
			blankToNull(request.heroImageUrl()),
			normalizeCopySettings(request.copySettings(), fallback.copySettings())
		);

		jdbcTemplate.update(
			"""
			insert into cms_page_setting (
				page_key, eyebrow, title, summary_title, summary_body, primary_color, accent_color, background_color, hero_image_url, copy_settings, updated_at
			) values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?::jsonb, now())
			on conflict (page_key) do update set
				eyebrow = excluded.eyebrow,
				title = excluded.title,
				summary_title = excluded.summary_title,
				summary_body = excluded.summary_body,
				primary_color = excluded.primary_color,
				accent_color = excluded.accent_color,
				background_color = excluded.background_color,
				hero_image_url = excluded.hero_image_url,
				copy_settings = excluded.copy_settings,
				updated_at = now()
			""",
			nextPage.pageKey(),
			nextPage.eyebrow(),
			nextPage.title(),
			nextPage.summaryTitle(),
			nextPage.summaryBody(),
			nextPage.primaryColor(),
			nextPage.accentColor(),
			nextPage.backgroundColor(),
			nextPage.heroImageUrl(),
			writeCopySettings(nextPage.copySettings())
		);
		supabaseUsageCounter.recordWrite("CMS 페이지 설정 저장");
		return nextPage;
	}

	private Optional<CmsPageResponse> findStoredPage(String normalizedPageKey) {
		List<CmsPageResponse> pages = jdbcTemplate.query(
			"""
			select page_key, eyebrow, title, summary_title, summary_body, primary_color, accent_color, background_color, hero_image_url, copy_settings::text as copy_settings
			from cms_page_setting
			where page_key = ?
			""",
			this::mapPage,
			normalizedPageKey
		);
		return pages.stream().findFirst();
	}

	@Transactional
	public List<CmsArtistProfileResponse> findArtists(boolean includeHidden) {
		ensureSchema();
		seedArtistsFromArtistTable();
		String visibleClause = includeHidden ? "" : "where visible = true and group_visible = true ";
		return jdbcTemplate.query(
			"""
			select artist_id, name, group_name, group_key, group_sort_order, group_visible, group_hero_image_url, group_summary,
				image_url, lore, debut_date, collections, sort_order, visible
			from cms_artist_profile
			""" + visibleClause + """
			order by group_sort_order asc, sort_order asc, name asc
			""",
			this::mapArtist
		);
	}

	@Transactional
	public void saveArtists(List<CmsArtistProfileRequest> artists) {
		ensureSchema();
		boolean savedAnyArtist = false;
		for (CmsArtistProfileRequest artist : artists) {
			if (artist.artistId() == null && blankToNull(artist.name()) == null) {
				continue;
			}
			Long artistId = artist.artistId() == null ? nextArtistId() : artist.artistId();
			String name = valueOrDefault(artist.name(), "Artist " + artistId);
			String groupName = blankToNull(artist.groupName());
			String groupKey = normalizedGroupKey(artist.groupKey(), groupName, name);
			Integer groupSortOrder = artist.groupSortOrder() == null ? 999 : artist.groupSortOrder();
			Boolean groupVisible = artist.groupVisible() == null ? Boolean.TRUE : artist.groupVisible();
			jdbcTemplate.update(
				"""
				insert into cms_artist_profile (
					artist_id, name, group_name, group_key, group_sort_order, group_visible, group_hero_image_url, group_summary,
					image_url, lore, debut_date, collections, sort_order, visible, updated_at
				) values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, now())
				on conflict (artist_id) do update set
					name = excluded.name,
					group_name = excluded.group_name,
					group_key = excluded.group_key,
					group_sort_order = excluded.group_sort_order,
					group_visible = excluded.group_visible,
					group_hero_image_url = excluded.group_hero_image_url,
					group_summary = excluded.group_summary,
					image_url = excluded.image_url,
					lore = excluded.lore,
					debut_date = excluded.debut_date,
					collections = excluded.collections,
					sort_order = excluded.sort_order,
					visible = excluded.visible,
					updated_at = now()
				""",
				new Object[] {
					artistId,
					name,
					groupName,
					groupKey,
					groupSortOrder,
					groupVisible,
					blankToNull(artist.groupHeroImageUrl()),
					blankToNull(artist.groupSummary()),
					blankToNull(artist.imageUrl()),
					blankToNull(artist.lore()),
					parseDate(artist.debutDate()),
					blankToNull(artist.collections()),
					artist.sortOrder() == null ? 999 : artist.sortOrder(),
					Boolean.TRUE.equals(artist.visible())
				},
				new int[] {
					Types.BIGINT,
					Types.VARCHAR,
					Types.VARCHAR,
					Types.VARCHAR,
					Types.INTEGER,
					Types.BOOLEAN,
					Types.VARCHAR,
					Types.VARCHAR,
					Types.VARCHAR,
					Types.VARCHAR,
					Types.DATE,
					Types.VARCHAR,
					Types.INTEGER,
					Types.BOOLEAN
				}
			);
			syncCatalogArtist(artistId, name, groupName);
			savedAnyArtist = true;
		}
		if (savedAnyArtist) {
			supabaseUsageCounter.recordWrite("CMS 아티스트 설정 저장");
		}
	}

	@Transactional
	public CmsArtistProfileResponse createArtist(CmsArtistProfileRequest artist) {
		ensureSchema();
		Long artistId = artist.artistId() == null ? nextArtistId() : artist.artistId();
		String name = valueOrDefault(artist.name(), "Artist " + artistId);
		String groupName = blankToNull(artist.groupName());
		String groupKey = normalizedGroupKey(artist.groupKey(), groupName, name);
		Integer groupSortOrder = artist.groupSortOrder() == null ? 999 : artist.groupSortOrder();
		Boolean groupVisible = artist.groupVisible() == null ? Boolean.TRUE : artist.groupVisible();
		jdbcTemplate.update(
			"""
			insert into cms_artist_profile (
				artist_id, name, group_name, group_key, group_sort_order, group_visible, group_hero_image_url, group_summary,
				image_url, lore, debut_date, collections, sort_order, visible, updated_at
			) values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, now())
			""",
			new Object[] {
				artistId,
				name,
				groupName,
				groupKey,
				groupSortOrder,
				groupVisible,
				blankToNull(artist.groupHeroImageUrl()),
				blankToNull(artist.groupSummary()),
				blankToNull(artist.imageUrl()),
				blankToNull(artist.lore()),
				parseDate(artist.debutDate()),
				blankToNull(artist.collections()),
				artist.sortOrder() == null ? 999 : artist.sortOrder(),
				!Boolean.FALSE.equals(artist.visible())
			},
			new int[] {
				Types.BIGINT,
				Types.VARCHAR,
				Types.VARCHAR,
				Types.VARCHAR,
				Types.INTEGER,
				Types.BOOLEAN,
				Types.VARCHAR,
				Types.VARCHAR,
				Types.VARCHAR,
				Types.VARCHAR,
				Types.DATE,
				Types.VARCHAR,
				Types.INTEGER,
				Types.BOOLEAN
			}
		);
		syncCatalogArtist(artistId, name, groupName);
		supabaseUsageCounter.recordWrite("CMS 아티스트 신규 등록");
		return new CmsArtistProfileResponse(
			artistId,
			name,
			groupName,
			groupKey,
			groupSortOrder,
			groupVisible,
			blankToNull(artist.groupHeroImageUrl()),
			blankToNull(artist.groupSummary()),
			blankToNull(artist.imageUrl()),
			blankToNull(artist.lore()),
			artist.debutDate(),
			blankToNull(artist.collections()),
			artist.sortOrder() == null ? 999 : artist.sortOrder(),
			!Boolean.FALSE.equals(artist.visible())
		);
	}

	@Transactional
	public CmsArtistProfileChangeSummary applyArtistChanges(List<CmsArtistProfileChangeRequest> changes) {
		ensureSchema();
		int added = 0;
		int modified = 0;
		int deleted = 0;
		for (CmsArtistProfileChangeRequest change : changes) {
			String state = change.state() == null ? "" : change.state().trim().toLowerCase(Locale.ROOT);
			if ("delete".equals(state)) {
				if (change.originalArtistId() != null) {
					deleted += jdbcTemplate.update(
						"delete from cms_artist_profile where artist_id = ?",
						change.originalArtistId()
					);
				}
				continue;
			}

			if ("add".equals(state)) {
				insertArtist(change);
				added++;
				continue;
			}

			if ("modify".equals(state) && change.originalArtistId() != null) {
				modified += updateArtist(change);
			}
		}

		CmsArtistProfileChangeSummary summary = new CmsArtistProfileChangeSummary(added, modified, deleted);
		if (summary.total() > 0) {
			supabaseUsageCounter.recordWrite("CMS 아티스트 변경사항 적용");
		}
		return summary;
	}

	private void insertArtist(CmsArtistProfileChangeRequest artist) {
		Long artistId = artist.artistId() == null ? nextArtistId() : artist.artistId();
		String name = valueOrDefault(artist.name(), "Artist " + artistId);
		String groupName = blankToNull(artist.groupName());
		String groupKey = normalizedGroupKey(artist.groupKey(), groupName, name);
		Integer groupSortOrder = artist.groupSortOrder() == null ? 999 : artist.groupSortOrder();
		Boolean groupVisible = artist.groupVisible() == null ? Boolean.TRUE : artist.groupVisible();
		jdbcTemplate.update(
			"""
			insert into cms_artist_profile (
				artist_id, name, group_name, group_key, group_sort_order, group_visible, group_hero_image_url, group_summary,
				image_url, lore, debut_date, collections, sort_order, visible, updated_at
			) values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, now())
			""",
			new Object[] {
				artistId,
				name,
				groupName,
				groupKey,
				groupSortOrder,
				groupVisible,
				blankToNull(artist.groupHeroImageUrl()),
				blankToNull(artist.groupSummary()),
				blankToNull(artist.imageUrl()),
				blankToNull(artist.lore()),
				parseDate(artist.debutDate()),
				blankToNull(artist.collections()),
				artist.sortOrder() == null ? 999 : artist.sortOrder(),
				!Boolean.FALSE.equals(artist.visible())
			},
			artistSqlTypes()
		);
		syncCatalogArtist(artistId, name, groupName);
	}

	private int updateArtist(CmsArtistProfileChangeRequest artist) {
		Long nextArtistId = artist.artistId() == null ? artist.originalArtistId() : artist.artistId();
		String name = valueOrDefault(artist.name(), "Artist " + nextArtistId);
		String groupName = blankToNull(artist.groupName());
		String groupKey = normalizedGroupKey(artist.groupKey(), groupName, name);
		Integer groupSortOrder = artist.groupSortOrder() == null ? 999 : artist.groupSortOrder();
		Boolean groupVisible = artist.groupVisible() == null ? Boolean.TRUE : artist.groupVisible();
		int updated = jdbcTemplate.update(
			"""
			update cms_artist_profile
			set artist_id = ?,
				name = ?,
				group_name = ?,
				group_key = ?,
				group_sort_order = ?,
				group_visible = ?,
				group_hero_image_url = ?,
				group_summary = ?,
				image_url = ?,
				lore = ?,
				debut_date = ?,
				collections = ?,
				sort_order = ?,
				visible = ?,
				updated_at = now()
			where artist_id = ?
			""",
			new Object[] {
				nextArtistId,
				name,
				groupName,
				groupKey,
				groupSortOrder,
				groupVisible,
				blankToNull(artist.groupHeroImageUrl()),
				blankToNull(artist.groupSummary()),
				blankToNull(artist.imageUrl()),
				blankToNull(artist.lore()),
				parseDate(artist.debutDate()),
				blankToNull(artist.collections()),
				artist.sortOrder() == null ? 999 : artist.sortOrder(),
				!Boolean.FALSE.equals(artist.visible()),
				artist.originalArtistId()
			},
			new int[] {
				Types.BIGINT,
				Types.VARCHAR,
				Types.VARCHAR,
				Types.VARCHAR,
				Types.INTEGER,
				Types.BOOLEAN,
				Types.VARCHAR,
				Types.VARCHAR,
				Types.VARCHAR,
				Types.VARCHAR,
				Types.DATE,
				Types.VARCHAR,
				Types.INTEGER,
				Types.BOOLEAN,
				Types.BIGINT
			}
		);
		if (updated > 0) {
			syncCatalogArtist(nextArtistId, name, groupName);
		}
		return updated;
	}

	private void syncCatalogArtist(Long artistId, String artistName, String groupName) {
		if (artistId == null || blankToNull(artistName) == null) {
			return;
		}
		Long groupId = syncCatalogArtistGroup(groupName);
		jdbcTemplate.update(
			"""
			insert into artist (artist_id, artist_name, group_id)
			values (?, ?, ?)
			on conflict (artist_id) do update set
				artist_name = excluded.artist_name,
				group_id = excluded.group_id
			""",
			new Object[] {
				artistId,
				artistName.trim(),
				groupId
			},
			new int[] {
				Types.BIGINT,
				Types.VARCHAR,
				Types.BIGINT
			}
		);
	}

	private Long syncCatalogArtistGroup(String rawGroupName) {
		String groupName = valueOrDefault(rawGroupName, "미지정 그룹");
		return findCatalogArtistGroupId(groupName)
			.orElseGet(() -> insertCatalogArtistGroup(groupName));
	}

	private Optional<Long> findCatalogArtistGroupId(String groupName) {
		List<Long> groupIds = jdbcTemplate.query(
			"""
			select group_id
			from artist_group
			where lower(group_name) = lower(?)
			order by group_id asc
			limit 1
			""",
			(resultSet, rowNumber) -> resultSet.getLong("group_id"),
			groupName
		);
		return groupIds.stream().findFirst();
	}

	private Long insertCatalogArtistGroup(String groupName) {
		jdbcTemplate.execute("lock table artist_group in exclusive mode");
		Optional<Long> existingGroupId = findCatalogArtistGroupId(groupName);
		if (existingGroupId.isPresent()) {
			return existingGroupId.get();
		}
		Long groupId = jdbcTemplate.queryForObject(
			"select coalesce(max(group_id), 0) + 1 from artist_group",
			Long.class
		);
		Long nextGroupId = groupId == null ? 1L : groupId;
		jdbcTemplate.update(
			"insert into artist_group (group_id, group_name) values (?, ?)",
			new Object[] { nextGroupId, groupName },
			new int[] { Types.BIGINT, Types.VARCHAR }
		);
		return nextGroupId;
	}

	private int[] artistSqlTypes() {
		return new int[] {
			Types.BIGINT,
			Types.VARCHAR,
			Types.VARCHAR,
			Types.VARCHAR,
			Types.INTEGER,
			Types.BOOLEAN,
			Types.VARCHAR,
			Types.VARCHAR,
			Types.VARCHAR,
			Types.VARCHAR,
			Types.DATE,
			Types.VARCHAR,
			Types.INTEGER,
			Types.BOOLEAN
		};
	}

	private Long nextArtistId() {
		jdbcTemplate.execute("lock table cms_artist_profile, artist in exclusive mode");
		Long nextId = jdbcTemplate.queryForObject(
			"""
			select greatest(
				coalesce((select max(artist_id) from cms_artist_profile), 0),
				coalesce((select max(artist_id) from artist), 0)
			) + 1
			""",
			Long.class
		);
		return nextId == null ? 1L : nextId;
	}

	private void ensureSchema() {
		jdbcTemplate.execute(
			"""
			create table if not exists cms_page_setting (
				page_key varchar(40) primary key,
				eyebrow varchar(160) not null,
				title varchar(160) not null,
				summary_title varchar(160) not null,
				summary_body varchar(500) not null,
				primary_color varchar(32) not null,
				accent_color varchar(32) not null,
				background_color varchar(32) not null,
				hero_image_url text,
				copy_settings jsonb not null default '{}'::jsonb,
				updated_at timestamptz not null default now()
			)
			"""
		);
		jdbcTemplate.execute(
			"alter table cms_page_setting add column if not exists copy_settings jsonb not null default '{}'::jsonb"
		);
		jdbcTemplate.execute(
			"""
			create table if not exists cms_artist_profile (
				artist_id bigint primary key,
				name varchar(160) not null,
				group_name varchar(160),
				group_key varchar(120),
				group_sort_order integer not null default 999,
				group_visible boolean not null default true,
				group_hero_image_url text,
				group_summary varchar(700),
				image_url text,
				lore varchar(700),
				debut_date date,
				collections varchar(500),
				sort_order integer not null default 999,
				visible boolean not null default true,
				updated_at timestamptz not null default now()
			)
			"""
		);
		jdbcTemplate.execute("alter table cms_artist_profile add column if not exists group_key varchar(120)");
		jdbcTemplate.execute("alter table cms_artist_profile add column if not exists group_sort_order integer not null default 999");
		jdbcTemplate.execute("alter table cms_artist_profile add column if not exists group_visible boolean not null default true");
		jdbcTemplate.execute("alter table cms_artist_profile add column if not exists group_hero_image_url text");
		jdbcTemplate.execute("alter table cms_artist_profile add column if not exists group_summary varchar(700)");
		jdbcTemplate.execute(
			"""
			update cms_artist_profile
			set group_key = lower(regexp_replace(trim(coalesce(group_name, name, 'project-cyan')), '\\s+', '-', 'g'))
			where group_key is null or trim(group_key) = ''
			"""
		);
		jdbcTemplate.execute(
			"""
			create index if not exists idx_cms_artist_profile_group_sort
			on cms_artist_profile (group_sort_order, group_key, sort_order)
			"""
		);
	}

	private void seedArtistsFromArtistTable() {
		Integer profileCount = jdbcTemplate.queryForObject("select count(*) from cms_artist_profile", Integer.class);
		if (profileCount != null && profileCount > 0) {
			return;
		}

		jdbcTemplate.update(
			"""
			insert into cms_artist_profile (
				artist_id, name, group_name, group_key, group_sort_order, group_visible, lore, collections, sort_order, visible
			)
			select artist_id,
				artist_name,
				group_name,
				lower(regexp_replace(trim(coalesce(group_name, artist_name, 'project-cyan')), '\\s+', '-', 'g')),
				row_number() over (order by coalesce(group_name, artist_name), artist_name),
				true,
				'Artist profile is ready for CMS editing.',
				coalesce(group_name, artist_name),
				row_number() over (order by artist_name),
				true
			from artist
			on conflict (artist_id) do nothing
			"""
		);
	}

	private CmsPageResponse mapPage(ResultSet resultSet, int rowNumber) throws SQLException {
		return new CmsPageResponse(
			resultSet.getString("page_key"),
			resultSet.getString("eyebrow"),
			resultSet.getString("title"),
			resultSet.getString("summary_title"),
			resultSet.getString("summary_body"),
			resultSet.getString("primary_color"),
			resultSet.getString("accent_color"),
			resultSet.getString("background_color"),
			resultSet.getString("hero_image_url"),
			readCopySettings(resultSet.getString("copy_settings"))
		);
	}

	private CmsArtistProfileResponse mapArtist(ResultSet resultSet, int rowNumber) throws SQLException {
		var debutDate = resultSet.getDate("debut_date");
		return new CmsArtistProfileResponse(
			resultSet.getLong("artist_id"),
			resultSet.getString("name"),
			resultSet.getString("group_name"),
			resultSet.getString("group_key"),
			resultSet.getInt("group_sort_order"),
			resultSet.getBoolean("group_visible"),
			resultSet.getString("group_hero_image_url"),
			resultSet.getString("group_summary"),
			resultSet.getString("image_url"),
			resultSet.getString("lore"),
			debutDate == null ? "" : debutDate.toLocalDate().toString(),
			resultSet.getString("collections"),
			resultSet.getInt("sort_order"),
			resultSet.getBoolean("visible")
		);
	}

	private String normalizePageKey(String pageKey) {
		String normalizedPageKey = pageKey == null ? "" : pageKey.trim().toLowerCase(Locale.ROOT);
		if (!ALLOWED_PAGE_KEYS.contains(normalizedPageKey)) {
			return "home";
		}
		return normalizedPageKey;
	}

	private CmsPageResponse defaultPage(String pageKey) {
		if ("artists".equals(pageKey)) {
			return new CmsPageResponse(
				"artists",
				"Cyan Character Area",
				"CHARACTER",
				"CYAN",
				"A full-screen character signal map for virtual idols, stage districts, music energy, and future-pop worlds.",
				"#f7fbff",
				"#00d5ff",
				"#070815",
				null,
				defaultArtistCopySettings()
			);
		}
		return new CmsPageResponse(
			"home",
			"Project Cyan",
			"Project Cyan SHOP",
			"Official shop signal",
			"A vertical shop map for characters, physical goods, digital drops, artist collections, and category browsing.",
			"#ffffff",
			"#00d5ff",
			"#030308",
			null,
			defaultHomeCopySettings()
		);
	}

	private CmsPageResponse normalizeLegacyPage(CmsPageResponse page) {
		if ("home".equals(page.pageKey()) && isLegacyHomePage(page)) {
			CmsPageResponse fallback = defaultPage("home");
			return legacyPageWithFallback(page, fallback);
		}
		if ("artists".equals(page.pageKey()) && isLegacyArtistsPage(page)) {
			CmsPageResponse fallback = defaultPage("artists");
			return legacyPageWithFallback(page, fallback);
		}
		return page;
	}

	private CmsPageResponse legacyPageWithFallback(CmsPageResponse page, CmsPageResponse fallback) {
		return new CmsPageResponse(
			page.pageKey(),
			fallback.eyebrow(),
			fallback.title(),
			fallback.summaryTitle(),
			fallback.summaryBody(),
			fallback.primaryColor(),
			fallback.accentColor(),
			fallback.backgroundColor(),
			page.heroImageUrl(),
			page.copySettings().isEmpty() ? fallback.copySettings() : page.copySettings()
		);
	}

	private boolean isLegacyHomePage(CmsPageResponse page) {
		return page.copySettings().isEmpty()
			&& "SM Universe Store".equals(page.eyebrow())
			&& "Goods".equals(page.title())
			&& "Featured Goods".equals(page.summaryTitle())
			&& "Showing store items".equals(page.summaryBody());
	}

	private boolean isLegacyArtistsPage(CmsPageResponse page) {
		return page.copySettings().isEmpty()
			&& "SM Universe Store".equals(page.eyebrow())
			&& "Artists".equals(page.title())
			&& "Artist Universe".equals(page.summaryTitle())
			&& "Showing artist profiles".equals(page.summaryBody());
	}

	private Map<String, String> defaultHomeCopySettings() {
		Map<String, String> settings = new LinkedHashMap<>();
		settings.put("navHome", "Home");
		settings.put("navArtists", "Artists");
		settings.put("navGoods", "Goods");
		settings.put("navCart", "Cart");
		settings.put("statusSignalLabel", "SHOP SIGNAL");
		settings.put("statusReadyLabel", "Live");
		settings.put("statusLoadingLabel", "Loading");
		settings.put("statusErrorLabel", "Offline");
		settings.put("statusModeLabel", "FULLPAGE MODE");
		settings.put("artistsEyebrow", "Cyan Idol Network");
		settings.put("artistsTitle", "Artist Signals");
		settings.put("physicalEyebrow", "Physical Goods");
		settings.put("physicalTitle", "Goods you can hold");
		settings.put("physicalCta", "View physical");
		settings.put("digitalEyebrow", "Digital Goods");
		settings.put("digitalTitle", "Voice, message, and download drops");
		settings.put("digitalCta", "Open digital");
		settings.put("digitalFeatureEyebrow", "DATA DROP");
		settings.put("digitalFeatureDescription", "{artistName} channel goods for voice, message, download, or AI-assisted shopping flows.");
		settings.put("digitalFeatureCta", "Open drop");
		settings.put("byArtistEyebrow", "Goods By Artist");
		settings.put("byArtistTitle", "Shop from each artist channel");
		settings.put("byArtistCta", "Browse artist goods");
		settings.put("categoryEyebrow", "Goods Categories");
		settings.put("categoryTitle", "Browse by type");
		settings.put("categoryCta", "Open categories");
		settings.put("footerEyebrow", "Project Cyan SHOP");
		settings.put("footerTitle", "Official Shop Index");
		settings.put("footerShopTitle", "Shop");
		settings.put("footerShopAllGoods", "All goods");
		settings.put("footerShopPhysicalGoods", "Physical goods");
		settings.put("footerShopDigitalGoods", "Digital goods");
		settings.put("footerArtistTitle", "Artist");
		settings.put("footerArtistArtistsPage", "Artists page");
		settings.put("footerArtistGroups", "Artist groups");
		settings.put("footerArtistGoodsByArtist", "Goods by artist");
		settings.put("footerAccountTitle", "Account");
		settings.put("footerAccountSignIn", "Sign in");
		settings.put("footerAccountCart", "Cart");
		settings.put("footerAccountLikes", "Likes");
		settings.put("footerInfoTitle", "Info");
		settings.put("footerInfoTop", "Top");
		settings.put("footerInfoCategories", "Categories");
		settings.put("footerBottomLabel", "CYAN PRODUCTION");
		settings.put("footerBackToFirst", "Back to first page");
		return settings;
	}

	private Map<String, String> defaultArtistCopySettings() {
		Map<String, String> settings = new LinkedHashMap<>();
		settings.put("navHome", "Home");
		settings.put("navArtists", "Artists");
		settings.put("navGoods", "Goods");
		settings.put("navCart", "Cart");
		settings.put("broadcastStrip", "CYAN IDOL NETWORK // AREA STREAM // MUSIC MEDIA MIX // CHARACTER SIGNAL");
		settings.put("statsArtistsLabel", "Artists");
		settings.put("statsModeLabel", "Mode");
		settings.put("statsViewLabel", "View");
		settings.put("statsViewValue", "Stage");
		settings.put("statusLoadingLabel", "Loading");
		settings.put("statusLiveLabel", "Live");
		settings.put("statusPreviewLabel", "Preview");
		settings.put("channelWorld", "WORLD");
		settings.put("channelArea", "AREA");
		settings.put("channelCharacter", "CHARACTER");
		settings.put("channelMusic", "MUSIC");
		settings.put("profileBpmLabel", "BPM");
		settings.put("profileDebutLabel", "Debut");
		settings.put("profileCollectionsLabel", "Collections");
		settings.put("profileSignalLabel", "Signal");
		settings.put("artistGoodsCta", "이 아티스트 굿즈 보기");
		settings.put("groupGoodsCta", "그룹 굿즈 보기");
		settings.put("indexEyebrow", "Roster");
		settings.put("indexTitle", "Artist Index");
		settings.put("indexGroupGoodsCta", "그룹 굿즈 보기");
		settings.put("pagerIndexLabel", "All");
		return settings;
	}

	private Map<String, String> normalizeCopySettings(
		Map<String, String> requestedSettings,
		Map<String, String> fallbackSettings
	) {
		Map<String, String> normalized = new LinkedHashMap<>();
		if (fallbackSettings != null) {
			normalized.putAll(fallbackSettings);
		}
		if (requestedSettings == null) {
			return normalized;
		}
		for (Map.Entry<String, String> entry : requestedSettings.entrySet()) {
			if (entry.getKey() == null || entry.getValue() == null) {
				continue;
			}
			normalized.put(entry.getKey(), entry.getValue().trim());
		}
		return normalized;
	}

	private Map<String, String> readCopySettings(String rawCopySettings) {
		if (rawCopySettings == null || rawCopySettings.isBlank()) {
			return Map.of();
		}
		try {
			Map<String, String> parsed = objectMapper.readValue(rawCopySettings, COPY_SETTINGS_TYPE);
			Map<String, String> normalized = new LinkedHashMap<>();
			for (Map.Entry<String, String> entry : parsed.entrySet()) {
				if (entry.getKey() != null && entry.getValue() != null) {
					normalized.put(entry.getKey(), entry.getValue());
				}
			}
			return normalized;
		} catch (JsonProcessingException exception) {
			return Map.of();
		}
	}

	private String writeCopySettings(Map<String, String> copySettings) {
		try {
			return objectMapper.writeValueAsString(copySettings == null ? Map.of() : copySettings);
		} catch (JsonProcessingException exception) {
			throw new IllegalArgumentException("CMS page copy settings are not valid JSON.", exception);
		}
	}

	private String valueOrDefault(String value, String fallback) {
		String normalized = blankToNull(value);
		return normalized == null ? fallback : normalized;
	}

	private String normalizedGroupKey(String rawGroupKey, String groupName, String artistName) {
		String explicitGroupKey = blankToNull(rawGroupKey);
		if (explicitGroupKey != null) {
			return explicitGroupKey;
		}
		return valueOrDefault(groupName, valueOrDefault(artistName, "project-cyan"))
			.toLowerCase(Locale.ROOT)
			.replaceAll("\\s+", "-");
	}

	private String colorOrDefault(String value, String fallback) {
		String normalized = blankToNull(value);
		if (normalized == null || !normalized.matches("#[0-9a-fA-F]{6}")) {
			return fallback;
		}
		return normalized;
	}

	private String blankToNull(String value) {
		return value == null || value.isBlank() ? null : value.trim();
	}

	private java.sql.Date parseDate(String rawDate) {
		if (rawDate == null || rawDate.isBlank()) {
			return null;
		}
		return java.sql.Date.valueOf(LocalDate.parse(rawDate.trim()));
	}
}
