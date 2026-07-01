package com.projectcyan.storage;

public record SupabaseStorageWriteResult(
	SupabaseStorageObject object,
	boolean created
) {
}
