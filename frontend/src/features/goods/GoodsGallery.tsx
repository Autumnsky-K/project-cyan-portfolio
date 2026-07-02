import { useEffect, useMemo, useState } from 'react'
import type { GoodsDetail } from '../../api/goods'
import GoodsImage from './GoodsImage'

function GoodsGallery({ goods }: { goods: GoodsDetail }) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const galleryImages = useMemo(
    () => [
      ...(goods.imageUrl
        ? [{
            imageId: 0,
            imageUrl: goods.imageUrl,
            altText: goods.name,
            sortOrder: 0,
          }]
        : []),
      ...(goods.extraImages ?? []).filter((image) => Boolean(image.imageUrl)),
    ],
    [goods],
  )
  const selectedGalleryImage = galleryImages[selectedImageIndex] ?? galleryImages[0] ?? null
  const hasGalleryNavigation = galleryImages.length > 1

  useEffect(() => {
    setSelectedImageIndex(0)
  }, [goods.goodsId])

  return (
    <div className="detail-content">
      <div className="detail-image" aria-label={`${goods.name} 이미지`}>
        <GoodsImage
          src={selectedGalleryImage?.imageUrl ?? goods.imageUrl}
          alt={selectedGalleryImage?.altText || goods.name}
          fallbackLabel={goods.categoryName}
        />
        {hasGalleryNavigation && (
          <button
            className="detail-gallery-nav detail-gallery-nav-prev"
            type="button"
            aria-label="이전 이미지"
            onClick={() => setSelectedImageIndex((index) => (
              index <= 0 ? galleryImages.length - 1 : index - 1
            ))}
          >
            ‹
          </button>
        )}
        {hasGalleryNavigation && (
          <button
            className="detail-gallery-nav detail-gallery-nav-next"
            type="button"
            aria-label="다음 이미지"
            onClick={() => setSelectedImageIndex((index) => (
              index >= galleryImages.length - 1 ? 0 : index + 1
            ))}
          >
            ›
          </button>
        )}
      </div>
      {galleryImages.length > 1 && (
        <div className="detail-gallery-thumbnails" aria-label="상품 이미지 썸네일">
          {galleryImages.map((image, index) => (
            <button
              key={`${image.imageId}-${image.imageUrl}`}
              type="button"
              aria-label={`${goods.name} 이미지 ${index + 1}`}
              aria-current={selectedImageIndex === index ? 'true' : undefined}
              onClick={() => setSelectedImageIndex(index)}
            >
              <GoodsImage
                src={image.imageUrl}
                alt=""
                fallbackLabel={goods.categoryName}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default GoodsGallery
