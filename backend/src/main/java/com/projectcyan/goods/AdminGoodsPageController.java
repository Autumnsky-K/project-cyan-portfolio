package com.projectcyan.goods;

import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

import com.projectcyan.storage.AdminStoragePageController;
import com.projectcyan.storage.SupabaseStorageException;
import com.projectcyan.storage.SupabaseStorageService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.validation.ObjectError;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;
import org.springframework.web.util.UriComponentsBuilder;

@Controller
public class AdminGoodsPageController {

	private static final int PAGE_SIZE = 12;
	private static final List<String> SALES_STATUSES = List.of("ON_SALE", "SOLD_OUT", "HIDDEN", "DISCONTINUED");
	private static final Map<String, String> SALES_STATUS_LABELS = Map.of(
		"ON_SALE", "판매중",
		"SOLD_OUT", "품절",
		"HIDDEN", "숨김",
		"DISCONTINUED", "판매 중단"
	);

	private final GoodsService goodsService;
	private final AdminGoodsService adminGoodsService;
	private final GoodsRepository goodsRepository;
	private final GoodsStockRepository goodsStockRepository;
	private final SupabaseStorageService supabaseStorageService;
	private final AdminGoodsImportService adminGoodsImportService;
	private final String frontendPreviewBaseUrl;

	public AdminGoodsPageController(
		GoodsService goodsService,
		AdminGoodsService adminGoodsService,
		GoodsRepository goodsRepository,
		GoodsStockRepository goodsStockRepository,
		SupabaseStorageService supabaseStorageService,
		AdminGoodsImportService adminGoodsImportService,
		@Value("${project-cyan.frontend.preview-base-url:http://localhost:5173}") String frontendPreviewBaseUrl
	) {
		this.goodsService = goodsService;
		this.adminGoodsService = adminGoodsService;
		this.goodsRepository = goodsRepository;
		this.goodsStockRepository = goodsStockRepository;
		this.supabaseStorageService = supabaseStorageService;
		this.adminGoodsImportService = adminGoodsImportService;
		this.frontendPreviewBaseUrl = trimTrailingSlash(frontendPreviewBaseUrl);
	}

	@GetMapping("/admin/goods")
	public String listGoods(
		@RequestParam(required = false) String q,
		@RequestParam(required = false) Long artistId,
		@RequestParam(required = false) Long categoryId,
		@RequestParam(required = false) String salesStatus,
		@RequestParam(defaultValue = "createdAt,desc") String sort,
		@RequestParam(defaultValue = "0") int page,
		Model model
	) {
		PageResponse<GoodsSummaryResponse> goodsPage = goodsService.findGoods(
			q,
			artistId,
			null,
			categoryId,
			null,
			salesStatus,
			null,
			null,
			null,
			page,
			PAGE_SIZE,
			sort
		);

		Map<Long, Integer> stockCounts = stockCounts(goodsPage.content());
		model.addAttribute("goodsPage", goodsPage);
		model.addAttribute("filters", goodsService.findGoodsFilters());
		model.addAttribute("q", q == null ? "" : q);
		model.addAttribute("artistId", artistId);
		model.addAttribute("categoryId", categoryId);
		model.addAttribute("salesStatus", salesStatus == null ? "" : salesStatus);
		model.addAttribute("sort", sort);
		model.addAttribute("pageNumbers", pageNumbers(goodsPage.page(), goodsPage.totalPages()));
		model.addAttribute("salesStatuses", SALES_STATUSES);
		model.addAttribute("salesStatusLabels", SALES_STATUS_LABELS);
		model.addAttribute("stockCounts", stockCounts);
		model.addAttribute("bulkRows", bulkRows(goodsPage.content(), stockCounts));
		model.addAttribute("defaultGoodsChecked", false);
		model.addAttribute("frontendGoodsBaseUrl", frontendPreviewBaseUrl + "/goods");
		return "admin/goods/list";
	}

	@GetMapping("/admin/goods/new")
	public String newGoods(Model model) {
		model.addAttribute("form", AdminGoodsForm.empty());
		return goodsForm(model, "create");
	}

	@GetMapping("/admin/goods/{goodsId}/edit")
	public String editGoods(@PathVariable Long goodsId, Model model) {
		GoodsDetailResponse goods = goodsService.findGoodsDetail(goodsId);
		AdminGoodsForm form = AdminGoodsForm.from(goods);
		form.setCategoryId(findCategoryIdByGoodsId(goodsId));
		form.setStockCount(findStockCount(goodsId));
		model.addAttribute("form", form);
		return goodsForm(model, "edit");
	}

	@PostMapping("/admin/goods")
	public String createGoods(
		@Valid @ModelAttribute("form") AdminGoodsForm form,
		BindingResult bindingResult,
		Model model,
		RedirectAttributes redirectAttributes
	) {
		if (bindingResult.hasErrors()) {
			return goodsForm(model, "create");
		}

		GoodsDetailResponse saved;
		try {
			saved = adminGoodsService.createGoods(form.toRequest());
		} catch (ResponseStatusException exception) {
			bindingResult.addError(new ObjectError("form", adminGoodsErrorMessage(exception)));
			return goodsForm(model, "create");
		}
		redirectAttributes.addFlashAttribute("notice", "굿즈가 등록되었습니다.");
		return "redirect:/admin/goods/" + saved.goodsId() + "/edit";
	}

	@PostMapping("/admin/goods/{goodsId}")
	public String updateGoods(
		@PathVariable Long goodsId,
		@Valid @ModelAttribute("form") AdminGoodsForm form,
		BindingResult bindingResult,
		Model model,
		RedirectAttributes redirectAttributes
	) {
		form.setGoodsId(goodsId);
		if (bindingResult.hasErrors()) {
			return goodsForm(model, "edit");
		}

		try {
			adminGoodsService.updateGoods(goodsId, form.toRequest());
		} catch (ResponseStatusException exception) {
			bindingResult.addError(new ObjectError("form", adminGoodsErrorMessage(exception)));
			return goodsForm(model, "edit");
		}
		redirectAttributes.addFlashAttribute("notice", "굿즈 정보가 저장되었습니다.");
		return "redirect:/admin/goods/" + goodsId + "/edit";
	}

	@PostMapping("/admin/goods/bulk")
	public String bulkUpdateGoods(
		@RequestParam(required = false) List<Long> selectedGoodsId,
		@RequestParam(required = false) List<Long> goodsId,
		@RequestParam(required = false) List<String> name,
		@RequestParam(required = false) List<String> price,
		@RequestParam(required = false) List<String> rowArtistId,
		@RequestParam(required = false) List<String> rowCategoryId,
		@RequestParam(required = false) List<String> salesStatus,
		@RequestParam(required = false) List<String> stockCount,
		@RequestParam(required = false) List<String> imageUrl,
		@RequestParam(required = false) List<String> tagsText,
		@RequestParam(required = false) String q,
		@RequestParam(required = false) Long artistId,
		@RequestParam(required = false) Long categoryId,
		@RequestParam(required = false) String filterSalesStatus,
		@RequestParam(defaultValue = "createdAt,desc") String sort,
		@RequestParam(defaultValue = "0") int page,
		RedirectAttributes redirectAttributes
	) {
		try {
			List<AdminGoodsBulkRow> selectedRows = selectedBulkRows(
				selectedGoodsId,
				goodsId,
				name,
				price,
				rowArtistId,
				rowCategoryId,
				salesStatus,
				stockCount,
				imageUrl,
				tagsText
			);
			if (selectedRows.isEmpty()) {
				redirectAttributes.addFlashAttribute("error", "선택한 굿즈가 없습니다.");
				return redirectToGoods(q, artistId, categoryId, filterSalesStatus, sort, page);
			}
			int updatedCount = adminGoodsService.bulkUpdateGoods(selectedRows);
			redirectAttributes.addFlashAttribute("notice", updatedCount + "개 굿즈가 갱신되었습니다.");
		} catch (ResponseStatusException exception) {
			redirectAttributes.addFlashAttribute("error", adminGoodsErrorMessage(exception));
		}

		return redirectToGoods(q, artistId, categoryId, filterSalesStatus, sort, page);
	}

	@PostMapping("/admin/goods/{goodsId}/status")
	public String updateStatus(
		@PathVariable Long goodsId,
		@RequestParam String salesStatus,
		RedirectAttributes redirectAttributes
	) {
		adminGoodsService.updateSalesStatus(goodsId, new GoodsStatusUpdateRequest(salesStatus));
		redirectAttributes.addFlashAttribute("notice", "판매 상태가 저장되었습니다.");
		return "redirect:/admin/goods";
	}

	@PostMapping("/admin/goods/{goodsId}/stock")
	public String updateStock(
		@PathVariable Long goodsId,
		@RequestParam Integer stockCount,
		RedirectAttributes redirectAttributes
	) {
		if (stockCount < 0) {
			redirectAttributes.addFlashAttribute("error", "재고는 0 이상이어야 합니다.");
			return "redirect:/admin/goods";
		}
		adminGoodsService.updateStock(goodsId, new GoodsStockUpdateRequest(stockCount));
		redirectAttributes.addFlashAttribute("notice", "재고가 저장되었습니다.");
		return "redirect:/admin/goods";
	}

	@PostMapping("/admin/goods/{goodsId}/discontinue")
	public String discontinueGoods(@PathVariable Long goodsId, RedirectAttributes redirectAttributes) {
		adminGoodsService.discontinueGoods(goodsId);
		redirectAttributes.addFlashAttribute("notice", "굿즈가 판매 중단 처리되었습니다.");
		return "redirect:/admin/goods";
	}

	@GetMapping("/admin/goods/import")
	public String importGoods(Model model) {
		model.addAttribute("preview", new AdminGoodsImportPreview(List.of()));
		return "admin/goods/import";
	}

	@GetMapping("/admin/goods/import/template")
	public ResponseEntity<byte[]> downloadImportTemplate() {
		String csv = "\uFEFFgoods_id,상품명,가격,아티스트,카테고리,재고,판매상태,이미지폴더,태그,상세설명,베스트,AI추천\n"
			+ ",루루 아크릴 스탠드,18000,루루,스탠드,15,ON_SALE,ruru/stand,\"루루,아크릴\",,,\n";
		return ResponseEntity.ok()
			.header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"goods-import-template.csv\"")
			.contentType(new MediaType("text", "csv", StandardCharsets.UTF_8))
			.body(csv.getBytes(StandardCharsets.UTF_8));
	}

	@PostMapping("/admin/goods/import/preview")
	public String previewImportGoods(@RequestParam("file") MultipartFile file, Model model) {
		try {
			model.addAttribute("preview", adminGoodsImportService.preview(file));
		} catch (ResponseStatusException exception) {
			model.addAttribute("preview", new AdminGoodsImportPreview(List.of()));
			model.addAttribute("error", adminGoodsErrorMessage(exception));
		}
		return "admin/goods/import";
	}

	@PostMapping("/admin/goods/import/commit")
	public String commitImportGoods(
		@ModelAttribute AdminGoodsImportCommitForm form,
		Model model,
		RedirectAttributes redirectAttributes
	) {
		try {
			int importedCount = adminGoodsImportService.importRows(form.toRows());
			redirectAttributes.addFlashAttribute("notice", importedCount + "개 굿즈가 등록되었습니다.");
			return "redirect:/admin/goods";
		} catch (ResponseStatusException exception) {
			model.addAttribute("preview", adminGoodsImportService.previewRaw(form.toRows()));
			model.addAttribute("error", adminGoodsErrorMessage(exception));
			return "admin/goods/import";
		}
	}

	private List<AdminGoodsBulkRow> bulkRows(List<GoodsSummaryResponse> goods, Map<Long, Integer> stockCounts) {
		return goods.stream()
			.map(item -> new AdminGoodsBulkRow(
				item.goodsId(),
				item.name(),
				item.price(),
				item.artistId(),
				item.artistName() == null ? "아티스트 없음" : item.artistName(),
				item.categoryId(),
				item.categoryName() == null ? "카테고리 없음" : item.categoryName(),
				item.salesStatus(),
				SALES_STATUS_LABELS.getOrDefault(item.salesStatus(), item.salesStatus()),
				stockCounts.getOrDefault(item.goodsId(), 0),
				item.imageUrl(),
				formatTags(item.tags())
			))
			.toList();
	}

	private List<AdminGoodsBulkRow> selectedBulkRows(
		List<Long> selectedGoodsId,
		List<Long> goodsId,
		List<String> name,
		List<String> price,
		List<String> rowArtistId,
		List<String> rowCategoryId,
		List<String> salesStatus,
		List<String> stockCount,
		List<String> imageUrl,
		List<String> tagsText
	) {
		Set<Long> selectedIds = selectedGoodsId == null ? Set.of() : new HashSet<>(selectedGoodsId);
		if (goodsId == null || goodsId.isEmpty()) {
			return List.of();
		}
		List<AdminGoodsBulkRow> rows = new ArrayList<>();
		for (int index = 0; index < goodsId.size(); index++) {
			Long rowGoodsId = goodsId.get(index);
			if (!selectedIds.contains(rowGoodsId)) {
				continue;
			}
			rows.add(new AdminGoodsBulkRow(
				rowGoodsId,
				stringAt(name, index),
				integerAt(price, index, "가격"),
				nullableLongAt(rowArtistId, index, "아티스트"),
				null,
				nullableLongAt(rowCategoryId, index, "카테고리"),
				null,
				stringAt(salesStatus, index),
				null,
				integerAt(stockCount, index, "재고"),
				stringAt(imageUrl, index),
				stringAt(tagsText, index)
			));
		}
		return rows;
	}

	private String redirectToGoods(String q, Long artistId, Long categoryId, String salesStatus, String sort, int page) {
		UriComponentsBuilder builder = UriComponentsBuilder.fromPath("/admin/goods");
		if (q != null && !q.isBlank()) {
			builder.queryParam("q", q.trim());
		}
		if (artistId != null) {
			builder.queryParam("artistId", artistId);
		}
		if (categoryId != null) {
			builder.queryParam("categoryId", categoryId);
		}
		if (salesStatus != null && !salesStatus.isBlank()) {
			builder.queryParam("salesStatus", salesStatus.trim());
		}
		builder.queryParam("sort", sort == null || sort.isBlank() ? "createdAt,desc" : sort);
		builder.queryParam("page", Math.max(page, 0));
		return "redirect:" + builder.build().encode().toUriString();
	}

	private String stringAt(List<String> values, int index) {
		if (values == null || index >= values.size()) {
			return "";
		}
		String value = values.get(index);
		return value == null ? "" : value;
	}

	private Integer integerAt(List<String> values, int index, String label) {
		String value = stringAt(values, index);
		if (value.isBlank()) {
			return 0;
		}
		try {
			return Integer.parseInt(value.trim());
		} catch (NumberFormatException exception) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, label + " 값이 올바르지 않습니다.");
		}
	}

	private Long nullableLongAt(List<String> values, int index, String label) {
		String value = stringAt(values, index);
		if (value.isBlank()) {
			return null;
		}
		try {
			return Long.parseLong(value.trim());
		} catch (NumberFormatException exception) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, label + " 값이 올바르지 않습니다.");
		}
	}

	private String formatTags(List<String> tags) {
		if (tags == null || tags.isEmpty()) {
			return "";
		}
		return tags.stream()
			.filter(tag -> tag != null && !tag.isBlank())
			.map(tag -> "#" + tag.trim())
			.collect(Collectors.joining(" "));
	}

	private String goodsForm(Model model, String mode) {
		addFormOptions(model);
		model.addAttribute("mode", mode);
		return "admin/goods/form";
	}

	private String adminGoodsErrorMessage(ResponseStatusException exception) {
		return exception.getReason() == null || exception.getReason().isBlank()
			? "굿즈 정보를 저장할 수 없습니다. 입력값을 확인해주세요."
			: exception.getReason();
	}

	private void addFormOptions(Model model) {
		model.addAttribute("filters", goodsService.findGoodsFilters());
		model.addAttribute("salesStatuses", SALES_STATUSES);
		model.addAttribute("salesStatusLabels", SALES_STATUS_LABELS);
		model.addAttribute("goodsImageBucket", AdminStoragePageController.GOODS_IMAGE_BUCKET);
		model.addAttribute("goodsImagePath", AdminStoragePageController.GOODS_IMAGE_PATH);
		try {
			model.addAttribute("goodsImages", supabaseStorageService.listImageObjects(
				AdminStoragePageController.GOODS_IMAGE_BUCKET,
				AdminStoragePageController.GOODS_IMAGE_PATH,
				1000
			));
		} catch (SupabaseStorageException exception) {
			model.addAttribute("goodsImages", List.of());
			model.addAttribute("imageLibraryError", exception.getMessage());
		}
	}

	private Map<Long, Integer> stockCounts(List<GoodsSummaryResponse> goods) {
		List<Long> goodsIds = goods.stream()
			.map(GoodsSummaryResponse::goodsId)
			.toList();
		return goodsStockRepository.findByGoodsIdIn(goodsIds).stream()
			.collect(Collectors.toMap(GoodsStock::getGoodsId, GoodsStock::getCurrentStock));
	}

	private Long findCategoryIdByGoodsId(Long goodsId) {
		return goodsRepository.findById(goodsId)
			.map(Goods::getCategory)
			.map(GoodsCategory::getCategoryId)
			.orElse(null);
	}

	private Integer findStockCount(Long goodsId) {
		return goodsStockRepository.findById(goodsId)
			.map(GoodsStock::getCurrentStock)
			.orElse(0);
	}

	private List<Integer> pageNumbers(int currentPage, int totalPages) {
		if (totalPages < 1) {
			return List.of();
		}

		int maxVisiblePages = 5;
		int halfWindow = maxVisiblePages / 2;
		int startPage = Math.max(0, Math.min(currentPage - halfWindow, totalPages - maxVisiblePages));
		int endPage = Math.min(totalPages, startPage + maxVisiblePages);
		return java.util.stream.IntStream.range(startPage, endPage).boxed().toList();
	}

	private static String trimTrailingSlash(String value) {
		if (value == null || value.isBlank()) {
			return "http://localhost:5173";
		}
		return value.endsWith("/") ? value.substring(0, value.length() - 1) : value;
	}
}
