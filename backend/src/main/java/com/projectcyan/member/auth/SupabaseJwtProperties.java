package com.projectcyan.member.auth;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

@Component
@ConfigurationProperties(prefix = "supabase.jwt")
public class SupabaseJwtProperties {

	private String issuer;
	private String jwksUrl;
	private String audience = "authenticated";

	public String getIssuer() {
		return issuer;
	}

	public void setIssuer(String issuer) {
		this.issuer = issuer;
	}

	public String getJwksUrl() {
		return jwksUrl;
	}

	public void setJwksUrl(String jwksUrl) {
		this.jwksUrl = jwksUrl;
	}

	public String getAudience() {
		return audience;
	}

	public void setAudience(String audience) {
		this.audience = audience;
	}

	boolean isConfigured() {
		return StringUtils.hasText(issuer)
			&& StringUtils.hasText(jwksUrl)
			&& StringUtils.hasText(audience);
	}
}
