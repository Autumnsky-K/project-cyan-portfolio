package com.projectcyan.checkout;

import org.springframework.data.jpa.repository.JpaRepository;

public interface StoreOrderRepository extends JpaRepository<StoreOrder, Long> {

	boolean existsByOrderNo(String orderNo);
}
