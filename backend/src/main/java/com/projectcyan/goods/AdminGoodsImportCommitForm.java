package com.projectcyan.goods;

import java.util.ArrayList;
import java.util.List;

public class AdminGoodsImportCommitForm {

	private List<String> goodsId = new ArrayList<>();
	private List<String> name = new ArrayList<>();
	private List<String> price = new ArrayList<>();
	private List<String> artistName = new ArrayList<>();
	private List<String> categoryName = new ArrayList<>();
	private List<String> stockCount = new ArrayList<>();
	private List<String> salesStatus = new ArrayList<>();
	private List<String> imageFolder = new ArrayList<>();
	private List<String> tagsText = new ArrayList<>();
	private List<String> description = new ArrayList<>();
	private List<String> bestSeller = new ArrayList<>();
	private List<String> aiPickDefault = new ArrayList<>();
	private String imageSource = "SUPABASE";
	private String imageBatchId;

	public List<AdminGoodsImportRow> toRows() {
		int rowCount = List.of(
			goodsId,
			name,
			price,
			artistName,
			categoryName,
			stockCount,
			salesStatus,
			imageFolder,
			tagsText,
			description,
			bestSeller,
			aiPickDefault
		).stream().mapToInt(List::size).max().orElse(0);

		List<AdminGoodsImportRow> rows = new ArrayList<>();
		for (int index = 0; index < rowCount; index++) {
			rows.add(new AdminGoodsImportRow(
				index + 2,
				valueAt(goodsId, index),
				valueAt(name, index),
				valueAt(price, index),
				valueAt(artistName, index),
				valueAt(categoryName, index),
				valueAt(stockCount, index),
				valueAt(salesStatus, index),
				valueAt(imageFolder, index),
				valueAt(tagsText, index),
				valueAt(description, index),
				valueAt(bestSeller, index),
				valueAt(aiPickDefault, index),
				null,
				null,
				null,
				null,
				List.of(),
				List.of(),
				List.of()
			));
		}
		return rows;
	}

	private String valueAt(List<String> values, int index) {
		if (values == null || index >= values.size()) {
			return "";
		}
		String value = values.get(index);
		return value == null ? "" : value;
	}

	public List<String> getGoodsId() {
		return goodsId;
	}

	public void setGoodsId(List<String> goodsId) {
		this.goodsId = goodsId == null ? new ArrayList<>() : goodsId;
	}

	public List<String> getName() {
		return name;
	}

	public void setName(List<String> name) {
		this.name = name == null ? new ArrayList<>() : name;
	}

	public List<String> getPrice() {
		return price;
	}

	public void setPrice(List<String> price) {
		this.price = price == null ? new ArrayList<>() : price;
	}

	public List<String> getArtistName() {
		return artistName;
	}

	public void setArtistName(List<String> artistName) {
		this.artistName = artistName == null ? new ArrayList<>() : artistName;
	}

	public List<String> getCategoryName() {
		return categoryName;
	}

	public void setCategoryName(List<String> categoryName) {
		this.categoryName = categoryName == null ? new ArrayList<>() : categoryName;
	}

	public List<String> getStockCount() {
		return stockCount;
	}

	public void setStockCount(List<String> stockCount) {
		this.stockCount = stockCount == null ? new ArrayList<>() : stockCount;
	}

	public List<String> getSalesStatus() {
		return salesStatus;
	}

	public void setSalesStatus(List<String> salesStatus) {
		this.salesStatus = salesStatus == null ? new ArrayList<>() : salesStatus;
	}

	public List<String> getImageFolder() {
		return imageFolder;
	}

	public void setImageFolder(List<String> imageFolder) {
		this.imageFolder = imageFolder == null ? new ArrayList<>() : imageFolder;
	}

	public List<String> getTagsText() {
		return tagsText;
	}

	public void setTagsText(List<String> tagsText) {
		this.tagsText = tagsText == null ? new ArrayList<>() : tagsText;
	}

	public List<String> getDescription() {
		return description;
	}

	public void setDescription(List<String> description) {
		this.description = description == null ? new ArrayList<>() : description;
	}

	public List<String> getBestSeller() {
		return bestSeller;
	}

	public void setBestSeller(List<String> bestSeller) {
		this.bestSeller = bestSeller == null ? new ArrayList<>() : bestSeller;
	}

	public List<String> getAiPickDefault() {
		return aiPickDefault;
	}

	public void setAiPickDefault(List<String> aiPickDefault) {
		this.aiPickDefault = aiPickDefault == null ? new ArrayList<>() : aiPickDefault;
	}

	public String getImageSource() {
		return imageSource;
	}

	public void setImageSource(String imageSource) {
		this.imageSource = imageSource == null ? "SUPABASE" : imageSource;
	}

	public String getImageBatchId() {
		return imageBatchId;
	}

	public void setImageBatchId(String imageBatchId) {
		this.imageBatchId = imageBatchId;
	}
}
