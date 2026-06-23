package com.projectcyan.ai;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class AdminAiPageController {

	@GetMapping("/admin/ai")
	public String aiAdmin() {
		return "admin/ai/index";
	}
}
