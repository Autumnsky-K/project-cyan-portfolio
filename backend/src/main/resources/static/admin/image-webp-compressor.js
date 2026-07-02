const ADMIN_IMAGE_WEBP_QUALITY = 0.82
const ADMIN_IMAGE_WEBP_MAX_DIMENSION = 2400

function adminWebpPathFor(path) {
  const normalizedPath = String(path || '').replace(/\\/g, '/')
  const slashIndex = normalizedPath.lastIndexOf('/')
  const folder = slashIndex >= 0 ? normalizedPath.slice(0, slashIndex + 1) : ''
  const fileName = slashIndex >= 0 ? normalizedPath.slice(slashIndex + 1) : normalizedPath
  const webpFileName = fileName.includes('.')
    ? fileName.replace(/\.[^.]+$/, '.webp')
    : `${fileName}.webp`
  return `${folder}${webpFileName}`
}

function adminLoadImageForCompression(file) {
  if (typeof createImageBitmap === 'function') {
    return createImageBitmap(file, { imageOrientation: 'from-image' }).then((bitmap) => ({
      width: bitmap.width,
      height: bitmap.height,
      draw(context, width, height) {
        context.drawImage(bitmap, 0, 0, width, height)
      },
      close() {
        bitmap.close?.()
      },
    }))
  }

  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file)
    const image = new Image()
    image.onload = () => {
      resolve({
        width: image.naturalWidth,
        height: image.naturalHeight,
        draw(context, width, height) {
          context.drawImage(image, 0, 0, width, height)
        },
        close() {
          URL.revokeObjectURL(objectUrl)
        },
      })
    }
    image.onerror = () => {
      URL.revokeObjectURL(objectUrl)
      reject(new Error('이미지를 WebP로 변환할 수 없습니다.'))
    }
    image.src = objectUrl
  })
}

function adminScaledImageSize(width, height, maxDimension) {
  const longestSide = Math.max(width, height)
  if (!Number.isFinite(longestSide) || longestSide <= 0) {
    throw new Error('이미지 크기를 확인할 수 없습니다.')
  }
  const scale = maxDimension > 0 ? Math.min(1, maxDimension / longestSide) : 1
  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale)),
  }
}

function adminCanvasToWebpBlob(canvas, quality) {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error('브라우저가 WebP 압축을 지원하지 않습니다.'))
        return
      }
      resolve(blob)
    }, 'image/webp', quality)
  })
}

async function adminCompressImageToWebp(file, options = {}) {
  if (!file) {
    throw new Error('이미지 파일을 선택해주세요.')
  }

  const quality = Number.isFinite(options.quality) ? options.quality : ADMIN_IMAGE_WEBP_QUALITY
  const maxDimension = Number.isFinite(options.maxDimension) ? options.maxDimension : ADMIN_IMAGE_WEBP_MAX_DIMENSION
  const sourceImage = await adminLoadImageForCompression(file)
  try {
    const size = adminScaledImageSize(sourceImage.width, sourceImage.height, maxDimension)
    const canvas = document.createElement('canvas')
    canvas.width = size.width
    canvas.height = size.height
    const context = canvas.getContext('2d', { alpha: true })
    if (!context) {
      throw new Error('이미지 압축 컨텍스트를 만들 수 없습니다.')
    }
    context.clearRect(0, 0, size.width, size.height)
    sourceImage.draw(context, size.width, size.height)

    const blob = await adminCanvasToWebpBlob(canvas, quality)
    const webpName = adminWebpPathFor(file.name).split('/').pop()
    const webpFile = new File([blob], webpName, {
      type: 'image/webp',
      lastModified: file.lastModified || Date.now(),
    })
    return {
      file: webpFile,
      originalSize: file.size,
      compressedSize: webpFile.size,
      width: size.width,
      height: size.height,
    }
  } finally {
    sourceImage.close()
  }
}

function adminCompressionSavingsLabel(originalSize, compressedSize) {
  if (!Number.isFinite(originalSize) || originalSize <= 0 || !Number.isFinite(compressedSize)) {
    return ''
  }
  const savedRatio = Math.round((1 - compressedSize / originalSize) * 100)
  if (savedRatio <= 0) {
    return 'WebP 변환'
  }
  return `WebP ${savedRatio}% 절감`
}

window.ProjectCyanImageCompression = {
  compressToWebp: adminCompressImageToWebp,
  savingsLabel: adminCompressionSavingsLabel,
  webpPathFor: adminWebpPathFor,
}
