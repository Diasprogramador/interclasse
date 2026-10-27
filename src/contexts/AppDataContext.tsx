import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { demoData, loadDemoData, saveDemoData } from '../data/demo'
import { supabase } from '../lib/supabase'
import type { AppData, Classroom, Match, PlayerStat, Profile, Standing, Team, TeamInvitation, TeamMember, Theme } from '../types'
import { useAuth } from './AuthContext'

type MutationResult = { error?: string; success?: string }

type AppDataContextValue = {
  data: AppData | null
  loading: boolean
  error: string | null
  refresh: () => Promise<void>
  createClassroom: (input: { name: string; grade: string }) => Promise<MutationResult>
  joinClassroom: (code: string) => Promise<MutationResult>
  createTeam: (input: Pick<Team, 'name' | 'shortName' | 'color' | 'mascot' | 'bio'>) => Promise<MutationResult>
  updateTeam: (input: Partial<Pick<Team, 'name' | 'shortName' | 'color' | 'mascot' | 'bio'>>) => Promise<MutationResult>
  invitePlayer: (nickname: string) => Promise<MutationResult>
  respondInvitation: (invitationId: string, accept: boolean) => Promise<MutationResult>
  removeMember: (memberId: string) => Promise<MutationResult>
  updatePreferences: (input: { theme?: Theme; notificationsEnabled?: boolean }) => Promise<MutationResult>
  toggleTask: (taskId: string) => Promise<MutationResult>
  createAnnouncement: (input: { title: string; message: string; priority: 'normal' | 'important' | 'urgent' }) => Promise<MutationResult>
  createIncident: (input: { title: string; location: string; severity: 'low' | 'medium' | 'high' }) => Promise<MutationResult>
  resetDemo: () => void
}

const AppDataContext = createContext<AppDataContextValue | null>(null)

type ClassroomRow = { classrooms: { id: string; name: string; grade: string; invite_code: string; owner_id: string } | null }
type TeamMembershipRow = { teams: { id: string; classroom_id: string; captain_id: string; name: string; short_name: string; color: string; mascot: string; bio: string } | null }
type MemberRow = { id: string; user_id: string; number: number; position: string; role: 'captain' | 'player'; profiles: { nickname: string; display_name: string } | null }

function mapTeam(row: TeamMembershipRow['teams']): Team | null {
  if (!row) return null
  return { id: row.id, classroomId: row.classroom_id, captainId: row.captain_id, name: row.name, shortName: row.short_name, color: row.color, mascot: row.mascot, bio: row.bio }
}

async function loadSupabaseData(userId: string, email: string): Promise<AppData> {
  if (!supabase) throw new Error('Supabase não configurado')
  const { data: profileRow, error: profileError } = await supabase.from('profiles').select('*').eq('id', userId).single()
  if (profileError) throw profileError

  const profile: Profile = {
    id: userId,
    email,
    nickname: profileRow.nickname,
    displayName: profileRow.display_name,
    classGrade: profileRow.class_grade,
    notificationsEnabled: profileRow.notifications_enabled,
    theme: profileRow.theme,
  }

  const { data: classroomMembership } = await supabase.from('classroom_members').select('classrooms(id,name,grade,invite_code,owner_id)').eq('user_id', userId).maybeSingle()
  const classroomRow = (classroomMembership as ClassroomRow | null)?.classrooms
  const classroom: Classroom | null = classroomRow ? { id: classroomRow.id, name: classroomRow.name, grade: classroomRow.grade, inviteCode: classroomRow.invite_code, ownerId: classroomRow.owner_id } : null

  const { data: membership } = await supabase.from('team_members').select('teams(id,classroom_id,captain_id,name,short_name,color,mascot,bio)').eq('user_id', userId).maybeSingle()
  const team = mapTeam((membership as TeamMembershipRow | null)?.teams ?? null)

  let members: TeamMember[] = []
  if (team) {
    const { data: rows } = await supabase.from('team_members').select('id,user_id,number,position,role,profiles(nickname,display_name)').eq('team_id', team.id).order('created_at')
    members = ((rows ?? []) as unknown as MemberRow[]).map((row) => ({ id: row.id, userId: row.user_id, nickname: row.profiles?.nickname ?? 'jogador', displayName: row.profiles?.display_name ?? 'Jogador', number: row.number, position: row.position, role: row.role }))
  }

  const classroomId = classroom?.id
  const [{ data: standingRows }, { data: statRows }, { data: matchRows }, { data: inviteRows }, { data: bracketRows }, { data: taskRows }, { data: announcementRows }, { data: incidentRows }] = await Promise.all([
    classroomId ? supabase.from('standings').select('*').eq('classroom_id', classroomId).order('points', { ascending: false }) : Promise.resolve({ data: [] }),
    classroomId ? supabase.from('player_leaderboard').select('*').eq('classroom_id', classroomId) : Promise.resolve({ data: [] }),
    classroomId ? supabase.from('match_overview').select('*').eq('classroom_id', classroomId).order('starts_at') : Promise.resolve({ data: [] }),
    supabase.from('team_invitation_overview').select('*').eq('recipient_id', userId).eq('status', 'pending'),
    classroomId ? supabase.from('bracket_overview').select('*').eq('classroom_id', classroomId).order('stage_order').order('tie_order') : Promise.resolve({ data: [] }),
    classroomId ? supabase.from('event_tasks').select('*').eq('classroom_id', classroomId).order('due_time') : Promise.resolve({ data: [] }),
    classroomId ? supabase.from('announcements').select('*').eq('classroom_id', classroomId).order('created_at', { ascending: false }).limit(8) : Promise.resolve({ data: [] }),
    classroomId ? supabase.from('event_incidents').select('*').eq('classroom_id', classroomId).order('created_at', { ascending: false }).limit(10) : Promise.resolve({ data: [] }),
  ])

  const standings: Standing[] = (standingRows ?? []).map((row) => ({ position: 0, teamId: row.team_id, teamName: row.team_name, shortName: row.short_name, color: row.color, played: row.played, wins: row.wins, draws: row.draws, losses: row.losses, goalsFor: row.goals_for, goalsAgainst: row.goals_against, points: row.points })).map((row, index) => ({ ...row, position: index + 1 }))
  const stats: PlayerStat[] = (statRows ?? []).map((row) => ({ playerId: row.player_id, nickname: row.nickname, teamName: row.team_name, teamColor: row.team_color, goals: row.goals, assists: row.assists, matches: row.matches }))
  const matches: Match[] = (matchRows ?? []).map((row) => ({ id: row.id, sport: row.sport, startsAt: row.starts_at, venue: row.venue, status: row.status, homeTeam: row.home_team, awayTeam: row.away_team, homeColor: row.home_color, awayColor: row.away_color, homeScore: row.home_score, awayScore: row.away_score }))
  const invitations: TeamInvitation[] = (inviteRows ?? []).map((row) => ({ id: row.id, teamName: row.team_name, invitedBy: row.invited_by, createdAt: row.created_at }))
  const bracket = (bracketRows ?? []).map((row) => ({ id: row.id, stage: row.stage, order: row.tie_order, homeTeam: row.home_team, awayTeam: row.away_team, homeColor: row.home_color, awayColor: row.away_color, firstLegHome: row.first_leg_home, firstLegAway: row.first_leg_away, secondLegHome: row.second_leg_home, secondLegAway: row.second_leg_away, winner: row.winner }))
  const tasks = (taskRows ?? []).map((row) => ({ id: row.id, title: row.title, category: row.category, dueTime: row.due_time?.slice(0, 5) ?? '', done: row.done }))
  const announcements = (announcementRows ?? []).map((row) => ({ id: row.id, title: row.title, message: row.message, priority: row.priority, createdAt: row.created_at }))
  const incidents = (incidentRows ?? []).map((row) => ({ id: row.id, title: row.title, location: row.location, severity: row.severity, status: row.status, createdAt: row.created_at }))

  return { profile, classroom, team, members, standings, stats, matches, invitations, bracket, tasks, announcements, incidents }
}

export function AppDataProvider({ children }: { children: ReactNode }) {
  const { user, isDemo } = useAuth()
  const [data, setData] = useState<AppData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    if (!user) { setData(null); setLoading(false); return }
    setLoading(true)
    try {
      setData(isDemo ? loadDemoData() : await loadSupabaseData(user.id, user.email))
      setError(null)
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Não foi possível carregar os dados.')
    } finally { setLoading(false) }
  }, [isDemo, user])

  useEffect(() => { void refresh() }, [refresh])
  useEffect(() => {
    const theme = data?.profile.theme
    if (!theme) return
    document.documentElement.dataset.theme = theme === 'system'
      ? (matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark')
      : theme
  }, [data?.profile.theme])

  const updateDemo = useCallback((updater: (current: AppData) => AppData) => {
    setData((current) => {
      const next = updater(current ?? structuredClone(demoData))
      saveDemoData(next)
      return next
    })
  }, [])

  const value = useMemo<AppDataContextValue>(() => ({
    data, loading, error, refresh,
    async createClassroom(input) {
      if (!user) return { error: 'Faça login novamente.' }
      if (isDemo) {
        updateDemo((current) => ({ ...current, classroom: { id: crypto.randomUUID(), name: input.name, grade: input.grade, inviteCode: `ARENA${input.grade.replace(/\W/g, '').toUpperCase()}`, ownerId: user.id }, profile: { ...current.profile, classGrade: input.grade }, team: null, members: [] }))
        return { success: 'Sala criada.' }
      }
      const { error: rpcError } = await supabase!.rpc('create_classroom_with_owner', { classroom_name: input.name, classroom_grade: input.grade })
      if (rpcError) return { error: rpcError.message }
      await refresh(); return { success: 'Sala criada.' }
    },
    async joinClassroom(code) {
      if (isDemo) return { success: 'Você já está na sala de demonstração.' }
      const { error: rpcError } = await supabase!.rpc('join_classroom_by_code', { code_input: code.trim().toUpperCase() })
      if (rpcError) return { error: rpcError.message }
      await refresh(); return { success: 'Você entrou na sala.' }
    },
    async createTeam(input) {
      if (!user || !data?.classroom) return { error: 'Entre em uma sala primeiro.' }
      if (isDemo) {
        const team: Team = { id: crypto.randomUUID(), classroomId: data.classroom.id, captainId: user.id, ...input }
        updateDemo((current) => ({ ...current, team, members: [{ id: crypto.randomUUID(), userId: user.id, nickname: current.profile.nickname, displayName: current.profile.displayName, number: 10, position: 'A definir', role: 'captain' }] }))
        return { success: 'Time criado.' }
      }
      const { error: rpcError } = await supabase!.rpc('create_team_with_captain', { team_name: input.name, team_short_name: input.shortName, team_color: input.color, team_mascot: input.mascot, team_bio: input.bio })
      if (rpcError) return { error: rpcError.message }
      await refresh(); return { success: 'Time criado.' }
    },
    async updateTeam(input) {
      if (!data?.team) return { error: 'Time não encontrado.' }
      if (isDemo) { updateDemo((current) => ({ ...current, team: current.team ? { ...current.team, ...input } : null })); return { success: 'Dados do time atualizados.' } }
      const payload = { ...(input.name && { name: input.name }), ...(input.shortName && { short_name: input.shortName }), ...(input.color && { color: input.color }), ...(input.mascot !== undefined && { mascot: input.mascot }), ...(input.bio !== undefined && { bio: input.bio }) }
      const { error: updateError } = await supabase!.from('teams').update(payload).eq('id', data.team.id)
      if (updateError) return { error: updateError.message }
      await refresh(); return { success: 'Dados do time atualizados.' }
    },
    async invitePlayer(nickname) {
      if (!data?.team) return { error: 'Crie um time primeiro.' }
      if (data.members.length >= 12) return { error: 'O limite de 12 jogadores foi atingido.' }
      if (isDemo) {
        if (data.members.some((member) => member.nickname.toLowerCase() === nickname.toLowerCase())) return { error: 'Esse jogador já faz parte do time.' }
        updateDemo((current) => ({ ...current, members: [...current.members, { id: crypto.randomUUID(), userId: crypto.randomUUID(), nickname: nickname.toLowerCase(), displayName: nickname, number: current.members.length + 1, position: 'A definir', role: 'player' }] }))
        return { success: `@${nickname} foi adicionado no modo demonstração.` }
      }
      const { error: rpcError } = await supabase!.rpc('invite_player_by_nickname', { target_team_id: data.team.id, target_nickname: nickname.toLowerCase() })
      return rpcError ? { error: rpcError.message } : { success: `Convite enviado para @${nickname}.` }
    },
    async respondInvitation(invitationId, accept) {
      if (isDemo) {
        updateDemo((current) => ({ ...current, invitations: current.invitations.filter((item) => item.id !== invitationId) }))
        return { success: accept ? 'Convite aceito.' : 'Convite recusado.' }
      }
      const { error: rpcError } = await supabase!.rpc('respond_team_invitation', { invitation_id: invitationId, accept_invitation: accept })
      if (rpcError) return { error: rpcError.message }
      await refresh(); return { success: accept ? 'Você entrou no time.' : 'Convite recusado.' }
    },
    async removeMember(memberId) {
      if (!data?.team) return { error: 'Time não encontrado.' }
      const member = data.members.find((item) => item.id === memberId)
      if (member?.role === 'captain') return { error: 'O capitão não pode ser removido.' }
      if (isDemo) { updateDemo((current) => ({ ...current, members: current.members.filter((item) => item.id !== memberId) })); return { success: 'Jogador removido.' } }
      const { error: deleteError } = await supabase!.from('team_members').delete().eq('id', memberId).eq('team_id', data.team.id)
      if (deleteError) return { error: deleteError.message }
      await refresh(); return { success: 'Jogador removido.' }
    },
    async updatePreferences(input) {
      if (!data) return { error: 'Perfil não carregado.' }
      const profile = { ...data.profile, ...(input.theme && { theme: input.theme }), ...(input.notificationsEnabled !== undefined && { notificationsEnabled: input.notificationsEnabled }) }
      document.documentElement.dataset.theme = profile.theme === 'system' ? (matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark') : profile.theme
      if (isDemo) { updateDemo((current) => ({ ...current, profile })); return { success: 'Preferências salvas.' } }
      const { error: updateError } = await supabase!.from('profiles').update({ theme: input.theme, notifications_enabled: input.notificationsEnabled }).eq('id', data.profile.id)
      if (updateError) return { error: updateError.message }
      setData({ ...data, profile }); return { success: 'Preferências salvas.' }
    },
    async toggleTask(taskId) {
      const task = data?.tasks.find((item) => item.id === taskId)
      if (!task) return { error: 'Tarefa não encontrada.' }
      if (isDemo) { updateDemo((current) => ({ ...current, tasks: current.tasks.map((item) => item.id === taskId ? { ...item, done: !item.done } : item) })); return { success: 'Checklist atualizado.' } }
      const { error: updateError } = await supabase!.from('event_tasks').update({ done: !task.done }).eq('id', taskId)
      if (updateError) return { error: updateError.message }
      await refresh(); return { success: 'Checklist atualizado.' }
    },
    async createAnnouncement(input) {
      if (!data?.classroom) return { error: 'Sala não encontrada.' }
      if (isDemo) { updateDemo((current) => ({ ...current, announcements: [{ id: crypto.randomUUID(), ...input, createdAt: new Date().toISOString() }, ...current.announcements] })); return { success: 'Comunicado publicado.' } }
      const { error: insertError } = await supabase!.from('announcements').insert({ classroom_id: data.classroom.id, author_id: data.profile.id, title: input.title, message: input.message, priority: input.priority })
      if (insertError) return { error: insertError.message }
      await refresh(); return { success: 'Comunicado publicado.' }
    },
    async createIncident(input) {
      if (!data?.classroom) return { error: 'Sala não encontrada.' }
      if (isDemo) { updateDemo((current) => ({ ...current, incidents: [{ id: crypto.randomUUID(), ...input, status: 'open', createdAt: new Date().toISOString() }, ...current.incidents] })); return { success: 'Ocorrência registrada.' } }
      const { error: insertError } = await supabase!.from('event_incidents').insert({ classroom_id: data.classroom.id, reported_by: data.profile.id, title: input.title, location: input.location, severity: input.severity })
      if (insertError) return { error: insertError.message }
      await refresh(); return { success: 'Ocorrência registrada.' }
    },
    resetDemo() { localStorage.removeItem('arena-demo-data'); setData(structuredClone(demoData)) },
  }), [data, error, isDemo, loading, refresh, updateDemo, user])

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>
}

export function useAppData() {
  const context = useContext(AppDataContext)
  if (!context) throw new Error('useAppData precisa estar dentro de AppDataProvider')
  return context
}
