package com.projectcyan.storage;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public class AdminStorageBucketForm {

	@NotBlank
	@Size(max = 63)
	@Pattern(regexp = "^[a-z0-9](?:[a-z0-9._-]*[a-z0-9])?$", message = "Use lowercase letters, numbers, dots, underscores, or hyphens.")
	private String bucketName;

	private boolean publicBucket = true;

	public String getBucketName() {
		return bucketName;
	}

	public void setBucketName(String bucketName) {
		this.bucketName = bucketName;
	}

	public boolean isPublicBucket() {
		return publicBucket;
	}

	public void setPublicBucket(boolean publicBucket) {
		this.publicBucket = publicBucket;
	}
}
