const aiAdminRoot = document.querySelector('[data-ai-admin]')
const aiBugLabRoot = document.querySelector('[data-ai-bug-lab]')
const hookPolicyHeader = ['hook', 'check', 'threshold', 'action', 'message']
const hookOptions = ['input', 'output']
const actionTypes = ['navigate', 'highlight', 'addToCart']
const checkOptionsByHook = {
  input: ['maxLength', 'forbiddenWords', 'specialCharRatio', 'numberRatio', 'englishRatio'],
  output: ['forbiddenWords', 'actionScope'],
}
const actionOptionsByCheck = {
  maxLength: ['stop', 'review'],
  forbiddenWords: ['stop', 'review'],
  specialCharRatio: ['review', 'stop'],
  numberRatio: ['review', 'stop'],
  englishRatio: ['review', 'stop'],
  actionScope: ['filter'],
}
const checkLabels = {
  maxLength: '최대 글자 수',
  forbiddenWords: '금지어',
  specialCharRatio: '특수문자 비율',
  numberRatio: '숫자 비율',
  englishRatio: '영어 비율',
  actionScope: '허용 출력 액션',
}
const actionLabels = {
  stop: '차단',
  review: '확인 요청',
  rewrite: '대체 문구',
  filter: '필터',
}
const defaultThresholdByCheck = {
  maxLength: '500',
  forbiddenWords: '',
  specialCharRatio: '30%',
  numberRatio: '45%',
  englishRatio: '70%',
  actionScope: 'navigate,highlight,addToCart',
}
const defaultMessageByCheck = {
  maxLength: '입력이 너무 길어요. 짧게 다시 입력해주세요.',
  forbiddenWords: '정책에 맞지 않는 표현이 포함되어 있어요.',
  specialCharRatio: '특수문자가 많아요. 요청 내용을 다시 확인해주세요.',
  numberRatio: '숫자가 많아요. 주문번호나 가격 문의인지 다시 알려주세요.',
  englishRatio: '영문 입력이 많아요. 상품명인지 다시 확인해주세요.',
  actionScope: '허용된 화면 동작만 실행할게요.',
}
let hookPolicies = []

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

function buildDelimitedText(rows) {
  return rows
    .map((row) => row.map((cell) => String(cell ?? '').replaceAll(/\s+/g, ' ').trim()).join('\t'))
    .join('\n')
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
  if (sheetKey === 'hook') {
    hookPolicies = parseHookPolicies(sheetSource.value)
    renderHookPolicyTable()
    syncHookFormValue()
  }
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
    hookSource.value = serializeHookPolicies(hookPolicies)
    hookHidden.value = hookSource.value
  }
}

function normalizeHookPolicy(policy) {
  const hook = hookOptions.includes(policy.hook) ? policy.hook : 'input'
  const checkOptions = checkOptionsByHook[hook]
  const check = checkOptions.includes(policy.check) ? policy.check : checkOptions[0]
  const actionOptions = getActionOptions(hook, check)
  const action = actionOptions.includes(policy.action) ? policy.action : actionOptions[0]
  return {
    hook,
    check,
    threshold: policy.threshold || defaultThresholdByCheck[check] || '',
    action,
    message: policy.message || defaultMessageByCheck[check] || '',
  }
}

function getActionOptions(hook, check) {
  if (hook === 'output' && check === 'forbiddenWords') {
    return ['rewrite', 'stop', 'review']
  }
  return actionOptionsByCheck[check] || ['stop']
}

function parseHookPolicies(text) {
  const [, ...bodyRows] = parseDelimitedText(text)
  return bodyRows
    .filter((row) => row.some((cell) => cell))
    .map((row) => normalizeHookPolicy({
      hook: row[0],
      check: row[1],
      threshold: row[2],
      action: row[3],
      message: row[4],
    }))
}

function serializeHookPolicies(policies) {
  return buildDelimitedText([
    hookPolicyHeader,
    ...policies.map((policy) => [
      policy.hook,
      policy.check,
      policy.threshold,
      policy.action,
      policy.message,
    ]),
  ])
}

function optionHtml(value, label, selectedValue) {
  const selected = value === selectedValue ? ' selected' : ''
  return `<option value="${escapeHtml(value)}"${selected}>${escapeHtml(label)}</option>`
}

function renderHookThresholdControl(policy, index) {
  if (policy.check === 'maxLength') {
    return `
      <label class="admin-ai-hook-field">
        <input type="number" min="1" step="1" value="${escapeHtml(policy.threshold.replace(/[^0-9.]/g, '') || '500')}"
               data-ai-hook-index="${index}" data-ai-hook-field="thresholdNumber">
        <span>자</span>
      </label>
    `
  }

  if (policy.check.endsWith('Ratio')) {
    return `
      <label class="admin-ai-hook-field">
        <input type="number" min="0" max="100" step="1" value="${escapeHtml(policy.threshold.replace('%', '') || '0')}"
               data-ai-hook-index="${index}" data-ai-hook-field="thresholdPercent">
        <span>%</span>
      </label>
    `
  }

  if (policy.check === 'actionScope') {
    const selectedActions = new Set(policy.threshold.split(',').map((value) => value.trim()).filter(Boolean))
    return `
      <div class="admin-ai-hook-checkboxes">
        ${actionTypes.map((actionType) => `
          <label>
            <input type="checkbox" value="${escapeHtml(actionType)}"
                   ${selectedActions.has(actionType) ? 'checked' : ''}
                   data-ai-hook-index="${index}" data-ai-hook-action-type>
            <span>${escapeHtml(actionType)}</span>
          </label>
        `).join('')}
      </div>
    `
  }

  return `
    <textarea rows="3" data-ai-hook-index="${index}" data-ai-hook-field="threshold">${escapeHtml(policy.threshold)}</textarea>
  `
}

function renderHookPolicyTable() {
  const tableBody = document.querySelector('[data-ai-hook-policy-table]')
  if (!tableBody) {
    return
  }

  if (hookPolicies.length === 0) {
    tableBody.innerHTML = '<tr><td colspan="6" class="admin-ai-empty-row">저장된 Hook 정책이 없습니다.</td></tr>'
    return
  }

  tableBody.innerHTML = hookPolicies.map((policy, index) => {
    const checkOptions = checkOptionsByHook[policy.hook]
    const actionOptions = getActionOptions(policy.hook, policy.check)
    return `
      <tr>
        <td>
          <select data-ai-hook-index="${index}" data-ai-hook-field="hook">
            ${hookOptions.map((hook) => optionHtml(hook, hook, policy.hook)).join('')}
          </select>
        </td>
        <td>
          <select data-ai-hook-index="${index}" data-ai-hook-field="check">
            ${checkOptions.map((check) => optionHtml(check, checkLabels[check] || check, policy.check)).join('')}
          </select>
        </td>
        <td>${renderHookThresholdControl(policy, index)}</td>
        <td>
          <select data-ai-hook-index="${index}" data-ai-hook-field="action">
            ${actionOptions.map((action) => optionHtml(action, actionLabels[action] || action, policy.action)).join('')}
          </select>
        </td>
        <td>
          <textarea rows="3" data-ai-hook-index="${index}" data-ai-hook-field="message">${escapeHtml(policy.message)}</textarea>
        </td>
        <td>
          <button type="button" data-ai-hook-remove="${index}">삭제</button>
        </td>
      </tr>
    `
  }).join('')
}

function addHookPolicy() {
  hookPolicies.push(normalizeHookPolicy({
    hook: 'input',
    check: 'maxLength',
    threshold: defaultThresholdByCheck.maxLength,
    action: 'stop',
    message: defaultMessageByCheck.maxLength,
  }))
  renderHookPolicyTable()
  syncHookFormValue()
}

function updateHookPolicy(index, field, value, shouldRender = true) {
  const policy = hookPolicies[index]
  if (!policy) {
    return
  }

  if (field === 'hook') {
    const nextHook = hookOptions.includes(value) ? value : 'input'
    const nextCheck = checkOptionsByHook[nextHook].includes(policy.check)
      ? policy.check
      : checkOptionsByHook[nextHook][0]
    hookPolicies[index] = normalizeHookPolicy({
      ...policy,
      hook: nextHook,
      check: nextCheck,
      threshold: nextCheck === policy.check ? policy.threshold : defaultThresholdByCheck[nextCheck],
      message: nextCheck === policy.check ? policy.message : defaultMessageByCheck[nextCheck],
    })
  } else if (field === 'check') {
    hookPolicies[index] = normalizeHookPolicy({
      ...policy,
      check: value,
      threshold: defaultThresholdByCheck[value],
      message: defaultMessageByCheck[value],
    })
  } else if (field === 'thresholdPercent') {
    hookPolicies[index] = { ...policy, threshold: `${value || 0}%` }
  } else if (field === 'thresholdNumber') {
    hookPolicies[index] = { ...policy, threshold: String(value || 1) }
  } else {
    hookPolicies[index] = normalizeHookPolicy({ ...policy, [field]: value })
  }

  if (shouldRender) {
    renderHookPolicyTable()
  }
  syncHookFormValue()
}

function updateHookActionScope(index) {
  const checkboxes = document.querySelectorAll(`[data-ai-hook-index="${index}"][data-ai-hook-action-type]`)
  const selectedActions = Array.from(checkboxes)
    .filter((checkbox) => checkbox.checked)
    .map((checkbox) => checkbox.value)
  hookPolicies[index] = {
    ...hookPolicies[index],
    threshold: selectedActions.join(','),
  }
  syncHookFormValue()
}

function parsePolicyList(value) {
  return String(value || '')
    .split(/[,，]/)
    .map((item) => item.trim())
    .filter(Boolean)
}

function parsePolicyRatio(value) {
  const rawValue = String(value || '').trim()
  const numericValue = Number(rawValue.replace('%', ''))
  if (Number.isNaN(numericValue)) {
    return rawValue.endsWith('%') ? 1 : 0
  }
  return rawValue.endsWith('%') ? numericValue / 100 : numericValue
}

function characterRatio(text, pattern) {
  if (!text) {
    return 0
  }
  const matches = text.match(pattern)
  return (matches?.length || 0) / text.length
}

function containsForbiddenWord(text, threshold) {
  const words = parsePolicyList(threshold)
  if (words.length === 0 || (words.length === 1 && words[0] === '관리자 목록')) {
    return false
  }
  const normalizedText = text.toLocaleLowerCase()
  return words.some((word) => normalizedText.includes(word.toLocaleLowerCase()))
}

function violatesTextPolicy(text, policy) {
  if (policy.check === 'maxLength') {
    return text.length > Number(policy.threshold || 0)
  }
  if (policy.check === 'forbiddenWords') {
    return containsForbiddenWord(text, policy.threshold)
  }
  if (policy.check === 'specialCharRatio') {
    return characterRatio(text, /[^0-9A-Za-z가-힣\s]/g) >= parsePolicyRatio(policy.threshold)
  }
  if (policy.check === 'numberRatio') {
    return characterRatio(text, /[0-9]/g) >= parsePolicyRatio(policy.threshold)
  }
  if (policy.check === 'englishRatio') {
    return characterRatio(text, /[A-Za-z]/g) >= parsePolicyRatio(policy.threshold)
  }
  return false
}

function policyLabel(policy) {
  return `${policy.hook}/${policy.check}/${policy.action}`
}

function setHookTestResult(kind, message) {
  const result = document.querySelector(`[data-ai-hook-test-result="${kind}"]`)
  if (result) {
    result.textContent = message
  }
}

function runInputHookTest() {
  const text = document.querySelector('[data-ai-hook-test-input]')?.value || ''
  const matchedPolicy = hookPolicies
    .filter((policy) => policy.hook === 'input')
    .find((policy) => violatesTextPolicy(text, policy))

  if (!matchedPolicy) {
    setHookTestResult('input', '통과: 적용되는 input hook 정책이 없습니다.')
    return
  }

  setHookTestResult(
    'input',
    `차단/확인: ${policyLabel(matchedPolicy)} → ${matchedPolicy.message}`,
  )
}

function runOutputHookTest() {
  const text = document.querySelector('[data-ai-hook-test-output]')?.value || ''
  const selectedActions = Array.from(document.querySelectorAll('[data-ai-hook-test-action]'))
    .filter((checkbox) => checkbox.checked)
    .map((checkbox) => checkbox.value)
  let nextText = text
  let nextActions = selectedActions
  const appliedPolicies = []

  hookPolicies
    .filter((policy) => policy.hook === 'output')
    .forEach((policy) => {
      if (policy.check === 'actionScope' && policy.action === 'filter') {
        const allowedActions = new Set(parsePolicyList(policy.threshold))
        nextActions = nextActions.filter((action) => allowedActions.has(action))
        appliedPolicies.push(policyLabel(policy))
      }
      if (policy.check === 'forbiddenWords' && containsForbiddenWord(nextText, policy.threshold)) {
        nextText = policy.message
        nextActions = []
        appliedPolicies.push(policyLabel(policy))
      }
    })

  if (appliedPolicies.length === 0) {
    setHookTestResult('output', `통과: text="${nextText}", actions=[${nextActions.join(',')}]`)
    return
  }

  setHookTestResult(
    'output',
    `적용: ${appliedPolicies.join(' → ')} / 결과 text="${nextText}", actions=[${nextActions.join(',')}]`,
  )
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

  document.querySelector('[data-ai-hook-add]')?.addEventListener('click', () => {
    addHookPolicy()
  })

  document.querySelector('[data-ai-hook-policy-table]')?.addEventListener('input', (event) => {
    const target = event.target
    if (!target.matches('[data-ai-hook-field]')) {
      return
    }
    updateHookPolicy(Number(target.dataset.aiHookIndex), target.dataset.aiHookField, target.value, false)
  })

  document.querySelector('[data-ai-hook-policy-table]')?.addEventListener('change', (event) => {
    const target = event.target
    if (target.matches('[data-ai-hook-action-type]')) {
      updateHookActionScope(Number(target.dataset.aiHookIndex))
      return
    }
    if (target.matches('[data-ai-hook-field]')) {
      updateHookPolicy(Number(target.dataset.aiHookIndex), target.dataset.aiHookField, target.value)
    }
  })

  document.querySelector('[data-ai-hook-policy-table]')?.addEventListener('click', (event) => {
    const removeButton = event.target.closest('[data-ai-hook-remove]')
    if (!removeButton) {
      return
    }
    const policyIndex = Number(removeButton.dataset.aiHookRemove)
    const policy = hookPolicies[policyIndex]
    const policyName = policy ? `${policy.hook}/${policy.check}` : '선택한 정책'
    if (!window.confirm(`${policyName} 정책을 삭제할까요? 저장해야 실제 정책에 반영됩니다.`)) {
      return
    }
    hookPolicies.splice(policyIndex, 1)
    renderHookPolicyTable()
    syncHookFormValue()
  })

  document.querySelectorAll('[data-ai-hook-test-run]').forEach((button) => {
    button.addEventListener('click', () => {
      if (button.dataset.aiHookTestRun === 'input') {
        runInputHookTest()
        return
      }
      runOutputHookTest()
    })
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
