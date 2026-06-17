package com.projectcyan.storage;

import jakarta.validation.constraints.NotBlank;

public class AdminStoragePathForm {

	@NotBlank
	private String bucketName;

	@NotBlank
	private String path;

	public String getBucketName() {
		return bucketName;
	}

	public void setBucketName(String bucketName) {
		this.bucketName = bucketName;
	}

	public String getPath() {
		return path;
	}

	public void setPath(String path) {
		this.path = path;
	}
}
