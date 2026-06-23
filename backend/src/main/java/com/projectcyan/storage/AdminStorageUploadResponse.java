package com.projectcyan.storage;

public record AdminStorageUploadResponse(
	String bucketName,
	String path,
	String name,
	String publicUrl,
	Long size,
	String error,
	boolean conflict,
	String conflictReason,
	Long existingSize,
	Long incomingSize
) {
	public static AdminStorageUploadResponse from(SupabaseStorageObject object) {
		return new AdminStorageUploadResponse(
			object.bucketName(),
			object.path(),
			object.name(),
			object.publicUrl(),
			object.size(),
			null,
			false,
			null,
			null,
			null
		);
	}

	public static AdminStorageUploadResponse error(String message) {
		return new AdminStorageUploadResponse(null, null, null, null, null, message, false, null, null, null);
	}

	public static AdminStorageUploadResponse conflict(SupabaseStorageConflictException exception) {
		return new AdminStorageUploadResponse(
			exception.bucketName(),
			exception.path(),
			exception.name(),
			null,
			null,
			exception.getMessage(),
			true,
			exception.reason(),
			exception.existingSize(),
			exception.incomingSize()
		);
	}
}
