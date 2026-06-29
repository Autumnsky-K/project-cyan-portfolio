package com.projectcyan.ai;

import java.util.List;

import com.projectcyan.cart.CartItemResponse;
import com.projectcyan.goods.GoodsSummaryResponse;
import com.projectcyan.member.FavoriteArtistResponse;
import com.projectcyan.virtualchat.RecentChatSessionContextResponse;

public record AiPersonalizationResponse(
	List<FavoriteArtistResponse> favoriteArtists,
	List<GoodsSummaryResponse> favoriteGoods,
	List<CartItemResponse> cartItems,
	List<AiPurchasedGoodsResponse> recentPurchasedGoods,
	List<RecentChatSessionContextResponse> recentChatSessions
) {
}
