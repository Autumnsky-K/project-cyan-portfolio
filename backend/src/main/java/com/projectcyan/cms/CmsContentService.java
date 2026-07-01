package com.projectcyan.cms;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Types;
import java.time.LocalDate;
import java.util.List;
import java.util.Locale;
import java.util.Optional;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.projectcyan.admin.SupabaseUsageCounter;

@Service
public class CmsContentService {

	private static final List<String> ALLOWED_PAGE_KEYS = List.of("home", "artists");

	private final JdbcTemplate jdbcTemplate;
	private final SupabaseUsageCounter supabaseUsageCounter;

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
			select page_key, eyebrow, title, summary_title, summary_body, primary_color, accent_color, background_color, hero_image_url
			from cms_page_setting
			where page_key = ?
			""",
			this::mapPage,
			normalizedPageKey
		);

		if (!pages.isEmpty()) {
			return pages.get(0);
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
			blankToNull(request.heroImageUrl())
		);

		jdbcTemplate.update(
			"""
			insert into cms_page_setting (
				page_key, eyebrow, title, summary_title, summary_body, primary_color, accent_color, background_color, hero_image_url, updated_at
			) values (?, ?, ?, ?, ?, ?, ?, ?, ?, now())
			on conflict (page_key) do update set
				eyebrow = excluded.eyebrow,
				title = excluded.title,
				summary_title = excluded.summary_title,
				summary_body = excluded.summary_body,
				primary_color = excluded.primary_color,
				accent_color = excluded.accent_color,
				background_color = excluded.background_color,
				hero_image_url = excluded.hero_image_url,
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
			nextPage.heroImageUrl()
		);
		supabaseUsageCounter.recordWrite("CMS 페이지 설정 저장");
		return nextPage;
	}

	private Optional<CmsPageResponse> findStoredPage(String normalizedPageKey) {
		List<CmsPageResponse> pages = jdbcTemplate.query(
			"""
			select page_key, eyebrow, title, summary_title, summary_body, primary_color, accent_color, background_color, hero_image_url
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
		String visibleClause = includeHidden ? "" : "where visible = true ";
		return jdbcTemplate.query(
			"""
			select artist_id, name, group_name, image_url, lore, debut_date, collections, sort_order, visible
			from cms_artist_profile
			""" + visibleClause + """
			order by sort_order asc, name asc
			""",
			this::mapArtist
		);
	}

	@Transactional
	public void saveArtists(List<CmsArtistProfileRequest> artists) {
		ensureSchema();
		boolean savedAnyArtist = false;
		for (CmsArtistProfileRequest artist : artists) {
			if (artist.artistId() == null) {
				continue;
			}
			jdbcTemplate.update(
				"""
				insert into cms_artist_profile (
					artist_id, name, group_name, image_url, lore, debut_date, collections, sort_order, visible, updated_at
				) values (?, ?, ?, ?, ?, ?, ?, ?, ?, now())
				on conflict (artist_id) do update set
					name = excluded.name,
					group_name = excluded.group_name,
					image_url = excluded.image_url,
					lore = excluded.lore,
					debut_date = excluded.debut_date,
					collections = excluded.collections,
					sort_order = excluded.sort_order,
					visible = excluded.visible,
					updated_at = now()
				""",
				new Object[] {
					artist.artistId(),
					valueOrDefault(artist.name(), "Artist " + artist.artistId()),
					blankToNull(artist.groupName()),
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
					Types.VARCHAR,
					Types.DATE,
					Types.VARCHAR,
					Types.INTEGER,
					Types.BOOLEAN
				}
			);
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
		jdbcTemplate.update(
			"""
			insert into cms_artist_profile (
				artist_id, name, group_name, image_url, lore, debut_date, collections, sort_order, visible, updated_at
			) values (?, ?, ?, ?, ?, ?, ?, ?, ?, now())
			""",
			new Object[] {
				artistId,
				name,
				blankToNull(artist.groupName()),
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
				Types.VARCHAR,
				Types.DATE,
				Types.VARCHAR,
				Types.INTEGER,
				Types.BOOLEAN
			}
		);
		supabaseUsageCounter.recordWrite("CMS 아티스트 신규 등록");
		return new CmsArtistProfileResponse(
			artistId,
			name,
			blankToNull(artist.groupName()),
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
		jdbcTemplate.update(
			"""
			insert into cms_artist_profile (
				artist_id, name, group_name, image_url, lore, debut_date, collections, sort_order, visible, updated_at
			) values (?, ?, ?, ?, ?, ?, ?, ?, ?, now())
			""",
			new Object[] {
				artistId,
				name,
				blankToNull(artist.groupName()),
				blankToNull(artist.imageUrl()),
				blankToNull(artist.lore()),
				parseDate(artist.debutDate()),
				blankToNull(artist.collections()),
				artist.sortOrder() == null ? 999 : artist.sortOrder(),
				!Boolean.FALSE.equals(artist.visible())
			},
			artistSqlTypes()
		);
	}

	private int updateArtist(CmsArtistProfileChangeRequest artist) {
		Long nextArtistId = artist.artistId() == null ? artist.originalArtistId() : artist.artistId();
		String name = valueOrDefault(artist.name(), "Artist " + nextArtistId);
		return jdbcTemplate.update(
			"""
			update cms_artist_profile
			set artist_id = ?,
				name = ?,
				group_name = ?,
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
				blankToNull(artist.groupName()),
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
				Types.VARCHAR,
				Types.DATE,
				Types.VARCHAR,
				Types.INTEGER,
				Types.BOOLEAN,
				Types.BIGINT
			}
		);
	}

	private int[] artistSqlTypes() {
		return new int[] {
			Types.BIGINT,
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
		jdbcTemplate.execute("lock table cms_artist_profile in exclusive mode");
		Long nextId = jdbcTemplate.queryForObject(
			"select coalesce(max(artist_id), 0) + 1 from cms_artist_profile",
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
				updated_at timestamptz not null default now()
			)
			"""
		);
		jdbcTemplate.execute(
			"""
			create table if not exists cms_artist_profile (
				artist_id bigint primary key,
				name varchar(160) not null,
				group_name varchar(160),
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
	}

	private void seedArtistsFromArtistTable() {
		Integer profileCount = jdbcTemplate.queryForObject("select count(*) from cms_artist_profile", Integer.class);
		if (profileCount != null && profileCount > 0) {
			return;
		}

		jdbcTemplate.update(
			"""
			insert into cms_artist_profile (artist_id, name, group_name, lore, collections, sort_order, visible)
			select artist_id, artist_name, group_name, 'Artist profile is ready for CMS editing.', coalesce(group_name, artist_name), row_number() over (order by artist_name), true
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
			resultSet.getString("hero_image_url")
		);
	}

	private CmsArtistProfileResponse mapArtist(ResultSet resultSet, int rowNumber) throws SQLException {
		var debutDate = resultSet.getDate("debut_date");
		return new CmsArtistProfileResponse(
			resultSet.getLong("artist_id"),
			resultSet.getString("name"),
			resultSet.getString("group_name"),
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
				"SM Universe Store",
				"Artists",
				"Artist Universe",
				"Showing artist profiles",
				"#111111",
				"#2f6f64",
				"#ffffff",
				null
			);
		}
		return new CmsPageResponse(
			"home",
			"SM Universe Store",
			"Goods",
			"Featured Goods",
			"Showing store items",
			"#111111",
			"#2f6f64",
			"#ffffff",
			null
		);
	}

	private String valueOrDefault(String value, String fallback) {
		String normalized = blankToNull(value);
		return normalized == null ? fallback : normalized;
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
