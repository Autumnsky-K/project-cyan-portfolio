package com.projectcyan.ai;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.projectcyan.ai.AiBehaviorRuntimeConfigService.PublishRuntimeConfigRequest;
import com.projectcyan.common.ApiErrorException;
import com.projectcyan.storage.SupabaseStorageService;
import org.junit.jupiter.api.Test;

class AiBehaviorRuntimeConfigServiceTest {

	private final SupabaseStorageService storageService = mock(SupabaseStorageService.class);
	private final AiGoodsCatalogProperties properties = new AiGoodsCatalogProperties();
	private final AiBehaviorRuntimeConfigService service = new AiBehaviorRuntimeConfigService(
		storageService,
		properties
	);

	@Test
	void publishesValidatedFilesAndManifest() {
		when(storageService.createSignedObjectUrl(anyString(), anyString(), anyLong()))
			.thenAnswer(invocation -> "https://signed/" + invocation.getArgument(1));

		var response = service.publish(validRequest());

		assertThat(response.pipelineMode()).isEqualTo("faithful18");
		assertThat(response.files()).containsKeys("logicFunctionsUrl", "adminSettingsUrl", "motionListUrl");
		assertThat(response.checksums().get("adminSettings")).hasSize(64);
		verify(storageService, org.mockito.Mockito.times(4)).uploadTextObject(
			anyString(), anyString(), anyString(), anyString(), any(), org.mockito.ArgumentMatchers.eq(true)
		);
	}

	@Test
	void publishesOnlyModelConnectionReferenceWithoutCredential() {
		when(storageService.createSignedObjectUrl(anyString(), anyString(), anyLong()))
			.thenAnswer(invocation -> "https://signed/" + invocation.getArgument(1));

		var response = service.publish(
			validRequest(),
			new AiLlmConnectionService.ModelConnectionReference(3L, 7L)
		);

		assertThat(response.modelConnection().profileId()).isEqualTo(3L);
		assertThat(response.modelConnection().profileVersion()).isEqualTo(7L);
	}

	@Test
	void rejectsMissingRequiredMotion() {
		PublishRuntimeConfigRequest request = validRequest();
		assertThatThrownBy(() -> service.publish(new PublishRuntimeConfigRequest(
			request.logicFunctions(),
			request.adminSettings(),
			"motionKey\tlabel\nidle\t대기",
			request.pipelineMode()
		)))
			.isInstanceOf(ApiErrorException.class)
			.hasMessageContaining("missing motionKey");
	}

	private PublishRuntimeConfigRequest validRequest() {
		StringBuilder logic = new StringBuilder("step\tname\tdescription\n");
		for (int step = 1; step <= 18; step++) {
			logic.append(String.format("%02d\tstep-%02d\tdescription%n", step, step));
		}
		return new PublishRuntimeConfigRequest(
			logic.toString(),
			"section\tkey\tvalue\tnote\npersona\ttone\t친근한 점원\t",
			String.join("\n",
				"motionKey\tlabel",
				"idle\t대기",
				"wave\t인사",
				"point\t가리키기",
				"nod\t끄덕이기",
				"shake-head\t거절"
			),
			"faithful18"
		);
	}
}
