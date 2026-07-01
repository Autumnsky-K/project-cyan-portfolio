package com.projectcyan.member;

public record AdminMemberForm(
	String email,
	String password,
	String name,
	String phone,
	String address,
	String memberGrade,
	String status
) {
	public static AdminMemberForm blank() {
		return new AdminMemberForm("", "", "", "", "", "BASIC", "ACTIVE");
	}
}
