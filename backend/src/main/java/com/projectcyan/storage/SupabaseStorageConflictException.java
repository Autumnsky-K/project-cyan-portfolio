package com.projectcyan.storage;

public class SupabaseStorageConflictException extends SupabaseStorageException {

	private final String bucketName;
	private final String path;
	private final String name;
	private final String reason;
	private final Long existingSize;
	private final Long incomingSize;

	public SupabaseStorageConflictException(
		String message,
		String bucketName,
		String path,
		String name,
		String reason,
		Long existingSize,
		Long incomingSize
	) {
		super(message);
		this.bucketName = bucketName;
		this.path = path;
		this.name = name;
		this.reason = reason;
		this.existingSize = existingSize;
		this.incomingSize = incomingSize;
	}

	public String bucketName() {
		return bucketName;
	}

	public String path() {
		return path;
	}

	public String name() {
		return name;
	}

	public String reason() {
		return reason;
	}

	public Long existingSize() {
		return existingSize;
	}

	public Long incomingSize() {
		return incomingSize;
	}
}
