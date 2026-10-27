import { useMemo, useState } from 'react'
import { ArrowRight, Crown, Info, Trophy } from 'lucide-react'
import { useAppData } from '../contexts/AppDataContext'
import type { BracketTie } from '../types'

const stages = [
  { id: 'round-of-16', label: 'Oitavas', short: 'OIT' },
  { id: 'quarterfinal', label: 'Quartas', short: 'QUA' },
  { id: 'semifinal', label: 'Semifinal', short: 'SEM' },
  { id: 'final', label: 'Final', short: 'FIN' },
] as const

function TeamLine({ name, color, first, second, winner }: { name: string; color: string; first: number | null; second: number | null; winner: boolean }) {
  const total = first === null ? null : first + (second ?? 0)
  return <div className={`tie-team ${winner ? 'tie-team--winner' : ''}`}><i style={{ background: color }} /><span>{name}</span><small>{first ?? '–'}</small><small>{second ?? '–'}</small><b>{total ?? '–'}</b>{winner && <Crown size={12} />}</div>
}

function TieCard({ tie }: { tie: BracketTie }) {
  const homeTotal = tie.firstLegHome === null ? null : tie.firstLegHome + (tie.secondLegHome ?? 0)
  const awayTotal = tie.firstLegAway === null ? null : tie.firstLegAway + (tie.secondLegAway ?? 0)
  return <article className="tie-card"><div className="tie-card__head"><span>CHAVE {String(tie.order).padStart(2, '0')}</span><small>{tie.stage === 'final' ? 'JOGO ÚNICO' : 'IDA · VOLTA · AGREGADO'}</small></div><TeamLine name={tie.homeTeam} color={tie.homeColor} first={tie.firstLegHome} second={tie.secondLegHome} winner={tie.winner === tie.homeTeam || (tie.winner === null && homeTotal !== null && awayTotal !== null && homeTotal > awayTotal)} /><TeamLine name={tie.awayTeam} color={tie.awayColor} first={tie.firstLegAway} second={tie.secondLegAway} winner={tie.winner === tie.awayTeam || (tie.winner === null && homeTotal !== null && awayTotal !== null && awayTotal > homeTotal)} /></article>
}

export function BracketPage() {
  const { data } = useAppData()
  const [view, setView] = useState<'knockout' | 'groups'>('knockout')
  const grouped = useMemo(() => Object.fromEntries(stages.map((stage) => [stage.id, data?.bracket.filter((tie) => tie.stage === stage.id) ?? []])), [data?.bracket])
  if (!data) return null

  return <div className="page-container bracket-page"><section className="page-title bracket-title"><div><span className="eyebrow">FORMATO CONTINENTAL</span><h1>Caminho até a taça</h1><p>Fase de grupos e mata-mata inspirado no regulamento da Libertadores.</p></div><div className="filter-tabs"><button className={view === 'groups' ? 'active' : ''} onClick={() => setView('groups')}>Fase de grupos</button><button className={view === 'knockout' ? 'active' : ''} onClick={() => setView('knockout')}>Mata-mata</button></div></section>
    {view === 'knockout' ? <>
      <section className="bracket-summary"><div><Trophy size={22} /><span><small>GRANDE FINAL</small><strong>20 NOV · GINÁSIO PRINCIPAL</strong></span></div><p><Info size={15} /> O melhor colocado decide a volta em casa. A final acontece em jogo único.</p></section>
      <section className="libertadores-bracket">
        {stages.map((stage) => <div className={`bracket-stage bracket-stage--${stage.id}`} key={stage.id}><header><span>{stage.short}</span><strong>{stage.label}</strong><small>{stage.id === 'final' ? '1 jogo' : 'ida e volta'}</small></header><div className="bracket-stage__ties">{(grouped[stage.id] as BracketTie[]).map((tie) => <TieCard tie={tie} key={tie.id} />)}{!(grouped[stage.id] as BracketTie[]).length && <article className="tie-card tie-card--empty">Chave aguardando definição</article>}</div></div>)}
      </section>
    </> : <section className="groups-grid">{['A', 'B', 'C', 'D'].map((group, groupIndex) => <article className="panel group-card" key={group}><div className="panel-head"><div><span className="eyebrow">FASE DE GRUPOS</span><h2>Grupo {group}</h2></div><span className="group-badge">{group}</span></div><div className="group-table"><div className="group-row group-row--head"><span>TIME</span><small>J</small><small>SG</small><b>PTS</b></div>{data.standings.slice(groupIndex, groupIndex + 4).concat(data.standings.slice(0, Math.max(0, 4 - data.standings.slice(groupIndex, groupIndex + 4).length))).map((team, index) => <div className={index < 2 ? 'group-row qualified' : 'group-row'} key={`${group}-${team.teamId}`}><span><i style={{ background: team.color }} />{team.shortName}</span><small>{team.played}</small><small>{team.goalsFor - team.goalsAgainst > 0 ? '+' : ''}{team.goalsFor - team.goalsAgainst}</small><b>{team.points}</b></div>)}</div>{groupIndex === 0 && <button className="text-button">Ver confrontos <ArrowRight size={14} /></button>}</article>)}</section>}
  </div>
}
