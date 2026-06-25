package com.projectcyan.ai;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/ai/goods-catalog")
public class AiGoodsCatalogApiController {

	private final AiGoodsCatalogService catalogService;

	public AiGoodsCatalogApiController(AiGoodsCatalogService catalogService) {
		this.catalogService = catalogService;
	}

	@GetMapping("/latest")
	public AiGoodsCatalogLatestResponse findLatestCatalog() {
		return AiGoodsCatalogLatestResponse.from(catalogService.findLatestSuccessfulSnapshot());
	}
}
