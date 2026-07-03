const pageRoot = document.querySelector('[data-cms-page]')
const previewFrame = document.querySelector('#cmsPreview')
const artistRowsBody = document.querySelector('#artistRows')
const artistImageEditor = document.querySelector('[data-cms-artist-image-editor]')
const artistImageLibrary = document.querySelector('[data-cms-artist-image-library]')
const artistImageUploadInput = document.querySelector('[data-cms-artist-direct-file]')
const artistImageUploadStatus = document.querySelector('[data-cms-artist-upload-status]')
let activeArtistImageInput = null

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
}

function fieldValue(name) {
  const field = document.querySelector(`[data-preview-input="${name}"]`)
  return field?.value || field?.dataset.fallbackValue || ''
}

function updateOutputCells() {
  document.querySelectorAll('[data-preview-output]').forEach((cell) => {
    const key = cell.dataset.previewOutput
    const value = fieldValue(key)
    cell.textContent = value || '-'
  })

  document.querySelectorAll('#artistRows tr').forEach((row) => {
    const output = row.querySelector('[data-artist-output]')
    if (!output) {
      return
    }
    const name = row.querySelector('[data-artist-field="name"]')?.value ?? ''
    const collections = row.querySelector('[data-artist-field="collections"]')?.value ?? ''
    output.textContent = `${name || '-'} / ${collections || '-'}`
  })
}

function setArtistImageUploadStatus(message) {
  if (artistImageUploadStatus) {
    artistImageUploadStatus.textContent = message
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

function artistImageInputFromTarget(target) {
  if (target.matches?.('[data-artist-field="imageUrl"], [data-artist-field="groupHeroImageUrl"]')) {
    return target
  }
  return target.closest('td')?.querySelector('[data-artist-field="imageUrl"], [data-artist-field="groupHeroImageUrl"]')
    || target.closest('tr')?.querySelector('[data-artist-field="imageUrl"]')
    || null
}

function currentArtistImageTarget() {
  if (activeArtistImageInput && document.contains(activeArtistImageInput)) {
    return activeArtistImageInput
  }
  return null
}

function clearArtistImageDropHighlight() {
  document.querySelectorAll('td.is-image-dragover').forEach((cell) => {
    cell.classList.remove('is-image-dragover')
  })
}

function setArtistRowImageUrl(input, url) {
  if (!input || !url) {
    return
  }
  input.value = url
  activeArtistImageInput = input
  input.dispatchEvent(new Event('input', { bubbles: true }))
  updatePreview()
  setArtistImageUploadStatus('이미지 URL이 선택한 셀에 들어갔습니다.')
}

function commonPreviewStyle(primaryColor, accentColor, backgroundColor, heroImageUrl) {
  const headerBackground = heroImageUrl
    ? `linear-gradient(90deg, ${backgroundColor} 0%, rgba(255,255,255,.82) 50%, rgba(255,255,255,.2) 100%), url('${escapeHtml(heroImageUrl)}') center / cover`
    : backgroundColor

  return `
    body { margin: 0; font-family: Arial, "Noto Sans KR", sans-serif; color: #202124; background: ${backgroundColor}; }
    .store-header, .artist-header { display: flex; align-items: flex-end; justify-content: space-between; gap: 24px; padding: 32px; border-bottom: 1px solid #d8dadd; background: ${headerBackground}; }
    .eyebrow, .artist-eyebrow { margin: 0 0 8px; color: #666a70; font-size: 14px; text-transform: uppercase; }
    h1 { margin: 0; color: ${primaryColor}; font-size: 44px; line-height: 1; letter-spacing: 0; }
    nav { display: flex; flex-wrap: wrap; gap: 8px; }
    nav a, button { border: 1px solid #d8dadd; border-radius: 4px; background: #fff; color: #202124; font: inherit; text-decoration: none; }
    nav a { padding: 8px 12px; }
    nav a[aria-current='page'] { border-color: ${primaryColor}; background: ${primaryColor}; color: #fff; }
    h2, h3, strong { color: ${primaryColor}; letter-spacing: 0; }
    .tag { display: inline-flex; padding: 4px 7px; border: 1px solid #d8dadd; border-radius: 4px; color: #666a70; font-size: 12px; }
    .accent { color: ${accentColor}; }
  `
}

function buildHomePreview() {
  const primaryColor = fieldValue('primaryColor') || '#111111'
  const accentColor = fieldValue('accentColor') || '#2f6f64'
  const backgroundColor = fieldValue('backgroundColor') || '#ffffff'
  const heroImageUrl = fieldValue('heroImageUrl')

  return `
    <!doctype html>
    <html lang="ko">
    <head>
      <meta charset="utf-8">
      <style>
        ${commonPreviewStyle(primaryColor, accentColor, backgroundColor, heroImageUrl)}
        .store-toolbar { display: grid; grid-template-columns: 1fr 220px; gap: 16px; padding: 24px 32px; border-bottom: 1px solid #d8dadd; }
        .store-toolbar label { display: grid; gap: 8px; color: #666a70; font-size: 14px; }
        .store-toolbar input, .store-toolbar select { min-height: 44px; padding: 10px; border: 1px solid #d8dadd; border-radius: 4px; }
        .store-layout { display: grid; grid-template-columns: 220px 1fr; min-height: 520px; }
        .filter-panel { display: grid; align-content: start; gap: 18px; padding: 18px 16px; border-right: 1px solid #d8dadd; background: #fff; }
        .goods-content { padding: 24px 32px 40px; }
        .result-summary { display: flex; justify-content: space-between; gap: 12px; margin-bottom: 24px; }
        .result-summary p { margin: 6px 0 0; color: #666a70; }
        .goods-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 18px; }
        .goods-card { display: grid; overflow: hidden; border: 1px solid #d8dadd; border-radius: 6px; background: #fff; }
        .goods-image { display: grid; place-items: center; aspect-ratio: 4 / 3; border-bottom: 1px solid #d8dadd; background: linear-gradient(135deg, transparent 49%, #dedede 50%, transparent 51%), #f5f5f5; color: ${accentColor}; }
        .goods-card-body { display: grid; gap: 12px; padding: 16px; }
        .card-topline, .card-footer { display: flex; align-items: center; justify-content: space-between; gap: 12px; color: #666a70; font-size: 13px; }
        .card-footer button { min-height: 34px; padding: 6px 10px; }
      </style>
    </head>
    <body>
      <main class="goods-page">
        <header class="store-header">
          <div>
            <p class="eyebrow">${escapeHtml(fieldValue('eyebrow'))}</p>
            <h1>${escapeHtml(fieldValue('title'))}</h1>
          </div>
          <nav><a>Home</a><a>Artists</a><a aria-current="page">Goods</a><a>Cart</a></nav>
        </header>
        <section class="store-toolbar">
          <label><span>Search</span><input value="Search goods, artist, category" readonly></label>
          <label><span>Sort</span><select><option>Newest</option></select></label>
        </section>
        <section class="store-layout">
          <aside class="filter-panel">
            <strong>Filters</strong>
            <span class="tag">Category</span><span class="tag">Artist</span><span class="tag">Tag</span>
          </aside>
          <div class="goods-content">
            <div class="result-summary">
              <div>
                <h2>${escapeHtml(fieldValue('summaryTitle'))}</h2>
                <p>${escapeHtml(fieldValue('summaryBody'))}</p>
              </div>
              <button>Grid</button>
            </div>
            <div class="goods-grid">
              ${['Poster Set', 'Photo Card', 'Fan Kit'].map((name) => `
                <article class="goods-card">
                  <div class="goods-image">${escapeHtml(name)}</div>
                  <div class="goods-card-body">
                    <div class="card-topline"><span>SM Artist</span><strong>ON_SALE</strong></div>
                    <h3>${escapeHtml(name)}</h3>
                    <p>Goods</p>
                    <div><span class="tag">NEW</span> <span class="tag">PICK</span></div>
                    <div class="card-footer"><strong>KRW 35,000</strong><button>Add</button></div>
                  </div>
                </article>
              `).join('')}
            </div>
          </div>
        </section>
      </main>
    </body>
    </html>
  `
}

function artistRows() {
  return Array.from(document.querySelectorAll('#artistRows tr'))
    .map((row) => {
      const value = (field) => {
        const input = row.querySelector(`[data-artist-field="${field}"]`)
        return input?.value || input?.dataset.fallbackValue || ''
      }
      return {
        visible: row.querySelector('[data-artist-visible]')?.checked ?? false,
        groupVisible: row.querySelector('[data-artist-group-visible]')?.checked ?? true,
        groupSortOrder: Number(value('groupSortOrder') || 999),
        sortOrder: Number(value('sortOrder') || 999),
        artistId: value('artistId'),
        name: value('name'),
        groupKey: value('groupKey'),
        groupName: value('groupName'),
        groupHeroImageUrl: value('groupHeroImageUrl'),
        groupSummary: value('groupSummary'),
        imageUrl: value('imageUrl'),
        lore: value('lore'),
        debutDate: value('debutDate'),
        collections: value('collections'),
      }
    })
    .filter((artist) => artist.visible)
    .sort((left, right) => (
      left.groupSortOrder - right.groupSortOrder
      || left.sortOrder - right.sortOrder
      || left.name.localeCompare(right.name)
    ))
}

function safeGroupKey(artist, fallbackIndex) {
  return (artist.groupKey || artist.groupName || `group-${fallbackIndex + 1}`)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9가-힣ぁ-んァ-ン一-龥]+/g, '-')
    .replace(/^-+|-+$/g, '') || `group-${fallbackIndex + 1}`
}

function artistGroups() {
  const groups = new Map()
  artistRows().forEach((artist, index) => {
    if (!artist.groupVisible) {
      return
    }
    const groupKey = safeGroupKey(artist, index)
    if (!groups.has(groupKey)) {
      groups.set(groupKey, {
        groupKey,
        groupName: artist.groupName || groupKey,
        groupSortOrder: artist.groupSortOrder,
        groupHeroImageUrl: artist.groupHeroImageUrl || artist.imageUrl,
        groupSummary: artist.groupSummary || artist.lore,
        artists: [],
      })
    }
    groups.get(groupKey).artists.push(artist)
  })
  return Array.from(groups.values()).sort((left, right) => (
    left.groupSortOrder - right.groupSortOrder
    || left.groupName.localeCompare(right.groupName)
  ))
}

function buildArtistsPreview() {
  const primaryColor = fieldValue('primaryColor') || '#111111'
  const accentColor = fieldValue('accentColor') || '#2f6f64'
  const backgroundColor = fieldValue('backgroundColor') || '#ffffff'
  const heroImageUrl = fieldValue('heroImageUrl')
  const groups = artistGroups()

  return `
    <!doctype html>
    <html lang="ko">
    <head>
      <meta charset="utf-8">
      <style>
        ${commonPreviewStyle(primaryColor, accentColor, backgroundColor, heroImageUrl)}
        .artist-toolbar { display: grid; grid-template-columns: 1fr 220px; gap: 16px; padding: 24px 32px; border-bottom: 1px solid #d8dadd; }
        .artist-toolbar input, .artist-toolbar select { min-height: 44px; padding: 10px; border: 1px solid #d8dadd; border-radius: 4px; }
        .artist-layout { display: grid; grid-template-columns: 260px 1fr; min-height: 540px; }
        .artist-filter-panel { display: grid; align-content: start; gap: 18px; padding: 24px; border-right: 1px solid #d8dadd; background: #fff; }
        .artist-content { padding: 24px 32px 40px; }
        .artist-summary { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 24px; }
        .artist-summary p { margin: 6px 0 0; color: #666a70; }
        .artist-group-list { display: grid; gap: 22px; }
        .artist-group { display: grid; gap: 12px; }
        .artist-group-header { display: flex; align-items: end; justify-content: space-between; gap: 16px; }
        .artist-group-header p { margin: 6px 0 0; color: #666a70; }
        .artist-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 18px; }
        .artist-card { display: grid; overflow: hidden; border: 1px solid #d8dadd; border-radius: 6px; background: #fff; }
        .artist-image { display: grid; place-items: center; aspect-ratio: 16 / 7; border-bottom: 1px solid #d8dadd; background: linear-gradient(135deg, rgb(47 111 100 / 12%), transparent 55%), #f5f5f5; color: ${accentColor}; font-size: 22px; font-weight: 700; }
        .artist-image img { width: 100%; height: 100%; object-fit: cover; }
        .artist-card-body { display: grid; gap: 12px; padding: 16px; }
        .artist-card-topline, .artist-card-footer { display: flex; align-items: center; justify-content: space-between; gap: 12px; color: #666a70; font-size: 13px; }
        .artist-card p { margin: 0; color: #666a70; line-height: 1.5; }
      </style>
    </head>
    <body>
      <main class="artist-page">
        <header class="artist-header">
          <div>
            <p class="artist-eyebrow">${escapeHtml(fieldValue('eyebrow'))}</p>
            <h1>${escapeHtml(fieldValue('title'))}</h1>
          </div>
          <nav><a>Home</a><a aria-current="page">Artists</a><a>Goods</a><a>Cart</a></nav>
        </header>
        <section class="artist-toolbar">
          <input value="Search artist, lore, collection" readonly>
          <select><option>Name</option></select>
        </section>
        <section class="artist-layout">
          <aside class="artist-filter-panel"><strong>Filters</strong><span class="tag">Collection</span><span class="tag">Debut</span><span class="tag">Focus</span></aside>
          <div class="artist-content">
            <div class="artist-summary">
              <div>
                <h2>${escapeHtml(fieldValue('summaryTitle'))}</h2>
                <p>${escapeHtml(fieldValue('summaryBody'))}</p>
              </div>
            </div>
            <div class="artist-group-list">
              ${groups.map((group) => `
                <section class="artist-group" data-group-key="${escapeHtml(group.groupKey)}">
                  <div class="artist-group-header">
                    <div>
                      <h3>${escapeHtml(group.groupName)}</h3>
                      <p>${escapeHtml(group.groupSummary || `${group.artists.length} artists`)}</p>
                    </div>
                    <span class="tag">${group.artists.length} cards</span>
                  </div>
                  <div class="artist-grid">
                    ${group.artists.map((artist) => `
                      <article class="artist-card" data-artist-id="${escapeHtml(artist.artistId)}">
                        <div class="artist-image">${artist.imageUrl ? `<img src="${escapeHtml(artist.imageUrl)}" alt="">` : `<span>${escapeHtml(artist.name)}</span>`}</div>
                        <div class="artist-card-body">
                          <div class="artist-card-topline"><span>artistId ${escapeHtml(artist.artistId)}</span><strong>${escapeHtml(artist.debutDate || '-')}</strong></div>
                          <h3>${escapeHtml(artist.name)}</h3>
                          <p>${escapeHtml(artist.lore)}</p>
                          <div>${escapeHtml(artist.collections).split(',').filter(Boolean).map((collection) => `<span class="tag">${escapeHtml(collection.trim())}</span>`).join(' ')}</div>
                          <div class="artist-card-footer"><strong>${escapeHtml(group.groupName || 'Artist')}</strong><button>View</button></div>
                        </div>
                      </article>
                    `).join('')}
                  </div>
                </section>
              `).join('')}
            </div>
          </div>
        </section>
      </main>
    </body>
    </html>
  `
}

function updatePreview() {
  if (!previewFrame || !pageRoot) {
    return
  }
  updateOutputCells()
  previewFrame.srcdoc = pageRoot.dataset.cmsPage === 'artists' ? buildArtistsPreview() : buildHomePreview()
}

function cmsStoragePublicUrl(file) {
  const baseUrl = pageRoot?.dataset.cmsStoragePublicBaseUrl || ''
  if (!baseUrl || !file?.name) {
    return ''
  }
  const objectName = file.name.trim().replace(/\s+/g, '-')
  return baseUrl + encodeURIComponent(objectName)
}

function handleImageInput(input) {
  const targetName = input.dataset.imageTarget
  const rowImageTarget = input.closest('tr')?.querySelector('[data-artist-field="imageUrl"]')
  const target = targetName
    ? document.querySelector(`[data-preview-input="${targetName}"]`)
    : rowImageTarget
  const file = input.files?.[0]
  if (!target || !file) {
    return
  }
  const publicUrl = cmsStoragePublicUrl(file)
  if (!publicUrl) {
    return
  }
  target.value = publicUrl
  updatePreview()
}

function syncArtistVisibleInput(input) {
  const hiddenInput = input.closest('td')?.querySelector('[data-artist-visible-value], [data-artist-group-visible-value]')
  if (hiddenInput) {
    hiddenInput.value = input.checked ? 'true' : 'false'
  }
}

function bindCmsInputs(root = document) {
  root.querySelectorAll('input').forEach((input) => {
    if (input.dataset.cmsBound === 'true') {
      return
    }
    input.dataset.cmsBound = 'true'
    if (input.matches('[data-artist-visible]')) {
      syncArtistVisibleInput(input)
    }
    if (input.matches('[data-artist-group-visible]')) {
      syncArtistVisibleInput(input)
    }
    if (input.matches('[data-artist-field="imageUrl"], [data-artist-field="groupHeroImageUrl"]')) {
      input.addEventListener('focus', () => {
        activeArtistImageInput = input
        setArtistImageUploadStatus('이미지 저장소에서 이미지를 클릭하거나 이 셀로 드래그하세요.')
      })
      input.addEventListener('click', () => {
        activeArtistImageInput = input
      })
    }
    input.addEventListener('input', updatePreview)
    input.addEventListener('change', () => {
      if (input.matches('[data-artist-visible]')) {
        syncArtistVisibleInput(input)
      }
      if (input.matches('[data-artist-group-visible]')) {
        syncArtistVisibleInput(input)
      }
      if (input.type === 'file') {
        handleImageInput(input)
      }
      updatePreview()
    })
  })
}

function nextArtistSortOrder() {
  const orders = Array.from(document.querySelectorAll('[data-artist-field="sortOrder"]'))
    .map((input) => Number(input.value || input.dataset.fallbackValue || 0))
    .filter((value) => Number.isFinite(value))
  return Math.max(0, ...orders) + 1
}

function artistRowHtml(sortOrder) {
  return `
    <tr class="cms-artist-new-row">
      <td>
        <input type="hidden" name="visible" data-artist-visible-value value="true">
        <input type="checkbox" data-artist-visible checked>
      </td>
      <td>
        <input type="hidden" name="groupVisible" data-artist-group-visible-value value="true">
        <input type="checkbox" data-artist-group-visible checked>
      </td>
      <td><input type="number" name="groupSortOrder" data-artist-field="groupSortOrder" value="999" placeholder="999"></td>
      <td><input name="groupKey" data-artist-field="groupKey" value="" placeholder="예: cyan-origin-idol"></td>
      <td><input type="number" name="sortOrder" data-artist-field="sortOrder" value="${sortOrder}" placeholder="${sortOrder}"></td>
      <td><input name="artistId" data-artist-field="artistId" value="" readonly placeholder="자동"></td>
      <td><input name="name" data-artist-field="name" value="" placeholder="아티스트 이름"></td>
      <td><input name="groupName" data-artist-field="groupName" value="" placeholder="그룹 이름"></td>
      <td><input type="date" name="debutDate" data-artist-field="debutDate" value=""></td>
      <td><input name="imageUrl" data-artist-field="imageUrl" value="" placeholder="현재 이미지 없음"></td>
      <td><input name="groupHeroImageUrl" data-artist-field="groupHeroImageUrl" value="" placeholder="현재 대표 이미지 없음"></td>
      <td><input name="groupSummary" data-artist-field="groupSummary" value="" placeholder="그룹 설명"></td>
      <td><input name="lore" data-artist-field="lore" value="" placeholder="소개"></td>
      <td><input name="collections" data-artist-field="collections" value="" placeholder="컬렉션"></td>
    </tr>
  `
}

function bindArtistImageLibrary() {
  artistImageLibrary?.addEventListener('click', (event) => {
    const button = imageButtonFromEvent(event)
    if (!button?.dataset.imageUrl) {
      return
    }
    const target = currentArtistImageTarget()
    if (!target) {
      setArtistImageUploadStatus('먼저 표의 이미지 셀을 선택하세요.')
      return
    }
    setArtistRowImageUrl(target, button.dataset.imageUrl)
  })

  artistImageLibrary?.addEventListener('dragstart', (event) => {
    const button = imageButtonFromEvent(event)
    if (!button?.dataset.imageUrl) {
      return
    }
    event.dataTransfer.effectAllowed = 'copy'
    event.dataTransfer.setData('application/x-project-cyan-image', button.dataset.imageUrl)
    event.dataTransfer.setData('text/plain', button.dataset.imageUrl)
    event.dataTransfer.setData('text/uri-list', button.dataset.imageUrl)
  })

  artistRowsBody?.addEventListener('dragover', (event) => {
    if (!hasImageTransfer(event.dataTransfer)) {
      return
    }
    const input = artistImageInputFromTarget(event.target)
    if (!input) {
      return
    }
    event.preventDefault()
    event.dataTransfer.dropEffect = 'copy'
    clearArtistImageDropHighlight()
    input.closest('td')?.classList.add('is-image-dragover')
  })

  artistRowsBody?.addEventListener('dragleave', (event) => {
    if (!artistRowsBody.contains(event.relatedTarget)) {
      clearArtistImageDropHighlight()
    }
  })

  artistRowsBody?.addEventListener('drop', (event) => {
    const input = artistImageInputFromTarget(event.target)
    const url = imageUrlFromTransfer(event.dataTransfer)
    if (!input || !url) {
      return
    }
    event.preventDefault()
    clearArtistImageDropHighlight()
    setArtistRowImageUrl(input, url)
  })
}

function bindArtistImageUpload() {
  artistImageUploadInput?.addEventListener('change', async () => {
    const file = artistImageUploadInput.files?.[0]
    if (!file) {
      return
    }
    if (!file.type.startsWith('image/') && !/\.(avif|gif|jpe?g|png|svg|webp)$/i.test(file.name)) {
      setArtistImageUploadStatus('이미지 파일만 업로드할 수 있습니다.')
      artistImageUploadInput.value = ''
      return
    }

    const endpoint = artistImageEditor?.dataset.uploadEndpoint
    const bucketName = artistImageEditor?.dataset.uploadBucket
    const path = artistImageEditor?.dataset.uploadPath
    if (!endpoint || !bucketName) {
      setArtistImageUploadStatus('업로드 설정을 찾지 못했습니다.')
      artistImageUploadInput.value = ''
      return
    }

    const formData = new FormData()
    formData.append('bucketName', bucketName)
    formData.append('path', path || '')
    formData.append('upsert', 'true')
    formData.append('allowSmallerOverwrite', 'false')
    formData.append('relativePath', file.name)
    formData.append('file', file)

    setArtistImageUploadStatus('이미지 업로드 중')
    try {
      let response = await fetch(endpoint, {
        method: 'POST',
        body: formData,
      })
      let payload = await response.json().catch(() => ({}))

      if (response.status === 409 && payload.conflict && payload.conflictReason === 'SMALLER_THAN_EXISTING') {
        if (!confirmSmallerOverwrite(file.name, payload)) {
          setArtistImageUploadStatus('업로드를 건너뛰었습니다.')
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
      window.addAdminImageTreeItem?.(artistImageLibrary, payload, { draggable: true })
      if (currentArtistImageTarget()) {
        setArtistRowImageUrl(currentArtistImageTarget(), payload.publicUrl)
        setArtistImageUploadStatus('업로드 후 선택한 이미지 셀에 입력했습니다.')
      } else {
        setArtistImageUploadStatus('업로드 완료. 이미지 셀로 드래그하세요.')
      }
    } catch (error) {
      setArtistImageUploadStatus(error.message || '업로드 실패')
    } finally {
      artistImageUploadInput.value = ''
    }
  })
}

document.querySelector('[data-add-artist-row]')?.addEventListener('click', () => {
  const artistRowsBody = document.querySelector('#artistRows')
  if (!artistRowsBody) {
    return
  }
  artistRowsBody.insertAdjacentHTML('beforeend', artistRowHtml(nextArtistSortOrder()))
  const insertedRow = artistRowsBody.lastElementChild
  bindCmsInputs(insertedRow)
  insertedRow?.querySelector('[data-artist-field="name"]')?.focus()
  updatePreview()
})

bindCmsInputs()
bindArtistImageLibrary()
bindArtistImageUpload()
updatePreview()
