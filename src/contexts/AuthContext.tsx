import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { User } from '@supabase/supabase-js'
import { isSupabaseConfigured, supabase } from '../lib/supabase'

type AuthUser = { id: string; email: string }
type AuthResult = { error?: string; needsEmailConfirmation?: boolean }

type AuthContextValue = {
  user: AuthUser | null
  loading: boolean
  isDemo: boolean
  signIn: (email: string, password: string) => Promise<AuthResult>
  signUp: (input: { email: string; password: string; nickname: string; displayName: string }) => Promise<AuthResult>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

function toAuthUser(user: User): AuthUser {
  return { id: user.id, email: user.email ?? '' }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!supabase) {
      const demoSignedIn = localStorage.getItem('arena-demo-session') === 'active'
      if (demoSignedIn) setUser({ id: 'demo-user', email: 'capitao@arena.demo' })
      setLoading(false)
      return
    }

    void supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ? toAuthUser(data.session.user) : null)
      setLoading(false)
    })
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ? toAuthUser(session.user) : null)
      setLoading(false)
    })
    return () => listener.subscription.unsubscribe()
  }, [])

  const value = useMemo<AuthContextValue>(() => ({
    user,
    loading,
    isDemo: !isSupabaseConfigured,
    async signIn(email, password) {
      if (!supabase) {
        if (!email.includes('@') || password.length < 6) return { error: 'Informe um e-mail válido e uma senha com pelo menos 6 caracteres.' }
        localStorage.setItem('arena-demo-session', 'active')
        setUser({ id: 'demo-user', email })
        return {}
      }
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      return error ? { error: error.message } : {}
    },
    async signUp({ email, password, nickname, displayName }) {
      if (!supabase) {
        if (!email.includes('@') || password.length < 8) return { error: 'Use um e-mail válido e uma senha com pelo menos 8 caracteres.' }
        localStorage.setItem('arena-demo-session', 'active')
        setUser({ id: 'demo-user', email })
        return {}
      }
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { nickname: nickname.toLowerCase(), display_name: displayName } },
      })
      if (error) return { error: error.message }
      return { needsEmailConfirmation: !data.session }
    },
    async signOut() {
      if (supabase) await supabase.auth.signOut()
      localStorage.removeItem('arena-demo-session')
      setUser(null)
    },
  }), [loading, user])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth precisa estar dentro de AuthProvider')
  return context
}
