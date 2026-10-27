import { useEffect, useState, type FormEvent } from 'react'
import { Crown, Edit3, Plus, Search, Shield, Trash2, UserPlus, Users, X } from 'lucide-react'
import type { Team } from '../types'
import { useAppData } from '../contexts/AppDataContext'

export function TeamPage() {
  const { data, createTeam, updateTeam, invitePlayer, removeMember } = useAppData()
  const [editing, setEditing] = useState(false)
  const [inviting, setInviting] = useState(false)
  const [feedback, setFeedback] = useState('')
  useEffect(() => { setFeedback('') }, [editing, inviting])
  if (!data) return null
  const hasTeam = Boolean(data.team)

  async function saveTeam(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); const form = new FormData(event.currentTarget)
    const input = { name: String(form.get('name')), shortName: String(form.get('shortName')).toUpperCase(), color: String(form.get('color')), mascot: String(form.get('mascot')), bio: String(form.get('bio')) }
    const result = hasTeam ? await updateTeam(input) : await createTeam(input)
    setFeedback(result.error ?? result.success ?? ''); if (!result.error) setEditing(false)
  }
  async function sendInvite(event: FormEvent<HTMLFormElement>) { event.preventDefault(); const result = await invitePlayer(String(new FormData(event.currentTarget).get('nickname')).replace('@', '')); setFeedback(result.error ?? result.success ?? ''); if (!result.error) event.currentTarget.reset() }

  if (!data.team) return <div className="page-container"><section className="empty-team"><span><Shield size={36} /></span><small className="eyebrow">SUA EQUIPE</small><h1>Crie o time da sua sala</h1><p>Defina a identidade do time e depois convide até 11 jogadores usando o nickname de cada um.</p><button className="primary-button" onClick={() => setEditing(true)}><Plus size={18} /> Criar meu time</button></section>{editing && <TeamModal onClose={() => setEditing(false)} onSubmit={saveTeam} feedback={feedback} />}</div>

  return <div className="page-container">
    <section className="team-hero" style={{ '--team-color': data.team.color } as React.CSSProperties}><div className="team-shield"><Shield size={52} /><b>{data.team.shortName}</b></div><div><span className="eyebrow">MEU TIME · {data.classroom?.grade}</span><h1>{data.team.name}</h1><p>{data.team.mascot} · {data.team.bio}</p></div><button className="outline-button" onClick={() => setEditing(true)}><Edit3 size={16} /> Editar time</button></section>
    <section className="roster-head"><div><span className="eyebrow">ELENCO OFICIAL</span><h2>{data.members.length} de 12 jogadores</h2></div><button className="primary-button" disabled={data.members.length >= 12} onClick={() => setInviting(true)}><UserPlus size={18} /> Convidar jogador</button></section>
    {feedback && <div className="form-message page-feedback">{feedback}</div>}
    <section className="roster-grid">{data.members.map((member) => <article className="player-card" key={member.id}><div className="jersey-number">{String(member.number).padStart(2, '0')}</div><span className="player-avatar player-avatar--large">{member.displayName.split(' ').map((word) => word[0]).slice(0, 2).join('')}</span><div><strong>{member.displayName}</strong><span>@{member.nickname}</span><small>{member.position}</small></div>{member.role === 'captain' ? <span className="captain-tag"><Crown size={13} /> Capitão</span> : <button className="remove-player" onClick={async () => { const result = await removeMember(member.id); setFeedback(result.error ?? result.success ?? '') }} aria-label={`Remover ${member.displayName}`}><Trash2 size={16} /></button>}</article>)}{Array.from({ length: Math.max(0, 12 - data.members.length) }).map((_, index) => <button className="player-card player-card--empty" key={index} onClick={() => setInviting(true)}><Plus size={19} /><span>Vaga disponível</span></button>)}</section>
    <section className="panel team-invite-panel"><div><Users size={22} /><span><strong>Convide seus colegas pelo nickname</strong><small>O jogador precisa ter uma conta na Arena Escolar.</small></span></div><button className="outline-button" onClick={() => setInviting(true)}><Search size={16} /> Buscar jogador</button></section>
    {editing && <TeamModal team={data.team} onClose={() => setEditing(false)} onSubmit={saveTeam} feedback={feedback} />}
    {inviting && <div className="modal-layer"><button className="backdrop" onClick={() => setInviting(false)} aria-label="Fechar" /><form className="modal" onSubmit={sendInvite}><div className="modal__head"><div><span className="eyebrow">NOVO JOGADOR</span><h2>Convidar para o time</h2></div><button type="button" className="icon-button" onClick={() => setInviting(false)}><X size={19} /></button></div><label>Nickname<span className="input-prefix"><b>@</b><input name="nickname" required placeholder="nickname do jogador" /></span></label><p className="field-help">O convite aparecerá na conta do jogador. Limite máximo: 12 integrantes.</p>{feedback && <div className="form-message">{feedback}</div>}<div className="modal__actions"><button type="button" className="outline-button" onClick={() => setInviting(false)}>Cancelar</button><button className="primary-button">Enviar convite</button></div></form></div>}
  </div>
}

function TeamModal({ team, onClose, onSubmit, feedback }: { team?: Team | null; onClose: () => void; onSubmit: (event: FormEvent<HTMLFormElement>) => void; feedback: string }) {
  return <div className="modal-layer"><button className="backdrop" onClick={onClose} aria-label="Fechar" /><form className="modal" onSubmit={onSubmit}><div className="modal__head"><div><span className="eyebrow">IDENTIDADE DA EQUIPE</span><h2>{team ? 'Editar time' : 'Criar meu time'}</h2></div><button type="button" className="icon-button" onClick={onClose}><X size={19} /></button></div><label>Nome do time<input name="name" required defaultValue={team?.name ?? ''} placeholder="Ex.: Terceirão Azul" maxLength={32} /></label><div className="form-grid"><label>Sigla<input name="shortName" required defaultValue={team?.shortName ?? ''} placeholder="3A" maxLength={4} /></label><label>Cor principal<input name="color" type="color" defaultValue={team?.color ?? '#4e8cd8'} /></label></div><label>Mascote<input name="mascot" defaultValue={team?.mascot ?? ''} placeholder="Ex.: Falcões" maxLength={24} /></label><label>Grito ou descrição<textarea name="bio" defaultValue={team?.bio ?? ''} placeholder="O que representa o time?" maxLength={140} /></label>{feedback && <div className="form-message">{feedback}</div>}<div className="modal__actions"><button type="button" className="outline-button" onClick={onClose}>Cancelar</button><button className="primary-button">Salvar time</button></div></form></div>
}
