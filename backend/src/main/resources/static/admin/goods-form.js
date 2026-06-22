function bindGoodsImageEditor(root) {
  const endpoint = root.dataset.uploadEndpoint
  const bucketName = root.dataset.uploadBucket
  const path = root.dataset.uploadPath
  const imageUrlInput = root.querySelector('[data-goods-image-url]')
  const uploadInput = root.querySelector('[data-goods-direct-file]')
  const uploadStatus = root.querySelector('[data-goods-upload-status]')
  const library = root.querySelector('[data-goods-image-library]')
  const quillContainer = root.querySelector('#goods-description-editor')
  const quillEditor = quillContainer?.querySelector('.ql-editor')

  if (!endpoint || !imageUrlInput) {
    return
  }

  function setStatus(message) {
    if (uploadStatus) {
      uploadStatus.textContent = message
    }
  }

  function formatFileSize(size) {
    if (!Number.isFinite(size)) {
      return ''
    }
    if (size < 1024 * 1024) {
      return `${Math.max(1, Math.round(size / 1024))} KB`
    }
    return `${(size / 1024 / 1024).toFixed(1)} MB`
  }

  function confirmSmallerOverwrite(fileName, payload) {
    const existingSize = formatFileSize(payload.existingSize)
    const incomingSize = formatFileSize(payload.incomingSize)
    return window.confirm(
      `${fileName}\n\n기존 파일보다 업로드할 파일의 byte 수가 작습니다.\n`
      + `기존 파일: ${existingSize || '알 수 없음'}\n`
      + `업로드 파일: ${incomingSize || '알 수 없음'}\n\n`
      + '기존 파일을 덮어쓸까요? 취소하면 업로드하지 않습니다.'
    )
  }

  function imageButtonFromEvent(event) {
    return event.target.closest('[data-image-url]')
  }

  function imageUrlFromTransfer(dataTransfer) {
    return dataTransfer.getData('application/x-project-cyan-image')
      || dataTransfer.getData('text/uri-list')
      || dataTransfer.getData('text/plain')
  }

  function hasImageTransfer(dataTransfer) {
    return Array.from(dataTransfer?.types || []).some((type) => (
      type === 'application/x-project-cyan-image'
      || type === 'text/uri-list'
      || type === 'text/plain'
    ))
  }

  function setImageUrl(url) {
    if (!url) {
      return
    }
    imageUrlInput.value = url
    imageUrlInput.dispatchEvent(new Event('input', { bubbles: true }))
    setStatus('대표 이미지 URL 선택 완료')
  }

  function insertDescriptionImage(url) {
    const quill = window.goodsDescriptionQuill
    if (!url) {
      return
    }
    if (!quill && quillContainer) {
      quillContainer.dispatchEvent(new CustomEvent('goods:image-insert', {
        detail: { url },
      }))
      setStatus('상세 설명에 이미지 삽입 완료')
      return
    }
    if (!quill) {
      return
    }
    const range = quill.getSelection(true)
    const index = range ? range.index : Math.max(0, quill.getLength() - 1)
    quill.insertEmbed(index, 'image', url, 'user')
    quill.insertText(index + 1, '\n', 'user')
    quill.setSelection(index + 2, 0, 'silent')
    setStatus('상세 설명에 이미지 삽입 완료')
  }

  library?.addEventListener('click', (event) => {
    const button = imageButtonFromEvent(event)
    if (button) {
      setImageUrl(button.dataset.imageUrl)
    }
  })

  library?.addEventListener('dragstart', (event) => {
    const button = imageButtonFromEvent(event)
    if (!button?.dataset.imageUrl) {
      return
    }
    event.dataTransfer.effectAllowed = 'copy'
    event.dataTransfer.setData('application/x-project-cyan-image', button.dataset.imageUrl)
    event.dataTransfer.setData('text/plain', button.dataset.imageUrl)
    event.dataTransfer.setData('text/uri-list', button.dataset.imageUrl)
  })

  quillEditor?.addEventListener('dragover', (event) => {
    if (!hasImageTransfer(event.dataTransfer)) {
      return
    }
    event.preventDefault()
    event.dataTransfer.dropEffect = 'copy'
    quillContainer.classList.add('is-image-dragover')
  })

  quillEditor?.addEventListener('dragleave', (event) => {
    if (!quillEditor.contains(event.relatedTarget)) {
      quillContainer.classList.remove('is-image-dragover')
    }
  })

  quillEditor?.addEventListener('drop', (event) => {
    const url = imageUrlFromTransfer(event.dataTransfer)
    if (!url) {
      return
    }
    event.preventDefault()
    quillContainer.classList.remove('is-image-dragover')
    insertDescriptionImage(url)
  })

  uploadInput?.addEventListener('change', async () => {
    const file = uploadInput.files?.[0]
    if (!file) {
      return
    }
    if (!file.type.startsWith('image/') && !/\.(avif|gif|jpe?g|png|svg|webp)$/i.test(file.name)) {
      setStatus('이미지 파일만 업로드할 수 있습니다.')
      uploadInput.value = ''
      return
    }

    const formData = new FormData()
    formData.append('bucketName', bucketName)
    formData.append('path', path)
    formData.append('upsert', 'true')
    formData.append('allowSmallerOverwrite', 'false')
    formData.append('relativePath', file.name)
    formData.append('file', file)

    setStatus('이미지 업로드 중')
    try {
      let response = await fetch(endpoint, {
        method: 'POST',
        body: formData,
      })
      let payload = await response.json().catch(() => ({}))

      if (response.status === 409 && payload.conflict && payload.conflictReason === 'SMALLER_THAN_EXISTING') {
        if (!confirmSmallerOverwrite(file.name, payload)) {
          setStatus('업로드를 건너뛰었습니다.')
          return
        }
        formData.set('allowSmallerOverwrite', 'true')
        response = await fetch(endpoint, {
          method: 'POST',
          body: formData,
        })
        payload = await response.json().catch(() => ({}))
      }

      if (!response.ok || payload.error) {
        throw new Error(payload.error || '업로드 실패')
      }
      setImageUrl(payload.publicUrl)
      window.addAdminImageTreeItem?.(library, payload, { draggable: true })
      setStatus('업로드 후 대표 이미지로 선택 완료')
    } catch (error) {
      setStatus(error.message || '업로드 실패')
    } finally {
      uploadInput.value = ''
    }
  })
}

document.querySelectorAll('[data-goods-editor]').forEach(bindGoodsImageEditor)
