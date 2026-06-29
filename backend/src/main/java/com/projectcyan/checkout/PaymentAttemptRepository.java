package com.projectcyan.checkout;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface PaymentAttemptRepository extends JpaRepository<PaymentAttempt, Long> {

	Optional<PaymentAttempt> findFirstByOrder_OrderIdOrderByRequestedAtDesc(Long orderId);

	Optional<PaymentAttempt> findFirstByOrder_OrderNoOrderByRequestedAtDesc(String orderNo);
}
