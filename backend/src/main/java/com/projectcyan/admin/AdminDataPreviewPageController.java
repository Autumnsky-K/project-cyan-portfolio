package com.projectcyan.admin;

import java.util.List;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class AdminDataPreviewPageController {

	@GetMapping("/admin/data")
	public String dataPreview(Model model) {
		model.addAttribute("dataAreas", List.of(
			new DataArea("굿즈 데이터", "상품명, 가격, 태그, 판매 상태, 재고를 관리합니다.", "/admin/goods", "운영 가능"),
			new DataArea("이미지 저장소", "Supabase Bucket과 이미지 경로를 관리합니다.", "/admin/storage", "운영 가능"),
			new DataArea("홈 콘텐츠 데이터", "홈 화면 문구, 색상, 이미지를 관리합니다.", "/admin/content/home", "운영 가능"),
			new DataArea("아티스트 콘텐츠 데이터", "아티스트 노출, 정렬, 소개 문구를 관리합니다.", "/admin/content/artists", "운영 가능"),
			new DataArea("회원 데이터", "회원 프로필과 권한 데이터 영역입니다.", "/admin/members", "운영 가능"),
			new DataArea("배송 데이터", "배송지, 배송 상태, 주문 배송 데이터 영역입니다.", "", "준비 중")
		));
		return "admin/data/index";
	}

	public record DataArea(String title, String description, String href, String status) {
	}
}
