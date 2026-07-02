package com.projectcyan.checkout;

import java.util.Optional;

import jakarta.persistence.LockModeType;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;

public interface PaymentRepository extends JpaRepository<Payment, Long> {

	@Override
	@Lock(LockModeType.PESSIMISTIC_WRITE)
	Optional<Payment> findById(Long paymentId);

	@Lock(LockModeType.PESSIMISTIC_WRITE)
	Optional<Payment> findByOrder_OrderId(Long orderId);

	@Lock(LockModeType.PESSIMISTIC_WRITE)
	Optional<Payment> findByProviderOrderId(String providerOrderId);
}
