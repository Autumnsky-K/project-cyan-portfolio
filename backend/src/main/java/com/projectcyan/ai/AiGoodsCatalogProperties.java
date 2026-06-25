package com.projectcyan.ai;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Component
@ConfigurationProperties(prefix = "project-cyan.ai-catalog")
public class AiGoodsCatalogProperties {

	private boolean enabled;
	private String bucket = "ai-catalog";
	private String path = "";
	private String latestFileName = "goods-catalog-latest.tsv";
	private String cron = "0 */5 * * * *";
	private String zone = "Asia/Seoul";
	private long signedUrlTtlSeconds = 604800;

	public boolean isEnabled() {
		return enabled;
	}

	public void setEnabled(boolean enabled) {
		this.enabled = enabled;
	}

	public String getBucket() {
		return bucket;
	}

	public void setBucket(String bucket) {
		this.bucket = bucket;
	}

	public String getPath() {
		return path;
	}

	public void setPath(String path) {
		this.path = path;
	}

	public String getLatestFileName() {
		return latestFileName;
	}

	public void setLatestFileName(String latestFileName) {
		this.latestFileName = latestFileName;
	}

	public String getCron() {
		return cron;
	}

	public void setCron(String cron) {
		this.cron = cron;
	}

	public String getZone() {
		return zone;
	}

	public void setZone(String zone) {
		this.zone = zone;
	}

	public long getSignedUrlTtlSeconds() {
		return signedUrlTtlSeconds;
	}

	public void setSignedUrlTtlSeconds(long signedUrlTtlSeconds) {
		this.signedUrlTtlSeconds = signedUrlTtlSeconds;
	}
}
