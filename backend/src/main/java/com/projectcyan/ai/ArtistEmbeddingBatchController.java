package com.projectcyan.ai;

import java.util.List;
import java.util.Map;

import com.projectcyan.common.ApiErrorException;
import com.projectcyan.goods.ArtistEmbeddingRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/ai/artist-embeddings")
public class ArtistEmbeddingBatchController {

	private final ArtistEmbeddingRepository artistEmbeddingRepository;
	private final String serviceToken;

	public ArtistEmbeddingBatchController(
		ArtistEmbeddingRepository artistEmbeddingRepository,
		@Value("${project-cyan.ai-service.internal-token:}") String serviceToken
	) {
		this.artistEmbeddingRepository = artistEmbeddingRepository;
		this.serviceToken = serviceToken;
	}

	@PostMapping
	public Map<String, Object> upsertEmbeddings(
		@RequestBody List<ArtistEmbeddingItem> items,
		@RequestHeader(value = "X-Project-Cyan-Service-Token", required = false) String requestToken
	) {
		if (!serviceToken.isBlank() && !serviceToken.equals(requestToken)) {
			throw new ApiErrorException("AI_SERVICE_UNAUTHORIZED", "AI 서비스 인증이 필요합니다.", HttpStatus.UNAUTHORIZED);
		}
		for (ArtistEmbeddingItem item : items) {
			artistEmbeddingRepository.upsert(
				item.artistId(),
				item.embeddingArray(),
				item.embeddingModel(),
				item.sourceTextHash()
			);
		}
		return Map.of("upsertedCount", items.size());
	}
}
