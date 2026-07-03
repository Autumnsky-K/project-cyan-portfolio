package com.projectcyan.member;

import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import com.projectcyan.common.ApiErrorException;
import com.projectcyan.storage.SupabaseStorageService;

import org.springframework.dao.DataAccessException;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.ResultSetExtractor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Service
public class DigitalLibraryService {

	private static final long SIGNED_URL_TTL_SECONDS = 600L;

	private final JdbcTemplate jdbcTemplate;
	private final SupabaseStorageService storageService;

	public DigitalLibraryService(JdbcTemplate jdbcTemplate, SupabaseStorageService storageService) {
		this.jdbcTemplate = jdbcTemplate;
		this.storageService = storageService;
	}

	@Transactional(readOnly = true)
	public List<DigitalLibraryItemResponse> findLibrary(Long memberId, Long goodsId) {
		String goodsCondition = goodsId == null ? "" : " and e.goods_id = ?\n";
		Object[] params = goodsId == null ? new Object[] {memberId} : new Object[] {memberId, goodsId};
		ResultSetExtractor<List<DigitalLibraryItemResponse>> extractor = this::mapLibraryRows;
		return jdbcTemplate.query("""
			select
				e.entitlement_id,
				e.goods_id,
				g.goods_name,
				g.price,
				g.main_image_url,
				artist.artist_name,
				gc.category_name,
				e.granted_at,
				e.last_downloaded_at,
				e.download_limit_per_period,
				e.download_period_days,
				coalesce(download_state.period_download_count, 0) as period_download_count,
				download_state.first_period_downloaded_at,
				asset.asset_id,
				asset.display_name,
				asset.original_file_name,
				asset.content_type,
				asset.file_size_bytes
			from digital_goods_entitlement e
			join goods g on g.goods_id = e.goods_id
			join goods_category gc on gc.category_id = g.category_id
			left join artist on artist.artist_id = g.artist_id
			left join lateral (
				select
					count(*)::integer as period_download_count,
					min(requested_at) as first_period_downloaded_at
				from digital_goods_download_request request
				where request.entitlement_id = e.entitlement_id
					and request.request_status = 'GRANTED'
					and request.requested_at >= now() - make_interval(days => e.download_period_days)
			) download_state on true
			left join digital_goods_asset asset on asset.goods_id = e.goods_id and asset.is_active = true
			where e.member_id = ?
				and e.entitlement_status = 'ACTIVE'
			""" + goodsCondition + """
			order by e.granted_at desc, e.entitlement_id desc, asset.sort_order asc, asset.asset_id asc
			""", extractor, params);
	}

	@Transactional
	public DigitalDownloadResponse requestDownload(
		Long memberId,
		Long entitlementId,
		DigitalDownloadRequest request,
		String requesterIp,
		String userAgent
	) {
		DigitalDownloadTarget target = findDownloadTarget(memberId, entitlementId, request == null ? null : request.assetId());
		Instant expiresAt = Instant.now().plus(SIGNED_URL_TTL_SECONDS, ChronoUnit.SECONDS);
		String signedUrl = storageService.createSignedObjectUrl(
			target.storageBucket(),
			target.objectPath(),
			SIGNED_URL_TTL_SECONDS
		);
		Long requestId = insertDownloadRequest(
			target,
			expiresAt,
			requesterIp,
			userAgent,
			request == null ? null : request.browserFingerprint()
		);
		return new DigitalDownloadResponse(
			requestId,
			target.assetId(),
			signedUrl,
			expiresAt,
			target.originalFileName(),
			target.contentType()
		);
	}

	private List<DigitalLibraryItemResponse> mapLibraryRows(ResultSet resultSet) throws SQLException {
		Map<Long, DigitalLibraryItemBuilder> items = new LinkedHashMap<>();
		while (resultSet.next()) {
			Long entitlementId = resultSet.getLong("entitlement_id");
			DigitalLibraryItemBuilder builder = items.computeIfAbsent(entitlementId, ignored -> builder(resultSet));
			Long assetId = resultSet.getObject("asset_id", Long.class);
			if (assetId != null) {
				builder.assets.add(new DigitalLibraryAssetResponse(
					assetId,
					coalesce(resultSet.getString("display_name"), resultSet.getString("original_file_name")),
					resultSet.getString("original_file_name"),
					resultSet.getString("content_type"),
					resultSet.getObject("file_size_bytes", Long.class)
				));
			}
		}
		return items.values().stream()
			.map(DigitalLibraryItemBuilder::toResponse)
			.toList();
	}

	private DigitalLibraryItemBuilder builder(ResultSet resultSet) {
		try {
			int downloadLimit = resultSet.getInt("download_limit_per_period");
			int periodDownloadCount = resultSet.getInt("period_download_count");
			int downloadsRemaining = Math.max(downloadLimit - periodDownloadCount, 0);
			BigDecimal price = resultSet.getBigDecimal("price");
			Timestamp firstPeriodDownloadedAt = resultSet.getTimestamp("first_period_downloaded_at");
			Instant nextDownloadAvailableAt = downloadsRemaining > 0 || firstPeriodDownloadedAt == null
				? null
				: firstPeriodDownloadedAt.toInstant().plus(resultSet.getInt("download_period_days"), ChronoUnit.DAYS);

			return new DigitalLibraryItemBuilder(
				resultSet.getLong("entitlement_id"),
				resultSet.getLong("goods_id"),
				resultSet.getString("goods_name"),
				resultSet.getString("artist_name"),
				resultSet.getString("category_name"),
				price == null ? null : price.intValueExact(),
				resultSet.getString("main_image_url"),
				toInstant(resultSet.getTimestamp("granted_at")),
				toInstant(resultSet.getTimestamp("last_downloaded_at")),
				nextDownloadAvailableAt,
				downloadsRemaining,
				downloadLimit,
				resultSet.getInt("download_period_days")
			);
		} catch (SQLException exception) {
			throw new IllegalStateException("Digital library row could not be mapped.", exception);
		}
	}

	private DigitalDownloadTarget findDownloadTarget(Long memberId, Long entitlementId, Long requestedAssetId) {
		List<DigitalDownloadTarget> targets = jdbcTemplate.query("""
			select
				e.entitlement_id,
				e.member_id,
				e.goods_id,
				asset.asset_id,
				asset.storage_bucket,
				asset.object_path,
				asset.original_file_name,
				asset.content_type
			from digital_goods_entitlement e
			join digital_goods_asset asset on asset.goods_id = e.goods_id and asset.is_active = true
			where e.member_id = ?
				and e.entitlement_id = ?
				and e.entitlement_status = 'ACTIVE'
				and (? is null or asset.asset_id = ?)
			order by asset.sort_order asc, asset.asset_id asc
			limit 1
			""",
			(resultSet, rowNumber) -> new DigitalDownloadTarget(
				resultSet.getLong("entitlement_id"),
				resultSet.getLong("member_id"),
				resultSet.getLong("goods_id"),
				resultSet.getLong("asset_id"),
				resultSet.getString("storage_bucket"),
				resultSet.getString("object_path"),
				resultSet.getString("original_file_name"),
				resultSet.getString("content_type")
			),
			memberId,
			entitlementId,
			requestedAssetId,
			requestedAssetId
		);
		if (targets.isEmpty()) {
			throw new ApiErrorException(
				"DIGITAL_ASSET_NOT_FOUND",
				"다운로드 가능한 디지털 파일이 없습니다.",
				HttpStatus.NOT_FOUND
			);
		}
		return targets.getFirst();
	}

	private Long insertDownloadRequest(
		DigitalDownloadTarget target,
		Instant expiresAt,
		String requesterIp,
		String userAgent,
		String browserFingerprint
	) {
		try {
			return jdbcTemplate.queryForObject("""
				insert into digital_goods_download_request (
					entitlement_id,
					member_id,
					goods_id,
					asset_id,
					request_status,
					requested_at,
					signed_url_expires_at,
					download_token_hash,
					requester_ip_hash,
					user_agent_hash,
					browser_fingerprint_hash
				)
				values (?, ?, ?, ?, 'GRANTED', now(), ?, ?, ?, ?, ?)
				returning request_id
				""",
				Long.class,
				target.entitlementId(),
				target.memberId(),
				target.goodsId(),
				target.assetId(),
				Timestamp.from(expiresAt),
				sha256(UUID.randomUUID().toString()),
				sha256(requesterIp),
				sha256(userAgent),
				sha256(browserFingerprint)
			);
		} catch (DataAccessException exception) {
			if (!String.valueOf(exception.getMessage()).contains("Digital download limit exceeded")) {
				throw new ApiErrorException(
					"DIGITAL_DOWNLOAD_REQUEST_FAILED",
					"디지털 파일 다운로드 요청을 기록하지 못했습니다.",
					HttpStatus.INTERNAL_SERVER_ERROR
				);
			}
			throw new ApiErrorException(
				"DIGITAL_DOWNLOAD_LIMIT_EXCEEDED",
				"디지털 상품은 구매 후 30일마다 1회씩 다운로드할 수 있습니다.",
				HttpStatus.CONFLICT
			);
		}
	}

	private String sha256(String value) {
		if (!StringUtils.hasText(value)) {
			return null;
		}
		try {
			MessageDigest digest = MessageDigest.getInstance("SHA-256");
			byte[] hashedBytes = digest.digest(value.getBytes(StandardCharsets.UTF_8));
			StringBuilder builder = new StringBuilder(hashedBytes.length * 2);
			for (byte hashedByte : hashedBytes) {
				builder.append(String.format("%02x", hashedByte));
			}
			return builder.toString();
		} catch (NoSuchAlgorithmException exception) {
			throw new IllegalStateException("SHA-256 is not available.", exception);
		}
	}

	private Instant toInstant(Timestamp timestamp) {
		return timestamp == null ? null : timestamp.toInstant();
	}

	private String coalesce(String first, String second) {
		return StringUtils.hasText(first) ? first : second;
	}

	private record DigitalLibraryItemBuilder(
		Long entitlementId,
		Long goodsId,
		String name,
		String artistName,
		String categoryName,
		Integer price,
		String imageUrl,
		Instant grantedAt,
		Instant lastDownloadedAt,
		Instant nextDownloadAvailableAt,
		Integer downloadsRemaining,
		Integer downloadLimitPerPeriod,
		Integer downloadPeriodDays,
		List<DigitalLibraryAssetResponse> assets
	) {
		private DigitalLibraryItemBuilder(
			Long entitlementId,
			Long goodsId,
			String name,
			String artistName,
			String categoryName,
			Integer price,
			String imageUrl,
			Instant grantedAt,
			Instant lastDownloadedAt,
			Instant nextDownloadAvailableAt,
			Integer downloadsRemaining,
			Integer downloadLimitPerPeriod,
			Integer downloadPeriodDays
		) {
			this(
				entitlementId,
				goodsId,
				name,
				artistName,
				categoryName,
				price,
				imageUrl,
				grantedAt,
				lastDownloadedAt,
				nextDownloadAvailableAt,
				downloadsRemaining,
				downloadLimitPerPeriod,
				downloadPeriodDays,
				new ArrayList<>()
			);
		}

		private DigitalLibraryItemResponse toResponse() {
			return new DigitalLibraryItemResponse(
				entitlementId,
				goodsId,
				name,
				artistName,
				categoryName,
				price,
				imageUrl,
				grantedAt,
				lastDownloadedAt,
				nextDownloadAvailableAt,
				!assets.isEmpty() && downloadsRemaining > 0,
				downloadsRemaining,
				downloadLimitPerPeriod,
				downloadPeriodDays,
				List.copyOf(assets)
			);
		}
	}

	private record DigitalDownloadTarget(
		Long entitlementId,
		Long memberId,
		Long goodsId,
		Long assetId,
		String storageBucket,
		String objectPath,
		String originalFileName,
		String contentType
	) {
	}
}
