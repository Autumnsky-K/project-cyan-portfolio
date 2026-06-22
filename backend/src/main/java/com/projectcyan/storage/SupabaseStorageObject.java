package com.projectcyan.storage;

public record SupabaseStorageObject(
	String bucketName,
	String path,
	String name,
	String publicUrl,
	Long size,
	String updatedAt
) {
}
