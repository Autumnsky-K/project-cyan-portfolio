package com.projectcyan.member.auth;

import com.projectcyan.common.ApiErrorException;
import jakarta.servlet.http.HttpServletRequest;

import org.springframework.core.MethodParameter;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.bind.support.WebDataBinderFactory;
import org.springframework.web.context.request.NativeWebRequest;
import org.springframework.web.method.support.HandlerMethodArgumentResolver;
import org.springframework.web.method.support.ModelAndViewContainer;

@Component
public class CurrentMemberArgumentResolver implements HandlerMethodArgumentResolver {

	@Override
	public boolean supportsParameter(MethodParameter parameter) {
		return parameter.getParameterType().equals(AuthenticatedMember.class);
	}

	@Override
	public Object resolveArgument(
		MethodParameter parameter,
		ModelAndViewContainer mavContainer,
		NativeWebRequest webRequest,
		WebDataBinderFactory binderFactory
	) {
		HttpServletRequest request = webRequest.getNativeRequest(HttpServletRequest.class);
		if (request != null) {
			Object currentMember = request.getAttribute(
				SupabaseJwtAuthenticationFilter.AUTHENTICATED_MEMBER_ATTRIBUTE
			);
			if (currentMember instanceof AuthenticatedMember authenticatedMember) {
				return authenticatedMember;
			}
		}
		throw new ApiErrorException(
			"AUTH_UNAUTHORIZED",
			"로그인이 필요합니다.",
			HttpStatus.UNAUTHORIZED
		);
	}
}
