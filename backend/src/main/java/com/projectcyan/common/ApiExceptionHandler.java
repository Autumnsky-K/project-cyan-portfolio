package com.projectcyan.common;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.server.ResponseStatusException;

@RestControllerAdvice
public class ApiExceptionHandler {

	@ExceptionHandler(ResponseStatusException.class)
	public ResponseEntity<ErrorResponse> handleResponseStatusException(ResponseStatusException exception) {
		HttpStatus status = HttpStatus.valueOf(exception.getStatusCode().value());
		String message = exception.getReason() == null ? status.getReasonPhrase() : exception.getReason();
		return ResponseEntity.status(status)
			.body(new ErrorResponse(codeFor(status), message, status.value()));
	}

	@ExceptionHandler(ApiErrorException.class)
	public ResponseEntity<ErrorResponse> handleApiErrorException(ApiErrorException exception) {
		return ResponseEntity.status(exception.getStatus())
			.body(new ErrorResponse(exception.getCode(), exception.getMessage(), exception.getStatus().value()));
	}

	@ExceptionHandler(MethodArgumentNotValidException.class)
	public ResponseEntity<ErrorResponse> handleMethodArgumentNotValidException(MethodArgumentNotValidException exception) {
		return ResponseEntity.status(HttpStatus.BAD_REQUEST)
			.body(new ErrorResponse("VALIDATION_FAILED", "요청 값을 확인해주세요.", HttpStatus.BAD_REQUEST.value()));
	}

	private String codeFor(HttpStatus status) {
		if (status == HttpStatus.NOT_FOUND) {
			return "GOODS_NOT_FOUND";
		}
		return "API_ERROR";
	}
}
