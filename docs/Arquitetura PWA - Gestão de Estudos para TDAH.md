# Arquitetura PWA - Gestão de Estudos para TDAH

## Visão Geral
Aplicativo PWA focado em produtividade para estudantes com TDAH, preparando para provas do TJ-CE em 31 dias (28/09/2025).

## Tecnologias Principais
- **Frontend**: React 18 com TypeScript
- **Styling**: Tailwind CSS
- **PWA**: Service Worker + Manifest dinâmico
- **Estado**: Context API + localStorage
- **Ícones**: Lucide React
- **Build**: Vite

## Estrutura de Componentes

### 1. Layout Principal
```
App
├── Header (navegação, tema, instalação)
├── Sidebar (disciplinas, filtros)
├── MainContent (dashboard, sessões)
└── Footer (status, progresso)
```

### 2. Componentes Core
- **Dashboard**: Visão geral, próximas sessões, progresso
- **SessionManager**: Criação e gerenciamento de sessões de estudo
- **Timer**: Pomodoro/Flowtime com controles
- **TaskCapture**: Sistema de captura de distrações
- **ProgressTracker**: Visualização de progresso por disciplina
- **SubjectSelector**: Seleção de disciplinas e temas

### 3. Componentes de Produtividade
- **TimeboxingPanel**: Estimativas e controle de tempo
- **ProcrastinationHelper**: Técnicas TCC integradas
- **ZeigarnikActivator**: Início estratégico de tarefas
- **GTDWorkflow**: Capturar, esclarecer, organizar
- **DistractionCapture**: Notas rápidas para pensamentos intrusivos

## Funcionalidades Principais

### 1. Sistema de Timeboxing
- Estimativas de tempo realistas por tarefa
- Cronômetro visual com progresso
- Ajustes flexíveis sem julgamento
- Histórico de tempos para melhoria

### 2. Hierarquia Visual de Tarefas
- Códigos de cores por disciplina
- Barras de progresso em tempo real
- Priorização visual clara
- Interface sem menus ocultos

### 3. Gestão de Sessões
- Sessões administráveis e com tempo limitado
- Integração com disciplinas do JSON
- Notas retráteis por sessão
- Controle de foco e distrações

### 4. Recursos Anti-TDAH
- **Efeito Zeigarnik**: Início de 2 minutos para ativação
- **Timeboxing**: Combate à cegueira temporal
- **Captura de Distrações**: Anotações rápidas sem perder foco
- **Listas Agora vs Depois**: Redução da fadiga de decisão
- **Estimativas Flexíveis**: Ajustes sem vergonha

### 5. Opções de Trabalho
- **Pomodoro Estruturado**: 25min trabalho + 5min pausa
- **Flowtime Flexível**: Sessões baseadas no estado de flow
- **Timeboxing Personalizado**: Blocos de tempo customizáveis

## Design System

### Paleta de Cores
```css
/* Cores Principais */
--primary-green: #059669 (emerald-600) /* Progresso/Concluído */
--primary-blue: #2563eb (blue-600)    /* Interações principais */
--accent-teal: #0ea5a4 (teal-600)     /* Destaques */

/* Disciplinas (do JSON) */
--civil: #059669
--processual-civil: #1e40af
--consumidor: #065f46
--crianca-adolescente: #0ea5a4
--penal: #dc2626
--processual-penal: #991b1b
--constitucional: #0f172a
--eleitoral: #9333ea
--empresarial: #d97706
--tributario: #065f9c
--ambiental: #059669
--administrativo: #2563eb
--humanistica: #0ea5a4

/* Tema Claro/Escuro */
--bg-light: #ffffff
--bg-dark: #0f172a
--text-light: #1f2937
--text-dark: #f9fafb
```

### Componentes UI
- Cards com sombras suaves
- Botões com estados hover/active
- Transições suaves (transition-all duration-200)
- Bordas arredondadas (rounded-lg)
- Espaçamento consistente (sistema 4px)

## Estrutura de Dados

### 1. Disciplinas (do JSON)
```typescript
interface Disciplina {
  id: string;
  nome: string;
  slug: string;
  color: string;
  priority_default: 'alta' | 'média' | 'baixa';
  icon: string;
  themes: Theme[];
  captureHints: string[];
}

interface Theme {
  id: string;
  nome: string;
  default_estimate_minutes: number;
  subtemas: string[];
}
```

### 2. Sessões de Estudo
```typescript
interface StudySession {
  id: string;
  disciplinaId: string;
  themeId: string;
  subtema?: string;
  estimatedTime: number;
  actualTime?: number;
  status: 'planned' | 'active' | 'paused' | 'completed';
  notes: string;
  distractions: Distraction[];
  createdAt: Date;
  completedAt?: Date;
}

interface Distraction {
  id: string;
  text: string;
  timestamp: Date;
  resolved: boolean;
}
```

### 3. Configurações do Usuário
```typescript
interface UserSettings {
  theme: 'light' | 'dark' | 'system';
  defaultTimerType: 'pomodoro' | 'flowtime' | 'custom';
  pomodoroSettings: {
    workTime: number;
    shortBreak: number;
    longBreak: number;
    longBreakInterval: number;
  };
  notifications: boolean;
  soundEnabled: boolean;
  autoStartBreaks: boolean;
}
```

## Recursos PWA

### 1. Manifest.json (Dinâmico)
```javascript
const manifest = {
  name: "Gestão de Estudos - TJ-CE",
  short_name: "Gestão Estudos",
  description: "PWA de produtividade para estudantes com TDAH",
  start_url: "/",
  display: "standalone",
  background_color: "#ffffff",
  theme_color: "#059669",
  icons: [
    {
      src: "https://placehold.co/192x192/059669/ffffff?text=GE",
      sizes: "192x192",
      type: "image/png"
    },
    {
      src: "https://placehold.co/512x512/059669/ffffff?text=GE",
      sizes: "512x512",
      type: "image/png"
    }
  ]
};
```

### 2. Service Worker
- **Estratégia**: Cache First para assets estáticos
- **Cache**: HTML, CSS, JS, imagens, dados JSON
- **Offline**: Funcionalidade completa sem internet
- **Sync**: Sincronização quando voltar online

### 3. Instalação
- Detecção do evento `beforeinstallprompt`
- Botão manual de instalação no header
- Instruções claras para Android/iOS
- Ícone na tela inicial após instalação

## Fluxo de Uso Principal

### 1. Início Rápido (Efeito Zeigarnik)
1. Usuário seleciona disciplina
2. Escolhe tema/subtema
3. Define estimativa inicial (ou usa padrão)
4. Inicia sessão de 2 minutos para ativação
5. Continua ou agenda para depois

### 2. Sessão de Estudo Completa
1. Seleção de disciplina e tema
2. Configuração de tempo (Pomodoro/Flowtime)
3. Início do cronômetro
4. Captura de distrações durante estudo
5. Pausas programadas
6. Finalização com notas e progresso

### 3. Gestão de Distrações
1. Pensamento intrusivo surge
2. Clique rápido em "Capturar Distração"
3. Anotação em 10-15 segundos
4. Retorno imediato ao foco
5. Revisão das distrações pós-sessão

## Responsividade

### Mobile First (320px+)
- Layout em coluna única
- Botões grandes para toque
- Navegação por tabs na parte inferior
- Cronômetro em destaque

### Tablet (768px+)
- Layout em duas colunas
- Sidebar com disciplinas
- Área principal para sessões
- Painel lateral para notas

### Desktop (1024px+)
- Layout em três colunas
- Sidebar + Main + Panel
- Atalhos de teclado
- Múltiplas sessões simultâneas

## Acessibilidade
- Contraste adequado (WCAG AA)
- Navegação por teclado
- Screen reader friendly
- Indicadores visuais claros
- Texto alternativo em imagens

## Performance
- Lazy loading de componentes
- Otimização de imagens
- Minificação de assets
- Cache agressivo
- Bundle splitting

## Próximos Passos
1. Criar projeto React com template
2. Configurar Tailwind e dependências
3. Implementar componentes base
4. Integrar dados das disciplinas
5. Desenvolver funcionalidades core
6. Configurar PWA
7. Testes e otimizações

