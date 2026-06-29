package com.projectcyan.ai;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

import com.projectcyan.goods.Artist;
import com.projectcyan.goods.Goods;
import com.projectcyan.goods.GoodsCategory;
import com.projectcyan.goods.Tag;
import org.junit.jupiter.api.Test;

class AiGoodsCatalogServiceTest {

	@Test
	void buildsCatalogTsvWithExpectedHeaderAndSanitizedRows() {
		AiGoodsCatalogService service = new AiGoodsCatalogService(
			null,
			null,
			null,
			null,
			new AiGoodsCatalogProperties()
		);
		Goods goods = goods();

		String tsv = service.buildCatalogTsv(List.of(goods), Map.of(1001L, 12));

		assertThat(tsv).isEqualTo("""
			goodsId\tname\tprice\tartistId\tartistName\tgroupName\tcategoryName\ttags\tsalesStatus\tstockCount\taiPickDefault\tbestSeller\tdescription
			1001\tPhotocard Set Vol.1\t12000\t1\tArtist A\tGROUP ONE\tPhotocard\tARTIST_A,PHOTOCARD\tON_SALE\t12\ttrue\tfalse\tLine one Line two with tab
			""");
	}

	private Goods goods() {
		Goods goods = mock(Goods.class);
		Artist artist = artist();
		GoodsCategory category = category();
		Tag photocardTag = tag("PHOTOCARD");
		Tag artistTag = tag("ARTIST_A");
		when(goods.getGoodsId()).thenReturn(1001L);
		when(goods.getGoodsName()).thenReturn("Photocard Set Vol.1");
		when(goods.getPrice()).thenReturn(12_000);
		when(goods.getSalesStatus()).thenReturn("ON_SALE");
		when(goods.getAiPickDefault()).thenReturn(true);
		when(goods.getBestSeller()).thenReturn(false);
		when(goods.getDescription()).thenReturn("Line one\nLine two\twith tab");
		when(goods.getArtist()).thenReturn(artist);
		when(goods.getCategory()).thenReturn(category);
		when(goods.getTags()).thenReturn(new LinkedHashSet<>(Set.of(photocardTag, artistTag)));
		return goods;
	}

	private Artist artist() {
		Artist artist = mock(Artist.class);
		when(artist.getArtistId()).thenReturn(1L);
		when(artist.getArtistName()).thenReturn("Artist A");
		when(artist.getGroupName()).thenReturn("GROUP ONE");
		return artist;
	}

	private GoodsCategory category() {
		GoodsCategory category = mock(GoodsCategory.class);
		when(category.getCategoryName()).thenReturn("Photocard");
		return category;
	}

	private Tag tag(String tagName) {
		Tag tag = mock(Tag.class);
		when(tag.getTagName()).thenReturn(tagName);
		return tag;
	}
}
