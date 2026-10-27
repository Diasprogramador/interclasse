export type Theme = 'dark' | 'light' | 'system'
export type MemberRole = 'captain' | 'player'

export type Profile = {
  id: string
  email: string
  nickname: string
  displayName: string
  classGrade: string | null
  notificationsEnabled: boolean
  theme: Theme
}

export type Classroom = {
  id: string
  name: string
  grade: string
  inviteCode: string
  ownerId: string
}

export type Team = {
  id: string
  classroomId: string
  captainId: string
  name: string
  shortName: string
  color: string
  mascot: string
  bio: string
}

export type TeamMember = {
  id: string
  userId: string
  nickname: string
  displayName: string
  number: number
  position: string
  role: MemberRole
}

export type Standing = {
  position: number
  teamId: string
  teamName: string
  shortName: string
  color: string
  played: number
  wins: number
  draws: number
  losses: number
  goalsFor: number
  goalsAgainst: number
  points: number
}

export type PlayerStat = {
  playerId: string
  nickname: string
  teamName: string
  teamColor: string
  goals: number
  assists: number
  matches: number
}

export type Match = {
  id: string
  sport: string
  startsAt: string
  venue: string
  status: 'scheduled' | 'live' | 'finished'
  homeTeam: string
  awayTeam: string
  homeColor: string
  awayColor: string
  homeScore: number | null
  awayScore: number | null
}

export type TeamInvitation = {
  id: string
  teamName: string
  invitedBy: string
  createdAt: string
}

export type BracketTie = {
  id: string
  stage: 'round-of-16' | 'quarterfinal' | 'semifinal' | 'final'
  order: number
  homeTeam: string
  awayTeam: string
  homeColor: string
  awayColor: string
  firstLegHome: number | null
  firstLegAway: number | null
  secondLegHome: number | null
  secondLegAway: number | null
  winner: string | null
}

export type EventTask = {
  id: string
  title: string
  category: 'estrutura' | 'arbitragem' | 'comunicação' | 'saúde'
  dueTime: string
  done: boolean
}

export type Announcement = {
  id: string
  title: string
  message: string
  priority: 'normal' | 'important' | 'urgent'
  createdAt: string
}

export type EventIncident = {
  id: string
  title: string
  location: string
  severity: 'low' | 'medium' | 'high'
  status: 'open' | 'resolved'
  createdAt: string
}

export type AppData = {
  profile: Profile
  classroom: Classroom | null
  team: Team | null
  members: TeamMember[]
  standings: Standing[]
  stats: PlayerStat[]
  matches: Match[]
  invitations: TeamInvitation[]
  bracket: BracketTie[]
  tasks: EventTask[]
  announcements: Announcement[]
  incidents: EventIncident[]
}
