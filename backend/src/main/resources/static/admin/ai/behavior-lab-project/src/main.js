import litegraph from 'litegraph.js'
import 'litegraph.js/css/litegraph.css'
import './styles.css'

const { LiteGraph, LGraph, LGraphCanvas } = litegraph

const nodeTemplates = {
  combine: {
    path: 'cyan/combine',
    title: 'Combine',
    kind: 'Transform',
    color: '#06b6d4',
    bgcolor: 'rgba(34, 211, 238, 0.34)',
    glass: ['rgba(255,255,255,0.42)', 'rgba(103,232,249,0.3)', 'rgba(14,165,233,0.22)'],
    inputs: [
      { name: 'A', type: 'txt' },
      { name: 'B', type: 'txt' },
    ],
    outputs: [{ name: 'text', type: 'txt' }],
    defaults: { separator: '\n\n', inputCount: 2 },
  },
  split: {
    path: 'cyan/split',
    title: 'Split',
    kind: 'Transform',
    color: '#10b981',
    bgcolor: 'rgba(74, 222, 128, 0.34)',
    glass: ['rgba(255,255,255,0.44)', 'rgba(134,239,172,0.32)', 'rgba(16,185,129,0.22)'],
    inputs: [{ name: 'text', type: 'txt' }],
    outputs: [{ name: 'part 1', type: 'txt' }],
    defaults: { input: '', splitMode: 'blankline', delimiter: '', delimiterKeep: 'omit' },
  },
  function: {
    path: 'cyan/function',
    title: 'Function',
    kind: '.py',
    color: '#f59e0b',
    bgcolor: 'rgba(251, 191, 36, 0.36)',
    glass: ['rgba(255,255,255,0.42)', 'rgba(253,224,71,0.32)', 'rgba(251,146,60,0.24)'],
    inputs: [{ name: 'input', type: 'txt' }],
    outputs: [{ name: 'output', type: 'txt' }],
    defaults: {
      input: '',
      inputCount: 1,
      inputs: [''],
      inputNames: ['input 1'],
      pyPath: '',
      code: '',
    },
  },
  llm: {
    path: 'cyan/llm',
    title: 'LLM',
    kind: 'OAuth LLM',
    color: '#d946ef',
    bgcolor: 'rgba(244, 114, 182, 0.34)',
    glass: ['rgba(255,255,255,0.44)', 'rgba(244,114,182,0.32)', 'rgba(168,85,247,0.24)'],
    inputs: [{ name: 'prompt', type: 'txt' }],
    outputs: [{ name: 'reply', type: 'txt' }],
    defaults: { prompt: '' },
  },
}

const templateEntries = Object.entries(nodeTemplates)

const runtime = {
  selectedNodeId: null,
  runningNodeId: null,
  graphRunning: false,
  runSeq: 0,
  activeRunByNode: new Map(),
  outputs: new Map(),
  errors: new Map(),
  oauthStatus: null,
  oauthPollTimer: null,
}

document.querySelector('#app').innerHTML = `
  <main class="lab-shell">
    <header class="topbar">
      <div class="brand">
        <div class="brand-mark">AI</div>
        <div>
          <h1>AI Admin Graph Lab</h1>
          <span data-status>ready</span>
        </div>
      </div>
      <div class="top-actions">
        <button type="button" class="secondary node-add combine" data-add-node="combine">Combine</button>
        <button type="button" class="secondary node-add split" data-add-node="split">Split</button>
        <button type="button" class="secondary node-add function" data-add-node="function">Function</button>
        <button type="button" class="secondary node-add llm" data-add-node="llm">LLM</button>
        <button type="button" class="secondary" data-save-workflow>JSON 저장</button>
        <button type="button" class="secondary" data-load-workflow>JSON 불러오기</button>
        <input data-workflow-file type="file" accept="application/json,.json" hidden>
        <button type="button" data-run-graph>Run Graph</button>
        <label class="field oauth-key-field">
          <span>OAUTH_TOKEN_DIGIT_KEY</span>
          <input data-oauth-key autocomplete="off">
        </label>
        <button type="button" class="secondary" data-oauth-save-key>키 저장</button>
        <span class="pill oauth-pill" data-oauth-status>OAuth 확인 전</span>
        <button type="button" class="secondary" data-oauth-refresh>상태</button>
        <button type="button" class="secondary" data-oauth-clear>해제</button>
        <button type="button" data-oauth-login>OAuth 연결</button>
      </div>
    </header>

    <section class="workbench">
      <section class="canvas-card">
        <div class="canvas-chip"><b>Graph</b><span data-canvas-chip>0 nodes</span></div>
        <canvas class="graph-canvas" data-graph-canvas></canvas>
      </section>

      <aside class="inspector" data-inspector>
        <div class="inspector-header">
          <div>
            <h2 data-node-title>노드 선택</h2>
            <span class="hint" data-node-caption>캔버스에서 노드를 선택하세요.</span>
          </div>
          <button type="button" class="secondary" data-run-node>Run Node</button>
        </div>

        <div class="node-meta" data-node-meta></div>

        <div class="node-form">
          <label class="field">
            <span>name</span>
            <input data-node-name>
          </label>
          <label class="field">
            <span>type</span>
            <input data-node-type readonly>
          </label>
        </div>

        <div class="field-stack" data-field-stack></div>
      </aside>
    </section>
  </main>
`

const elements = {
  canvas: document.querySelector('[data-graph-canvas]'),
  chip: document.querySelector('[data-canvas-chip]'),
  status: document.querySelector('[data-status]'),
  fieldStack: document.querySelector('[data-field-stack]'),
  nodeTitle: document.querySelector('[data-node-title]'),
  nodeCaption: document.querySelector('[data-node-caption]'),
  nodeMeta: document.querySelector('[data-node-meta]'),
  nodeName: document.querySelector('[data-node-name]'),
  nodeType: document.querySelector('[data-node-type]'),
  runNode: document.querySelector('[data-run-node]'),
  runGraph: document.querySelector('[data-run-graph]'),
  saveWorkflow: document.querySelector('[data-save-workflow]'),
  loadWorkflow: document.querySelector('[data-load-workflow]'),
  workflowFile: document.querySelector('[data-workflow-file]'),
  oauthStatus: document.querySelector('[data-oauth-status]'),
  oauthRefresh: document.querySelector('[data-oauth-refresh]'),
  oauthClear: document.querySelector('[data-oauth-clear]'),
  oauthLogin: document.querySelector('[data-oauth-login]'),
  oauthKey: document.querySelector('[data-oauth-key]'),
  oauthSaveKey: document.querySelector('[data-oauth-save-key]'),
}

function setStatus(text) {
  elements.status.textContent = text
}

function makeNodeConfig(templateKey) {
  const template = nodeTemplates[templateKey]
  return {
    templateKey,
    title: template.title,
    ...template.defaults,
  }
}

function getTemplate(node) {
  return nodeTemplates[node?.properties?.config?.templateKey] || null
}

function getConfig(node) {
  if (!node.properties) node.properties = {}
  if (!node.properties.config) {
    const entry = templateEntries.find(([, template]) => template.path === node.type) || ['function', nodeTemplates.function]
    node.properties.config = makeNodeConfig(entry[0])
  }
  return node.properties.config
}

function normalizeDynamicNode(node) {
  const config = getConfig(node)
  if (config.templateKey === 'combine') {
    config.inputCount = clampCount(config.inputCount || 2, 2, 12)
    while ((node.inputs || []).length < config.inputCount) {
      node.addInput(String((node.inputs || []).length + 1), 'txt')
    }
    while ((node.inputs || []).length > config.inputCount) {
      node.removeInput((node.inputs || []).length - 1)
    }
    ;(node.inputs || []).forEach((input, index) => {
      input.name = String(index + 1)
      input.type = 'txt'
    })
  }

  if (config.templateKey === 'split') {
    const outputCount = getSplitOutputCount(node)
    while ((node.outputs || []).length < outputCount) {
      node.addOutput(`part ${(node.outputs || []).length + 1}`, 'txt')
    }
    while ((node.outputs || []).length > outputCount) {
      node.removeOutput((node.outputs || []).length - 1)
    }
    ;(node.outputs || []).forEach((output, index) => {
      output.name = `part ${index + 1}`
      output.type = 'txt'
    })
  }

  if (config.templateKey === 'function') {
    config.inputCount = clampCount(config.inputCount || 1, 1, 6)
    if (!Array.isArray(config.inputs)) config.inputs = [config.input || '']
    if (!Array.isArray(config.inputNames)) config.inputNames = []
    while (config.inputs.length < config.inputCount) config.inputs.push('')
    while (config.inputs.length > config.inputCount) config.inputs.pop()
    while (config.inputNames.length < config.inputCount) config.inputNames.push(`input ${config.inputNames.length + 1}`)
    while (config.inputNames.length > config.inputCount) config.inputNames.pop()
    while ((node.inputs || []).length < config.inputCount) {
      node.addInput(`input ${(node.inputs || []).length + 1}`, 'txt')
    }
    while ((node.inputs || []).length > config.inputCount) {
      node.removeInput((node.inputs || []).length - 1)
    }
    ;(node.inputs || []).forEach((input, index) => {
      input.name = config.inputNames[index] || `input ${index + 1}`
      input.type = 'txt'
    })
  }
}

function clampCount(value, min, max) {
  const number = Number.parseInt(value, 10)
  if (!Number.isFinite(number)) return min
  return Math.min(max, Math.max(min, number))
}

function nodeRuntime(node) {
  return {
    output: runtime.outputs.get(node.id) || null,
    error: runtime.errors.get(node.id) || null,
    running: runtime.runningNodeId === node.id,
    selected: runtime.selectedNodeId === node.id,
  }
}

function drawNodeState(node, ctx) {
  const state = nodeRuntime(node)
  ctx.save()

  if (state.running) {
    const time = performance.now() / 180
    ctx.strokeStyle = '#7dd3fc'
    ctx.lineWidth = 4
    ctx.beginPath()
    ctx.arc(node.size[0] - 22, 22, 8, time, time + Math.PI * 1.35)
    ctx.stroke()
  }

  if (state.error) {
    ctx.fillStyle = '#ef4444'
    ctx.fillRect(node.size[0] - 42, node.size[1] - 12, 30, 4)
  } else if (state.output) {
    ctx.fillStyle = '#86efac'
    ctx.fillRect(node.size[0] - 42, node.size[1] - 12, 30, 4)
  }

  ctx.restore()
}

function drawGlassBody(node, ctx) {
  const template = getTemplate(node)
  if (!template?.glass || node.flags.collapsed) return

  const width = node.size[0]
  const height = node.size[1]
  ctx.save()

  const glow = ctx.createLinearGradient(0, 0, width, height)
  glow.addColorStop(0, template.glass[0])
  glow.addColorStop(0.48, template.glass[1])
  glow.addColorStop(1, template.glass[2])
  ctx.fillStyle = glow
  ctx.globalCompositeOperation = 'screen'
  roundedRectPath(ctx, 0, 0, width, height, 12)
  ctx.fill()

  ctx.globalCompositeOperation = 'source-over'
  ctx.strokeStyle = 'rgba(255,255,255,0.36)'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(14, 8)
  ctx.lineTo(width - 18, height - 10)
  ctx.stroke()

  ctx.restore()
}

function roundedRectPath(ctx, x, y, width, height, radius) {
  ctx.beginPath()
  if (ctx.roundRect) {
    ctx.roundRect(x, y, width, height, radius)
    return
  }
  ctx.moveTo(x + radius, y)
  ctx.lineTo(x + width - radius, y)
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius)
  ctx.lineTo(x + width, y + height - radius)
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height)
  ctx.lineTo(x + radius, y + height)
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius)
  ctx.lineTo(x, y + radius)
  ctx.quadraticCurveTo(x, y, x + radius, y)
}

function registerNode(templateKey, template) {
  function CyanNode() {
    template.inputs.forEach((input) => this.addInput(input.name, input.type))
    template.outputs.forEach((output) => this.addOutput(output.name, output.type))
    this.properties = { config: makeNodeConfig(templateKey) }
    this.title = template.title
    this.color = template.color
    this.bgcolor = template.bgcolor
    this.boxcolor = template.color
    this.size = [240, 100]
  }

  CyanNode.title = template.title
  CyanNode.desc = template.kind

  CyanNode.prototype.onExecute = function onExecute() {
    const output = getNodeOutput(this)
    template.outputs.forEach((_, index) => {
      this.setOutputData(index, output?.values?.[index] ?? '')
    })
  }

  CyanNode.prototype.onDrawForeground = function onDrawForeground(ctx) {
    drawNodeState(this, ctx)
  }

  CyanNode.prototype.onDrawBackground = function onDrawBackground(ctx) {
    drawGlassBody(this, ctx)
  }

  CyanNode.prototype.onConnectionsChange = function onConnectionsChange() {
    updateCanvasChip()
    renderInspector()
    graphCanvas.setDirty(true, true)
  }

  LiteGraph.registerNodeType(template.path, CyanNode)
}

templateEntries.forEach(([key, template]) => registerNode(key, template))

LiteGraph.NODE_TITLE_COLOR = '#1f2a44'
LiteGraph.NODE_TEXT_COLOR = '#26364f'
LiteGraph.NODE_SELECTED_TITLE_COLOR = '#111827'
LiteGraph.NODE_BOX_OUTLINE_COLOR = '#38bdf8'
LiteGraph.LINK_COLOR = '#7dd3fc'

const graph = new LGraph()
const graphCanvas = new LGraphCanvas(elements.canvas, graph)
graphCanvas.background_image = null
graphCanvas.clear_background_color = 'rgba(255,255,255,0)'
graphCanvas.render_canvas_border = false
graphCanvas.allow_searchbox = false

function updateCanvasChip() {
  elements.chip.textContent = `${graph._nodes.length} nodes / ${Object.keys(graph.links || {}).length} links`
}

function resizeCanvas() {
  const rect = elements.canvas.parentElement.getBoundingClientRect()
  elements.canvas.width = Math.max(Math.floor(rect.width), 640)
  elements.canvas.height = Math.max(Math.floor(rect.height), 520)
  graphCanvas.resize()
  graphCanvas.setDirty(true, true)
}

function getSelectedNode() {
  if (graphCanvas.selected_node && graph._nodes.includes(graphCanvas.selected_node)) {
    return graphCanvas.selected_node
  }
  if (runtime.selectedNodeId != null) {
    return graph.getNodeById(runtime.selectedNodeId)
  }
  return null
}

function selectNode(node) {
  runtime.selectedNodeId = node?.id ?? null
  if (node) graphCanvas.selectNode(node)
  renderInspector()
  graphCanvas.setDirty(true, true)
}

graphCanvas.onNodeSelected = (node) => {
  runtime.selectedNodeId = node.id
  renderInspector()
  graphCanvas.setDirty(true, true)
}

graphCanvas.onNodeDeselected = (node) => {
  if (runtime.selectedNodeId === node.id) {
    runtime.selectedNodeId = null
    renderInspector()
    graphCanvas.setDirty(true, true)
  }
}

function addNode(templateKey, pos = null) {
  const template = nodeTemplates[templateKey]
  const node = LiteGraph.createNode(template.path)
  node.pos = pos || [80 + graph._nodes.length * 42, 80 + graph._nodes.length * 28]
  graph.add(node)
  normalizeDynamicNode(node)
  updateCanvasChip()
  selectNode(node)
  return node
}

function buildInitialGraph() {
  graph.clear()
  runtime.outputs.clear()
  runtime.errors.clear()
  runtime.activeRunByNode.clear()
  runtime.runningNodeId = null
  runtime.selectedNodeId = null
  graphCanvas.selectNode(null)
  graphCanvas.ds.offset = [30, 40]
  graphCanvas.ds.scale = 0.86
  graph.start()
  updateCanvasChip()
  renderInspector()
}

function outputText(output) {
  if (!output) return ''
  const values = output.values || []
  if (values.length > 1) {
    return values.map((value, index) => `[${index + 1}]\n${stringifyOutputValue(value)}`).join('\n\n')
  }
  return stringifyOutputValue(values[0])
}

function stringifyOutputValue(value) {
  return typeof value === 'string' ? value : JSON.stringify(value ?? '', null, 2)
}

function autoSizeTextarea(textarea) {
  textarea.style.height = 'auto'
  textarea.style.height = `${textarea.scrollHeight}px`
}

function autoSizeInspectorTextareas() {
  window.requestAnimationFrame(() => {
    elements.fieldStack.querySelectorAll('textarea').forEach(autoSizeTextarea)
  })
}

function getNodeOutput(node) {
  const runtimeOutput = runtime.outputs.get(node.id)
  if (runtimeOutput) return runtimeOutput

  const config = getConfig(node)
  if (config.templateKey === 'combine') {
    return { values: [composeCombineNode(node)], virtual: true }
  }

  if (config.templateKey === 'split') {
    return { values: composeSplitNode(node), virtual: true }
  }

  if (config.templateKey === 'function' && !String(config.pyPath || '').trim()) {
    return { values: [String(readNodeInput(node, 0, config.inputs?.[0] ?? config.input ?? ''))], virtual: true }
  }

  return null
}

function getInputLink(node, inputIndex) {
  const input = node.inputs?.[inputIndex]
  if (!input || input.link == null) return null
  const link = graph.links[input.link]
  if (!link) return null
  const upstream = graph.getNodeById(link.origin_id)
  if (!upstream) return null
  return { input, link, upstream }
}

function hasConnectedInput(node, inputIndex) {
  return Boolean(getInputLink(node, inputIndex))
}

function readConnectedInput(node, inputIndex) {
  const linked = getInputLink(node, inputIndex)
  if (!linked) return null
  const output = getNodeOutput(linked.upstream)
  const value = output?.values?.[linked.link.origin_slot] ?? ''
  return {
    value,
    label: `${getConfig(linked.upstream).title}.${linked.upstream.outputs?.[linked.link.origin_slot]?.name || 'output'}`,
  }
}

function readNodeInput(node, inputIndex, fallback = '') {
  const connected = readConnectedInput(node, inputIndex)
  if (connected) return connected.value
  return fallback
}

function composeCombineNode(node) {
  const config = getConfig(node)
  const separator = config.separator ?? '\n\n'
  return Array.from({ length: config.inputCount || 2 }, (_, index) => String(readNodeInput(node, index, '')))
    .filter(Boolean)
    .join(separator)
}

function composeSplitNode(node) {
  return getSplitParts(node)
}

function getSplitOutputCount(node) {
  return Math.max(1, getSplitParts(node).length)
}

function getSplitParts(node) {
  const config = getConfig(node)
  const text = String(readNodeInput(node, 0, config.input || ''))
  return splitText(text, config)
}

function splitText(text, config) {
  if (!text) return []
  if (config.splitMode === 'custom') {
    const delimiter = String(config.delimiter || '')
    return delimiter ? splitByDelimiter(text, delimiter, config.delimiterKeep || 'omit') : [text]
  }
  return text.split(/\r?\n\r?\n/)
}

function splitByDelimiter(text, delimiter, keepMode) {
  const parts = text.split(delimiter)
  if (keepMode === 'previous') {
    return parts.map((part, index) => (index < parts.length - 1 ? `${part}${delimiter}` : part))
  }
  if (keepMode === 'next') {
    return parts.map((part, index) => (index > 0 ? `${delimiter}${part}` : part))
  }
  return parts
}

function renderConnectedPreview(node, inputIndex) {
  const connected = readConnectedInput(node, inputIndex)
  if (!connected) return ''
  const value = String(connected.value ?? '')
  return `
    <div class="connected-preview" title="${escapeHtml(value)}">
      ${escapeHtml(compact(value))}
    </div>
  `
}

function renderInspector() {
  const node = getSelectedNode()
  const disabled = !node
  elements.nodeName.disabled = disabled || runtime.graphRunning
  elements.runNode.disabled = disabled || runtime.graphRunning
  elements.runGraph.disabled = runtime.graphRunning

  if (!node) {
    elements.nodeTitle.textContent = '노드 선택'
    elements.nodeCaption.textContent = '캔버스에서 노드를 선택하세요.'
    elements.nodeName.value = ''
    elements.nodeType.value = ''
    elements.nodeMeta.innerHTML = ''
    elements.fieldStack.innerHTML = ''
    return
  }

  const template = getTemplate(node)
  const config = getConfig(node)
  normalizeDynamicNode(node)
  const out = getNodeOutput(node)
  const error = runtime.errors.get(node.id)

  elements.nodeTitle.textContent = config.title
  elements.nodeCaption.textContent = `${template.kind} · #${node.id}`
  elements.nodeName.value = config.title
  elements.nodeType.value = template.title
  elements.nodeMeta.innerHTML = [
    ...(node.inputs || []).map((input) => `<span class="pill">IN ${escapeHtml(input.name)}</span>`),
    ...(node.outputs || []).map((output) => `<span class="pill">OUT ${escapeHtml(output.name)}</span>`),
  ].join('')

  if (config.templateKey === 'combine') {
    elements.fieldStack.innerHTML = `
      <div class="count-row">
        <span>${config.inputCount} inputs</span>
        <div>
          <button type="button" class="secondary compact" data-combine-count="-1">-</button>
          <button type="button" class="secondary compact" data-combine-count="1">+</button>
        </div>
      </div>
      ${Array.from({ length: config.inputCount }, (_, index) => `
        <label class="field">
          <span>input ${index + 1}</span>
          ${renderConnectedPreview(node, index)}
        </label>
      `).join('')}
      <label class="field">
        <span>separator</span>
        <div class="segmented" data-separator-control>
          <button type="button" class="secondary compact" data-separator-lines="0">0줄</button>
          <button type="button" class="secondary compact" data-separator-lines="1">1줄</button>
          <button type="button" class="secondary compact" data-separator-lines="2">2줄</button>
        </div>
      </label>
      ${renderOutputField(out, error)}
    `
    bindCombineCountButtons(node)
    bindSeparatorButtons(node)
  }

  if (config.templateKey === 'split') {
    const connected = hasConnectedInput(node, 0)
    elements.fieldStack.innerHTML = `
      ${connected ? `
        <label class="field">
          <span>connected input</span>
          ${renderConnectedPreview(node, 0)}
        </label>
      ` : `
        <label class="field">
          <span>input text</span>
          <textarea class="code" data-config-field="input" rows="1" wrap="soft" spellcheck="false"></textarea>
        </label>
      `}
      <label class="field">
        <span>split by</span>
        <div class="segmented" data-split-mode-control>
          <button type="button" class="secondary compact" data-split-mode="blankline">빈 줄</button>
          <button type="button" class="secondary compact" data-split-mode="custom">문자열</button>
        </div>
      </label>
      ${config.splitMode === 'custom' ? `
        <label class="field">
          <span>key string</span>
          <input data-config-field="delimiter">
        </label>
        <label class="field">
          <span>include key</span>
          <div class="segmented" data-split-keep-control>
            <button type="button" class="secondary compact" data-split-keep="omit">미포함</button>
            <button type="button" class="secondary compact" data-split-keep="previous">포함(이전)</button>
            <button type="button" class="secondary compact" data-split-keep="next">포함(이후)</button>
          </div>
        </label>
      ` : ''}
      ${renderOutputField(out, error)}
    `
    if (!connected) {
      elements.fieldStack.querySelector('[data-config-field="input"]').value = config.input || ''
    }
    if (config.splitMode === 'custom') {
      elements.fieldStack.querySelector('[data-config-field="delimiter"]').value = config.delimiter || ''
      bindSplitKeepButtons(node)
    }
    bindSplitModeButtons(node)
  }

  if (config.templateKey === 'function') {
    normalizeDynamicNode(node)
    const inputControls = Array.from({ length: config.inputCount || 1 }, (_, index) => {
      const connected = hasConnectedInput(node, index)
      const inputName = config.inputNames?.[index] || `input ${index + 1}`
      return connected ? `
        <label class="field">
          <span>${escapeHtml(inputName)}</span>
          ${renderConnectedPreview(node, index)}
        </label>
      ` : `
        <label class="field">
          <span>${escapeHtml(inputName)}</span>
          <textarea class="code" data-function-input-index="${index}" rows="1" wrap="soft" spellcheck="false"></textarea>
        </label>
      `
    }).join('')
    elements.fieldStack.innerHTML = `
      <div class="count-row">
        <button type="button" class="secondary" data-function-count="-1">-</button>
        <strong>${config.inputCount || 1}</strong>
        <button type="button" class="secondary" data-function-count="1">+</button>
      </div>
      ${inputControls}
      <label class="field">
        <span>.py file path</span>
        <div class="path-picker">
          <input data-config-field="pyPath" data-py-path-input readonly>
          <button type="button" class="secondary compact" data-py-file-button>파일 선택</button>
          <input type="file" accept=".py,text/x-python,text/plain" data-py-file-input hidden>
        </div>
      </label>
      <label class="field">
        <span>code</span>
        <textarea class="code" data-config-field="code" rows="1" wrap="soft" spellcheck="false"></textarea>
      </label>
      ${renderOutputField(out, error)}
    `
    elements.fieldStack.querySelectorAll('[data-function-input-index]').forEach((field) => {
      field.value = config.inputs?.[Number.parseInt(field.dataset.functionInputIndex, 10)] || ''
    })
    elements.fieldStack.querySelector('[data-config-field="pyPath"]').value = config.pyPath || ''
    elements.fieldStack.querySelector('[data-config-field="code"]').value = config.code || ''
    bindFunctionCountButtons(node)
    bindFunctionFilePicker(node)
  }

  if (config.templateKey === 'llm') {
    const connected = hasConnectedInput(node, 0)
    elements.fieldStack.innerHTML = `
      ${connected ? `
        <label class="field">
          <span>connected prompt</span>
          ${renderConnectedPreview(node, 0)}
        </label>
      ` : ''}
      ${connected ? '' : `
        <label class="field">
          <span>prompt</span>
          <textarea class="code" data-config-field="prompt" rows="1" wrap="soft" spellcheck="false"></textarea>
        </label>
      `}
      ${renderOutputField(out, error)}
    `
    if (!connected) {
      elements.fieldStack.querySelector('[data-config-field="prompt"]').value = config.prompt || ''
    }
  }

  bindInspectorFields(node)
  autoSizeInspectorTextareas()
}

function renderOutputField(out, error) {
  const value = error || outputText(out)
  return `
    <label class="field">
      <span>${error ? 'error' : 'output'}</span>
      <textarea class="code" data-output-field rows="1" wrap="soft" spellcheck="false" readonly>${escapeHtml(value)}</textarea>
    </label>
  `
}

function bindInspectorFields(node) {
  elements.fieldStack.querySelectorAll('[data-function-input-index]').forEach((field) => {
    field.addEventListener('input', () => {
      const config = getConfig(node)
      if (!Array.isArray(config.inputs)) config.inputs = [config.input || '']
      config.inputs[Number.parseInt(field.dataset.functionInputIndex, 10)] = field.value
      config.input = config.inputs[0] || ''
      runtime.outputs.delete(node.id)
      runtime.errors.delete(node.id)
      syncVisibleOutput(node)
      if (field instanceof HTMLTextAreaElement) autoSizeTextarea(field)
      graphCanvas.setDirty(true, true)
    })
  })

  elements.fieldStack.querySelectorAll('[data-config-field]').forEach((field) => {
    field.addEventListener('input', () => {
      const config = getConfig(node)
      config[field.dataset.configField] = field.value
      runtime.outputs.delete(node.id)
      runtime.errors.delete(node.id)
      setStatus(`${config.title} 수정됨`)
      if (config.templateKey === 'function' && field.dataset.configField === 'code') {
        if (applyFunctionCodeMetadata(node, field.value)) {
          renderInspector()
          graphCanvas.setDirty(true, true)
          return
        }
      }
      if (config.templateKey === 'split') {
        const before = (node.outputs || []).length
        normalizeDynamicNode(node)
        if ((node.outputs || []).length !== before) {
          renderInspector()
          graphCanvas.setDirty(true, true)
          return
        }
      }
      syncVisibleOutput(node)
      if (field instanceof HTMLTextAreaElement) autoSizeTextarea(field)
      graphCanvas.setDirty(true, true)
    })
  })
}

function bindCombineCountButtons(node) {
  elements.fieldStack.querySelectorAll('[data-combine-count]').forEach((button) => {
    button.addEventListener('click', () => {
      const config = getConfig(node)
      config.inputCount = clampCount((config.inputCount || 2) + Number.parseInt(button.dataset.combineCount, 10), 2, 12)
      runtime.outputs.delete(node.id)
      runtime.errors.delete(node.id)
      normalizeDynamicNode(node)
      renderInspector()
      graphCanvas.setDirty(true, true)
    })
  })
}

function bindFunctionCountButtons(node) {
  elements.fieldStack.querySelectorAll('[data-function-count]').forEach((button) => {
    button.addEventListener('click', () => {
      const config = getConfig(node)
      config.inputCount = clampCount((config.inputCount || 1) + Number.parseInt(button.dataset.functionCount, 10), 1, 6)
      runtime.outputs.delete(node.id)
      runtime.errors.delete(node.id)
      normalizeDynamicNode(node)
      renderInspector()
      graphCanvas.setDirty(true, true)
    })
  })
}

function bindFunctionFilePicker(node) {
  const button = elements.fieldStack.querySelector('[data-py-file-button]')
  const pathInput = elements.fieldStack.querySelector('[data-py-path-input]')
  const fileInput = elements.fieldStack.querySelector('[data-py-file-input]')
  if (!button || !pathInput || !fileInput) return

  const openPicker = () => fileInput.click()
  button.addEventListener('click', openPicker)
  pathInput.addEventListener('click', openPicker)
  fileInput.addEventListener('change', async () => {
    const file = fileInput.files?.[0]
    if (!file) return
    const config = getConfig(node)
    const text = await file.text()
    config.pyPath = file.name
    config.code = text
    runtime.outputs.delete(node.id)
    runtime.errors.delete(node.id)
    applyFunctionCodeMetadata(node, text)
    setStatus(`${file.name} 불러옴`)
    renderInspector()
    graphCanvas.setDirty(true, true)
  })
}

function applyFunctionCodeMetadata(node, code) {
  const config = getConfig(node)
  const names = parseFunctionInputNames(code)
  if (!names.length) return false

  const nextCount = clampCount(names.length, 1, 6)
  const nextNames = names.slice(0, nextCount)
  const beforeCount = config.inputCount || 1
  const beforeNames = Array.isArray(config.inputNames) ? config.inputNames.join('\n') : ''
  config.inputCount = nextCount
  config.inputNames = nextNames
  if (!Array.isArray(config.inputs)) config.inputs = [config.input || '']
  while (config.inputs.length < nextCount) config.inputs.push('')
  while (config.inputs.length > nextCount) config.inputs.pop()
  normalizeDynamicNode(node)
  return beforeCount !== nextCount || beforeNames !== nextNames.join('\n')
}

function parseFunctionInputNames(code) {
  const text = String(code || '')
  const explicit = text.match(/^\s*#\s*(?:cyan:function\s+)?inputs\s*[:=]\s*([^\r\n]+)/im)
  if (explicit) {
    const names = splitInputNames(explicit[1])
    if (names.length) return names
  }

  const countMatch = text.match(/^\s*#\s*(?:cyan_node_)?inputs?\s*[:=]\s*(\d+)\s*$/im)
  if (countMatch) {
    const count = clampCount(countMatch[1], 1, 6)
    return Array.from({ length: count }, (_, index) => `input ${index + 1}`)
  }

  const signature = text.match(/^\s*def\s+\w+\s*\(([^)]*)\)\s*:/m)
  if (!signature) return []
  return splitInputNames(signature[1])
    .filter((name) => !['self', 'cls'].includes(name))
}

function splitInputNames(value) {
  return String(value || '')
    .split(',')
    .map((part) => part.trim().replace(/:.+$/, '').replace(/=.+$/, '').trim())
    .filter((part) => /^[A-Za-z_][A-Za-z0-9_]*$/.test(part))
    .slice(0, 6)
}

function bindSeparatorButtons(node) {
  const config = getConfig(node)
  elements.fieldStack.querySelectorAll('[data-separator-lines]').forEach((button) => {
    const value = separatorFromLines(button.dataset.separatorLines)
    button.addEventListener('click', () => {
      config.separator = value
      runtime.outputs.delete(node.id)
      runtime.errors.delete(node.id)
      setStatus(`${config.title} 수정됨`)
      syncSeparatorButtons(node)
      syncVisibleOutput(node)
      graphCanvas.setDirty(true, true)
    })
  })
  syncSeparatorButtons(node)
}

function syncSeparatorButtons(node) {
  const config = getConfig(node)
  elements.fieldStack.querySelectorAll('[data-separator-lines]').forEach((button) => {
    const value = separatorFromLines(button.dataset.separatorLines)
    button.classList.toggle('active', value === (config.separator ?? '\n\n'))
  })
}

function separatorFromLines(value) {
  if (value === '1') return '\n'
  if (value === '2') return '\n\n'
  return ''
}

function bindSplitModeButtons(node) {
  elements.fieldStack.querySelectorAll('[data-split-mode]').forEach((button) => {
    button.classList.toggle('active', button.dataset.splitMode === getConfig(node).splitMode)
    button.addEventListener('click', () => {
      const config = getConfig(node)
      config.splitMode = button.dataset.splitMode
      runtime.outputs.delete(node.id)
      runtime.errors.delete(node.id)
      normalizeDynamicNode(node)
      renderInspector()
      graphCanvas.setDirty(true, true)
    })
  })
}

function bindSplitKeepButtons(node) {
  elements.fieldStack.querySelectorAll('[data-split-keep]').forEach((button) => {
    button.addEventListener('click', () => {
      const config = getConfig(node)
      config.delimiterKeep = button.dataset.splitKeep
      runtime.outputs.delete(node.id)
      runtime.errors.delete(node.id)
      const before = (node.outputs || []).length
      normalizeDynamicNode(node)
      if ((node.outputs || []).length !== before) {
        renderInspector()
      } else {
        syncSplitKeepButtons(node)
        syncVisibleOutput(node)
      }
      graphCanvas.setDirty(true, true)
    })
  })
  syncSplitKeepButtons(node)
}

function syncSplitKeepButtons(node) {
  elements.fieldStack.querySelectorAll('[data-split-keep]').forEach((button) => {
    button.classList.toggle('active', button.dataset.splitKeep === (getConfig(node).delimiterKeep || 'omit'))
  })
}

function syncVisibleOutput(node) {
  if (runtime.selectedNodeId !== node.id) return
  const outputField = elements.fieldStack.querySelector('[data-output-field]')
  if (!outputField) return
  const error = runtime.errors.get(node.id)
  outputField.value = error || outputText(getNodeOutput(node))
  autoSizeTextarea(outputField)
}

function applyNodeName() {
  const node = getSelectedNode()
  if (!node) return
  const config = getConfig(node)
  config.title = elements.nodeName.value.trim() || getTemplate(node).title
  node.title = config.title
  renderInspector()
  graphCanvas.setDirty(true, true)
}

function setNodeRunning(node, runId) {
  runtime.runningNodeId = node.id
  runtime.activeRunByNode.set(node.id, runId)
  runtime.errors.delete(node.id)
  setStatus(`${getConfig(node).title} 실행 중`)
  renderInspector()
  graphCanvas.setDirty(true, true)
}

function isCurrentRun(node, runId) {
  return runtime.activeRunByNode.get(node.id) === runId
}

function setNodeOutput(node, values) {
  runtime.outputs.set(node.id, {
    values,
    updatedAt: Date.now(),
  })
  runtime.errors.delete(node.id)
  if (runtime.runningNodeId === node.id) runtime.runningNodeId = null
  setStatus(`${getConfig(node).title} 완료`)
  if (runtime.selectedNodeId === node.id) renderInspector()
  graphCanvas.setDirty(true, true)
}

function setNodeError(node, error) {
  runtime.errors.set(node.id, error.message || String(error))
  runtime.outputs.delete(node.id)
  if (runtime.runningNodeId === node.id) runtime.runningNodeId = null
  setStatus(`${getConfig(node).title} 실패`)
  if (runtime.selectedNodeId === node.id) renderInspector()
  graphCanvas.setDirty(true, true)
}

async function executeNode(node) {
  const template = getTemplate(node)
  const config = getConfig(node)
  const runId = ++runtime.runSeq
  setNodeRunning(node, runId)

  try {
    if (config.templateKey === 'combine') {
      setNodeOutput(node, [composeCombineNode(node)])
      return true
    }

    if (config.templateKey === 'split') {
      normalizeDynamicNode(node)
      setNodeOutput(node, composeSplitNode(node))
      return true
    }

    if (config.templateKey === 'function') {
      normalizeDynamicNode(node)
      const inputs = Array.from({ length: config.inputCount || 1 }, (_, index) =>
        String(readNodeInput(node, index, config.inputs?.[index] ?? (index === 0 ? config.input : '') ?? ''))
      )
      const output = runFunctionNode(config.pyPath, inputs, config.code)
      setNodeOutput(node, [output])
      return true
    }

    if (config.templateKey === 'llm') {
      const prompt = String(readNodeInput(node, 0, config.prompt || ''))
      if (!prompt.trim()) throw new Error('prompt가 비어 있습니다.')
      const reply = await callOAuthChat(prompt)
      if (!isCurrentRun(node, runId)) return false
      setNodeOutput(node, [reply])
      return true
    }

    throw new Error(`${template.title} 실행기가 없습니다.`)
  } catch (error) {
    if (isCurrentRun(node, runId)) setNodeError(node, error)
    return false
  }
}

function runFunctionNode(pyPath, inputs, code) {
  const path = String(pyPath || '').trim()
  const lowerPath = path.toLowerCase()
  const values = Array.isArray(inputs) ? inputs : [inputs]
  const text = String(values[0] ?? '')

  if (!path) return text

  if (lowerPath.includes('trim')) return text.trim()
  if (lowerPath.includes('uppercase')) return text.toUpperCase()
  if (lowerPath.includes('lowercase')) return text.toLowerCase()
  if (lowerPath.includes('keywords')) return extractKeywords(text).map((keyword) => `《${keyword}》`).join('') || '《》'
  if (lowerPath.includes('search')) return JSON.stringify(searchCatalog(values[0], values[1]), null, 2)
  if (lowerPath.includes('json_pretty')) return JSON.stringify(JSON.parse(text), null, 2)

  if (String(code || '').trim()) {
    return [
      `[${path || '.py'}]`,
      '',
      '[input]',
      values.map((value, index) => `[${index + 1}]\n${String(value ?? '')}`).join('\n\n'),
      '',
      '[code]',
      String(code).trim(),
    ].join('\n')
  }

  return text
}

function searchCatalog(queryInput, dbInput) {
  const query = String(queryInput || '').trim()
  const keywords = extractMarkedKeywords(query)
  const rows = parseSearchRows(dbInput)
  const candidates = rows
    .map((row, index) => {
      const rowIndex = Number(row._rowIndex || row.rowIndex || row.order || index + 1)
      const cells = Object.entries(row)
        .filter(([key]) => !String(key).startsWith('_'))
        .map(([key, value]) => ({ key, value: Array.isArray(value) ? value.join(' ') : String(value ?? '') }))
      const matchedCells = []
      const matchedKeywords = new Set()
      let score = 0
      keywords.forEach((keyword) => {
        const normalizedKeyword = normalizeSearchText(keyword)
        cells.forEach((cell) => {
          if (!normalizedKeyword || !normalizeSearchText(cell.value).includes(normalizedKeyword)) return
          const weight = searchColumnWeight(cell.key)
          score += weight
          matchedKeywords.add(keyword)
          matchedCells.push({
            x: cell.key,
            y: rowIndex,
            keyword,
            value: compact(cell.value, 140),
            weight,
          })
        })
      })
      return { row, rowIndex, score, matchedCells, matchedKeywordCount: matchedKeywords.size }
    })
    .filter((item) => item.score > 0 || keywords.length === 0)

  const fullMatches = keywords.length > 1
    ? candidates.filter((item) => item.matchedKeywordCount === keywords.length)
    : []
  const scored = (fullMatches.length ? fullMatches : candidates)
    .sort((left, right) => right.score - left.score || left.rowIndex - right.rowIndex)

  const topRows = scored.slice(0, 8)
  const coordinateContext = topRows.flatMap((item) => {
    const columns = Object.fromEntries(Object.entries(item.row).filter(([key]) => !String(key).startsWith('_')))
    return [
      { axis: 'row', rowIndex: item.rowIndex, matchedCells: item.matchedCells, row: item.row },
      { axis: 'columns', rowIndex: item.rowIndex, matchedCells: item.matchedCells, columns },
    ]
  })

  return {
    query,
    keywords,
    matchedRowCount: scored.length,
    matchedCellCount: scored.reduce((total, item) => total + item.matchedCells.length, 0),
    broad: scored.length > 8,
    facets: buildSearchFacets(scored.map((item) => item.row)),
    results: topRows.map((item) => ({
      rowIndex: item.rowIndex,
      score: Number(item.score.toFixed(2)),
      matchedCells: item.matchedCells,
      row: item.row,
    })),
    crosshairJsonl: coordinateContext.map((item) => JSON.stringify(item)).join('\n'),
  }
}

function extractMarkedKeywords(text) {
  const marked = [...String(text || '').matchAll(/《([^》]+)》/g)]
    .map((match) => match[1].trim())
    .filter(Boolean)
  return (marked.length ? marked : extractKeywords(text)).slice(0, 5)
}

function normalizeSearchText(value) {
  return String(value || '').toLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ').trim()
}

function searchColumnWeight(key) {
  const normalized = String(key || '').toLowerCase()
  if (normalized.includes('artist')) return 4
  if (normalized.includes('goods') || normalized.includes('name')) return 3
  if (normalized.includes('category') || normalized.includes('alias')) return 2.4
  if (normalized.includes('group') || normalized.includes('tag')) return 1.8
  if (normalized.includes('description') || normalized.includes('hint')) return 1
  return 0.7
}

function safeJson(text) {
  try {
    return JSON.parse(String(text || ''))
  } catch {
    return null
  }
}

function parseSearchRows(source) {
  if (source && typeof source === 'object') {
    if (Array.isArray(source.goods)) return source.goods
    if (Array.isArray(source.rows)) return source.rows
    if (Array.isArray(source)) return source
  }

  const text = String(source || '').trim()
  if (!text) return []
  const parsed = safeJson(text)
  if (parsed) return parseSearchRows(parsed)

  const lines = text.split(/\r?\n/).filter((line) => line.trim())
  if (!lines.length) return []
  const delimiter = lines[0].includes('\t') ? '\t' : ','
  const headers = lines[0].split(delimiter).map((header) => header.trim())
  return lines.slice(1).map((line, index) => {
    const cells = line.split(delimiter)
    const row = { _rowIndex: index + 2 }
    headers.forEach((header, cellIndex) => {
      row[header || `col_${cellIndex + 1}`] = cells[cellIndex] || ''
    })
    return row
  })
}

function buildSearchFacets(rows) {
  const facetKeys = ['groupName', 'group_name', 'artistName', 'artist_name', 'categoryName', 'category_name', 'availability']
  const facets = {}
  facetKeys.forEach((key) => {
    const counts = {}
    rows.forEach((row) => {
      const value = row[key]
      if (!value) return
      counts[value] = (counts[value] || 0) + 1
    })
    if (Object.keys(counts).length) facets[key] = counts
  })
  return facets
}

function extractKeywords(text) {
  return String(text || '')
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .split(/\s+/)
    .map((word) => word.trim())
    .filter((word) => word.length > 1)
    .slice(0, 5)
}

function getExecutionOrder() {
  const nodes = [...graph._nodes]
  const nodeIds = new Set(nodes.map((node) => node.id))
  const indegree = new Map(nodes.map((node) => [node.id, 0]))
  const edges = new Map(nodes.map((node) => [node.id, []]))

  Object.values(graph.links || {}).forEach((link) => {
    if (!nodeIds.has(link.origin_id) || !nodeIds.has(link.target_id)) return
    edges.get(link.origin_id).push(link.target_id)
    indegree.set(link.target_id, (indegree.get(link.target_id) || 0) + 1)
  })

  const queue = nodes.filter((node) => indegree.get(node.id) === 0)
  const ordered = []
  while (queue.length) {
    const node = queue.shift()
    ordered.push(node)
    edges.get(node.id).forEach((targetId) => {
      indegree.set(targetId, indegree.get(targetId) - 1)
      if (indegree.get(targetId) === 0) queue.push(graph.getNodeById(targetId))
    })
  }
  return ordered.length === nodes.length ? ordered : nodes
}

async function runSelectedNode() {
  const node = getSelectedNode()
  if (!node || runtime.graphRunning) return
  await executeNode(node)
}

async function runGraph() {
  if (runtime.graphRunning) return
  runtime.graphRunning = true
  elements.runGraph.textContent = 'Running'
  renderInspector()

  try {
    const ordered = getExecutionOrder()
    for (const node of ordered) {
      const ok = await executeNode(node)
      if (!ok) break
    }
  } finally {
    runtime.graphRunning = false
    runtime.runningNodeId = null
    elements.runGraph.textContent = 'Run Graph'
    renderInspector()
    graphCanvas.setDirty(true, true)
  }
}

async function apiRequest(path, options = {}) {
  const response = await fetch(path, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  })
  const payload = await response.json().catch(() => ({}))
  if (!response.ok || payload.ok === false) {
    throw new Error(payload.error || `HTTP ${response.status}`)
  }
  return payload
}

async function callOAuthChat(message) {
  const payload = await apiRequest('/api/chat', {
    method: 'POST',
    body: JSON.stringify({ message }),
  })
  return String(payload.reply || '').trim()
}

function setOAuthStatus(status, fallbackText = '') {
  runtime.oauthStatus = status || null
  const connected = Boolean(status?.logged_in && status?.token_valid)
  elements.oauthStatus.dataset.connected = String(connected)

  if (connected) {
    elements.oauthStatus.textContent = status.email ? `OAuth 연결됨 ${status.email}` : 'OAuth 연결됨'
    elements.oauthLogin.textContent = 'OAuth 재연결'
    return
  }

  if (status?.keyRequired) {
    elements.oauthStatus.textContent = 'OAuth 키 필요'
    elements.oauthLogin.textContent = 'OAuth 연결'
    return
  }

  elements.oauthStatus.textContent = fallbackText || 'OAuth 대기'
  elements.oauthLogin.textContent = 'OAuth 연결'
}

async function refreshOAuthStatus() {
  try {
    const payload = await apiRequest('/api/oauth/status')
    setOAuthStatus(payload.status)
    setStatus('OAuth 상태 확인 완료')
  } catch (error) {
    setOAuthStatus(null, `OAuth 확인 실패: ${error.message}`)
    setStatus(`OAuth 확인 실패: ${error.message}`)
  }
}

function stopOAuthPolling() {
  if (runtime.oauthPollTimer) window.clearInterval(runtime.oauthPollTimer)
  runtime.oauthPollTimer = null
}

function startOAuthPolling() {
  stopOAuthPolling()
  runtime.oauthPollTimer = window.setInterval(async () => {
    try {
      const payload = await apiRequest('/api/oauth/poll')
      setOAuthStatus(payload.status, payload.completed ? 'OAuth 완료' : 'OAuth 진행 중')
      if (payload.status?.logged_in && payload.status?.token_valid) {
        stopOAuthPolling()
        setStatus('OAuth 연결 완료')
      }
    } catch (error) {
      stopOAuthPolling()
      setOAuthStatus(null, `OAuth 실패: ${error.message}`)
      setStatus(`OAuth 실패: ${error.message}`)
    }
  }, 1000)
}

async function saveOAuthKey() {
  const digitKey = elements.oauthKey.value.trim()
  if (!digitKey) throw new Error('OAUTH_TOKEN_DIGIT_KEY가 비어 있습니다.')
  const payload = await apiRequest('/api/oauth/key', {
    method: 'POST',
    body: JSON.stringify({ digitKey }),
  })
  elements.oauthKey.value = ''
  setOAuthStatus(payload.status, 'OAuth 키 저장됨')
  setStatus('OAuth 키 저장됨')
}

async function ensureOAuthDigitKey() {
  const payload = await apiRequest('/api/oauth/status')
  if (!payload.status?.keyRequired) {
    setOAuthStatus(payload.status)
    return
  }
  await saveOAuthKey()
}

async function startOAuthLogin() {
  elements.oauthLogin.disabled = true
  setStatus('OAuth 준비 중')
  try {
    await ensureOAuthDigitKey()
    const payload = await apiRequest('/api/oauth/start', { method: 'POST', body: '{}' })
    window.open(payload.authorization_url, '_blank', 'noopener')
    setOAuthStatus(payload.status, 'OAuth 인증 창 열림')
    setStatus('OAuth 인증 창 열림')
    startOAuthPolling()
  } catch (error) {
    setOAuthStatus(null, `OAuth 시작 실패: ${error.message}`)
    setStatus(`OAuth 시작 실패: ${error.message}`)
  } finally {
    elements.oauthLogin.disabled = false
  }
}

async function clearOAuth() {
  stopOAuthPolling()
  try {
    const payload = await apiRequest('/api/oauth/clear', { method: 'POST', body: '{}' })
    setOAuthStatus(payload.status, 'OAuth 연결 해제')
    setStatus('OAuth 연결 해제')
  } catch (error) {
    setStatus(`OAuth 연결 해제 실패: ${error.message}`)
  }
}

function exportWorkflow() {
  return {
    version: 1,
    nodes: graph._nodes.map((node) => ({
      id: node.id,
      type: getConfig(node).templateKey,
      title: node.title,
      pos: [...node.pos],
      size: [...node.size],
      config: { ...getConfig(node) },
    })),
    links: Object.values(graph.links || {}).map((link) => ({
      origin_id: link.origin_id,
      origin_slot: link.origin_slot,
      target_id: link.target_id,
      target_slot: link.target_slot,
    })),
    view: {
      offset: [...graphCanvas.ds.offset],
      scale: graphCanvas.ds.scale,
    },
  }
}

function downloadWorkflowJson() {
  const json = JSON.stringify(exportWorkflow(), null, 2)
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `ai-graph-workflow-${new Date().toISOString().slice(0, 10)}.json`
  link.click()
  URL.revokeObjectURL(url)
  setStatus('workflow json 저장')
}

function importWorkflow(workflow) {
  graph.clear()
  runtime.outputs.clear()
  runtime.errors.clear()
  runtime.activeRunByNode.clear()
  runtime.runningNodeId = null
  runtime.selectedNodeId = null

  const idMap = new Map()
  ;(workflow.nodes || []).forEach((savedNode) => {
    if (!nodeTemplates[savedNode.type]) return
    const node = addNode(savedNode.type, Array.isArray(savedNode.pos) ? savedNode.pos : null)
    if (Array.isArray(savedNode.size)) node.size = savedNode.size
    node.properties.config = {
      ...makeNodeConfig(savedNode.type),
      ...(savedNode.config || {}),
      templateKey: savedNode.type,
    }
    normalizeDynamicNode(node)
    node.title = node.properties.config.title || savedNode.title || nodeTemplates[savedNode.type].title
    idMap.set(savedNode.id, node)
  })

  ;(workflow.links || []).forEach((link) => {
    const origin = idMap.get(link.origin_id)
    const target = idMap.get(link.target_id)
    if (!origin || !target) return
    origin.connect(link.origin_slot || 0, target, link.target_slot || 0)
  })

  graph._nodes.forEach(normalizeDynamicNode)

  if (workflow.view) {
    if (Array.isArray(workflow.view.offset)) graphCanvas.ds.offset = workflow.view.offset
    if (Number.isFinite(workflow.view.scale)) graphCanvas.ds.scale = workflow.view.scale
  }

  graph.start()
  graphCanvas.deselectAllNodes()
  updateCanvasChip()
  renderInspector()
  graphCanvas.setDirty(true, true)
  setStatus('workflow json 불러옴')
}

async function loadWorkflowFile(file) {
  if (!file) return
  try {
    importWorkflow(JSON.parse(await file.text()))
  } catch (error) {
    setStatus(`workflow json 실패: ${error.message}`)
  } finally {
    elements.workflowFile.value = ''
  }
}

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function compact(value, max = 110) {
  const text = String(value ?? '').replace(/\s+/g, ' ').trim()
  return text.length > max ? `${text.slice(0, max)}...` : text
}

window.addEventListener('resize', resizeCanvas)
new ResizeObserver(resizeCanvas).observe(elements.canvas.parentElement)

document.querySelectorAll('[data-add-node]').forEach((button) => {
  button.addEventListener('click', () => addNode(button.dataset.addNode))
})

elements.nodeName.addEventListener('input', applyNodeName)
elements.runNode.addEventListener('click', runSelectedNode)
elements.runGraph.addEventListener('click', runGraph)
elements.saveWorkflow.addEventListener('click', downloadWorkflowJson)
elements.loadWorkflow.addEventListener('click', () => elements.workflowFile.click())
elements.workflowFile.addEventListener('change', () => {
  loadWorkflowFile(elements.workflowFile.files?.[0])
})
elements.oauthRefresh.addEventListener('click', refreshOAuthStatus)
elements.oauthClear.addEventListener('click', clearOAuth)
elements.oauthLogin.addEventListener('click', startOAuthLogin)
elements.oauthSaveKey.addEventListener('click', () => {
  saveOAuthKey().catch((error) => setStatus(`OAuth 키 저장 실패: ${error.message}`))
})

resizeCanvas()
buildInitialGraph()
refreshOAuthStatus()
