package com.projectcyan.member.auth;

import java.util.UUID;

public record VerifiedSupabaseJwt(
	UUID userId
) {
}
