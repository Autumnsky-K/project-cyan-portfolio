import { useEffect, useState } from 'react'

import { supabase } from '../../api/supabaseClient'

type CartAuthSessionState = {
  authLoading: boolean
  authUserId: string | null
  isAuthenticated: boolean
}

const INITIAL_STATE: CartAuthSessionState = {
  authLoading: Boolean(supabase),
  authUserId: null,
  isAuthenticated: false,
}

export function useCartAuthSession(): CartAuthSessionState {
  const [state, setState] = useState<CartAuthSessionState>(INITIAL_STATE)

  useEffect(() => {
    let active = true

    if (!supabase) return undefined

    void supabase.auth
      .getSession()
      .then(({ data, error }) => {
        if (!active) return

        const authUserId = error ? null : data.session?.user.id ?? null
        setState({
          authLoading: false,
          authUserId,
          isAuthenticated: Boolean(authUserId),
        })
      })
      .catch(() => {
        if (!active) return

        setState({
          authLoading: false,
          authUserId: null,
          isAuthenticated: false,
        })
      })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!active) return

      const authUserId = session?.user.id ?? null
      setState({
        authLoading: false,
        authUserId,
        isAuthenticated: Boolean(authUserId),
      })
    })

    return () => {
      active = false
      subscription.unsubscribe()
    }
  }, [])

  return state
}
