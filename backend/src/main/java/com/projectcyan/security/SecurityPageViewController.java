package com.projectcyan.security;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/security")
public class SecurityPageViewController {

	private final SecurityMonitoringService monitoringService;

	public SecurityPageViewController(SecurityMonitoringService monitoringService) {
		this.monitoringService = monitoringService;
	}

	@PostMapping("/page-views")
	public ResponseEntity<Void> recordPageView(
		@RequestBody(required = false) PageViewRequest pageViewRequest,
		HttpServletRequest request
	) {
		if (pageViewRequest == null || pageViewRequest.path() == null || pageViewRequest.path().isBlank()) {
			return ResponseEntity.noContent().build();
		}

		monitoringService.recordAccess(
			request,
			"VIEW",
			pageViewRequest.path(),
			200,
			0,
			SecurityMonitoringFilter.fingerprintHash(request),
			false,
			new SecurityMonitoringService.AccessLogContext(
				"PAGE_VIEW",
				pageViewRequest.routeName(),
				pageViewRequest.pageTitle(),
				pageViewRequest.referrer(),
				pageViewRequest.utmSource(),
				pageViewRequest.utmMedium(),
				pageViewRequest.utmCampaign(),
				pageViewRequest.utmContent(),
				pageViewRequest.utmTerm(),
				pageViewRequest.language(),
				pageViewRequest.timezone(),
				pageViewRequest.viewportWidth(),
				pageViewRequest.viewportHeight(),
				pageViewRequest.screenWidth(),
				pageViewRequest.screenHeight(),
				true,
				SecurityMonitoringFilter.sessionHash(request)
			)
		);
		return ResponseEntity.noContent().build();
	}

	public record PageViewRequest(
		String path,
		String routeName,
		String pageTitle,
		String referrer,
		String utmSource,
		String utmMedium,
		String utmCampaign,
		String utmContent,
		String utmTerm,
		String language,
		String timezone,
		Integer viewportWidth,
		Integer viewportHeight,
		Integer screenWidth,
		Integer screenHeight
	) {
	}
}
