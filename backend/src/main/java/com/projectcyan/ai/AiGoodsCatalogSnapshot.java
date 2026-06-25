package com.projectcyan.ai;

import java.time.Instant;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "ai_goods_catalog_snapshot")
public class AiGoodsCatalogSnapshot {

	public static final String STATUS_SUCCESS = "SUCCESS";
	public static final String STATUS_FAILED = "FAILED";

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "snapshot_id")
	private Long snapshotId;

	@Column(name = "storage_bucket")
	private String storageBucket;

	@Column(name = "storage_path")
	private String storagePath;

	@Column(name = "catalog_url", length = 2048)
	private String catalogUrl;

	@Column(name = "url_expires_at")
	private Instant urlExpiresAt;

	@Column(name = "generated_at")
	private Instant generatedAt;

	@Column(name = "item_count")
	private Integer itemCount;

	@Column(name = "file_size_bytes")
	private Long fileSizeBytes;

	@Column(name = "status")
	private String status;

	@Column(name = "error_message", length = 2000)
	private String errorMessage;

	protected AiGoodsCatalogSnapshot() {
	}

	private AiGoodsCatalogSnapshot(
		String storageBucket,
		String storagePath,
		String catalogUrl,
		Instant urlExpiresAt,
		Instant generatedAt,
		Integer itemCount,
		Long fileSizeBytes,
		String status,
		String errorMessage
	) {
		this.storageBucket = storageBucket;
		this.storagePath = storagePath;
		this.catalogUrl = catalogUrl;
		this.urlExpiresAt = urlExpiresAt;
		this.generatedAt = generatedAt;
		this.itemCount = itemCount;
		this.fileSizeBytes = fileSizeBytes;
		this.status = status;
		this.errorMessage = errorMessage;
	}

	public static AiGoodsCatalogSnapshot success(
		String storageBucket,
		String storagePath,
		String catalogUrl,
		Instant urlExpiresAt,
		Instant generatedAt,
		Integer itemCount,
		Long fileSizeBytes
	) {
		return new AiGoodsCatalogSnapshot(
			storageBucket,
			storagePath,
			catalogUrl,
			urlExpiresAt,
			generatedAt,
			itemCount,
			fileSizeBytes,
			STATUS_SUCCESS,
			null
		);
	}

	public static AiGoodsCatalogSnapshot failed(Instant generatedAt, String errorMessage) {
		return new AiGoodsCatalogSnapshot(
			null,
			null,
			null,
			null,
			generatedAt,
			0,
			0L,
			STATUS_FAILED,
			errorMessage
		);
	}

	public Long getSnapshotId() {
		return snapshotId;
	}

	public String getStorageBucket() {
		return storageBucket;
	}

	public String getStoragePath() {
		return storagePath;
	}

	public String getCatalogUrl() {
		return catalogUrl;
	}

	public Instant getUrlExpiresAt() {
		return urlExpiresAt;
	}

	public Instant getGeneratedAt() {
		return generatedAt;
	}

	public Integer getItemCount() {
		return itemCount;
	}

	public Long getFileSizeBytes() {
		return fileSizeBytes;
	}

	public String getStatus() {
		return status;
	}

	public String getErrorMessage() {
		return errorMessage;
	}
}
