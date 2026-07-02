package com.projectcyan.member;

import java.time.Duration;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Component
@ConfigurationProperties(prefix = "project-cyan.password-reset")
public class PasswordResetProperties {

	private String frontendBaseUrl = "http://localhost:5173";
	private Duration tokenTtl = Duration.ofMinutes(30);
	private String from = "";

	public String getFrontendBaseUrl() {
		return frontendBaseUrl;
	}

	public void setFrontendBaseUrl(String frontendBaseUrl) {
		this.frontendBaseUrl = frontendBaseUrl;
	}

	public Duration getTokenTtl() {
		return tokenTtl;
	}

	public void setTokenTtl(Duration tokenTtl) {
		this.tokenTtl = tokenTtl;
	}

	public String getFrom() {
		return from;
	}

	public void setFrom(String from) {
		this.from = from;
	}
}
