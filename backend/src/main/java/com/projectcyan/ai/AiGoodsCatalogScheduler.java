package com.projectcyan.ai;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class AiGoodsCatalogScheduler {

	private final AiGoodsCatalogService catalogService;
	private final AiGoodsCatalogProperties properties;

	public AiGoodsCatalogScheduler(AiGoodsCatalogService catalogService, AiGoodsCatalogProperties properties) {
		this.catalogService = catalogService;
		this.properties = properties;
	}

	@Scheduled(cron = "${project-cyan.ai-catalog.cron:0 */5 * * * *}", zone = "${project-cyan.ai-catalog.zone:Asia/Seoul}")
	public void exportCatalogOnSchedule() {
		if (!properties.isEnabled()) {
			return;
		}
		catalogService.exportCatalog();
	}
}
