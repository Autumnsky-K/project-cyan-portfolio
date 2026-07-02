package com.projectcyan.member;

import org.springframework.mail.MailException;

public class PasswordResetMailUnavailableException extends MailException {

	public PasswordResetMailUnavailableException(String message) {
		super(message);
	}
}
