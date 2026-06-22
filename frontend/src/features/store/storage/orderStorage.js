const ORDERS_STORAGE_KEY = 'orders'
const LEGACY_ORDERS_STORAGE_KEY = 'store.orders'

function readStorage(key, fallback) {
  try {
    const value = localStorage.getItem(key)
    return value ? JSON.parse(value) : fallback
  } catch {
    return fallback
  }
}

export function loadOrders() {
  const orders = readStorage(ORDERS_STORAGE_KEY, null)
  return orders ?? readStorage(LEGACY_ORDERS_STORAGE_KEY, [])
}

export function saveOrders(orders) {
  localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders))
}

export function saveOrder(order) {
  const orders = loadOrders()
  const orderKey = order.orderId || order.orderNumber
  const orderExists = orders.some(
    (target) => (target.orderId || target.orderNumber) === orderKey,
  )
  const nextOrders = orderExists
    ? orders.map((target) =>
        (target.orderId || target.orderNumber) === orderKey ? order : target,
      )
    : [order, ...orders]

  saveOrders(nextOrders)
  return nextOrders
}
