const aiAdminRoot = document.querySelector('[data-ai-admin]')
const aiBugLabRoot = document.querySelector('[data-ai-bug-lab]')

const sampleSheets = {
  catalog: {
    title: 'DB 요약 시트',
    text: [
      'level\tparent\tkey\tlabel\tvalue\tfreshness\tnote',
      'store\t-\tprojectCyan\tProject Cyan Store\tactive\t5m\t챗봇 최초 요청 시 조회',
      'artist\tprojectCyan\tartist:7\taespa\tactive\t5m\t대표 아티스트',
      'category\tartist:7\tcategory:photocard\t포토카드\tON_SALE\t5m\t추천 가능',
      'goods\tcategory:photocard\tgoods:42\taespa 포토카드 세트\t35000원\t5m\tstock 120',
      'goods\tcategory:photocard\tgoods:1002\taespa 키링\t18000원\t5m\tstock 34',
      'stock\tgoods:42\tstock:42\t재고\t120\t5m\t판매 가능',
    ].join('\n'),
  },
  prompt: {
    title: '기본 프롬프트 시트',
    text: [
      'layer\tfield\tcontent\towner\tpriority',
      'identity\tname\t시안은 Project Cyan 매장 안의 버츄얼 캐릭터다\tadmin\t1',
      'authority\tactions\tnavigate, highlight, addToCart만 화면 액션으로 사용\tadmin\t1',
      'knowledge\tcatalog\tDB 요약 시트와 재고 스냅샷을 근거로 답변\tSpring\t1',
      'cache\trefresh\t최초 요청 후 5분 동안 같은 요약본 사용\tSpring\t2',
      'unknown\tfallback\t요약본에 없으면 지어내지 않고 추가 조회가 필요하다고 말함\tadmin\t1',
    ].join('\n'),
  },
  hook: {
    title: 'Input Output Hook 시트',
    text: [
      'hook\tcheck\tthreshold\taction\tmessage',
      'input\tmaxLength\t500\tstop\t입력이 너무 길면 짧게 다시 요청',
      'input\tspecialCharRatio\t30%\treview\t특수문자 반복 여부 확인',
      'input\tnumberRatio\t45%\treview\t주문번호/가격 맥락인지 확인',
      'input\tenglishRatio\t70%\treview\t영문 상품명 또는 비정상 입력 구분',
      'output\tforbiddenWords\t관리자 목록\trewrite\t말풍선 출력 전 교체',
      'output\tactionScope\t3 actions only\tfilter\t허용 액션만 남김',
    ].join('\n'),
  },
  scenario: {
    title: '응답 시나리오 시트',
    text: [
      'context\tmotion\tresponse\tallowedAction\tfallback',
      '상품 추천\thighlight\t후보 1~3개를 짧게 소개\tnavigate,highlight\t후보 없음 안내',
      '장바구니\tpoint\t명시적 담기 요청일 때만 실행\taddToCart\t확인 질문',
      '상세 질문\tthinking\t요약본에 없으면 추가 조회 필요 안내\tnavigate\t상품 상세로 이동',
      '잡담\tsmile\t짧게 반응 후 쇼핑 맥락 복귀\tnone\t취향 질문',
      '연결 실패\tidle\t서버 연결 실패를 캐릭터 톤으로 알림\tnone\t재시도 유도',
    ].join('\n'),
  },
}

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
}

function delimiterForText(text) {
  const firstLine = String(text || '').split(/\r?\n/, 1)[0] || ''
  return firstLine.includes('\t') ? '\t' : ','
}

function parseDelimitedText(text) {
  const delimiter = delimiterForText(text)
  return String(text || '')
    .trim()
    .split(/\r?\n/)
    .filter(Boolean)
    .map((line) => line.split(delimiter).map((cell) => cell.trim()))
}

function getSheetSource(sheetKey) {
  return document.querySelector(`[data-ai-sheet-source="${sheetKey}"]`)
}

function getSheetPreview(sheetKey) {
  return document.querySelector(`[data-ai-sheet-preview="${sheetKey}"]`)
}

function renderSheetPreview(sheetKey) {
  const sheetSource = getSheetSource(sheetKey)
  const sheetPreview = getSheetPreview(sheetKey)
  if (!sheetPreview || !sheetSource) {
    return
  }

  const rows = parseDelimitedText(sheetSource.value)
  if (rows.length === 0) {
    sheetPreview.innerHTML = '<tbody><tr><td>미리볼 행이 없습니다.</td></tr></tbody>'
    return
  }

  const [headers, ...bodyRows] = rows
  sheetPreview.innerHTML = `
    <thead>
      <tr>${headers.map((cell) => `<th>${escapeHtml(cell)}</th>`).join('')}</tr>
    </thead>
    <tbody>
      ${bodyRows.map((row) => `
        <tr>${headers.map((_, index) => `<td>${escapeHtml(row[index] || '')}</td>`).join('')}</tr>
      `).join('')}
    </tbody>
  `
}

function setSheet(sheetKey, textOverride) {
  const nextSheet = sampleSheets[sheetKey]
  const sheetSource = getSheetSource(sheetKey)
  if (!nextSheet || !sheetSource) {
    return
  }
  sheetSource.value = textOverride ?? nextSheet.text
  renderSheetPreview(sheetKey)
}

function exportSheet(sheetKey) {
  const sheetSource = getSheetSource(sheetKey)
  if (!sheetSource) {
    return
  }
  const blob = new Blob([sheetSource.value], { type: 'text/tab-separated-values;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `project-cyan-ai-${sheetKey}.tsv`
  link.click()
  URL.revokeObjectURL(url)
}

function importSheetFile(sheetKey, file) {
  if (!file) {
    return
  }
  const reader = new FileReader()
  reader.onload = () => {
    setSheet(sheetKey, String(reader.result || ''))
  }
  reader.readAsText(file, 'utf-8')
}

function syncSummaryButton(detailsElement) {
  const toggleText = detailsElement.querySelector('summary b')
  if (toggleText) {
    toggleText.textContent = detailsElement.open ? '접기' : '펼치기'
  }
}

if (aiAdminRoot) {
  Object.keys(sampleSheets).forEach((sheetKey) => {
    setSheet(sheetKey)
  })

  document.querySelectorAll('[data-ai-sheet-source]').forEach((sheetSource) => {
    sheetSource.addEventListener('input', () => {
      renderSheetPreview(sheetSource.dataset.aiSheetSource)
    })
  })

  document.querySelectorAll('[data-ai-export]').forEach((button) => {
    button.addEventListener('click', () => {
      exportSheet(button.dataset.aiExport)
    })
  })

  document.querySelectorAll('[data-ai-reset]').forEach((button) => {
    button.addEventListener('click', () => {
      setSheet(button.dataset.aiReset)
    })
  })

  document.querySelectorAll('[data-ai-file-input]').forEach((fileInput) => {
    fileInput.addEventListener('change', () => {
      importSheetFile(fileInput.dataset.aiFileInput, fileInput.files?.[0])
      fileInput.value = ''
    })
  })

  document.querySelectorAll('[data-ai-sheet-section]').forEach((detailsElement) => {
    syncSummaryButton(detailsElement)
    detailsElement.addEventListener('toggle', () => syncSummaryButton(detailsElement))
    detailsElement.querySelector('summary')?.addEventListener('click', () => {
      setTimeout(() => syncSummaryButton(detailsElement), 0)
    })
  })
}

const aiBugStorageKey = 'projectCyanAiBehaviorBugQueue'

const defaultAiBugs = [
  {
    id: 'inspector-density',
    title: '사이드바 텍스트박스 과밀/스크롤 과다',
    area: '8002 조합기 인스펙터',
    note: '기본 화면은 output과 흐름만 보이고, IO/세부 정보는 버튼으로 접는다.',
    status: 'done',
  },
  {
    id: 'connected-preview',
    title: '연결 프리뷰가 실제 입력칸처럼 보임',
    area: '8002 텍스트 조합기',
    note: '연결된 입력은 readonly textarea 대신 짧은 프리뷰 카드로 표시한다.',
    status: 'done',
  },
  {
    id: 'node-runtime-boundary',
    title: '함수/LLM 노드가 실제 실행인지 구분 필요',
    area: '8002 노드 실행부',
    note: '함수 노드와 LLM 노드의 실행 경계, 실패 로그, RAW 출력 위치를 한 화면에서 확인한다.',
    status: 'todo',
  },
  {
    id: 'admin-subpage',
    title: '실험 UI를 관리자 AI 행동관리 sub로 격리',
    area: '/admin/ai/behavior-lab',
    note: '기존 workbook은 유지하고, 실험/버그 수정은 하위 화면에서 처리한다.',
    status: 'doing',
  },
]

function readAiBugQueue() {
  try {
    const parsed = JSON.parse(localStorage.getItem(aiBugStorageKey) || 'null')
    return Array.isArray(parsed) ? parsed : defaultAiBugs
  } catch {
    return defaultAiBugs
  }
}

function saveAiBugQueue(items) {
  localStorage.setItem(aiBugStorageKey, JSON.stringify(items))
}

function aiBugStatusLabel(status) {
  if (status === 'done') return '완료'
  if (status === 'doing') return '수정중'
  return '대기'
}

function nextAiBugStatus(status) {
  if (status === 'todo') return 'doing'
  if (status === 'doing') return 'done'
  return 'todo'
}

function renderAiBugQueue() {
  const list = aiBugLabRoot?.querySelector('[data-ai-bug-list]')
  if (!list) {
    return
  }

  const items = readAiBugQueue()
  if (items.length === 0) {
    list.innerHTML = '<p class="admin-ai-bug-empty">등록된 버그가 없습니다.</p>'
    return
  }

  list.innerHTML = items.map((item) => `
    <article class="admin-ai-bug-card" data-status="${escapeHtml(item.status || 'todo')}">
      <div>
        <strong>${escapeHtml(item.title)}</strong>
        <span>${escapeHtml(item.area || '위치 미지정')}</span>
      </div>
      <p>${escapeHtml(item.note || '')}</p>
      <footer>
        <button type="button" data-ai-bug-next="${escapeHtml(item.id)}">${aiBugStatusLabel(item.status)}</button>
        <button type="button" data-ai-bug-remove="${escapeHtml(item.id)}">삭제</button>
      </footer>
    </article>
  `).join('')
}

if (aiBugLabRoot) {
  if (!localStorage.getItem(aiBugStorageKey)) {
    saveAiBugQueue(defaultAiBugs)
  }
  renderAiBugQueue()

  aiBugLabRoot.querySelector('[data-ai-bug-form]')?.addEventListener('submit', (event) => {
    event.preventDefault()
    const titleInput = aiBugLabRoot.querySelector('[data-ai-bug-title]')
    const areaInput = aiBugLabRoot.querySelector('[data-ai-bug-area]')
    const noteInput = aiBugLabRoot.querySelector('[data-ai-bug-note]')
    const title = titleInput?.value.trim()
    if (!title) {
      return
    }
    const items = readAiBugQueue()
    items.unshift({
      id: `bug-${Date.now()}`,
      title,
      area: areaInput?.value.trim() || 'AI 행동관리',
      note: noteInput?.value.trim() || '',
      status: 'todo',
    })
    saveAiBugQueue(items)
    event.currentTarget.reset()
    renderAiBugQueue()
  })

  aiBugLabRoot.querySelector('[data-ai-bug-list]')?.addEventListener('click', (event) => {
    const nextButton = event.target.closest('[data-ai-bug-next]')
    const removeButton = event.target.closest('[data-ai-bug-remove]')
    if (!nextButton && !removeButton) {
      return
    }

    const id = nextButton?.dataset.aiBugNext || removeButton?.dataset.aiBugRemove
    let items = readAiBugQueue()
    if (nextButton) {
      items = items.map((item) => item.id === id ? { ...item, status: nextAiBugStatus(item.status || 'todo') } : item)
    }
    if (removeButton) {
      items = items.filter((item) => item.id !== id)
    }
    saveAiBugQueue(items)
    renderAiBugQueue()
  })

  aiBugLabRoot.querySelector('[data-ai-bug-reset]')?.addEventListener('click', () => {
    saveAiBugQueue(defaultAiBugs)
    renderAiBugQueue()
  })

  aiBugLabRoot.querySelector('[data-ai-lab-reload]')?.addEventListener('click', () => {
    const iframe = aiBugLabRoot.querySelector('iframe')
    if (iframe) {
      iframe.src = iframe.src
    }
  })
}
