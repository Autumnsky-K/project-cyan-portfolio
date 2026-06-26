package com.projectcyan.virtualchat;

import java.util.List;

import com.projectcyan.goods.PageResponse;
import com.projectcyan.member.auth.AuthenticatedMember;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/virtual-chat")
public class VirtualChatController {

	private final VirtualChatService virtualChatService;

	public VirtualChatController(VirtualChatService virtualChatService) {
		this.virtualChatService = virtualChatService;
	}

	@PostMapping("/sessions")
	public ResponseEntity<VirtualChatSessionResponse> createSession(
		@RequestBody(required = false) VirtualChatSessionRequest request,
		AuthenticatedMember currentMember
	) {
		return ResponseEntity.status(HttpStatus.CREATED)
			.body(virtualChatService.createSession(currentMember.memberId(), request));
	}

	@GetMapping("/sessions")
	public PageResponse<VirtualChatSessionResponse> findSessions(
		@RequestParam(defaultValue = "0") int page,
		@RequestParam(defaultValue = "20") int size,
		AuthenticatedMember currentMember
	) {
		return virtualChatService.findSessions(currentMember.memberId(), page, size);
	}

	@GetMapping("/sessions/{sessionId}/messages")
	public List<VirtualChatMessageResponse> findMessages(
		@PathVariable Long sessionId,
		AuthenticatedMember currentMember
	) {
		return virtualChatService.findMessages(currentMember.memberId(), sessionId);
	}

	@PostMapping("/sessions/{sessionId}/messages")
	public ResponseEntity<VirtualChatMessageResponse> createMessage(
		@PathVariable Long sessionId,
		@RequestBody VirtualChatMessageRequest request,
		AuthenticatedMember currentMember
	) {
		return ResponseEntity.status(HttpStatus.CREATED)
			.body(virtualChatService.createMessage(currentMember.memberId(), sessionId, request));
	}

	@PatchMapping("/sessions/{sessionId}/end")
	@ResponseStatus(HttpStatus.NO_CONTENT)
	public void endSession(
		@PathVariable Long sessionId,
		AuthenticatedMember currentMember
	) {
		virtualChatService.endSession(currentMember.memberId(), sessionId);
	}
}
