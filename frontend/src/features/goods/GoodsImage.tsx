import { useState } from 'react'

type GoodsImageProps = {
  src?: string | null
  alt: string
  fallbackLabel?: string | null
}

function GoodsImage({ src, alt, fallbackLabel }: GoodsImageProps) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null)
  const hasError = Boolean(src && failedSrc === src)

  if (!src || hasError) {
    return (
      <div className="goods-image-fallback" role="img" aria-label={`${alt} 이미지를 불러올 수 없음`}>
        <span>CYAN</span>
        <strong>{fallbackLabel || '굿즈'}</strong>
      </div>
    )
  }

  return <img src={src} alt={alt} loading="lazy" decoding="async" onError={() => setFailedSrc(src)} />
}

export default GoodsImage
