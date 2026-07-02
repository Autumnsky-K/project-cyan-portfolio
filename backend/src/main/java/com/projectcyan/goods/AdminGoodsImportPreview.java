package com.projectcyan.goods;

import java.util.List;

public record AdminGoodsImportPreview(
	List<AdminGoodsImportRow> rows,
	List<String> errors,
	String imageSource,
	String imageBatchId,
	List<String> imageFolders
) {
	public AdminGoodsImportPreview(List<AdminGoodsImportRow> rows) {
		this(rows, List.of(), "SUPABASE", null, List.of());
	}

	public boolean hasRows() {
		return rows != null && !rows.isEmpty();
	}

	public boolean hasErrors() {
		return (errors != null && !errors.isEmpty())
			|| (rows != null && rows.stream().anyMatch(row -> !row.valid()));
	}

	public long validCount() {
		return rows == null ? 0 : rows.stream().filter(AdminGoodsImportRow::valid).count();
	}

	public boolean usesLocalImages() {
		return "LOCAL".equalsIgnoreCase(imageSource);
	}
}
