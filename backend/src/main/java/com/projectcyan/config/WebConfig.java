package com.projectcyan.config;

import java.util.List;

import com.projectcyan.admin.auth.AdminAuthInterceptor;
import com.projectcyan.member.auth.CurrentMemberArgumentResolver;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import org.springframework.web.method.support.HandlerMethodArgumentResolver;

@Configuration
public class WebConfig implements WebMvcConfigurer {

	private final AdminAuthInterceptor adminAuthInterceptor;
	private final CurrentMemberArgumentResolver currentMemberArgumentResolver;

	public WebConfig(
		AdminAuthInterceptor adminAuthInterceptor,
		CurrentMemberArgumentResolver currentMemberArgumentResolver
	) {
		this.adminAuthInterceptor = adminAuthInterceptor;
		this.currentMemberArgumentResolver = currentMemberArgumentResolver;
	}

	@Override
	public void addCorsMappings(CorsRegistry registry) {
		registry.addMapping("/api/**")
			.allowedOrigins("http://localhost:5173", "http://127.0.0.1:5173")
			.allowedMethods("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS")
			.allowedHeaders("*");
	}

	@Override
	public void addInterceptors(InterceptorRegistry registry) {
		registry.addInterceptor(adminAuthInterceptor)
			.addPathPatterns("/admin/**", "/api/admin/**")
			.excludePathPatterns(
				"/admin/login",
				"/admin/auth/**",
				"/admin/login.css",
				"/admin/login.js"
			);
	}

	@Override
	public void addArgumentResolvers(List<HandlerMethodArgumentResolver> resolvers) {
		resolvers.add(currentMemberArgumentResolver);
	}
}
