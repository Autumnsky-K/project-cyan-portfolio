package com.projectcyan.member;

import com.projectcyan.common.ApiErrorException;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

@Controller
public class AdminMemberPageController {

	private final MemberService memberService;

	public AdminMemberPageController(MemberService memberService) {
		this.memberService = memberService;
	}

	@GetMapping("/admin/members")
	public String members(Model model) {
		addMembersModel(model);
		if (!model.containsAttribute("memberForm")) {
			model.addAttribute("memberForm", AdminMemberForm.blank());
		}
		return "admin/members/list";
	}

	@PostMapping("/admin/members")
	public String createMember(
		@ModelAttribute AdminMemberForm memberForm,
		RedirectAttributes redirectAttributes
	) {
		try {
			memberService.createAdminMember(memberForm);
			redirectAttributes.addFlashAttribute("notice", "회원가입 insert 작업이 완료되었습니다.");
		} catch (ApiErrorException exception) {
			redirectAttributes.addFlashAttribute("error", exception.getMessage());
			redirectAttributes.addFlashAttribute("memberForm", memberForm);
		}
		return "redirect:/admin/members";
	}

	@PostMapping("/admin/members/{memberId}")
	public String updateMember(
		@PathVariable Long memberId,
		@ModelAttribute AdminMemberForm memberForm,
		RedirectAttributes redirectAttributes
	) {
		try {
			memberService.updateAdminMember(memberId, memberForm);
			redirectAttributes.addFlashAttribute("notice", "회원정보 update 작업이 완료되었습니다.");
		} catch (ApiErrorException exception) {
			redirectAttributes.addFlashAttribute("error", exception.getMessage());
		}
		return "redirect:/admin/members";
	}

	@PostMapping("/admin/members/{memberId}/delete")
	public String deleteMember(@PathVariable Long memberId, RedirectAttributes redirectAttributes) {
		try {
			memberService.deleteAdminMember(memberId);
			redirectAttributes.addFlashAttribute("notice", "회원 delete 작업이 완료되었습니다.");
		} catch (ApiErrorException exception) {
			redirectAttributes.addFlashAttribute("error", exception.getMessage());
		}
		return "redirect:/admin/members";
	}

	private void addMembersModel(Model model) {
		model.addAttribute("members", memberService.findAdminMembers());
		model.addAttribute("operationLabels", java.util.List.of(
			"select : 회원목록조회",
			"insert : 회원가입",
			"Delete : 회원 삭제",
			"update : 회원정보수정"
		));
	}
}
