package com.projectcyan.member;

import java.util.UUID;

public record SupabaseAuthUser(
	UUID id,
	String email
) {
}
