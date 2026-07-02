package com.projectcyan.storage;

import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.projectcyan.admin.SupabaseUsageCounter;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockMultipartFile;

class SupabaseStorageServiceTest {

	private SupabaseStorageService supabaseStorageService;

	@BeforeEach
	void setUp() {
		SupabaseStorageProperties properties = new SupabaseStorageProperties();
		properties.setProjectUrl("https://example.supabase.co");
		properties.setServiceRoleKey("service-role-key");
		supabaseStorageService = new SupabaseStorageService(properties, new SupabaseUsageCounter());
	}

	@Test
	void rejectsNonWebpImageUpload() {
		MockMultipartFile file = new MockMultipartFile(
			"file",
			"image.png",
			"image/png",
			new byte[] {(byte) 0x89, 'P', 'N', 'G'}
		);

		assertThatThrownBy(() -> supabaseStorageService.uploadObjectBySizePolicyWithResult(
			"images",
			"goods",
			"image.png",
			file,
			false
		))
			.isInstanceOf(SupabaseStorageException.class)
			.hasMessageContaining("WebP");
	}

	@Test
	void rejectsFileRenamedToWebpWithoutWebpContent() {
		MockMultipartFile file = new MockMultipartFile(
			"file",
			"image.webp",
			"image/webp",
			new byte[] {(byte) 0x89, 'P', 'N', 'G', 0, 0, 0, 0, 0, 0, 0, 0}
		);

		assertThatThrownBy(() -> supabaseStorageService.uploadObjectBySizePolicyWithResult(
			"images",
			"goods",
			"image.webp",
			file,
			false
		))
			.isInstanceOf(SupabaseStorageException.class)
			.hasMessageContaining("WebP");
	}
}
