import { useState, type ReactNode } from 'react'
import { Bell, CalendarDays, ChartNoAxesColumnIncreasing, CircleHelp, GitBranch, LayoutDashboard, LogOut, Medal, Menu, Radio, Settings, Shield, Users, X } from 'lucide-react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useAppData } from '../contexts/AppDataContext'
import { Brand } from './Brand'

const nav = [
  { to: '/', label: 'Visão geral', icon: LayoutDashboard },
  { to: '/meu-time', label: 'Meu time', icon: Shield },
  { to: '/classificacao', label: 'Classificação', icon: Medal },
  { to: '/chaveamento', label: 'Chaveamento', icon: GitBranch },
  { to: '/estatisticas', label: 'Estatísticas', icon: ChartNoAxesColumnIncreasing },
  { to: '/jogos', label: 'Jogos', icon: CalendarDays },
  { to: '/evento', label: 'Central do evento', icon: Radio },
]

export function AppLayout({ children }: { children: ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const { signOut, isDemo } = useAuth()
  const { data } = useAppData()
  const navigate = useNavigate()

  async function logout() { await signOut(); navigate('/login') }

  return (
    <div className="app-shell">
      <aside className={`sidebar ${menuOpen ? 'sidebar--open' : ''}`}>
        <div className="sidebar__top"><Brand /><button className="icon-button sidebar__close" onClick={() => setMenuOpen(false)} aria-label="Fechar menu"><X size={20} /></button></div>
        <nav className="main-nav" aria-label="Navegação principal">
          <span className="nav-label">INTERCLASSE</span>
          {nav.map(({ to, label, icon: Icon }) => <NavLink key={to} to={to} end={to === '/'} onClick={() => setMenuOpen(false)} className={({ isActive }) => `nav-item ${isActive ? 'nav-item--active' : ''}`}><Icon size={19} /><span>{label}</span></NavLink>)}
        </nav>
        <div className="sidebar__bottom">
          <NavLink className="nav-item" to="/configuracoes"><Settings size={19} /><span>Configurações</span></NavLink>
          <button className="nav-item"><CircleHelp size={19} /><span>Ajuda</span></button>
          <button className="nav-item" onClick={logout}><LogOut size={19} /><span>Sair</span></button>
          <div className="season-card"><span>{isDemo ? 'MODO DEMONSTRAÇÃO' : 'INTERCLASSE 2026'}</span><strong>{data?.classroom?.grade ?? 'SEM SALA'}</strong><div><i style={{ width: data?.team ? '68%' : '25%' }} /></div><small>{data?.team ? `${data.members.length}/12 jogadores` : 'Crie ou entre em um time'}</small></div>
        </div>
      </aside>
      <main className="main-content">
        <header className="topbar">
          <button className="icon-button mobile-menu" onClick={() => setMenuOpen(true)} aria-label="Abrir menu"><Menu size={21} /></button>
          <div className="topbar__school"><Users size={17} /><span>{data?.classroom?.name ?? 'Arena Escolar'}</span></div>
          {isDemo && <span className="demo-chip">DEMO</span>}
          <button className="icon-button notification" aria-label="Notificações"><Bell size={19} />{data?.profile.notificationsEnabled && <i />}</button>
          <div className="profile"><span className="avatar">{data?.profile.displayName.split(' ').map((word) => word[0]).slice(0, 2).join('') ?? 'AE'}</span><span><strong>{data?.profile.displayName ?? 'Carregando'}</strong><small>@{data?.profile.nickname ?? 'usuario'}</small></span></div>
        </header>
        {children}
      </main>
      {menuOpen && <button className="backdrop mobile-backdrop" onClick={() => setMenuOpen(false)} aria-label="Fechar menu" />}
    </div>
  )
}
