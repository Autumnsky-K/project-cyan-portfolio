package com.projectcyan.ai;

import java.nio.charset.StandardCharsets;
import java.util.List;

import com.projectcyan.storage.SupabaseStorageException;
import com.projectcyan.storage.SupabaseStorageObject;
import com.projectcyan.storage.SupabaseStorageService;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

@Controller
public class AdminAiAnimationController {

	private static final MediaType TSV_MEDIA_TYPE = new MediaType(
		"text",
		"tab-separated-values",
		StandardCharsets.UTF_8
	);
	private static final String ANIMATION_ROOT = "animation";
	private static final String MODEL_PATH = ANIMATION_ROOT + "/models";
	private static final String MOTION_PATH = ANIMATION_ROOT + "/motions";
	private static final String CONFIG_PATH = ANIMATION_ROOT + "/config";
	private static final String SETTINGS_FILE = "chatbot-animation-settings.tsv";
	private static final String MOTION_FILE = "chatbot-motion-list.tsv";
	private static final long LARGE_MODEL_WARNING_BYTES = 6L * 1024L * 1024L;

	private final SupabaseStorageService storageService;
	private final AiGoodsCatalogProperties catalogProperties;

	public AdminAiAnimationController(
		SupabaseStorageService storageService,
		AiGoodsCatalogProperties catalogProperties
	) {
		this.storageService = storageService;
		this.catalogProperties = catalogProperties;
	}

	@GetMapping("/admin/ai/animation")
	public String animation(Model model) {
		addAnimationModel(model);
		return "admin/ai/animation";
	}

	@PostMapping("/admin/ai/animation/settings")
	public String saveSettings(
		@RequestParam(defaultValue = "live2d") String displayMode,
		@RequestParam(defaultValue = "") String activeModelKey,
		@RequestParam(defaultValue = "") String activeMotionKey,
		RedirectAttributes redirectAttributes
	) {
		String sheetText = String.join("\n",
			"section\tkey\tvalue\tnote",
			"display\tmode\t" + tsvCell(displayMode) + "\tlive2d 또는 three3d",
			"display\tactiveModel\t" + tsvCell(activeModelKey) + "\t활성 3D 모델 key",
			"display\tactiveMotion\t" + tsvCell(activeMotionKey) + "\t기본 모션 key"
		);
		try {
			SupabaseStorageObject object = storageService.uploadTextObject(
				catalogProperties.getBucket(),
				joinPath(catalogProperties.getPath(), CONFIG_PATH),
				SETTINGS_FILE,
				sheetText,
				TSV_MEDIA_TYPE,
				true
			);
			redirectAttributes.addFlashAttribute("animationMessage", "2D/3D 표시 설정을 Supabase에 저장했습니다.");
			redirectAttributes.addFlashAttribute("animationUrl", signedUrl(object));
		} catch (SupabaseStorageException exception) {
			redirectAttributes.addFlashAttribute("animationError", exception.getMessage());
		}
		return "redirect:/admin/ai/animation";
	}

	@PostMapping("/admin/ai/animation/model")
	public String uploadModel(
		@RequestParam(defaultValue = "default-model") String modelKey,
		@RequestParam(defaultValue = "") String relativePath,
		@RequestParam MultipartFile file,
		RedirectAttributes redirectAttributes
	) {
		try {
			SupabaseStorageObject object = storageService.uploadAiModelObject(
				catalogProperties.getBucket(),
				joinPath(catalogProperties.getPath(), MODEL_PATH),
				modelRelativePath(modelKey, relativePath, file),
				file,
				true
			);
			redirectAttributes.addFlashAttribute("animationMessage", "3D 모델 파일을 Supabase에 업로드했습니다.");
			if (file.getSize() > LARGE_MODEL_WARNING_BYTES) {
				redirectAttributes.addFlashAttribute("animationWarning", "6MB 초과 모델입니다. 현재 Spring 업로드는 가능하지만, 운영에서는 TUS/resumable 업로드 전환을 검토해야 합니다.");
			}
			redirectAttributes.addFlashAttribute("animationUrl", signedUrl(object));
		} catch (SupabaseStorageException exception) {
			redirectAttributes.addFlashAttribute("animationError", exception.getMessage());
		}
		return "redirect:/admin/ai/animation";
	}

	@PostMapping("/admin/ai/animation/motion-file")
	public String uploadMotionFile(
		@RequestParam(defaultValue = "motion") String motionKey,
		@RequestParam(defaultValue = "") String relativePath,
		@RequestParam MultipartFile file,
		RedirectAttributes redirectAttributes
	) {
		try {
			SupabaseStorageObject object = storageService.uploadAiModelObject(
				catalogProperties.getBucket(),
				joinPath(catalogProperties.getPath(), MOTION_PATH),
				modelRelativePath(motionKey, relativePath, file),
				file,
				true
			);
			redirectAttributes.addFlashAttribute("animationMessage", "모션 파일을 Supabase에 업로드했습니다.");
			redirectAttributes.addFlashAttribute("animationUrl", signedUrl(object));
		} catch (SupabaseStorageException exception) {
			redirectAttributes.addFlashAttribute("animationError", exception.getMessage());
		}
		return "redirect:/admin/ai/animation";
	}

	@PostMapping("/admin/ai/animation/motions")
	public String saveMotionSheet(
		@RequestParam("motionSheetText") String motionSheetText,
		RedirectAttributes redirectAttributes
	) {
		try {
			SupabaseStorageObject object = storageService.uploadTextObject(
				catalogProperties.getBucket(),
				joinPath(catalogProperties.getPath(), CONFIG_PATH),
				MOTION_FILE,
				motionSheetText,
				TSV_MEDIA_TYPE,
				true
			);
			redirectAttributes.addFlashAttribute("animationMessage", "모션 TSV를 Supabase에 저장했습니다.");
			redirectAttributes.addFlashAttribute("animationUrl", signedUrl(object));
		} catch (SupabaseStorageException exception) {
			redirectAttributes.addFlashAttribute("animationError", exception.getMessage());
		}
		return "redirect:/admin/ai/animation";
	}

	private void addAnimationModel(Model model) {
		model.addAttribute("animationBucket", catalogProperties.getBucket());
		model.addAttribute("animationModelPath", joinPath(catalogProperties.getPath(), MODEL_PATH));
		model.addAttribute("animationMotionPath", joinPath(catalogProperties.getPath(), MOTION_PATH));
		model.addAttribute("animationConfigPath", joinPath(catalogProperties.getPath(), CONFIG_PATH));
		model.addAttribute("defaultMotionSheetText", defaultMotionSheetText());
		try {
			model.addAttribute("modelObjects", storageRows(MODEL_PATH));
		} catch (SupabaseStorageException exception) {
			model.addAttribute("modelObjects", List.of());
			model.addAttribute("modelListError", exception.getMessage());
		}
		try {
			model.addAttribute("motionObjects", storageRows(MOTION_PATH));
		} catch (SupabaseStorageException exception) {
			model.addAttribute("motionObjects", List.of());
			model.addAttribute("motionListError", exception.getMessage());
		}
	}

	private List<AnimationStorageRow> storageRows(String path) {
		return storageService.listObjects(catalogProperties.getBucket(), joinPath(catalogProperties.getPath(), path), 1000)
			.stream()
			.map(object -> new AnimationStorageRow(
				object.name(),
				object.path(),
				object.size(),
				object.updatedAt(),
				signedUrl(object)
			))
			.toList();
	}

	private String signedUrl(SupabaseStorageObject object) {
		return storageService.createSignedObjectUrl(
			object.bucketName(),
			object.path(),
			catalogProperties.getSignedUrlTtlSeconds()
		);
	}

	private String modelRelativePath(String key, String relativePath, MultipartFile file) {
		String cleanKey = sanitizePathSegment(key == null || key.isBlank() ? "default" : key);
		if (relativePath != null && !relativePath.isBlank()) {
			return cleanKey + "/" + relativePath;
		}
		String originalName = file.getOriginalFilename();
		return cleanKey + "/" + (originalName == null || originalName.isBlank() ? "model.bin" : originalName);
	}

	private String sanitizePathSegment(String value) {
		return value.trim()
			.replace('\\', '-')
			.replace('/', '-')
			.replaceAll("\\s+", "-");
	}

	private String joinPath(String left, String right) {
		String normalizedLeft = left == null ? "" : left.replaceAll("^/+", "").replaceAll("/+$", "");
		String normalizedRight = right == null ? "" : right.replaceAll("^/+", "").replaceAll("/+$", "");
		if (normalizedLeft.isBlank()) {
			return normalizedRight;
		}
		if (normalizedRight.isBlank()) {
			return normalizedLeft;
		}
		return normalizedLeft + "/" + normalizedRight;
	}

	private String tsvCell(String value) {
		return String.valueOf(value == null ? "" : value)
			.replace("\t", " ")
			.replace("\r", " ")
			.replace("\n", " ");
	}

	private String defaultMotionSheetText() {
		return String.join("\n",
			"motionKey\tlabel\tmodelMode\tfileKey\ttrigger\tloop\tpriority\tnote",
			"idle\t기본 대기\t2d,3d\t-\t대기\ttrue\t10\t말풍선만 표시",
			"wave\t손 흔들기\t2d,3d\twave\t인사/가벼운 반응\tfalse\t20\t2D/3D 공통 후보",
			"walk\t걸어서 이동\t3d\twalking\tDOM 이동\ttrue\t30\t목표 메뉴까지 이동",
			"step-up\t계단 오르기\t3d\tstep_up\t상단/세로 이동\tfalse\t40\t예시 모션",
			"stand-up\t드러누운 상태에서 일어나기\t3d\tstand_up\t숨김 상태 복귀\tfalse\t50\t예시 모션",
			"point\t상품 위치 가리키기\t2d,3d\tpoint\t추천/검색 결과\tfalse\t60\t상품 카드 강조",
			"nod\t고개 끄덕이기\t2d,3d\tnod\t확인/동의\tfalse\t70\t짧은 응답",
			"shake-head\t고개 젓기\t2d,3d\tshake_head\t불가/품절/범위 밖\tfalse\t80\t짧은 거절"
		);
	}

	public record AnimationStorageRow(
		String name,
		String objectPath,
		Long size,
		String updatedAt,
		String signedUrl
	) {
	}
}
