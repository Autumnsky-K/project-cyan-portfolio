package com.projectcyan.ai;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.List;

import com.projectcyan.cart.CartResponse;
import com.projectcyan.cart.CartService;
import com.projectcyan.goods.GoodsFavoriteService;
import com.projectcyan.member.FavoriteArtistResponse;
import com.projectcyan.member.FavoriteArtistService;
import com.projectcyan.virtualchat.VirtualChatService;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class AiPersonalizationServiceTest {

	private FavoriteArtistService favoriteArtistService;
	private GoodsFavoriteService goodsFavoriteService;
	private CartService cartService;
	private AiPersonalizationRepository personalizationRepository;
	private VirtualChatService virtualChatService;
	private AiPersonalizationService personalizationService;

	@BeforeEach
	void setUp() {
		favoriteArtistService = mock(FavoriteArtistService.class);
		goodsFavoriteService = mock(GoodsFavoriteService.class);
		cartService = mock(CartService.class);
		personalizationRepository = mock(AiPersonalizationRepository.class);
		virtualChatService = mock(VirtualChatService.class);
		personalizationService = new AiPersonalizationService(
			favoriteArtistService,
			goodsFavoriteService,
			cartService,
			personalizationRepository,
			virtualChatService
		);
	}

	@Test
	void assemblesContextOnlyForAuthenticatedMember() {
		Long memberId = 7L;
		List<FavoriteArtistResponse> artists = List.of(new FavoriteArtistResponse(3L, "아이유", null));
		when(favoriteArtistService.findFavoriteArtists(memberId)).thenReturn(artists);
		when(goodsFavoriteService.findFavoriteGoods(memberId)).thenReturn(List.of());
		when(cartService.findCart(memberId)).thenReturn(new CartResponse(null, List.of(), 0, 0));
		when(personalizationRepository.findRecentPurchasedGoods(memberId, 20)).thenReturn(List.of());
		when(virtualChatService.findRecentSessionContexts(memberId, 99L, 3)).thenReturn(List.of());

		AiPersonalizationResponse response = personalizationService.findContext(memberId, 99L, 3);

		assertThat(response.favoriteArtists()).isEqualTo(artists);
		assertThat(response.favoriteGoods()).isEmpty();
		assertThat(response.cartItems()).isEmpty();
		assertThat(response.recentPurchasedGoods()).isEmpty();
		assertThat(response.recentChatSessions()).isEmpty();
		verify(virtualChatService).findRecentSessionContexts(memberId, 99L, 3);
	}
}
