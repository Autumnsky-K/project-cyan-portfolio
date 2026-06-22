const SUPABASE_FUNCTIONS_URL = import.meta.env.VITE_SUPABASE_FUNCTIONS_URL
const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL ??
  (SUPABASE_FUNCTIONS_URL
    ? SUPABASE_FUNCTIONS_URL.replace(
        '.functions.supabase.co',
        '.supabase.co',
      )
    : '')
const SUPABASE_PUBLIC_KEY =
  import.meta.env.VITE_SUPABASE_ANON_KEY ??
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

export function hasSupabaseStoreConfig() {
  return Boolean(SUPABASE_URL && SUPABASE_PUBLIC_KEY)
}

async function supabaseRestFetch(path, options = {}) {
  if (!hasSupabaseStoreConfig()) {
    throw new Error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY.')
  }

  const response = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    ...options,
    headers: {
      apikey: SUPABASE_PUBLIC_KEY,
      Authorization: `Bearer ${SUPABASE_PUBLIC_KEY}`,
      'Content-Type': 'application/json',
      ...(options.headers ?? {}),
    },
  })

  if (!response.ok) {
    const error = await response.json().catch(() => null)
    throw new Error(error?.message ?? 'Supabase store request failed.')
  }

  return response.json()
}

export function normalizeSupabaseGoods(goods) {
  return {
    id: String(goods.goods_id ?? goods.goodsId ?? goods.id),
    goodsId: goods.goods_id ?? goods.goodsId ?? goods.id,
    name: goods.goods_name ?? goods.goodsName ?? goods.name ?? 'Untitled goods',
    artist:
      goods.artist_name ??
      goods.artistName ??
      goods.artist ??
      goods.artist_id ??
      'CYAN',
    description:
      goods.description ??
      goods.category_name ??
      goods.categoryName ??
      goods.summary ??
      '',
    image:
      goods.main_image_url ??
      goods.image_url ??
      goods.imageUrl ??
      goods.image ??
      '',
    price: Number(goods.price ?? goods.unit_price ?? goods.unitPrice ?? 0),
    raw: goods,
  }
}

export async function fetchSupabaseGoods(options = {}) {
  const searchParams = new URLSearchParams()
  searchParams.set('select', '*')
  searchParams.set('limit', '100')

  const rows = await supabaseRestFetch(`goods?${searchParams.toString()}`, {
    signal: options.signal,
  })

  return rows.map(normalizeSupabaseGoods)
}

export async function fetchSupabaseOrders(options = {}) {
  const searchParams = new URLSearchParams()
  searchParams.set('select', '*')
  searchParams.set('order', 'ordered_at.desc')
  searchParams.set('limit', '100')

  return supabaseRestFetch(`orders?${searchParams.toString()}`, {
    signal: options.signal,
  })
}
