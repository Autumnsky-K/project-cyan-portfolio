package com.projectcyan.cms;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

@Controller
public class AdminCmsPageController {

	private final CmsContentService cmsContentService;

	public AdminCmsPageController(CmsContentService cmsContentService) {
		this.cmsContentService = cmsContentService;
	}

	@GetMapping("/admin/content")
	public String redirectContentAdmin() {
		return "redirect:/admin/content/home";
	}

	@GetMapping("/admin/content/home")
	public String editHome(Model model) {
		model.addAttribute("page", cmsContentService.findPage("home"));
		return "admin/content/home";
	}

	@PostMapping("/admin/content/home")
	public String saveHome(
		CmsPageRequest request,
		RedirectAttributes redirectAttributes
	) {
		cmsContentService.savePage("home", request);
		redirectAttributes.addFlashAttribute("notice", "Home preview was applied.");
		return "redirect:/admin/content/home";
	}

	@GetMapping("/admin/content/artists")
	public String editArtists(Model model) {
		model.addAttribute("page", cmsContentService.findPage("artists"));
		model.addAttribute("artists", cmsContentService.findArtists(true));
		return "admin/content/artists";
	}

	@PostMapping("/admin/content/artists/page")
	public String saveArtistsPage(
		CmsPageRequest request,
		RedirectAttributes redirectAttributes
	) {
		cmsContentService.savePage("artists", request);
		redirectAttributes.addFlashAttribute("notice", "Artist page preview was applied.");
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
			redirectAttributes.addFlashAttribute("notice", "No artist rows to apply.");
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
		redirectAttributes.addFlashAttribute("notice", "Artist rows were applied.");
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
}
