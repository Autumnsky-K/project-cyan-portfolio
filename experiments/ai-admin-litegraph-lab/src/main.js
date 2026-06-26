import litegraph from 'litegraph.js'
import 'litegraph.js/css/litegraph.css'
import './styles.css'

const { LiteGraph, LGraph, LGraphCanvas } = litegraph

const storageKey = 'ai-admin-litegraph-lab-v7'
const digitKeyMask = '0.0000000000000000000000000000000'
const piTestKey = '3.1415926535897932384626433832795'

const sampleCatalog = [
  'artist_name\tgoods_name\tcategory\tstatus\tprice',
  '히에나\t히에나 포토카드 A\t포토카드\t판매중\t12000',
  '히에나\t히에나 아크릴 스탠드\t아크릴\t판매중\t18000',
  '세리나\t세리나 미니 거울\t거울\t판매중\t9000',
  '그룹 A\tOfficial Lightstick\t응원봉\t판매중\t39000',
].join('\n')

const nodeTypes = {
  textCombiner: {
    path: 'ai/text_combiner',
    title: '텍스트 조합기',
    kind: 'Text',
    color: '#00d6b7',
    bgcolor: 'rgba(5, 50, 58, 0.86)',
    boxcolor: '#00d6b7',
    size: [270, 132],
    inputs: [
      { name: '1', type: 'txt' },
      { name: '2', type: 'txt' },
    ],
    outputs: [{ name: 'text', type: 'txt' }],
    input: '',
    db: '1,2',
    logic: '\\n',
    output: '',
    inputCount: 2,
    combinerInputs: ['', ''],
  },
  functionNode: {
    path: 'ai/function_node',
    title: '함수 노드',
    kind: 'Func',
    color: '#45d6ff',
    bgcolor: 'rgba(8, 35, 62, 0.88)',
    boxcolor: '#45d6ff',
    size: [240, 112],
    inputs: [{ name: 'input', type: 'txt' }],
    outputs: [{ name: 'output', type: 'txt' }],
    input: '',
    db: 'identity.py',
    logic: '',
    output: '',
  },
  llmModel: {
    path: 'ai/llm_model',
    title: 'LLM 모델',
    kind: 'LLM',
    color: '#7a5cff',
    bgcolor: 'rgba(32, 28, 68, 0.9)',
    boxcolor: '#7a5cff',
    size: [250, 118],
    inputs: [{ name: 'prompt', type: 'txt' }],
    outputs: [{ name: 'response', type: 'txt' }],
    input: '',
    db: 'OAuth default',
    logic: '',
    output: '',
  },
  customer: {
    path: 'ai/customer_input',
    title: '고객 입력',
    kind: 'txt->txt',
    color: '#45d6ff',
    bgcolor: 'rgba(8, 35, 62, 0.84)',
    boxcolor: '#00c8ff',
    size: [220, 92],
    inputs: [],
    outputs: [{ name: 'text', type: 'txt' }],
    input: '히에나 포카 있어?',
    db: '',
    logic: '입력 텍스트를 그대로 다음 노드에 전달한다.',
    output: '',
  },
  inputHook: {
    path: 'ai/input_hook',
    title: 'Input Hook',
    kind: 'Hook',
    color: '#a6ff4d',
    bgcolor: 'rgba(24, 49, 42, 0.86)',
    boxcolor: '#a6ff4d',
    size: [230, 104],
    inputs: [{ name: 'input', type: 'txt', required: true }],
    outputs: [
      { name: 'next input', type: 'txt' },
      { name: 'hook report', type: 'object' },
    ],
    input: '',
    db: '',
    logic: '금지어: DROP, DELETE, 토큰, 비밀번호\n하드 블록: access_token, refresh_token\n실패 시 LLM 호출을 막고 백업 응답으로 보낸다.',
    output: '',
  },
  searchLlm: {
    path: 'ai/search_llm',
    title: '좌뇌 선택기',
    kind: 'LLM',
    color: '#7a5cff',
    bgcolor: 'rgba(32, 28, 68, 0.88)',
    boxcolor: '#7a5cff',
    size: [240, 112],
    inputs: [
      { name: 'question', type: 'txt', required: true },
      { name: 'candidate txt', type: 'txt' },
    ],
    outputs: [{ name: 'keywords', type: 'txt' }],
    input: '',
    db: '',
    logic: [
      '초기 프롬프트 없음.',
      '고객 질문과 후보 목록만 보고 검색 키워드를 5개 이하로 고른다.',
      '검색할 필요가 없으면 《》만 출력한다.',
    ].join('\n'),
    output: '',
  },
  catalogDb: {
    path: 'ai/catalog_db',
    title: 'Catalog DB',
    kind: 'DB',
    color: '#00d6b7',
    bgcolor: 'rgba(5, 50, 58, 0.86)',
    boxcolor: '#00d6b7',
    size: [240, 104],
    inputs: [],
    outputs: [
      { name: 'db object', type: 'object' },
      { name: 'raw txt', type: 'txt' },
    ],
    input: '',
    db: sampleCatalog,
    logic: 'TSV 또는 압축 catalog txt를 DB 객체로 취급한다. 검색 함수는 이 객체를 두 번째 필수 입력으로 받는다.',
    output: '',
  },
  tries: {
    path: 'ai/tries_compress',
    title: 'Tries 압축',
    kind: 'Tries',
    color: '#ffb020',
    bgcolor: 'rgba(65, 45, 10, 0.86)',
    boxcolor: '#ffb020',
    size: [240, 106],
    inputs: [{ name: 'db object', type: 'object', required: true }],
    outputs: [{ name: 'compressed txt', type: 'txt' }],
    input: '',
    db: '',
    logic: 'DB 객체를 artist > goods > category 중심의 짧은 후보 txt로 압축한다. 출력은 LLM 후보 목록에 들어가는 txt다.',
    output: '',
  },
  search: {
    path: 'ai/search_func',
    title: 'Search',
    kind: 'Search',
    color: '#00c8ff',
    bgcolor: 'rgba(7, 40, 68, 0.9)',
    boxcolor: '#00c8ff',
    size: [250, 118],
    inputs: [
      { name: 'keywords', type: 'txt', required: true },
      { name: 'DB object', type: 'object', required: true },
    ],
    outputs: [
      { name: 'result object', type: 'object' },
      { name: 'crosshair jsonl', type: 'txt' },
    ],
    input: '《히에나》《포토카드》',
    db: '',
    logic: 'POST /api/admin/db-search\n입력 1: 좌뇌 keywords txt\n입력 2: DB object\n출력: 검색 결과 object + 조준선 JSONL',
    output: '',
  },
  persona: {
    path: 'ai/persona',
    title: '페르소나',
    kind: 'LLM',
    color: '#ff4fd8',
    bgcolor: 'rgba(66, 25, 66, 0.88)',
    boxcolor: '#ff4fd8',
    size: [230, 104],
    inputs: [],
    outputs: [{ name: 'persona txt', type: 'txt' }],
    input: '',
    db: '',
    logic: [
      '너는 쇼핑몰을 차린 히에나다.',
      '고객에게 친근하게 상품을 추천한다.',
      '검색 결과에 있는 내용만 근거로 말한다.',
      '재고 수량과 토큰 값은 직접 말하지 않는다.',
    ].join('\n'),
    output: '',
  },
  voiceLlm: {
    path: 'ai/voice_llm',
    title: '우뇌 응대',
    kind: 'LLM',
    color: '#ff4fd8',
    bgcolor: 'rgba(55, 23, 72, 0.9)',
    boxcolor: '#ff4fd8',
    size: [260, 122],
    inputs: [
      { name: 'question', type: 'txt', required: true },
      { name: 'search object', type: 'object', required: true },
      { name: 'persona txt', type: 'txt' },
    ],
    outputs: [
      { name: 'answer txt', type: 'txt' },
      { name: 'motion seed', type: 'txt' },
    ],
    input: '',
    db: '',
    logic: '검색 결과와 페르소나를 받아 고객에게 보이는 답변만 생성한다. 좌뇌 검색 판단은 여기서 하지 않는다.',
    output: '',
  },
  outputHook: {
    path: 'ai/output_hook',
    title: 'Output Hook',
    kind: 'Hook',
    color: '#a6ff4d',
    bgcolor: 'rgba(24, 49, 42, 0.86)',
    boxcolor: '#a6ff4d',
    size: [240, 108],
    inputs: [{ name: 'answer txt', type: 'txt', required: true }],
    outputs: [{ name: 'safe answer', type: 'txt' }],
    input: '',
    db: '',
    logic: '금지어: 재고 120, 재고 35, access_token, refresh_token\nACTION 허용: show_goods, add_cart, ask_followup, idle\n백업 응답: 앗, 이 요청은 지금 바로 처리하기 어려워. 상품을 찾는 질문으로 다시 말해줄래?',
    output: '',
  },
  motion: {
    path: 'ai/motion_func',
    title: '소뇌 모션',
    kind: 'Func',
    color: '#ffb020',
    bgcolor: 'rgba(65, 45, 10, 0.86)',
    boxcolor: '#ffb020',
    size: [240, 112],
    inputs: [{ name: 'answer txt', type: 'txt', required: true }],
    outputs: [{ name: 'motion object', type: 'object' }],
    input: '',
    db: '',
    logic: '응대 문장과 의도만 보고 emotion, motion, face, intensity를 고른다. 상품 DB는 보지 않는다.',
    output: '',
  },
  tokenGuard: {
    path: 'ai/token_guard',
    title: 'Token Guard',
    kind: 'Func',
    color: '#45d6ff',
    bgcolor: 'rgba(8, 35, 62, 0.9)',
    boxcolor: '#45d6ff',
    size: [250, 118],
    inputs: [{ name: 'plain/cipher txt', type: 'txt' }],
    outputs: [
      { name: 'protected txt', type: 'txt' },
      { name: 'report object', type: 'object' },
    ],
    input: 'sample_secret_text',
    db: '',
    logic: JSON.stringify(
      {
        mode: 'roundtrip',
        scheme: 'digit-key-xor-sha256-hmac-v1',
        keyMask: digitKeyMask,
        testKey: piTestKey,
        showRecovered: true,
      },
      null,
      2
    ),
    output: '',
  },
  py: {
    path: 'ai/python_py',
    title: '.py 함수',
    kind: '.py',
    color: '#ffffff',
    bgcolor: 'rgba(22, 28, 40, 0.9)',
    boxcolor: '#ffffff',
    size: [230, 110],
    inputs: [
      { name: 'stdin', type: 'txt' },
      { name: 'object', type: 'object' },
    ],
    outputs: [
      { name: 'stdout', type: 'txt' },
      { name: 'object', type: 'object' },
    ],
    input: '{"query":"히에나 포토카드"}',
    db: '{}',
    logic: 'def run(input, db):\n    return {"stdout": input, "object": db}',
    output: '',
  },
}

const allTypeOptions = Object.values(nodeTypes)
const typeOptions = [nodeTypes.textCombiner, nodeTypes.functionNode, nodeTypes.llmModel]

const state = {
  selectedNode: null,
  status: 'ready',
  isolatedPreview: null,
  isolatedAutoTimer: null,
  isolatedAutoNodeId: null,
  showNodeMeta: false,
  showNodeDetails: false,
  runTrace: [],
  oauthPollTimer: null,
  config: {
    catalogText: sampleCatalog,
    inputForbidden: 'DROP, DELETE, 토큰, 비밀번호',
    outputForbidden: '재고 120, 재고 35, access_token, refresh_token',
    allowedActions: 'show_goods, add_cart, ask_followup, idle',
    fallback: '앗, 이 요청은 지금 바로 처리하기 어려워. 상품을 찾는 질문으로 다시 말해줄래?',
  },
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
        <span class="pill oauth-pill" data-oauth-status>OAuth 확인 전</span>
        <button type="button" class="secondary" data-oauth-login>OAuth 연결</button>
        <select data-add-type aria-label="노드 타입">
          ${typeOptions.map((type) => `<option value="${type.path}">${type.title} / ${type.kind}</option>`).join('')}
        </select>
        <button type="button" class="secondary" data-add-node>새 노드</button>
        <button type="button" class="secondary" data-save-graph>저장</button>
        <button type="button" class="secondary" data-reset-graph>기본 배치</button>
        <button type="button" data-run-graph>Run Graph</button>
      </div>
    </header>
    <section class="workbench">
      <section class="canvas-card">
        <div class="canvas-chip"><b>LiteGraph</b><span data-canvas-chip>0 nodes</span></div>
        <canvas class="graph-canvas" data-graph-canvas></canvas>
      </section>
      <aside class="inspector" data-inspector>
        <div class="inspector-header">
          <div>
            <h2 data-node-title>노드 선택</h2>
            <span class="hint" data-node-caption>캔버스에서 노드를 선택하세요.</span>
          </div>
          <div class="node-header-actions">
            <button type="button" class="secondary mini" data-toggle-meta>IO</button>
            <button type="button" class="secondary mini" data-toggle-details>세부</button>
            <button type="button" class="secondary node-test-header" data-test-node>격리 테스트</button>
          </div>
        </div>
        <div class="node-meta" data-node-meta></div>
        <div class="node-form">
          <label class="field">
            <span>name</span>
            <input data-field-name>
          </label>
          <label class="field">
            <span>type</span>
            <input data-field-kind readonly>
          </label>
        </div>
        <section class="combiner-panel" data-combiner-panel hidden>
          <div class="combiner-toolbar">
            <span data-combiner-count>0 inputs</span>
            <div>
              <button type="button" class="secondary compact" data-combiner-minus>-</button>
              <button type="button" class="secondary compact" data-combiner-plus>+</button>
            </div>
          </div>
          <div class="combiner-settings">
            <label class="field">
              <span>order</span>
              <input data-combiner-order placeholder="1,2,3">
            </label>
            <label class="field">
              <span>separator</span>
              <input data-combiner-separator placeholder="\\n">
            </label>
          </div>
          <div class="combiner-inputs" data-combiner-inputs></div>
        </section>
        <div class="field-stack">
          <label class="field" data-kind="input">
            <span data-label-input>input</span>
            <textarea class="code" data-field-input rows="1" wrap="soft" spellcheck="false"></textarea>
          </label>
          <label class="field" data-kind="db">
            <span data-label-db>DB / context</span>
            <textarea class="code" data-field-db rows="1" wrap="soft" spellcheck="false"></textarea>
          </label>
          <label class="field" data-kind="logic">
            <span data-label-logic>logic / code</span>
            <textarea class="code" data-field-logic rows="1" wrap="soft" spellcheck="false"></textarea>
          </label>
          <label class="field" data-kind="output">
            <span data-label-output>output</span>
            <textarea class="code" data-field-output rows="1" wrap="soft" spellcheck="false"></textarea>
          </label>
        </div>
        <div class="inspector-actions">
          <span class="log-line" data-log-line>idle</span>
          <div>
            <button type="button" class="secondary" data-run-node>Run Node</button>
            <button type="button" data-apply-node>적용</button>
          </div>
        </div>
      </aside>
    </section>
  </main>
`

const elements = {
  inspector: document.querySelector('[data-inspector]'),
  canvas: document.querySelector('[data-graph-canvas]'),
  chip: document.querySelector('[data-canvas-chip]'),
  status: document.querySelector('[data-status]'),
  oauthStatus: document.querySelector('[data-oauth-status]'),
  oauthLogin: document.querySelector('[data-oauth-login]'),
  addType: document.querySelector('[data-add-type]'),
  addNode: document.querySelector('[data-add-node]'),
  saveGraph: document.querySelector('[data-save-graph]'),
  resetGraph: document.querySelector('[data-reset-graph]'),
  runGraph: document.querySelector('[data-run-graph]'),
  nodeTitle: document.querySelector('[data-node-title]'),
  nodeCaption: document.querySelector('[data-node-caption]'),
  nodeMeta: document.querySelector('[data-node-meta]'),
  nodeForm: document.querySelector('.node-form'),
  toggleMeta: document.querySelector('[data-toggle-meta]'),
  toggleDetails: document.querySelector('[data-toggle-details]'),
  name: document.querySelector('[data-field-name]'),
  kind: document.querySelector('[data-field-kind]'),
  input: document.querySelector('[data-field-input]'),
  db: document.querySelector('[data-field-db]'),
  logic: document.querySelector('[data-field-logic]'),
  output: document.querySelector('[data-field-output]'),
  inputLabel: document.querySelector('[data-label-input]'),
  dbLabel: document.querySelector('[data-label-db]'),
  logicLabel: document.querySelector('[data-label-logic]'),
  outputLabel: document.querySelector('[data-label-output]'),
  inputField: document.querySelector('[data-kind="input"]'),
  dbField: document.querySelector('[data-kind="db"]'),
  logicField: document.querySelector('[data-kind="logic"]'),
  outputField: document.querySelector('[data-kind="output"]'),
  logLine: document.querySelector('[data-log-line]'),
  testNode: document.querySelector('[data-test-node]'),
  runNode: document.querySelector('[data-run-node]'),
  applyNode: document.querySelector('[data-apply-node]'),
  combinerPanel: document.querySelector('[data-combiner-panel]'),
  combinerCount: document.querySelector('[data-combiner-count]'),
  combinerPlus: document.querySelector('[data-combiner-plus]'),
  combinerMinus: document.querySelector('[data-combiner-minus]'),
  combinerOrder: document.querySelector('[data-combiner-order]'),
  combinerSeparator: document.querySelector('[data-combiner-separator]'),
  combinerInputs: document.querySelector('[data-combiner-inputs]'),
}

function getDefinition(node) {
  return nodeTypes[node?.properties?.lab?.defKey] || allTypeOptions.find((type) => type.path === node?.type)
}

function getLab(node) {
  if (!node.properties) node.properties = {}
  if (!node.properties.lab) {
    const def = getDefinition(node) || nodeTypes.customer
    node.properties.lab = makeLabState(def)
  }
  if (!Array.isArray(node.properties.lab.outputValues)) {
    node.properties.lab.outputValues = []
  }
  return node.properties.lab
}

function makeLabState(def) {
  return {
    defKey: Object.keys(nodeTypes).find((key) => nodeTypes[key] === def) || 'customer',
    name: def.title,
    kind: def.kind,
    input: def.input || '',
    db: def.db || '',
    logic: def.logic || '',
    output: def.output || '',
    outputValues: [],
    inputCount: def.inputCount || def.inputs?.length || 0,
    combinerInputs: Array.isArray(def.combinerInputs) ? [...def.combinerInputs] : [],
  }
}

function drawRoundRect(ctx, x, y, width, height, radius) {
  if (ctx.roundRect) {
    ctx.beginPath()
    ctx.roundRect(x, y, width, height, radius)
    return
  }
  ctx.beginPath()
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

function registerLabNode(def) {
  function LabNode() {
    def.inputs.forEach((input) => {
      this.addInput(input.name, input.type)
    })
    def.outputs.forEach((output) => {
      this.addOutput(output.name, output.type)
    })
    this.properties = { lab: makeLabState(def) }
    this.size = def.size
    this.color = def.color
    this.bgcolor = def.bgcolor
    this.boxcolor = def.boxcolor
  }

  LabNode.title = def.title
  LabNode.desc = `${def.kind} node`

  LabNode.prototype.onExecute = function onExecute() {
    const lab = getLab(this)
    def.outputs.forEach((_, index) => {
      this.setOutputData(index, lab.outputValues[index] ?? lab.output ?? '')
    })
  }

  LabNode.prototype.onDrawBackground = function onDrawBackground(ctx) {
    if (this.flags.collapsed) return
    const width = this.size[0]
    const height = this.size[1]
    const gradient = ctx.createLinearGradient(0, 0, width, height)
    gradient.addColorStop(0, 'rgba(255,255,255,0.22)')
    gradient.addColorStop(0.52, 'rgba(255,255,255,0.04)')
    gradient.addColorStop(1, 'rgba(255,255,255,0.16)')
    ctx.save()
    drawRoundRect(ctx, 7, 31, width - 14, height - 38, 14)
    ctx.fillStyle = gradient
    ctx.fill()
    ctx.strokeStyle = 'rgba(255,255,255,0.26)'
    ctx.stroke()
    ctx.restore()
  }

  LabNode.prototype.onDrawForeground = function onDrawForeground(ctx) {
    if (this.flags.collapsed) return
    const lab = getLab(this)
    ctx.save()
    ctx.fillStyle = 'rgba(255,255,255,0.82)'
    ctx.font = '11px Inter, Segoe UI, sans-serif'
    ctx.fillText(lab.kind, 14, this.size[1] - 18)
    ctx.fillStyle = 'rgba(195,240,255,0.72)'
    const meta = lab.output ? `${String(lab.output).length} chars` : 'idle'
    ctx.fillText(meta.slice(0, 24), 86, this.size[1] - 18)
    ctx.restore()
  }

  LiteGraph.registerNodeType(def.path, LabNode)
}

allTypeOptions.forEach(registerLabNode)

LiteGraph.NODE_TITLE_COLOR = '#f8fbff'
LiteGraph.NODE_TEXT_COLOR = '#edf7ff'
LiteGraph.NODE_SELECTED_TITLE_COLOR = '#ffffff'
LiteGraph.NODE_DEFAULT_BGCOLOR = 'rgba(20, 28, 42, 0.74)'
LiteGraph.NODE_DEFAULT_COLOR = '#00c8ff'
LiteGraph.NODE_BOX_OUTLINE_COLOR = 'rgba(255,255,255,0.38)'
LiteGraph.LINK_COLOR = '#71e8ff'
LiteGraph.EVENT_LINK_COLOR = '#ff4fd8'
LiteGraph.NODE_TITLE_HEIGHT = 30

const graph = new LGraph()
const graphCanvas = new LGraphCanvas(elements.canvas, graph)
graphCanvas.background_image = null
graphCanvas.clear_background_color = 'rgba(255,255,255,0)'
graphCanvas.render_canvas_border = false
graphCanvas.allow_searchbox = false

graphCanvas.onNodeSelected = (node) => {
  if (state.isolatedAutoNodeId && state.isolatedAutoNodeId !== node.id) {
    stopIsolatedAutoTest()
  }
  state.selectedNode = node
  renderInspector()
}

graphCanvas.onNodeDeselected = (node) => {
  if (state.selectedNode === node) {
    state.selectedNode = null
    renderInspector()
  }
}

graphCanvas.onNodeDblClicked = (node) => {
  state.selectedNode = node
  renderInspector()
}

function resizeCanvas() {
  const rect = elements.canvas.parentElement.getBoundingClientRect()
  elements.canvas.width = Math.max(Math.floor(rect.width), 640)
  elements.canvas.height = Math.max(Math.floor(rect.height), 520)
  graphCanvas.resize()
  graphCanvas.setDirty(true, true)
}

window.addEventListener('resize', resizeCanvas)
new ResizeObserver(resizeCanvas).observe(elements.canvas.parentElement)

function addNode(def, pos) {
  const node = LiteGraph.createNode(def.path)
  node.pos = pos
  graph.add(node)
  updateCanvasChip()
  return node
}

function buildDefaultGraph() {
  graph.clear()

  const promptSource = addNode(nodeTypes.functionNode, [80, 80])
  getLab(promptSource).name = '초기 프롬프트'
  getLab(promptSource).input = '너는 쇼핑몰을 차린 히에나다. 검색 결과에 없는 사실은 만들지 않는다.'
  getLab(promptSource).db = 'identity.py'
  promptSource.title = '초기 프롬프트'

  const userInput = addNode(nodeTypes.functionNode, [80, 250])
  getLab(userInput).name = '고객 입력'
  getLab(userInput).input = '히에나 포카 있어?'
  getLab(userInput).db = 'identity.py'
  userInput.title = '고객 입력'

  const combiner = addNode(nodeTypes.textCombiner, [410, 130])
  const combinerLab = getLab(combiner)
  combinerLab.name = '프롬프트 조합기'
  combinerLab.inputCount = 2
  combinerLab.db = '1,2'
  combinerLab.logic = '\\n\\n'
  combiner.title = '프롬프트 조합기'
  normalizeCombinerState(combiner)

  const llm = addNode(nodeTypes.llmModel, [760, 145])
  getLab(llm).name = 'LLM 모델'
  getLab(llm).db = 'OAuth default'
  getLab(llm).logic = '입력된 프롬프트에 따라 고객에게 보여줄 답변만 출력한다.'
  llm.title = 'LLM 모델'

  promptSource.connect(0, combiner, 0)
  userInput.connect(0, combiner, 1)
  combiner.connect(0, llm, 0)

  state.selectedNode = combiner
  graphCanvas.selectNode(combiner)
  graphCanvas.ds.offset = [20, 40]
  graphCanvas.ds.scale = 0.72
  graph.start()
  updateCanvasChip()
  renderInspector()
}

globalThis.__aiAdminGraphLab = {
  inspect() {
    return graph.serialize()
  },
  selected() {
    return state.selectedNode ? { id: state.selectedNode.id, type: state.selectedNode.type, lab: getLab(state.selectedNode) } : null
  },
  selectByType(type) {
    const node = graph._nodes.find((item) => item.type === type)
    if (!node) return null
    state.selectedNode = node
    graphCanvas.selectNode(node)
    renderInspector()
    return { id: node.id, type: node.type, lab: getLab(node) }
  },
}

function updateCanvasChip() {
  elements.chip.textContent = `${graph._nodes.length} nodes / ${Object.keys(graph.links || {}).length} links`
}

function setStatus(text) {
  state.status = text
  elements.status.textContent = text
  elements.logLine.textContent = text
}

const oauthApiBase = window.location.port === '8001' ? '' : 'http://127.0.0.1:8001'

function apiUrl(path) {
  if (/^https?:\/\//.test(path)) return path
  if (!path.startsWith('/api/')) return path
  return `${oauthApiBase}${path}`
}

async function apiRequest(path, options = {}) {
  const target = apiUrl(path)
  let response
  try {
    response = await fetch(target, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
    })
  } catch (error) {
    if (target.startsWith('http://127.0.0.1:8001/')) {
      throw new Error(`OAuth API 8001 연결 실패: ${error.message}`)
    }
    throw error
  }
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
  const connected = Boolean(status?.logged_in && status?.token_valid)
  elements.oauthStatus.dataset.connected = String(connected)
  if (connected) {
    elements.oauthStatus.textContent = status.email ? `OAuth 연결됨 ${status.email}` : 'OAuth 연결됨'
    if (!elements.oauthLogin.disabled) {
      elements.oauthLogin.textContent = 'OAuth 재연결'
    }
    return
  }
  elements.oauthStatus.textContent = fallbackText || 'OAuth 대기'
  if (!elements.oauthLogin.disabled) {
    elements.oauthLogin.textContent = 'OAuth 연결'
  }
}

async function refreshOAuthStatus() {
  try {
    const payload = await apiRequest('/api/oauth/status')
    setOAuthStatus(payload.status)
  } catch (error) {
    setOAuthStatus(null, `OAuth 확인 실패: ${error.message}`)
  }
}

function stopOAuthPolling() {
  if (state.oauthPollTimer) {
    window.clearInterval(state.oauthPollTimer)
    state.oauthPollTimer = null
  }
}

function shouldUseSpringOAuthLauncher() {
  const localHost = ['127.0.0.1', 'localhost', '::1'].includes(window.location.hostname)
  return localHost && !['8001', '8002'].includes(window.location.port)
}

function delay(ms) {
  return new Promise((resolve) => window.setTimeout(resolve, ms))
}

function oauthHealthMarker(payload) {
  if (!payload) return ''
  const pid = payload.pid == null ? '' : String(payload.pid)
  const startedAt = payload.startedAt == null ? '' : String(payload.startedAt)
  return pid || startedAt ? `${pid}:${startedAt}` : ''
}

async function readOAuthHealth() {
  try {
    return await apiRequest('/api/health')
  } catch {
    return null
  }
}

async function waitForOAuthServer(previousHealth = null, timeoutMs = 180000) {
  const previousMarker = oauthHealthMarker(previousHealth)
  const deadline = Date.now() + timeoutMs
  while (Date.now() < deadline) {
    try {
      const payload = await apiRequest('/api/health')
      const marker = oauthHealthMarker(payload)
      if (payload.ok && (!previousHealth || (marker && marker !== previousMarker))) return payload
    } catch {
      // The key helper restarts the OAuth server after the user enters the key.
    }
    await delay(750)
  }
  throw new Error('OAuth server did not come back after key input')
}

function startOAuthPolling() {
  stopOAuthPolling()
  state.oauthPollTimer = window.setInterval(async () => {
    try {
      const payload = await apiRequest('/api/oauth/poll')
      setOAuthStatus(payload.status, payload.completed ? 'OAuth 완료' : 'OAuth 진행 중')
      if (payload.status?.logged_in && payload.status?.token_valid) {
        stopOAuthPolling()
        setStatus('oauth connected')
      }
    } catch (error) {
      stopOAuthPolling()
      setOAuthStatus(null, `OAuth 실패: ${error.message}`)
    }
  }, 1000)
}

async function openOAuthKeyShell() {
  const launcherPath = shouldUseSpringOAuthLauncher()
    ? '/admin/ai/behavior-lab/local-oauth/open-key-shell'
    : '/api/oauth/open-key-shell'
  await apiRequest(launcherPath, { method: 'POST', body: '{}' })
  setStatus('key shell opened')
  setOAuthStatus(null, 'PowerShell에서 키 입력')
}

async function startOAuthLogin() {
  elements.oauthLogin.disabled = true
  elements.oauthLogin.textContent = '키 입력 대기'
  try {
    const previousHealth = await readOAuthHealth()
    await openOAuthKeyShell()
    await waitForOAuthServer(previousHealth)
    elements.oauthLogin.textContent = 'OAuth 시작'
    const payload = await apiRequest('/api/oauth/start', { method: 'POST', body: '{}' })
    window.open(payload.authorization_url, '_blank', 'noopener')
    setOAuthStatus(payload.status, 'OAuth 인증 창 열림')
    setStatus('oauth browser opened')
    startOAuthPolling()
  } catch (error) {
    setOAuthStatus(null, `OAuth 시작 실패: ${error.message}`)
    setStatus(`oauth failed: ${error.message}`)
  } finally {
    elements.oauthLogin.disabled = false
    elements.oauthLogin.textContent = 'OAuth 연결'
  }
}

function stringifyPreview(value) {
  if (value === undefined || value === null || value === '') return ''
  if (typeof value === 'string') return value
  return JSON.stringify(value, null, 2)
}

function trimPreview(text, maxLength = 7000) {
  const value = String(text || '')
  if (value.length <= maxLength) return value
  return `${value.slice(0, maxLength)}\n\n... ${value.length - maxLength} chars truncated`
}

function compactPreview(value, maxLength = 180) {
  const text = stringifyPreview(value).replace(/\s+/g, ' ').trim()
  if (text.length <= maxLength) return text
  return `${text.slice(0, maxLength - 1)}…`
}

function getConnectedInputHint(node, inputIndex) {
  const info = getIncomingLinkInfo(node, inputIndex)
  if (!info) return ''
  const fromLab = getLab(info.upstream)
  const inputName = info.input?.name || `input ${inputIndex}`
  const outputName = info.upstreamOutput?.name || `output ${info.link.origin_slot}`
  return `${fromLab.name}.${outputName} -> ${inputName}`
}

function setTextareaDensity(textarea, minRows, maxRows) {
  textarea.dataset.minRows = String(minRows)
  textarea.dataset.maxRows = String(maxRows)
}

function autoSizeTextarea(textarea) {
  if (!textarea || textarea.hidden || textarea.closest('[hidden]')) return
  const style = window.getComputedStyle(textarea)
  const lineHeight = Number.parseFloat(style.lineHeight) || 17
  const padding =
    Number.parseFloat(style.paddingTop || '0') +
    Number.parseFloat(style.paddingBottom || '0') +
    Number.parseFloat(style.borderTopWidth || '0') +
    Number.parseFloat(style.borderBottomWidth || '0')
  const minRows = Number.parseInt(textarea.dataset.minRows || '1', 10)
  const maxRows = Number.parseInt(textarea.dataset.maxRows || '10', 10)
  const minHeight = Math.ceil(lineHeight * minRows + padding)
  const maxHeight = Math.ceil(lineHeight * maxRows + padding)
  textarea.style.height = 'auto'
  const nextHeight = Math.min(Math.max(textarea.scrollHeight, minHeight), maxHeight)
  textarea.style.height = `${nextHeight}px`
  textarea.style.overflowY = textarea.scrollHeight > maxHeight ? 'auto' : 'hidden'
}

function autoSizeInspectorTextareas() {
  window.requestAnimationFrame(() => {
    elements.inspector.querySelectorAll('textarea').forEach(autoSizeTextarea)
  })
}

function getIncomingLinkInfo(node, inputIndex) {
  const input = node.inputs?.[inputIndex]
  if (!input || input.link == null) return null
  const link = graph.links[input.link]
  if (!link) return null
  const upstream = graph.getNodeById(link.origin_id)
  if (!upstream) return null
  return {
    input,
    link,
    upstream,
    upstreamOutput: upstream.outputs?.[link.origin_slot],
  }
}

function getNodeOutputPreview(node, outputIndex = 0) {
  const def = getDefinition(node)
  const lab = getLab(node)
  const currentOutput = lab.outputValues?.[outputIndex] ?? lab.output
  if (currentOutput !== undefined && currentOutput !== null && currentOutput !== '') {
    return stringifyPreview(currentOutput)
  }

  if (def === nodeTypes.customer) {
    return lab.input
  }
  if (def === nodeTypes.catalogDb) {
    return lab.db || state.config.catalogText
  }
  if (def === nodeTypes.tries) {
    const dbSource = readConnectedInput(node, 0) || lab.db
    return dbSource ? compressDb(dbSource) : ''
  }
  if (def === nodeTypes.searchLlm) {
    return ''
  }
  if (def === nodeTypes.inputHook) {
    return stringifyPreview(guardInput(String(readConnectedInput(node, 0) || lab.input)))
  }
  if (def === nodeTypes.persona) {
    return lab.logic
  }
  if (def === nodeTypes.outputHook) {
    return stringifyPreview(guardOutput(String(readConnectedInput(node, 0) || lab.input)))
  }

  return lab.output || lab.input || lab.db || lab.logic || ''
}

function getConnectedInputPreview(node, inputIndex) {
  const info = getIncomingLinkInfo(node, inputIndex)
  if (!info) return ''
  const fromLab = getLab(info.upstream)
  const toLab = getLab(node)
  const preview = trimPreview(getNodeOutputPreview(info.upstream, info.link.origin_slot))
  if (!preview) return ''
  return [
    `[연결 프리뷰] ${fromLab.name}.${info.upstreamOutput?.name || `output ${info.link.origin_slot}`} -> ${toLab.name}.${info.input.name}`,
    '',
    preview,
  ].join('\n')
}

function findDbInputIndex(node) {
  const inputs = node.inputs || []
  const objectIndex = inputs.findIndex((input) => {
    const name = String(input.name || '').toLowerCase()
    const type = String(input.type || '').toLowerCase()
    return type.includes('object') || name.includes('db') || name.includes('context') || name.includes('search')
  })
  if (objectIndex >= 0) return objectIndex
  return inputs.length > 1 ? 1 : 0
}

function syncInspectorPlaceholders(node) {
  if (!node) {
    elements.input.placeholder = ''
    elements.db.placeholder = ''
    elements.logic.placeholder = ''
    elements.output.placeholder = ''
    return
  }

  const inputHint = getConnectedInputHint(node, 0)
  const dbHint = getConnectedInputHint(node, findDbInputIndex(node))
  elements.input.placeholder = inputHint ? `연결됨: ${inputHint}` : '미연결이면 여기에 직접 입력'
  elements.db.placeholder = dbHint ? `연결됨: ${dbHint}` : 'DB/context 또는 .py/model 이름'
  elements.logic.placeholder = '함수 로직, LLM 지시문, 또는 .py 코드'
  elements.output.placeholder = '실행 결과'
}

function renderCombinerPanel(node) {
  const isCombiner = node && getDefinition(node) === nodeTypes.textCombiner
  elements.combinerPanel.hidden = !isCombiner
  if (!isCombiner) {
    elements.combinerInputs.innerHTML = ''
    return
  }

  const lab = normalizeCombinerState(node)
  const values = getCombinerInputValues(node)
  elements.combinerCount.textContent = `${lab.inputCount} inputs`
  elements.combinerOrder.value = lab.db || ''
  elements.combinerSeparator.value = encodeSeparator(decodeSeparator(lab.logic || ''))
  elements.combinerInputs.innerHTML = values
    .map((value, index) => {
      const connected = hasConnectedInput(node, index)
      const incoming = connected ? getConnectedInputHint(node, index) : ''
      if (connected) {
        return `
          <div class="combiner-row connected-row">
            <div class="combiner-row-head">
              <span>IN ${index + 1}</span>
              <small>${escapeHtml(incoming)}</small>
            </div>
            <div class="connected-preview" title="${escapeHtml(stringifyPreview(value))}">
              ${escapeHtml(compactPreview(value) || '(empty)')}
            </div>
          </div>
        `
      }
      return `
        <label class="combiner-row">
          <div class="combiner-row-head">
            <span>IN ${index + 1}</span>
            <small>manual</small>
          </div>
          <textarea class="code" data-combiner-index="${index}" rows="1" wrap="soft" spellcheck="false" data-min-rows="1" data-max-rows="5">${escapeHtml(value)}</textarea>
        </label>
      `
    })
    .join('')
  updateTextCombinerOutput(node)
  autoSizeInspectorTextareas()
}

function syncInspectorLabels(def) {
  elements.inputLabel.textContent = 'input'
  elements.dbLabel.textContent = 'DB / context'
  elements.logicLabel.textContent = 'logic / code'
  elements.outputLabel.textContent = 'output'
  if (def === nodeTypes.textCombiner) {
    elements.inputLabel.textContent = 'manual input'
    elements.dbLabel.textContent = 'order'
    elements.logicLabel.textContent = 'separator'
    elements.outputLabel.textContent = 'output realtime'
  }
  if (def === nodeTypes.functionNode) {
    elements.dbLabel.textContent = '.py file'
    elements.logicLabel.textContent = 'logic / memo'
  }
  if (def === nodeTypes.llmModel) {
    elements.inputLabel.textContent = 'prompt input'
    elements.dbLabel.textContent = 'model'
    elements.logicLabel.textContent = 'instruction'
  }
}

function syncFieldVisibility(def) {
  const isCombiner = def === nodeTypes.textCombiner
  const isRawLlm = def === nodeTypes.llmModel
  elements.inputField.hidden = isCombiner
  elements.dbField.hidden = isCombiner
  elements.logicField.hidden = isCombiner || isRawLlm
  elements.outputField.hidden = false
}

function syncTextareaDensity(def) {
  setTextareaDensity(elements.input, 1, def === nodeTypes.llmModel ? 8 : 5)
  setTextareaDensity(elements.db, 1, 3)
  setTextareaDensity(elements.logic, def === nodeTypes.llmModel ? 2 : 1, 8)
  setTextareaDensity(elements.output, def === nodeTypes.textCombiner ? 2 : 3, 12)
}

function syncInspectorToggles(disabled) {
  elements.nodeMeta.hidden = disabled || !state.showNodeMeta
  elements.nodeForm.hidden = disabled || !state.showNodeDetails
  elements.toggleMeta.disabled = disabled
  elements.toggleDetails.disabled = disabled
  elements.toggleMeta.textContent = state.showNodeMeta ? 'IO 닫기' : 'IO'
  elements.toggleDetails.textContent = state.showNodeDetails ? '세부 닫기' : '세부'
}

function renderInspector() {
  const node = state.selectedNode
  const disabled = !node
  ;[
    elements.name,
    elements.input,
    elements.db,
    elements.logic,
    elements.output,
    elements.testNode,
    elements.runNode,
    elements.applyNode,
    elements.toggleMeta,
    elements.toggleDetails,
    elements.combinerPlus,
    elements.combinerMinus,
    elements.combinerOrder,
    elements.combinerSeparator,
  ].forEach((item) => {
    item.disabled = disabled
  })

  if (!node) {
    elements.nodeTitle.textContent = '노드 선택'
    elements.nodeCaption.textContent = '캔버스에서 노드를 선택하세요.'
    elements.nodeMeta.innerHTML = ''
    elements.name.value = ''
    elements.kind.value = ''
    elements.input.value = ''
    elements.db.value = ''
    elements.logic.value = ''
    elements.output.value = ''
    syncInspectorPlaceholders(null)
    renderCombinerPanel(null)
    syncInspectorLabels(null)
    syncFieldVisibility(null)
    syncTextareaDensity(null)
    syncInspectorToggles(true)
    autoSizeInspectorTextareas()
    return
  }

  const def = getDefinition(node)
  const lab = getLab(node)
  syncInspectorLabels(def)
  syncFieldVisibility(def)
  syncTextareaDensity(def)
  syncInspectorToggles(false)
  elements.nodeTitle.textContent = lab.name || node.title || def.title
  elements.nodeCaption.textContent = `${lab.kind} · IN ${(node.inputs || []).length} -> OUT ${(node.outputs || []).length}`
  elements.name.value = lab.name || node.title
  elements.kind.value = lab.kind
  elements.input.value = lab.input || ''
  elements.db.value = lab.db || ''
  elements.logic.value = lab.logic || ''
  elements.output.value = state.isolatedPreview?.nodeId === node.id ? state.isolatedPreview.output : lab.output || ''
  elements.testNode.textContent =
    getDefinition(node) === nodeTypes.functionNode && state.isolatedAutoNodeId === node.id
      ? '격리 중지'
      : '격리 테스트'
  elements.nodeMeta.innerHTML = [
    ...(node.inputs || def.inputs || []).map((input) => `<span class="pill ${input.required ? 'required' : ''}">IN ${escapeHtml(input.name)} : ${escapeHtml(input.type)}</span>`),
    ...(node.outputs || def.outputs || []).map((output) => `<span class="pill">OUT ${escapeHtml(output.name)} : ${escapeHtml(output.type)}</span>`),
  ].join('')
  syncInspectorPlaceholders(node)
  renderCombinerPanel(node)
  autoSizeInspectorTextareas()
  graphCanvas.setDirty(true, true)
}

function applyInspectorToNode(options = {}) {
  const node = state.selectedNode
  if (!node) return
  const includeOutput = options.includeOutput !== false
  const lab = getLab(node)
  lab.name = elements.name.value.trim() || lab.name
  lab.input = elements.input.value
  lab.db = elements.db.value
  lab.logic = elements.logic.value
  if (getDefinition(node) === nodeTypes.textCombiner) {
    lab.db = elements.combinerOrder.value
    lab.logic = elements.combinerSeparator.value
    updateTextCombinerOutput(node, { render: false })
  }
  const isPreviewOutput = state.isolatedPreview?.nodeId === node.id && elements.output.value === state.isolatedPreview.output
  if (includeOutput && !isPreviewOutput) {
    lab.output = elements.output.value
  }
  node.title = lab.name
  graphCanvas.setDirty(true, true)
  if (options.render !== false) {
    renderInspector()
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

function readConnectedInput(node, inputIndex) {
  const input = node.inputs?.[inputIndex]
  if (!input || input.link == null) return ''
  const link = graph.links[input.link]
  if (!link) return ''
  const upstream = graph.getNodeById(link.origin_id)
  if (!upstream) return ''
  const upstreamLab = getLab(upstream)
  const value = upstreamLab.outputValues?.[link.origin_slot] ?? upstreamLab.output ?? ''
  if (value && typeof value === 'object') {
    if (typeof value.nextInput === 'string') return value.nextInput
    if (typeof value.safeAnswer === 'string') return value.safeAnswer
    if (typeof value.answer === 'string') return value.answer
  }
  return value
}

function hasConnectedInput(node, inputIndex) {
  const input = node.inputs?.[inputIndex]
  return Boolean(input && input.link != null && graph.links[input.link])
}

function readNodeInput(node, inputIndex, manualValue = '') {
  if (hasConnectedInput(node, inputIndex)) {
    return readConnectedInput(node, inputIndex)
  }
  return manualValue
}

function requireNodeInput(node, inputIndex, manualValue, label) {
  const value = readNodeInput(node, inputIndex, manualValue)
  const isMissing =
    value === undefined ||
    value === null ||
    (typeof value === 'string' && value.trim() === '')
  if (isMissing) {
    throw new Error(`${label} input is required. Connect a node or type a manual value.`)
  }
  return value
}

function decodeSeparator(value) {
  return String(value ?? '').replace(/\\n/g, '\n').replace(/\\t/g, '\t')
}

function encodeSeparator(value) {
  return String(value ?? '').replace(/\t/g, '\\t').replace(/\n/g, '\\n')
}

function parseCombinerOrder(orderText, count) {
  const parsed = String(orderText || '')
    .split(/[,\s>+-]+/)
    .map((item) => Number.parseInt(item, 10))
    .filter((item) => Number.isInteger(item) && item >= 1 && item <= count)
  const unique = [...new Set(parsed)]
  return unique.length ? unique : Array.from({ length: count }, (_, index) => index + 1)
}

function normalizeCombinerState(node) {
  const lab = getLab(node)
  const count = Math.max(1, Number.parseInt(lab.inputCount || node.inputs?.length || 1, 10))
  lab.inputCount = count
  if (!Array.isArray(lab.combinerInputs)) lab.combinerInputs = []
  while (lab.combinerInputs.length < count) lab.combinerInputs.push('')
  if (lab.combinerInputs.length > count) lab.combinerInputs = lab.combinerInputs.slice(0, count)
  if (!lab.db) lab.db = Array.from({ length: count }, (_, index) => index + 1).join(',')
  if (lab.logic === undefined || lab.logic === null) lab.logic = '\\n'
  syncTextCombinerPorts(node, count)
  return lab
}

function syncTextCombinerPorts(node, count) {
  if (!node || getDefinition(node) !== nodeTypes.textCombiner) return
  while ((node.inputs?.length || 0) < count) {
    node.addInput(String((node.inputs?.length || 0) + 1), 'txt')
  }
  while ((node.inputs?.length || 0) > count) {
    if (typeof node.removeInput === 'function') {
      node.removeInput(node.inputs.length - 1)
    } else {
      node.inputs.pop()
    }
  }
  ;(node.inputs || []).forEach((input, index) => {
    input.name = String(index + 1)
    input.type = 'txt'
  })
  node.size = [270, Math.max(132, 94 + count * 22)]
}

function getCombinerInputValues(node) {
  const lab = normalizeCombinerState(node)
  return Array.from({ length: lab.inputCount }, (_, index) => {
    if (hasConnectedInput(node, index)) {
      const connected = readConnectedInput(node, index)
      if (connected !== undefined && connected !== null && String(connected) !== '') {
        return String(connected)
      }
      const info = getIncomingLinkInfo(node, index)
      if (info?.upstream) {
        return String(getNodeOutputPreview(info.upstream, info.link.origin_slot) || '')
      }
      return ''
    }
    return String(lab.combinerInputs[index] ?? '')
  })
}

function composeTextCombiner(node) {
  const lab = normalizeCombinerState(node)
  const values = getCombinerInputValues(node)
  const order = parseCombinerOrder(lab.db, lab.inputCount)
  const separator = decodeSeparator(lab.logic || '')
  return order
    .map((inputNumber) => values[inputNumber - 1] || '')
    .filter((value) => value !== '')
    .join(separator)
}

function updateTextCombinerOutput(node, options = {}) {
  if (!node || getDefinition(node) !== nodeTypes.textCombiner) return ''
  const output = composeTextCombiner(node)
  const lab = getLab(node)
  lab.output = output
  lab.outputValues = [output]
  node.setOutputData(0, output)
  if (state.selectedNode === node && options.render !== false) {
    elements.output.value = output
    autoSizeTextarea(elements.output)
  }
  graphCanvas.setDirty(true, true)
  return output
}

function runFunctionText(fileName, input, logic = '') {
  const name = String(fileName || 'identity.py').trim()
  const value = String(input ?? '')
  const lower = name.toLowerCase()

  if (lower.includes('json_pretty')) {
    const parsed = JSON.parse(value)
    return JSON.stringify(parsed, null, 2)
  }
  if (lower.includes('uppercase')) return value.toUpperCase()
  if (lower.includes('lowercase')) return value.toLowerCase()
  if (lower.includes('trim')) return value.trim()
  if (lower.includes('keywords')) {
    return extractKeywords(value).map((keyword) => `《${keyword}》`).join('') || '《》'
  }
  if (logic.trim()) {
    return [
      `[${name}]`,
      logic.trim(),
      '',
      '[input]',
      value,
    ].join('\n')
  }
  return value
}

function formatLlmDebug({ title, inputMap, prompt, rawReply, parsed, outputValue }) {
  return [
    `[${title}]`,
    '',
    '[NODE INPUTS]',
    ...Object.entries(inputMap || {}).map(([key, value]) => `${key}: ${stringifyPreview(value) || '(empty)'}`),
    '',
    '[OUT]',
    stringifyPreview(outputValue),
    '',
    '[RAW LLM]',
    rawReply || '(empty)',
    '',
    '[PARSED]',
    JSON.stringify(parsed || {}, null, 2),
    '',
    '[PROMPT]',
    prompt || '',
  ].join('\n')
}

function formatNodeError(title, error, inputMap = {}) {
  return [
    `[${title}]`,
    '',
    '[ERROR]',
    error?.message || String(error),
    '',
    '[NODE INPUTS]',
    ...Object.entries(inputMap).map(([key, value]) => `${key}: ${stringifyPreview(value) || '(empty)'}`),
  ].join('\n')
}

function writeNodeOutput(node, output, values = [output], options = {}) {
  const serialized = typeof output === 'string' ? output : JSON.stringify(output, null, 2)
  state.runTrace.push({
    nodeId: node.id,
    nodeType: node.type,
    nodeName: getLab(node).name,
    commit: options.commit !== false,
    output: trimPreview(serialized, 1200),
    values: values.map((value) => trimPreview(stringifyPreview(value), 800)),
  })
  elements.logLine.dataset.trace = JSON.stringify(state.runTrace)
  if (options.commit === false) {
    state.isolatedPreview = {
      nodeId: node.id,
      output: serialized,
      values,
    }
    if (state.selectedNode === node) {
      elements.output.value = serialized
    }
    graphCanvas.setDirty(true, true)
    return
  }

  const lab = getLab(node)
  if (state.isolatedPreview?.nodeId === node.id) {
    state.isolatedPreview = null
  }
  lab.output = serialized
  lab.outputValues = values
  values.forEach((value, index) => node.setOutputData(index, value))
  if (state.selectedNode === node) {
    renderInspector()
  }
  graphCanvas.setDirty(true, true)
}

function parseList(text) {
  return String(text || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
}

function extractKeywords(text) {
  const bracketed = [...String(text || '').matchAll(/《([^》]*)》/g)].map((match) => match[1].trim()).filter(Boolean)
  if (bracketed.length) return bracketed.slice(0, 5)
  return String(text || '')
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .split(/\s+/)
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 5)
}

function normalizeQuery(text) {
  return String(text || '')
    .replace(/포카/g, '포토카드')
    .replace(/\s+/g, ' ')
    .trim()
}

function guardInput(text) {
  const hardBlocks = ['access_token', 'refresh_token']
  const forbidden = [...parseList(state.config.inputForbidden), ...hardBlocks]
  const matched = forbidden.filter((word) => word && text.toLowerCase().includes(word.toLowerCase()))
  return {
    ok: matched.length === 0,
    matched,
    nextInput: matched.length ? '' : text,
    fallback: matched.length ? state.config.fallback : '',
  }
}

function guardOutput(text) {
  const forbidden = parseList(state.config.outputForbidden)
  const matched = forbidden.filter((word) => word && text.toLowerCase().includes(word.toLowerCase()))
  return {
    ok: matched.length === 0,
    matched,
    safeAnswer: matched.length ? state.config.fallback : text,
    allowedActions: parseList(state.config.allowedActions),
  }
}

function parseDb(dbSource) {
  if (typeof dbSource === 'object' && dbSource !== null) return dbSource
  const text = String(dbSource || '')
  const lines = text.split(/\r?\n/).filter((line) => line.trim())
  if (!lines.length) return { headers: [], rows: [], raw: text }
  const delimiter = lines[0].includes('\t') ? '\t' : ','
  const headers = lines[0].split(delimiter).map((header) => header.trim())
  const rows = lines.slice(1).map((line, index) => {
    const cells = line.split(delimiter)
    const row = { _rowIndex: index + 2 }
    headers.forEach((header, cellIndex) => {
      row[header || `col_${cellIndex}`] = cells[cellIndex] || ''
    })
    row._raw = line
    return row
  })
  return { headers, rows, raw: text }
}

function compressDb(dbSource) {
  const db = parseDb(dbSource)
  if (!Array.isArray(db.rows) || !db.rows.length) {
    return String(db.raw || dbSource || '').split(/\r?\n/).slice(0, 80).join('\n')
  }
  const lines = []
  const buckets = new Map()
  db.rows.forEach((row) => {
    const artist = row.artist_name || row.artist || row.ARTIST || row.group_name || 'unknown'
    const goods = row.goods_name || row.goods || row.product_name || row.title || row._raw
    const category = row.category || row.goods_type || row.type || ''
    if (!buckets.has(artist)) buckets.set(artist, new Map())
    const artistMap = buckets.get(artist)
    const key = category || 'goods'
    if (!artistMap.has(key)) artistMap.set(key, [])
    artistMap.get(key).push(goods)
  })
  for (const [artist, categoryMap] of buckets) {
    lines.push(`${artist}`)
    for (const [category, goods] of categoryMap) {
      lines.push(`  ${category}: ${goods.slice(0, 8).join(', ')}`)
    }
  }
  return lines.slice(0, 120).join('\n')
}

function pickSearchKeywords(question, candidates) {
  const normalized = normalizeQuery(question)
  if (!normalized || /^(안녕|하이|hello|hi|오늘|뭐해)/i.test(normalized)) {
    return '《》'
  }
  const terms = []
  const candidateText = String(candidates || '')
  const source = `${normalized}\n${candidateText}`
  const knownWords = ['히에나', '세리나', '그룹 A', '포토카드', '아크릴', '거울', '앨범', '응원봉', 'Lightstick']
  knownWords.forEach((word) => {
    if (source.toLowerCase().includes(word.toLowerCase()) && normalized.toLowerCase().includes(word.toLowerCase())) {
      terms.push(word)
    }
  })
  if (/포토카드|포카/i.test(normalized) && !terms.includes('포토카드')) terms.push('포토카드')
  if (!terms.length) {
    extractKeywords(normalized).forEach((keyword) => terms.push(keyword))
  }
  return terms.slice(0, 5).map((keyword) => `《${keyword}》`).join('') || '《》'
}

function normalizeKeywordReply(rawReply) {
  const raw = String(rawReply || '').trim()
  if (!raw || /^null$/i.test(raw) || /^none$/i.test(raw) || raw === '《》') {
    return '《》'
  }
  const keywords = extractKeywords(raw)
  if (!keywords.length) return '《》'
  return keywords.slice(0, 5).map((keyword) => `《${keyword}》`).join('')
}

function parseSearchLlmReply(rawReply, question, candidates) {
  const rawKeywords = normalizeKeywordReply(rawReply)
  const deterministicFallback = pickSearchKeywords(question, candidates)
  if (rawKeywords === '《》' && deterministicFallback !== '《》') {
    return {
      keywords: deterministicFallback,
      keywordList: extractKeywords(deterministicFallback),
      rawKeywords,
      parserNote: 'RAW returned empty, recovered obvious keywords from question and candidate text.',
    }
  }
  return {
    keywords: rawKeywords,
    keywordList: extractKeywords(rawKeywords),
    rawKeywords,
    parserNote: '',
  }
}

function buildSearchLlmPrompt(question, candidates, logic) {
  return [
    'role:',
    '너는 쇼핑몰 상품 검색을 위한 오타 보정, 키워드 추출기이다.',
    '고객 질문에서 검색해야 할 핵심 키워드만 뽑는다.',
    '고객의 의도를 읽고, 반환은 단어의 오타만 확인한다.',
    '후보 목록이 있으면 후보 목록 안의 단어/구를 우선 선택한다.',
    '고객에게 답변하지 않는다.',
    '출력은 5건 이하의 키워드만 반환한다.',
    '검색할 필요가 없으면 설명하지 말고 빈 괄호 《》만 출력한다.',
    '',
    '출력 형식:',
    '《키워드1》《키워드2》',
    '',
    '[노드 logic]',
    String(logic || '').trim() || '(없음)',
    '',
    '[고객 질문]',
    String(question || '').trim(),
    '',
    '[후보 목록]',
    String(candidates || '').trim() || '(후보 없음)',
  ].join('\n')
}

function summarizeSearchObjectForPrompt(searchObject) {
  const value = typeof searchObject === 'string' ? safeJson(searchObject) || searchObject : searchObject
  if (!value || typeof value !== 'object') {
    return String(value || '(검색 결과 없음)')
  }
  const compact = {
    source: value.source,
    query: value.query,
    keywords: value.keywords,
    results: Array.isArray(value.results) ? value.results.slice(0, 8) : value.results,
    artistResults: Array.isArray(value.artistResults) ? value.artistResults.slice(0, 5) : value.artistResults,
    coordinateContextJsonl: value.coordinateContextJsonl || '',
  }
  return JSON.stringify(compact, null, 2)
}

function buildVoiceLlmPrompt(question, searchObject, persona, logic) {
  return [
    '[응대 LLM 역할]',
    String(persona || '').trim() || '너는 쇼핑몰을 차린 히에나다. 고객에게 친근하게 상품을 추천한다.',
    '',
    '[노드 logic]',
    String(logic || '').trim() || '(없음)',
    '',
    '[고객 질문]',
    String(question || '').trim(),
    '',
    '[DB 검색 결과 / 우뇌에 보낼 근거]',
    summarizeSearchObjectForPrompt(searchObject),
    '',
    '[출력 규칙]',
    '- 검색 결과에 있는 내용만 근거로 말한다.',
    '- 재고 수량과 토큰 값은 직접 말하지 않는다.',
    '- 고객에게 보여줄 말은 우뇌 섹션에만 쓴다.',
    '- 모션 판단은 소뇌 섹션에 JSON으로 쓴다.',
    '',
    '반드시 아래 2개 섹션만 출력한다.',
    '',
    '우뇌:',
    '고객에게 보여줄 최종 답변',
    '',
    '소뇌:',
    '{"emotion":"bright","motion":"point_goods","face":"smile","intensity":0.6,"duration":"short"}',
  ].join('\n')
}

function parseBrainReply(rawReply) {
  const raw = String(rawReply || '').trim()
  const sections = { right: '', cerebellum: '' }
  const matches = [...raw.matchAll(/(?:^|\n)\s*(우뇌|소뇌)\s*:\s*/g)]
  if (!matches.length) {
    sections.right = raw
    return sections
  }
  matches.forEach((match, index) => {
    const label = match[1]
    const start = match.index + match[0].length
    const end = index + 1 < matches.length ? matches[index + 1].index : raw.length
    const value = raw.slice(start, end).trim()
    if (label === '우뇌') sections.right = value
    if (label === '소뇌') sections.cerebellum = value
  })
  if (!sections.right) sections.right = raw
  return sections
}

function parseMotionSeed(cerebellum, answer) {
  const text = String(cerebellum || '').trim()
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (jsonMatch) {
    try {
      return JSON.stringify(JSON.parse(jsonMatch[0]))
    } catch {
      return text
    }
  }
  return text || JSON.stringify(buildMotion(answer))
}

function localSearch(query, dbSource) {
  const keywords = extractKeywords(normalizeQuery(query))
  const db = parseDb(dbSource || state.config.catalogText)
  const rows = Array.isArray(db.rows) && db.rows.length
    ? db.rows
    : String(db.raw || dbSource || '')
        .split(/\r?\n/)
        .filter(Boolean)
        .map((line, index) => ({ _rowIndex: index + 1, _raw: line, text: line }))

  const scored = rows
    .map((row) => {
      const haystack = JSON.stringify(row).toLowerCase()
      const score = keywords.reduce((total, keyword) => total + (haystack.includes(keyword.toLowerCase()) ? 1 : 0), 0)
      return { row, score }
    })
    .filter((item) => item.score > 0 || !keywords.length)
    .sort((a, b) => b.score - a.score)
    .slice(0, 8)

  const results = scored.map((item) => item.row)
  const coordinateContext = results.flatMap((row) => {
    const columns = Object.fromEntries(Object.entries(row).filter(([key]) => !key.startsWith('_')))
    return [
      { axis: 'row', rowIndex: row._rowIndex || null, row },
      { axis: 'columns', rowIndex: row._rowIndex || null, columns },
    ]
  })

  return {
    source: 'local-search',
    query,
    keywords,
    results,
    artistResults: [],
    coordinateContext,
    coordinateContextJsonl: coordinateContext.map((item) => JSON.stringify(item)).join('\n'),
  }
}

async function remoteSearch(query) {
  const response = await fetch('/api/admin/db-search', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query }),
  })
  const payload = await response.json().catch(() => ({}))
  if (!response.ok || payload.ok === false) {
    throw new Error(payload.error || `HTTP ${response.status}`)
  }
  const search = payload.search || {}
  return {
    source: 'api:/api/admin/db-search',
    query: payload.query || query,
    keywords: payload.keywords || extractKeywords(query),
    results: search.results || [],
    artistResults: search.artistResults || [],
    coordinateContext: search.coordinateContext || [],
    coordinateContextJsonl: search.coordinateContextJsonl || '',
  }
}

function buildVoiceAnswer(question, searchObject, persona) {
  const data = typeof searchObject === 'string' ? safeJson(searchObject) : searchObject
  const results = data?.results || []
  const first = results[0] || {}
  const name = first.goods_name || first.product_name || first.title || first._raw || ''
  const hasResult = results.length > 0
  const answer = hasResult
    ? `찾아봤어. ${name || '조건에 맞는 상품'} 쪽으로 먼저 보여줄게. 더 좁혀볼까?`
    : '지금 조건으로는 바로 보여줄 상품 근거가 부족해. 아티스트나 굿즈 종류를 조금 더 말해줄래?'
  return {
    persona: String(persona || '').split(/\r?\n/).slice(0, 4).join('\n'),
    question,
    answer,
    action: hasResult ? 'show_goods' : 'ask_followup',
    grounded: hasResult,
  }
}

function buildMotion(answer) {
  const text = typeof answer === 'string' ? answer : JSON.stringify(answer)
  const isAsk = /말해줄래|좁혀|물어/.test(text)
  const isShow = /보여|찾아/.test(text)
  return {
    emotion: isAsk ? 'curious' : 'bright',
    motion: isShow ? 'point_goods' : 'thinking',
    face: isAsk ? 'soft_smile' : 'smile',
    intensity: isShow ? 0.72 : 0.48,
    duration: 'short',
  }
}

function safeJson(text) {
  try {
    return JSON.parse(text)
  } catch {
    return null
  }
}

function validateDigitKeyShape(key, mask = digitKeyMask) {
  const value = String(key || '').trim()
  if (value.length !== mask.length) {
    throw new Error(`digit key length mismatch: expected ${mask.length}, got ${value.length}`)
  }
  for (let index = 0; index < mask.length; index += 1) {
    const maskChar = mask[index]
    const keyChar = value[index]
    if (maskChar === '.') {
      if (keyChar !== '.') {
        throw new Error(`digit key decimal point mismatch at ${index}`)
      }
      continue
    }
    if (!/\d/.test(keyChar)) {
      throw new Error(`digit key must contain only digits except decimal point at ${index}`)
    }
  }
  return value
}

function bytesToBase64Url(bytes) {
  let binary = ''
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte)
  })
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '')
}

function base64UrlToBytes(text) {
  const base64 = String(text || '').replace(/-/g, '+').replace(/_/g, '/')
  const padded = `${base64}${'='.repeat((4 - (base64.length % 4)) % 4)}`
  const binary = atob(padded)
  const bytes = new Uint8Array(binary.length)
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index)
  }
  return bytes
}

async function deriveTokenKey(keyText, mask = digitKeyMask) {
  const normalizedKey = validateDigitKeyShape(keyText, mask)
  const password = new TextEncoder().encode(`digit-token-store-v1:${normalizedKey}`)
  return globalThis.crypto.subtle.importKey('raw', password, 'PBKDF2', false, ['deriveBits'])
}

async function deriveTokenStoreKeys(keyText, salt, mask = digitKeyMask) {
  const baseKey = await deriveTokenKey(keyText, mask)
  const bits = await globalThis.crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt, iterations: 200000, hash: 'SHA-256' },
    baseKey,
    512
  )
  const material = new Uint8Array(bits)
  return {
    encKey: material.slice(0, 32),
    macKey: material.slice(32),
  }
}

function concatBytes(...parts) {
  const length = parts.reduce((sum, part) => sum + part.length, 0)
  const output = new Uint8Array(length)
  let offset = 0
  parts.forEach((part) => {
    output.set(part, offset)
    offset += part.length
  })
  return output
}

async function sha256Bytes(bytes) {
  return new Uint8Array(await globalThis.crypto.subtle.digest('SHA-256', bytes))
}

function counterBytes(counter) {
  const bytes = new Uint8Array(8)
  new DataView(bytes.buffer).setBigUint64(0, BigInt(counter), false)
  return bytes
}

async function xorWithSha256Stream(data, key, nonce) {
  const stream = []
  let total = 0
  let counter = 0
  while (total < data.length) {
    const block = await sha256Bytes(concatBytes(key, nonce, counterBytes(counter)))
    stream.push(block)
    total += block.length
    counter += 1
  }
  const streamBytes = concatBytes(...stream)
  return data.map((byte, index) => byte ^ streamBytes[index])
}

async function hmacSha256(keyBytes, dataBytes) {
  const key = await globalThis.crypto.subtle.importKey(
    'raw',
    keyBytes,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )
  return new Uint8Array(await globalThis.crypto.subtle.sign('HMAC', key, dataBytes))
}

function equalBytes(left, right) {
  if (left.length !== right.length) return false
  let diff = 0
  for (let index = 0; index < left.length; index += 1) {
    diff |= left[index] ^ right[index]
  }
  return diff === 0
}

function parsePlainTokenPayload(text) {
  const value = String(text || '')
  const parsed = safeJson(value)
  return parsed == null ? value : parsed
}

async function encryptTokenText(plainText, keyText, mask = digitKeyMask) {
  const scheme = 'digit-key-xor-sha256-hmac-v1'
  const salt = globalThis.crypto.getRandomValues(new Uint8Array(16))
  const nonce = globalThis.crypto.getRandomValues(new Uint8Array(16))
  const { encKey, macKey } = await deriveTokenStoreKeys(keyText, salt, mask)
  const rawPayload = parsePlainTokenPayload(plainText)
  const encoded = new TextEncoder().encode(JSON.stringify(rawPayload))
  const ciphertext = await xorWithSha256Stream(encoded, encKey, nonce)
  const signed = concatBytes(new TextEncoder().encode(scheme), salt, nonce, ciphertext)
  const tag = await hmacSha256(macKey, signed)
  return JSON.stringify({
    protected: true,
    scheme,
    key_mask: mask,
    salt: bytesToBase64Url(salt),
    nonce: bytesToBase64Url(nonce),
    ciphertext: bytesToBase64Url(ciphertext),
    tag: bytesToBase64Url(tag),
  })
}

async function decryptTokenText(payloadText, keyText, mask = digitKeyMask) {
  const payload = JSON.parse(String(payloadText || ''))
  if (payload.protected !== true) {
    return JSON.stringify(payload)
  }
  if (payload.scheme !== 'digit-key-xor-sha256-hmac-v1') {
    throw new Error(`unsupported token store scheme: ${payload.scheme || 'missing'}`)
  }
  const keyMask = payload.key_mask || mask
  const salt = base64UrlToBytes(payload.salt)
  const nonce = base64UrlToBytes(payload.nonce)
  const ciphertext = base64UrlToBytes(payload.ciphertext)
  const expectedTag = base64UrlToBytes(payload.tag)
  const { encKey, macKey } = await deriveTokenStoreKeys(keyText, salt, keyMask)
  const signed = concatBytes(new TextEncoder().encode(payload.scheme), salt, nonce, ciphertext)
  const actualTag = await hmacSha256(macKey, signed)
  if (!equalBytes(actualTag, expectedTag)) {
    throw new Error('protected OAuth token store password mismatch')
  }
  const plaintext = await xorWithSha256Stream(ciphertext, encKey, nonce)
  const decoded = new TextDecoder().decode(plaintext)
  const parsed = safeJson(decoded)
  return typeof parsed === 'string' ? parsed : JSON.stringify(parsed, null, 2)
}

function parseTokenGuardSettings(logic) {
  const parsed = safeJson(logic)
  if (!parsed || typeof parsed !== 'object') {
    return {
      mode: 'roundtrip',
      scheme: 'digit-key-xor-sha256-hmac-v1',
      keyMask: digitKeyMask,
      testKey: piTestKey,
      showRecovered: true,
    }
  }
  return {
    mode: parsed.mode || 'roundtrip',
    scheme: 'digit-key-xor-sha256-hmac-v1',
    keyMask: parsed.keyMask || digitKeyMask,
    testKey: parsed.testKey || piTestKey,
    showRecovered: parsed.showRecovered !== false,
  }
}

function maskSecretText(text) {
  const value = String(text || '')
  if (!value) return ''
  if (value.length <= 8) return '*'.repeat(value.length)
  return `${value.slice(0, 4)}...${value.slice(-4)} (${value.length} chars)`
}

async function runTokenGuard(lab, sourceText) {
  const settings = parseTokenGuardSettings(lab.logic)
  const mode = String(settings.mode || 'roundtrip').toLowerCase()
  const key = validateDigitKeyShape(settings.testKey, settings.keyMask)
  const input = String(sourceText || lab.input || '')

  if (mode === 'encrypt') {
    const encrypted = await encryptTokenText(input, key, settings.keyMask)
    return {
      display: encrypted,
      values: [encrypted, { mode, scheme: settings.scheme, keyMask: settings.keyMask, encrypted }],
    }
  }

  if (mode === 'decrypt') {
    const recovered = await decryptTokenText(input, key, settings.keyMask)
    const report = {
      mode,
      scheme: settings.scheme,
      keyMask: settings.keyMask,
      recovered: settings.showRecovered ? recovered : maskSecretText(recovered),
      recoveredLength: recovered.length,
    }
    return {
      display: JSON.stringify(report, null, 2),
      values: [recovered, report],
    }
  }

  const encrypted = await encryptTokenText(input, key, settings.keyMask)
  const recovered = await decryptTokenText(encrypted, key, settings.keyMask)
  const report = {
    mode: 'roundtrip',
    scheme: settings.scheme,
    keyMask: settings.keyMask,
    keyShape: `${settings.keyMask.length} chars`,
    encrypted,
    recovered: settings.showRecovered ? recovered : maskSecretText(recovered),
    recoveredLength: recovered.length,
    ok: recovered === input,
  }
  return {
    display: JSON.stringify(report, null, 2),
    values: [encrypted, report],
  }
}

async function runNode(node, options = {}) {
  if (!node) return
  const commit = options.commit !== false
  if (state.selectedNode === node) {
    applyInspectorToNode({ includeOutput: false, render: false })
  }
  const def = getDefinition(node)
  const lab = getLab(node)
  setStatus(commit ? `running ${lab.name}` : `isolated test ${lab.name}`)

  if (def === nodeTypes.textCombiner) {
    const output = updateTextCombinerOutput(node)
    writeNodeOutput(node, output, [output], { commit })
  } else if (def === nodeTypes.functionNode) {
    const input = String(readNodeInput(node, 0, lab.input))
    try {
      const output = runFunctionText(lab.db, input, lab.logic)
      writeNodeOutput(
        node,
        [
          `[Function Node] ${lab.db || 'identity.py'}`,
          '',
          '[INPUT]',
          input,
          '',
          '[OUTPUT]',
          output,
        ].join('\n'),
        [output],
        { commit }
      )
    } catch (error) {
      writeNodeOutput(node, formatNodeError(`Function Node ${lab.db || ''}`, error, { input }), [''], { commit })
      setStatus(`function failed ${lab.name}: ${error.message}`)
      return
    }
  } else if (def === nodeTypes.llmModel) {
    const input = String(readNodeInput(node, 0, lab.input))
    try {
      if (!input.trim()) {
        throw new Error('prompt input is required. Connect a node or type a manual value.')
      }
      const rawReply = await callOAuthChat(input)
      writeNodeOutput(node, rawReply, [rawReply], { commit })
    } catch (error) {
      writeNodeOutput(node, '', [''], { commit })
      setStatus(`LLM failed ${lab.name}: ${error.message}`)
      return
    }
  } else if (def === nodeTypes.customer) {
    const text = lab.input.trim()
    writeNodeOutput(node, text, [text], { commit })
  } else if (def === nodeTypes.inputHook) {
    const text = String(readNodeInput(node, 0, lab.input))
    const result = guardInput(text)
    writeNodeOutput(node, result, [result.ok ? result.nextInput : '', result], { commit })
  } else if (def === nodeTypes.catalogDb) {
    const dbText = lab.db.trim() || state.config.catalogText
    const db = parseDb(dbText)
    const summary = {
      type: 'catalog-db',
      rows: db.rows?.length || 0,
      columns: db.headers || [],
      preview: db.rows?.slice(0, 3) || String(dbText).split(/\r?\n/).slice(0, 6),
    }
    writeNodeOutput(node, summary, [dbText, dbText], { commit })
  } else if (def === nodeTypes.tries) {
    try {
      const dbSource = requireNodeInput(node, 0, lab.db, 'db object')
      const compressed = compressDb(dbSource)
      writeNodeOutput(node, compressed, [compressed], { commit })
    } catch (error) {
      writeNodeOutput(node, formatNodeError('Tries isolated/run', error, { db: lab.db }), [''], { commit })
      setStatus(`node failed ${lab.name}: ${error.message}`)
      return
    }
  } else if (def === nodeTypes.searchLlm) {
    const question = String(readNodeInput(node, 0, lab.input))
    const candidates = String(readNodeInput(node, 1, lab.db))
    const inputMap = {
      question,
      'candidate txt': candidates,
    }
    try {
      if (!question.trim()) {
        throw new Error('question input is required. Connect a node or type a manual value.')
      }
      const prompt = buildSearchLlmPrompt(question, candidates, lab.logic)
      const rawReply = await callOAuthChat(prompt)
      const parsed = parseSearchLlmReply(rawReply, question, candidates)
      writeNodeOutput(
        node,
        formatLlmDebug({
          title: '좌뇌 선택기 / oauth:/api/chat',
          inputMap,
          prompt,
          rawReply,
          parsed,
          outputValue: parsed.keywords,
        }),
        [parsed.keywords],
        { commit }
      )
    } catch (error) {
      writeNodeOutput(
        node,
        formatNodeError('좌뇌 선택기 / oauth:/api/chat', error, inputMap),
        ['《》'],
        { commit }
      )
      setStatus(`LLM failed ${lab.name}: ${error.message}`)
      return
    }
  } else if (def === nodeTypes.search) {
    let query = ''
    let dbSource = ''
    try {
      query = String(requireNodeInput(node, 0, lab.input, 'keywords')).trim()
      dbSource = requireNodeInput(node, 1, lab.db, 'DB object')
    } catch (error) {
      writeNodeOutput(
        node,
        formatNodeError('Search', error, {
          keywords: readNodeInput(node, 0, lab.input),
          'DB object': readNodeInput(node, 1, lab.db),
        }),
        [{ results: [], coordinateContextJsonl: '' }, ''],
        { commit }
      )
      setStatus(`node failed ${lab.name}: ${error.message}`)
      return
    }
    let result
    if (query === '《》') {
      result = {
        source: 'no-search',
        query,
        keywords: [],
        results: [],
        artistResults: [],
        coordinateContext: [],
        coordinateContextJsonl: '',
        dbInputPreview: trimPreview(dbSource),
      }
    } else try {
      result = await remoteSearch(query)
      result.dbInputPreview = trimPreview(dbSource)
    } catch (error) {
      result = localSearch(query, dbSource)
      result.remoteError = error.message
    }
    writeNodeOutput(node, result, [result, result.coordinateContextJsonl || ''], { commit })
  } else if (def === nodeTypes.persona) {
    const persona = lab.logic.trim()
    writeNodeOutput(node, persona, [persona], { commit })
  } else if (def === nodeTypes.voiceLlm) {
    const question = String(readNodeInput(node, 0, lab.input))
    const searchObject = readNodeInput(node, 1, lab.db)
    const persona = String(readNodeInput(node, 2, lab.logic))
    const inputMap = {
      question,
      'search object': searchObject,
      'persona txt': persona,
    }
    try {
      if (!question.trim()) {
        throw new Error('question input is required. Connect a node or type a manual value.')
      }
      if (
        searchObject === undefined ||
        searchObject === null ||
        (typeof searchObject === 'string' && !searchObject.trim())
      ) {
        throw new Error('search object input is required. Connect Search.result object or type a manual DB/search object.')
      }
      const prompt = buildVoiceLlmPrompt(question, searchObject, persona, lab.logic)
      const rawReply = await callOAuthChat(prompt)
      const brain = parseBrainReply(rawReply)
      const answer = brain.right || rawReply
      const motionSeed = parseMotionSeed(brain.cerebellum, answer)
      writeNodeOutput(
        node,
        formatLlmDebug({
          title: '우뇌 응대 / oauth:/api/chat',
          inputMap,
          prompt,
          rawReply,
          parsed: {
            rightBrain: answer,
            cerebellum: brain.cerebellum,
            motionSeed,
          },
          outputValue: answer,
        }),
        [answer, motionSeed],
        { commit }
      )
    } catch (error) {
      writeNodeOutput(
        node,
        formatNodeError('우뇌 응대 / oauth:/api/chat', error, inputMap),
        ['', JSON.stringify(buildMotion(''))],
        { commit }
      )
      setStatus(`LLM failed ${lab.name}: ${error.message}`)
      return
    }
  } else if (def === nodeTypes.outputHook) {
    const answer = String(readNodeInput(node, 0, lab.input))
    const result = guardOutput(answer)
    writeNodeOutput(node, result, [result.safeAnswer], { commit })
  } else if (def === nodeTypes.motion) {
    const answer = readNodeInput(node, 0, lab.input)
    const motion = buildMotion(answer)
    writeNodeOutput(node, motion, [motion], { commit })
  } else if (def === nodeTypes.tokenGuard) {
    const input = String(readNodeInput(node, 0, lab.input))
    const protectedResult = await runTokenGuard(lab, input)
    writeNodeOutput(node, protectedResult.display, protectedResult.values, { commit })
  } else if (def === nodeTypes.py) {
    const payload = {
      runtime: 'not-connected',
      code: lab.logic,
      input: lab.input,
      db: safeJson(lab.db) || lab.db,
      stdout: 'Python runner is intentionally not embedded in this UI shell.',
    }
    writeNodeOutput(node, payload, [payload.stdout, payload], { commit })
  }

  if (commit) {
    setStatus(`done ${lab.name}`)
    saveGraph()
  } else {
    setStatus(`isolated output ${lab.name}`)
  }
}

function getExecutionOrder() {
  const nodes = [...graph._nodes]
  const idToNode = new Map(nodes.map((node) => [node.id, node]))
  const indegree = new Map(nodes.map((node) => [node.id, 0]))
  const edges = new Map(nodes.map((node) => [node.id, []]))
  Object.values(graph.links || {}).forEach((link) => {
    if (!idToNode.has(link.origin_id) || !idToNode.has(link.target_id)) return
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
      if (indegree.get(targetId) === 0) queue.push(idToNode.get(targetId))
    })
  }
  return ordered.length === nodes.length ? ordered : nodes
}

async function runGraph() {
  setStatus('running graph')
  state.runTrace = []
  elements.logLine.dataset.trace = ''
  for (const node of getExecutionOrder()) {
    await runNode(node)
  }
  setStatus('graph complete')
}

function saveGraph() {
  window.localStorage.setItem(storageKey, JSON.stringify(graph.serialize()))
  updateCanvasChip()
}

function loadGraph() {
  const raw = window.localStorage.getItem(storageKey)
  if (!raw) {
    buildDefaultGraph()
    return
  }
  try {
    graph.configure(JSON.parse(raw))
    graph.start()
    updateCanvasChip()
    state.selectedNode = graph._nodes.find((node) => getDefinition(node) === nodeTypes.search) || graph._nodes[0] || null
    if (state.selectedNode) graphCanvas.selectNode(state.selectedNode)
    renderInspector()
  } catch {
    buildDefaultGraph()
  }
}

function addSelectedTypeNode() {
  const def = typeOptions.find((type) => type.path === elements.addType.value) || nodeTypes.customer
  const node = addNode(def, [100 - graphCanvas.ds.offset[0], 120 - graphCanvas.ds.offset[1]])
  if (def === nodeTypes.textCombiner) {
    normalizeCombinerState(node)
  }
  state.selectedNode = node
  graphCanvas.selectNode(node)
  renderInspector()
  saveGraph()
}

function stopIsolatedAutoTest() {
  if (state.isolatedAutoTimer) {
    window.clearInterval(state.isolatedAutoTimer)
  }
  state.isolatedAutoTimer = null
  state.isolatedAutoNodeId = null
  if (state.selectedNode) renderInspector()
}

function startFunctionAutoTest(node) {
  stopIsolatedAutoTest()
  state.isolatedAutoNodeId = node.id
  const tick = () => {
    if (!graph._nodes.includes(node)) {
      stopIsolatedAutoTest()
      return
    }
    runNode(node, { commit: false })
  }
  tick()
  state.isolatedAutoTimer = window.setInterval(tick, 1000)
  renderInspector()
}

function handleIsolatedTest() {
  const node = state.selectedNode
  if (!node) return
  const def = getDefinition(node)
  if (def === nodeTypes.functionNode) {
    if (state.isolatedAutoNodeId === node.id) {
      stopIsolatedAutoTest()
      setStatus(`auto test stopped ${getLab(node).name}`)
      return
    }
    startFunctionAutoTest(node)
    setStatus(`auto test ${getLab(node).name}`)
    return
  }
  stopIsolatedAutoTest()
  runNode(node, { commit: false })
}

async function loadConfig() {
  try {
    const response = await fetch('/api/admin/config')
    const config = await response.json()
    state.config.catalogText = config.treeTsv || config.catalogTsv || sampleCatalog
    state.config.inputForbidden = config.hooks?.inputForbidden || state.config.inputForbidden
    state.config.outputForbidden = config.hooks?.outputForbidden || state.config.outputForbidden
    state.config.allowedActions = config.hooks?.allowedActions || state.config.allowedActions
    state.config.fallback = config.hooks?.fallback || state.config.fallback
    graph._nodes.forEach((node) => {
      const def = getDefinition(node)
      const lab = getLab(node)
      if (def === nodeTypes.catalogDb && (!lab.db || lab.db === sampleCatalog)) {
        lab.db = state.config.catalogText
      }
      if (def === nodeTypes.inputHook) {
        lab.logic = `금지어: ${state.config.inputForbidden}\n하드 블록: access_token, refresh_token\n실패 시 LLM 호출을 막고 백업 응답으로 보낸다.`
      }
      if (def === nodeTypes.outputHook) {
        lab.logic = `금지어: ${state.config.outputForbidden}\nACTION 허용: ${state.config.allowedActions}\n백업 응답: ${state.config.fallback}`
      }
    })
    setStatus('config loaded')
    renderInspector()
  } catch (error) {
    setStatus(`local config: ${error.message}`)
  }
}

elements.applyNode.addEventListener('click', () => {
  applyInspectorToNode()
  saveGraph()
  setStatus('node applied')
})

elements.toggleMeta.addEventListener('click', () => {
  state.showNodeMeta = !state.showNodeMeta
  renderInspector()
})

elements.toggleDetails.addEventListener('click', () => {
  state.showNodeDetails = !state.showNodeDetails
  renderInspector()
})

elements.testNode.addEventListener('click', handleIsolatedTest)

elements.runNode.addEventListener('click', () => {
  runNode(state.selectedNode)
})

elements.oauthLogin.addEventListener('click', startOAuthLogin)
elements.runGraph.addEventListener('click', runGraph)
elements.addNode.addEventListener('click', addSelectedTypeNode)
elements.saveGraph.addEventListener('click', () => {
  applyInspectorToNode()
  saveGraph()
  setStatus('graph saved')
})
elements.resetGraph.addEventListener('click', () => {
  window.localStorage.removeItem(storageKey)
  buildDefaultGraph()
  saveGraph()
  setStatus('default graph')
})

;[elements.name, elements.input, elements.db, elements.logic, elements.output].forEach((field) => {
  field.addEventListener('input', () => {
    if (field instanceof HTMLTextAreaElement) {
      autoSizeTextarea(field)
    }
    if (field === elements.output && state.selectedNode && state.isolatedPreview?.nodeId === state.selectedNode.id) {
      state.isolatedPreview = null
    }
    applyInspectorToNode({ includeOutput: field === elements.output })
    saveGraph()
  })
})

elements.combinerPlus.addEventListener('click', () => {
  const node = state.selectedNode
  if (!node || getDefinition(node) !== nodeTypes.textCombiner) return
  const lab = normalizeCombinerState(node)
  lab.inputCount = Math.min(12, lab.inputCount + 1)
  lab.db = Array.from({ length: lab.inputCount }, (_, index) => index + 1).join(',')
  normalizeCombinerState(node)
  updateTextCombinerOutput(node)
  renderInspector()
  saveGraph()
})

elements.combinerMinus.addEventListener('click', () => {
  const node = state.selectedNode
  if (!node || getDefinition(node) !== nodeTypes.textCombiner) return
  const lab = normalizeCombinerState(node)
  lab.inputCount = Math.max(1, lab.inputCount - 1)
  lab.db = parseCombinerOrder(lab.db, lab.inputCount).filter((item) => item <= lab.inputCount).join(',') || '1'
  normalizeCombinerState(node)
  updateTextCombinerOutput(node)
  renderInspector()
  saveGraph()
})

elements.combinerOrder.addEventListener('input', () => {
  const node = state.selectedNode
  if (!node || getDefinition(node) !== nodeTypes.textCombiner) return
  const lab = normalizeCombinerState(node)
  lab.db = elements.combinerOrder.value
  updateTextCombinerOutput(node)
  saveGraph()
})

elements.combinerSeparator.addEventListener('input', () => {
  const node = state.selectedNode
  if (!node || getDefinition(node) !== nodeTypes.textCombiner) return
  const lab = normalizeCombinerState(node)
  lab.logic = elements.combinerSeparator.value
  updateTextCombinerOutput(node)
  saveGraph()
})

elements.combinerInputs.addEventListener('input', (event) => {
  const node = state.selectedNode
  if (!node || getDefinition(node) !== nodeTypes.textCombiner) return
  const target = event.target
  if (!(target instanceof HTMLTextAreaElement)) return
  autoSizeTextarea(target)
  const index = Number.parseInt(target.dataset.combinerIndex || '', 10)
  if (!Number.isInteger(index)) return
  const lab = normalizeCombinerState(node)
  lab.combinerInputs[index] = target.value
  updateTextCombinerOutput(node)
  saveGraph()
})

resizeCanvas()
loadGraph()
loadConfig()
refreshOAuthStatus()

window.aiGraphLab = {
  graph,
  graphCanvas,
  state,
  runGraph,
  runNode,
  getExecutionOrder,
}
