const PENDING_PAYMENT_STORAGE_KEY = 'pendingPayment'

function readStorage(key, fallback) {
  try {
    const value = localStorage.getItem(key)
    return value ? JSON.parse(value) : fallback
  } catch {
    return fallback
  }
}

export function loadPendingPayment() {
  return readStorage(PENDING_PAYMENT_STORAGE_KEY, null)
}

export function savePendingPayment(payment) {
  localStorage.setItem(PENDING_PAYMENT_STORAGE_KEY, JSON.stringify(payment))
}

export function clearPendingPayment() {
  localStorage.removeItem(PENDING_PAYMENT_STORAGE_KEY)
}
