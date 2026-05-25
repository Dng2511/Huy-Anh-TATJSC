import { createContext, useContext, useEffect, useState, useCallback } from 'react'

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [accessToken, setAccessToken] = useState(null)
  const [loading, setLoading] = useState(true)

  const persistAccessToken = (token) => {
    setAccessToken(token)
    if (token) {
      localStorage.setItem('access_token', token)
    } else {
      localStorage.removeItem('access_token')
    }
  }

  const login = async (username, password) => {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    })
    if (!res.ok) throw new Error((await res.json()).error || 'Login failed')
    const data = await res.json()
    persistAccessToken(data.accessToken)
    setUser(data.user)
    return data
  }

  const logout = async () => {
    try {
      await fetch(`${API_BASE}/auth/logout`, { method: 'POST', credentials: 'include' })
    } catch (e) {}
    persistAccessToken(null)
    setUser(null)
  }

  const refresh = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/auth/refresh`, { method: 'POST', credentials: 'include' })
      if (!res.ok) {
        persistAccessToken(null)
        setUser(null)
        return null
      }
      const data = await res.json()
      persistAccessToken(data.accessToken)
      setUser(data.user)
      return data
    } catch (e) {
      persistAccessToken(null)
      setUser(null)
      return null
    }
  }, [])

  useEffect(() => {
    // attempt refresh on load
    (async () => {
      setLoading(true)
      const storedToken = localStorage.getItem('access_token')
      if (storedToken) setAccessToken(storedToken)
      await refresh()
      setLoading(false)
    })()
  }, [refresh])

  const authFetch = useCallback((input, init = {}) => {
    const headers = init.headers ? { ...init.headers } : {}
    if (accessToken) headers['Authorization'] = `Bearer ${accessToken}`
    return fetch(input, { ...init, headers, credentials: 'include' })
  }, [accessToken])

  return (
    <AuthContext.Provider value={{ user, accessToken, loading, login, logout, refresh, authFetch }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
