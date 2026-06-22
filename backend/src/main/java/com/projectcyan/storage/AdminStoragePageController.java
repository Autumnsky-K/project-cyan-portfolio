package com.projectcyan.storage;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

@Controller
public class AdminStoragePageController {

	public static final String GOODS_IMAGE_BUCKET = "goods-image";
	public static final String GOODS_IMAGE_PATH = "goods";

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
		RedirectAttributes redirectAttributes
	) {
		redirectAttributes.addFlashAttribute("storageError", "Bucket 생성은 현재 비활성화되어 있습니다. 기존 Bucket 안에서 Path만 생성하세요.");
		return "redirect:/admin/storage";
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
			redirectAttributes.addFlashAttribute("notice", "Path 생성 완료: " + path);
			return "redirect:/admin/storage";
		} catch (SupabaseStorageException exception) {
			bindingResult.rejectValue("path", "path.storage", exception.getMessage());
			addStorageModel(model);
			return "admin/storage/list";
		}
	}

	@PostMapping(
		value = "/admin/storage/uploads",
		consumes = MediaType.MULTIPART_FORM_DATA_VALUE,
		produces = MediaType.APPLICATION_JSON_VALUE
	)
	public ResponseEntity<AdminStorageUploadResponse> uploadImage(
		@RequestParam(defaultValue = GOODS_IMAGE_BUCKET) String bucketName,
		@RequestParam(defaultValue = GOODS_IMAGE_PATH) String path,
		@RequestParam(defaultValue = "true") boolean upsert,
		@RequestParam(defaultValue = "false") boolean allowSmallerOverwrite,
		@RequestParam(required = false) String relativePath,
		@RequestParam MultipartFile file
	) {
		try {
			return ResponseEntity.ok(AdminStorageUploadResponse.from(
				supabaseStorageService.uploadObjectBySizePolicy(bucketName, path, relativePath, file, allowSmallerOverwrite)
			));
		} catch (SupabaseStorageConflictException exception) {
			return ResponseEntity
				.status(HttpStatus.CONFLICT)
				.body(AdminStorageUploadResponse.conflict(exception));
		} catch (SupabaseStorageException exception) {
			return ResponseEntity
				.status(HttpStatus.BAD_REQUEST)
				.body(AdminStorageUploadResponse.error(exception.getMessage()));
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
		model.addAttribute("goodsImageBucket", GOODS_IMAGE_BUCKET);
		model.addAttribute("goodsImagePath", GOODS_IMAGE_PATH);
		try {
			model.addAttribute("goodsImages", supabaseStorageService.listImageObjects(GOODS_IMAGE_BUCKET, GOODS_IMAGE_PATH, 1000));
		} catch (SupabaseStorageException exception) {
			model.addAttribute("goodsImages", java.util.List.of());
			model.addAttribute("goodsImageError", exception.getMessage());
		}
	}
}
