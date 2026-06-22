package com.projectcyan.admin;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@Controller
public class AdminUiPreviewPageController {

	private static final Pattern REACT_ROUTE_PATTERN = Pattern.compile("<Route\\s+path=\"([^\"]+)\"");

	private final String frontendPreviewBaseUrl;

	public AdminUiPreviewPageController(
		@Value("${project-cyan.frontend.preview-base-url:http://localhost:5173}") String frontendPreviewBaseUrl
	) {
		this.frontendPreviewBaseUrl = trimTrailingSlash(frontendPreviewBaseUrl);
	}

	@GetMapping("/admin/ui")
	public String previewAll(Model model) {
		model.addAttribute("pages", previewPages());
		return "admin/ui/index";
	}

	@GetMapping("/admin/ui/{pageKey}")
	public String previewPage(@PathVariable String pageKey, Model model) {
		AdminPreviewPage selectedPage = previewPages().stream()
			.filter(page -> page.key().equals(pageKey))
			.findFirst()
			.orElseGet(() -> previewPages().getFirst());

		model.addAttribute("page", selectedPage);
		model.addAttribute("currentKey", "ui-" + selectedPage.key());
		model.addAttribute("pages", previewPages());
		return "admin/ui/page";
	}

	private List<AdminPreviewPage> previewPages() {
		Map<String, AdminPreviewPage> pages = new LinkedHashMap<>();
		addPage(pages, "home", "홈 화면 미리보기", "메인 진입 화면", "/", true, false);
		addPage(pages, "artists", "아티스트 화면 미리보기", "아티스트 카드와 검색 화면", "/artists", true, false);
		addPage(pages, "goods", "굿즈 화면 미리보기", "상품 목록과 필터 화면", "/goods", true, false);
		addPage(pages, "cart", "장바구니 화면 미리보기", "선택 상품과 결제 진입 화면", "/cart", true, false);
		addPage(pages, "login", "로그인 화면 미리보기", "회원 로그인 화면", "/login", true, false);
		addPage(pages, "signup", "회원가입 화면 미리보기", "신규 회원 가입 화면", "/signup", true, false);
		addPage(pages, "member-profile", "회원 프로필 화면 미리보기", "마이페이지 개인 정보 영역", "/account", false, false);
		addPage(pages, "shipping", "배송 화면 미리보기", "배송지, 배송 상태, 주문 배송 정보", "/shipping", false, false);

		for (String route : detectedReactRoutes()) {
			String key = routeToKey(route);
			if (!pages.containsKey(key)) {
				addPage(pages, key, route + " 자동 감지 화면", "React 라우트 자동 감지", route, true, true);
			}
		}

		return new ArrayList<>(pages.values());
	}

	private void addPage(
		Map<String, AdminPreviewPage> pages,
		String key,
		String title,
		String purpose,
		String route,
		boolean implemented,
		boolean autoDetected
	) {
		pages.put(key, new AdminPreviewPage(
			key,
			title,
			purpose,
			route,
			implemented ? frontendPreviewBaseUrl + sampleRoute(route) : "",
			implemented,
			autoDetected
		));
	}

	private List<String> detectedReactRoutes() {
		Path appFile = Path.of(System.getProperty("user.dir"))
			.resolve("../frontend/src/App.jsx")
			.normalize();
		if (!Files.exists(appFile)) {
			return List.of();
		}

		try {
			String source = Files.readString(appFile);
			Matcher matcher = REACT_ROUTE_PATTERN.matcher(source);
			List<String> routes = new ArrayList<>();
			while (matcher.find()) {
				routes.add(matcher.group(1));
			}
			return routes;
		} catch (IOException exception) {
			return List.of();
		}
	}

	private String sampleRoute(String route) {
		if (route.contains(":goodsId")) {
			return route.replace(":goodsId", "1001");
		}
		return route;
	}

	private String routeToKey(String route) {
		if ("/".equals(route)) {
			return "home";
		}
		return route.replaceAll("^/+", "")
			.replaceAll("[^A-Za-z0-9]+", "-")
			.replaceAll("^-|-$", "");
	}

	private static String trimTrailingSlash(String value) {
		if (value == null || value.isBlank()) {
			return "http://localhost:5173";
		}
		return value.endsWith("/") ? value.substring(0, value.length() - 1) : value;
	}
}
