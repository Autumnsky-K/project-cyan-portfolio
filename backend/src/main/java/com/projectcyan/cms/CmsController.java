package com.projectcyan.cms;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/cms")
public class CmsController {

	private final CmsContentService cmsContentService;

	public CmsController(CmsContentService cmsContentService) {
		this.cmsContentService = cmsContentService;
	}

	@GetMapping("/pages/{pageKey}")
	public CmsPageResponse findPage(@PathVariable String pageKey) {
		return cmsContentService.findPage(pageKey);
	}

	@GetMapping("/artists")
	public List<CmsArtistProfileResponse> findArtists(
		@RequestParam(defaultValue = "false") boolean includeHidden
	) {
		return cmsContentService.findArtists(includeHidden);
	}
}
