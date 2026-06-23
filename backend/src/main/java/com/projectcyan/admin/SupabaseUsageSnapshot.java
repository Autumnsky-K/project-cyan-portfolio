package com.projectcyan.admin;

import java.time.Instant;

public record SupabaseUsageSnapshot(
	long writeCount,
	String lastEvent,
	Instant lastEventAt
) {
	public boolean hasWrites() {
		return writeCount > 0;
	}
}
