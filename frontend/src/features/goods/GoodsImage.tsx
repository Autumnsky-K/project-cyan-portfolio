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
      <div className="goods-image-fallback" role="img" aria-label={`${alt} image unavailable`}>
        <span>CYAN</span>
        <strong>{fallbackLabel || 'Goods'}</strong>
      </div>
    )
  }

  return <img src={src} alt={alt} loading="lazy" decoding="async" onError={() => setFailedSrc(src)} />
}

export default GoodsImage
