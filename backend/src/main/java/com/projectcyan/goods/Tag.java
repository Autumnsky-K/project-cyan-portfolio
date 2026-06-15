package com.projectcyan.goods;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "tag")
public class Tag {

	@Id
	@Column(name = "tag_id")
	private Long tagId;

	@Column(name = "tag_name")
	private String tagName;

	protected Tag() {
	}

	public Long getTagId() {
		return tagId;
	}

	public String getTagName() {
		return tagName;
	}
}
