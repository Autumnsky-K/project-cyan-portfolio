package com.projectcyan.ai;

import com.projectcyan.member.auth.AuthenticatedMember;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/ai")
public class AiPersonalizationController {

	private final AiPersonalizationService personalizationService;

	public AiPersonalizationController(AiPersonalizationService personalizationService) {
		this.personalizationService = personalizationService;
	}

	@GetMapping("/personalization-context")
	public AiPersonalizationResponse findContext(
		@RequestParam(defaultValue = "3") int recentSessionLimit,
		@RequestParam(required = false) Long excludeSessionId,
		AuthenticatedMember currentMember
	) {
		return personalizationService.findContext(
			currentMember.memberId(),
			excludeSessionId,
			recentSessionLimit
		);
	}
}
