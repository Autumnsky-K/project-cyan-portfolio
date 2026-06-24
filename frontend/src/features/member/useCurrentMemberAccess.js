import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../../api/supabaseClient'
import { getCurrentMember } from './member'

function hasAdminRole(member) {
  const role = String(member?.role ?? '').toUpperCase()
  return role === 'ADMIN' || role === 'ROLE_ADMIN' || member?.isAdmin === true
}

export function useCurrentMemberAccess() {
  const [state, setState] = useState({
    isLoading: true,
    member: null,
    isAdmin: false,
    error: '',
  })

  const loadMember = useCallback(async () => {
    try {
      const member = await getCurrentMember()
      setState({
        isLoading: false,
        member,
        isAdmin: hasAdminRole(member),
        error: '',
      })
    } catch (error) {
      setState({
        isLoading: false,
        member: null,
        isAdmin: false,
        error: error instanceof Error ? error.message : '회원 정보를 불러오지 못했습니다.',
      })
    }
  }, [])

  useEffect(() => {
    let active = true
    const timerId = window.setTimeout(() => {
      if (active) void loadMember()
    }, 0)

    if (!supabase) {
      return () => {
        active = false
        window.clearTimeout(timerId)
      }
    }

    const { data } = supabase.auth.onAuthStateChange(() => {
      window.setTimeout(() => {
        if (active) void loadMember()
      }, 0)
    })

    return () => {
      active = false
      window.clearTimeout(timerId)
      data.subscription.unsubscribe()
    }
  }, [loadMember])

  return state
}
