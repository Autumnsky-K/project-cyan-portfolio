function formatUploadTime(milliseconds) {
  if (!Number.isFinite(milliseconds) || milliseconds <= 0) {
    return '예상 시간 계산 중'
  }
  if (milliseconds < 60000) {
    return '1분 미만 남음'
  }
  const minutes = Math.floor(milliseconds / 60000)
  const seconds = Math.round((milliseconds % 60000) / 1000)
  return seconds > 0 ? `${minutes}분 ${seconds}초 남음` : `${minutes}분 남음`
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

function objectUrlName(url) {
  try {
    const parsedUrl = new URL(url)
    return decodeURIComponent(parsedUrl.pathname.split('/').pop() || url)
  } catch (error) {
    return url
  }
}

function relativePathForFile(file) {
  const rawPath = file.webkitRelativePath || file.name
  return rawPath.replace(/^\/+/, '').replace(/\/+$/, '')
}

function webpPathForUpload(path) {
  if (window.ProjectCyanImageCompression?.webpPathFor) {
    return window.ProjectCyanImageCompression.webpPathFor(path)
  }
  return String(path || '').replace(/\.[^.\/\\]+$/, '.webp')
}

function isImageFile(file) {
  return file.type.startsWith('image/') || /\.(avif|gif|jpe?g|png|svg|webp)$/i.test(file.name)
}

function appendText(parent, className, text) {
  const node = document.createElement('span')
  node.className = className
  node.textContent = text
  parent.append(node)
  return node
}

function bindStorageUploadQueue(root) {
  const endpoint = root.dataset.uploadEndpoint
  const bucketInput = root.querySelector('[data-upload-bucket]')
  const pathInput = root.querySelector('[data-upload-path]')
  const fileInput = root.querySelector('[data-upload-files]')
  const startButton = root.querySelector('[data-upload-start]')
  const cancelButton = root.querySelector('[data-upload-cancel]')
  const queueList = root.querySelector('[data-upload-queue]')
  const statusTitle = root.querySelector('[data-upload-status-title]')
  const statusMeta = root.querySelector('[data-upload-status-meta]')
  const progressBar = root.querySelector('[data-upload-progress-bar]')
  const libraryGrid = document.querySelector('[data-storage-image-library]')
  const pathOptions = Array.from(pathInput.querySelectorAll('option[data-bucket]'))

  let queue = []
  let abortController = null
  let running = false
  let cancelled = false

  function updateStatus(title, meta, progress) {
    statusTitle.textContent = title
    statusMeta.textContent = meta
    progressBar.style.width = `${Math.max(0, Math.min(progress, 100))}%`
  }

  function selectedUploadPath() {
    if (pathInput.tagName === 'SELECT') {
      return pathInput.selectedOptions[0]?.dataset.path || ''
    }
    return pathInput.value
  }

  function openFilePicker() {
    if (running) {
      return
    }
    fileInput.value = ''
    fileInput.click()
  }

  function renderQueue() {
    queueList.replaceChildren()
    if (queue.length === 0) {
      const empty = document.createElement('li')
      empty.className = 'admin-upload-empty'
      empty.role = 'button'
      empty.tabIndex = 0
      empty.textContent = '업로드할 이미지 폴더를 선택하세요.'
      empty.addEventListener('click', openFilePicker)
      empty.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          openFilePicker()
        }
      })
      queueList.append(empty)
      return
    }

    queue.forEach((item) => {
      const row = document.createElement('li')
      row.dataset.uploadState = item.state
      appendText(row, 'admin-upload-file-name', item.relativePath)
      appendText(
        row,
        'admin-upload-file-size',
        item.compressedSize
          ? `${formatFileSize(item.compressedSize)} · ${window.ProjectCyanImageCompression?.savingsLabel?.(item.originalSize, item.compressedSize) || 'WebP 변환'}`
          : formatFileSize(item.file.size)
      )
      appendText(row, 'admin-upload-file-state', item.label)
      queueList.append(row)
    })
  }

  function selectedFiles() {
    const seenPaths = new Set()
    return Array.from(fileInput.files || [])
      .filter(isImageFile)
      .map((file) => {
        const sourceRelativePath = relativePathForFile(file)
        return {
          file,
          relativePath: webpPathForUpload(sourceRelativePath),
          sourceRelativePath,
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
      .map((item) => ({ ...item, state: 'queued', label: '대기' }))
  }

  function syncSelectedFiles() {
    if (running) {
      return
    }
    queue = selectedFiles()
    const queuedCount = queue.filter((item) => item.state === 'queued').length
    const hasUploadTarget = Boolean(bucketInput.value && selectedUploadPath())
    startButton.disabled = queuedCount === 0 || !hasUploadTarget
    updateStatus(
      queuedCount === 0 ? '대기 중' : `${queuedCount}개 항목 대기 중`,
      queuedCount === 0
        ? '대기열을 클릭하면 이미지 폴더를 선택합니다.'
        : (hasUploadTarget ? '선택한 Bucket/Path 아래에 WebP로 압축해 저장합니다.' : 'Bucket과 기존 Path를 먼저 선택하세요.'),
      0
    )
    renderQueue()
  }

  async function prepareWebpUpload(item) {
    if (item.uploadFile) {
      return
    }
    if (!window.ProjectCyanImageCompression?.compressToWebp) {
      throw new Error('WebP 압축 스크립트를 불러오지 못했습니다.')
    }
    item.state = 'compressing'
    item.label = 'WebP 압축 중'
    renderQueue()
    const compressed = await window.ProjectCyanImageCompression.compressToWebp(item.file)
    item.uploadFile = compressed.file
    item.originalSize = compressed.originalSize
    item.compressedSize = compressed.compressedSize
    item.label = window.ProjectCyanImageCompression.savingsLabel(compressed.originalSize, compressed.compressedSize)
    renderQueue()
  }

  function uploadFormData(item) {
    const formData = new FormData()
    formData.append('bucketName', bucketInput.value)
    formData.append('path', selectedUploadPath())
    formData.append('upsert', 'true')
    formData.append('allowSmallerOverwrite', item.allowSmallerOverwrite ? 'true' : 'false')
    formData.append('relativePath', item.relativePath)
    formData.append('file', item.uploadFile || item.file)
    return formData
  }

  function confirmSmallerOverwrite(item, payload) {
    const existingSize = formatFileSize(payload.existingSize)
    const incomingSize = formatFileSize(payload.incomingSize)
    return window.confirm(
      `${item.relativePath}\n\n기존 파일보다 업로드할 파일의 byte 수가 작습니다.\n`
      + `기존 파일: ${existingSize || '알 수 없음'}\n`
      + `업로드 파일: ${incomingSize || '알 수 없음'}\n\n`
      + '기존 파일을 덮어쓸까요? 취소하면 이 파일은 건너뜁니다.'
    )
  }

  async function uploadOne(item) {
    abortController = new AbortController()
    await prepareWebpUpload(item)
    let response = await fetch(endpoint, {
      method: 'POST',
      body: uploadFormData(item),
      signal: abortController.signal,
    })
    let payload = await response.json().catch(() => ({}))

    if (response.status === 409 && payload.conflict && payload.conflictReason === 'SMALLER_THAN_EXISTING') {
      if (!confirmSmallerOverwrite(item, payload)) {
        return { skipped: true }
      }
      item.allowSmallerOverwrite = true
      response = await fetch(endpoint, {
        method: 'POST',
        body: uploadFormData(item),
        signal: abortController.signal,
      })
      payload = await response.json().catch(() => ({}))
    }

    if (!response.ok || payload.error) {
      throw new Error(payload.error || '업로드 실패')
    }
    return payload
  }

  function addImageToLibrary(uploaded) {
    if (!libraryGrid || !uploaded.publicUrl) {
      return
    }
    const treeImage = {
      ...uploaded,
      path: uploaded.bucketName ? `${uploaded.bucketName}/${uploaded.path || uploaded.name}` : (uploaded.path || uploaded.name),
    }
    if (window.addAdminImageTreeItem) {
      window.addAdminImageTreeItem(libraryGrid, treeImage, { countIncrement: uploaded.created ? 1 : 0 })
      return
    }

    const source = libraryGrid.querySelector('[data-image-tree-source]') || libraryGrid
    const card = document.createElement('button')
    card.type = 'button'
    card.className = 'admin-image-library-item'
    card.dataset.imageUrl = uploaded.publicUrl
    card.dataset.imagePath = treeImage.path || objectUrlName(uploaded.publicUrl)
    card.title = card.dataset.imagePath

    const image = document.createElement('img')
    image.src = uploaded.publicUrl
    image.alt = ''
    card.append(image)

    appendText(card, '', card.dataset.imagePath)
    source.prepend(card)
  }

  async function runQueue() {
    if (running || queue.length === 0 || !bucketInput.value || !selectedUploadPath()) {
      updateStatus('업로드 위치 필요', 'Bucket과 기존 Path를 선택하세요.', 0)
      return
    }

    running = true
    cancelled = false
    startButton.disabled = true
    cancelButton.disabled = false

    let completed = 0
    let failed = 0
    let skipped = 0
    let elapsedTotal = 0
    const total = queue.length

    for (const item of queue) {
      if (cancelled) {
        item.state = 'cancelled'
        item.label = '취소됨'
        continue
      }

      item.state = 'uploading'
      item.label = '업로드 중'
      const finished = completed + skipped + failed
      const remaining = total - finished
      const averageMs = finished > 0 ? elapsedTotal / finished : 0
      updateStatus(`${remaining}개 항목 업로드 중`, formatUploadTime(averageMs * remaining), (finished / total) * 100)
      renderQueue()

      const startedAt = performance.now()
      try {
        const uploaded = await uploadOne(item)
        if (uploaded.skipped) {
          skipped += 1
          item.state = 'skipped'
          item.label = '건너뜀'
        } else {
          completed += 1
          item.state = 'done'
          const savingsLabel = window.ProjectCyanImageCompression?.savingsLabel?.(item.originalSize, item.compressedSize)
          item.label = uploaded.path && uploaded.path !== item.relativePath
            ? `완료: ${uploaded.name}${savingsLabel ? ` · ${savingsLabel}` : ''}`
            : `완료${savingsLabel ? ` · ${savingsLabel}` : ''}`
          addImageToLibrary(uploaded)
        }
      } catch (error) {
        if (cancelled || error.name === 'AbortError') {
          item.state = 'cancelled'
          item.label = '취소됨'
        } else {
          failed += 1
          item.state = 'failed'
          item.label = error.message
        }
      } finally {
        elapsedTotal += performance.now() - startedAt
      }

      const finishedAfterAttempt = completed + skipped + failed
      const remainingAfterAttempt = total - finishedAfterAttempt
      const averageMsAfterAttempt = finishedAfterAttempt > 0 ? elapsedTotal / finishedAfterAttempt : 0
      updateStatus(
        `완료 ${completed}개 / 건너뜀 ${skipped}개 / 실패 ${failed}개`,
        formatUploadTime(averageMsAfterAttempt * remainingAfterAttempt),
        (finishedAfterAttempt / total) * 100
      )
      renderQueue()
    }

    running = false
    abortController = null
    cancelButton.disabled = true
    startButton.disabled = queue.some((item) => item.state === 'queued')
    updateStatus(
      cancelled ? '업로드 취소됨' : `완료 ${completed}개 / 건너뜀 ${skipped}개 / 실패 ${failed}개`,
      cancelled ? '취소된 항목을 다시 시작하려면 폴더를 다시 선택하세요.' : '대기열 처리가 끝났습니다.',
      100
    )
  }

  function cancelQueue() {
    cancelled = true
    abortController?.abort()
    queue.forEach((item) => {
      if (item.state === 'queued') {
        item.state = 'cancelled'
        item.label = '취소됨'
      }
    })
    renderQueue()
  }

  function syncPathOptions() {
    if (pathInput.tagName !== 'SELECT') {
      return
    }
    const bucketName = bucketInput.value
    let selectedOptionStillValid = false
    pathOptions.forEach((option) => {
      const matches = option.dataset.bucket === bucketName
      option.hidden = !matches
      option.disabled = !matches
      if (matches && option.selected) {
        selectedOptionStillValid = true
      }
    })
    if (!selectedOptionStillValid) {
      pathInput.value = ''
    }
  }

  function selectUploadTarget(treePath) {
    const parts = String(treePath || '').split('/').filter(Boolean)
    const bucketName = parts.shift()
    if (!bucketName) {
      return
    }
    bucketInput.value = bucketName
    syncPathOptions()
    const path = parts.join('/')
    const optionValue = path ? `${bucketName}/${path}` : ''
    const option = pathOptions.find((item) => !item.disabled && item.value === optionValue)
    pathInput.value = option ? option.value : ''
    syncSelectedFiles()
    updateStatus(
      pathInput.value ? '업로드 위치 선택됨' : 'Path 선택 필요',
      pathInput.value ? `${bucketInput.value}/${selectedUploadPath()}` : '기존 Path를 선택하거나 Path 생성에서 먼저 추가하세요.',
      0
    )
  }

  libraryGrid?.addEventListener('click', (event) => {
    const summary = event.target.closest('.admin-image-tree-summary')
    const folder = summary?.closest('.admin-image-tree-folder')
    if (!folder) {
      return
    }
    selectUploadTarget(folder.dataset.treePath)
  })

  fileInput.addEventListener('change', syncSelectedFiles)
  bucketInput.addEventListener('change', () => {
    syncPathOptions()
    syncSelectedFiles()
  })
  pathInput.addEventListener('change', syncSelectedFiles)
  startButton.addEventListener('click', runQueue)
  cancelButton.addEventListener('click', cancelQueue)
  syncPathOptions()
  syncSelectedFiles()
}

document.querySelectorAll('[data-storage-upload]').forEach(bindStorageUploadQueue)
