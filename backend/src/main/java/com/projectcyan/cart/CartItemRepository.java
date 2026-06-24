package com.projectcyan.cart;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CartItemRepository extends JpaRepository<CartItem, Long> {

	@EntityGraph(attributePaths = {"goods", "goods.artist", "goods.category", "goods.tags"})
	List<CartItem> findByCartMemberIdOrderByCreatedAtAscCartItemIdAsc(Long memberId);

	@EntityGraph(attributePaths = {"goods", "goods.artist", "goods.category", "goods.tags"})
	Optional<CartItem> findByCartMemberIdAndCartItemId(Long memberId, Long cartItemId);

	Optional<CartItem> findByCartCartIdAndGoodsGoodsId(Long cartId, Long goodsId);

	void deleteByCartMemberId(Long memberId);
}
