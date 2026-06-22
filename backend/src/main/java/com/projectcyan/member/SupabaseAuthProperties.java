package com.projectcyan.member;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Component
@ConfigurationProperties(prefix = "supabase.auth")
public class SupabaseAuthProperties {

	private String projectUrl;
	private String serviceRoleKey;

	public String getProjectUrl() {
		return projectUrl;
	}

	public void setProjectUrl(String projectUrl) {
		this.projectUrl = projectUrl;
	}

	public String getServiceRoleKey() {
		return serviceRoleKey;
	}

	public void setServiceRoleKey(String serviceRoleKey) {
		this.serviceRoleKey = serviceRoleKey;
	}
}
