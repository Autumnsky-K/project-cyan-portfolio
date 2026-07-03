package com.projectcyan.member;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import java.math.BigDecimal;
import java.sql.ResultSet;
import java.util.List;

import com.projectcyan.storage.SupabaseStorageService;

import org.junit.jupiter.api.Test;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.ResultSetExtractor;

class DigitalLibraryServiceTest {

	private final JdbcTemplate jdbcTemplate = mock(JdbcTemplate.class);
	private final SupabaseStorageService storageService = mock(SupabaseStorageService.class);
	private final DigitalLibraryService service = new DigitalLibraryService(jdbcTemplate, storageService);

	@Test
	@SuppressWarnings("unchecked")
	void mapsNumericPriceToIntegerPrice() throws Exception {
		ResultSet resultSet = mock(ResultSet.class);
		when(resultSet.next()).thenReturn(true, false);
		when(resultSet.getLong("entitlement_id")).thenReturn(21L);
		when(resultSet.getLong("goods_id")).thenReturn(42L);
		when(resultSet.getString("goods_name")).thenReturn("Digital Album");
		when(resultSet.getBigDecimal("price")).thenReturn(new BigDecimal("12000"));
		when(resultSet.getInt("download_limit_per_period")).thenReturn(1);
		when(resultSet.getInt("period_download_count")).thenReturn(0);
		when(resultSet.getInt("download_period_days")).thenReturn(30);

		when(jdbcTemplate.query(
			anyString(),
			any(ResultSetExtractor.class),
			any(Object[].class)
		)).thenAnswer(invocation -> {
			ResultSetExtractor<List<DigitalLibraryItemResponse>> extractor = invocation.getArgument(1);
			return extractor.extractData(resultSet);
		});

		List<DigitalLibraryItemResponse> response = service.findLibrary(7L, null);

		assertThat(response).hasSize(1);
		assertThat(response.getFirst().price()).isEqualTo(12000);
	}
}
