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
    deliveryRequest: String(defaults.deliveryRequest ?? '').trim(),
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
    const defaultDeliveryRequest = String(defaults.deliveryRequest ?? '').trim()

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
      deliveryRequest:
        defaultDeliveryRequest || String(savedForm.deliveryRequest ?? defaultForm.deliveryRequest ?? '').trim(),
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
    defaultCustomerDeliveryRequest = '',
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
        deliveryRequest: defaultCustomerDeliveryRequest,
      }),
    [
      defaultCustomerAddress,
      defaultCustomerAddressDetail,
      defaultCustomerDeliveryRequest,
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
      deliveryRequest: defaultCustomerDeliveryRequest,
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
      !defaultCustomerAddressDetail &&
      !defaultCustomerDeliveryRequest
    ) return undefined

    const timerId = window.setTimeout(() => {
      setCheckoutForm((currentForm) =>
        currentForm.memberId === defaultCheckoutForm.memberId &&
        currentForm.name === defaultCheckoutForm.name &&
        currentForm.email === defaultCheckoutForm.email &&
        currentForm.phone === defaultCheckoutForm.phone &&
            currentForm.address === defaultCheckoutForm.address &&
            currentForm.addressDetail === defaultCheckoutForm.addressDetail &&
            currentForm.deliveryRequest === defaultCheckoutForm.deliveryRequest
          ? currentForm
          : {
              ...currentForm,
              memberId: defaultCheckoutForm.memberId || currentForm.memberId,
              name: defaultCheckoutForm.name || currentForm.name,
              email: defaultCheckoutForm.email || currentForm.email,
              phone: defaultCheckoutForm.phone || currentForm.phone,
              address: defaultCheckoutForm.address || currentForm.address,
              addressDetail: defaultCheckoutForm.addressDetail || currentForm.addressDetail,
              deliveryRequest: defaultCheckoutForm.deliveryRequest || currentForm.deliveryRequest,
            },
      )
    }, 0)

    return () => window.clearTimeout(timerId)
  }, [
    defaultCheckoutForm,
    defaultCustomerAddress,
    defaultCustomerAddressDetail,
    defaultCustomerDeliveryRequest,
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
          setProductMessage('불러온 상품이 없습니다.')
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
        setOrderHistoryMessage('주문 내역을 불러올 수 없습니다.')
        return
      }

      console.error('[Cart] Orders API failed. Showing local dev preview orders.', error)
      setOrders(markLocalDevOrders(loadOrders()))
      setOrderHistoryMessage('주문 API를 사용할 수 없어 개발용 미리보기 주문을 표시합니다.')
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
          setOrderHistoryMessage('주문 내역을 불러올 수 없습니다.')
          return
        }

        console.error('[Cart] Orders API failed. Showing local dev preview orders.', error)
        setOrders(markLocalDevOrders(loadOrders()))
        setOrderHistoryMessage('주문 API를 사용할 수 없어 개발용 미리보기 주문을 표시합니다.')
      })

    return () => {
      ignore = true
    }
  }, [allowLocalFallback, fetchOrderHistory])

  function useFallbackProducts() {
    setStoreProducts(fallbackProducts)
    setProductStatus('fallback')
    setProductMessage('개발용 미리보기 상품을 표시합니다.')
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
      setMessage('대기 중인 결제가 30분이 지나 만료되었습니다.')
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
        setMessage(error.message || '상품을 카트에 담지 못했습니다.')
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
        setMessage(error.message || '카트 상품 수량을 변경하지 못했습니다.')
      }
    }
  }

  async function decreaseQuantity(productId) {
    const item = cartItems.find((cartItem) => String(cartItem.cartItemKey ?? cartItem.id) === String(productId))
    if (item) {
      try {
        await updateCartItemQuantity(item.cartItemKey, item.quantity - 1)
      } catch (error) {
        setMessage(error.message || '카트 상품 수량을 변경하지 못했습니다.')
      }
    }
  }

  async function removeFromCart(productId) {
    const item = cartItems.find((cartItem) => String(cartItem.cartItemKey ?? cartItem.id) === String(productId))
    if (item) {
      try {
        await removeCartItem(item.cartItemKey)
      } catch (error) {
        setMessage(error.message || '카트 상품을 삭제하지 못했습니다.')
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

    if (isCartEmpty) nextErrors.push('카트에 상품을 한 개 이상 담아 주세요.')
    if (!isCartSignedIn) nextErrors.push('카트 상품을 결제하려면 로그인해 주세요.')
    if (hasBlockingCartIssue) nextErrors.push('결제하기 전에 카트 상품의 문제를 확인해 주세요.')
    if (!normalizeMemberId(checkoutForm.memberId)) {
      nextErrors.push('로그인한 회원 정보를 확인할 수 없습니다.')
    }
    if (!checkoutForm.name.trim()) nextErrors.push('주문자 이름을 입력해 주세요.')
    if (!checkoutForm.email.trim()) nextErrors.push('이메일 주소를 입력해 주세요.')
    if (!checkoutForm.phone.trim()) nextErrors.push('전화번호를 입력해 주세요.')
    if (!checkoutForm.address.trim()) nextErrors.push('배송지 주소를 입력해 주세요.')

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
    setMessage('결제가 완료되었습니다. 아래에서 주문 결과를 확인해 주세요.')
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
        setMessage('주문을 저장하지 못했습니다. 잠시 후 다시 시도해 주세요.')
        return
      }

      console.error('[Cart] Order API save failed. Falling back to local preview.', error)
      const paidOrder = buildMockPaidOrder(pendingOrder)
      const nextOrders = persistOrder({ ...paidOrder, source: 'local-dev' })

      setOrders(markLocalDevOrders(nextOrders))
      savePaidOrder({ ...paidOrder, source: 'local-dev' })
      setOrderHistoryMessage('주문 API를 사용할 수 없어 개발용 미리보기에 주문을 저장했습니다.')
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
      setMessage('KakaoPay 결제를 준비하고 있습니다.')
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
        partnerUserId:
          checkoutReady.customerKey ||
          readyOrder.partnerUserId ||
          `member-${readyOrder.customer.memberId}`,
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
        setMessage('KakaoPay 결제 페이지 주소를 받지 못해 결제를 시작하지 않았습니다.')
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
      setMessage('KakaoPay 결제가 준비되었습니다. 결제 승인 페이지에서 계속해 주세요.')

      window.location.href = nextRedirectPcUrl
    } catch (error) {
      setLastKakaoReadyError(error.message)
      setPaymentStatus(ORDER_STATUS.CREATED)
      setPendingPayment(null)
      setMessage(error.message || 'KakaoPay 결제 준비 결과를 받지 못했습니다.')
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
      setMessage('Toss Payments 결제를 준비하고 있습니다.')

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
      setMessage('Toss Payments 결제창을 열고 있습니다.')
      await requestTossPayment(tossReady, readyOrder)
    } catch (error) {
      setPaymentStatus(ORDER_STATUS.CREATED)
      setPendingPayment(null)
      setMessage(error.message || 'Toss Payments 결제 준비 결과를 받지 못했습니다.')
    } finally {
      setIsPreparingPayment(false)
    }
  }

  function handlePaymentFail(failMessage = '결제에 실패했습니다.') {
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
    setMessage('결제가 취소되었습니다. 카트 상품은 그대로 유지됩니다.')
  }

  function retryPayment() {
    if (!pendingPayment) {
      setMessage('대기 중인 결제가 없습니다.')
      return
    }

    if (isPendingPaymentExpired(pendingPayment)) {
      markExpired()
      setOrders(markLocalDevOrders(loadOrders()))
      setPendingPayment(null)
      setPaymentStatus(ORDER_STATUS.EXPIRED)
      setMessage('대기 중인 결제가 30분이 지나 만료되었습니다.')
      return
    }

    const retryOrder = orders.find(
      (order) =>
        (order.orderId || order.orderNumber) === pendingPayment.orderId ||
        order.orderId === pendingPayment.localOrderId,
    )

    if (!retryOrder) {
      setMessage('대기 중인 주문을 찾지 못했습니다. 결제를 다시 시작해 주세요.')
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
      setMessage('주문 정보를 확인하고 다시 시도해 주세요.')
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
