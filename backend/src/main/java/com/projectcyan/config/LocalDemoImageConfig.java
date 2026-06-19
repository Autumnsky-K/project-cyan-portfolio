package com.projectcyan.config;

import java.nio.file.Path;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
@Profile("local")
@EnableScheduling
public class LocalDemoImageConfig implements WebMvcConfigurer {

	private final Path imageRoot;

	public LocalDemoImageConfig(@Value("${demo.images.root}") String imageRoot) {
		this.imageRoot = Path.of(imageRoot).toAbsolutePath().normalize();
	}

	@Override
	public void addResourceHandlers(ResourceHandlerRegistry registry) {
		String location = imageRoot.toUri().toString();
		if (!location.endsWith("/")) {
			location += "/";
		}
		registry.addResourceHandler("/demo-source/**")
			.addResourceLocations(location);
	}
}
