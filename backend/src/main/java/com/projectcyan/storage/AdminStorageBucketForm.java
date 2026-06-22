package com.projectcyan.storage;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public class AdminStorageBucketForm {

	@NotBlank(message = "Bucket 이름은 필수입니다.")
	@Size(max = 63, message = "Bucket 이름은 63자 이하로 입력하세요.")
	@Pattern(regexp = "^[a-z0-9](?:[a-z0-9._-]*[a-z0-9])?$", message = "소문자, 숫자, 점, 밑줄, 하이픈만 사용할 수 있습니다.")
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
