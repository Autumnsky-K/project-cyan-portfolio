package com.projectcyan.ai;

import java.util.List;
import java.util.Map;

import com.projectcyan.common.ApiErrorException;
import com.projectcyan.goods.GoodsEmbeddingRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/ai/goods-embeddings")
public class GoodsEmbeddingBatchController {

	private final GoodsEmbeddingRepository goodsEmbeddingRepository;
	private final String serviceToken;

	public GoodsEmbeddingBatchController(
		GoodsEmbeddingRepository goodsEmbeddingRepository,
		@Value("${project-cyan.ai-service.internal-token:}") String serviceToken
	) {
		this.goodsEmbeddingRepository = goodsEmbeddingRepository;
		this.serviceToken = serviceToken;
	}

	@PostMapping
	public Map<String, Object> upsertEmbeddings(
		@RequestBody List<GoodsEmbeddingItem> items,
		@RequestHeader(value = "X-Project-Cyan-Service-Token", required = false) String requestToken
	) {
		if (!serviceToken.isBlank() && !serviceToken.equals(requestToken)) {
			throw new ApiErrorException("AI_SERVICE_UNAUTHORIZED", "AI 서비스 인증이 필요합니다.", HttpStatus.UNAUTHORIZED);
		}
		for (GoodsEmbeddingItem item : items) {
			goodsEmbeddingRepository.upsert(
				item.goodsId(),
				item.embeddingArray(),
				item.embeddingModel(),
				item.sourceTextHash()
			);
		}
		return Map.of("upsertedCount", items.size());
	}
}
