package com.projectcyan.checkout;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface PaymentRepository extends JpaRepository<Payment, Long> {

	Optional<Payment> findByOrder_OrderId(Long orderId);

	Optional<Payment> findByProviderOrderId(String providerOrderId);
}
