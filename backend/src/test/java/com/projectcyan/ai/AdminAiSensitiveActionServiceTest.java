package com.projectcyan.ai;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.projectcyan.admin.auth.AdminAuthService;
import com.projectcyan.common.ApiErrorException;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;

class AdminAiSensitiveActionServiceTest {

	@Test
	void requiresCsrfAndPasswordBeforeIssuingShortLivedApproval() {
		AdminAiSensitiveActionService service = new AdminAiSensitiveActionService(
			new AdminAuthService("admin", "correct-password")
		);
		MockHttpServletRequest request = new MockHttpServletRequest();
		String csrfToken = service.csrfToken(request);

		assertThatThrownBy(() -> service.reauthenticate(request, csrfToken, "wrong"))
			.isInstanceOf(ApiErrorException.class)
			.hasMessageContaining("일치하지 않습니다");

		var approval = service.reauthenticate(request, csrfToken, "correct-password");
		assertThat(approval.approvalToken()).isNotBlank();
		service.requireApproval(request, csrfToken, approval.approvalToken());
	}

	@Test
	void rejectsMissingCsrfEvenWithCorrectPassword() {
		AdminAiSensitiveActionService service = new AdminAiSensitiveActionService(
			new AdminAuthService("admin", "correct-password")
		);
		MockHttpServletRequest request = new MockHttpServletRequest();
		service.csrfToken(request);

		assertThatThrownBy(() -> service.reauthenticate(request, "wrong-csrf", "correct-password"))
			.isInstanceOf(ApiErrorException.class)
			.hasMessageContaining("CSRF");
	}
}
