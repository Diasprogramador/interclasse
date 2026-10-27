import { useState, type FormEvent } from 'react'
import { AlertTriangle, Check, ChevronRight, Clock3, HeartPulse, MapPin, Megaphone, Radio, ShieldCheck, Siren, Users, X } from 'lucide-react'
import { useAppData } from '../contexts/AppDataContext'
import { MotionIcon } from '../components/MotionIcon'

export function EventControlPage() {
  const { data, toggleTask, createAnnouncement, createIncident } = useAppData()
  const [announcementOpen, setAnnouncementOpen] = useState(false)
  const [incidentOpen, setIncidentOpen] = useState(false)
  const [feedback, setFeedback] = useState('')
  if (!data) return null
  const isOrganizer = data.classroom?.ownerId === data.profile.id
  const done = data.tasks.filter((task) => task.done).length

  async function publish(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); const form = new FormData(event.currentTarget)
    const result = await createAnnouncement({ title: String(form.get('title')), message: String(form.get('message')), priority: String(form.get('priority')) as 'normal' | 'important' | 'urgent' })
    setFeedback(result.error ?? result.success ?? ''); if (!result.error) setAnnouncementOpen(false)
  }
  async function reportIncident(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); const form = new FormData(event.currentTarget)
    const result = await createIncident({ title: String(form.get('title')), location: String(form.get('location')), severity: String(form.get('severity')) as 'low' | 'medium' | 'high' })
    setFeedback(result.error ?? result.success ?? ''); if (!result.error) setIncidentOpen(false)
  }

  return <div className="page-container event-page"><section className="page-title event-title"><div><span className="eyebrow">CENTRAL DE OPERAÇÕES</span><h1>Controle do evento</h1><p>Organização da rodada, comunicação, segurança e estrutura.</p></div>{isOrganizer && <button className="primary-button" onClick={() => setAnnouncementOpen(true)}><Megaphone size={17} /> Publicar aviso</button>}</section>
    {feedback && <div className="form-message page-feedback">{feedback}</div>}
    <section className="event-status-strip"><div><span className="status-live"><i /> EVENTO EM ANDAMENTO</span><strong>Operação normal</strong></div><div><MotionIcon icon={Users} pattern="dots" tone="blue" /><span><strong>184</strong><small>presentes</small></span></div><div><MotionIcon icon={Radio} pattern="signal" tone="green" /><span><strong>3/3</strong><small>quadras ativas</small></span></div><div><MotionIcon icon={HeartPulse} pattern="pulse" tone="red" /><span><strong>Pronto</strong><small>apoio médico</small></span></div><div><MotionIcon icon={ShieldCheck} pattern="orbit" tone="yellow" /><span><strong>12</strong><small>credenciais pendentes</small></span></div></section>
    <div className="event-layout"><div className="event-main">
      <section className="panel ops-checklist"><div className="panel-head"><div><span className="eyebrow">CHECKLIST DA RODADA</span><h2>Preparação operacional</h2></div><span className="completion-label">{done}/{data.tasks.length} concluídas</span></div><div className="ops-progress"><i style={{ width: `${data.tasks.length ? done / data.tasks.length * 100 : 0}%` }} /></div><div className="task-list">{data.tasks.map((task) => <button key={task.id} onClick={() => isOrganizer && void toggleTask(task.id)} className={task.done ? 'task-row done' : 'task-row'} disabled={!isOrganizer}><span className="task-check">{task.done && <Check size={14} />}</span><div><strong>{task.title}</strong><small>{task.category}</small></div><time><Clock3 size={13} /> {task.dueTime}</time></button>)}</div></section>
      <section className="panel court-control"><div className="panel-head"><div><span className="eyebrow">ESPAÇOS</span><h2>Quadras e equipes de apoio</h2></div></div>{[
        ['Quadra A', 'Vôlei · 2º A × 1º C', 'Em aquecimento', 'Prof. Marcos'],
        ['Quadra B', 'Basquete · 3º B × 2º C', 'Livre até 15:00', 'Profa. Lívia'],
        ['Ginásio', 'Futsal · 3º A × 2º B', 'Partida ao vivo', 'Prof. Renato'],
      ].map(([court, match, status, official], index) => <article key={court}><span className={`court-number ${index === 2 ? 'active' : ''}`}>{index + 1}</span><div><strong>{court}</strong><small><MapPin size={12} /> {match}</small></div><span><b>{status}</b><small>Responsável: {official}</small></span><ChevronRight size={17} /></article>)}</section>
    </div><aside className="event-side">
      <section className="panel incident-card"><div className="panel-head"><div><span className="eyebrow">SEGURANÇA</span><h2>Ocorrências</h2></div><Siren size={20} /></div>{data.incidents.length ? <div className="incident-list">{data.incidents.slice(0, 3).map((incident) => <article key={incident.id} className={`incident incident--${incident.severity}`}><i /><div><strong>{incident.title}</strong><small>{incident.location} · {incident.status === 'open' ? 'Em aberto' : 'Resolvida'}</small></div></article>)}</div> : <div className="incident-empty"><ShieldCheck size={28} /><strong>Nenhuma ocorrência aberta</strong><p>O evento está operando normalmente.</p></div>}{isOrganizer && <button className="outline-button" onClick={() => setIncidentOpen(true)}><AlertTriangle size={15} /> Registrar ocorrência</button>}</section>
      <section className="panel announcements-card"><div className="panel-head"><div><span className="eyebrow">COMUNICAÇÃO</span><h2>Últimos avisos</h2></div></div>{data.announcements.slice(0, 4).map((item) => <article key={item.id} className={`announcement announcement--${item.priority}`}><span>{item.priority === 'urgent' ? <Siren size={15} /> : <Megaphone size={15} />}</span><div><strong>{item.title}</strong><p>{item.message}</p><small>{new Date(item.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</small></div></article>)}</section>
    </aside></div>
    {announcementOpen && <div className="modal-layer"><button className="backdrop" onClick={() => setAnnouncementOpen(false)} aria-label="Fechar" /><form className="modal" onSubmit={publish}><div className="modal__head"><div><span className="eyebrow">COMUNICAÇÃO</span><h2>Novo comunicado</h2></div><button type="button" className="icon-button" onClick={() => setAnnouncementOpen(false)}><X size={19} /></button></div><label>Título<input required name="title" maxLength={60} placeholder="Ex.: Mudança de horário" /></label><label>Mensagem<textarea required name="message" maxLength={240} placeholder="Escreva uma orientação clara para alunos e equipes." /></label><label>Prioridade<select name="priority" defaultValue="normal"><option value="normal">Normal</option><option value="important">Importante</option><option value="urgent">Urgente</option></select></label><div className="modal__actions"><button type="button" className="outline-button" onClick={() => setAnnouncementOpen(false)}>Cancelar</button><button className="primary-button">Publicar aviso</button></div></form></div>}
    {incidentOpen && <div className="modal-layer"><button className="backdrop" onClick={() => setIncidentOpen(false)} aria-label="Fechar" /><form className="modal" onSubmit={reportIncident}><div className="modal__head"><div><span className="eyebrow">SEGURANÇA DO EVENTO</span><h2>Registrar ocorrência</h2></div><button type="button" className="icon-button" onClick={() => setIncidentOpen(false)}><X size={19} /></button></div><label>Ocorrência<input required name="title" maxLength={100} placeholder="Ex.: Atleta com lesão leve" /></label><label>Local<input required name="location" maxLength={60} placeholder="Ex.: Quadra A" /></label><label>Gravidade<select name="severity" defaultValue="low"><option value="low">Baixa</option><option value="medium">Média</option><option value="high">Alta</option></select></label><div className="modal__actions"><button type="button" className="outline-button" onClick={() => setIncidentOpen(false)}>Cancelar</button><button className="primary-button">Registrar</button></div></form></div>}
  </div>
}
