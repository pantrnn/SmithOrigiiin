'use client'
import { createContext, useContext, useEffect, useState } from 'react'
import { jwtDecode } from 'jwt-decode'
import { getAuth, clearAuth } from '../../../lib/auth'

interface User {
  id: number
  username: string
  email: string
  isAdmin: boolean
}

interface AuthContextType {
  user: User | null
  setUser: (user: User | null) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  setUser: () => {},
  logout: () => {}
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    const { token } = getAuth()
    if (!token) return

    try {
      const decoded = jwtDecode<User>(token)
      setUser(decoded)
    } catch {
      clearAuth()
      setUser(null)
    }
  }, [])

  const logout = () => {
    clearAuth()
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, setUser, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
