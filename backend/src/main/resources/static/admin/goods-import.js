(() => {
  const form = document.querySelector('[data-goods-import-form]')
  if (!form) {
    return
  }

  const localToggle = form.querySelector('[data-import-local-toggle]')
  const localFields = form.querySelector('[data-import-local-fields]')
  const csvInput = form.querySelector('[data-import-csv]')
  const imageInput = form.querySelector('[data-import-images]')
  const status = form.querySelector('[data-import-status]')
  const submitButton = form.querySelector('button[type="submit"]')

  function setStatus(message) {
    if (status) {
      status.textContent = message || ''
    }
  }

  function isLocalMode() {
    return Boolean(localToggle?.checked)
  }

  function syncLocalMode() {
    const enabled = isLocalMode()
    if (localFields) {
      localFields.hidden = !enabled
    }
    if (imageInput) {
      imageInput.required = enabled
      imageInput.disabled = !enabled
    }
    setStatus(enabled ? 'CSV와 로컬 이미지 폴더를 함께 검증합니다.' : 'Supabase 저장소의 기존 이미지를 기준으로 검증합니다.')
  }

  function relativePathForFile(file) {
    return String(file.webkitRelativePath || file.name || '')
      .replace(/\\/g, '/')
      .replace(/^\/+/, '')
      .replace(/\/+$/, '')
  }

  function isImageFile(file) {
    return file.type.startsWith('image/') || /\.(avif|gif|jpe?g|png|svg|webp)$/i.test(file.name)
  }

  function webpPathForUpload(path) {
    if (window.ProjectCyanImageCompression?.webpPathFor) {
      return window.ProjectCyanImageCompression.webpPathFor(path)
    }
    return String(path || '').replace(/\.[^.\/\\]+$/, '.webp')
  }

  function selectedImageFiles() {
    const seenPaths = new Set()
    return Array.from(imageInput?.files || [])
      .filter(isImageFile)
      .map((file) => {
        const sourceRelativePath = relativePathForFile(file)
        return {
          file,
          sourceRelativePath,
          relativePath: webpPathForUpload(sourceRelativePath),
        }
      })
      .filter((item) => {
        const key = item.relativePath.toLowerCase()
        if (seenPaths.has(key)) {
          return false
        }
        seenPaths.add(key)
        return true
      })
  }

  async function submitLocalPreview(event) {
    event.preventDefault()
    const csvFile = csvInput?.files?.[0]
    const imageItems = selectedImageFiles()
    if (!csvFile) {
      csvInput?.focus()
      setStatus('CSV 파일을 선택해주세요.')
      return
    }
    if (imageItems.length === 0) {
      imageInput?.focus()
      setStatus('로컬 이미지 폴더를 선택해주세요.')
      return
    }
    if (!window.ProjectCyanImageCompression?.compressToWebp) {
      setStatus('WebP 압축 스크립트를 불러오지 못했습니다.')
      return
    }

    const formData = new FormData()
    formData.append('useLocalImages', 'true')
    formData.append('file', csvFile, csvFile.name)

    const originalButtonText = submitButton?.textContent || '미리보기'
    if (submitButton) {
      submitButton.disabled = true
    }

    try {
      for (let index = 0; index < imageItems.length; index += 1) {
        const item = imageItems[index]
        setStatus(`WebP 압축 중 ${index + 1}/${imageItems.length}: ${item.sourceRelativePath}`)
        const compressed = await window.ProjectCyanImageCompression.compressToWebp(item.file)
        formData.append('imageFiles', compressed.file, compressed.file.name)
        formData.append('imageRelativePath', item.relativePath)
      }

      setStatus('CSV와 이미지 폴더를 검증하고 있습니다.')
      const response = await fetch(form.action, {
        method: 'POST',
        body: formData,
        credentials: 'same-origin',
      })
      const html = await response.text()
      document.open()
      document.write(html)
      document.close()
    } catch (error) {
      setStatus(error.message || '미리보기 요청에 실패했습니다.')
      if (submitButton) {
        submitButton.disabled = false
        submitButton.textContent = originalButtonText
      }
    }
  }

  localToggle?.addEventListener('change', syncLocalMode)
  form.addEventListener('submit', (event) => {
    if (isLocalMode()) {
      submitLocalPreview(event)
    }
  })
  syncLocalMode()
})()
