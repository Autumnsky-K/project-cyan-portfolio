package com.projectcyan.ai;

import com.projectcyan.ai.AdminAiBehaviorRunService.BehaviorRunRequest;
import com.projectcyan.ai.AdminAiBehaviorRunService.BehaviorRunSnapshot;
import com.projectcyan.ai.AdminAiBehaviorRunService.BehaviorSearchRequest;
import com.projectcyan.ai.AdminAiBehaviorRunService.BehaviorSearchResponse;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class AdminAiBehaviorRunController {

	private final AdminAiBehaviorRunService behaviorRunService;
	private final AdminAiBehaviorProxyService behaviorProxyService;

	public AdminAiBehaviorRunController(
		AdminAiBehaviorRunService behaviorRunService,
		AdminAiBehaviorProxyService behaviorProxyService
	) {
		this.behaviorRunService = behaviorRunService;
		this.behaviorProxyService = behaviorProxyService;
	}

	@PostMapping("/admin/ai/behavior/runs")
	public Map<String, Object> start(@RequestBody BehaviorRunRequest request) {
		return behaviorProxyService.run(request);
	}

	@GetMapping("/admin/ai/behavior/runs/{runId}")
	public Map<String, Object> find(@PathVariable String runId) {
		BehaviorRunSnapshot snapshot = behaviorRunService.find(runId)
			.orElseThrow(() -> new BehaviorRunNotFoundException(runId));
		return Map.of("ok", true, "run", snapshot);
	}

	@PostMapping("/admin/ai/behavior/search")
	public Map<String, Object> search(@RequestBody BehaviorSearchRequest request) {
		BehaviorSearchResponse result = behaviorRunService.search(request);
		return Map.of("ok", true, "result", result);
	}

	@ResponseStatus(HttpStatus.NOT_FOUND)
	private static class BehaviorRunNotFoundException extends RuntimeException {
		private BehaviorRunNotFoundException(String runId) {
			super("AI behavior run not found: " + runId);
		}
	}
}
