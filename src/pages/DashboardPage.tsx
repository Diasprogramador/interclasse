import { ArrowRight, Check, Copy, Radio, Users, X } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAppData } from '../contexts/AppDataContext'

export function DashboardPage() {
  const { data, respondInvitation } = useAppData()
  const [feedback, setFeedback] = useState('')
  if (!data) return null

  const live = data.matches.find((match) => match.status === 'live')
  const next = data.matches.filter((match) => match.status === 'scheduled').slice(0, 3)
  const myStanding = data.standings.find((item) => item.teamId === data.team?.id)
  const topScorer = [...data.stats].sort((a, b) => b.goals - a.goals)[0]
  const classroomCode = data.classroom?.inviteCode

  return <div className="intl-dashboard">
    <header className="intl-page-head">
      <div><span>MATCHDAY 04 · TERÇA, 27 OUT</span><h1 className="intl-desktop-title">A competição acontece agora.</h1><h1 className="intl-mobile-title">Boa tarde, {data.profile.displayName.split(' ')[0]}.</h1><p>Sua sala, seu time e cada lance em um só lugar.</p></div>
      <Link to="/evento" className="intl-action">Gerenciar evento <ArrowRight size={16} /></Link>
    </header>

    {feedback && <div className="intl-feedback">{feedback}</div>}
    {data.invitations.map((invite) => <section className="intl-invite" key={invite.id}>
      <Users size={19} /><div><b>Convite para {invite.teamName}</b><span>@{invite.invitedBy} quer você na equipe.</span></div>
      <button onClick={async () => { const result = await respondInvitation(invite.id, false); setFeedback(result.error ?? result.success ?? '') }}><X size={15} /> Recusar</button>
      <button className="is-primary" onClick={async () => { const result = await respondInvitation(invite.id, true); setFeedback(result.error ?? result.success ?? '') }}><Check size={15} /> Aceitar</button>
    </section>)}

    <div className="intl-dashboard-grid">
      <div className="intl-dashboard-core">
        {live ? <section className="intl-live">
          <header><span className="intl-live__badge"><i /> Ao vivo</span><span>{live.sport}</span><span>{live.venue} · 2º tempo</span></header>
          <div className="intl-live__score">
            <div className="intl-live__team"><i style={{ background: live.homeColor }} /><span><b>{live.homeTeam.includes('Azul') ? '3º A' : live.homeTeam}</b><small>{live.homeTeam}</small></span></div>
            <div className="intl-live__numbers"><strong>{String(live.homeScore ?? 0).padStart(2, '0')}</strong><em>—</em><strong>{String(live.awayScore ?? 0).padStart(2, '0')}</strong><time>08:42</time></div>
            <div className="intl-live__team is-away"><span><b>{live.awayTeam.includes('Falcões') ? '2º B' : live.awayTeam}</b><small>{live.awayTeam}</small></span><i style={{ background: live.awayColor }} /></div>
          </div>
          <footer><span><b>Último lance</b> Gol de Lucas Almeida · 3º A</span><Link to="/jogos">Ver partida <ArrowRight size={14} /></Link></footer>
        </section> : <section className="intl-live intl-live--empty"><Radio size={25} /><h2>Nenhuma partida ao vivo</h2><p>A próxima partida aparecerá aqui.</p></section>}

        <div className="intl-data-grid">
          <section className="intl-panel intl-schedule">
            <header><div><span>PRÓXIMOS JOGOS</span><h2>Agenda da rodada</h2></div><Link to="/jogos">Ver calendário</Link></header>
            <div>{next.map((match) => <Link to="/jogos" className="intl-match-row" key={match.id}>
              <time>{new Date(match.startsAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}<small>{match.sport}</small></time>
              <span><b>{match.homeTeam}</b><em>vs</em><b>{match.awayTeam}</b><ArrowRight size={14} /></span>
            </Link>)}</div>
          </section>

          <section className="intl-standings">
            <header><span>GRUPO A</span><h2>Classificação</h2></header>
            {data.standings.slice(0, 5).map((team) => <div className={team.teamId === data.team?.id ? 'is-current' : ''} key={team.teamId}>
              <small>{String(team.position).padStart(2, '0')}</small><i style={{ background: team.color }} /><b>{team.shortName}</b><span>{String(team.points).padStart(2, '0')} pts</span>
            </div>)}
          </section>
        </div>
      </div>

      <aside className="intl-context">
        <section className="intl-context-card intl-team-card">
          <span>SEU TIME</span><h2>{data.team?.name ?? 'Sem time'}</h2><div className="intl-progress"><i style={{ width: `${Math.min(data.members.length / 12 * 100, 100)}%` }} /></div>
          <strong>{String(data.members.length).padStart(2, '0')} <small>/ 12 atletas</small></strong><p>{data.team ? 'Próximo jogo em 2h 18min' : 'Crie seu time para começar'}</p>
        </section>
        <section className="intl-context-card intl-pulse"><span>EVENTO EM ANDAMENTO</span><strong>184 <small>presentes</small></strong><p>3 quadras ativas · operação normal</p></section>
        <section className="intl-context-card intl-notices"><header><span>MURAL OFICIAL</span><h2>Comunicados</h2></header>{data.announcements.slice(0, 3).map((item) => <article key={item.id}><b>{item.title}</b><p>{item.message}</p></article>)}</section>
      </aside>
    </div>

    <section className="intl-mobile-metrics">
      <article><strong>{String(myStanding?.position ?? 0).padStart(2, '0')}º</strong><span>Colocação</span></article>
      <article><strong>{String(data.members.length).padStart(2, '0')}/12</strong><span>Elenco</span></article>
      <article><strong>{String(topScorer?.goals ?? 0).padStart(2, '0')}</strong><span>Gols</span></article>
    </section>

    {classroomCode && <button className="intl-code" onClick={() => void navigator.clipboard.writeText(classroomCode)}><Copy size={15} /> Código da sala: {classroomCode}</button>}
  </div>
}
