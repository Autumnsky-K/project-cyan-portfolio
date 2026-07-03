package com.projectcyan.cms;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
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
		CmsPageResponse page = cmsContentService.findPage("home");
		model.addAttribute("page", page);
		model.addAttribute("homeCopySettings", homeCopySettings(page));
		addCmsStorageModel(model);
		return "admin/content/home";
	}

	@PostMapping("/admin/content/home")
	public String saveHome(
		CmsPageRequest request,
		@RequestParam Map<String, String> requestParameters,
		RedirectAttributes redirectAttributes
	) {
		cmsContentService.savePage("home", pageRequestWithCopySettings(request, homeCopySettings(requestParameters)));
		redirectAttributes.addFlashAttribute("notice", "홈 화면 내용이 적용되었습니다.");
		return "redirect:/admin/content/home";
	}

	@GetMapping("/admin/content/artists")
	public String editArtists(Model model) {
		CmsPageResponse page = cmsContentService.findPage("artists");
		model.addAttribute("page", page);
		model.addAttribute("artistCopySettings", artistCopySettings(page));
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
		@RequestParam(required = false) String groupKey,
		@RequestParam(required = false) Integer groupSortOrder,
		@RequestParam(required = false, defaultValue = "true") Boolean groupVisible,
		@RequestParam(required = false) String groupHeroImageUrl,
		@RequestParam(required = false) String groupSummary,
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
				groupKey,
				groupSortOrder,
				groupVisible,
				groupHeroImageUrl,
				groupSummary,
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
		@RequestParam(required = false) List<String> groupKey,
		@RequestParam(required = false) List<String> groupSortOrder,
		@RequestParam(required = false) List<String> groupVisible,
		@RequestParam(required = false) List<String> groupHeroImageUrl,
		@RequestParam(required = false) List<String> groupSummary,
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
				valueAt(groupKey, index),
				intStringAt(groupSortOrder, index, 999),
				Boolean.parseBoolean(valueAt(groupVisible, index, "true")),
				valueAt(groupHeroImageUrl, index),
				valueAt(groupSummary, index),
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
		@RequestParam Map<String, String> requestParameters,
		RedirectAttributes redirectAttributes
	) {
		cmsContentService.savePage("artists", pageRequestWithCopySettings(request, artistCopySettings(requestParameters)));
		redirectAttributes.addFlashAttribute("notice", "아티스트 화면 내용이 적용되었습니다.");
		return "redirect:/admin/content/artists";
	}

	@PostMapping("/admin/content/artists")
	public String saveArtists(
		@RequestParam(required = false) List<String> artistId,
		@RequestParam(required = false) List<String> name,
		@RequestParam(required = false) List<String> groupName,
		@RequestParam(required = false) List<String> groupKey,
		@RequestParam(required = false) List<String> groupSortOrder,
		@RequestParam(required = false) List<String> groupVisible,
		@RequestParam(required = false) List<String> groupHeroImageUrl,
		@RequestParam(required = false) List<String> groupSummary,
		@RequestParam(required = false) List<String> imageUrl,
		@RequestParam(required = false) List<String> lore,
		@RequestParam(required = false) List<String> debutDate,
		@RequestParam(required = false) List<String> collections,
		@RequestParam(required = false) List<String> sortOrder,
		@RequestParam(required = false) List<String> visible,
		RedirectAttributes redirectAttributes
	) {
		int rowCount = maxRowCount(
			artistId,
			name,
			groupName,
			groupKey,
			groupSortOrder,
			groupVisible,
			groupHeroImageUrl,
			groupSummary,
			imageUrl,
			lore,
			debutDate,
			collections,
			sortOrder,
			visible
		);
		if (rowCount == 0) {
			redirectAttributes.addFlashAttribute("notice", "적용할 아티스트 행이 없습니다.");
			return "redirect:/admin/content/artists";
		}

		Map<Long, CmsArtistProfileResponse> currentArtists = cmsContentService.findArtists(true).stream()
			.collect(Collectors.toMap(CmsArtistProfileResponse::artistId, Function.identity()));
		List<CmsArtistProfileRequest> requests = new ArrayList<>();
		for (int index = 0; index < rowCount; index++) {
			Long currentArtistId = longStringAt(artistId, index);
			CmsArtistProfileResponse currentArtist = currentArtists.get(currentArtistId);
			String nextName = valueAt(name, index, currentArtist == null ? "" : currentArtist.name());
			if (currentArtistId == null && nextName.isBlank()) {
				continue;
			}
			requests.add(new CmsArtistProfileRequest(
				currentArtistId,
				nextName,
				valueAt(groupName, index, currentArtist == null ? "" : currentArtist.groupName()),
				valueAt(groupKey, index, currentArtist == null ? "" : currentArtist.groupKey()),
				intStringAt(groupSortOrder, index, currentArtist == null || currentArtist.groupSortOrder() == null ? 999 : currentArtist.groupSortOrder()),
				booleanAt(groupVisible, index, currentArtist == null || Boolean.TRUE.equals(currentArtist.groupVisible())),
				valueAt(groupHeroImageUrl, index, currentArtist == null ? "" : currentArtist.groupHeroImageUrl()),
				valueAt(groupSummary, index, currentArtist == null ? "" : currentArtist.groupSummary()),
				valueAt(imageUrl, index, currentArtist == null ? "" : currentArtist.imageUrl()),
				valueAt(lore, index, currentArtist == null ? "" : currentArtist.lore()),
				valueAt(debutDate, index, currentArtist == null ? "" : currentArtist.debutDate()),
				valueAt(collections, index, currentArtist == null ? "" : currentArtist.collections()),
				intStringAt(sortOrder, index, currentArtist == null ? index + 1 : currentArtist.sortOrder()),
				booleanAt(visible, index, currentArtist == null || Boolean.TRUE.equals(currentArtist.visible()))
			));
		}
		if (requests.isEmpty()) {
			redirectAttributes.addFlashAttribute("notice", "이름이 입력된 신규 아티스트 행이 없습니다.");
			return "redirect:/admin/content/artists";
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

	@SafeVarargs
	private final int maxRowCount(List<?>... valueLists) {
		int rowCount = 0;
		for (List<?> values : valueLists) {
			if (values != null) {
				rowCount = Math.max(rowCount, values.size());
			}
		}
		return rowCount;
	}

	private boolean booleanAt(List<String> values, int index, boolean fallback) {
		String value = valueAt(values, index);
		if (value == null || value.isBlank()) {
			return fallback;
		}
		return Boolean.parseBoolean(value.trim());
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
			String groupKey = valueOrDefault(artist.groupKey(), valueOrDefault(artist.groupName(), "unknown-group"));
			groupedArtists.computeIfAbsent(groupKey, ignored -> new ArrayList<>()).add(artist);
		}

		List<CmsGroupPageDraft> groups = new ArrayList<>();
		int index = 1;
		for (Map.Entry<String, List<CmsArtistProfileResponse>> entry : groupedArtists.entrySet()) {
			List<CmsArtistProfileResponse> groupArtists = entry.getValue();
			CmsArtistProfileResponse firstArtist = groupArtists.get(0);
			groups.add(new CmsGroupPageDraft(
				entry.getKey(),
				valueOrDefault(firstArtist.groupName(), entry.getKey()),
				groupArtists.stream().anyMatch(artist -> Boolean.TRUE.equals(artist.groupVisible()) && Boolean.TRUE.equals(artist.visible())),
				firstArtist.groupSortOrder() == null ? index : firstArtist.groupSortOrder(),
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

	private CmsPageRequest pageRequestWithCopySettings(
		CmsPageRequest request,
		Map<String, String> copySettings
	) {
		return new CmsPageRequest(
			request.eyebrow(),
			request.title(),
			request.summaryTitle(),
			request.summaryBody(),
			request.primaryColor(),
			request.accentColor(),
			request.backgroundColor(),
			request.heroImageUrl(),
			copySettings
		);
	}

	private Map<String, String> homeCopySettings(CmsPageResponse page) {
		Map<String, String> settings = defaultHomeCopySettings();
		if (page.copySettings() != null) {
			settings.putAll(page.copySettings());
		}
		return settings;
	}

	private Map<String, String> homeCopySettings(Map<String, String> requestParameters) {
		Map<String, String> settings = new LinkedHashMap<>();
		for (String key : defaultHomeCopySettings().keySet()) {
			String value = requestParameters.get("copySettings[" + key + "]");
			if (value != null && !value.isBlank()) {
				settings.put(key, value.trim());
			}
		}
		return settings;
	}

	private Map<String, String> artistCopySettings(CmsPageResponse page) {
		Map<String, String> settings = defaultArtistCopySettings();
		if (page.copySettings() != null) {
			settings.putAll(page.copySettings());
		}
		return settings;
	}

	private Map<String, String> artistCopySettings(Map<String, String> requestParameters) {
		Map<String, String> settings = new LinkedHashMap<>();
		for (String key : defaultArtistCopySettings().keySet()) {
			String value = requestParameters.get("copySettings[" + key + "]");
			if (value != null && !value.isBlank()) {
				settings.put(key, value.trim());
			}
		}
		return settings;
	}

	private Map<String, String> defaultHomeCopySettings() {
		Map<String, String> settings = new LinkedHashMap<>();
		settings.put("navHome", "Home");
		settings.put("navArtists", "Artists");
		settings.put("navGoods", "Goods");
		settings.put("navCart", "Cart");
		settings.put("statusSignalLabel", "SHOP SIGNAL");
		settings.put("statusReadyLabel", "Live");
		settings.put("statusLoadingLabel", "Loading");
		settings.put("statusErrorLabel", "Offline");
		settings.put("statusModeLabel", "FULLPAGE MODE");
		settings.put("artistsEyebrow", "Cyan Idol Network");
		settings.put("artistsTitle", "Artist Signals");
		settings.put("physicalEyebrow", "Physical Goods");
		settings.put("physicalTitle", "Goods you can hold");
		settings.put("physicalCta", "View physical");
		settings.put("digitalEyebrow", "Digital Goods");
		settings.put("digitalTitle", "Voice, message, and download drops");
		settings.put("digitalCta", "Open digital");
		settings.put("digitalFeatureEyebrow", "DATA DROP");
		settings.put("digitalFeatureDescription", "{artistName} channel goods for voice, message, download, or AI-assisted shopping flows.");
		settings.put("digitalFeatureCta", "Open drop");
		settings.put("byArtistEyebrow", "Goods By Artist");
		settings.put("byArtistTitle", "Shop from each artist channel");
		settings.put("byArtistCta", "Browse artist goods");
		settings.put("categoryEyebrow", "Goods Categories");
		settings.put("categoryTitle", "Browse by type");
		settings.put("categoryCta", "Open categories");
		settings.put("footerEyebrow", "Project Cyan SHOP");
		settings.put("footerTitle", "Official Shop Index");
		settings.put("footerShopTitle", "Shop");
		settings.put("footerShopAllGoods", "All goods");
		settings.put("footerShopPhysicalGoods", "Physical goods");
		settings.put("footerShopDigitalGoods", "Digital goods");
		settings.put("footerArtistTitle", "Artist");
		settings.put("footerArtistArtistsPage", "Artists page");
		settings.put("footerArtistGroups", "Artist groups");
		settings.put("footerArtistGoodsByArtist", "Goods by artist");
		settings.put("footerAccountTitle", "Account");
		settings.put("footerAccountSignIn", "Sign in");
		settings.put("footerAccountCart", "Cart");
		settings.put("footerAccountLikes", "Likes");
		settings.put("footerInfoTitle", "Info");
		settings.put("footerInfoTop", "Top");
		settings.put("footerInfoCategories", "Categories");
		settings.put("footerBottomLabel", "CYAN PRODUCTION");
		settings.put("footerBackToFirst", "Back to first page");
		return settings;
	}

	private Map<String, String> defaultArtistCopySettings() {
		Map<String, String> settings = new LinkedHashMap<>();
		settings.put("navHome", "Home");
		settings.put("navArtists", "Artists");
		settings.put("navGoods", "Goods");
		settings.put("navCart", "Cart");
		settings.put("broadcastStrip", "CYAN IDOL NETWORK // AREA STREAM // MUSIC MEDIA MIX // CHARACTER SIGNAL");
		settings.put("statsArtistsLabel", "Artists");
		settings.put("statsModeLabel", "Mode");
		settings.put("statsViewLabel", "View");
		settings.put("statsViewValue", "Stage");
		settings.put("statusLoadingLabel", "Loading");
		settings.put("statusLiveLabel", "Live");
		settings.put("statusPreviewLabel", "Preview");
		settings.put("channelWorld", "WORLD");
		settings.put("channelArea", "AREA");
		settings.put("channelCharacter", "CHARACTER");
		settings.put("channelMusic", "MUSIC");
		settings.put("profileBpmLabel", "BPM");
		settings.put("profileDebutLabel", "Debut");
		settings.put("profileCollectionsLabel", "Collections");
		settings.put("profileSignalLabel", "Signal");
		settings.put("artistGoodsCta", "이 아티스트 굿즈 보기");
		settings.put("groupGoodsCta", "그룹 굿즈 보기");
		settings.put("indexEyebrow", "Roster");
		settings.put("indexTitle", "Artist Index");
		settings.put("indexGroupGoodsCta", "그룹 굿즈 보기");
		settings.put("pagerIndexLabel", "All");
		return settings;
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
