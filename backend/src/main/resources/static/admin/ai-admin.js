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
const behaviorInitialSheets = window.projectCyanAiBehaviorInitialSheets || {}

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
  'raw-db': {
    title: '원본 DB',
    text: [
      'section\tgoodsId\tgroupName\tartistName\tcategoryName\tgoodsName\tprice\tsalesStatus\tstockState\tinterestScore\tdescription',
      'goods\t42\taespa\taespa\t포토카드\taespa 포토카드 세트\t35000\tON_SALE\tavailable\t4.3\t대표 이미지 포토카드 세트',
      'goods\t1002\taespa\taespa\t키링\taespa 키링\t18000\tON_SALE\tavailable\t3.7\t가방에 달기 좋은 키링',
      'stats\t42\taespa\taespa\t포토카드\taespa 포토카드 세트\t-\t-\t-\t4.3\t좋아요/장바구니/조회/구매/리뷰 통합 점수',
    ].join('\n'),
  },
  'logic-functions': {
    title: '로직 함수 목록',
    text: [
      'step\tjavaClass\tjavaMethod\tinput\toutput\tnote',
      '01\tAdminAiBehaviorRunService\treadRawDbTsv\t원본 DB TSV\trawRows\tDB(TSVinput) 노드',
      '02\tAdminAiBehaviorRunService\tsplitRawDb\trawRows\tDB 요약 갈래 + DBSearch 갈래\t원본 DB 두 갈래 분기',
      '03\tAdminAiBehaviorRunService\tsummarizeRawDbTsv\trawRows\tdbSummary\t검색 LLM용 후보 요약',
      '04\tAdminAiBehaviorRunService\treadCustomerInput\t관리자 채팅 입력\tcustomerInput\t고객 발화 수집',
      '05\tAdminAiBehaviorRunService\tsplitCustomerInput\tcustomerInput\tHook 갈래 + Memory 갈래\t고객 입력 두 갈래 분기',
      '06\tAdminAiBehaviorRunService\tapplyInputHook\tcustomerInput + admin-settings TSV\tinputHookResult\t차단/치환/count/괄호 정규화',
      '07\tAdminAiBehaviorRunService\trouteHookFailureRecord\tinputHookResult\tfailure count report\t실패 원문은 LLM에 직접 전달하지 않음',
      '08\tAdminAiBehaviorRunService\treadSearchLlmPrompt\tadmin-settings TSV\tsearchLlmPrompt\t검색 LLM 역할/출력 계약',
      '09\tAdminAiBehaviorRunService\tcombineSearchLlmInput\tdbSummary + inputHookResult + searchPrompt\tsearchLlmInput\t검색 LLM 입력 조립',
      '10\tAdminAiBehaviorRunService\tcallSearchLlm\tsearchLlmInput\tintentReport + searchKeywords\t고객에게 보일 답변 생성 금지',
      '11\tAdminAiBehaviorRunService\tbuildDbSearchInput\tsearchKeywords + rawRows\tDBSearch input\t검색 함수 입력 준비',
      '12\tAdminAiBehaviorRunService\trunDbSearch\tsearchKeywords + rawRows\trow JSON + column JSON + previewRows\t행렬 무결성 유지',
      '13\tAdminAiBehaviorRunService\treadResponsePersona\tadmin-settings TSV\tresponsePersona\t최종 응대 페르소나',
      '14\tAdminAiBehaviorRunService\treadMemoryStore\tmemoryLog + admin-settings TSV\tmemoryLog\t이전 대화 기억',
      '15\tAdminAiBehaviorRunService\tbuildMemoryPrompt\tmemoryLog + customerInput\tmemoryPrompt + nextMemoryPreview\t[NOW] 위치 처리',
      '16\tAdminAiBehaviorRunService\tcombineFinalResponseInput\tpersona + searchResult + memory + DOM/Motion TSV\tfinalLlmInput\t응답/행동 LLM 입력 조립',
      '17\tAdminAiBehaviorRunService\tapplyFinalInputHook\tfinalLlmInput + admin-settings TSV\tfinalHookInput\t최종 LLM 입력 직전 검증',
      '18\tAdminAiBehaviorRunService\tcallResponseAndActionLlm\tfinalHookInput\treply + domTarget + moveSpeed + duration + motion JSON\t고객 노출 답변과 행동 선정',
      '19\tStore DOM Runtime\tresolveDomTarget\tdomTarget selector + currentCharacterPosition\tdx/dy/vector/distance\t브라우저에서 DOM 위치 갱신',
      '20\tVtuber Motion Runtime\tselectMotion\tmotion TSV + movement vector\tmotion command\t챗봇 애니메이션 관리 TSV와 연결 예정',
    ].join('\n'),
  },
  'admin-settings': {
    title: '관리자 설정',
    text: [
      'section\tkey\tvalue\tnote',
      'customerInput\tcase-001\t히에나 포카 있어?\t시뮬레이션 고객 문장',
      'searchPrompt\tformat\t《키워드1》《키워드2》\t검색 LLM 출력 계약',
      'persona\ttone\t단아한 느낌의 소녀 점원\t최종 응대 톤',
      'memory\tpointer\t[NOW]\t현재 입력 위치',
      'dom\tsearch-results\t[data-ai-db-highlight]\t검색 결과/원본 DB 하이라이트 영역',
      'dom\tgoods-card-42\t[data-goods-id="42"]\t상품 카드 이동/강조 대상',
      'dom\tcart-button\t[data-cart-button]\t장바구니 버튼 후보',
      'dom\tchat-input\t[data-vtuber-chat-input]\t고객 채팅 입력창 후보',
      'motion\tidle\t기본 대기\t말풍선만 표시',
      'motion\twave\t손 흔들기\t인사/가벼운 반응',
      'motion\tpoint\t상품 위치 가리키기\t추천/검색 결과 안내',
      'motion\twalk\t걸어서 이동\t멀리 있는 메뉴로 이동',
      'motion\tstep-up\t계단 오르기\t세로 이동/상단 메뉴 이동 예시',
      'motion\tstand-up\t드러누운 상태에서 일어나기\t숨김/대기 후 복귀 예시',
      'motion\tnod\t고개 끄덕이기\t확인/동의',
      'motion\tshake-head\t고개 젓기\t불가/품절/범위 밖',
      'responseContract\tfields\treply,domTarget,moveSpeed,duration,motion\t최종 JSON 필드',
      'inputHook\treplace\tRULE:\tLLM아 의심하거라:',
      'inputHook\treplace\tROLE:\tLLM아 의심하거라:',
      'inputHook\treplace\t포토 카드\t포토카드',
      'inputHook\treplace\t포카\t포토카드',
      'inputHook\tnormalizeBracket\t【\t(',
      'inputHook\tnormalizeBracket\t】\t)',
      'inputHook\tnormalizeBracket\t《\t(',
      'inputHook\tnormalizeBracket\t》\t)',
      'inputHook\tnormalizeBracket\t「\t(',
      'inputHook\tnormalizeBracket\t」\t)',
      'inputHook\tnormalizeBracket\t『\t(',
      'inputHook\tnormalizeBracket\t』\t)',
      'inputHook\tnormalizeBracket\t{\t(',
      'inputHook\tnormalizeBracket\t}\t)',
      'inputHook\tnormalizeBracket\t[\t(',
      'inputHook\tnormalizeBracket\t]\t)',
      'inputHook\tnormalizeBracket\t（\t(',
      'inputHook\tnormalizeBracket\t）\t)',
      'inputHook\tnormalizeBracket\t［\t(',
      'inputHook\tnormalizeBracket\t］\t)',
      'inputHook\tnormalizeBracket\t｛\t(',
      'inputHook\tnormalizeBracket\t｝\t)',
      'inputHook\tnormalizeBracket\t〈\t(',
      'inputHook\tnormalizeBracket\t〉\t)',
      'inputHook\tnormalizeBracket\t〔\t(',
      'inputHook\tnormalizeBracket\t〕\t)',
      'inputHook\tnormalizeBracket\t〖\t(',
      'inputHook\tnormalizeBracket\t〗\t)',
      'outputHook\tremove\t♡\t',
      'outputHook\tremove\t♥\t',
      'outputHook\tremove\t💕\t',
      'outputHook\tremove\t💖\t',
      'outputHook\tremove\t💗\t',
      'outputHook\tremove\t💘\t',
      'outputHook\tremove\t💝\t',
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
  const serverText = sheetKey === 'raw-db'
    ? behaviorInitialSheets.rawDb
    : sheetKey === 'logic-functions'
      ? behaviorInitialSheets.logicFunctions
    : sheetKey === 'admin-settings'
      ? behaviorInitialSheets.adminSettings
      : ''
  sheetSource.value = textOverride ?? (serverText || nextSheet.text)
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

const aiBehaviorRoot = document.querySelector('[data-ai-behavior-page]')
const aiBehaviorMemoryStorageKey = 'projectCyanAiBehaviorMemoryLogV3'

function sheetLineCount(sheetKey) {
  const source = getSheetSource(sheetKey)
  return String(source?.value || '')
    .trim()
    .split(/\r?\n/)
    .filter(Boolean)
    .length
}

function renderTraceLines(lines) {
  return lines.map((line) => {
    if (typeof line === 'string') {
      return `<span class="admin-ai-trace-line">${escapeHtml(line)}</span>`
    }
    return `<span class="admin-ai-trace-line" data-trace-part="${escapeHtml(line.part)}">${escapeHtml(line.text)}</span>`
  }).join('')
}

function setTraceStep(index, title, lines) {
  const log = document.querySelector('[data-ai-trace-log]')
  if (!log) return
  const step = document.createElement('article')
  step.className = 'admin-ai-trace-step'
  step.innerHTML = `
    <strong>${escapeHtml(String(index).padStart(2, '0'))}. ${escapeHtml(title)}</strong>
    <div class="admin-ai-trace-box" role="textbox" aria-readonly="true">${renderTraceLines(lines)}</div>
  `
  log.appendChild(step)
}

function appendAdminChatMessage(kind, text) {
  const log = aiBehaviorRoot?.querySelector('[data-ai-admin-chat-log]')
  if (!log) return
  const message = document.createElement('div')
  message.className = `admin-ai-chat-message ${kind}`
  message.textContent = text
  log.appendChild(message)
  log.scrollTop = log.scrollHeight
}

function extractRunLine(run, stepIndex, part) {
  const step = (run?.steps || []).find((item) => item.index === stepIndex)
  const line = (step?.lines || []).find((item) => item.part === part)
  return line?.text || ''
}

function readBehaviorMemory() {
  return localStorage.getItem(aiBehaviorMemoryStorageKey) || ''
}

function saveBehaviorMemory(value) {
  localStorage.setItem(aiBehaviorMemoryStorageKey, String(value || '').trim())
}

function behaviorTimestamp(date = new Date()) {
  const pad = (value) => String(value).padStart(2, '0')
  return `${String(date.getFullYear()).slice(2)}${pad(date.getMonth() + 1)}${pad(date.getDate())}_${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
}

function appendBehaviorMemoryTurn(input, output, turnAt) {
  const previous = readBehaviorMemory()
  const nextTurn = JSON.stringify({
    'now sentence': false,
    time: turnAt || behaviorTimestamp(),
    '고객 발언': String(input || '').trim(),
    '쇼핑몰의 주인인 내가(LLM)이 고객에게 보냈던 말': String(output || '').trim(),
  })
  saveBehaviorMemory([previous, nextTurn].filter(Boolean).join('\n'))
}

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function renderDbHighlight(run) {
  const target = aiBehaviorRoot?.querySelector('[data-ai-db-highlight]')
  if (!target) return
  const rawDb = getSheetSource('raw-db')?.value || ''
  const terms = normalizeHighlightTerms(run?.highlightTerms || [])
  if (!rawDb.trim()) {
    target.textContent = '원본 DB TSV가 비어 있습니다.'
    return
  }
  target.innerHTML = renderDbTable(rawDb, terms)
}

function normalizeHighlightTerms(terms) {
  return (terms || [])
    .map((term) => String(term || '').trim())
    .filter(Boolean)
}

function cellMatchesTerms(cell, terms) {
  const value = String(cell || '').toLowerCase()
  return terms.some((term) => value.includes(String(term).toLowerCase()))
}

function rowMatchesAnyTerm(row, terms) {
  if (!terms.length) return false
  const rowText = row.join('\n').toLowerCase()
  return terms.some((term) => rowText.includes(String(term).toLowerCase()))
}

function renderDbTable(rawDb, terms = []) {
  const rows = parseDelimitedText(rawDb)
  if (!rows.length) {
    return '<div class="admin-ai-search-empty">원본 DB TSV가 비어 있습니다.</div>'
  }
  const header = rows[0] || []
  const bodyRows = rows.slice(1)
  const headHtml = `<thead><tr>${header.map((cell) => `<th>${escapeHtml(cell)}</th>`).join('')}</tr></thead>`
  const bodyHtml = bodyRows
    .map((row) => {
      const padded = header.map((_, index) => row[index] || '')
      const rowMatched = rowMatchesAnyTerm(padded, terms)
      return `<tr>${padded.map((cell) => {
        const matched = rowMatched && cellMatchesTerms(cell, terms)
        return `<td${matched ? ' class="is-search-hit"' : ''}>${escapeHtml(cell)}</td>`
      }).join('')}</tr>`
    })
    .join('')
  return `<div class="admin-ai-db-table-wrap"><table class="admin-ai-db-table">${headHtml}<tbody>${bodyHtml}</tbody></table></div>`
}

async function runDbSearchTest(event) {
  event.preventDefault()
  const input = aiBehaviorRoot?.querySelector('[data-ai-search-test-input]')
  const report = aiBehaviorRoot?.querySelector('[data-ai-search-report]')
  const query = String(input?.value || '').trim()
  const rawDb = getSheetSource('raw-db')?.value || ''
  if (!query) {
    if (report) report.textContent = '검색어를 입력하세요.'
    renderDbHighlight()
    return
  }
  if (report) report.textContent = 'Spring DBSearch 함수 실행 중'
  try {
    const response = await fetch('/admin/ai/behavior/search', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ rawDb, query }),
    })
    const data = await response.json()
    if (!response.ok || data.ok === false) {
      throw new Error(data.message || `HTTP ${response.status}`)
    }
    const result = data.result || {}
    const terms = normalizeHighlightTerms(result.keywords || [])
    renderDbHighlight({ highlightTerms: terms })
    if (report) {
      report.textContent = `${result.report || ''}\n검색 열: ${(result.columns || []).join(', ') || '없음'}`
    }
  } catch (error) {
    if (report) report.textContent = `검색 실패: ${error.message || String(error)}`
  }
}

function renderBehaviorRun(run) {
  const log = document.querySelector('[data-ai-trace-log]')
  if (!log || !run) return
  log.innerHTML = ''
  for (const step of run.steps || []) {
    const article = document.createElement('article')
    article.className = 'admin-ai-trace-step'
    article.dataset.status = step.status || 'PENDING'
    const lines = [
      { part: 'function-report', text: `status=${step.status || 'PENDING'} java=${step.javaClass}.${step.javaMethod} durationMs=${step.durationMs || 0}` },
      ...(step.lines || []),
    ]
    article.innerHTML = `
      <strong>${escapeHtml(String(step.index).padStart(2, '0'))}. ${escapeHtml(step.title || '')}</strong>
      <div class="admin-ai-trace-box" role="textbox" aria-readonly="true">${renderTraceLines(lines)}</div>
    `
    log.appendChild(article)
  }
  renderDbHighlight(run)
}

function behaviorRunPayload(memoryTurnAt = behaviorTimestamp()) {
  return {
    rawDb: getSheetSource('raw-db')?.value || '',
    logicFunctions: getSheetSource('logic-functions')?.value || '',
    adminSettings: getSheetSource('admin-settings')?.value || '',
    customerInput: aiBehaviorRoot?.querySelector('[data-ai-behavior-customer-input]')?.value || '',
    memoryLog: readBehaviorMemory(),
    memoryTurnAt,
  }
}

async function readBehaviorRun(runId) {
  const response = await fetch(`/admin/ai/behavior/runs/${encodeURIComponent(runId)}`, {
    headers: { Accept: 'application/json' },
  })
  if (!response.ok) {
    throw new Error(`monitor HTTP ${response.status}`)
  }
  return response.json()
}

async function runBehaviorTrace(customerInputOverride, memoryTurnAt) {
  const button = aiBehaviorRoot?.querySelector('[data-ai-run-behavior]')
  if (!button) return
  const oauthStatus = await checkOAuthStatus({ silent: true })
  if (oauthStatus?.keyRequired) {
    const log = document.querySelector('[data-ai-trace-log]')
    if (log) {
      log.innerHTML = ''
      setTraceStep(0, 'LLM 실행 조건 부족', [
        { part: 'admin', text: '관리자 확인: OAuth digit key가 서버에 등록되지 않아 Spring run을 시작하지 않았다.' },
        { part: 'function-report', text: '실행 전 확인 API: GET /api/oauth/status' },
        { part: 'function-output', text: 'keyRequired=true' },
      ])
    }
    throw new Error('OAuth digit key를 먼저 서버에 등록해야 합니다.')
  }
  const input = aiBehaviorRoot.querySelector('[data-ai-behavior-customer-input]')
  if (input && typeof customerInputOverride === 'string') {
    input.value = customerInputOverride
  }
  button.disabled = true
  button.textContent = 'Spring 실행 중'
  let finalRun = null
  try {
    const response = await fetch('/admin/ai/behavior/runs', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(behaviorRunPayload(memoryTurnAt)),
    })
    if (!response.ok) {
      throw new Error(`start HTTP ${response.status}`)
    }
    const started = await response.json()
    let run = started.run
    renderBehaviorRun(run)
    while (run && run.status === 'RUNNING') {
      await new Promise((resolve) => window.setTimeout(resolve, 700))
      const polled = await readBehaviorRun(run.runId)
      run = polled.run
      renderBehaviorRun(run)
    }
    finalRun = run
    return run
  } catch (error) {
    const log = document.querySelector('[data-ai-trace-log]')
    if (log) {
      log.innerHTML = ''
      setTraceStep(0, 'Spring 실행 실패', [
        { part: 'admin', text: '관리자 확인: 실제 Spring API 호출이 실패했다. 가짜 trace는 생성하지 않는다.' },
        { part: 'function-output', text: error.message || String(error) },
      ])
    }
    throw error
  } finally {
    button.disabled = false
    button.textContent = 'Spring 실행'
  }
}

async function runBehaviorChat(event) {
  event.preventDefault()
  const input = aiBehaviorRoot?.querySelector('[data-ai-behavior-customer-input]')
  const text = String(input?.value || '').trim()
  if (!text) return
  const turnAt = behaviorTimestamp()
  appendAdminChatMessage('user', text)
  appendAdminChatMessage('system', 'Spring 실행 시작')
  try {
    const run = await runBehaviorTrace(text, turnAt)
    const visibleReply = extractRunLine(run, 18, 'visible').replace(/^고객에게 실제 노출:\s*/, '')
    const errorLine = (run?.steps || []).find((step) => step.status === 'ERROR')?.lines?.find((line) => line.part === 'function-output')?.text
    if (visibleReply) {
      appendAdminChatMessage('assistant', visibleReply)
      appendBehaviorMemoryTurn(text, visibleReply, turnAt)
      if (input) input.value = ''
    } else if (errorLine) {
      appendAdminChatMessage('system error', `실행 실패: ${errorLine}`)
    } else {
      appendAdminChatMessage('system', `실행 상태: ${run?.status || 'UNKNOWN'}`)
    }
  } catch (error) {
    appendAdminChatMessage('system error', `실행 실패: ${error.message || String(error)}`)
  }
}

function renderOAuthStatus(payload) {
  const status = aiBehaviorRoot?.querySelector('[data-ai-oauth-status]')
  if (!status) return
  status.dataset.keyRequired = String(Boolean(payload.keyRequired))
  status.dataset.tokenValid = String(Boolean(payload.token_valid))
  const keyStorePath = payload.digit_key_store_path || '(not configured)'
  status.textContent = `logged_in=${Boolean(payload.logged_in)} token_valid=${Boolean(payload.token_valid)} keyRequired=${Boolean(payload.keyRequired)} email=${payload.email || ''} key_store=${keyStorePath}`
  if (payload.keyRequired) {
    appendAdminChatMessage('system error', 'LLM 실행 전 OAuth digit key를 서버에 등록해야 합니다.')
  }
}

async function saveOAuthDigitKey() {
  const input = aiBehaviorRoot?.querySelector('[data-ai-oauth-digit-key]')
  const status = aiBehaviorRoot?.querySelector('[data-ai-oauth-status]')
  const digitKey = String(input?.value || '').trim()
  if (!digitKey) {
    if (status) status.textContent = 'OAuth digit key를 입력해야 합니다.'
    return
  }
  if (status) status.textContent = '서버에 OAuth digit key 등록 중'
  try {
    const response = await fetch('/api/oauth/key', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ digitKey }),
    })
    const data = await response.json()
    if (!response.ok || data.ok === false) {
      throw new Error(data.message || `HTTP ${response.status}`)
    }
    if (status) {
      const payload = data.status || {}
      renderOAuthStatus(payload)
    }
  } catch (error) {
    if (status) status.textContent = `등록 실패: ${error.message || String(error)}`
  }
}

async function checkOAuthStatus(options = {}) {
  const status = aiBehaviorRoot?.querySelector('[data-ai-oauth-status]')
  if (status && !options.silent) status.textContent = 'OAuth 상태 확인 중'
  try {
    const response = await fetch('/api/oauth/status', { headers: { Accept: 'application/json' } })
    const data = await response.json()
    if (!response.ok || data.ok === false) {
      throw new Error(data.message || `HTTP ${response.status}`)
    }
    const payload = data.status || {}
    renderOAuthStatus(payload)
    return payload
  } catch (error) {
    if (status) status.textContent = `상태 확인 실패: ${error.message || String(error)}`
    return null
  }
}

function showStoreChatbot() {
  const isLocalAdmin = ['localhost', '127.0.0.1'].includes(window.location.hostname)
  const storeUrl = isLocalAdmin
    ? 'http://localhost:5173/goods?showChatbot=1'
    : '/goods?showChatbot=1'
  const framePanel = aiBehaviorRoot?.querySelector('[data-ai-chatbot-frame]')
  const frame = aiBehaviorRoot?.querySelector('[data-ai-chatbot-iframe]')
  if (!framePanel || !frame) return
  frame.src = storeUrl
  framePanel.hidden = false
  framePanel.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

function hideStoreChatbotFrame() {
  const framePanel = aiBehaviorRoot?.querySelector('[data-ai-chatbot-frame]')
  const frame = aiBehaviorRoot?.querySelector('[data-ai-chatbot-iframe]')
  if (!framePanel || !frame) return
  framePanel.hidden = true
  frame.removeAttribute('src')
}

if (aiBehaviorRoot) {
  aiBehaviorRoot.querySelector('[data-ai-run-behavior]')?.addEventListener('click', runBehaviorTrace)
  aiBehaviorRoot.querySelector('[data-ai-admin-chat-form]')?.addEventListener('submit', runBehaviorChat)
  aiBehaviorRoot.querySelector('[data-ai-oauth-save-key]')?.addEventListener('click', saveOAuthDigitKey)
  aiBehaviorRoot.querySelector('[data-ai-oauth-check-status]')?.addEventListener('click', checkOAuthStatus)
  aiBehaviorRoot.querySelector('[data-ai-show-chatbot]')?.addEventListener('click', showStoreChatbot)
  aiBehaviorRoot.querySelector('[data-ai-hide-chatbot-frame]')?.addEventListener('click', hideStoreChatbotFrame)
  aiBehaviorRoot.querySelector('[data-ai-search-test-form]')?.addEventListener('submit', runDbSearchTest)
  renderDbHighlight()
  checkOAuthStatus({ silent: true })
}
