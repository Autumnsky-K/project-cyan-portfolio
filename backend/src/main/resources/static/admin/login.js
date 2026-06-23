(() => {
  const shell = document.getElementById('adminLoginShell')
  const form = document.getElementById('adminLoginForm')
  const username = document.getElementById('adminUsername')
  const password = document.getElementById('adminPassword')
  const button = document.getElementById('adminLoginButton')
  const nextButton = document.getElementById('adminNextButton')
  const message = document.getElementById('adminLoginMessage')
  const attemptPanel = document.getElementById('adminAttemptPanel')
  const rows = document.getElementById('adminAttemptRows')
  const clientIp = document.getElementById('adminClientIp')
  const lockBanner = document.getElementById('adminLockBanner')
  const refreshButton = document.getElementById('adminRefreshAttempts')

  function nextPath() {
    const rawNext = shell?.dataset.next || new URLSearchParams(location.search).get('next') || '/admin'
    return rawNext.startsWith('/admin') && !rawNext.startsWith('//') ? rawNext : '/admin'
  }

  function setMessage(text, tone = '') {
    message.textContent = text
    message.className = `admin-login-message ${tone}`.trim()
  }

  function setAuthenticatedMode(authenticated) {
    username.disabled = authenticated
    password.disabled = authenticated
    button.hidden = authenticated
    nextButton.hidden = !authenticated
  }

  function formatTime(value) {
    if (!value) {
      return '-'
    }
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) {
      return '-'
    }
    return date.toLocaleString('ko-KR', {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })
  }

  function formatRemaining(ms) {
    const seconds = Math.ceil(Number(ms || 0) / 1000)
    if (seconds <= 0) {
      return '0초'
    }
    const minutes = Math.floor(seconds / 60)
    const rest = seconds % 60
    return minutes ? `${minutes}분 ${rest}초` : `${rest}초`
  }

  function resultClass(result) {
    if (result === 'success') {
      return 'result-success'
    }
    if (result === 'locked') {
      return 'result-locked'
    }
    return 'result-failure'
  }

  function resultText(result) {
    if (result === 'success') {
      return '성공'
    }
    if (result === 'locked') {
      return '락'
    }
    return '실패'
  }

  function cell(text, className = '') {
    const td = document.createElement('td')
    td.textContent = text
    if (className) {
      td.className = className
    }
    return td
  }

  function subtle(text) {
    const div = document.createElement('div')
    div.className = 'subtle'
    div.textContent = text
    return div
  }

  function setRecordsVisible(visible) {
    shell.classList.toggle('records-hidden', !visible)
    attemptPanel.hidden = !visible
  }

  function renderEmpty() {
    const tr = document.createElement('tr')
    const td = cell('기록 없음')
    td.colSpan = 4
    tr.append(td)
    rows.replaceChildren(tr)
  }

  function renderDashboard(data) {
    const authenticated = data.authenticated === true
    setRecordsVisible(authenticated)
    setAuthenticatedMode(authenticated)

    if (!authenticated) {
      renderEmpty()
      return
    }

    clientIp.textContent = `현재 IP ${data.clientIp || 'unknown'} · 3회 실패 시 30분 정지`

    if (data.lock?.locked) {
      lockBanner.hidden = false
      lockBanner.textContent = `현재 IP가 잠겨 있습니다. 남은 시간 ${formatRemaining(data.lock.remainingMs)}`
    } else {
      lockBanner.hidden = true
      lockBanner.textContent = ''
    }

    const attempts = Array.isArray(data.attempts) ? data.attempts : []
    if (!attempts.length) {
      renderEmpty()
      return
    }

    rows.replaceChildren(...attempts.map((attempt) => {
      const tr = document.createElement('tr')
      const ipCell = cell(attempt.ip || 'unknown')
      ipCell.append(subtle(attempt.username ? `id ${attempt.username}` : ''))

      const resultCell = cell(resultText(attempt.result), resultClass(attempt.result))
      const status = attempt.lockedUntil
        ? `락 만료 ${formatTime(attempt.lockedUntil)}`
        : attempt.reason || '-'
      const statusCell = cell(status)
      statusCell.append(subtle(`실패 ${attempt.failureCount || 0}/3`))

      tr.append(cell(formatTime(attempt.at)), ipCell, resultCell, statusCell)
      return tr
    }))
  }

  async function refreshStatus() {
    const response = await fetch('/admin/auth/status', { cache: 'no-store', credentials: 'include' })
    const data = await response.json()
    renderDashboard(data)
    if (data.authenticated) {
      setMessage('로그인되어 있습니다. 접속 기록을 확인한 뒤 다음을 누르세요.', 'ok')
    }
    return data
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault()
    button.disabled = true
    button.textContent = '확인 중'
    setMessage('로그인 확인 중')

    try {
      const response = await fetch('/admin/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ username: username.value, password: password.value }),
      })
      const data = await response.json()
      renderDashboard(data)

      if (response.ok && data.authenticated) {
        setMessage('로그인 성공. 접속 기록을 확인한 뒤 다음을 누르세요.', 'ok')
        return
      }

      if (response.status === 423 || data.lock?.locked) {
        setMessage(`3회 실패로 잠겼습니다. ${formatRemaining(data.lock?.remainingMs)} 뒤 다시 시도하세요.`, 'bad')
      } else {
        setMessage('아이디 또는 비밀번호가 맞지 않습니다.', 'bad')
      }
      password.value = ''
    } catch {
      setMessage('로그인 서버에 연결하지 못했습니다.', 'bad')
    } finally {
      if (!button.hidden) {
        button.disabled = false
        button.textContent = '로그인'
      }
    }
  })

  nextButton.addEventListener('click', () => {
    nextButton.disabled = true
    nextButton.textContent = '이동 중'
    location.href = nextPath()
  })

  refreshButton.addEventListener('click', async () => {
    refreshButton.disabled = true
    try {
      await refreshStatus()
    } finally {
      refreshButton.disabled = false
    }
  })

  refreshStatus().catch(() => {
    setRecordsVisible(false)
    setAuthenticatedMode(false)
    setMessage('상태 확인 실패', 'bad')
  })
})()
