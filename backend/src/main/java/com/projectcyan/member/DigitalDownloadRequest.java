package com.projectcyan.member;

public record DigitalDownloadRequest(
	Long assetId,
	String browserFingerprint
) {
}
