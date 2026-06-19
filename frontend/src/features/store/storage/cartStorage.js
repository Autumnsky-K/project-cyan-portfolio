const CART_STORAGE_KEY = 'cart'
const LEGACY_CART_STORAGE_KEY = 'store.cart'

function readStorage(key, fallback) {
  try {
    const value = localStorage.getItem(key)
    return value ? JSON.parse(value) : fallback
  } catch {
    return fallback
  }
}

export function loadCart() {
  const cart = readStorage(CART_STORAGE_KEY, null)
  return cart ?? readStorage(LEGACY_CART_STORAGE_KEY, [])
}

export function saveCart(cart) {
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart))
}

export function clearCart() {
  localStorage.removeItem(CART_STORAGE_KEY)
}
