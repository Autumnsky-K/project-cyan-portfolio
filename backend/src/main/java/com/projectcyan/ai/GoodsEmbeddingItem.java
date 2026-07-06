package com.projectcyan.ai;

import java.util.List;

public record GoodsEmbeddingItem(
	Long goodsId,
	List<Float> embedding,
	String embeddingModel,
	String sourceTextHash
) {

	public float[] embeddingArray() {
		float[] array = new float[embedding.size()];
		for (int index = 0; index < embedding.size(); index++) {
			array[index] = embedding.get(index);
		}
		return array;
	}
}
