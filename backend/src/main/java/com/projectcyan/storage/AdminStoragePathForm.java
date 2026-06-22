package com.projectcyan.storage;

import jakarta.validation.constraints.NotBlank;

public class AdminStoragePathForm {

	@NotBlank(message = "Bucket 선택은 필수입니다.")
	private String bucketName;

	@NotBlank(message = "Path는 필수입니다.")
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
