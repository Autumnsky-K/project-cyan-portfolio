const pageRoot = document.querySelector('[data-cms-page]')
const previewFrame = document.querySelector('#cmsPreview')

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
        sortOrder: Number(value('sortOrder') || 999),
        artistId: value('artistId'),
        name: value('name'),
        groupName: value('groupName'),
        imageUrl: value('imageUrl'),
        lore: value('lore'),
        debutDate: value('debutDate'),
        collections: value('collections'),
      }
    })
    .filter((artist) => artist.visible)
    .sort((left, right) => left.sortOrder - right.sortOrder || left.name.localeCompare(right.name))
}

function buildArtistsPreview() {
  const primaryColor = fieldValue('primaryColor') || '#111111'
  const accentColor = fieldValue('accentColor') || '#2f6f64'
  const backgroundColor = fieldValue('backgroundColor') || '#ffffff'
  const heroImageUrl = fieldValue('heroImageUrl')
  const rows = artistRows()

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
            <div class="artist-grid">
              ${rows.map((artist) => `
                <article class="artist-card" data-artist-id="${escapeHtml(artist.artistId)}">
                  <div class="artist-image">${artist.imageUrl ? `<img src="${escapeHtml(artist.imageUrl)}" alt="">` : `<span>${escapeHtml(artist.name)}</span>`}</div>
                  <div class="artist-card-body">
                    <div class="artist-card-topline"><span>artistId ${escapeHtml(artist.artistId)}</span><strong>${escapeHtml(artist.debutDate || '-')}</strong></div>
                    <h3>${escapeHtml(artist.name)}</h3>
                    <p>${escapeHtml(artist.lore)}</p>
                    <div>${escapeHtml(artist.collections).split(',').filter(Boolean).map((collection) => `<span class="tag">${escapeHtml(collection.trim())}</span>`).join(' ')}</div>
                    <div class="artist-card-footer"><strong>${escapeHtml(artist.groupName || 'Artist')}</strong><button>View</button></div>
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

document.querySelectorAll('input').forEach((input) => {
  input.addEventListener('input', updatePreview)
  input.addEventListener('change', () => {
    if (input.type === 'file') {
      handleImageInput(input)
    }
    updatePreview()
  })
})

updatePreview()
