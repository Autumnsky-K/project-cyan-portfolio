import { useEffect, useMemo, useState } from "react"
import { fetchGoods } from '../../../api/goods'
import {
  createOrderWithItems,
  fetchOrders as fetchRemoteOrders,
} from '../../../api/orders'
import {
  fetchSupabaseGoods,
  fetchSupabaseOrders,
  hasSupabaseStoreConfig,
} from '../../../api/supabaseStore'
import { fallbackProducts } from '../data/mockProducts'
import {
  createKakaoPendingPayment,
  getKakaoReadyDebugInfo,
  handleMockPayment as buildMockPaidOrder,
  requestKakaoPayReady,
} from '../services/paymentService'
import {
  markCanceled,
  markExpired,
  markFailed,
} from '../services/paymentResultService'
import { loadCart, saveCart } from '../storage/cartStorage'
import { loadOrders, saveOrder as persistOrder } from '../storage/orderStorage'
import {
  clearPendingPayment,
  loadPendingPayment,
  savePendingPayment,
} from '../storage/paymentStorage'
import {
  ORDER_STATUS,
  PAYMENT_METHODS,
  calculateTotalPrice,
  calculateTotalQuantity,
  createOrderId,
  getPaymentMethodLabel,
  isPendingPaymentExpired,
  normalizeProduct,
} from '../utils/storeUtils'

function markLocalDevOrders(orders) {
  return orders.map((order) => ({
    ...order,
    source: order.source || 'local-dev',
  }))
}

function normalizeGoodsList(goods) {
  const list = Array.isArray(goods) ? goods : goods?.content

  if (!Array.isArray(list)) return []
  return list.map(normalizeProduct)
}

function normalizeRemoteOrders(orders) {
  if (Array.isArray(orders)) return orders
  if (Array.isArray(orders?.content)) return orders.content
  return []
}

async function fetchCartGoods() {
  if (hasSupabaseStoreConfig()) {
    return fetchSupabaseGoods()
  }

  return fetchGoods()
}

async function fetchCartOrders() {
  if (hasSupabaseStoreConfig()) {
    return fetchSupabaseOrders()
  }

  return fetchRemoteOrders()
}

export function useStoreFlow() {
  const [storeProducts, setStoreProducts] = useState([])
  const [productStatus, setProductStatus] = useState('loading')
  const [productMessage, setProductMessage] = useState('')
  const [cart, setCart] = useState(loadCart)
  const [orders, setOrders] = useState([])
  const [orderHistoryMessage, setOrderHistoryMessage] = useState('')
  const [pendingPayment, setPendingPayment] = useState(loadPendingPayment)
  const [checkoutForm, setCheckoutForm] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
  })
  const [paymentMethod, setPaymentMethod] = useState(
    pendingPayment?.paymentMethod || PAYMENT_METHODS.MOCK,
  )
  const [paymentStatus, setPaymentStatus] = useState(
    pendingPayment ? ORDER_STATUS.PAYMENT_PENDING : ORDER_STATUS.CREATED,
  )
  const [errors, setErrors] = useState([])
  const [message, setMessage] = useState('')
  const [completedOrder, setCompletedOrder] = useState(null)
  const [lastKakaoReadyPayload, setLastKakaoReadyPayload] = useState(null)
  const [lastKakaoReadyResponse, setLastKakaoReadyResponse] = useState(null)
  const [lastKakaoReadyDebug, setLastKakaoReadyDebug] = useState(
    getKakaoReadyDebugInfo,
  )
  const [lastKakaoReadyError, setLastKakaoReadyError] = useState('')

  const cartItems = useMemo(
    () =>
      cart
        .map((item) => {
          const product = storeProducts.find(
            (target) => target.id === item.productId,
          )
          return product ? { ...product, quantity: item.quantity } : null
        })
        .filter(Boolean),
    [cart, storeProducts],
  )

  const totalQuantity = useMemo(
    () => calculateTotalQuantity(cartItems),
    [cartItems],
  )
  const totalPrice = useMemo(() => calculateTotalPrice(cartItems), [cartItems])
  const isCartEmpty = cartItems.length === 0
  const isPaymentProcessing =
    paymentStatus === ORDER_STATUS.PAYMENT_READY ||
    paymentStatus === ORDER_STATUS.PAYMENT_PENDING

  useEffect(() => {
    let ignore = false

    fetchCartGoods()
      .then((goods) => {
        if (ignore) return
        const nextProducts = normalizeGoodsList(goods)

        if (nextProducts.length === 0) {
          setStoreProducts([])
          setProductStatus('empty')
          setProductMessage('No goods were returned from the API.')
          return
        }

        setStoreProducts(nextProducts)
        setProductStatus('success')
        setProductMessage('')
      })
      .catch((error) => {
        if (ignore) return
        console.error('[Cart] Store goods load failed.', error)
        setStoreProducts([])
        setProductStatus('error')
        setProductMessage(
          hasSupabaseStoreConfig()
            ? `Supabase goods load failed: ${error.message}`
            : 'Supabase env is missing. Set VITE_SUPABASE_URL or VITE_SUPABASE_FUNCTIONS_URL, plus VITE_SUPABASE_ANON_KEY or VITE_SUPABASE_PUBLISHABLE_KEY.',
        )
      })

    return () => {
      ignore = true
    }
  }, [])

  async function loadOrderHistory() {
    try {
      const remoteOrders = await fetchCartOrders()
      setOrders(normalizeRemoteOrders(remoteOrders))
      setOrderHistoryMessage('')
    } catch (error) {
      console.error('[Cart] Orders API failed. Showing local dev preview orders.', error)
      setOrders(markLocalDevOrders(loadOrders()))
      setOrderHistoryMessage('Showing local dev preview orders because the orders API is unavailable.')
    }
  }

  useEffect(() => {
    let ignore = false

    fetchCartOrders()
      .then((remoteOrders) => {
        if (ignore) return
        setOrders(normalizeRemoteOrders(remoteOrders))
        setOrderHistoryMessage('')
      })
      .catch((error) => {
        if (ignore) return
        console.error('[Cart] Orders API failed. Showing local dev preview orders.', error)
        setOrders(markLocalDevOrders(loadOrders()))
        setOrderHistoryMessage('Showing local dev preview orders because the orders API is unavailable.')
      })

    return () => {
      ignore = true
    }
  }, [])

  function useFallbackProducts() {
    setStoreProducts(fallbackProducts)
    setProductStatus('fallback')
    setProductMessage('Showing dev preview products.')
  }

  useEffect(() => {
    if (!pendingPayment || !isPendingPaymentExpired(pendingPayment)) {
      return undefined
    }

    markExpired()
    const nextOrders = loadOrders()

    const timerId = setTimeout(() => {
      setOrders(markLocalDevOrders(nextOrders))
      setPendingPayment(null)
      setPaymentStatus(ORDER_STATUS.EXPIRED)
      setMessage('The pending payment expired after 30 minutes.')
    }, 0)

    return () => {
      clearTimeout(timerId)
    }
  }, [pendingPayment])

  useEffect(() => {
    saveCart(cart)
  }, [cart])

  useEffect(() => {
    if (pendingPayment) {
      savePendingPayment(pendingPayment)
      return
    }

    clearPendingPayment()
  }, [pendingPayment])

  function addToCart(productId) {
    setCart((currentCart) => {
      const cartItem = currentCart.find((item) => item.productId === productId)

      if (!cartItem) {
        return [...currentCart, { productId, quantity: 1 }]
      }

      return currentCart.map((item) =>
        item.productId === productId
          ? { ...item, quantity: item.quantity + 1 }
          : item,
      )
    })
    setErrors([])
    setMessage('')
    setPaymentStatus(ORDER_STATUS.CREATED)
    setCompletedOrder(null)
  }

  function increaseQuantity(productId) {
    setCart((currentCart) =>
      currentCart.map((item) =>
        item.productId === productId
          ? { ...item, quantity: item.quantity + 1 }
          : item,
      ),
    )
  }

  function decreaseQuantity(productId) {
    setCart((currentCart) =>
      currentCart
        .map((item) =>
          item.productId === productId
            ? { ...item, quantity: item.quantity - 1 }
            : item,
        )
        .filter((item) => item.quantity > 0),
    )
  }

  function removeFromCart(productId) {
    setCart((currentCart) =>
      currentCart.filter((item) => item.productId !== productId),
    )
  }

  function updateCheckoutForm(field, value) {
    setCheckoutForm((currentForm) => ({
      ...currentForm,
      [field]: value,
    }))
    setMessage('')
  }

  function validateOrder() {
    const nextErrors = []

    if (isCartEmpty) nextErrors.push('Add at least one product to the cart.')
    if (!checkoutForm.name.trim()) nextErrors.push('Enter a customer name.')
    if (!checkoutForm.email.trim()) nextErrors.push('Enter an email address.')
    if (!checkoutForm.phone.trim()) nextErrors.push('Enter a phone number.')
    if (!checkoutForm.address.trim()) nextErrors.push('Enter a shipping address.')

    setErrors(nextErrors)
    return nextErrors.length === 0
  }

  function buildOrder(status = ORDER_STATUS.CREATED) {
    const orderId = createOrderId()

    return {
      orderId,
      orderNumber: orderId,
      partnerOrderId: `PARTNER-${orderId}`,
      items: cartItems.map((item) => ({
        productId: item.id,
        goodsId: item.goodsId,
        name: item.name,
        artist: item.artist,
        image: item.image,
        price: item.price,
        quantity: item.quantity,
      })),
      totalQuantity,
      totalPrice,
      customer: {
        name: checkoutForm.name.trim(),
        email: checkoutForm.email.trim(),
        phone: checkoutForm.phone.trim(),
        address: checkoutForm.address.trim(),
      },
      paymentMethod: getPaymentMethodLabel(paymentMethod),
      paymentMethodCode: paymentMethod,
      status,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  }

  function savePaidOrder(order) {
    setOrders((currentOrders) => [order, ...currentOrders])
    setCompletedOrder(order)
    setCart([])
    setPendingPayment(null)
    setErrors([])
    setPaymentStatus(ORDER_STATUS.PAID)
    setMessage('Payment completed. Check the order result below.')
  }

  function saveTerminalOrder(order, status) {
    const nextOrder = {
      ...order,
      status,
      updatedAt: new Date().toISOString(),
    }
    const nextOrders = persistOrder(nextOrder)

    setOrders(markLocalDevOrders(nextOrders))
    return nextOrder
  }

  async function handleMockPayment(order) {
    const pendingOrder = {
      ...order,
      status: ORDER_STATUS.PAYMENT_PENDING,
      updatedAt: new Date().toISOString(),
    }

    try {
      setPaymentStatus(ORDER_STATUS.PAYMENT_PENDING)
      setMessage('Completing dev preview payment and saving the order.')

      const paidOrder = await createOrderWithItems({
        ...pendingOrder,
        status: ORDER_STATUS.PAID,
        updatedAt: new Date().toISOString(),
      })

      savePaidOrder(paidOrder)
      await loadOrderHistory()
    } catch (error) {
      console.error('[Cart] Order API save failed. Falling back to local preview.', error)
      const paidOrder = buildMockPaidOrder(pendingOrder)
      const nextOrders = persistOrder({ ...paidOrder, source: 'local-dev' })

      setOrders(markLocalDevOrders(nextOrders))
      savePaidOrder({ ...paidOrder, source: 'local-dev' })
      setOrderHistoryMessage('Order saved to local dev preview because the orders API is unavailable.')
    }
  }

  async function handleKakaoPayment(order) {
    const readyOrder = {
      ...order,
      status: ORDER_STATUS.PAYMENT_READY,
      updatedAt: new Date().toISOString(),
    }

    try {
      setPendingPayment(null)
      setPaymentStatus(ORDER_STATUS.PAYMENT_READY)
      setMessage('Preparing KakaoPay payment.')
      setLastKakaoReadyPayload(readyOrder)
      setLastKakaoReadyResponse(null)
      setLastKakaoReadyDebug(getKakaoReadyDebugInfo())
      setLastKakaoReadyError('')

      const kakaoReady = await requestKakaoPayReady(readyOrder)
      setLastKakaoReadyResponse(kakaoReady)
      setLastKakaoReadyDebug({
        paymentMode: kakaoReady.paymentMode,
        readyRequestUrl: kakaoReady.readyRequestUrl,
        usedFallback: kakaoReady.usedFallback,
      })

      const nextPendingPayment = createKakaoPendingPayment(
        readyOrder,
        kakaoReady,
      )
      const pendingOrder = {
        ...readyOrder,
        status: ORDER_STATUS.PAYMENT_PENDING,
        updatedAt: new Date().toISOString(),
      }
      const nextOrders = persistOrder(pendingOrder)

      setOrders(markLocalDevOrders(nextOrders))
      setPendingPayment(nextPendingPayment)
      setPaymentStatus(ORDER_STATUS.PAYMENT_PENDING)
      setMessage('KakaoPay payment is ready. Continue on the approval page.')

      const nextRedirectPcUrl =
        kakaoReady?.nextRedirectPcUrl || kakaoReady?.next_redirect_pc_url

      if (nextRedirectPcUrl) {
        window.location.href = nextRedirectPcUrl
      }
    } catch (error) {
      setLastKakaoReadyError(error.message)
      saveTerminalOrder(order, ORDER_STATUS.PAYMENT_FAILED)
      setPaymentStatus(ORDER_STATUS.PAYMENT_FAILED)
      setPendingPayment(null)
      setMessage('KakaoPay preparation failed. Try again after checking the backend payment API.')
    }
  }

  function handlePaymentFail(failMessage = 'Payment failed.') {
    if (pendingPayment) {
      markFailed()
      setOrders(markLocalDevOrders(loadOrders()))
    }

    setPaymentStatus(ORDER_STATUS.PAYMENT_FAILED)
    setPendingPayment(null)
    setMessage(failMessage)
  }

  function handlePaymentCancel() {
    if (pendingPayment) {
      markCanceled()
      setOrders(markLocalDevOrders(loadOrders()))
    }

    setPaymentStatus(ORDER_STATUS.CANCELED)
    setPendingPayment(null)
    setMessage('Payment was canceled. Cart items are still available.')
  }

  function retryPayment() {
    if (!pendingPayment) {
      setMessage('No pending payment is available.')
      return
    }

    if (isPendingPaymentExpired(pendingPayment)) {
      markExpired()
      setOrders(markLocalDevOrders(loadOrders()))
      setPendingPayment(null)
      setPaymentStatus(ORDER_STATUS.EXPIRED)
      setMessage('The pending payment expired after 30 minutes.')
      return
    }

    const retryOrder = orders.find(
      (order) =>
        (order.orderId || order.orderNumber) === pendingPayment.orderId ||
        order.orderId === pendingPayment.localOrderId,
    )

    if (!retryOrder) {
      setMessage('Could not find the pending order. Start checkout again.')
      return
    }

    setCompletedOrder(null)
    setPaymentMethod(pendingPayment.paymentMethod)

    if (pendingPayment.paymentMethod === PAYMENT_METHODS.KAKAO_PAY) {
      handleKakaoPayment(retryOrder)
      return
    }

    handleMockPayment(retryOrder)
  }

  function handleCheckout(event) {
    event.preventDefault()
    setCompletedOrder(null)

    if (!validateOrder()) {
      setPaymentStatus(ORDER_STATUS.PAYMENT_FAILED)
      setMessage('Check the order form and try again.')
      return
    }

    const createdOrder = buildOrder(ORDER_STATUS.CREATED)
    setPaymentStatus(ORDER_STATUS.CREATED)

    if (paymentMethod === PAYMENT_METHODS.KAKAO_PAY) {
      handleKakaoPayment(createdOrder)
      return
    }

    handleMockPayment(createdOrder)
  }

  return {
    cartItems,
    checkoutForm,
    completedOrder,
    errors,
    isCartEmpty,
    isPaymentProcessing,
    lastKakaoReadyDebug,
    lastKakaoReadyError,
    lastKakaoReadyPayload,
    lastKakaoReadyResponse,
    message,
    orderHistoryMessage,
    orders,
    paymentMethod,
    paymentStatus,
    pendingPayment,
    productMessage,
    productStatus,
    products: storeProducts,
    storedPendingPayment: loadPendingPayment(),
    totalPrice,
    totalQuantity,
    addToCart,
    decreaseQuantity,
    handleCheckout,
    handlePaymentCancel,
    handlePaymentFail,
    increaseQuantity,
    removeFromCart,
    retryPayment,
    setPaymentMethod,
    useFallbackProducts,
    updateCheckoutForm,
  }
}
