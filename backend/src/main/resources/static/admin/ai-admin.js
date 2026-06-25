const aiAdminRoot = document.querySelector('[data-ai-admin]')

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
      'input\tmaxLength\t500\tstop\t입력이 너무 길어요. 500자 이하로 다시 입력해주세요.',
      'input\tspecialCharRatio\t30%\treview\t특수문자가 많아요. 상품명이나 요청 내용을 다시 확인해주세요.',
      'input\tnumberRatio\t45%\treview\t숫자가 많아요. 주문번호나 가격 문의인지 다시 알려주세요.',
      'input\tenglishRatio\t70%\treview\t영문 입력이 많아요. 상품명인지 다시 확인해주세요.',
      'output\tforbiddenWords\t관리자 목록\trewrite\t안내가 부적절해 다시 정리했어요.',
      'output\tactionScope\tnavigate,highlight,addToCart\tfilter\t허용된 화면 동작만 실행할게요.',
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

function initializeSheet(sheetKey) {
  const existingSource = getSheetSource(sheetKey)
  const existingText = existingSource?.value?.trim()
  if (existingText) {
    setSheet(sheetKey, existingSource.value)
    return
  }
  if (sheetKey === 'hook') {
    setSheet(sheetKey, '')
    return
  }
  setSheet(sheetKey)
}

function syncHookFormValue() {
  const hookSource = getSheetSource('hook')
  const hookHidden = document.querySelector('[data-ai-hook-hidden]')
  if (hookSource && hookHidden) {
    hookHidden.value = hookSource.value
  }
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
    initializeSheet(sheetKey)
  })

  document.querySelectorAll('[data-ai-sheet-source]').forEach((sheetSource) => {
    sheetSource.addEventListener('input', () => {
      renderSheetPreview(sheetSource.dataset.aiSheetSource)
      syncHookFormValue()
    })
  })

  document.querySelector('[data-ai-hook-form]')?.addEventListener('submit', () => {
    syncHookFormValue()
  })

  syncHookFormValue()

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
