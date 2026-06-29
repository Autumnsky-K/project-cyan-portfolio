package com.projectcyan.ai;

import com.projectcyan.cart.CartService;
import com.projectcyan.goods.GoodsFavoriteService;
import com.projectcyan.member.FavoriteArtistService;
import com.projectcyan.virtualchat.VirtualChatService;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AiPersonalizationService {

	private static final int RECENT_PURCHASE_LIMIT = 20;

	private final FavoriteArtistService favoriteArtistService;
	private final GoodsFavoriteService goodsFavoriteService;
	private final CartService cartService;
	private final AiPersonalizationRepository personalizationRepository;
	private final VirtualChatService virtualChatService;

	public AiPersonalizationService(
		FavoriteArtistService favoriteArtistService,
		GoodsFavoriteService goodsFavoriteService,
		CartService cartService,
		AiPersonalizationRepository personalizationRepository,
		VirtualChatService virtualChatService
	) {
		this.favoriteArtistService = favoriteArtistService;
		this.goodsFavoriteService = goodsFavoriteService;
		this.cartService = cartService;
		this.personalizationRepository = personalizationRepository;
		this.virtualChatService = virtualChatService;
	}

	@Transactional(readOnly = true)
	public AiPersonalizationResponse findContext(
		Long memberId,
		Long excludeSessionId,
		int recentSessionLimit
	) {
		return new AiPersonalizationResponse(
			favoriteArtistService.findFavoriteArtists(memberId),
			goodsFavoriteService.findFavoriteGoods(memberId),
			cartService.findCart(memberId).items(),
			personalizationRepository.findRecentPurchasedGoods(memberId, RECENT_PURCHASE_LIMIT),
			virtualChatService.findRecentSessionContexts(memberId, excludeSessionId, recentSessionLimit)
		);
	}
}
