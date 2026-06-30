import { useEffect, useMemo, useState } from "react"
import { fetchGoods } from '../../../api/goods'
import { prepareCheckout } from '../../../api/checkout'
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
import { requestTossPayment } from '../services/tossPaymentService'
import { loadOrders, saveOrder as persistOrder } from '../storage/orderStorage'
import {
  clearPendingPayment,
  loadPendingPayment,
  savePendingPayment,
} from '../storage/paymentStorage'
import { useCart } from '../../cart/useCart'
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

function normalizeMemberId(value) {
  const memberId = String(value ?? '').trim()
  return /^\d+$/.test(memberId) ? Number(memberId) : null
}

function formatKoreanPhoneNumber(value) {
  const digits = String(value ?? '').replace(/\D/g, '').slice(0, 11)

  if (digits.length <= 3) {
    return digits
  }
  if (digits.length <= 7) {
    return `${digits.slice(0, 3)}-${digits.slice(3)}`
  }

  return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`
}

const CHECKOUT_FORM_STORAGE_KEY = 'checkoutForm'

function getCheckoutFormStorageKey(defaultMemberId) {
  const memberId = normalizeMemberId(defaultMemberId)

  return memberId ? `${CHECKOUT_FORM_STORAGE_KEY}:${memberId}` : CHECKOUT_FORM_STORAGE_KEY
}

function getDefaultCheckoutForm(defaults = {}) {
  return {
    memberId: defaults.memberId == null ? '' : String(defaults.memberId),
    name: String(defaults.name ?? '').trim(),
    email: String(defaults.email ?? '').trim(),
    phone: formatKoreanPhoneNumber(defaults.phone ?? ''),
    address: String(defaults.address ?? '').trim(),
    addressDetail: String(defaults.addressDetail ?? '').trim(),
    deliveryRequest: '',
  }
}

function loadCheckoutForm(defaults = {}) {
  const defaultForm = getDefaultCheckoutForm(defaults)
  const storageKey = getCheckoutFormStorageKey(defaults.memberId)

  try {
    const value =
      localStorage.getItem(storageKey) ??
      localStorage.getItem(CHECKOUT_FORM_STORAGE_KEY)
    const savedForm = value ? JSON.parse(value) : null

    if (!savedForm || typeof savedForm !== 'object') {
      return defaultForm
    }

    const defaultName = String(defaults.name ?? '').trim()
    const defaultEmail = String(defaults.email ?? '').trim()
    const defaultPhone = formatKoreanPhoneNumber(defaults.phone ?? '')
    const defaultAddress = String(defaults.address ?? '').trim()
    const defaultAddressDetail = String(defaults.addressDetail ?? '').trim()

    return {
      ...defaultForm,
      ...savedForm,
      memberId: defaultForm.memberId || savedForm.memberId,
      name: defaultName || String(savedForm.name ?? defaultForm.name).trim(),
      email: defaultEmail || String(savedForm.email ?? defaultForm.email).trim(),
      phone: defaultPhone || formatKoreanPhoneNumber(savedForm.phone ?? defaultForm.phone),
      address: defaultAddress || String(savedForm.address ?? defaultForm.address).trim(),
      addressDetail:
        defaultAddressDetail || String(savedForm.addressDetail ?? defaultForm.addressDetail ?? '').trim(),
    }
  } catch {
    return defaultForm
  }
}

function saveCheckoutForm(form, defaultMemberId) {
  localStorage.setItem(getCheckoutFormStorageKey(defaultMemberId), JSON.stringify(form))
}

function clearCheckoutForm(defaultMemberId) {
  localStorage.removeItem(getCheckoutFormStorageKey(defaultMemberId))
}

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

export function useStoreFlow(options = {}) {
  const {
    allowLocalFallback = false,
    defaultCustomerName = '',
    defaultCustomerEmail = '',
    defaultCustomerPhone = '',
    defaultCustomerAddress = '',
    defaultCustomerAddressDetail = '',
    defaultMemberId = null,
    fetchOrderHistory = false,
  } = options
  const defaultCheckoutForm = useMemo(
    () =>
      getDefaultCheckoutForm({
        memberId: defaultMemberId,
        name: defaultCustomerName,
        email: defaultCustomerEmail,
        phone: defaultCustomerPhone,
        address: defaultCustomerAddress,
        addressDetail: defaultCustomerAddressDetail,
      }),
    [
      defaultCustomerAddress,
      defaultCustomerAddressDetail,
      defaultCustomerEmail,
      defaultCustomerName,
      defaultCustomerPhone,
      defaultMemberId,
    ],
  )
  const {
    items: sharedCartItems,
    status: cartStatus,
    error: cartError,
    isSignedIn: isCartSignedIn,
    hasBlockingIssue: hasBlockingCartIssue,
    addCartItem,
    updateCartItemQuantity,
    removeCartItem,
    clearCart,
  } = useCart()
  const [storeProducts, setStoreProducts] = useState([])
  const [productStatus, setProductStatus] = useState('loading')
  const [productMessage, setProductMessage] = useState('')
  const [orders, setOrders] = useState([])
  const [orderHistoryMessage, setOrderHistoryMessage] = useState('')
  const [pendingPayment, setPendingPayment] = useState(loadPendingPayment)
  const [checkoutForm, setCheckoutForm] = useState(() =>
    loadCheckoutForm({
      memberId: defaultMemberId,
      name: defaultCustomerName,
      email: defaultCustomerEmail,
      phone: defaultCustomerPhone,
      address: defaultCustomerAddress,
      addressDetail: defaultCustomerAddressDetail,
    }),
  )
  const [paymentMethod, setPaymentMethod] = useState(
    pendingPayment?.paymentMethod || PAYMENT_METHODS.KAKAO_PAY,
  )
  const [paymentStatus, setPaymentStatus] = useState(
    pendingPayment ? ORDER_STATUS.PAYMENT_PENDING : ORDER_STATUS.CREATED,
  )
  const [isPreparingPayment, setIsPreparingPayment] = useState(false)
  const [errors, setErrors] = useState([])
  const [message, setMessage] = useState('')
  const [completedOrder, setCompletedOrder] = useState(null)
  const [lastKakaoReadyPayload, setLastKakaoReadyPayload] = useState(null)
  const [lastKakaoReadyResponse, setLastKakaoReadyResponse] = useState(null)
  const [lastKakaoReadyDebug, setLastKakaoReadyDebug] = useState(
    getKakaoReadyDebugInfo,
  )
  const [lastKakaoReadyError, setLastKakaoReadyError] = useState('')

  useEffect(() => {
    saveCheckoutForm(checkoutForm, defaultMemberId)
  }, [checkoutForm, defaultMemberId])

  useEffect(() => {
    if (
      !defaultMemberId &&
      !defaultCustomerName &&
      !defaultCustomerEmail &&
      !defaultCustomerPhone &&
      !defaultCustomerAddress &&
      !defaultCustomerAddressDetail
    ) return undefined

    const timerId = window.setTimeout(() => {
      setCheckoutForm((currentForm) =>
        currentForm.memberId === defaultCheckoutForm.memberId &&
        currentForm.name === defaultCheckoutForm.name &&
        currentForm.email === defaultCheckoutForm.email &&
        currentForm.phone === defaultCheckoutForm.phone &&
        currentForm.address === defaultCheckoutForm.address &&
        currentForm.addressDetail === defaultCheckoutForm.addressDetail
          ? currentForm
          : {
              ...currentForm,
              memberId: defaultCheckoutForm.memberId || currentForm.memberId,
              name: defaultCheckoutForm.name || currentForm.name,
              email: defaultCheckoutForm.email || currentForm.email,
              phone: defaultCheckoutForm.phone || currentForm.phone,
              address: defaultCheckoutForm.address || currentForm.address,
              addressDetail: defaultCheckoutForm.addressDetail || currentForm.addressDetail,
            },
      )
    }, 0)

    return () => window.clearTimeout(timerId)
  }, [
    defaultCheckoutForm,
    defaultCustomerAddress,
    defaultCustomerAddressDetail,
    defaultCustomerEmail,
    defaultCustomerName,
    defaultCustomerPhone,
    defaultMemberId,
  ])

  const cartItems = useMemo(
    () =>
      sharedCartItems
        .map((item) => {
          const product = storeProducts.find(
            (target) =>
              String(target.id) === String(item.goodsId) ||
              String(target.goodsId) === String(item.goodsId),
          )
          if (product) {
            return {
              ...product,
              cartIssue: item.cartIssue,
              cartItemKey: item.cartItemKey,
              quantity: item.quantity,
            }
          }

          return {
            id: String(item.goodsId),
            cartItemKey: item.cartItemKey,
            goodsId: item.goodsId,
            name: item.name,
            artist: item.artistName,
            description: item.categoryName,
            image: item.imageUrl || '',
            price: item.price,
            quantity: item.quantity,
            cartIssue: item.cartIssue,
          }
        })
        .filter(Boolean),
    [sharedCartItems, storeProducts],
  )

  const totalQuantity = useMemo(
    () => calculateTotalQuantity(cartItems),
    [cartItems],
  )
  const totalPrice = useMemo(() => calculateTotalPrice(cartItems), [cartItems])
  const isCartEmpty = cartItems.length === 0
  const isPaymentProcessing = isPreparingPayment

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
      if (!allowLocalFallback) {
        console.error('[Cart] Orders API failed.', error)
        setOrders([])
        setOrderHistoryMessage('Order history is unavailable.')
        return
      }

      console.error('[Cart] Orders API failed. Showing local dev preview orders.', error)
      setOrders(markLocalDevOrders(loadOrders()))
      setOrderHistoryMessage('Showing local dev preview orders because the orders API is unavailable.')
    }
  }

  useEffect(() => {
    if (!fetchOrderHistory) {
      const timerId = window.setTimeout(() => {
        setOrders([])
        setOrderHistoryMessage('')
      }, 0)

      return () => window.clearTimeout(timerId)
    }

    let ignore = false

    fetchCartOrders()
      .then((remoteOrders) => {
        if (ignore) return
        setOrders(normalizeRemoteOrders(remoteOrders))
        setOrderHistoryMessage('')
      })
      .catch((error) => {
        if (ignore) return
        if (!allowLocalFallback) {
          console.error('[Cart] Orders API failed.', error)
          setOrders([])
          setOrderHistoryMessage('Order history is unavailable.')
          return
        }

        console.error('[Cart] Orders API failed. Showing local dev preview orders.', error)
        setOrders(markLocalDevOrders(loadOrders()))
        setOrderHistoryMessage('Showing local dev preview orders because the orders API is unavailable.')
      })

    return () => {
      ignore = true
    }
  }, [allowLocalFallback, fetchOrderHistory])

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
    if (pendingPayment) {
      savePendingPayment(pendingPayment)
      return
    }

    clearPendingPayment()
  }, [pendingPayment])

  async function addToCart(productId) {
    const product = storeProducts.find((item) => String(item.id) === String(productId))

    if (product) {
      try {
        await addCartItem({
          goodsId: product.goodsId ?? product.id,
          name: product.name,
          price: product.price,
          imageUrl: product.image,
          artistName: product.artist,
          categoryName: product.description,
          tags: [],
        })
        setMessage('')
      } catch (error) {
        setMessage(error.message || 'Failed to add cart item.')
      }
    }

    setErrors([])
    setPaymentStatus(ORDER_STATUS.CREATED)
    setCompletedOrder(null)
  }

  async function increaseQuantity(productId) {
    const item = cartItems.find((cartItem) => String(cartItem.cartItemKey ?? cartItem.id) === String(productId))
    if (item) {
      try {
        await updateCartItemQuantity(item.cartItemKey, item.quantity + 1)
      } catch (error) {
        setMessage(error.message || 'Failed to update cart item.')
      }
    }
  }

  async function decreaseQuantity(productId) {
    const item = cartItems.find((cartItem) => String(cartItem.cartItemKey ?? cartItem.id) === String(productId))
    if (item) {
      try {
        await updateCartItemQuantity(item.cartItemKey, item.quantity - 1)
      } catch (error) {
        setMessage(error.message || 'Failed to update cart item.')
      }
    }
  }

  async function removeFromCart(productId) {
    const item = cartItems.find((cartItem) => String(cartItem.cartItemKey ?? cartItem.id) === String(productId))
    if (item) {
      try {
        await removeCartItem(item.cartItemKey)
      } catch (error) {
        setMessage(error.message || 'Failed to remove cart item.')
      }
    }
  }

  function updateCheckoutForm(field, value) {
    const nextValue = field === 'phone' ? formatKoreanPhoneNumber(value) : value

    setCheckoutForm((currentForm) => ({
      ...currentForm,
      [field]: nextValue,
    }))
    setMessage('')
  }

  function validateOrder() {
    const nextErrors = []

    if (isCartEmpty) nextErrors.push('Add at least one product to the cart.')
    if (!isCartSignedIn) nextErrors.push('Sign in to checkout with your cart.')
    if (hasBlockingCartIssue) nextErrors.push('Resolve cart item issues before checkout.')
    if (!normalizeMemberId(checkoutForm.memberId)) {
      nextErrors.push('The logged-in member profile is unavailable.')
    }
    if (!checkoutForm.name.trim()) nextErrors.push('Enter a customer name.')
    if (!checkoutForm.email.trim()) nextErrors.push('Enter an email address.')
    if (!checkoutForm.phone.trim()) nextErrors.push('Enter a phone number.')
    if (!checkoutForm.address.trim()) nextErrors.push('Enter a shipping address.')

    setErrors(nextErrors)
    return nextErrors.length === 0
  }

  function buildOrder(status = ORDER_STATUS.CREATED) {
    const orderId = createOrderId()
    const memberId = normalizeMemberId(checkoutForm.memberId)

    return {
      orderId,
      orderNumber: orderId,
      partnerOrderId: `PARTNER-${orderId}`,
      memberId,
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
        memberId,
        name: checkoutForm.name.trim(),
        email: checkoutForm.email.trim(),
        phone: checkoutForm.phone.trim(),
        address: checkoutForm.address.trim(),
        addressDetail: checkoutForm.addressDetail.trim(),
        deliveryRequest: checkoutForm.deliveryRequest.trim(),
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
    clearCart()
    clearCheckoutForm(defaultMemberId)
    setPendingPayment(null)
    setErrors([])
    setPaymentStatus(ORDER_STATUS.PAID)
    setMessage('Payment completed. Check the order result below.')
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
      if (!allowLocalFallback) {
        console.error('[Cart] Order API save failed.', error)
        setPaymentStatus(ORDER_STATUS.PAYMENT_FAILED)
        setMessage('Order save failed. Please try again later.')
        return
      }

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
      setIsPreparingPayment(true)
      setPendingPayment(null)
      setPaymentStatus(ORDER_STATUS.PAYMENT_READY)
      setMessage('Preparing KakaoPay payment.')
      setLastKakaoReadyPayload(readyOrder)
      setLastKakaoReadyResponse(null)
      setLastKakaoReadyDebug(getKakaoReadyDebugInfo())
      setLastKakaoReadyError('')

      const checkoutReady = await prepareCheckout({
        items: readyOrder.items.map((item) => ({
          goodsId: Number(item.goodsId ?? item.productId),
          quantity: Number(item.quantity),
        })),
        shippingAddress: {
          recipientName: readyOrder.customer.name,
          recipientPhone: readyOrder.customer.phone,
          postalCode: readyOrder.customer.postalCode ?? '',
          address: readyOrder.customer.address,
          addressDetail: readyOrder.customer.addressDetail || '-',
          deliveryRequest: readyOrder.customer.deliveryRequest ?? '',
        },
        paymentProvider: 'KAKAO_PAY',
      })
      const preparedOrder = {
        ...readyOrder,
        orderId: checkoutReady.orderId,
        orderNumber: checkoutReady.orderNo,
        partnerOrderId: checkoutReady.orderNo,
        paymentId: checkoutReady.paymentId,
        totalPrice: Number(checkoutReady.amount ?? readyOrder.totalPrice),
        totalAmount: Number(checkoutReady.amount ?? readyOrder.totalPrice),
      }

      const kakaoReady = await requestKakaoPayReady(preparedOrder)
      setLastKakaoReadyResponse(kakaoReady)
      setLastKakaoReadyDebug({
        paymentMode: kakaoReady.paymentMode,
        readyRequestUrl: kakaoReady.readyRequestUrl,
        usedFallback: kakaoReady.usedFallback,
      })

      const nextRedirectPcUrl =
        kakaoReady?.nextRedirectPcUrl ||
        kakaoReady?.next_redirect_pc_url ||
        kakaoReady?.nextRedirectMobileUrl ||
        kakaoReady?.next_redirect_mobile_url ||
        kakaoReady?.nextRedirectAppUrl ||
        kakaoReady?.next_redirect_app_url ||
        kakaoReady?.redirectUrl

      if (!nextRedirectPcUrl) {
        setPendingPayment(null)
        setPaymentStatus(ORDER_STATUS.PAYMENT_READY)
        setMessage('KakaoPay did not return a payment page URL. No payment attempt was started.')
        return
      }

      const nextPendingPayment = createKakaoPendingPayment(
        preparedOrder,
        kakaoReady,
      )
      const pendingOrder = {
        ...preparedOrder,
        status: ORDER_STATUS.PAYMENT_PENDING,
        updatedAt: new Date().toISOString(),
      }
      const nextOrders = persistOrder(pendingOrder)

      setOrders(markLocalDevOrders(nextOrders))
      savePendingPayment(nextPendingPayment)
      setPendingPayment(nextPendingPayment)
      setPaymentStatus(ORDER_STATUS.PAYMENT_PENDING)
      setMessage('KakaoPay payment is ready. Continue on the approval page.')

      window.location.href = nextRedirectPcUrl
    } catch (error) {
      setLastKakaoReadyError(error.message)
      setPaymentStatus(ORDER_STATUS.CREATED)
      setPendingPayment(null)
      setMessage(error.message || 'KakaoPay preparation did not return a payment result.')
    } finally {
      setIsPreparingPayment(false)
    }
  }

  async function handleTossPayment(order) {
    const readyOrder = {
      ...order,
      status: ORDER_STATUS.PAYMENT_READY,
      updatedAt: new Date().toISOString(),
    }

    try {
      setIsPreparingPayment(true)
      setPendingPayment(null)
      setPaymentStatus(ORDER_STATUS.PAYMENT_READY)
      setMessage('Preparing Toss Payments checkout.')

      const tossReady = await prepareCheckout({
        items: readyOrder.items.map((item) => ({
          goodsId: Number(item.goodsId ?? item.productId),
          quantity: Number(item.quantity),
        })),
        shippingAddress: {
          recipientName: readyOrder.customer.name,
          recipientPhone: readyOrder.customer.phone,
          postalCode: readyOrder.customer.postalCode ?? '',
          address: readyOrder.customer.address,
          addressDetail: readyOrder.customer.addressDetail || '-',
          deliveryRequest: readyOrder.customer.deliveryRequest ?? '',
        },
        paymentProvider: 'TOSS',
      })

      const nextPendingPayment = {
        tid: '',
        orderId: tossReady.orderId,
        localOrderId: readyOrder.orderId,
        orderNo: tossReady.orderNo,
        paymentId: tossReady.paymentId,
        amount: tossReady.amount,
        orderName: tossReady.orderName,
        customerKey: tossReady.customerKey,
        paymentMethod: PAYMENT_METHODS.TOSS,
        createdAt: new Date().toISOString(),
      }
      const pendingOrder = {
        ...readyOrder,
        orderId: tossReady.orderId,
        orderNumber: tossReady.orderNo,
        status: ORDER_STATUS.PAYMENT_PENDING,
        updatedAt: new Date().toISOString(),
      }

      setPendingPayment(nextPendingPayment)
      setPaymentStatus(ORDER_STATUS.PAYMENT_PENDING)
      setCompletedOrder(pendingOrder)
      setMessage('Opening Toss Payments checkout.')
      await requestTossPayment(tossReady, readyOrder)
    } catch (error) {
      setPaymentStatus(ORDER_STATUS.CREATED)
      setPendingPayment(null)
      setMessage(error.message || 'Toss Payments preparation did not return a payment result.')
    } finally {
      setIsPreparingPayment(false)
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

    if (pendingPayment.paymentMethod === PAYMENT_METHODS.TOSS) {
      handleTossPayment(retryOrder)
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

    if (paymentMethod === PAYMENT_METHODS.TOSS) {
      handleTossPayment(createdOrder)
      return
    }

    handleMockPayment(createdOrder)
  }

  return {
    cartItems,
    cartError,
    cartStatus,
    checkoutForm,
    completedOrder,
    errors,
    isCartEmpty,
    isCartSignedIn,
    hasBlockingCartIssue,
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
