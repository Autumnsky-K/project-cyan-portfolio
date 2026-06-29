package com.projectcyan.payment;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class AdminPaymentController {

	private final AdminPaymentService adminPaymentService;

	public AdminPaymentController(AdminPaymentService adminPaymentService) {
		this.adminPaymentService = adminPaymentService;
	}

	@GetMapping("/admin/payment")
	public String paymentAdmin(Model model) {
		model.addAttribute("paymentDashboard", adminPaymentService.dashboard());
		return "admin/payment/index";
	}
}
