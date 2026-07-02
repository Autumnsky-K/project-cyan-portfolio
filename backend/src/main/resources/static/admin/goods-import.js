(() => {
  const form = document.querySelector('[data-goods-import-form]')
  if (!form) {
    return
  }

  const csvFields = [
    { key: 'goodsId', label: '상품ID', index: 0 },
    { key: 'name', label: '상품명', index: 1 },
    { key: 'price', label: '가격', index: 2 },
    { key: 'artistName', label: '아티스트명', index: 3 },
    { key: 'categoryName', label: '카테고리명', index: 4 },
    { key: 'stockCount', label: '재고', index: 5 },
    { key: 'salesStatus', label: '판매상태', index: 6 },
    { key: 'imageFolder', label: '이미지폴더', index: 7 },
    { key: 'tagsText', label: '태그', index: 8 },
    { key: 'description', label: '상세설명', index: 9 },
    { key: 'bestSeller', label: '베스트', index: 10 },
    { key: 'aiPickDefault', label: 'AI추천', index: 11 },
  ]
  const csvHeader = csvFields.map((field) => field.label)

  const localToggle = form.querySelector('[data-import-local-toggle]')
  const localFields = form.querySelector('[data-import-local-fields]')
  const csvInput = form.querySelector('[data-import-csv]')
  const imageInput = form.querySelector('[data-import-images]')
  const imageSummary = form.querySelector('[data-import-image-summary]')
  const status = form.querySelector('[data-import-status]')
  const submitButton = form.querySelector('button[type="submit"]')
  const queuePanel = document.querySelector('[data-import-queue]')
  const queueTable = document.querySelector('[data-import-queue-table]')
  const queueBody = document.querySelector('[data-import-queue-body]')
  const queueTitle = document.querySelector('[data-import-queue-title]')
  const queueSummary = document.querySelector('[data-import-queue-summary]')
  const queueWarning = document.querySelector('[data-import-queue-warning]')
  const commitForm = document.querySelector('[data-import-commit-form]')
  const commitButton = document.querySelector('[data-import-commit-button]')
  const commitProgress = document.querySelector('[data-import-commit-progress]')

  let imageItems = []
  let folderEntries = []
  let queueRows = []
  let selectedCells = new Set()
  let dragAnchor = null
  let dragging = false

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
    if (submitButton) {
      submitButton.textContent = enabled ? '대기열 승인' : '미리보기'
    }
    if (!enabled) {
      hideQueue()
    } else {
      buildQueuePreview()
    }
    updateImageFolderSummary()
    setStatus(enabled ? 'CSV와 로컬 이미지 폴더를 먼저 대기열로 검토합니다.' : 'Supabase 저장소의 기존 이미지를 기준으로 검증합니다.')
  }

  function hideQueue() {
    if (queuePanel) {
      queuePanel.hidden = true
    }
    selectedCells = new Set()
    queueRows = []
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

  function stripCommonRoot(paths) {
    if (paths.length === 0) {
      return paths
    }
    const segments = paths.map((path) => path.split('/').filter(Boolean))
    if (segments.some((parts) => parts.length < 3)) {
      return paths
    }
    const root = segments[0][0]
    const sameRoot = segments.every((parts) => parts[0].toLowerCase() === root.toLowerCase())
    if (!sameRoot) {
      return paths
    }
    return segments.map((parts) => parts.slice(1).join('/'))
  }

  function selectedImageFiles() {
    const rawItems = Array.from(imageInput?.files || [])
      .filter(isImageFile)
      .map((file) => {
        const sourceRelativePath = relativePathForFile(file)
        return {
          file,
          sourceRelativePath,
          uploadPath: webpPathForUpload(sourceRelativePath),
        }
      })
    const strippedPaths = stripCommonRoot(rawItems.map((item) => item.uploadPath))
    const seenPaths = new Set()
    return rawItems
      .map((item, index) => ({
        file: item.file,
        sourceRelativePath: item.sourceRelativePath,
        relativePath: strippedPaths[index],
      }))
      .filter((item) => {
        const key = item.relativePath.toLowerCase()
        if (!item.relativePath || seenPaths.has(key)) {
          return false
        }
        seenPaths.add(key)
        return true
      })
  }

  function selectedRootNames() {
    const roots = new Set()
    Array.from(imageInput?.files || []).forEach((file) => {
      const path = relativePathForFile(file)
      const [root] = path.split('/').filter(Boolean)
      if (root && path.includes('/')) {
        roots.add(root)
      }
    })
    return Array.from(roots).sort((left, right) => left.localeCompare(right, undefined, { sensitivity: 'base' }))
  }

  function updateImageFolderSummary() {
    if (!imageSummary) {
      return
    }
    if (!isLocalMode()) {
      setImageSummaryLines(['로컬 이미지 모드 꺼짐'])
      return
    }
    const totalSelectedFiles = Array.from(imageInput?.files || []).length
    if (totalSelectedFiles === 0) {
      setImageSummaryLines(['선택된 폴더 없음'])
      return
    }
    const folders = folderEntries.length > 0 ? folderEntries : buildFolderEntries(selectedImageFiles())
    const totalImages = folders.reduce((sum, folder) => sum + folder.images.length, 0)
    const roots = selectedRootNames()
    const rootText = roots.length === 1 ? roots[0] : `선택 루트 ${roots.length}개`
    const baseText = `${rootText} · 하위 폴더 ${folders.length}개 · 이미지 ${totalImages}개`
    const folderLines = folders.map((folder) => `${folder.folder} · 이미지 ${folder.images.length}개`)
    setImageSummaryLines([baseText, ...folderLines], folders.map((folder) => `${folder.folder}: 이미지 ${folder.images.length}개`).join('\n'))
  }

  function setImageSummaryLines(lines, title = '') {
    imageSummary.replaceChildren()
    lines.forEach((line, index) => {
      const lineElement = document.createElement('span')
      lineElement.className = index === 0 ? 'admin-file-summary-line is-root' : 'admin-file-summary-line'
      lineElement.textContent = line
      imageSummary.append(lineElement)
    })
    if (title) {
      imageSummary.title = title
    } else {
      imageSummary.removeAttribute('title')
    }
  }

  function parentPath(path) {
    const normalized = String(path || '').replace(/\\/g, '/')
    const separatorIndex = normalized.lastIndexOf('/')
    return separatorIndex >= 0 ? normalized.slice(0, separatorIndex) : ''
  }

  function objectFileName(path) {
    const normalized = String(path || '').replace(/\\/g, '/')
    const separatorIndex = normalized.lastIndexOf('/')
    return separatorIndex >= 0 ? normalized.slice(separatorIndex + 1) : normalized
  }

  function baseName(path) {
    const fileName = objectFileName(path).toLowerCase()
    const dotIndex = fileName.lastIndexOf('.')
    return dotIndex >= 0 ? fileName.slice(0, dotIndex) : fileName
  }

  function numericBase(path) {
    const base = baseName(path)
    return /^\d+$/.test(base) ? Number.parseInt(base, 10) : Number.MAX_SAFE_INTEGER
  }

  function imageSortGroup(path) {
    const base = baseName(path)
    if (base === 'main') {
      return 0
    }
    return /^\d+$/.test(base) ? 1 : 2
  }

  function compareImagePaths(left, right) {
    const leftGroup = imageSortGroup(left)
    const rightGroup = imageSortGroup(right)
    if (leftGroup !== rightGroup) {
      return leftGroup - rightGroup
    }
    const leftNumber = numericBase(left)
    const rightNumber = numericBase(right)
    if (leftNumber !== rightNumber) {
      return leftNumber - rightNumber
    }
    return objectFileName(left).localeCompare(objectFileName(right), undefined, { sensitivity: 'base' })
  }

  function buildFolderEntries(items) {
    const folders = new Map()
    for (const item of items) {
      const folder = parentPath(item.relativePath)
      if (!folder) {
        continue
      }
      if (!folders.has(folder.toLowerCase())) {
        folders.set(folder.toLowerCase(), {
          folder,
          storagePath: `goods/${folder}`,
          images: [],
        })
      }
      folders.get(folder.toLowerCase()).images.push(item)
    }
    return Array.from(folders.values())
      .map((folder) => ({
        ...folder,
        images: folder.images.slice().sort((left, right) => compareImagePaths(left.relativePath, right.relativePath)),
      }))
      .sort((left, right) => left.folder.localeCompare(right.folder, undefined, { sensitivity: 'base' }))
  }

  function parseCsvText(text) {
    const rows = []
    let row = []
    let value = ''
    let quoted = false
    const normalizedText = String(text || '').replace(/^\uFEFF/, '')
    for (let index = 0; index < normalizedText.length; index += 1) {
      const character = normalizedText[index]
      if (character === '"') {
        if (quoted && normalizedText[index + 1] === '"') {
          value += '"'
          index += 1
        } else {
          quoted = !quoted
        }
      } else if (character === ',' && !quoted) {
        row.push(value.trim())
        value = ''
      } else if ((character === '\n' || character === '\r') && !quoted) {
        if (character === '\r' && normalizedText[index + 1] === '\n') {
          index += 1
        }
        row.push(value.trim())
        if (!row.every((cell) => cell === '')) {
          rows.push(row)
        }
        row = []
        value = ''
      } else {
        value += character
      }
    }
    row.push(value.trim())
    if (!row.every((cell) => cell === '')) {
      rows.push(row)
    }
    return rows
  }

  async function csvRowsFromFile(file) {
    if (!file) {
      return []
    }
    const rows = parseCsvText(await file.text())
    return rows
      .slice(1)
      .filter((row) => !String(row[0] || '').trim().startsWith('#'))
      .filter((row) => !row.every((value) => !String(value || '').trim()))
      .map((row) => normalizeCsvRow(row))
  }

  function normalizeCsvRow(row) {
    const values = Array.from({ length: csvFields.length }, (_, index) => String(row[index] || '').trim())
    values[6] = 'HIDDEN'
    return values
  }

  function normalizeFolder(value) {
    let folder = String(value || '').trim().replace(/\\/g, '/').replace(/^\/+/, '').replace(/\/+$/, '')
    if (folder.toLowerCase().startsWith('goods/')) {
      folder = folder.slice('goods/'.length)
    }
    return folder
  }

  function hasCsvContent(values) {
    return values.some((value, index) => index !== 7 && String(value || '').trim() !== '')
  }

  function initialQueueRows(csvRows, folders) {
    const usedFolderKeys = new Set()
    const rows = csvRows.map((values) => values.slice())
    const folderByKey = new Map(folders.map((folder) => [folder.folder.toLowerCase(), folder]))

    for (const values of rows) {
      const explicitFolder = normalizeFolder(values[7])
      if (explicitFolder) {
        values[7] = explicitFolder
        usedFolderKeys.add(explicitFolder.toLowerCase())
        continue
      }
      const nextFolder = folders.find((folder) => !usedFolderKeys.has(folder.folder.toLowerCase()))
      if (nextFolder) {
        values[7] = nextFolder.folder
        usedFolderKeys.add(nextFolder.folder.toLowerCase())
      }
    }

    for (const folder of folders) {
      if (usedFolderKeys.has(folder.folder.toLowerCase())) {
        continue
      }
      const values = Array.from({ length: csvFields.length }, () => '')
      values[6] = 'HIDDEN'
      values[7] = folder.folder
      rows.push(values)
    }

    return rows.map((values, index) => ({
      id: index,
      values,
      folder: null,
      status: 'pending',
      statusLabel: '',
      imageCount: 0,
      slotText: '',
      storagePath: '',
    }))
  }

  function refreshQueueRows() {
    const folderByKey = new Map(folderEntries.map((folder) => [folder.folder.toLowerCase(), folder]))
    const folderCounts = new Map()
    for (const row of queueRows) {
      const folder = normalizeFolder(row.values[7])
      if (!folder) {
        continue
      }
      const key = folder.toLowerCase()
      folderCounts.set(key, (folderCounts.get(key) || 0) + 1)
    }

    for (const row of queueRows) {
      const folderName = normalizeFolder(row.values[7])
      row.values[7] = folderName
      row.folder = folderName ? folderByKey.get(folderName.toLowerCase()) || null : null
      row.imageCount = row.folder ? row.folder.images.length : 0
      row.storagePath = row.folder ? row.folder.storagePath : ''
      row.slotText = row.folder ? slotSummary(row.folder.images.length) : '-'
      if (!folderName) {
        row.status = 'missing'
        row.statusLabel = '폴더 없음'
      } else if (!row.folder) {
        row.status = 'missing'
        row.statusLabel = '파일 없음'
      } else if ((folderCounts.get(folderName.toLowerCase()) || 0) > 1) {
        row.status = 'warning'
        row.statusLabel = '중복'
      } else if (!hasCsvContent(row.values)) {
        row.status = 'warning'
        row.statusLabel = 'CSV 없음'
      } else {
        row.status = 'ready'
        row.statusLabel = '일치'
      }
    }
  }

  function slotSummary(imageCount) {
    if (imageCount <= 0) {
      return '이미지 0장'
    }
    const extraCount = Math.min(Math.max(imageCount - 1, 0), 4)
    const detailCount = Math.max(imageCount - 5, 0)
    return `이미지 ${imageCount}장 · 메인 1 · 추가 ${extraCount} · 상세 ${detailCount}`
  }

  async function buildQueuePreview() {
    if (!isLocalMode()) {
      return
    }
    const csvFile = csvInput?.files?.[0]
    imageItems = selectedImageFiles()
    folderEntries = buildFolderEntries(imageItems)
    updateImageFolderSummary()
    if (!csvFile || imageItems.length === 0) {
      hideQueue()
      setStatus('CSV와 로컬 이미지 폴더를 선택하면 압축 전 대기열을 표시합니다.')
      return
    }
    const csvRows = await csvRowsFromFile(csvFile)
    queueRows = initialQueueRows(csvRows, folderEntries)
    selectedCells = new Set()
    renderQueue()
  }

  function renderQueue() {
    if (!queuePanel || !queueBody) {
      return
    }
    refreshQueueRows()
    queuePanel.hidden = false
    const readyCount = queueRows.filter((row) => row.status === 'ready').length
    const warningCount = queueRows.length - readyCount
    if (queueTitle) {
      queueTitle.textContent = `업로드 대기열 ${queueRows.length}행`
    }
    if (queueSummary) {
      queueSummary.textContent = `인식한 상품 폴더 ${folderEntries.length}개 · 이미지 ${imageItems.length}개 · 등록 가능 ${readyCount}개`
    }
    if (queueWarning) {
      queueWarning.textContent = warningCount > 0 ? `불일치 ${warningCount}개가 있습니다. 표에서 수정하거나 CSV/폴더를 다시 선택하세요.` : '모든 CSV 행과 이미지 폴더가 일치합니다.'
      queueWarning.className = warningCount > 0 ? 'is-warning' : 'is-ready'
    }
    queueBody.innerHTML = queueRows.map((row, rowIndex) => queueRowHtml(row, rowIndex)).join('')
    updateSelectedCellClasses()
  }

  function queueRowHtml(row, rowIndex) {
    return `
      <tr class="is-${row.status}">
        <td><span class="admin-import-status-pill">${escapeHtml(row.statusLabel)}</span></td>
        <td><code>${escapeHtml(row.storagePath || '-')}</code></td>
        <td><span>${escapeHtml(row.slotText)}</span></td>
        ${csvFields.map((field, colIndex) => editableCellHtml(row, rowIndex, field, colIndex)).join('')}
      </tr>
    `
  }

  function editableCellHtml(row, rowIndex, field, colIndex) {
    const value = row.values[field.index] || ''
    const inputClass = field.key === 'description' ? ' is-wide' : ''
    return `
      <td data-cell data-row="${rowIndex}" data-col="${colIndex}">
        <input class="admin-import-cell-input${inputClass}"
               data-import-cell-input
               data-row="${rowIndex}"
               data-col="${colIndex}"
               value="${escapeHtmlAttribute(value)}"
               aria-label="${escapeHtmlAttribute(field.label)}">
      </td>
    `
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;')
  }

  function escapeHtmlAttribute(value) {
    return escapeHtml(value)
  }

  function cellKey(row, col) {
    return `${row}:${col}`
  }

  function cellPositionFromElement(element) {
    const cell = element?.closest?.('[data-cell]')
    if (!cell) {
      return null
    }
    return {
      row: Number.parseInt(cell.dataset.row, 10),
      col: Number.parseInt(cell.dataset.col, 10),
    }
  }

  function selectCellRange(start, end) {
    if (!start || !end) {
      return
    }
    selectedCells = new Set()
    const rowStart = Math.min(start.row, end.row)
    const rowEnd = Math.max(start.row, end.row)
    const colStart = Math.min(start.col, end.col)
    const colEnd = Math.max(start.col, end.col)
    for (let row = rowStart; row <= rowEnd; row += 1) {
      for (let col = colStart; col <= colEnd; col += 1) {
        selectedCells.add(cellKey(row, col))
      }
    }
    updateSelectedCellClasses()
  }

  function updateSelectedCellClasses() {
    queueTable?.querySelectorAll('[data-cell]').forEach((cell) => {
      cell.classList.toggle('is-selected', selectedCells.has(cellKey(cell.dataset.row, cell.dataset.col)))
    })
  }

  function selectedRangeStart() {
    const positions = Array.from(selectedCells).map((key) => {
      const [row, col] = key.split(':').map((part) => Number.parseInt(part, 10))
      return { row, col }
    })
    if (positions.length === 0) {
      return { row: 0, col: 0 }
    }
    return {
      row: Math.min(...positions.map((position) => position.row)),
      col: Math.min(...positions.map((position) => position.col)),
    }
  }

  function parsePastedGrid(text) {
    const normalized = String(text || '').replace(/\r/g, '')
    return normalized
      .replace(/\n$/, '')
      .split('\n')
      .map((line) => line.split('\t'))
  }

  function applyPastedGrid(text) {
    const grid = parsePastedGrid(text)
    if (grid.length === 0) {
      return
    }
    const start = selectedRangeStart()
    if (grid.length === 1 && grid[0].length === 1 && selectedCells.size > 1) {
      for (const key of selectedCells) {
        const [rowIndex, colIndex] = key.split(':').map((part) => Number.parseInt(part, 10))
        const field = csvFields[colIndex]
        if (queueRows[rowIndex] && field) {
          queueRows[rowIndex].values[field.index] = grid[0][0].trim()
        }
      }
      renderQueue()
      return
    }
    for (let rowOffset = 0; rowOffset < grid.length; rowOffset += 1) {
      for (let colOffset = 0; colOffset < grid[rowOffset].length; colOffset += 1) {
        const rowIndex = start.row + rowOffset
        const colIndex = start.col + colOffset
        const field = csvFields[colIndex]
        if (queueRows[rowIndex] && field) {
          queueRows[rowIndex].values[field.index] = grid[rowOffset][colOffset].trim()
        }
      }
    }
    renderQueue()
  }

  function syncInputValue(input) {
    const rowIndex = Number.parseInt(input.dataset.row, 10)
    const colIndex = Number.parseInt(input.dataset.col, 10)
    const field = csvFields[colIndex]
    if (queueRows[rowIndex] && field) {
      queueRows[rowIndex].values[field.index] = input.value.trim()
    }
  }

  function syncVisibleInputs() {
    queueTable?.querySelectorAll('[data-import-cell-input]').forEach(syncInputValue)
  }

  function csvValue(value) {
    const normalized = String(value || '')
    if (/[",\n\r]/.test(normalized)) {
      return `"${normalized.replace(/"/g, '""')}"`
    }
    return normalized
  }

  function queueCsvBlob() {
    const rows = [csvHeader]
    for (const row of queueRows) {
      if (!hasCsvContent(row.values) && !normalizeFolder(row.values[7])) {
        continue
      }
      const values = row.values.slice()
      values[6] = 'HIDDEN'
      rows.push(csvFields.map((field) => values[field.index] || ''))
    }
    const csv = `\uFEFF${rows.map((row) => row.map(csvValue).join(',')).join('\n')}\n`
    return new Blob([csv], { type: 'text/csv;charset=utf-8' })
  }

  function hasQueueMismatch() {
    refreshQueueRows()
    return queueRows.some((row) => row.status !== 'ready')
  }

  async function submitLocalPreview(event) {
    event.preventDefault()
    const csvFile = csvInput?.files?.[0]
    imageItems = selectedImageFiles()
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
    if (!queueRows.length) {
      await buildQueuePreview()
    }
    syncVisibleInputs()
    if (hasQueueMismatch()) {
      renderQueue()
      setStatus('CSV와 로컬 이미지 폴더 불일치가 있어 업로드하지 않았습니다.')
      return
    }
    if (!window.ProjectCyanImageCompression?.compressToWebp) {
      setStatus('WebP 압축 스크립트를 불러오지 못했습니다.')
      return
    }

    const formData = new FormData()
    formData.append('useLocalImages', 'true')
    formData.append('file', queueCsvBlob(), 'goods-import-queue.csv')

    const originalButtonText = submitButton?.textContent || '대기열 승인'
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

      setStatus('CSV와 이미지 폴더를 서버에서 재검증하고 있습니다.')
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

  csvInput?.addEventListener('change', () => {
    buildQueuePreview()
  })
  imageInput?.addEventListener('change', () => {
    buildQueuePreview()
  })
  localToggle?.addEventListener('change', syncLocalMode)

  queueTable?.addEventListener('mousedown', (event) => {
    const position = cellPositionFromElement(event.target)
    if (!position) {
      return
    }
    dragging = true
    dragAnchor = position
    selectCellRange(position, position)
  })
  queueTable?.addEventListener('mouseover', (event) => {
    if (!dragging) {
      return
    }
    const position = cellPositionFromElement(event.target)
    if (position) {
      selectCellRange(dragAnchor, position)
    }
  })
  document.addEventListener('mouseup', () => {
    dragging = false
  })
  queueTable?.addEventListener('focusin', (event) => {
    const position = cellPositionFromElement(event.target)
    if (position) {
      selectCellRange(position, position)
    }
  })
  queueTable?.addEventListener('change', (event) => {
    if (event.target.matches('[data-import-cell-input]')) {
      syncInputValue(event.target)
      renderQueue()
    }
  })
  queueTable?.addEventListener('paste', (event) => {
    const text = event.clipboardData?.getData('text/plain') || ''
    if (!text) {
      return
    }
    if (text.includes('\t') || text.includes('\n') || selectedCells.size > 1) {
      event.preventDefault()
      if (event.target.matches('[data-import-cell-input]')) {
        syncInputValue(event.target)
      }
      applyPastedGrid(text)
    }
  })

  form.addEventListener('submit', (event) => {
    if (isLocalMode()) {
      submitLocalPreview(event)
    }
  })
  commitForm?.addEventListener('submit', () => {
    commitForm.setAttribute('aria-busy', 'true')
    if (commitButton) {
      commitButton.disabled = true
      commitButton.textContent = '등록 처리 중'
    }
    if (commitProgress) {
      commitProgress.hidden = false
    }
  })
  syncLocalMode()
})()
