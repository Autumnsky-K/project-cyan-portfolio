package com.projectcyan.payment;

import java.math.BigDecimal;
import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;
import java.util.Set;

import org.springframework.dao.DataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

@Service
public class AdminPaymentService {

	private static final int MAX_ROWS = 100;
	private static final DateTimeFormatter TIME_FORMATTER = DateTimeFormatter.ofPattern("HH:mm:ss");
	private static final List<String> PAYMENT_TABLE_CANDIDATES = List.of(
		"payment_transactions",
		"payment_transaction",
		"payments",
		"payment",
		"order_payments",
		"order_payment",
		"toss_payments",
		"kakao_payments",
		"orders",
		"order"
	);
	private static final List<String> CREATED_AT_COLUMNS = List.of(
		"created_at",
		"requested_at",
		"approved_at",
		"updated_at",
		"paid_at",
		"ordered_at"
	);
	private static final String CHECKOUT_FLOW_SOURCE = "__checkout_payment_flow__";

	private final JdbcTemplate jdbcTemplate;

	public AdminPaymentService(JdbcTemplate jdbcTemplate) {
		this.jdbcTemplate = jdbcTemplate;
	}

	public AdminPaymentDashboard dashboard() {
		try {
			Optional<TableDescriptor> sourceTable = findPaymentSourceTable();
			if (sourceTable.isEmpty()) {
				return diagnosticDashboard("결제 테이블 없음", "public schema에서 결제/주문 테이블 후보를 찾지 못했습니다.");
			}

			List<AdminPaymentRow> rows = queryPaymentRows(sourceTable.get());
			if (rows.isEmpty()) {
				return diagnosticDashboard(
					"결제 데이터 없음",
					"Supabase 테이블 " + sourceTable.get().tableName() + " 조회는 성공했지만 표시할 행이 없습니다."
				);
			}
			return dashboardFromRows(rows, sourceTable.get().tableName());
		} catch (DataAccessException exception) {
			return diagnosticDashboard("결제 DB 조회 실패", rootMessage(exception));
		}
	}

	private Optional<TableDescriptor> findPaymentSourceTable() {
		List<String> tableNames = jdbcTemplate.queryForList(
			"""
			select table_name
			from information_schema.tables
			where table_schema = 'public'
			  and table_type = 'BASE TABLE'
			""",
			String.class
		);

		Map<String, String> actualTableNames = new HashMap<>();
		for (String tableName : tableNames) {
			actualTableNames.put(normalizeName(tableName), tableName);
		}

		String paymentTable = actualTableNames.get("payment");
		String ordersTable = actualTableNames.get("orders");
		if (paymentTable != null && ordersTable != null) {
			return Optional.of(new TableDescriptor(
				CHECKOUT_FLOW_SOURCE,
				List.of(
					"payment_id",
					"payment_amount",
					"payment_method",
					"payment_status",
					"provider",
					"provider_payment_key",
					"provider_order_id",
					"tid",
					"attempt_status",
					"partner_order_id",
					"partner_user_id",
					"requested_at",
					"payment_created_at",
					"order_id",
					"order_no",
					"order_status",
					"total_amount",
					"ordered_at",
					"member_id",
					"recipient_name"
				)
			));
		}

		for (String candidate : PAYMENT_TABLE_CANDIDATES) {
			String tableName = actualTableNames.get(normalizeName(candidate));
			if (tableName == null) {
				continue;
			}
			TableDescriptor descriptor = describeTable(tableName);
			if (isPaymentLike(descriptor.columns())) {
				return Optional.of(descriptor);
			}
		}

		for (String tableName : tableNames) {
			String normalized = normalizeName(tableName);
			if (!normalized.contains("payment") && !normalized.contains("pay")
				&& !normalized.contains("order") && !normalized.contains("transaction")) {
				continue;
			}
			TableDescriptor descriptor = describeTable(tableName);
			if (isPaymentLike(descriptor.columns())) {
				return Optional.of(descriptor);
			}
		}

		return Optional.empty();
	}

	private TableDescriptor describeTable(String tableName) {
		List<String> columns = jdbcTemplate.queryForList(
			"""
			select column_name
			from information_schema.columns
			where table_schema = 'public'
			  and table_name = ?
			order by ordinal_position
			""",
			String.class,
			tableName
		);
		return new TableDescriptor(tableName, columns);
	}

	private boolean isPaymentLike(List<String> columns) {
		Set<String> normalizedColumns = normalizedColumns(columns);
		return hasAny(normalizedColumns, "paymentstatus", "orderstatus", "paymentkey", "tid", "transactionid")
			|| (hasAny(normalizedColumns, "amount", "totalamount", "paymentamount", "totalprice")
				&& hasAny(normalizedColumns, "orderid", "orderno", "ordernumber", "id"));
	}

	private List<AdminPaymentRow> queryPaymentRows(TableDescriptor sourceTable) {
		if (CHECKOUT_FLOW_SOURCE.equals(sourceTable.tableName())) {
			return queryCheckoutPaymentRows();
		}

		String orderBy = orderByClause(sourceTable.columns());
		String sql = "select * from " + quoteIdentifier(sourceTable.tableName()) + orderBy + " limit " + MAX_ROWS;
		List<Map<String, Object>> rawRows = jdbcTemplate.queryForList(sql);
		List<AdminPaymentRow> rows = new ArrayList<>();
		for (int index = 0; index < rawRows.size(); index++) {
			rows.add(toAdminRow(rawRows.get(index), index + 1));
		}
		return rows;
	}

	private List<AdminPaymentRow> queryCheckoutPaymentRows() {
		String sql = """
			select
			  p.payment_id,
			  p.payment_amount,
			  p.payment_method,
			  p.payment_status,
			  p.provider,
			  p.provider_payment_key,
			  p.provider_order_id,
			  pa.tid,
			  pa.attempt_status,
			  pa.partner_order_id,
			  pa.partner_user_id,
			  p.requested_at,
			  p.created_at as payment_created_at,
			  o.order_id,
			  o.order_no,
			  o.order_status,
			  o.total_amount,
			  o.ordered_at,
			  o.member_id,
			  o.recipient_name
			from payment p
			join orders o on o.order_id = p.order_id
			left join payment_attempt pa on pa.payment_id = p.payment_id
			order by coalesce(p.requested_at, p.created_at, o.ordered_at) desc
			limit
			""" + MAX_ROWS;
		List<Map<String, Object>> rawRows = jdbcTemplate.queryForList(sql);
		List<AdminPaymentRow> rows = new ArrayList<>();
		for (int index = 0; index < rawRows.size(); index++) {
			rows.add(toAdminRow(rawRows.get(index), index + 1));
		}
		return rows;
	}

	private String orderByClause(List<String> columns) {
		Set<String> normalizedColumns = normalizedColumns(columns);
		for (String column : CREATED_AT_COLUMNS) {
			if (normalizedColumns.contains(normalizeName(column))) {
				return " order by " + quoteIdentifier(findActualColumn(columns, column).orElse(column)) + " desc";
			}
		}
		return "";
	}

	private Optional<String> findActualColumn(List<String> columns, String candidate) {
		String normalizedCandidate = normalizeName(candidate);
		return columns.stream()
			.filter(column -> normalizeName(column).equals(normalizedCandidate))
			.findFirst();
	}

	private AdminPaymentDashboard dashboardFromRows(List<AdminPaymentRow> rows, String tableName) {
		int approvedCount = countByStatus(rows, Set.of("DONE", "PAID", "APPROVED", "SUCCESS"));
		int pendingCount = countByStatus(rows, Set.of("READY", "PENDING", "IN_PROGRESS", "PAYMENT_PENDING"));
		int failedCount = countMatching(rows, row -> isProblemStatus(row.paymentStatus(), row.orderStatus()));
		int mismatchCount = countMatching(rows, row -> row.paymentStatus().contains("REPAIR")
			|| row.orderStatus().contains("REPAIR")
			|| row.failure().contains("미반영")
			|| row.failure().contains("대사"));
		int approvedAmount = rows.stream()
			.filter(row -> isApproved(row.paymentStatus(), row.orderStatus()))
			.mapToInt(AdminPaymentRow::amount)
			.sum();
		int canceledAmount = rows.stream()
			.filter(row -> row.paymentStatus().contains("CANCEL") || row.orderStatus().contains("CANCEL"))
			.mapToInt(AdminPaymentRow::amount)
			.sum();

		return new AdminPaymentDashboard(
			List.of(
				new KpiCard("승인 대기", Integer.toString(pendingCount), "Supabase " + tableName + " 기준"),
				new KpiCard("승인 완료", Integer.toString(approvedCount), formatAmount(approvedAmount)),
				new KpiCard("실패 / 보정", Integer.toString(failedCount), "실패, 취소, 환불, 보정 필요 포함"),
				new KpiCard("대사 불일치", Integer.toString(mismatchCount), "PG 승인 / DB 상태 차이 후보")
			),
			eventsFromRows(rows, tableName),
			List.of(
				new ReconciliationRow("DB 주문 금액 = PG 금액", "검토", "check-warn", rows.size()),
				new ReconciliationRow("PG 승인 / DB 미반영 후보", "확인", "check-warn", mismatchCount),
				new ReconciliationRow("실패 / 취소 / 환불", failedCount == 0 ? "정상" : "확인", failedCount == 0 ? "check-ok" : "check-warn", failedCount)
			),
			new SettlementSummary(
				"승인액",
				formatAmount(approvedAmount),
				"취소액",
				formatAmount(canceledAmount),
				"예상 정산액",
				formatAmount(Math.max(approvedAmount - canceledAmount, 0))
			),
			providerFilters(rows),
			statusFilters(rows),
			rows
		);
	}

	private List<PaymentEvent> eventsFromRows(List<AdminPaymentRow> rows, String tableName) {
		List<PaymentEvent> events = new ArrayList<>();
		events.add(new PaymentEvent("-", "DB.SOURCE", "Supabase public." + tableName + " 조회"));
		rows.stream().limit(2).forEach(row -> events.add(new PaymentEvent(
			row.orderTime(),
			row.provider() + "." + row.paymentStatus(),
			row.failure().isBlank() ? row.risk() : row.failure()
		)));
		return events;
	}

	private AdminPaymentDashboard diagnosticDashboard(String title, String message) {
		AdminPaymentRow diagnosticRow = row(
			"PAYMENT-DB-DIAGNOSTIC",
			"DB 진단",
			"-",
			"관리자",
			"system",
			"DB",
			"Supabase",
			"pg-toss",
			0,
			"REPAIR_REQUIRED",
			"확인",
			"status-repair",
			"DIAGNOSTIC",
			"-",
			"-",
			"DB 조회",
			title,
			message,
			"결제 테이블 연결 전 상태",
			List.of(
				step("테이블 탐색", "blocked", "확인", message),
				step("주문 생성", "muted", "미진입", "결제 테이블 필요"),
				step("약관 동의", "muted", "미진입", "결제 테이블 필요"),
				step("PG 인증", "muted", "미진입", "결제 테이블 필요"),
				step("승인 API", "muted", "미진입", "결제 테이블 필요"),
				step("금액 검증", "muted", "미진입", "결제 테이블 필요"),
				step("재고 확정", "muted", "미진입", "결제 테이블 필요"),
				step("웹훅/대사", "muted", "미진입", "결제 테이블 필요")
			)
		);
		return new AdminPaymentDashboard(
			List.of(
				new KpiCard("승인 대기", "0", "DB 연결 확인 필요"),
				new KpiCard("승인 완료", "0", "DB 연결 확인 필요"),
				new KpiCard("실패 / 보정", "1", title),
				new KpiCard("대사 불일치", "0", "DB 연결 확인 필요")
			),
			List.of(new PaymentEvent("-", "DB.DIAGNOSTIC", message)),
			List.of(new ReconciliationRow("결제 테이블 탐색", "확인", "check-warn", 1)),
			new SettlementSummary("승인액", "₩0", "취소액", "₩0", "예상 정산액", "₩0"),
			providerFilters(List.of(diagnosticRow)),
			statusFilters(List.of(diagnosticRow)),
			List.of(diagnosticRow)
		);
	}

	private AdminPaymentRow toAdminRow(Map<String, Object> rawRow, int rowNumber) {
		Map<String, Object> values = normalizeRow(rawRow);
		String orderId = firstText(values, "orderno", "providerorderid", "ordernumber", "partnerorderid", "merchantuid", "orderid", "id")
			.orElse("PAYMENT-ROW-" + rowNumber);
		String memberName = firstText(values, "recipientname", "membername", "username", "customername", "buyername", "email", "memberid", "userid")
			.orElse("회원 미상");
		String memberCode = firstText(values, "memberid", "userid", "customerid", "useruuid", "email")
			.map(value -> "member#" + value)
			.orElse("-");
		String paymentKey = firstText(values, "providerpaymentkey", "paymentkey", "paymentid", "pgpaymentkey", "tid", "transactionid")
			.orElse("-");
		String transactionId = firstText(values, "tid", "transactionid", "pgtransactionid", "approvalno", "paymentkey")
			.orElse(paymentKey);
		String provider = normalizeProvider(
			firstText(values, "provider", "pgprovider", "paymentprovider", "paymentmethod", "method", "pg", "channel").orElse(""),
			paymentKey,
			transactionId
		);
		String providerLabel = providerLabel(provider);
		int amount = firstNumber(values, "paymentamount", "amount", "totalamount", "totalprice", "price", "paidamount")
			.orElse(0);
		String paymentStatus = normalizeStatus(firstText(values, "paymentstatus", "pgstatus", "status", "paystatus").orElse("UNKNOWN"));
		String attemptStatus = normalizeStatus(firstText(values, "attemptstatus").orElse(""));
		String orderStatus = normalizeStatus(firstText(values, "orderstatus", "status", "ordstate").orElse(paymentStatus));
		String failure = firstText(values, "failurereason", "failreason", "errormessage", "errorcode", "cancelreason", "reason", "message")
			.orElseGet(() -> defaultFailure(paymentStatus, orderStatus));
		String risk = firstText(values, "risk", "riskmessage", "memo", "adminmemo", "note")
			.orElseGet(() -> defaultRisk(paymentStatus, orderStatus, failure));
		String items = firstText(values, "items", "itemname", "ordername", "productname", "goodsname", "title", "description")
			.orElse("상품 스냅샷 없음");
		String termsData = firstText(values, "terms", "agreements", "agreement", "termsdata")
			.map(value -> value.replace(",", "|"))
			.orElse("DB 조회|약관 컬럼 없음");
		String orderTime = firstValue(values, "requestedat", "paymentcreatedat", "createdat", "approvedat", "updatedat", "orderedat")
			.map(this::formatTime)
			.orElse("-");
		List<PaymentFlowStep> steps = inferFlow(paymentStatus, orderStatus, attemptStatus, failure, paymentKey, transactionId);

		return row(
			orderId,
			shortOrderId(orderId),
			orderTime,
			memberName,
			memberCode,
			provider,
			providerLabel,
			providerChipClass(provider),
			amount,
			paymentStatus,
			paymentStatusLabel(paymentStatus),
			paymentStatusClass(paymentStatus, orderStatus),
			orderStatus,
			paymentKey,
			transactionId,
			termsData,
			risk,
			failure,
			items,
			steps
		);
	}

	private List<PaymentFlowStep> inferFlow(
		String paymentStatus,
		String orderStatus,
		String attemptStatus,
		String failure,
		String paymentKey,
		String transactionId
	) {
		String combined = (paymentStatus + " " + orderStatus + " " + attemptStatus + " " + failure).toUpperCase(Locale.ROOT);
		boolean hasPaymentKey = paymentKey != null && !paymentKey.isBlank() && !"-".equals(paymentKey);
		boolean hasTransactionId = transactionId != null && !transactionId.isBlank() && !"-".equals(transactionId);
		boolean pgAuthenticated = hasPaymentKey || hasTransactionId || attemptStatus.contains("IN_PROGRESS");

		if (combined.contains("REPAIR") || combined.contains("SERVER") || combined.contains("STOCK") || failure.contains("재고")) {
			return List.of(
				step("주문 생성", "done", "완료", "DB 주문 행 확인"),
				step("약관 동의", "done", "완료", "약관 데이터 확인"),
				step("PG 인증", "doneBlue", "완료", pgAuthenticated ? "PG 키 확인" : "PG 인증 추정"),
				step("승인 API", "doneBlue", "완료", "승인 이후 보정 필요"),
				step("금액 검증", "done", "검토", "금액 비교 필요"),
				step("재고 확정", "blocked", "서버에러", failure),
				step("주문 확정", "muted", "미진입", "보정 후 전환"),
				step("웹훅/대사", "pending", "보정", "PG/DB 상태 재확인")
			);
		}
		if (combined.contains("CANCEL")) {
			return List.of(
				step("주문 생성", "done", "완료", "DB 주문 행 확인"),
				step("약관 동의", "done", "완료", "약관 데이터 확인"),
				step("PG 인증", "blocked", "취소", failure),
				step("승인 API", "muted", "미진입", "호출 안 됨"),
				step("금액 검증", "muted", "미진입", "미진입"),
				step("재고 확정", "muted", "미진입", "미진입"),
				step("주문 확정", "muted", "미진입", "미진입"),
				step("웹훅/대사", "doneBlue", "확인", "취소 상태 확인")
			);
		}
		if (combined.contains("REFUND")) {
			return List.of(
				step("주문 생성", "done", "완료", "DB 주문 행 확인"),
				step("약관 동의", "done", "완료", "약관 데이터 확인"),
				step("PG 인증", "doneBlue", "완료", "PG 키 확인"),
				step("승인 API", "doneBlue", "완료", "승인 완료"),
				step("금액 검증", "done", "검토", "환불 금액 확인"),
				step("재고 확정", "done", "보류", "출고 상태 확인"),
				step("주문 확정", "done", "완료", "결제 완료 후 환불 요청"),
				step("웹훅/대사", "pending", "검토", "환불 상태 대사")
			);
		}
		if (combined.contains("FAIL") || combined.contains("ERROR") || combined.contains("TIMEOUT") || combined.contains("DENY")) {
			boolean balanceBlocked = combined.contains("BALANCE") || failure.contains("잔액");
			return List.of(
				step("주문 생성", "done", "완료", "DB 주문 행 확인"),
				step("약관 동의", "done", "완료", "약관 데이터 확인"),
				step("PG 인증", balanceBlocked ? "blocked" : "doneBlue", balanceBlocked ? "잔액부족" : "완료", failure),
				step("승인 API", balanceBlocked ? "muted" : "blocked", balanceBlocked ? "미진입" : "API 실패", failure),
				step("금액 검증", "muted", "미진입", "승인 실패"),
				step("재고 확정", "muted", "미진입", "미진입"),
				step("주문 확정", "muted", "미진입", "미진입"),
				step("웹훅/대사", balanceBlocked ? "muted" : "pending", balanceBlocked ? "미진입" : "재조회", "PG 상태 재조회 필요")
			);
		}
		if (isApproved(paymentStatus, orderStatus)) {
			return List.of(
				step("주문 생성", "done", "완료", "DB 주문 행 확인"),
				step("약관 동의", "done", "완료", "약관 데이터 확인"),
				step("PG 인증", "doneBlue", "완료", "PG 키 확인"),
				step("승인 API", "doneBlue", "완료", "승인 완료"),
				step("금액 검증", "done", "일치", "DB/PG 금액 확인"),
				step("재고 확정", "done", "완료", "재고 처리 완료"),
				step("주문 확정", "done", "완료", "주문 상태 완료"),
				step("웹훅/대사", "doneBlue", "정상", "대사 정상")
			);
		}
		return List.of(
			step("주문 생성", "done", "완료", "DB 주문 행 확인"),
			step("약관 동의", "done", "완료", "약관 데이터 확인"),
			step("PG 인증", pgAuthenticated ? "doneBlue" : "pending", pgAuthenticated ? "완료" : "대기", pgAuthenticated ? "PG 키 확인" : "PG 인증 대기"),
			step("승인 API", "pending", "대기", "승인 API 대기"),
			step("금액 검증", "muted", "미진입", "승인 후 비교"),
			step("재고 확정", "muted", "미진입", "미진입"),
			step("주문 확정", "muted", "미진입", "미진입"),
			step("웹훅/대사", "muted", "미진입", "미진입")
		);
	}

	private AdminPaymentRow row(
		String orderId,
		String shortOrderId,
		String orderTime,
		String memberName,
		String memberCode,
		String provider,
		String providerLabel,
		String providerChipClass,
		int amount,
		String paymentStatus,
		String paymentStatusLabel,
		String paymentStatusClass,
		String orderStatus,
		String paymentKey,
		String transactionId,
		String termsData,
		String risk,
		String failure,
		String items,
		List<PaymentFlowStep> flowSteps
	) {
		return new AdminPaymentRow(
			orderId,
			shortOrderId,
			orderTime,
			memberName,
			memberCode,
			provider,
			providerLabel,
			providerChipClass,
			amount,
			formatAmount(amount),
			paymentStatus,
			paymentStatusLabel,
			paymentStatusClass,
			orderStatus,
			paymentKey,
			transactionId,
			termsData,
			risk,
			failure,
			items,
			flowSteps,
			flowData(flowSteps)
		);
	}

	private PaymentFlowStep step(String label, String status, String cellLabel, String detail) {
		return new PaymentFlowStep(label, status, cellLabel, detail, flowCssClass(status));
	}

	private String flowCssClass(String status) {
		return switch (status) {
			case "done" -> "flow-done";
			case "doneBlue" -> "flow-done-blue";
			case "pending" -> "flow-pending";
			case "blocked" -> "flow-blocked";
			default -> "flow-muted";
		};
	}

	private String flowData(List<PaymentFlowStep> steps) {
		return steps.stream()
			.map(step -> step.label() + "=" + step.status() + "=" + step.detail())
			.reduce((left, right) -> left + "|" + right)
			.orElse("");
	}

	private Map<String, Object> normalizeRow(Map<String, Object> rawRow) {
		Map<String, Object> normalized = new HashMap<>();
		for (Map.Entry<String, Object> entry : rawRow.entrySet()) {
			normalized.put(normalizeName(entry.getKey()), entry.getValue());
		}
		return normalized;
	}

	private Optional<String> firstText(Map<String, Object> values, String... keys) {
		return firstValue(values, keys)
			.map(String::valueOf)
			.map(String::trim)
			.filter(value -> !value.isBlank());
	}

	private Optional<Object> firstValue(Map<String, Object> values, String... keys) {
		for (String key : keys) {
			Object value = values.get(normalizeName(key));
			if (value != null) {
				return Optional.of(value);
			}
		}
		return Optional.empty();
	}

	private Optional<Integer> firstNumber(Map<String, Object> values, String... keys) {
		return firstValue(values, keys).flatMap(this::toInteger);
	}

	private Optional<Integer> toInteger(Object value) {
		if (value instanceof Integer integer) {
			return Optional.of(integer);
		}
		if (value instanceof Long longValue) {
			return Optional.of(Math.toIntExact(longValue));
		}
		if (value instanceof BigDecimal decimal) {
			return Optional.of(decimal.intValue());
		}
		if (value instanceof Number number) {
			return Optional.of(number.intValue());
		}
		String normalized = String.valueOf(value).replaceAll("[^0-9-]", "");
		if (normalized.isBlank()) {
			return Optional.empty();
		}
		try {
			return Optional.of(Integer.parseInt(normalized));
		} catch (NumberFormatException exception) {
			return Optional.empty();
		}
	}

	private Set<String> normalizedColumns(List<String> columns) {
		Set<String> normalizedColumns = new HashSet<>();
		for (String column : columns) {
			normalizedColumns.add(normalizeName(column));
		}
		return normalizedColumns;
	}

	private boolean hasAny(Set<String> values, String... keys) {
		for (String key : keys) {
			if (values.contains(normalizeName(key))) {
				return true;
			}
		}
		return false;
	}

	private String normalizeName(String value) {
		return value == null ? "" : value.toLowerCase(Locale.ROOT).replaceAll("[^a-z0-9]", "");
	}

	private String normalizeStatus(String value) {
		return value == null || value.isBlank()
			? "UNKNOWN"
			: value.trim().toUpperCase(Locale.ROOT).replace('-', '_').replace(' ', '_');
	}

	private String normalizeProvider(String rawProvider, String paymentKey, String transactionId) {
		String combined = (rawProvider + " " + paymentKey + " " + transactionId).toUpperCase(Locale.ROOT);
		if (combined.contains("KAKAO")) {
			return "KAKAO";
		}
		if (combined.contains("TOSS") || combined.contains("PAY_")) {
			return "TOSS";
		}
		return rawProvider == null || rawProvider.isBlank() ? "UNKNOWN" : rawProvider.trim().toUpperCase(Locale.ROOT);
	}

	private String providerLabel(String provider) {
		return switch (provider) {
			case "KAKAO" -> "KakaoPay";
			case "TOSS" -> "Toss";
			case "UNKNOWN" -> "PG 미상";
			default -> provider;
		};
	}

	private String providerChipClass(String provider) {
		return "KAKAO".equals(provider) ? "pg-kakao" : "pg-toss";
	}

	private String paymentStatusLabel(String paymentStatus) {
		return switch (paymentStatus) {
			case "REPAIR_REQUIRED" -> "REPAIR";
			case "REFUND_REQUESTED" -> "REFUND";
			default -> paymentStatus;
		};
	}

	private String paymentStatusClass(String paymentStatus, String orderStatus) {
		String combined = paymentStatus + " " + orderStatus;
		if (combined.contains("REPAIR")) {
			return "status-repair";
		}
		if (combined.contains("REFUND")) {
			return "status-refund";
		}
		if (combined.contains("CANCEL")) {
			return "status-canceled";
		}
		if (combined.contains("FAIL") || combined.contains("ERROR")) {
			return "status-failed";
		}
		if (isApproved(paymentStatus, orderStatus)) {
			return "status-done";
		}
		return "status-ready";
	}

	private String defaultFailure(String paymentStatus, String orderStatus) {
		String combined = paymentStatus + " " + orderStatus;
		if (combined.contains("DONE") || combined.contains("PAID") || combined.contains("APPROVED")) {
			return "없음";
		}
		if (combined.contains("CANCEL")) {
			return "취소 상태";
		}
		if (combined.contains("FAIL")) {
			return "실패 사유 컬럼 없음";
		}
		return "진행 중";
	}

	private String defaultRisk(String paymentStatus, String orderStatus, String failure) {
		if (isApproved(paymentStatus, orderStatus)) {
			return "승인 완료";
		}
		return failure == null || failure.isBlank() ? "상태 확인 필요" : failure;
	}

	private boolean isApproved(String paymentStatus, String orderStatus) {
		return containsAny(paymentStatus, "DONE", "PAID", "APPROVED", "SUCCESS")
			|| containsAny(orderStatus, "DONE", "PAID", "APPROVED", "SUCCESS");
	}

	private boolean isProblemStatus(String paymentStatus, String orderStatus) {
		return containsAny(paymentStatus, "FAIL", "CANCEL", "REFUND", "REPAIR", "ERROR")
			|| containsAny(orderStatus, "FAIL", "CANCEL", "REFUND", "REPAIR", "ERROR");
	}

	private boolean containsAny(String value, String... needles) {
		String normalized = value == null ? "" : value.toUpperCase(Locale.ROOT);
		for (String needle : needles) {
			if (normalized.contains(needle)) {
				return true;
			}
		}
		return false;
	}

	private int countByStatus(List<AdminPaymentRow> rows, Set<String> statuses) {
		return countMatching(rows, row -> statuses.stream()
			.anyMatch(status -> row.paymentStatus().contains(status) || row.orderStatus().contains(status)));
	}

	private int countMatching(List<AdminPaymentRow> rows, RowPredicate predicate) {
		int count = 0;
		for (AdminPaymentRow row : rows) {
			if (predicate.test(row)) {
				count++;
			}
		}
		return count;
	}

	private List<FilterOption> providerFilters(List<AdminPaymentRow> rows) {
		List<FilterOption> filters = new ArrayList<>();
		filters.add(new FilterOption("all", "전체", true));
		addProviderFilter(filters, rows, "TOSS", "Toss");
		addProviderFilter(filters, rows, "KAKAO", "KakaoPay");
		return filters;
	}

	private void addProviderFilter(List<FilterOption> filters, List<AdminPaymentRow> rows, String provider, String label) {
		if (rows.stream().anyMatch(row -> provider.equals(row.provider()))) {
			filters.add(new FilterOption(provider, label, false));
		}
	}

	private List<FilterOption> statusFilters(List<AdminPaymentRow> rows) {
		List<FilterOption> filters = new ArrayList<>();
		filters.add(new FilterOption("all", "전체", true));
		filters.add(new FilterOption("SUCCESS", "성공", false));
		filters.add(new FilterOption("READY", "승인 대기", false));
		filters.add(new FilterOption("FAILED", "실패", false));
		return filters;
	}

	private String shortOrderId(String orderId) {
		if (orderId == null || orderId.length() <= 14) {
			return orderId;
		}
		return orderId.substring(Math.max(orderId.length() - 8, 0));
	}

	private String formatTime(Object value) {
		if (value instanceof Timestamp timestamp) {
			return timestamp.toLocalDateTime().format(TIME_FORMATTER);
		}
		if (value instanceof LocalDateTime dateTime) {
			return dateTime.format(TIME_FORMATTER);
		}
		String text = String.valueOf(value);
		return text.length() >= 19 ? text.substring(11, 19) : text;
	}

	private String formatAmount(int amount) {
		return "₩" + String.format("%,d", amount);
	}

	private String quoteIdentifier(String identifier) {
		return "\"" + identifier.replace("\"", "\"\"") + "\"";
	}

	private String rootMessage(Exception exception) {
		Throwable current = exception;
		while (current.getCause() != null) {
			current = current.getCause();
		}
		return current.getMessage() == null ? exception.getMessage() : current.getMessage();
	}

	private record TableDescriptor(String tableName, List<String> columns) {
	}

	@FunctionalInterface
	private interface RowPredicate {
		boolean test(AdminPaymentRow row);
	}

	public record AdminPaymentDashboard(
		List<KpiCard> kpis,
		List<PaymentEvent> events,
		List<ReconciliationRow> reconciliationRows,
		SettlementSummary settlement,
		List<FilterOption> providerFilters,
		List<FilterOption> statusFilters,
		List<AdminPaymentRow> rows
	) {
	}

	public record KpiCard(String label, String value, String note) {
	}

	public record PaymentEvent(String time, String code, String message) {
	}

	public record ReconciliationRow(String label, String statusLabel, String statusClass, int count) {
	}

	public record SettlementSummary(
		String approvedLabel,
		String approvedAmount,
		String canceledLabel,
		String canceledAmount,
		String expectedLabel,
		String expectedAmount
	) {
	}

	public record FilterOption(String value, String label, boolean active) {
	}

	public record AdminPaymentRow(
		String orderId,
		String shortOrderId,
		String orderTime,
		String memberName,
		String memberCode,
		String provider,
		String providerLabel,
		String providerChipClass,
		int amount,
		String amountLabel,
		String paymentStatus,
		String paymentStatusLabel,
		String paymentStatusClass,
		String orderStatus,
		String paymentKey,
		String transactionId,
		String termsData,
		String risk,
		String failure,
		String items,
		List<PaymentFlowStep> flowSteps,
		String flowData
	) {
	}

	public record PaymentFlowStep(String label, String status, String cellLabel, String detail, String cssClass) {
	}
}
