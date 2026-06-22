import { useEffect, useState } from 'react'
import { getCurrentMember } from './member'

const ACCESS_MODE_STORAGE_KEY = 'project-cyan:store-access-mode'
const TEMP_MEMBER_ID = import.meta.env.VITE_DEV_MEMBER_ID ?? '1'

function readStoredAccessMode() {
  try {
    const value = window.localStorage.getItem(ACCESS_MODE_STORAGE_KEY)
    return value === 'admin' || value === 'user' ? value : 'user'
  } catch {
    return 'user'
  }
}

function writeStoredAccessMode(mode) {
  try {
    window.localStorage.setItem(ACCESS_MODE_STORAGE_KEY, mode)
  } catch {
    // Ignore storage failures and keep the in-memory mode.
  }
}

function readAdminEmails() {
  return (import.meta.env.VITE_ADMIN_EMAILS ?? '')
    .split(',')
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean)
}

function hasAdminRole(member) {
  const role = String(member?.role ?? '').toUpperCase()
  return role === 'ADMIN' || role === 'ROLE_ADMIN' || member?.isAdmin === true
}

function isConfiguredAdmin(member) {
  if (!member?.email) {
    return false
  }

  return readAdminEmails().includes(member.email.toLowerCase())
}

function createTemporaryMember(mode) {
  return {
    userId: `temporary-${mode}`,
    memberId: TEMP_MEMBER_ID,
    email: `${mode}@project-cyan.local`,
    name: mode === 'admin' ? 'Temporary Admin' : 'Temporary User',
    role: mode === 'admin' ? 'ADMIN' : 'USER',
    isAdmin: mode === 'admin',
  }
}

export function useCurrentMemberAccess() {
  const [accessMode, setAccessModeState] = useState(readStoredAccessMode)
  const [state, setState] = useState({
    isLoading: true,
    member: null,
    isAdmin: false,
  })

  useEffect(() => {
    let ignore = false

    getCurrentMember()
      .then((member) => {
        if (ignore) return
        const nextMember = member ?? createTemporaryMember(accessMode)
        const detectedAdmin = hasAdminRole(nextMember) || isConfiguredAdmin(nextMember)

        setState({
          isLoading: false,
          member: nextMember,
          isAdmin: accessMode === 'admin' || (accessMode !== 'user' && detectedAdmin),
        })
      })
      .catch(() => {
        if (ignore) return
        const nextMember = createTemporaryMember(accessMode)

        setState({
          isLoading: false,
          member: nextMember,
          isAdmin: accessMode === 'admin',
        })
      })

    return () => {
      ignore = true
    }
  }, [accessMode])

  function setAccessMode(mode) {
    const nextMode = mode === 'admin' ? 'admin' : 'user'
    writeStoredAccessMode(nextMode)
    setAccessModeState(nextMode)
  }

  return {
    ...state,
    accessMode,
    setAccessMode,
  }
}
