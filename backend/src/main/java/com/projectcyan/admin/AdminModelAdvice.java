package com.projectcyan.admin;

import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ModelAttribute;

@ControllerAdvice
public class AdminModelAdvice {

	private final SupabaseUsageCounter supabaseUsageCounter;

	public AdminModelAdvice(SupabaseUsageCounter supabaseUsageCounter) {
		this.supabaseUsageCounter = supabaseUsageCounter;
	}

	@ModelAttribute("supabaseUsage")
	public SupabaseUsageSnapshot supabaseUsage() {
		return supabaseUsageCounter.snapshot();
	}
}
