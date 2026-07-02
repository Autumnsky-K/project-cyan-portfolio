package com.projectcyan.member;

import java.time.Instant;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, Long> {

	Optional<PasswordResetToken> findByTokenHash(String tokenHash);

	@Modifying
	@Query("""
		update PasswordResetToken token
		set token.usedAt = :usedAt
		where token.memberId = :memberId
			and token.usedAt is null
		""")
	void markUnusedTokensUsed(@Param("memberId") Long memberId, @Param("usedAt") Instant usedAt);
}
