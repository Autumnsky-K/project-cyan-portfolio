(() => {
  const root = document.querySelector('[data-payment-admin]')
  if (!root) {
    return
  }

  const rows = Array.from(root.querySelectorAll('[data-payment-row]'))
  const searchInput = root.querySelector('[data-payment-search]')
  const resetButton = root.querySelector('[data-payment-reset]')
  const providerTabs = Array.from(root.querySelectorAll('[data-provider-filter]'))
  const statusTabs = Array.from(root.querySelectorAll('[data-status-tab]'))
  const detailPanel = root.querySelector('[data-payment-detail-panel]')
  const closeButtons = Array.from(root.querySelectorAll('[data-detail-close]'))
  let selectedRow = null

  const flowClassMap = {
    done: 'flow-done',
    doneBlue: 'flow-done-blue',
    pending: 'flow-pending',
    blocked: 'flow-blocked',
    muted: 'flow-muted',
  }

  const formatAmount = (value) => `₩${Number(value || 0).toLocaleString('ko-KR')}`

  const setText = (selector, value) => {
    const target = root.querySelector(selector)
    if (target) {
      target.textContent = value
    }
  }

  const renderTerms = (terms) => {
    const list = root.querySelector('[data-detail-terms]')
    if (!list) {
      return
    }

    list.innerHTML = ''
    terms.split('|').filter(Boolean).forEach((term) => {
      const item = document.createElement('li')
      item.textContent = term
      list.appendChild(item)
    })
  }

  const renderFlow = (flow) => {
    const list = root.querySelector('[data-detail-flow]')
    if (!list) {
      return
    }

    list.innerHTML = ''
    flow.split('|').filter(Boolean).forEach((rawStep) => {
      const [label = '-', status = 'muted', message = '-'] = rawStep.split('=')
      const item = document.createElement('li')
      item.className = flowClassMap[status] || flowClassMap.muted

      const title = document.createElement('strong')
      title.textContent = label

      const detail = document.createElement('span')
      detail.textContent = message

      item.append(title, detail)
      list.appendChild(item)
    })
  }

  const openDetail = () => {
    root.classList.add('is-detail-open')
    detailPanel?.setAttribute('aria-hidden', 'false')
  }

  const closeDetail = () => {
    root.classList.remove('is-detail-open')
    detailPanel?.setAttribute('aria-hidden', 'true')
    rows.forEach((target) => target.classList.remove('is-selected'))
    selectedRow = null
  }

  const selectRow = (row) => {
    const isSameOpenRow = selectedRow === row && root.classList.contains('is-detail-open')
    if (isSameOpenRow) {
      closeDetail()
      return
    }

    selectedRow = row
    rows.forEach((target) => target.classList.toggle('is-selected', target === row))

    setText('[data-detail-order-id]', row.dataset.orderId || '-')
    setText('[data-detail-member]', row.dataset.member || '-')
    setText('[data-detail-provider]', row.dataset.providerLabel || row.dataset.provider || '-')
    setText('[data-detail-payment-status]', row.dataset.paymentStatus || '-')
    setText('[data-detail-order-status]', row.dataset.orderStatus || '-')
    setText('[data-detail-payment-key]', row.dataset.paymentKey || '-')
    setText('[data-detail-transaction-id]', row.dataset.transactionId || '-')
    setText('[data-detail-amount]', formatAmount(row.dataset.amount))
    setText('[data-detail-risk]', row.dataset.risk || '-')
    setText('[data-detail-failure]', row.dataset.failure || '-')
    setText('[data-detail-items]', row.dataset.items || '-')
    renderTerms(row.dataset.terms || '')
    renderFlow(row.dataset.flow || '')
    openDetail()
  }

  const activeButtonValue = (buttons, dataKey) => {
    const active = buttons.find((button) => button.classList.contains('is-active'))
    return active?.dataset[dataKey] || 'all'
  }

  const activeProviderValue = () => activeButtonValue(providerTabs, 'providerFilter')

  const activeStatusValue = () => {
    const active = statusTabs.find((tab) => tab.classList.contains('is-active'))
    return active?.dataset.statusTab || 'all'
  }

  const includesAnyStatus = (row, values) => {
    const combinedStatus = `${row.dataset.paymentStatus || ''} ${row.dataset.orderStatus || ''}`.toUpperCase()
    return values.some((value) => combinedStatus.includes(value))
  }

  const includesAnyPaymentStatus = (row, values) => {
    const paymentStatus = `${row.dataset.paymentStatus || ''}`.toUpperCase()
    return values.some((value) => paymentStatus.includes(value))
  }

  const matchesStatusFilter = (row, status) => {
    if (status === 'all') return true
    const isFailed = includesAnyStatus(row, ['FAIL', 'CANCEL', 'REFUND', 'REPAIR', 'ERROR'])
    const isSuccess = !isFailed && includesAnyStatus(row, ['DONE', 'PAID', 'APPROVED', 'SUCCESS'])
    const isPending = !isFailed && !isSuccess && includesAnyPaymentStatus(row, [
      'READY',
      'PENDING',
      'IN_PROGRESS',
      'PAYMENT_PENDING',
    ])
    if (status === 'SUCCESS') return isSuccess
    if (status === 'READY') return isPending
    if (status === 'FAILED') return isFailed
    return row.dataset.paymentStatus === status
  }

  const applyFilter = () => {
    const query = (searchInput?.value || '').trim().toLowerCase()
    const provider = activeProviderValue()
    const status = activeStatusValue()

    rows.forEach((row) => {
      const matchesQuery = !query || row.textContent.toLowerCase().includes(query) ||
        Object.values(row.dataset).some((value) => String(value).toLowerCase().includes(query))
      const matchesProvider = provider === 'all' || row.dataset.provider === provider
      const matchesStatus = matchesStatusFilter(row, status)
      row.classList.toggle('is-hidden', !(matchesQuery && matchesProvider && matchesStatus))
    })

    if (selectedRow?.classList.contains('is-hidden')) {
      closeDetail()
    }
  }

  rows.forEach((row) => {
    row.addEventListener('click', () => selectRow(row))
  })

  closeButtons.forEach((button) => {
    button.addEventListener('click', closeDetail)
  })

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && root.classList.contains('is-detail-open')) {
      closeDetail()
    }
  })

  searchInput?.addEventListener('input', applyFilter)

  providerTabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      providerTabs.forEach((target) => target.classList.toggle('is-active', target === tab))
      applyFilter()
    })
  })

  statusTabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      statusTabs.forEach((target) => target.classList.toggle('is-active', target === tab))
      applyFilter()
    })
  })

  resetButton?.addEventListener('click', () => {
    if (searchInput) searchInput.value = ''
    providerTabs.forEach((tab, index) => tab.classList.toggle('is-active', index === 0))
    statusTabs.forEach((tab, index) => tab.classList.toggle('is-active', index === 0))
    closeDetail()
    applyFilter()
  })

  applyFilter()
})()
