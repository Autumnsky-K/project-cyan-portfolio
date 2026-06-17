package com.projectcyan.storage;

import com.fasterxml.jackson.annotation.JsonProperty;

public record SupabaseStorageBucket(
	String id,
	String name,
	@JsonProperty("public")
	Boolean publicBucket,
	@JsonProperty("created_at")
	String createdAt,
	@JsonProperty("updated_at")
	String updatedAt
) {
}
