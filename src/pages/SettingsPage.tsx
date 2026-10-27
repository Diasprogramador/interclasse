import { Bell, BellOff, Download, LogOut, Moon, RotateCcw, Smartphone, Sun } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useAppData } from '../contexts/AppDataContext'
import type { Theme } from '../types'

type InstallPromptEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }> }

export function SettingsPage() {
  const { data, updatePreferences, resetDemo } = useAppData()
  const { signOut, isDemo } = useAuth()
  const [installPrompt, setInstallPrompt] = useState<InstallPromptEvent | null>(null)
  const [feedback, setFeedback] = useState('')
  const navigate = useNavigate()
  useEffect(() => { const handler = (event: Event) => { event.preventDefault(); setInstallPrompt(event as InstallPromptEvent) }; window.addEventListener('beforeinstallprompt', handler); return () => window.removeEventListener('beforeinstallprompt', handler) }, [])
  if (!data) return null
  const notificationsEnabled = data.profile.notificationsEnabled

  async function setTheme(theme: Theme) { const result = await updatePreferences({ theme }); setFeedback(result.error ?? result.success ?? '') }
  async function toggleNotifications() {
    const enabling = !notificationsEnabled
    if (enabling && 'Notification' in window && Notification.permission === 'default') {
      const permission = await Notification.requestPermission()
      if (permission === 'denied') { setFeedback('As notificações foram bloqueadas pelo navegador. Libere a permissão nas configurações do site.'); return }
    }
    const result = await updatePreferences({ notificationsEnabled: enabling })
    setFeedback(result.error ?? result.success ?? '')
  }
  async function logout() { await signOut(); navigate('/login') }
  async function install() { if (installPrompt) { await installPrompt.prompt(); const choice = await installPrompt.userChoice; setFeedback(choice.outcome === 'accepted' ? 'Aplicativo instalado.' : 'Instalação cancelada.'); setInstallPrompt(null) } else setFeedback('No celular, abra o menu do navegador e escolha “Instalar aplicativo” ou “Adicionar à tela inicial”.') }

  return <div className="page-container settings-page"><section className="page-title"><span className="eyebrow">SUA CONTA</span><h1>Configurações</h1><p>Personalize a experiência e controle suas preferências.</p></section>{feedback && <div className="form-message page-feedback">{feedback}</div>}<section className="settings-section panel"><div className="settings-section__title"><Moon size={20} /><div><h2>Aparência</h2><p>Escolha como o aplicativo aparece para você.</p></div></div><div className="theme-options">{([{ value: 'dark', label: 'Escuro', icon: Moon }, { value: 'light', label: 'Claro', icon: Sun }, { value: 'system', label: 'Sistema', icon: Smartphone }] as const).map(({ value, label, icon: Icon }) => <button key={value} className={data.profile.theme === value ? 'active' : ''} onClick={() => setTheme(value)}><Icon size={20} /><span>{label}</span><i /></button>)}</div></section><section className="settings-section panel"><div className="settings-row"><span className="settings-icon">{data.profile.notificationsEnabled ? <Bell size={20} /> : <BellOff size={20} />}</span><div><h2>Notificações</h2><p>Receba avisos de jogos, convites e alterações de placar.</p></div><button role="switch" aria-checked={data.profile.notificationsEnabled} className={`switch ${data.profile.notificationsEnabled ? 'active' : ''}`} onClick={toggleNotifications}><i /></button></div></section><section className="settings-section panel"><div className="settings-row"><span className="settings-icon"><Download size={20} /></span><div><h2>Instalar Arena Escolar</h2><p>Use como aplicativo, inclusive com acesso offline à interface.</p></div><button className="outline-button" onClick={install}>Instalar app</button></div></section>{isDemo && <section className="settings-section panel"><div className="settings-row"><span className="settings-icon"><RotateCcw size={20} /></span><div><h2>Restaurar demonstração</h2><p>Apaga as alterações locais e recupera os dados iniciais.</p></div><button className="outline-button" onClick={() => { resetDemo(); setFeedback('Demonstração restaurada.') }}>Restaurar</button></div></section>}<section className="settings-section panel danger-zone"><div className="settings-row"><span className="settings-icon"><LogOut size={20} /></span><div><h2>Sair da conta</h2><p>Você precisará entrar novamente para acessar seu time.</p></div><button className="danger-button" onClick={logout}>Sair</button></div></section></div>
}
