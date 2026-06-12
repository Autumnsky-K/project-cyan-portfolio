package com.projectcyan.goods;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "artist")
public class Artist {

	@Id
	@Column(name = "artist_id")
	private Long artistId;

	@Column(name = "artist_name")
	private String artistName;

	@Column(name = "group_name")
	private String groupName;

	protected Artist() {
	}

	public Long getArtistId() {
		return artistId;
	}

	public String getArtistName() {
		return artistName;
	}

	public String getGroupName() {
		return groupName;
	}
}
