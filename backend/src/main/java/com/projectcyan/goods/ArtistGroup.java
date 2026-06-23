package com.projectcyan.goods;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "artist_group")
public class ArtistGroup {

	@Id
	@Column(name = "group_id")
	private Long groupId;

	@Column(name = "group_name")
	private String groupName;

	protected ArtistGroup() {
	}

	public Long getGroupId() {
		return groupId;
	}

	public String getGroupName() {
		return groupName;
	}
}
