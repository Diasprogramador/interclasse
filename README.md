# Arena Escolar

Sistema web instalável (PWA) para gerenciamento de interclasse: salas, times, convites por nickname, elenco com limite de 12 atletas, classificação, artilharia, assistências, jogos e preferências do usuário.

## Funcionalidades

- Cadastro e login por e-mail com Supabase Auth
- Perfil único com nickname
- Criação de sala ou entrada por código
- Criação e edição do time da sala
- Convites por nickname, com aceite ou recusa
- Limite de 12 jogadores aplicado no banco de dados
- Classificação calculada a partir dos resultados
- Rankings de gols e assistências
- Agenda e placares
- Tema claro, escuro ou automático
- Preferência de notificações
- Instalação como aplicativo PWA e cache da interface
- Modo demonstração local quando o Supabase ainda não está configurado
- Row Level Security para isolamento entre salas

## Tecnologias

- React 19 + TypeScript + Vite
- Supabase Auth + PostgreSQL + Row Level Security
- React Router
- Vite PWA / Workbox
- Zod
- Lucide Icons

## Executar localmente

```bash
npm install
cp .env.example .env.local
npm run dev
```

No Windows PowerShell:

```powershell
Copy-Item .env.example .env.local
npm run dev
```

Sem as variáveis do Supabase, o projeto inicia automaticamente no modo demonstração. Use qualquer e-mail válido e uma senha com seis ou mais caracteres.

## Configurar o Supabase

1. Crie um projeto em [supabase.com](https://supabase.com/).
2. Abra **SQL Editor** e execute `supabase/migrations/202610270001_initial_schema.sql`.
3. Em **Project Settings → API**, copie a URL e a chave `anon`.
4. Crie `.env.local`:

```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anonima
```

Nunca coloque a `service_role` no frontend ou no GitHub.

## Regras de acesso

- Um usuário pertence a apenas uma sala e um time.
- Somente o capitão edita o time, convida e remove atletas.
- Somente representantes gerenciam partidas e estatísticas.
- Membros visualizam apenas dados da própria sala.
- O limite de 12 jogadores é validado por trigger no PostgreSQL.

## Build de produção

```bash
npm run typecheck
npm run build
npm run preview
```

O build gera o manifest e o service worker em `dist/`.

## Estrutura principal

```text
src/
  components/       layout e elementos compartilhados
  contexts/         autenticação e estado/dados do sistema
  data/             dados persistentes do modo demonstração
  lib/              cliente Supabase
  pages/            telas do produto
supabase/
  migrations/       schema, funções, views e políticas RLS
public/              ícones e assets do PWA
```

## Colaboração

Use branches curtas e commits convencionais:

```text
feat(team): add player position editing
fix(auth): handle expired session
```

Não versione `.env`, chaves, tokens ou credenciais.
