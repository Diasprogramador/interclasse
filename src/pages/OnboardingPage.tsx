import { useState, type FormEvent } from 'react'
import { ArrowRight, DoorOpen, GraduationCap, Plus, Users } from 'lucide-react'
import { useAppData } from '../contexts/AppDataContext'

export function OnboardingPage() {
  const [choice, setChoice] = useState<'create' | 'join' | null>(null)
  const [feedback, setFeedback] = useState('')
  const { createClassroom, joinClassroom } = useAppData()

  async function submitCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); const form = new FormData(event.currentTarget)
    const result = await createClassroom({ name: String(form.get('name')), grade: String(form.get('grade')) })
    setFeedback(result.error ?? result.success ?? '')
  }
  async function submitJoin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); const result = await joinClassroom(String(new FormData(event.currentTarget).get('code')))
    setFeedback(result.error ?? result.success ?? '')
  }

  return <section className="onboarding page-container">
    <div className="onboarding__intro"><span className="eyebrow">PRIMEIRO PASSO</span><h1>Qual é a sua sala?</h1><p>A sala reúne os times, jogos e rankings do seu interclasse. Crie uma nova ou entre usando o código compartilhado pelo representante.</p></div>
    {!choice ? <div className="choice-grid">
      <button className="choice-card" onClick={() => setChoice('create')}><span><Plus size={23} /></span><h2>Criar minha sala</h2><p>Para representantes que vão organizar e convidar a turma.</p><b>Começar <ArrowRight size={16} /></b></button>
      <button className="choice-card" onClick={() => setChoice('join')}><span><DoorOpen size={23} /></span><h2>Entrar com código</h2><p>Use o código recebido para identificar sua sala.</p><b>Usar código <ArrowRight size={16} /></b></button>
    </div> : <div className="setup-card">
      <button className="back-link" onClick={() => { setChoice(null); setFeedback('') }}>← Voltar</button>
      <span className="setup-card__icon">{choice === 'create' ? <GraduationCap size={25} /> : <Users size={25} />}</span>
      <h2>{choice === 'create' ? 'Criar sala' : 'Entrar em uma sala'}</h2>
      <p>{choice === 'create' ? 'Você será o representante e poderá compartilhar o código.' : 'Peça o código para o representante da sua turma.'}</p>
      {choice === 'create' ? <form onSubmit={submitCreate}><label>Nome da sala<input required name="name" placeholder="Ex.: 3º A — Ensino Médio" /></label><label>Turma<input required name="grade" placeholder="Ex.: 3º A" maxLength={12} /></label><button className="primary-button">Criar sala <ArrowRight size={17} /></button></form> : <form onSubmit={submitJoin}><label>Código da sala<input required name="code" placeholder="Ex.: ARENA3A" className="code-input" maxLength={12} /></label><button className="primary-button">Entrar na sala <ArrowRight size={17} /></button></form>}
      {feedback && <div className="form-message">{feedback}</div>}
    </div>}
  </section>
}
