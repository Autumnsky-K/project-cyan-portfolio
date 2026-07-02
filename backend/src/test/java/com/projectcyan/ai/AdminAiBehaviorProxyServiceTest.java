package com.projectcyan.ai;

import static org.assertj.core.api.Assertions.assertThat;

import com.projectcyan.ai.AdminAiBehaviorRunService.BehaviorRunRequest;
import com.sun.net.httpserver.HttpServer;
import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;
import java.util.Map;
import java.util.concurrent.atomic.AtomicReference;
import org.junit.jupiter.api.Test;

class AdminAiBehaviorProxyServiceTest {

	@Test
	void sendsJsonBodyToFastApiOverHttp11() throws Exception {
		AtomicReference<String> protocol = new AtomicReference<>();
		AtomicReference<String> contentType = new AtomicReference<>();
		AtomicReference<String> requestBody = new AtomicReference<>();
		HttpServer server = HttpServer.create(new InetSocketAddress("127.0.0.1", 0), 0);
		server.createContext("/internal/admin/behavior/trace", exchange -> {
			protocol.set(exchange.getProtocol());
			contentType.set(exchange.getRequestHeaders().getFirst("Content-Type"));
			requestBody.set(new String(exchange.getRequestBody().readAllBytes(), StandardCharsets.UTF_8));
			byte[] response = "{\"ok\":true,\"run\":{\"status\":\"OK\"}}".getBytes(StandardCharsets.UTF_8);
			exchange.getResponseHeaders().set("Content-Type", "application/json");
			exchange.sendResponseHeaders(200, response.length);
			exchange.getResponseBody().write(response);
			exchange.close();
		});
		server.start();

		try {
			AdminAiBehaviorProxyService service = new AdminAiBehaviorProxyService(
				"http://127.0.0.1:" + server.getAddress().getPort(),
				"service-token"
			);
			Map<String, Object> result = service.run(new BehaviorRunRequest(
				"",
				"step\truntime\tmethod",
				"section\tkey\tvalue\tnote",
				"motionKey\tlabel",
				"faithful18",
				1L,
				null,
				"포토카드 추천",
				"",
				""
			));

			assertThat(result.get("ok")).isEqualTo(true);
			assertThat(protocol.get()).isEqualTo("HTTP/1.1");
			assertThat(contentType.get()).startsWith("application/json");
			assertThat(requestBody.get()).contains("\"customerInput\":\"포토카드 추천\"");
		} finally {
			server.stop(0);
		}
	}
}
