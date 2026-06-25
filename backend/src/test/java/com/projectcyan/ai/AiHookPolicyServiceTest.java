package com.projectcyan.ai;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import java.util.List;

import org.junit.jupiter.api.Test;

import com.projectcyan.common.ApiErrorException;

class AiHookPolicyServiceTest {

	private final AiHookPolicyService service = new AiHookPolicyService(mock(AiHookPolicyRepository.class));

	@Test
	void buildsOnlyHeaderWhenNoPoliciesAreSaved() {
		AiHookPolicyRepository repository = mock(AiHookPolicyRepository.class);
		when(repository.findAllByOrderByPriorityAscPolicyIdAsc()).thenReturn(List.of());
		AiHookPolicyService emptyService = new AiHookPolicyService(repository);

		assertThat(emptyService.buildHookSheetText()).isEqualTo("hook\tcheck\tthreshold\taction\tmessage\n");
	}

	@Test
	void parsesHookPolicySheetRows() {
		List<AiHookPolicy> policies = service.parseSheetText("""
			hook\tcheck\tthreshold\taction\tmessage
			input\tmaxLength\t500\tstop\t짧게 입력해주세요.
			output\tactionScope\tnavigate,highlight\tfilter\t허용 액션만 실행합니다.
			""");

		assertThat(policies).hasSize(2);
		assertThat(policies.get(0).getHook()).isEqualTo("input");
		assertThat(policies.get(0).getCheck()).isEqualTo("maxLength");
		assertThat(policies.get(0).getPriority()).isEqualTo(1);
		assertThat(policies.get(1).getAction()).isEqualTo("filter");
	}

	@Test
	void rejectsUnsupportedCheck() {
		assertThatThrownBy(() -> service.parseSheetText("""
			hook\tcheck\tthreshold\taction\tmessage
			input\tunknown\t500\tstop\t짧게 입력해주세요.
			"""))
			.isInstanceOf(ApiErrorException.class)
			.hasMessageContaining("Unsupported AI hook check");
	}
}
