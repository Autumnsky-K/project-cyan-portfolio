package com.projectcyan.ai;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class AdminAiPageController {

	@GetMapping("/admin/ai")
	public String aiAdmin() {
		return "admin/ai/index";
	}

	@GetMapping("/admin/ai/behavior-lab")
	public String aiBehaviorLab() {
		return "admin/ai/behavior-lab";
	}
}
