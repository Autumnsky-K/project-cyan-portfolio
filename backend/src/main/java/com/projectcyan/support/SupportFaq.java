package com.projectcyan.support;

import java.time.OffsetDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;

@Entity
@Table(name = "support_faq")
public class SupportFaq {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "faq_id")
	private Long faqId;

	@Column(name = "category", nullable = false, length = 40)
	private String category;

	@Column(name = "question", nullable = false, length = 200)
	private String question;

	@Column(name = "answer", nullable = false, columnDefinition = "text")
	private String answer;

	@Column(name = "sort_order", nullable = false)
	private int sortOrder;

	@Column(name = "visible", nullable = false)
	private boolean visible = true;

	@Column(name = "created_at", insertable = false, updatable = false)
	private OffsetDateTime createdAt;

	@Column(name = "updated_at")
	private OffsetDateTime updatedAt;

	protected SupportFaq() {
	}

	SupportFaq(String category, String question, String answer, int sortOrder, boolean visible) {
		this.category = category;
		this.question = question;
		this.answer = answer;
		this.sortOrder = sortOrder;
		this.visible = visible;
	}

	@PrePersist
	void markCreated() {
		OffsetDateTime now = OffsetDateTime.now();
		this.createdAt = now;
		this.updatedAt = now;
	}

	@PreUpdate
	void markUpdated() {
		this.updatedAt = OffsetDateTime.now();
	}

	public Long getFaqId() {
		return faqId;
	}

	public String getCategory() {
		return category;
	}

	public String getQuestion() {
		return question;
	}

	public String getAnswer() {
		return answer;
	}

	public int getSortOrder() {
		return sortOrder;
	}

	public boolean isVisible() {
		return visible;
	}

	public OffsetDateTime getCreatedAt() {
		return createdAt;
	}

	public OffsetDateTime getUpdatedAt() {
		return updatedAt;
	}

	void update(String category, String question, String answer, int sortOrder, boolean visible) {
		this.category = category;
		this.question = question;
		this.answer = answer;
		this.sortOrder = sortOrder;
		this.visible = visible;
	}
}
