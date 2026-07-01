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
	private final StorageDirectoryIndexService storageDirectoryIndexService;

	public AdminStoragePageController(
		SupabaseStorageService supabaseStorageService,
		StorageDirectoryIndexService storageDirectoryIndexService
	) {
		this.supabaseStorageService = supabaseStorageService;
		this.storageDirectoryIndexService = storageDirectoryIndexService;
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
			storageDirectoryIndexService.recordBucket(bucketName);
			redirectAttributes.addFlashAttribute("notice", "Bucket 생성 완료: " + bucketName);
		} catch (SupabaseStorageException exception) {
			bindingResult.rejectValue("bucketName", "bucket.storage", exception.getMessage());
			addStorageModel(model);
			return "admin/storage/list";
		}
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
			storageDirectoryIndexService.recordPath(form.getBucketName(), path);
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
			SupabaseStorageWriteResult uploadResult = supabaseStorageService.uploadObjectBySizePolicyWithResult(
				bucketName,
				path,
				relativePath,
				file,
				allowSmallerOverwrite
			);
			storageDirectoryIndexService.recordUploadedImage(uploadResult.object(), uploadResult.created());
			return ResponseEntity.ok(AdminStorageUploadResponse.from(uploadResult));
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

	@GetMapping(
		value = "/admin/storage/images",
		produces = MediaType.APPLICATION_JSON_VALUE
	)
	public ResponseEntity<java.util.List<AdminStorageUploadResponse>> folderImages(
		@RequestParam String bucketName,
		@RequestParam(defaultValue = "") String path
	) {
		try {
			return ResponseEntity.ok(
				supabaseStorageService.listImageObjectsInFolder(bucketName, path, 1000).stream()
					.map(AdminStorageUploadResponse::from)
					.toList()
			);
		} catch (SupabaseStorageException exception) {
			return ResponseEntity.status(HttpStatus.BAD_REQUEST)
				.body(java.util.List.of(AdminStorageUploadResponse.error(exception.getMessage())));
		}
	}

	@PostMapping("/admin/storage/directories/sync")
	public String syncDirectories(RedirectAttributes redirectAttributes) {
		try {
			storageDirectoryIndexService.rebuildFromStorage();
			redirectAttributes.addFlashAttribute("notice", "Supabase 저장소 인덱스 동기화 완료");
		} catch (SupabaseStorageException exception) {
			redirectAttributes.addFlashAttribute("storageError", exception.getMessage());
		}
		return "redirect:/admin/storage";
	}

	private void addStorageModel(Model model) {
		if (!model.containsAttribute("bucketForm")) {
			model.addAttribute("bucketForm", new AdminStorageBucketForm());
		}
		if (!model.containsAttribute("pathForm")) {
			model.addAttribute("pathForm", new AdminStoragePathForm());
		}
		java.util.List<StorageDirectoryIndexRow> storageDirectories;
		try {
			storageDirectories = storageDirectoryIndexService.loadOrBootstrap();
		} catch (SupabaseStorageException exception) {
			storageDirectories = storageDirectoryIndexService.listDirectories();
			model.addAttribute("storageError", exception.getMessage());
		}
		java.util.List<SupabaseStorageBucket> buckets = storageDirectoryIndexService.bucketsFromIndex(storageDirectories);
		model.addAttribute("buckets", buckets);
		model.addAttribute("goodsImageBucket", GOODS_IMAGE_BUCKET);
		model.addAttribute("goodsImagePath", GOODS_IMAGE_PATH);
		model.addAttribute("storageDirectories", storageDirectories);
		model.addAttribute("storagePathOptions", storageDirectoryIndexService.pathOptionsFromIndex(storageDirectories));
	}

	public record StoragePathOption(
		String bucketName,
		String path
	) {
	}
}
