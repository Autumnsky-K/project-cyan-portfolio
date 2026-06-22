package com.projectcyan.goods;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/goods")
public class GoodsController {

	private final GoodsService goodsService;

	public GoodsController(GoodsService goodsService) {
		this.goodsService = goodsService;
	}

	@GetMapping
	public PageResponse<GoodsSummaryResponse> findGoods(
		@RequestParam(required = false) String q,
		@RequestParam(required = false) Long artistId,
		@RequestParam(required = false) Long categoryId,
		@RequestParam(required = false) String tag,
		@RequestParam(defaultValue = "0") int page,
		@RequestParam(defaultValue = "20") int size,
		@RequestParam(defaultValue = "createdAt,desc") String sort
	) {
		return goodsService.findGoods(q, artistId, categoryId, tag, page, size, sort);
	}

	@GetMapping("/{goodsId}")
	public GoodsDetailResponse findGoodsDetail(@PathVariable Long goodsId) {
		return goodsService.findGoodsDetail(goodsId);
	}
}
