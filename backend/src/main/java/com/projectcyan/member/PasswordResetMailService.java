package com.projectcyan.member;

import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

@Service
public class PasswordResetMailService {

	private final JavaMailSender mailSender;
	private final PasswordResetProperties properties;

	public PasswordResetMailService(ObjectProvider<JavaMailSender> mailSender, PasswordResetProperties properties) {
		this.mailSender = mailSender.getIfAvailable();
		this.properties = properties;
	}

	public void send(String email, String resetLink) {
		if (mailSender == null) {
			throw new PasswordResetMailUnavailableException("Spring Mail is not configured.");
		}

		SimpleMailMessage message = new SimpleMailMessage();
		if (StringUtils.hasText(properties.getFrom())) {
			message.setFrom(properties.getFrom());
		}
		message.setTo(email);
		message.setSubject("[Project Cyan] 비밀번호 재설정 안내");
		message.setText("""
			안녕하세요. Project Cyan 계정의 비밀번호 재설정을 요청하셨습니다.

			아래 링크에서 새 비밀번호를 설정해주세요.
			%s

			직접 요청하지 않으셨다면 이 메일을 무시하셔도 됩니다.
			""".formatted(resetLink));

		try {
			mailSender.send(message);
		} catch (MailException exception) {
			throw exception;
		}
	}
}
