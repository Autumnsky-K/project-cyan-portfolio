package com.projectcyan.member;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface MemberRepository extends JpaRepository<Member, Long> {

	java.util.List<Member> findAllByOrderByMemberIdDesc();

	boolean existsByEmailAndStatus(String email, String status);

	Optional<Member> findByEmail(String email);

	@Query(value = """
		select exists (
			select 1
			from public.member
			where regexp_replace(coalesce(phone, ''), '\\D', '', 'g') = :phoneDigits
				and status = 'ACTIVE'
		)
		""", nativeQuery = true)
	boolean existsActiveByPhoneDigits(@Param("phoneDigits") String phoneDigits);

	@Query(value = """
		select exists (
			select 1
			from public.member
			where member_id <> :memberId
				and regexp_replace(coalesce(phone, ''), '\\D', '', 'g') = :phoneDigits
		)
		""", nativeQuery = true)
	boolean existsByPhoneDigitsExcludingMemberId(@Param("phoneDigits") String phoneDigits, @Param("memberId") Long memberId);

	Optional<Member> findByMemberUuid(UUID memberUuid);
}
