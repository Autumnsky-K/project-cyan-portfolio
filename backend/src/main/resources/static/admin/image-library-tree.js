function imageTreePath(button) {
  return button.dataset.imagePath || button.title || button.textContent.trim()
}

function createImageTreeNode(name, path = '') {
  return {
    folders: new Map(),
    images: [],
    indexedTotal: null,
    lastFileName: '',
    name,
    otherExtensionSummary: '',
    lastOtherFileName: '',
    path,
    total: 0,
  }
}

function folderForPath(rootNode, folderNames) {
  let current = rootNode
  folderNames.forEach((name) => {
    if (!current.folders.has(name)) {
      const path = current.path ? `${current.path}/${name}` : name
      current.folders.set(name, createImageTreeNode(name, path))
    }
    current = current.folders.get(name)
  })
  return current
}

function buildImageTree(source, rootLabel) {
  const rootNode = createImageTreeNode(rootLabel)
  const buttons = Array.from(source.querySelectorAll('[data-image-url]'))
  const folders = Array.from(source.querySelectorAll('[data-image-tree-folder-path]'))

  folders.forEach((folder) => {
    const parts = String(folder.dataset.imageTreeFolderPath || '').split('/').filter(Boolean)
    if (parts.length > 0) {
      const targetFolder = folderForPath(rootNode, parts)
      const indexedTotal = Number.parseInt(folder.dataset.imageTreeFolderCount || '', 10)
      if (Number.isFinite(indexedTotal)) {
        targetFolder.indexedTotal = Math.max(targetFolder.indexedTotal || 0, indexedTotal)
      }
      if (folder.dataset.imageTreeFolderLast) {
        targetFolder.lastFileName = folder.dataset.imageTreeFolderLast
      }
      if (folder.dataset.imageTreeOtherSummary) {
        targetFolder.otherExtensionSummary = folder.dataset.imageTreeOtherSummary
      }
      if (folder.dataset.imageTreeOtherLast) {
        targetFolder.lastOtherFileName = folder.dataset.imageTreeOtherLast
      }
    }
  })

  buttons.forEach((button) => {
    const path = imageTreePath(button)
    const parts = path.split('/').filter(Boolean)
    const fileName = parts.pop() || button.dataset.imageUrl
    const targetFolder = folderForPath(rootNode, parts)
    const normalizedButton = button.cloneNode(true)
    normalizedButton.dataset.imagePath = path
    normalizedButton.title = path
    const label = normalizedButton.querySelector('span')
    if (label) {
      label.textContent = fileName
    }
    targetFolder.images.push(normalizedButton)

    let current = rootNode
    current.total += 1
    parts.forEach((name) => {
      current = current.folders.get(name)
      current.total += 1
    })
  })

  return rootNode
}

function imageTreeDisplayCount(node) {
  return node.indexedTotal == null ? node.total : node.indexedTotal
}

function imageTreeCountLabel(node) {
  const imageCount = imageTreeDisplayCount(node)
  const parts = []
  if (imageCount > 0 || !node.otherExtensionSummary) {
    parts.push(node.lastFileName ? `이미지 ${imageCount}개 · ${node.lastFileName}` : `이미지 ${imageCount}개`)
  }
  if (node.otherExtensionSummary) {
    parts.push(node.lastOtherFileName ? `${node.otherExtensionSummary} · ${node.lastOtherFileName}` : node.otherExtensionSummary)
  }
  return parts.join(' / ')
}

function renderImageFolder(node, level) {
  const details = document.createElement('details')
  details.className = 'admin-image-tree-folder'
  details.dataset.level = String(level)
  details.dataset.treePath = node.path
  details.dataset.imageTreeLazyState = level === 0 ? 'root' : 'idle'
  if (level === 0) {
    details.open = true
  }

  const summary = document.createElement('summary')
  summary.className = 'admin-image-tree-summary'

  const name = document.createElement('span')
  name.className = 'admin-image-tree-name'
  name.textContent = node.name
  summary.append(name)

  const count = document.createElement('span')
  count.className = 'admin-image-tree-count'
  count.dataset.imageTreeCount = String(imageTreeDisplayCount(node))
  count.dataset.imageTreeLast = node.lastFileName || ''
  count.dataset.imageTreeOtherSummary = node.otherExtensionSummary || ''
  count.dataset.imageTreeOtherLast = node.lastOtherFileName || ''
  count.textContent = imageTreeCountLabel(node)
  if (node.lastFileName || node.lastOtherFileName) {
    count.title = [node.lastFileName, node.lastOtherFileName].filter(Boolean).join(' / ')
  }
  summary.append(count)
  details.append(summary)

  const children = document.createElement('div')
  children.className = 'admin-image-tree-children'

  Array.from(node.folders.values())
    .sort((left, right) => left.name.localeCompare(right.name))
    .forEach((folder) => children.append(renderImageFolder(folder, level + 1)))

  if (node.images.length > 0) {
    const grid = document.createElement('div')
    grid.className = 'admin-image-tree-grid'
    node.images
      .sort((left, right) => imageTreePath(left).localeCompare(imageTreePath(right)))
      .forEach((button) => grid.append(button))
    children.append(grid)
  }

  details.append(children)
  details.addEventListener('toggle', () => {
    if (details.open) {
      loadAdminImageTreeFolder(details.closest('[data-image-tree]'), details)
    }
  })
  return details
}

function renderAdminImageTree(tree) {
  const source = tree.querySelector('[data-image-tree-source]')
  const outlet = tree.querySelector('[data-image-tree-root]')
  if (!source || !outlet) {
    return
  }

  outlet.replaceChildren()
  const items = source.querySelectorAll('[data-image-url]')
  const folders = source.querySelectorAll('[data-image-tree-folder-path]')
  if (items.length === 0 && folders.length === 0) {
    const empty = document.createElement('div')
    empty.className = 'admin-storage-library-empty'
    empty.textContent = tree.dataset.emptyLabel || '이미지가 없습니다.'
    outlet.append(empty)
    return
  }

  const rootLabel = tree.dataset.rootLabel || '이미지'
  outlet.append(renderImageFolder(buildImageTree(source, rootLabel), 0))
}

function renderAdminImageTrees(root = document) {
  root.querySelectorAll('[data-image-tree]').forEach(renderAdminImageTree)
}

function imageTreeForControl(button, attributeName) {
  const selector = button.getAttribute(attributeName)
  if (selector) {
    return document.querySelector(selector)
  }
  return button.closest('[data-image-tree-controls]')?.querySelector('[data-image-tree]')
    || button.closest('section')?.querySelector('[data-image-tree]')
}

function setAdminImageTreeOpenState(tree, open) {
  tree?.querySelectorAll('.admin-image-tree-folder').forEach((folder) => {
    folder.open = open
    if (open) {
      loadAdminImageTreeFolder(tree, folder)
    }
  })
}

function bindAdminImageTreeControls(root = document) {
  root.querySelectorAll('[data-image-tree-expand]').forEach((button) => {
    button.addEventListener('click', () => {
      setAdminImageTreeOpenState(imageTreeForControl(button, 'data-image-tree-expand'), true)
    })
  })
  root.querySelectorAll('[data-image-tree-collapse]').forEach((button) => {
    button.addEventListener('click', () => {
      setAdminImageTreeOpenState(imageTreeForControl(button, 'data-image-tree-collapse'), false)
    })
  })
}

function addAdminImageTreeItem(tree, image, options = {}) {
  const source = tree?.querySelector('[data-image-tree-source]')
  if (!source || !image?.publicUrl) {
    return
  }

  if (tree.dataset.imageTreeLazyEndpoint) {
    addLazyImageTreeItem(tree, image, options)
    return
  }

  const path = image.path || image.name || image.publicUrl
  Array.from(source.querySelectorAll('[data-image-url]')).forEach((button) => {
    if (button.dataset.imagePath === path) {
      button.remove()
    }
  })

  const button = document.createElement('button')
  button.type = 'button'
  button.className = 'admin-image-library-item'
  button.dataset.imageUrl = image.publicUrl
  button.dataset.imagePath = path
  button.title = path
  if (options.draggable) {
    button.draggable = true
  }

  const thumbnail = document.createElement('img')
  thumbnail.src = image.publicUrl
  thumbnail.alt = ''
  button.append(thumbnail)

  const label = document.createElement('span')
  label.textContent = path.split('/').filter(Boolean).pop() || path
  button.append(label)

  source.prepend(button)
  renderAdminImageTree(tree)
}

function createAdminImageButton(image, options = {}) {
  const path = image.path || image.name || image.publicUrl
  const button = document.createElement('button')
  button.type = 'button'
  button.className = 'admin-image-library-item'
  button.dataset.imageUrl = image.publicUrl
  button.dataset.imagePath = path
  button.title = path
  if (options.draggable) {
    button.draggable = true
  }

  const thumbnail = document.createElement('img')
  thumbnail.src = image.publicUrl
  thumbnail.alt = ''
  button.append(thumbnail)

  const label = document.createElement('span')
  label.textContent = path.split('/').filter(Boolean).pop() || path
  button.append(label)
  return button
}

function lazyImageFullPath(image) {
  if (image.bucketName && image.path) {
    return `${image.bucketName}/${image.path}`
  }
  return image.path || image.name || image.publicUrl
}

function folderPathForImagePath(path) {
  const parts = String(path || '').split('/').filter(Boolean)
  parts.pop()
  return parts.join('/')
}

function treePathMatchesImage(folderPath, imagePath) {
  if (!folderPath) {
    return true
  }
  return imagePath === folderPath || imagePath.startsWith(`${folderPath}/`)
}

function imageTreeDatasetLabel(count) {
  const imageCount = Number.parseInt(count.dataset.imageTreeCount || '0', 10)
  const parts = []
  if ((Number.isFinite(imageCount) ? imageCount : 0) > 0 || !count.dataset.imageTreeOtherSummary) {
    parts.push(count.dataset.imageTreeLast
      ? `이미지 ${imageCount}개 · ${count.dataset.imageTreeLast}`
      : `이미지 ${imageCount}개`)
  }
  if (count.dataset.imageTreeOtherSummary) {
    parts.push(count.dataset.imageTreeOtherLast
      ? `${count.dataset.imageTreeOtherSummary} · ${count.dataset.imageTreeOtherLast}`
      : count.dataset.imageTreeOtherSummary)
  }
  return parts.join(' / ')
}

function updateFolderCountLabel(folder, increment, lastFileName) {
  const count = folder.querySelector(':scope > .admin-image-tree-summary .admin-image-tree-count')
  if (!count) {
    return
  }
  const currentCount = Number.parseInt(count.dataset.imageTreeCount || '0', 10)
  const nextCount = Math.max(0, (Number.isFinite(currentCount) ? currentCount : 0) + increment)
  count.dataset.imageTreeCount = String(nextCount)
  if (lastFileName) {
    count.dataset.imageTreeLast = lastFileName
    count.title = [count.dataset.imageTreeLast, count.dataset.imageTreeOtherLast].filter(Boolean).join(' / ')
  }
  count.textContent = imageTreeDatasetLabel(count)
}

function addLazyImageTreeItem(tree, image, options = {}) {
  const fullPath = lazyImageFullPath(image)
  const folderPath = folderPathForImagePath(fullPath)
  const fileName = fullPath.split('/').filter(Boolean).pop() || fullPath
  const countIncrement = Number.isFinite(options.countIncrement) ? options.countIncrement : 1

  tree.querySelectorAll('.admin-image-tree-folder').forEach((folder) => {
    if (treePathMatchesImage(folder.dataset.treePath || '', fullPath)) {
      updateFolderCountLabel(folder, countIncrement, fileName)
    }
  })

  const targetFolder = Array.from(tree.querySelectorAll('.admin-image-tree-folder'))
    .find((folder) => folder.dataset.treePath === folderPath)
  if (!targetFolder || targetFolder.dataset.imageTreeLazyState !== 'loaded') {
    return
  }

  const children = targetFolder.querySelector(':scope > .admin-image-tree-children')
  if (!children) {
    return
  }
  children.querySelector('.admin-storage-library-empty')?.remove()
  let grid = children.querySelector(':scope > .admin-image-tree-grid')
  if (!grid) {
    grid = document.createElement('div')
    grid.className = 'admin-image-tree-grid'
    children.append(grid)
  }
  const normalizedImage = {
    ...image,
    path: fullPath,
  }
  const existing = Array.from(grid.querySelectorAll('[data-image-path]'))
    .find((button) => button.dataset.imagePath === fullPath)
  existing?.remove()
  grid.prepend(createAdminImageButton(normalizedImage, options))
}

function lazyFolderRequest(tree, folder) {
  const endpoint = tree?.dataset.imageTreeLazyEndpoint
  const treePath = folder?.dataset.treePath || ''
  const parts = treePath.split('/').filter(Boolean)
  const bucketName = parts.shift()
  if (!endpoint || !bucketName) {
    return null
  }
  const url = new URL(endpoint, window.location.origin)
  url.searchParams.set('bucketName', bucketName)
  url.searchParams.set('path', parts.join('/'))
  return url
}

function renderLazyFolderImages(folder, images) {
  const children = folder.querySelector(':scope > .admin-image-tree-children')
  if (!children) {
    return
  }
  children.querySelector(':scope > .admin-image-tree-grid')?.remove()
  children.querySelector(':scope > .admin-storage-library-empty')?.remove()

  if (images.length === 0) {
    return
  }

  const grid = document.createElement('div')
  grid.className = 'admin-image-tree-grid'
  images
    .map((image) => ({
      ...image,
      path: lazyImageFullPath(image),
    }))
    .sort((left, right) => String(left.path).localeCompare(String(right.path)))
    .forEach((image) => grid.append(createAdminImageButton(image, { draggable: true })))
  children.append(grid)
}

async function loadAdminImageTreeFolder(tree, folder) {
  if (!tree?.dataset.imageTreeLazyEndpoint || !folder || folder.dataset.level === '0') {
    return
  }
  const requestUrl = lazyFolderRequest(tree, folder)
  if (!requestUrl || folder.dataset.imageTreeLazyState === 'loaded' || folder.dataset.imageTreeLazyState === 'loading') {
    return
  }

  folder.dataset.imageTreeLazyState = 'loading'
  try {
    const response = await fetch(requestUrl, { headers: { Accept: 'application/json' } })
    const payload = await response.json().catch(() => [])
    if (!response.ok) {
      const message = Array.isArray(payload) && payload[0]?.error ? payload[0].error : '이미지 목록을 불러오지 못했습니다.'
      throw new Error(message)
    }
    const images = Array.isArray(payload) ? payload.filter((image) => image && !image.error && image.publicUrl) : []
    renderLazyFolderImages(folder, images)
    folder.dataset.imageTreeLazyState = 'loaded'
  } catch (error) {
    const children = folder.querySelector(':scope > .admin-image-tree-children')
    children?.querySelector(':scope > .admin-storage-library-empty')?.remove()
    const errorNode = document.createElement('div')
    errorNode.className = 'admin-storage-library-empty'
    errorNode.textContent = error.message || '이미지 목록을 불러오지 못했습니다.'
    children?.append(errorNode)
    folder.dataset.imageTreeLazyState = 'idle'
  }
}

window.renderAdminImageTrees = renderAdminImageTrees
window.addAdminImageTreeItem = addAdminImageTreeItem
window.setAdminImageTreeOpenState = setAdminImageTreeOpenState

document.addEventListener('DOMContentLoaded', () => {
  renderAdminImageTrees()
  bindAdminImageTreeControls()
})
