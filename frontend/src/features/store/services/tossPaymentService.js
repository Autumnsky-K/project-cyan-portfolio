const TOSS_SDK_URL = 'https://js.tosspayments.com/v2/standard'
const TOSS_CLIENT_KEY =
  import.meta.env.VITE_TOSS_CLIENT_KEY ??
  import.meta.env.VITE_TOSS_PAYMENTS_CLIENT_KEY ??
  ''

let tossSdkPromise = null

function loadTossSdk() {
  if (window.TossPayments) {
    return Promise.resolve(window.TossPayments)
  }

  if (tossSdkPromise) {
    return tossSdkPromise
  }

  tossSdkPromise = new Promise((resolve, reject) => {
    const existingScript = document.querySelector(`script[src="${TOSS_SDK_URL}"]`)

    if (existingScript) {
      existingScript.addEventListener('load', () => resolve(window.TossPayments), { once: true })
      existingScript.addEventListener('error', () => reject(new Error('Failed to load Toss Payments SDK.')), { once: true })
      return
    }

    const script = document.createElement('script')
    script.src = TOSS_SDK_URL
    script.async = true
    script.onload = () => resolve(window.TossPayments)
    script.onerror = () => reject(new Error('Failed to load Toss Payments SDK.'))
    document.head.appendChild(script)
  })

  return tossSdkPromise
}

function digitsOnly(value) {
  return String(value ?? '').replace(/\D/g, '')
}

export async function requestTossPayment(tossReady, order) {
  if (!TOSS_CLIENT_KEY) {
    throw new Error('Toss Payments client key is not configured.')
  }

  const TossPayments = await loadTossSdk()
  const tossPayments = TossPayments(TOSS_CLIENT_KEY)
  const payment = tossPayments.payment({
    customerKey: tossReady.customerKey,
  })

  await payment.requestPayment({
    method: 'CARD',
    amount: {
      currency: 'KRW',
      value: Number(tossReady.amount),
    },
    orderId: tossReady.orderNo,
    orderName: tossReady.orderName,
    successUrl: new URL('/payment/success', window.location.origin).toString(),
    failUrl: new URL('/payment/fail', window.location.origin).toString(),
    customerEmail: order.customer.email,
    customerName: order.customer.name,
    customerMobilePhone: digitsOnly(order.customer.phone),
    windowTarget: 'self',
  })
}
