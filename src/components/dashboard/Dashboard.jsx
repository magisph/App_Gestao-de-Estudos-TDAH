import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Play, 
  Clock, 
  Target, 
  TrendingUp, 
  Calendar,
  BookOpen,
  Timer,
  Zap,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { 
  getDaysRemaining, 
  getScheduleProgress, 
  isToday,
  formatDate,
  getCurrentDate
} from '@/utils/dateUtils';

export function Dashboard() {
  const { state, dispatch, actions } = useApp();
  
  // Calcular estatísticas
  const totalSessions = state.sessions.length;
  const totalStudyTime = state.sessions.reduce((acc, session) => acc + (session.actualTime || 0), 0);
  const todaySessions = state.sessions.filter(session => isToday(session.createdAt)).length;
  
  // Calcular progresso por disciplina
  const disciplinaProgress = state.disciplinas.map(disciplina => {
    const disciplinaSessions = state.sessions.filter(s => s.disciplinaId === disciplina.id);
    const totalTime = disciplinaSessions.reduce((acc, s) => acc + (s.actualTime || 0), 0);
    const totalThemes = disciplina.themes.length;
    const studiedThemes = new Set(disciplinaSessions.map(s => s.themeId)).size;
    
    return {
      ...disciplina,
      totalTime,
      studiedThemes,
      totalThemes,
      progress: totalThemes > 0 ? (studiedThemes / totalThemes) * 100 : 0,
      sessionsCount: disciplinaSessions.length
    };
  }).sort((a, b) => b.totalTime - a.totalTime);
  
  // Próximas sessões sugeridas (baseado em prioridade e tempo não estudado)
  const suggestedSessions = state.disciplinas
    .filter(d => d.priority_default === 'alta')
    .flatMap(disciplina => 
      disciplina.themes.map(theme => ({
        disciplina,
        theme,
        lastStudied: state.sessions
          .filter(s => s.disciplinaId === disciplina.id && s.themeId === theme.id)
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0]
      }))
    )
    .sort((a, b) => {
      // Priorizar temas nunca estudados
      if (!a.lastStudied && b.lastStudied) return -1;
      if (a.lastStudied && !b.lastStudied) return 1;
      if (!a.lastStudied && !b.lastStudied) return 0;
      
      // Depois por tempo desde último estudo
      return new Date(a.lastStudied.createdAt) - new Date(b.lastStudied.createdAt);
    })
    .slice(0, 4);
  
  const startQuickSession = (disciplina, theme) => {
    dispatch({
      type: actions.START_SESSION,
      payload: {
        disciplinaId: disciplina.id,
        themeId: theme.id,
        estimatedTime: theme.default_estimate_minutes,
        subtema: null
      }
    });
  };
  
  const startZeigarnikSession = (disciplina, theme) => {
    // Sessão de 2 minutos para ativar o Efeito Zeigarnik
    dispatch({
      type: actions.START_SESSION,
      payload: {
        disciplinaId: disciplina.id,
        themeId: theme.id,
        estimatedTime: 2,
        subtema: 'Início Zeigarnik (2min)'
      }
    });
  };
  
  // Usar as novas funções de data
  const daysRemaining = getDaysRemaining();
  const scheduleProgress = getScheduleProgress();
  const today = getCurrentDate();
  
  return (
    <div className="space-y-6">
      {/* Header com contagem regressiva */}
      <div className="text-center py-6 bg-gradient-to-r from-emerald-50 to-blue-50 dark:from-emerald-950 dark:to-blue-950 rounded-lg">
        <h1 className="text-3xl font-bold mb-2">Faltam {daysRemaining} dias</h1>
        <p className="text-muted-foreground mb-2">
          Provas TJ-CE • Discursiva, Sentença Cível e Criminal
        </p>
        <p className="text-sm text-muted-foreground mb-4">
          {formatDate(today, 'long')} → Sábado, 28 de setembro de 2025
        </p>
        <div className="mt-4">
          <Progress value={scheduleProgress} className="w-64 mx-auto" />
          <p className="text-sm text-muted-foreground mt-2">
            {scheduleProgress}% do cronograma decorrido
          </p>
        </div>
      </div>
      
      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sessões Hoje</CardTitle>
            <Timer className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todaySessions}</div>
            <p className="text-xs text-muted-foreground">
              {totalSessions} total
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tempo Total</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(totalStudyTime / 60)}h</div>
            <p className="text-xs text-muted-foreground">
              {totalStudyTime % 60}min extras
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Disciplinas</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{state.disciplinas.length}</div>
            <p className="text-xs text-muted-foreground">
              {disciplinaProgress.filter(d => d.sessionsCount > 0).length} estudadas
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Média Diária</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalSessions > 0 ? Math.round(totalStudyTime / Math.max(1, totalSessions / 7)) : 0}min
            </div>
            <p className="text-xs text-muted-foreground">
              por sessão
            </p>
          </CardContent>
        </Card>
      </div>
      
      {/* Botão para ver calendário */}
      <Card className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold mb-1">Cronograma Detalhado</h3>
              <p className="text-sm text-muted-foreground">
                Visualize seu progresso no calendário e planeje suas próximas sessões
              </p>
            </div>
            <Button
              onClick={() => dispatch({ type: actions.SET_CURRENT_VIEW, payload: 'calendar' })}
              className="gap-2"
            >
              <Calendar className="h-4 w-4" />
              Ver Calendário
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {/* Sessões Sugeridas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-emerald-600" />
            Sessões Sugeridas (Prioridade Alta)
          </CardTitle>
          <CardDescription>
            Baseado em prioridade e tempo desde último estudo
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {suggestedSessions.map(({ disciplina, theme, lastStudied }) => (
              <div 
                key={`${disciplina.id}-${theme.id}`}
                className="border border-border rounded-lg p-4 space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-4 h-4 rounded"
                        style={{ backgroundColor: disciplina.color }}
                      />
                      <h3 className="font-medium text-sm">{disciplina.nome}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">{theme.nome}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {theme.default_estimate_minutes}min estimado
                    </div>
                  </div>
                  
                  <div className="text-right">
                    {!lastStudied ? (
                      <Badge variant="destructive" className="text-xs">
                        Nunca estudado
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="text-xs">
                        {Math.ceil((getCurrentDate() - new Date(lastStudied.createdAt)) / (1000 * 60 * 60 * 24))}d atrás
                      </Badge>
                    )}
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => startZeigarnikSession(disciplina, theme)}
                    className="flex-1 gap-2"
                    variant="outline"
                  >
                    <Zap className="h-3 w-3" />
                    Início 2min
                  </Button>
                  
                  <Button
                    size="sm"
                    onClick={() => startQuickSession(disciplina, theme)}
                    className="flex-1 gap-2"
                  >
                    <Play className="h-3 w-3" />
                    Sessão Completa
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      
      {/* Progresso por Disciplina */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-blue-600" />
            Progresso por Disciplina
          </CardTitle>
          <CardDescription>
            Baseado em temas estudados e tempo investido
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {disciplinaProgress.slice(0, 6).map((disciplina) => (
              <div key={disciplina.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-4 h-4 rounded"
                      style={{ backgroundColor: disciplina.color }}
                    />
                    <span className="font-medium text-sm">{disciplina.nome}</span>
                    <Badge 
                      variant="secondary" 
                      className="text-xs"
                    >
                      {disciplina.studiedThemes}/{disciplina.totalThemes} temas
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {Math.round(disciplina.totalTime / 60)}h {disciplina.totalTime % 60}min
                  </div>
                </div>
                
                <Progress value={disciplina.progress} className="h-2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      
      {/* Sessão Ativa */}
      {state.currentSession && (
        <Card className="border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300">
              <CheckCircle2 className="h-5 w-5" />
              Sessão Ativa
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">
                  {state.disciplinas.find(d => d.id === state.currentSession.disciplinaId)?.nome}
                </p>
                <p className="text-sm text-muted-foreground">
                  {state.disciplinas
                    .find(d => d.id === state.currentSession.disciplinaId)?.themes
                    .find(t => t.id === state.currentSession.themeId)?.nome}
                </p>
              </div>
              
              <Button
                onClick={() => dispatch({ type: actions.SET_CURRENT_VIEW, payload: 'session' })}
                className="gap-2"
              >
                <Timer className="h-4 w-4" />
                Ver Sessão
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

