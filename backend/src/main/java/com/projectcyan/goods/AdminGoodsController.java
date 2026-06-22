package com.projectcyan.goods;

import java.net.URI;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/admin/goods")
public class AdminGoodsController {

	private final AdminGoodsService adminGoodsService;

	public AdminGoodsController(AdminGoodsService adminGoodsService) {
		this.adminGoodsService = adminGoodsService;
	}

	@PostMapping
	public ResponseEntity<GoodsDetailResponse> createGoods(@Valid @RequestBody AdminGoodsRequest request) {
		GoodsDetailResponse response = adminGoodsService.createGoods(request);
		return ResponseEntity
			.created(URI.create("/api/goods/" + response.goodsId()))
			.body(response);
	}

	@PutMapping("/{goodsId}")
	public GoodsDetailResponse updateGoods(
		@PathVariable Long goodsId,
		@Valid @RequestBody AdminGoodsRequest request
	) {
		return adminGoodsService.updateGoods(goodsId, request);
	}

	@PatchMapping("/{goodsId}/status")
	public GoodsDetailResponse updateSalesStatus(
		@PathVariable Long goodsId,
		@Valid @RequestBody GoodsStatusUpdateRequest request
	) {
		return adminGoodsService.updateSalesStatus(goodsId, request);
	}

	@PatchMapping("/{goodsId}/stock")
	public GoodsDetailResponse updateStock(
		@PathVariable Long goodsId,
		@Valid @RequestBody GoodsStockUpdateRequest request
	) {
		return adminGoodsService.updateStock(goodsId, request);
	}

	@PatchMapping("/{goodsId}/discontinue")
	public ResponseEntity<Void> discontinueGoods(@PathVariable Long goodsId) {
		adminGoodsService.discontinueGoods(goodsId);
		return ResponseEntity.noContent().build();
	}
}
