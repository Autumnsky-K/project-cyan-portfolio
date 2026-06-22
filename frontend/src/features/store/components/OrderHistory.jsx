import { formatDate, formatPrice, getStatusLabel } from '../utils/storeUtils'

function getOrderSourceLabel(source) {
  return source === 'local-dev' ? 'Local dev preview' : 'Remote order'
}

function getOrderNumber(order) {
  return order.orderNumber || order.order_no || order.orderId || order.order_id
}

function getOrderDate(order) {
  return order.createdAt || order.created_at || order.ordered_at || order.updated_at
}

function getOrderCustomer(order) {
  const name = order.customer?.name || order.recipient_name
  const phone = order.customer?.phone || order.recipient_phone

  return [name, phone].filter(Boolean).join(' / ')
}

function getOrderAddress(order) {
  return order.customer?.address || order.address
}

function getOrderTotal(order) {
  return order.totalPrice ?? order.total_amount ?? order.payment_amount
}

function getOrderStatus(order) {
  return order.status || order.order_status || order.paymentStatus || order.payment_status
}

function OrderHistory({ completedOrder, message, orders }) {
  const visibleOrders = orders
    .filter((order) => getOrderNumber(order))
    .slice(0, 8)

  return (
    <>
      {completedOrder && (
        <section className="store-section" aria-labelledby="complete-title">
          <h2 id="complete-title">Order Complete</h2>
          <div className="completed-order">
            <p>
              Order <strong>{completedOrder.orderNumber || completedOrder.orderId}</strong>
            </p>
            <p>
              Total <strong>{formatPrice(completedOrder.totalPrice)}</strong>
            </p>
            <p>
              Status <strong>{getStatusLabel(completedOrder.status)}</strong>
            </p>
          </div>
        </section>
      )}

      <section className="store-section" id="order-history" aria-labelledby="orders-title">
        <h2 id="orders-title">Order History</h2>
        {message && <p className="status-message">{message}</p>}
        {visibleOrders.length === 0 ? (
          <p>No orders yet.</p>
        ) : (
          <div className="order-list">
            {visibleOrders.map((order) => {
              const customer = getOrderCustomer(order)
              const address = getOrderAddress(order)
              const status = getOrderStatus(order)
              const total = getOrderTotal(order)
              const items = order.items ?? []

              return (
              <article className="order-item" key={getOrderNumber(order)}>
                <div className="order-summary">
                  <strong>{getOrderNumber(order)}</strong>
                  <span>{formatDate(getOrderDate(order))}</span>
                </div>
                <div className="order-meta">
                  <span>{getOrderSourceLabel(order.source)}</span>
                  {status && <span>{getStatusLabel(status)}</span>}
                  {total !== undefined && <strong>{formatPrice(total)}</strong>}
                </div>
                {(customer || address) && (
                  <p className="order-customer">
                    {[customer, address].filter(Boolean).join(' / ')}
                  </p>
                )}
                {items.length > 0 && (
                  <ul>
                    {items.slice(0, 3).map((item) => (
                      <li key={`${getOrderNumber(order)}-${item.productId || item.goodsId}`}>
                        {item.name} x {item.quantity} ={' '}
                        {formatPrice(item.price * item.quantity)}
                      </li>
                    ))}
                  </ul>
                )}
              </article>
              )
            })}
          </div>
        )}
      </section>
    </>
  )
}

export default OrderHistory
