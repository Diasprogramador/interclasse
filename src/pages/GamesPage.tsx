import { CalendarDays, Radio, Trophy } from 'lucide-react'
import { useAppData } from '../contexts/AppDataContext'

export function GamesPage() {
  const { data } = useAppData(); if (!data) return null
  return <div className="page-container"><section className="page-title"><span className="eyebrow">CALENDÁRIO OFICIAL</span><h1>Jogos</h1><p>Agenda, resultados e partidas em andamento.</p></section><section className="games-list">{data.matches.map((match) => <article className={`game-card game-card--${match.status}`} key={match.id}><div className="game-status">{match.status === 'live' ? <><Radio size={15} /> AO VIVO</> : match.status === 'finished' ? <><Trophy size={15} /> ENCERRADO</> : <><CalendarDays size={15} /> {new Date(match.startsAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}</>}</div><div className="game-info"><span>{match.sport}</span><small>{match.venue} · {new Date(match.startsAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</small></div><div className="game-score"><div><i style={{ background: match.homeColor }} /><strong>{match.homeTeam}</strong></div><span>{match.homeScore ?? '—'}</span><b>×</b><span>{match.awayScore ?? '—'}</span><div><i style={{ background: match.awayColor }} /><strong>{match.awayTeam}</strong></div></div></article>)}</section></div>
}
