package com.projectcyan.admin;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class AdminDashboardPageController {

	@GetMapping("/")
	public String root() {
		return "redirect:/admin";
	}

	@GetMapping({"/admin", "/admin/"})
	public String dashboard() {
		return "admin/dashboard";
	}
}
