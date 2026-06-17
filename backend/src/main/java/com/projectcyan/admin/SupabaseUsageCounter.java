package com.projectcyan.admin;

import java.time.Instant;
import java.util.concurrent.atomic.AtomicLong;
import java.util.concurrent.atomic.AtomicReference;

import org.springframework.stereotype.Service;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

@Service
public class SupabaseUsageCounter {

	private final AtomicLong writeCount = new AtomicLong();
	private final AtomicReference<String> lastEvent = new AtomicReference<>("");
	private final AtomicReference<Instant> lastEventAt = new AtomicReference<>();

	public void recordWrite(String event) {
		if (TransactionSynchronizationManager.isSynchronizationActive()) {
			TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
				@Override
				public void afterCommit() {
					increment(event);
				}
			});
			return;
		}

		increment(event);
	}

	public SupabaseUsageSnapshot snapshot() {
		return new SupabaseUsageSnapshot(writeCount.get(), lastEvent.get(), lastEventAt.get());
	}

	private void increment(String event) {
		writeCount.incrementAndGet();
		lastEvent.set(event == null || event.isBlank() ? "Supabase write" : event.trim());
		lastEventAt.set(Instant.now());
	}
}
