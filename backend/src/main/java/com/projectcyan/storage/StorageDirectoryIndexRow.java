package com.projectcyan.storage;

import java.time.Instant;

public record StorageDirectoryIndexRow(
	String bucketName,
	String path,
	String parentPath,
	int depth,
	int imageCount,
	String lastFileName,
	String lastObjectPath,
	int otherFileCount,
	String otherExtensionSummary,
	String lastOtherFileName,
	Instant indexedAt
) {
	public String treePath() {
		return path == null || path.isBlank() ? bucketName : bucketName + "/" + path;
	}
}
