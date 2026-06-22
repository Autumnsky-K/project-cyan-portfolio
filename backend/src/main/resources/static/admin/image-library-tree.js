function imageTreePath(button) {
  return button.dataset.imagePath || button.title || button.textContent.trim()
}

function createImageTreeNode(name) {
  return {
    folders: new Map(),
    images: [],
    name,
    total: 0,
  }
}

function folderForPath(rootNode, folderNames) {
  let current = rootNode
  folderNames.forEach((name) => {
    if (!current.folders.has(name)) {
      current.folders.set(name, createImageTreeNode(name))
    }
    current = current.folders.get(name)
  })
  return current
}

function buildImageTree(source, rootLabel) {
  const rootNode = createImageTreeNode(rootLabel)
  const buttons = Array.from(source.querySelectorAll('[data-image-url]'))

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

function renderImageFolder(node, level) {
  const details = document.createElement('details')
  details.className = 'admin-image-tree-folder'
  details.dataset.level = String(level)
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
  count.textContent = `이미지 ${node.total}개`
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
  if (items.length === 0) {
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

function addAdminImageTreeItem(tree, image, options = {}) {
  const source = tree?.querySelector('[data-image-tree-source]')
  if (!source || !image?.publicUrl) {
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

window.renderAdminImageTrees = renderAdminImageTrees
window.addAdminImageTreeItem = addAdminImageTreeItem

document.addEventListener('DOMContentLoaded', () => renderAdminImageTrees())
