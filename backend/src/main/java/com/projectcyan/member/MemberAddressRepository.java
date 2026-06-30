package com.projectcyan.member;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface MemberAddressRepository extends JpaRepository<MemberAddress, Long> {

	Optional<MemberAddress> findFirstByMemberMemberIdAndDefaultAddressTrueOrderByAddressIdDesc(Long memberId);

	Optional<MemberAddress> findFirstByMemberMemberIdOrderByAddressIdDesc(Long memberId);
}
