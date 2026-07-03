package com.projectcyan.security;

import java.net.URI;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.time.Duration;
import java.time.Instant;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.concurrent.atomic.AtomicInteger;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.dao.DataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

@Service
public class SecurityMonitoringService {

	private static final int MAX_METHOD_LENGTH = 8;
	private static final int MAX_PATH_LENGTH = 512;
	private static final int MAX_IP_LENGTH = 64;
	private static final int MAX_EVENT_SOURCE_LENGTH = 30;
	private static final int MAX_ROUTE_NAME_LENGTH = 80;
	private static final int MAX_PAGE_TITLE_LENGTH = 120;
	private static final int MAX_REFERRER_HOST_LENGTH = 255;
	private static final int MAX_UTM_LENGTH = 120;
	private static final int MAX_DEVICE_LENGTH = 30;
	private static final int MAX_BROWSER_LENGTH = 80;
	private static final int MAX_OS_LENGTH = 80;
	private static final int MAX_LANGUAGE_LENGTH = 40;
	private static final int MAX_TIMEZONE_LENGTH = 80;
	private static final int MAX_EVENT_TYPE_LENGTH = 80;
	private static final int MAX_SEVERITY_LENGTH = 20;
	private static final Duration TEMPORARY_COLLECTION_WINDOW = Duration.ofMinutes(10);
	private static final int TEMPORARY_COLLECTION_LIMIT = 50;
	private static final DateTimeFormatter ADMIN_TIME_FORMATTER = DateTimeFormatter
		.ofPattern("MM-dd HH:mm:ss")
		.withZone(ZoneId.of("Asia/Seoul"));

	private final JdbcTemplate jdbcTemplate;
	private final Instant temporaryCollectionStartedAt = Instant.now();
	private final AtomicInteger temporaryCollectedCount = new AtomicInteger();

	public SecurityMonitoringService(JdbcTemplate jdbcTemplate) {
		this.jdbcTemplate = jdbcTemplate;
	}

	public void recordAccess(
		HttpServletRequest request,
		String method,
		String path,
		int status,
		int durationMs,
		String fingerprintHash,
		boolean blocked
	) {
		recordAccess(
			request,
			method,
			path,
			status,
			durationMs,
			fingerprintHash,
			blocked,
			AccessLogContext.serverRequest()
		);
	}

	public void recordAccess(
		HttpServletRequest request,
		String method,
		String path,
		int status,
		int durationMs,
		String fingerprintHash,
		boolean blocked,
		AccessLogContext context
	) {
		if (!reserveTemporaryCollectionSlot()) {
			return;
		}

		try {
			AccessLogContext safeContext = context == null ? AccessLogContext.serverRequest() : context;
			UserAgentSummary userAgent = summarizeUserAgent(request.getHeader("User-Agent"));
			String referer = firstNonBlank(safeContext.referrer(), request.getHeader("Referer"));
			jdbcTemplate.update(
				"""
					insert into customer_access_log
						(method, path, status, duration_ms, ip_address, user_agent, referer, browser_fingerprint_hash, blocked,
						 event_source, route_name, page_title, referrer_host, utm_source, utm_medium, utm_campaign,
						 utm_content, utm_term, device_type, browser_name, os_name, language, timezone, viewport_width,
						 viewport_height, screen_width, screen_height, analytics_consent, session_hash)
					values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
					""",
				truncate(nullToBlank(method), MAX_METHOD_LENGTH),
				truncate(normalizePath(path), MAX_PATH_LENGTH),
				status,
				Math.max(durationMs, 0),
				truncate(clientIp(request), MAX_IP_LENGTH),
				request.getHeader("User-Agent"),
				referer,
				blankToNull(fingerprintHash),
				blocked,
				truncate(firstNonBlank(safeContext.eventSource(), "SERVER_REQUEST"), MAX_EVENT_SOURCE_LENGTH),
				truncate(blankToNull(safeContext.routeName()), MAX_ROUTE_NAME_LENGTH),
				truncate(blankToNull(safeContext.pageTitle()), MAX_PAGE_TITLE_LENGTH),
				truncate(referrerHost(referer), MAX_REFERRER_HOST_LENGTH),
				truncate(blankToNull(safeContext.utmSource()), MAX_UTM_LENGTH),
				truncate(blankToNull(safeContext.utmMedium()), MAX_UTM_LENGTH),
				truncate(blankToNull(safeContext.utmCampaign()), MAX_UTM_LENGTH),
				truncate(blankToNull(safeContext.utmContent()), MAX_UTM_LENGTH),
				truncate(blankToNull(safeContext.utmTerm()), MAX_UTM_LENGTH),
				truncate(userAgent.deviceType(), MAX_DEVICE_LENGTH),
				truncate(userAgent.browserName(), MAX_BROWSER_LENGTH),
				truncate(userAgent.osName(), MAX_OS_LENGTH),
				truncate(blankToNull(safeContext.language()), MAX_LANGUAGE_LENGTH),
				truncate(blankToNull(safeContext.timezone()), MAX_TIMEZONE_LENGTH),
				nonNegative(safeContext.viewportWidth()),
				nonNegative(safeContext.viewportHeight()),
				nonNegative(safeContext.screenWidth()),
				nonNegative(safeContext.screenHeight()),
				safeContext.analyticsConsent(),
				blankToNull(safeContext.sessionHash())
			);
		} catch (DataAccessException ignored) {
			// Monitoring must not break the storefront when the migration has not been applied yet.
		}
	}

	public void recordSecurityEvent(
		HttpServletRequest request,
		String eventType,
		String severity,
		String path,
		String detail
	) {
		if (!reserveTemporaryCollectionSlot()) {
			return;
		}

		try {
			jdbcTemplate.update(
				"""
					insert into security_event
						(event_type, severity, ip_address, path, user_agent, detail)
					values (?, ?, ?, ?, ?, ?)
					""",
				truncate(nullToBlank(eventType), MAX_EVENT_TYPE_LENGTH),
				truncate(nullToBlank(severity), MAX_SEVERITY_LENGTH),
				truncate(clientIp(request), MAX_IP_LENGTH),
				truncate(normalizePath(path), MAX_PATH_LENGTH),
				request.getHeader("User-Agent"),
				detail
			);
		} catch (DataAccessException ignored) {
			// Security controls continue even when event persistence is unavailable.
		}
	}

	public SecurityDashboard dashboard() {
		try {
			TemporaryCollectionStatus collectionStatus = databaseTemporaryCollectionStatus();
			return new SecurityDashboard(
				true,
				"customer_access_log, security_event 테이블 기준입니다. " + collectionStatus.message(),
				queryLong("select count(*) from customer_access_log where occurred_at >= date_trunc('day', now())"),
				queryLong("select count(*) from customer_access_log where blocked = true and occurred_at >= now() - interval '24 hours'"),
				queryLong("select count(distinct ip_address) from customer_access_log where occurred_at >= now() - interval '24 hours' and ip_address is not null"),
				queryLong("select count(distinct browser_fingerprint_hash) from customer_access_log where occurred_at >= now() - interval '24 hours' and browser_fingerprint_hash is not null"),
				topPaths(),
				recentAccessLogs(),
				recentEvents(),
				collectionStatus
			);
		} catch (DataAccessException exception) {
			return SecurityDashboard.unavailable(
				"통계 DB 테이블이 아직 없거나 migration이 적용되지 않았습니다.",
				temporaryCollectionStatus()
			);
		}
	}

	public String clientIp(HttpServletRequest request) {
		String forwardedFor = request.getHeader("X-Forwarded-For");
		if (forwardedFor != null && !forwardedFor.isBlank()) {
			return forwardedFor.split(",", 2)[0].trim();
		}
		String realIp = request.getHeader("X-Real-IP");
		if (realIp != null && !realIp.isBlank()) {
			return realIp.trim();
		}
		return request.getRemoteAddr() == null ? "unknown" : request.getRemoteAddr();
	}

	public String normalizePath(String path) {
		if (path == null || path.isBlank()) {
			return "/";
		}
		int queryStart = path.indexOf('?');
		String withoutQuery = queryStart >= 0 ? path.substring(0, queryStart) : path;
		return withoutQuery.isBlank() ? "/" : withoutQuery;
	}

	private long queryLong(String sql) {
		Long value = jdbcTemplate.queryForObject(sql, Long.class);
		return value == null ? 0L : value;
	}

	private List<PathMetric> topPaths() {
		return jdbcTemplate.query(
			"""
				select coalesce(nullif(route_name, ''), path) as path, count(*) as request_count, max(occurred_at) as last_seen_at
				from customer_access_log
				where occurred_at >= now() - interval '24 hours'
				group by coalesce(nullif(route_name, ''), path)
				order by request_count desc, path asc
				limit 8
				""",
			(resultSet, rowNumber) -> new PathMetric(
				resultSet.getString("path"),
				resultSet.getLong("request_count"),
				formatInstant(instant(resultSet, "last_seen_at"))
			)
		);
	}

	private List<AccessLogRow> recentAccessLogs() {
		return jdbcTemplate.query(
			"""
				select occurred_at, event_source, method, path, route_name, status, duration_ms, ip_address, device_type, blocked
				from customer_access_log
				order by occurred_at desc
				limit 20
				""",
			(resultSet, rowNumber) -> new AccessLogRow(
				formatInstant(instant(resultSet, "occurred_at")),
				resultSet.getString("event_source"),
				resultSet.getString("method"),
				resultSet.getString("path"),
				resultSet.getString("route_name"),
				resultSet.getInt("status"),
				resultSet.getInt("duration_ms"),
				nullToBlank(resultSet.getString("ip_address")),
				nullToBlank(resultSet.getString("device_type")),
				resultSet.getBoolean("blocked")
			)
		);
	}

	private List<SecurityEventRow> recentEvents() {
		return jdbcTemplate.query(
			"""
				select occurred_at, event_type, severity, ip_address, path, detail
				from security_event
				order by occurred_at desc
				limit 20
				""",
			(resultSet, rowNumber) -> new SecurityEventRow(
				formatInstant(instant(resultSet, "occurred_at")),
				resultSet.getString("event_type"),
				resultSet.getString("severity"),
				nullToBlank(resultSet.getString("ip_address")),
				resultSet.getString("path"),
				resultSet.getString("detail")
			)
		);
	}

	private boolean reserveTemporaryCollectionSlot() {
		TemporaryCollectionStatus status = temporaryCollectionStatus();
		if (!status.active()) {
			return false;
		}

		while (true) {
			int currentCount = temporaryCollectedCount.get();
			if (currentCount >= TEMPORARY_COLLECTION_LIMIT) {
				return false;
			}
			if (temporaryCollectedCount.compareAndSet(currentCount, currentCount + 1)) {
				return true;
			}
		}
	}

	private TemporaryCollectionStatus temporaryCollectionStatus() {
		Instant now = Instant.now();
		Instant endsAt = temporaryCollectionStartedAt.plus(TEMPORARY_COLLECTION_WINDOW);
		int collectedCount = temporaryCollectedCount.get();
		boolean active = now.isBefore(endsAt) && collectedCount < TEMPORARY_COLLECTION_LIMIT;
		int remainingCount = Math.max(TEMPORARY_COLLECTION_LIMIT - collectedCount, 0);
		long remainingSeconds = active ? Math.max(Duration.between(now, endsAt).toSeconds(), 0) : 0;
		String stopReason;
		if (collectedCount >= TEMPORARY_COLLECTION_LIMIT) {
			stopReason = "50건 제한 도달";
		} else if (!now.isBefore(endsAt)) {
			stopReason = "10분 수집 시간 종료";
		} else {
			stopReason = "수집 중";
		}
		String message = active
			? "임시 수집 중: 최대 10분/50건, 남은 " + remainingCount + "건, 남은 " + remainingSeconds + "초."
			: "임시 수집 중단: " + stopReason + ".";
		return new TemporaryCollectionStatus(
			active,
			collectedCount,
			TEMPORARY_COLLECTION_LIMIT,
			remainingCount,
			remainingSeconds,
			formatInstant(temporaryCollectionStartedAt),
			formatInstant(endsAt),
			stopReason,
			message
		);
	}

	private TemporaryCollectionStatus databaseTemporaryCollectionStatus() {
		try {
			return jdbcTemplate.queryForObject(
				"""
					select enabled,
					       accepted_count,
					       limit_count,
					       greatest(0, extract(epoch from started_at + make_interval(secs => window_seconds) - now()))::bigint as remaining_seconds,
					       started_at,
					       started_at + make_interval(secs => window_seconds) as ends_at
					  from customer_access_collection_gate
					 where gate_id = true
					""",
				(resultSet, rowNumber) -> {
					boolean enabled = resultSet.getBoolean("enabled");
					int collectedCount = resultSet.getInt("accepted_count");
					int limitCount = resultSet.getInt("limit_count");
					long remainingSeconds = resultSet.getLong("remaining_seconds");
					boolean active = enabled && remainingSeconds > 0 && collectedCount < limitCount;
					int remainingCount = Math.max(limitCount - collectedCount, 0);
					String stopReason;
					if (!enabled) {
						stopReason = "DB 게이트 비활성";
					} else if (collectedCount >= limitCount) {
						stopReason = "50건 제한 도달";
					} else if (remainingSeconds <= 0) {
						stopReason = "10분 수집 시간 종료";
					} else {
						stopReason = "수집 중";
					}
					String message = active
						? "DB 임시 수집 중: 최대 10분/50건, 남은 " + remainingCount + "건, 남은 " + remainingSeconds + "초."
						: "DB 임시 수집 중단: " + stopReason + ".";
					return new TemporaryCollectionStatus(
						active,
						collectedCount,
						limitCount,
						remainingCount,
						remainingSeconds,
						formatInstant(instant(resultSet, "started_at")),
						formatInstant(instant(resultSet, "ends_at")),
						stopReason,
						message
					);
				}
			);
		} catch (DataAccessException exception) {
			return temporaryCollectionStatus();
		}
	}

	private UserAgentSummary summarizeUserAgent(String userAgent) {
		String normalized = nullToBlank(userAgent).toLowerCase();
		String deviceType = "desktop";
		if (normalized.contains("bot") || normalized.contains("crawler") || normalized.contains("spider")) {
			deviceType = "bot";
		} else if (normalized.contains("tablet") || normalized.contains("ipad")) {
			deviceType = "tablet";
		} else if (normalized.contains("mobile") || normalized.contains("android") || normalized.contains("iphone")) {
			deviceType = "mobile";
		}

		String browserName = "unknown";
		if (deviceType.equals("bot")) {
			browserName = "bot";
		} else if (normalized.contains("edg/")) {
			browserName = "edge";
		} else if (normalized.contains("whale/")) {
			browserName = "whale";
		} else if (normalized.contains("samsungbrowser/")) {
			browserName = "samsung internet";
		} else if (normalized.contains("firefox/")) {
			browserName = "firefox";
		} else if (normalized.contains("chrome/")) {
			browserName = "chrome";
		} else if (normalized.contains("safari/")) {
			browserName = "safari";
		}

		String osName = "unknown";
		if (normalized.contains("windows")) {
			osName = "windows";
		} else if (normalized.contains("android")) {
			osName = "android";
		} else if (normalized.contains("iphone") || normalized.contains("ipad")) {
			osName = "ios";
		} else if (normalized.contains("mac os") || normalized.contains("macintosh")) {
			osName = "macos";
		} else if (normalized.contains("linux")) {
			osName = "linux";
		}

		return new UserAgentSummary(deviceType, browserName, osName);
	}

	private String referrerHost(String referrer) {
		if (referrer == null || referrer.isBlank()) {
			return null;
		}
		try {
			String host = URI.create(referrer).getHost();
			return host == null || host.isBlank() ? null : host;
		} catch (IllegalArgumentException exception) {
			return null;
		}
	}

	private Integer nonNegative(Integer value) {
		return value == null || value < 0 ? null : value;
	}

	private String firstNonBlank(String first, String second) {
		if (first != null && !first.isBlank()) {
			return first;
		}
		return second != null && !second.isBlank() ? second : null;
	}

	private Instant instant(ResultSet resultSet, String column) throws SQLException {
		Timestamp timestamp = resultSet.getTimestamp(column);
		return timestamp == null ? null : timestamp.toInstant();
	}

	private String formatInstant(Instant instant) {
		return instant == null ? "-" : ADMIN_TIME_FORMATTER.format(instant);
	}

	private String truncate(String value, int maxLength) {
		if (value == null) {
			return null;
		}
		return value.length() <= maxLength ? value : value.substring(0, maxLength);
	}

	private String blankToNull(String value) {
		return value == null || value.isBlank() ? null : value;
	}

	private String nullToBlank(String value) {
		return value == null ? "" : value;
	}

	public record SecurityDashboard(
		boolean available,
		String message,
		long todayAccessCount,
		long blockedCount24h,
		long uniqueIpCount24h,
		long uniqueFingerprintCount24h,
		List<PathMetric> topPaths,
		List<AccessLogRow> recentAccessLogs,
		List<SecurityEventRow> recentEvents,
		TemporaryCollectionStatus temporaryCollection
	) {
		public static SecurityDashboard unavailable(String message, TemporaryCollectionStatus temporaryCollection) {
			return new SecurityDashboard(false, message, 0, 0, 0, 0, List.of(), List.of(), List.of(), temporaryCollection);
		}
	}

	public record PathMetric(
		String path,
		long requestCount,
		String lastSeenAt
	) {
	}

	public record AccessLogRow(
		String occurredAt,
		String eventSource,
		String method,
		String path,
		String routeName,
		int status,
		int durationMs,
		String ipAddress,
		String deviceType,
		boolean blocked
	) {
	}

	public record SecurityEventRow(
		String occurredAt,
		String eventType,
		String severity,
		String ipAddress,
		String path,
		String detail
	) {
	}

	public record TemporaryCollectionStatus(
		boolean active,
		int collectedCount,
		int limitCount,
		int remainingCount,
		long remainingSeconds,
		String startedAt,
		String endsAt,
		String stopReason,
		String message
	) {
	}

	public record AccessLogContext(
		String eventSource,
		String routeName,
		String pageTitle,
		String referrer,
		String utmSource,
		String utmMedium,
		String utmCampaign,
		String utmContent,
		String utmTerm,
		String language,
		String timezone,
		Integer viewportWidth,
		Integer viewportHeight,
		Integer screenWidth,
		Integer screenHeight,
		boolean analyticsConsent,
		String sessionHash
	) {
		public static AccessLogContext serverRequest() {
			return new AccessLogContext(
				"SERVER_REQUEST",
				null,
				null,
				null,
				null,
				null,
				null,
				null,
				null,
				null,
				null,
				null,
				null,
				null,
				null,
				false,
				null
			);
		}
	}

	private record UserAgentSummary(
		String deviceType,
		String browserName,
		String osName
	) {
	}
}
