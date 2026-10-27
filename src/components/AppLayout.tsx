import type { ReactNode } from 'react'
import {
  Bell, CalendarDays, ChartNoAxesColumnIncreasing, GitBranch,
  Grid2X2, LogOut, Radio, Search, Settings, Shield, Trophy,
} from 'lucide-react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useAppData } from '../contexts/AppDataContext'
import { Brand } from './Brand'

const nav = [
  { to: '/', label: 'Visão geral', icon: Grid2X2 },
  { to: '/meu-time', label: 'Meu time', icon: Shield },
  { to: '/classificacao', label: 'Classificação', icon: Trophy },
  { to: '/chaveamento', label: 'Chaveamento', icon: GitBranch },
  { to: '/estatisticas', label: 'Estatísticas', icon: ChartNoAxesColumnIncreasing },
  { to: '/jogos', label: 'Jogos', icon: CalendarDays },
  { to: '/evento', label: 'Central do evento', icon: Radio },
]

const mobileNav = nav.filter((item) => ['/', '/jogos', '/chaveamento', '/classificacao'].includes(item.to))

export function AppLayout({ children }: { children: ReactNode }) {
  const { signOut, isDemo } = useAuth()
  const { data } = useAppData()
  const navigate = useNavigate()
  const initials = data?.profile.displayName.split(' ').map((word) => word[0]).slice(0, 2).join('') ?? 'AE'

  async function logout() { await signOut(); navigate('/login') }

  return <div className="intl-shell">
    <aside className="intl-rail" aria-label="Navegação principal">
      <NavLink to="/" className="intl-crest"><Brand compact /></NavLink>
      <nav className="intl-rail__nav">
        {nav.map(({ to, label, icon: Icon }) => <NavLink
          key={to} to={to} end={to === '/'} title={label} aria-label={label}
          className={({ isActive }) => `intl-rail__item ${isActive ? 'is-active' : ''}`}
        ><Icon size={21} strokeWidth={1.8} /></NavLink>)}
      </nav>
      <div className="intl-rail__footer">
        <NavLink to="/configuracoes" title="Configurações" aria-label="Configurações" className={({ isActive }) => `intl-rail__item ${isActive ? 'is-active' : ''}`}><Settings size={21} /></NavLink>
        <button className="intl-avatar" title="Sair" onClick={logout}>{initials}</button>
      </div>
    </aside>

    <div className="intl-workspace">
      <header className="intl-topbar">
        <div className="intl-mobile-brand"><Brand /><span>{data?.classroom?.grade ?? 'Arena Escolar'}</span></div>
        <div className="intl-competition"><i /> INTERCLASSE 2026 <span>/</span> FASE DE GRUPOS</div>
        <div className="intl-topbar__actions">
          {isDemo && <span className="intl-demo">DEMO</span>}
          <label className="intl-search"><Search size={16} /><input aria-label="Buscar" placeholder="Buscar no campeonato" /></label>
          <button className="intl-icon-button" aria-label="Notificações"><Bell size={18} /></button>
        </div>
      </header>
      <main className="intl-main">{children}</main>
    </div>

    <nav className="intl-bottom-nav" aria-label="Navegação móvel">
      {mobileNav.map(({ to, label, icon: Icon }) => <NavLink key={to} to={to} end={to === '/'} className={({ isActive }) => isActive ? 'is-active' : ''}><Icon size={19} /><span>{label === 'Visão geral' ? 'Início' : label}</span></NavLink>)}
    </nav>
  </div>
}
