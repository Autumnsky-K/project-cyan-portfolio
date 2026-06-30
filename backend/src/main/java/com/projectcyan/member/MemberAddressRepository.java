package com.projectcyan.member;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface MemberAddressRepository extends JpaRepository<MemberAddress, Long> {

	Optional<MemberAddress> findFirstByMemberMemberIdOrderByDefaultAddressDescAddressIdAsc(Long memberId);

	void deleteByMemberMemberId(Long memberId);
}
