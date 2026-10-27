import type { AppData } from '../types'

export const demoData: AppData = {
  profile: {
    id: 'demo-user', email: 'capitao@arena.demo', nickname: 'capitao10',
    displayName: 'André Martins', classGrade: '3º A', notificationsEnabled: true, theme: 'dark',
  },
  classroom: { id: 'class-demo', name: '3º A — Ensino Médio', grade: '3º A', inviteCode: 'ARENA3A', ownerId: 'demo-user' },
  team: { id: 'team-demo', classroomId: 'class-demo', captainId: 'demo-user', name: 'Terceirão Azul', shortName: '3A', color: '#4e8cd8', mascot: 'Falcões', bio: 'Raça, respeito e união até o último apito.' },
  members: [
    { id: 'm1', userId: 'demo-user', nickname: 'capitao10', displayName: 'André Martins', number: 10, position: 'Ala', role: 'captain' },
    { id: 'm2', userId: 'u2', nickname: 'lukinhas9', displayName: 'Lucas Almeida', number: 9, position: 'Pivô', role: 'player' },
    { id: 'm3', userId: 'u3', nickname: 'paredao1', displayName: 'Caio Ferreira', number: 1, position: 'Goleiro', role: 'player' },
    { id: 'm4', userId: 'u4', nickname: 'rafa7', displayName: 'Rafael Costa', number: 7, position: 'Ala', role: 'player' },
    { id: 'm5', userId: 'u5', nickname: 'gui5', displayName: 'Guilherme Lima', number: 5, position: 'Fixo', role: 'player' },
  ],
  standings: [
    { position: 1, teamId: 'team-demo', teamName: 'Terceirão Azul', shortName: '3A', color: '#4e8cd8', played: 4, wins: 4, draws: 0, losses: 0, goalsFor: 15, goalsAgainst: 4, points: 12 },
    { position: 2, teamId: 't2', teamName: 'Falcões', shortName: '2B', color: '#ee5a4e', played: 4, wins: 3, draws: 0, losses: 1, goalsFor: 11, goalsAgainst: 6, points: 9 },
    { position: 3, teamId: 't3', teamName: 'Trovões', shortName: '1C', color: '#f3c84b', played: 4, wins: 2, draws: 1, losses: 1, goalsFor: 9, goalsAgainst: 7, points: 7 },
    { position: 4, teamId: 't4', teamName: 'Panteras', shortName: '3C', color: '#b96fe0', played: 4, wins: 2, draws: 0, losses: 2, goalsFor: 8, goalsAgainst: 9, points: 6 },
    { position: 5, teamId: 't5', teamName: 'Lobos', shortName: '2A', color: '#5fc28b', played: 4, wins: 1, draws: 0, losses: 3, goalsFor: 5, goalsAgainst: 12, points: 3 },
  ],
  stats: [
    { playerId: 'u2', nickname: 'lukinhas9', teamName: 'Terceirão Azul', teamColor: '#4e8cd8', goals: 7, assists: 3, matches: 4 },
    { playerId: 'u6', nickname: 'joaopedro11', teamName: 'Falcões', teamColor: '#ee5a4e', goals: 5, assists: 5, matches: 4 },
    { playerId: 'u4', nickname: 'rafa7', teamName: 'Terceirão Azul', teamColor: '#4e8cd8', goals: 4, assists: 6, matches: 4 },
    { playerId: 'u7', nickname: 'vini10', teamName: 'Trovões', teamColor: '#f3c84b', goals: 4, assists: 2, matches: 4 },
    { playerId: 'u8', nickname: 'mari8', teamName: 'Panteras', teamColor: '#b96fe0', goals: 3, assists: 4, matches: 4 },
  ],
  matches: [
    { id: 'g1', sport: 'Futsal', startsAt: new Date().toISOString(), venue: 'Ginásio principal', status: 'live', homeTeam: 'Terceirão Azul', awayTeam: 'Falcões', homeColor: '#4e8cd8', awayColor: '#ee5a4e', homeScore: 2, awayScore: 1 },
    { id: 'g2', sport: 'Vôlei', startsAt: '2026-10-27T14:20:00', venue: 'Quadra A', status: 'scheduled', homeTeam: '2º A', awayTeam: '1º C', homeColor: '#5fc28b', awayColor: '#f3c84b', homeScore: null, awayScore: null },
    { id: 'g3', sport: 'Basquete', startsAt: '2026-10-27T15:00:00', venue: 'Quadra B', status: 'scheduled', homeTeam: '3º B', awayTeam: '2º C', homeColor: '#b96fe0', awayColor: '#ee5a4e', homeScore: null, awayScore: null },
  ],
  invitations: [],
  bracket: [
    { id: 'b1', stage: 'round-of-16', order: 1, homeTeam: 'Terceirão Azul', awayTeam: 'Águias', homeColor: '#4e8cd8', awayColor: '#d9dfe5', firstLegHome: 2, firstLegAway: 0, secondLegHome: 1, secondLegAway: 1, winner: 'Terceirão Azul' },
    { id: 'b2', stage: 'round-of-16', order: 2, homeTeam: 'Falcões', awayTeam: 'Lobos', homeColor: '#ee5a4e', awayColor: '#5fc28b', firstLegHome: 1, firstLegAway: 0, secondLegHome: 2, secondLegAway: 2, winner: 'Falcões' },
    { id: 'b3', stage: 'round-of-16', order: 3, homeTeam: 'Trovões', awayTeam: 'Titãs', homeColor: '#f3c84b', awayColor: '#808bf0', firstLegHome: 3, firstLegAway: 1, secondLegHome: 0, secondLegAway: 0, winner: 'Trovões' },
    { id: 'b4', stage: 'round-of-16', order: 4, homeTeam: 'Panteras', awayTeam: 'Leões', homeColor: '#b96fe0', awayColor: '#dc873d', firstLegHome: 1, firstLegAway: 1, secondLegHome: 2, secondLegAway: 0, winner: 'Panteras' },
    { id: 'b5', stage: 'quarterfinal', order: 1, homeTeam: 'Terceirão Azul', awayTeam: 'Falcões', homeColor: '#4e8cd8', awayColor: '#ee5a4e', firstLegHome: 2, firstLegAway: 1, secondLegHome: null, secondLegAway: null, winner: null },
    { id: 'b6', stage: 'quarterfinal', order: 2, homeTeam: 'Trovões', awayTeam: 'Panteras', homeColor: '#f3c84b', awayColor: '#b96fe0', firstLegHome: 0, firstLegAway: 0, secondLegHome: null, secondLegAway: null, winner: null },
    { id: 'b7', stage: 'semifinal', order: 1, homeTeam: 'A definir', awayTeam: 'A definir', homeColor: '#53625c', awayColor: '#53625c', firstLegHome: null, firstLegAway: null, secondLegHome: null, secondLegAway: null, winner: null },
    { id: 'b8', stage: 'final', order: 1, homeTeam: 'A definir', awayTeam: 'A definir', homeColor: '#53625c', awayColor: '#53625c', firstLegHome: null, firstLegAway: null, secondLegHome: null, secondLegAway: null, winner: null },
  ],
  tasks: [
    { id: 'task1', title: 'Conferir redes e traves', category: 'estrutura', dueTime: '13:30', done: true },
    { id: 'task2', title: 'Confirmar árbitro da rodada', category: 'arbitragem', dueTime: '13:45', done: true },
    { id: 'task3', title: 'Separar kit de primeiros socorros', category: 'saúde', dueTime: '14:00', done: false },
    { id: 'task4', title: 'Publicar resultado do jogo 12', category: 'comunicação', dueTime: '14:50', done: false },
  ],
  announcements: [
    { id: 'a1', title: 'Horário alterado', message: 'A partida 2º A × 1º C começa às 14:20 na Quadra A.', priority: 'important', createdAt: new Date().toISOString() },
    { id: 'a2', title: 'Acesso ao ginásio', message: 'Atletas devem apresentar a credencial na entrada lateral.', priority: 'normal', createdAt: new Date(Date.now() - 3600000).toISOString() },
  ],
  incidents: [],
}

export function loadDemoData(): AppData {
  const stored = localStorage.getItem('arena-demo-data')
  if (!stored) return structuredClone(demoData)
  try {
    const parsed = JSON.parse(stored) as Partial<AppData>
    return {
      ...structuredClone(demoData),
      ...parsed,
      bracket: parsed.bracket ?? structuredClone(demoData.bracket),
      tasks: parsed.tasks ?? structuredClone(demoData.tasks),
      announcements: parsed.announcements ?? structuredClone(demoData.announcements),
      incidents: parsed.incidents ?? structuredClone(demoData.incidents),
    }
  } catch { return structuredClone(demoData) }
}

export function saveDemoData(data: AppData) {
  localStorage.setItem('arena-demo-data', JSON.stringify(data))
}
