package com.projectcyan.cms;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import com.projectcyan.storage.AdminStoragePageController;
import com.projectcyan.storage.SupabaseStorageProperties;
import com.projectcyan.storage.SupabaseStorageException;
import com.projectcyan.storage.SupabaseStorageService;

@Controller
public class AdminCmsPageController {

	private static final String CMS_STORAGE_BUCKET = "cms";

	private final CmsContentService cmsContentService;
	private final SupabaseStorageProperties storageProperties;
	private final SupabaseStorageService supabaseStorageService;

	public AdminCmsPageController(
		CmsContentService cmsContentService,
		SupabaseStorageProperties storageProperties,
		SupabaseStorageService supabaseStorageService
	) {
		this.cmsContentService = cmsContentService;
		this.storageProperties = storageProperties;
		this.supabaseStorageService = supabaseStorageService;
	}

	@GetMapping("/admin/content")
	public String redirectContentAdmin() {
		return "redirect:/admin/content/home";
	}

	@GetMapping("/admin/content/home")
	public String editHome(Model model) {
		model.addAttribute("page", cmsContentService.findPage("home"));
		addCmsStorageModel(model);
		return "admin/content/home";
	}

	@PostMapping("/admin/content/home")
	public String saveHome(
		CmsPageRequest request,
		RedirectAttributes redirectAttributes
	) {
		cmsContentService.savePage("home", request);
		redirectAttributes.addFlashAttribute("notice", "홈 화면 내용이 적용되었습니다.");
		return "redirect:/admin/content/home";
	}

	@GetMapping("/admin/content/artists")
	public String editArtists(Model model) {
		model.addAttribute("page", cmsContentService.findPage("artists"));
		model.addAttribute("artists", cmsContentService.findArtists(true));
		addCmsStorageModel(model);
		return "admin/content/artists";
	}

	@GetMapping("/admin/content/groups")
	public String editGroups(Model model) {
		List<CmsArtistProfileResponse> artists = cmsContentService.findArtists(true);
		model.addAttribute("groups", groupDrafts(artists));
		model.addAttribute("artists", artists);
		addCmsStorageModel(model);
		return "admin/content/groups";
	}

	@PostMapping("/admin/content/groups/artists")
	public String createGroupArtist(
		@RequestParam(required = false) Long artistId,
		@RequestParam(required = false) String name,
		@RequestParam(required = false) String groupName,
		@RequestParam(required = false) String imageUrl,
		@RequestParam(required = false) String lore,
		@RequestParam(required = false) String debutDate,
		@RequestParam(required = false) String collections,
		@RequestParam(required = false) Integer sortOrder,
		@RequestParam(required = false, defaultValue = "false") Boolean visible,
		RedirectAttributes redirectAttributes
	) {
		if (name == null || name.isBlank()) {
			redirectAttributes.addFlashAttribute("notice", "아티스트 이름은 필수입니다.");
			return "redirect:/admin/content/groups";
		}
		try {
			CmsArtistProfileResponse createdArtist = cmsContentService.createArtist(new CmsArtistProfileRequest(
				artistId,
				name,
				groupName,
				imageUrl,
				lore,
				debutDate,
				collections,
				sortOrder,
				visible
			));
			redirectAttributes.addFlashAttribute("notice", createdArtist.name() + " 아티스트가 Supabase CMS 테이블에 등록되었습니다.");
		} catch (DataIntegrityViolationException exception) {
			redirectAttributes.addFlashAttribute("notice", "이미 사용 중인 아티스트 ID입니다. ID를 비우거나 다른 값을 입력하세요.");
		} catch (IllegalArgumentException exception) {
			redirectAttributes.addFlashAttribute("notice", "등록 값 형식이 올바르지 않습니다. 날짜와 숫자 값을 확인하세요.");
		}
		return "redirect:/admin/content/groups";
	}

	@PostMapping("/admin/content/groups/artists/apply")
	public String applyGroupArtistChanges(
		@RequestParam(required = false) List<String> changeState,
		@RequestParam(required = false) List<String> originalArtistId,
		@RequestParam(required = false) List<String> artistId,
		@RequestParam(required = false) List<String> name,
		@RequestParam(required = false) List<String> groupName,
		@RequestParam(required = false) List<String> imageUrl,
		@RequestParam(required = false) List<String> lore,
		@RequestParam(required = false) List<String> debutDate,
		@RequestParam(required = false) List<String> collections,
		@RequestParam(required = false) List<String> sortOrder,
		@RequestParam(required = false) List<String> visible,
		RedirectAttributes redirectAttributes
	) {
		if (changeState == null || changeState.isEmpty()) {
			redirectAttributes.addFlashAttribute("notice", "적용할 변경사항이 없습니다.");
			return "redirect:/admin/content/groups";
		}

		List<CmsArtistProfileChangeRequest> changes = new ArrayList<>();
		for (int index = 0; index < changeState.size(); index++) {
			changes.add(new CmsArtistProfileChangeRequest(
				valueAt(changeState, index),
				longStringAt(originalArtistId, index),
				longStringAt(artistId, index),
				valueAt(name, index),
				valueAt(groupName, index),
				valueAt(imageUrl, index),
				valueAt(lore, index),
				valueAt(debutDate, index),
				valueAt(collections, index),
				intStringAt(sortOrder, index, 999),
				Boolean.parseBoolean(valueAt(visible, index, "false"))
			));
		}

		try {
			CmsArtistProfileChangeSummary summary = cmsContentService.applyArtistChanges(changes);
			redirectAttributes.addFlashAttribute(
				"notice",
				"변경사항이 적용되었습니다. 추가 " + summary.added() + "건, 수정 " + summary.modified() + "건, 삭제 " + summary.deleted() + "건"
			);
		} catch (DataIntegrityViolationException exception) {
			redirectAttributes.addFlashAttribute("notice", "아티스트 ID가 중복되었거나 DB 제약조건에 맞지 않아 적용하지 못했습니다.");
		} catch (IllegalArgumentException exception) {
			redirectAttributes.addFlashAttribute("notice", "변경 값 형식이 올바르지 않습니다. 날짜와 숫자 값을 확인하세요.");
		}
		return "redirect:/admin/content/groups";
	}

	@PostMapping("/admin/content/artists/page")
	public String saveArtistsPage(
		CmsPageRequest request,
		RedirectAttributes redirectAttributes
	) {
		cmsContentService.savePage("artists", request);
		redirectAttributes.addFlashAttribute("notice", "아티스트 화면 내용이 적용되었습니다.");
		return "redirect:/admin/content/artists";
	}

	@PostMapping("/admin/content/artists")
	public String saveArtists(
		@RequestParam(required = false) List<Long> artistId,
		@RequestParam(required = false) List<String> name,
		@RequestParam(required = false) List<String> groupName,
		@RequestParam(required = false) List<String> imageUrl,
		@RequestParam(required = false) List<String> lore,
		@RequestParam(required = false) List<String> debutDate,
		@RequestParam(required = false) List<String> collections,
		@RequestParam(required = false) List<Integer> sortOrder,
		@RequestParam(required = false) List<Long> visibleArtistId,
		RedirectAttributes redirectAttributes
	) {
		if (artistId == null || artistId.isEmpty()) {
			redirectAttributes.addFlashAttribute("notice", "적용할 아티스트 행이 없습니다.");
			return "redirect:/admin/content/artists";
		}

		Set<Long> visibleIds = visibleArtistId == null ? Set.of() : new HashSet<>(visibleArtistId);
		Map<Long, CmsArtistProfileResponse> currentArtists = cmsContentService.findArtists(true).stream()
			.collect(Collectors.toMap(CmsArtistProfileResponse::artistId, Function.identity()));
		List<CmsArtistProfileRequest> requests = new ArrayList<>();
		for (int index = 0; index < artistId.size(); index++) {
			Long currentArtistId = artistId.get(index);
			CmsArtistProfileResponse currentArtist = currentArtists.get(currentArtistId);
			requests.add(new CmsArtistProfileRequest(
				currentArtistId,
				valueAt(name, index, currentArtist == null ? "" : currentArtist.name()),
				valueAt(groupName, index, currentArtist == null ? "" : currentArtist.groupName()),
				valueAt(imageUrl, index, currentArtist == null ? "" : currentArtist.imageUrl()),
				valueAt(lore, index, currentArtist == null ? "" : currentArtist.lore()),
				valueAt(debutDate, index, currentArtist == null ? "" : currentArtist.debutDate()),
				valueAt(collections, index, currentArtist == null ? "" : currentArtist.collections()),
				intAt(sortOrder, index, currentArtist == null ? index + 1 : currentArtist.sortOrder()),
				visibleIds.contains(currentArtistId)
			));
		}
		cmsContentService.saveArtists(requests);
		redirectAttributes.addFlashAttribute("notice", "아티스트 목록이 적용되었습니다.");
		return "redirect:/admin/content/artists";
	}

	private String valueAt(List<String> values, int index) {
		if (values == null || index >= values.size()) {
			return "";
		}
		return values.get(index);
	}

	private String valueAt(List<String> values, int index, String fallback) {
		String value = valueAt(values, index);
		return value == null || value.isBlank() ? fallback : value;
	}

	private Integer intAt(List<Integer> values, int index, int fallback) {
		if (values == null || index >= values.size() || values.get(index) == null) {
			return fallback;
		}
		return values.get(index);
	}

	private Long longStringAt(List<String> values, int index) {
		String value = valueAt(values, index);
		if (value == null || value.isBlank()) {
			return null;
		}
		return Long.valueOf(value.trim());
	}

	private Integer intStringAt(List<String> values, int index, int fallback) {
		String value = valueAt(values, index);
		if (value == null || value.isBlank()) {
			return fallback;
		}
		return Integer.valueOf(value.trim());
	}

	private List<CmsGroupPageDraft> groupDrafts(List<CmsArtistProfileResponse> artists) {
		Map<String, List<CmsArtistProfileResponse>> groupedArtists = new LinkedHashMap<>();
		for (CmsArtistProfileResponse artist : artists) {
			String groupName = valueOrDefault(artist.groupName(), "미지정 그룹");
			groupedArtists.computeIfAbsent(groupName, ignored -> new ArrayList<>()).add(artist);
		}

		List<CmsGroupPageDraft> groups = new ArrayList<>();
		int index = 1;
		for (Map.Entry<String, List<CmsArtistProfileResponse>> entry : groupedArtists.entrySet()) {
			List<CmsArtistProfileResponse> groupArtists = entry.getValue();
			groups.add(new CmsGroupPageDraft(
				"group-" + index,
				entry.getKey(),
				groupArtists.stream().anyMatch(artist -> Boolean.TRUE.equals(artist.visible())),
				index,
				groupArtists
			));
			index++;
		}

		if (groups.isEmpty()) {
			groups.add(new CmsGroupPageDraft("group-1", "GROUP ONE", true, 1, List.of()));
		}

		return groups;
	}

	private String valueOrDefault(String value, String fallback) {
		return value == null || value.isBlank() ? fallback : value.trim();
	}

	public record CmsGroupPageDraft(
		String pageKey,
		String groupName,
		boolean visible,
		int sortOrder,
		List<CmsArtistProfileResponse> artists
	) {
	}

	private void addCmsStorageModel(Model model) {
		model.addAttribute("cmsStoragePublicBaseUrl", cmsStoragePublicBaseUrl());
		model.addAttribute("goodsImageBucket", AdminStoragePageController.GOODS_IMAGE_BUCKET);
		model.addAttribute("goodsImagePath", AdminStoragePageController.GOODS_IMAGE_PATH);
		try {
			model.addAttribute("goodsImages", supabaseStorageService.listImageObjects(
				AdminStoragePageController.GOODS_IMAGE_BUCKET,
				AdminStoragePageController.GOODS_IMAGE_PATH,
				1000
			));
		} catch (SupabaseStorageException exception) {
			model.addAttribute("goodsImages", List.of());
			model.addAttribute("imageLibraryError", exception.getMessage());
		}
	}

	private String cmsStoragePublicBaseUrl() {
		String projectUrl = storageProperties.getProjectUrl();
		if (projectUrl == null || projectUrl.isBlank()) {
			return "";
		}
		return trimTrailingSlash(projectUrl) + "/storage/v1/object/public/" + CMS_STORAGE_BUCKET + "/";
	}

	private String trimTrailingSlash(String value) {
		return value.endsWith("/") ? value.substring(0, value.length() - 1) : value;
	}
}
