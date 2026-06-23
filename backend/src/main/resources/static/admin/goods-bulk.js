(() => {
  const form = document.querySelector('[data-goods-bulk-form]')

  if (!form) {
    return
  }

  const rows = Array.from(form.querySelectorAll('.admin-bulk-row'))
  const checkboxes = Array.from(form.querySelectorAll('.admin-bulk-checkbox'))
  const masterCheckbox = form.querySelector('[data-goods-bulk-master]')
  const selectedCount = form.querySelector('[data-goods-bulk-count]')
  const bulkTagsInput = form.querySelector('[data-goods-bulk-tags]')
  const choiceInputs = Array.from(form.querySelectorAll('[data-choice-kind]'))
  const choiceOptions = {
    artist: readChoiceOptions('admin-bulk-artist-options'),
    category: readChoiceOptions('admin-bulk-category-options'),
    status: readChoiceOptions('admin-bulk-status-options'),
  }

  function readChoiceOptions(listId) {
    return Array.from(document.getElementById(listId)?.options ?? []).map((option) => ({
      label: option.value.trim(),
      value: option.dataset.value ?? '',
    }))
  }

  function findChoice(kind, label) {
    const normalizedLabel = label.trim()
    return choiceOptions[kind]?.find((option) => option.label === normalizedLabel) ?? null
  }

  function readInputValue(input) {
    return input.value.trim()
  }

  function updateSelectedCount() {
    const checkedCount = checkboxes.filter((checkbox) => checkbox.checked).length
    if (selectedCount) {
      selectedCount.textContent = String(checkedCount)
    }
    if (masterCheckbox) {
      masterCheckbox.checked = checkedCount > 0 && checkedCount === checkboxes.length
      masterCheckbox.indeterminate = checkedCount > 0 && checkedCount < checkboxes.length
    }
    rows.forEach((row) => {
      const checkbox = row.querySelector('.admin-bulk-checkbox')
      row.classList.toggle('is-selected', Boolean(checkbox?.checked))
    })
  }

  function syncChoiceInput(input, options = {}) {
    const kind = input.dataset.choiceKind
    const hiddenValue = input.closest('.admin-bulk-cell')?.querySelector(`[data-choice-value="${kind}"]`)
    const choice = findChoice(kind, input.value)

    if (choice) {
      input.dataset.lastValidLabel = choice.label
      input.dataset.lastValidValue = choice.value
      input.classList.remove('is-invalid')
      if (hiddenValue) {
        hiddenValue.value = choice.value
      }
      return true
    }

    input.classList.add('is-invalid')
    if (options.revert) {
      input.value = input.dataset.lastValidLabel || input.dataset.original || ''
      if (hiddenValue) {
        hiddenValue.value = input.dataset.lastValidValue || ''
      }
      input.classList.remove('is-invalid')
      markInputState(input)
    }
    return false
  }

  function markInputState(input) {
    const originalValue = input.dataset.original ?? ''
    const currentValue = readInputValue(input)
    const isDirty = currentValue !== originalValue
    const preview = input.closest('.admin-bulk-cell')?.querySelector('[data-original-preview]')
    const row = input.closest('.admin-bulk-row')

    input.classList.toggle('is-dirty', isDirty)
    row?.classList.toggle('is-dirty', Boolean(row.querySelector('.admin-bulk-input.is-dirty')))

    if (preview) {
      preview.hidden = !isDirty
      preview.textContent = input.dataset.originalLabel || originalValue || '비어 있음'
    }

    if (isDirty) {
      const rowCheckbox = row?.querySelector('.admin-bulk-checkbox')
      if (rowCheckbox) {
        rowCheckbox.checked = true
        updateSelectedCount()
      }
    }
  }

  function setChoiceInput(input, choice) {
    const hiddenValue = input.closest('.admin-bulk-cell')?.querySelector(`[data-choice-value="${input.dataset.choiceKind}"]`)
    input.value = choice.label
    input.dataset.lastValidLabel = choice.label
    input.dataset.lastValidValue = choice.value
    input.classList.remove('is-invalid')
    if (hiddenValue) {
      hiddenValue.value = choice.value
    }
    markInputState(input)
  }

  function applyBulkChoice(kind) {
    const bulkInput = form.querySelector(`[data-goods-bulk-choice="${kind}"]`)
    const choice = findChoice(kind, bulkInput?.value ?? '')

    if (!choice) {
      bulkInput?.focus()
      alert('허용된 값만 입력할 수 있습니다.')
      return
    }

    rows
      .filter((row) => row.querySelector('.admin-bulk-checkbox')?.checked)
      .forEach((row) => {
        const input = row.querySelector(`[data-choice-kind="${kind}"]`)
        if (input) {
          setChoiceInput(input, choice)
        }
      })
  }

  form.querySelectorAll('.admin-bulk-input').forEach((input) => {
    input.addEventListener('input', () => {
      if (input.dataset.choiceKind) {
        syncChoiceInput(input)
      }
      markInputState(input)
    })
    input.addEventListener('change', () => {
      if (input.dataset.choiceKind) {
        syncChoiceInput(input)
      }
      markInputState(input)
    })
    input.addEventListener('blur', () => {
      if (input.dataset.choiceKind) {
        syncChoiceInput(input, { revert: true })
      }
    })
    if (input.dataset.choiceKind) {
      syncChoiceInput(input)
    }
    markInputState(input)
  })

  checkboxes.forEach((checkbox) => {
    checkbox.addEventListener('change', updateSelectedCount)
  })

  masterCheckbox?.addEventListener('change', () => {
    checkboxes.forEach((checkbox) => {
      checkbox.checked = masterCheckbox.checked
    })
    updateSelectedCount()
  })

  form.querySelector('[data-goods-bulk-select-all]')?.addEventListener('click', () => {
    checkboxes.forEach((checkbox) => {
      checkbox.checked = true
    })
    updateSelectedCount()
  })

  form.querySelector('[data-goods-bulk-clear]')?.addEventListener('click', () => {
    checkboxes.forEach((checkbox) => {
      checkbox.checked = false
    })
    updateSelectedCount()
  })

  form.querySelectorAll('[data-goods-bulk-apply-choice]').forEach((button) => {
    button.addEventListener('click', () => applyBulkChoice(button.dataset.goodsBulkApplyChoice))
  })

  form.querySelector('[data-goods-bulk-apply-tags]')?.addEventListener('click', () => {
    const tagValue = bulkTagsInput?.value.trim() ?? ''
    const targetRows = rows.filter((row) => row.querySelector('.admin-bulk-checkbox')?.checked)

    targetRows.forEach((row) => {
      const tagsInput = row.querySelector('input[name="tagsText"]')
      if (!tagsInput) {
        return
      }
      tagsInput.value = tagValue
      tagsInput.dispatchEvent(new Event('input', { bubbles: true }))
    })
  })

  form.addEventListener('submit', (event) => {
    const invalidChoice = choiceInputs.find((input) => !syncChoiceInput(input))
    if (invalidChoice) {
      event.preventDefault()
      invalidChoice.focus()
      alert('아티스트, 카테고리, 판매 상태는 허용된 값만 입력할 수 있습니다.')
    }
  })

  updateSelectedCount()
})()
