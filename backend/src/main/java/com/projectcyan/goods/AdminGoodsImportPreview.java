package com.projectcyan.goods;

import java.util.List;

public record AdminGoodsImportPreview(
	List<AdminGoodsImportRow> rows
) {
	public boolean hasRows() {
		return rows != null && !rows.isEmpty();
	}

	public boolean hasErrors() {
		return rows != null && rows.stream().anyMatch(row -> !row.valid());
	}

	public long validCount() {
		return rows == null ? 0 : rows.stream().filter(AdminGoodsImportRow::valid).count();
	}
}
