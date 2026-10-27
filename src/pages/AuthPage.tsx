import { useState, type FormEvent } from 'react'
import { ArrowRight, Eye, EyeOff, ShieldCheck, Trophy, Users } from 'lucide-react'
import { Navigate, useNavigate } from 'react-router-dom'
import { z } from 'zod'
import { Brand } from '../components/Brand'
import { useAuth } from '../contexts/AuthContext'

const loginSchema = z.object({ email: z.email('Informe um e-mail válido.'), password: z.string().min(6, 'A senha precisa ter pelo menos 6 caracteres.') })
const signupSchema = loginSchema.extend({ nickname: z.string().min(3).max(20).regex(/^[a-zA-Z0-9_]+$/, 'Use apenas letras, números e _.') , displayName: z.string().min(3, 'Informe seu nome.') })

export function AuthPage() {
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const { user, signIn, signUp, isDemo } = useAuth()
  const navigate = useNavigate()
  if (user) return <Navigate to="/" replace />

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(''); setMessage(''); setSubmitting(true)
    const form = new FormData(event.currentTarget)
    const input = { email: String(form.get('email')), password: String(form.get('password')), nickname: String(form.get('nickname') ?? ''), displayName: String(form.get('displayName') ?? '') }
    const parsed = mode === 'login' ? loginSchema.safeParse(input) : signupSchema.safeParse(input)
    if (!parsed.success) { setError(parsed.error.issues[0]?.message ?? 'Revise os campos.'); setSubmitting(false); return }
    const result = mode === 'login' ? await signIn(input.email, input.password) : await signUp(input)
    setSubmitting(false)
    if (result.error) { setError(result.error); return }
    if (result.needsEmailConfirmation) { setMessage('Confira seu e-mail para confirmar a conta.'); return }
    navigate('/')
  }

  return (
    <main className="auth-page">
      <section className="auth-showcase">
        <Brand />
        <div className="auth-showcase__content"><span className="eyebrow">INTERCLASSE, DO SEU JEITO</span><h1>Seu time.<br /><em>Sua sala.</em><br />Uma só arena.</h1><p>Monte a equipe, acompanhe a tabela e dispute cada ponto com a escola inteira.</p></div>
        <div className="auth-proof"><span><Trophy size={19} /><b>4</b> modalidades</span><span><Users size={19} /><b>12</b> atletas por time</span><span><ShieldCheck size={19} /> acesso protegido</span></div>
      </section>
      <section className="auth-form-wrap">
        <div className="auth-form-card">
          {isDemo && <div className="demo-banner"><b>Modo demonstração</b><span>Use qualquer e-mail e senha para explorar.</span></div>}
          <span className="eyebrow">{mode === 'login' ? 'BEM-VINDO DE VOLTA' : 'ENTRE PARA A ARENA'}</span>
          <h2>{mode === 'login' ? 'Acesse sua conta' : 'Crie seu perfil'}</h2>
          <p>{mode === 'login' ? 'Continue acompanhando seu time e a competição.' : 'Seu nickname será usado pelos capitães para convidar você.'}</p>
          <form onSubmit={submit}>
            {mode === 'signup' && <><label>Nome completo<input name="displayName" autoComplete="name" placeholder="Seu nome" /></label><label>Nickname<input name="nickname" autoComplete="username" placeholder="ex.: camisa10" /></label></>}
            <label>E-mail<input name="email" type="email" autoComplete="email" placeholder="voce@escola.com" defaultValue={isDemo ? 'capitao@arena.demo' : ''} /></label>
            <label>Senha<span className="password-field"><input name="password" type={showPassword ? 'text' : 'password'} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} placeholder="••••••••" defaultValue={isDemo ? 'arena123' : ''} /><button type="button" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}>{showPassword ? <EyeOff size={17} /> : <Eye size={17} />}</button></span></label>
            {error && <div className="form-message form-message--error">{error}</div>}{message && <div className="form-message">{message}</div>}
            <button className="primary-button auth-submit" disabled={submitting}>{submitting ? 'Aguarde...' : mode === 'login' ? 'Entrar na arena' : 'Criar minha conta'}<ArrowRight size={18} /></button>
          </form>
          <div className="auth-switch">{mode === 'login' ? 'Ainda não tem conta?' : 'Já possui uma conta?'} <button onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError('') }}>{mode === 'login' ? 'Cadastre-se' : 'Entrar'}</button></div>
        </div>
      </section>
    </main>
  )
}
