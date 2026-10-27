import { ArrowRight, CalendarDays, Check, Copy, Shield, Trophy, Users, X } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAppData } from '../contexts/AppDataContext'

export function DashboardPage() {
  const { data, respondInvitation } = useAppData()
  const [feedback, setFeedback] = useState('')
  if (!data) return null
  const live = data.matches.find((match) => match.status === 'live')
  const next = data.matches.filter((match) => match.status === 'scheduled').slice(0, 3)
  const topScorer = [...data.stats].sort((a, b) => b.goals - a.goals)[0]

  const classroomCode = data.classroom?.inviteCode
  function copyCode() { if (classroomCode) void navigator.clipboard.writeText(classroomCode) }

  return <div className="page-container">
    <section className="page-head page-head--inside"><div><span className="eyebrow">PAINEL DO JOGADOR</span><h1>Boa tarde, {data.profile.displayName.split(' ')[0]}.</h1><p>Acompanhe a disputa da sua turma em tempo real.</p></div>{data.classroom && <button className="outline-button invite-code" onClick={copyCode}><Copy size={16} /> Código: {data.classroom.inviteCode}</button>}</section>
    {feedback && <div className="form-message page-feedback">{feedback}</div>}
    {data.invitations.map((invite) => <section className="invitation-banner" key={invite.id}><span className="quick-icon"><Users size={20} /></span><div><small>CONVITE PARA O TIME</small><strong>{invite.teamName}</strong><p>@{invite.invitedBy} convidou você para fazer parte da equipe.</p></div><button className="outline-button" onClick={async () => { const result = await respondInvitation(invite.id, false); setFeedback(result.error ?? result.success ?? '') }}><X size={16} /> Recusar</button><button className="primary-button" onClick={async () => { const result = await respondInvitation(invite.id, true); setFeedback(result.error ?? result.success ?? '') }}><Check size={16} /> Aceitar</button></section>)}
    <section className="quick-grid">
      <article><span className="quick-icon"><Shield size={20} /></span><div><small>MEU TIME</small><strong>{data.team?.name ?? 'Sem time'}</strong><p>{data.team ? `${data.members.length} de 12 jogadores` : 'Crie seu time para começar'}</p></div><Link to="/meu-time"><ArrowRight size={18} /></Link></article>
      <article><span className="quick-icon"><Trophy size={20} /></span><div><small>COLOCAÇÃO</small><strong>{data.standings.find((item) => item.teamId === data.team?.id)?.position ? `${data.standings.find((item) => item.teamId === data.team?.id)?.position}º lugar` : '—'}</strong><p>{data.standings.find((item) => item.teamId === data.team?.id)?.points ?? 0} pontos</p></div><Link to="/classificacao"><ArrowRight size={18} /></Link></article>
      <article><span className="quick-icon"><Users size={20} /></span><div><small>ARTILHEIRO</small><strong>{topScorer ? `@${topScorer.nickname}` : '—'}</strong><p>{topScorer?.goals ?? 0} gols no campeonato</p></div><Link to="/estatisticas"><ArrowRight size={18} /></Link></article>
    </section>

    <div className="content-grid">
      <div className="content-column">
        {live ? <section className="featured-match featured-match--system"><div className="featured-match__meta"><span className="live-label"><i /> EM QUADRA</span><span>{live.sport}</span><span>{live.venue}</span></div><div className="system-score"><div><span className="team-color" style={{ background: live.homeColor }} /><strong>{live.homeTeam}</strong></div><span className="score-number">{live.homeScore}</span><b>×</b><span className="score-number">{live.awayScore}</span><div><span className="team-color" style={{ background: live.awayColor }} /><strong>{live.awayTeam}</strong></div></div><div className="match-actions"><span>Placar atualizado pela organização</span><Link to="/jogos">Ver partida <ArrowRight size={16} /></Link></div></section> : <section className="panel empty-feature"><CalendarDays size={26} /><h2>Nenhuma partida ao vivo</h2><p>Os próximos jogos aparecerão aqui.</p></section>}
        <section className="panel"><div className="panel-head"><div><span className="eyebrow">AGENDA</span><h2>Próximos jogos</h2></div><Link className="text-button" to="/jogos">Ver todos <ArrowRight size={15} /></Link></div><div className="match-list">{next.map((match) => <article className="match-row match-row--dashboard" key={match.id}><div className="match-time"><strong>{new Date(match.startsAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</strong><small>{match.venue}</small></div><span className="sport-tag">{match.sport}</span><div className="match-teams"><b>{match.homeTeam}</b><span>VS</span><b>{match.awayTeam}</b></div></article>)}</div></section>
      </div>
      <aside className="content-side">
        <section className="panel"><div className="panel-head"><div><span className="eyebrow">GRUPO A</span><h2>Classificação</h2></div></div><div className="mini-ranking">{data.standings.slice(0, 5).map((team) => <div key={team.teamId} className={team.teamId === data.team?.id ? 'is-current' : ''}><b>{team.position}</b><span className="team-color" style={{ background: team.color }} /><strong>{team.shortName}</strong><small>{team.points} pts</small></div>)}</div><Link to="/classificacao" className="text-button">Tabela completa <ArrowRight size={15} /></Link></section>
        <section className="panel team-progress"><div className="panel-head"><div><span className="eyebrow">ELENCO</span><h2>Seu time</h2></div></div><div className="member-meter"><span style={{ width: `${Math.min(data.members.length / 12 * 100, 100)}%` }} /></div><strong>{data.members.length}<small>/12 jogadores</small></strong><p>{data.members.length < 12 ? `Ainda há ${12 - data.members.length} vagas disponíveis.` : 'Elenco completo para a disputa.'}</p><Link className="outline-button" to="/meu-time">Gerenciar elenco</Link></section>
      </aside>
    </div>
  </div>
}
