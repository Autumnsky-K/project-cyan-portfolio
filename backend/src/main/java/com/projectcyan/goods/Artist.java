package com.projectcyan.goods;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "artist")
public class Artist {

	@Id
	@Column(name = "artist_id")
	private Long artistId;

	@Column(name = "artist_name")
	private String artistName;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "group_id")
	private ArtistGroup artistGroup;

	protected Artist() {
	}

	public Long getArtistId() {
		return artistId;
	}

	public String getArtistName() {
		return artistName;
	}

	public String getGroupName() {
		return artistGroup == null ? null : artistGroup.getGroupName();
	}

	public ArtistGroup getArtistGroup() {
		return artistGroup;
	}
}
