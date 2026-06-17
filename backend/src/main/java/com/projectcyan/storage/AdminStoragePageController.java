package com.projectcyan.storage;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import jakarta.validation.Valid;

@Controller
public class AdminStoragePageController {

	private final SupabaseStorageService supabaseStorageService;

	public AdminStoragePageController(SupabaseStorageService supabaseStorageService) {
		this.supabaseStorageService = supabaseStorageService;
	}

	@GetMapping("/admin/storage")
	public String storage(Model model) {
		addStorageModel(model);
		return "admin/storage/list";
	}

	@PostMapping("/admin/storage/buckets")
	public String createBucket(
		@Valid @ModelAttribute("bucketForm") AdminStorageBucketForm form,
		BindingResult bindingResult,
		Model model,
		RedirectAttributes redirectAttributes
	) {
		if (bindingResult.hasErrors()) {
			addStorageModel(model);
			return "admin/storage/list";
		}

		try {
			String bucketName = supabaseStorageService.createBucket(form.getBucketName(), form.isPublicBucket());
			redirectAttributes.addFlashAttribute("notice", "Bucket created: " + bucketName);
			return "redirect:/admin/storage";
		} catch (SupabaseStorageException exception) {
			bindingResult.rejectValue("bucketName", "bucketName.storage", exception.getMessage());
			addStorageModel(model);
			return "admin/storage/list";
		}
	}

	@PostMapping("/admin/storage/paths")
	public String createPath(
		@Valid @ModelAttribute("pathForm") AdminStoragePathForm form,
		BindingResult bindingResult,
		Model model,
		RedirectAttributes redirectAttributes
	) {
		if (bindingResult.hasErrors()) {
			addStorageModel(model);
			return "admin/storage/list";
		}

		try {
			String path = supabaseStorageService.createFolderPath(form.getBucketName(), form.getPath());
			redirectAttributes.addFlashAttribute("notice", "Path created: " + path);
			return "redirect:/admin/storage";
		} catch (SupabaseStorageException exception) {
			bindingResult.rejectValue("path", "path.storage", exception.getMessage());
			addStorageModel(model);
			return "admin/storage/list";
		}
	}

	private void addStorageModel(Model model) {
		if (!model.containsAttribute("bucketForm")) {
			model.addAttribute("bucketForm", new AdminStorageBucketForm());
		}
		if (!model.containsAttribute("pathForm")) {
			model.addAttribute("pathForm", new AdminStoragePathForm());
		}
		try {
			model.addAttribute("buckets", supabaseStorageService.listBuckets());
		} catch (SupabaseStorageException exception) {
			model.addAttribute("buckets", java.util.List.of());
			model.addAttribute("storageError", exception.getMessage());
		}
	}
}
