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
  const imageSlots = Array.from(root.querySelectorAll('[data-goods-image-slot]'))
  const extraImageInputs = Array.from(root.querySelectorAll('[data-goods-extra-image-url]'))
  const slotInputs = [imageUrlInput, ...extraImageInputs].filter(Boolean)
  let selectedSlotIndex = null

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

  function inputForSlot(index) {
    return slotInputs[index] || null
  }

  function slotValue(index) {
    return inputForSlot(index)?.value.trim() || ''
  }

  function renderSlot(slot) {
    const index = Number(slot.dataset.slotIndex)
    const preview = slot.querySelector('.admin-goods-slot-preview')
    const url = slotValue(index)
    if (!preview) {
      return
    }
    preview.replaceChildren()
    if (!url) {
      const emptyLabel = document.createElement('span')
      emptyLabel.textContent = '비어 있음'
      preview.append(emptyLabel)
      slot.classList.remove('has-image')
      slot.draggable = false
      return
    }

    const image = document.createElement('img')
    image.src = url
    image.alt = ''
    image.addEventListener('error', () => {
      preview.replaceChildren()
      const errorLabel = document.createElement('span')
      errorLabel.textContent = '이미지 오류'
      preview.append(errorLabel)
    }, { once: true })
    preview.append(image)
    slot.classList.add('has-image')
    slot.draggable = true
  }

  function renderSlots() {
    imageSlots.forEach(renderSlot)
  }

  function selectSlot(index) {
    selectedSlotIndex = index
    imageSlots.forEach((slot) => {
      slot.classList.toggle('is-selected', Number(slot.dataset.slotIndex) === index)
    })
  }

  function clearSlotSelection() {
    selectedSlotIndex = null
    imageSlots.forEach((slot) => slot.classList.remove('is-selected'))
  }

  function firstEmptySlotIndex() {
    const emptyIndex = slotInputs.findIndex((input) => !input.value.trim())
    return emptyIndex === -1 ? null : emptyIndex
  }

  function targetSlotIndex() {
    if (selectedSlotIndex !== null && inputForSlot(selectedSlotIndex)) {
      return selectedSlotIndex
    }
    return firstEmptySlotIndex()
  }

  function setSlotUrl(index, url, options = {}) {
    const input = inputForSlot(index)
    if (!input) {
      return false
    }
    input.value = url || ''
    input.dispatchEvent(new Event('input', { bubbles: true }))
    renderSlot(imageSlots[index])
    if (options.select) {
      selectSlot(index)
    }
    return true
  }

  function setImageUrl(url) {
    if (!url) {
      return
    }
    const index = targetSlotIndex()
    if (index === null) {
      setStatus('빈 이미지 슬롯이 없습니다.')
      return
    }
    setSlotUrl(index, url)
    setStatus(index === 0 ? '메인 이미지 선택 완료' : `추가 이미지 ${index} 선택 완료`)
  }

  function validateMainImage() {
    if (imageUrlInput.value.trim()) {
      return true
    }
    selectSlot(0)
    imageSlots[0]?.scrollIntoView({ block: 'center', behavior: 'smooth' })
    setStatus('메인 이미지를 선택해주세요.')
    window.alert('메인 이미지를 선택해주세요.')
    return false
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
    event.dataTransfer.setData('application/x-project-cyan-library-image', button.dataset.imageUrl)
    event.dataTransfer.setData('text/plain', button.dataset.imageUrl)
    event.dataTransfer.setData('text/uri-list', button.dataset.imageUrl)
  })

  imageSlots.forEach((slot) => {
    const index = Number(slot.dataset.slotIndex)

    slot.addEventListener('click', (event) => {
      if (event.target.closest('[data-goods-slot-clear]')) {
        setSlotUrl(index, '')
        setStatus(index === 0 ? 'Main image cleared.' : `Extra image ${index} cleared.`)
        return
      }
      selectSlot(index)
    })

    slot.addEventListener('focus', () => selectSlot(index))

    slot.addEventListener('dragstart', (event) => {
      const url = slotValue(index)
      if (!url) {
        event.preventDefault()
        return
      }
      event.dataTransfer.effectAllowed = 'move'
      event.dataTransfer.setData('application/x-project-cyan-image-slot', String(index))
      event.dataTransfer.setData('application/x-project-cyan-slot-image-url', url)
      event.dataTransfer.setData('text/plain', url)
      event.dataTransfer.setData('text/uri-list', url)
    })

    slot.addEventListener('dragover', (event) => {
      if (!hasImageTransfer(event.dataTransfer)) {
        return
      }
      event.preventDefault()
      event.dataTransfer.dropEffect = Array.from(event.dataTransfer.types).includes('application/x-project-cyan-image-slot')
        ? 'move'
        : 'copy'
      slot.classList.add('is-dragover')
    })

    slot.addEventListener('dragleave', (event) => {
      if (!slot.contains(event.relatedTarget)) {
        slot.classList.remove('is-dragover')
      }
    })

    slot.addEventListener('drop', (event) => {
      const url = imageUrlFromTransfer(event.dataTransfer)
      if (!url) {
        return
      }
      event.preventDefault()
      slot.classList.remove('is-dragover')
      const sourceIndexText = event.dataTransfer.getData('application/x-project-cyan-image-slot')
      const sourceIndex = sourceIndexText === '' ? null : Number(sourceIndexText)
      if (sourceIndex !== null && Number.isInteger(sourceIndex) && inputForSlot(sourceIndex) && sourceIndex !== index) {
        const sourceUrl = event.dataTransfer.getData('application/x-project-cyan-slot-image-url') || url
        const targetUrl = slotValue(index)
        setSlotUrl(index, sourceUrl, { select: true })
        setSlotUrl(sourceIndex, targetUrl)
        setStatus('Image slots swapped.')
        return
      }
      setSlotUrl(index, url, { select: true })
      setStatus(index === 0 ? 'Main image selected.' : `Extra image ${index} selected.`)
    })
  })

  renderSlots()

  document.addEventListener('pointerdown', (event) => {
    if (event.target.closest('[data-goods-image-slot]')) {
      return
    }
    clearSlotSelection()
  }, { capture: true })

  root.querySelector('form')?.addEventListener('submit', (event) => {
    if (!validateMainImage()) {
      event.preventDefault()
      event.stopImmediatePropagation()
    }
  }, { capture: true })

  quillEditor?.addEventListener('dragover', (event) => {
    if (!hasImageTransfer(event.dataTransfer)) {
      return
    }
    if (Array.from(event.dataTransfer.types).includes('application/x-project-cyan-image-slot')) {
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
    if (Array.from(event.dataTransfer.types).includes('application/x-project-cyan-image-slot')) {
      return
    }
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

function bindSubmitLock(form) {
  const submitButton = form.querySelector('[data-submit-lock-button]')
  const loadingLabel = form.dataset.submitLockLabel || '저장 중...'
  const originalLabel = submitButton?.textContent

  form.addEventListener('submit', (event) => {
    if (form.dataset.submitting === 'true') {
      event.preventDefault()
      return
    }
    if (typeof form.checkValidity === 'function' && !form.checkValidity()) {
      return
    }

    form.dataset.submitting = 'true'
    if (submitButton) {
      submitButton.disabled = true
      submitButton.textContent = loadingLabel
    }
  })

  window.addEventListener('pageshow', () => {
    form.dataset.submitting = 'false'
    if (submitButton) {
      submitButton.disabled = false
      submitButton.textContent = originalLabel
    }
  })
}

document.querySelectorAll('[data-goods-editor]').forEach(bindGoodsImageEditor)
document.querySelectorAll('[data-submit-lock]').forEach(bindSubmitLock)
