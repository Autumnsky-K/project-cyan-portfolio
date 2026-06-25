package com.projectcyan.admin;

public record AdminPreviewPage(
	String key,
	String title,
	String purpose,
	String route,
	String previewUrl,
	boolean implemented,
	boolean autoDetected
) {
	public String shortTitle() {
		return switch (key) {
			case "home" -> "홈 화면";
			case "artists" -> "아티스트";
			case "goods" -> "굿즈";
			case "cart" -> "장바구니";
			case "login" -> "로그인";
			case "signup" -> "회원가입";
			case "member-profile" -> "프로필";
			case "shipping" -> "배송";
			default -> route == null || route.isBlank() ? title : route;
		};
	}
}
