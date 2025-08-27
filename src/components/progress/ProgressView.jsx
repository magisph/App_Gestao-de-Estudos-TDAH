import React, { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart3, 
  Clock, 
  Target, 
  TrendingUp,
  Calendar,
  Award,
  Zap,
  BookOpen,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { useApp } from '../contexts/AppContext';

export function ProgressView() {
  const { state } = useApp();
  
  // Calcular estatísticas detalhadas
  const stats = useMemo(() => {
    const sessions = state.sessions;
    const totalSessions = sessions.length;
    const totalTime = sessions.reduce((acc, s) => acc + (s.actualTime || 0), 0);
    
    // Estatísticas por dia
    const sessionsByDay = sessions.reduce((acc, session) => {
      const date = new Date(session.createdAt).toDateString();
      if (!acc[date]) acc[date] = [];
      acc[date].push(session);
      return acc;
    }, {});
    
    const daysStudied = Object.keys(sessionsByDay).length;
    const avgSessionsPerDay = daysStudied > 0 ? totalSessions / daysStudied : 0;
    const avgTimePerDay = daysStudied > 0 ? totalTime / daysStudied : 0;
    
    // Estatísticas por disciplina
    const disciplinaStats = state.disciplinas.map(disciplina => {
      const disciplinaSessions = sessions.filter(s => s.disciplinaId === disciplina.id);
      const totalTime = disciplinaSessions.reduce((acc, s) => acc + (s.actualTime || 0), 0);
      const studiedThemes = new Set(disciplinaSessions.map(s => s.themeId));
      const progress = disciplina.themes.length > 0 ? (studiedThemes.size / disciplina.themes.length) * 100 : 0;
      
      return {
        ...disciplina,
        sessionsCount: disciplinaSessions.length,
        totalTime,
        studiedThemes: studiedThemes.size,
        totalThemes: disciplina.themes.length,
        progress,
        avgSessionTime: disciplinaSessions.length > 0 ? totalTime / disciplinaSessions.length : 0
      };
    }).sort((a, b) => b.totalTime - a.totalTime);
    
    // Sessões por semana (últimas 4 semanas)
    const weeklyData = [];
    for (let i = 3; i >= 0; i--) {
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - (i * 7) - weekStart.getDay());
      weekStart.setHours(0, 0, 0, 0);
      
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);
      weekEnd.setHours(23, 59, 59, 999);
      
      const weekSessions = sessions.filter(s => {
        const sessionDate = new Date(s.createdAt);
        return sessionDate >= weekStart && sessionDate <= weekEnd;
      });
      
      weeklyData.push({
        week: `Sem ${4 - i}`,
        sessions: weekSessions.length,
        time: weekSessions.reduce((acc, s) => acc + (s.actualTime || 0), 0)
      });
    }
    
    // Metas e conquistas
    const achievements = [];
    if (totalSessions >= 1) achievements.push({ name: 'Primeira Sessão', icon: '🎯' });
    if (totalSessions >= 10) achievements.push({ name: '10 Sessões', icon: '🔥' });
    if (totalSessions >= 50) achievements.push({ name: '50 Sessões', icon: '⭐' });
    if (totalTime >= 60) achievements.push({ name: '1 Hora de Estudo', icon: '⏰' });
    if (totalTime >= 600) achievements.push({ name: '10 Horas de Estudo', icon: '🏆' });
    if (daysStudied >= 7) achievements.push({ name: '7 Dias Estudando', icon: '📅' });
    
    return {
      totalSessions,
      totalTime,
      daysStudied,
      avgSessionsPerDay,
      avgTimePerDay,
      disciplinaStats,
      weeklyData,
      achievements
    };
  }, [state.sessions, state.disciplinas]);
  
  // Calcular dias restantes
  const examDate = new Date('2025-09-28');
  const today = new Date();
  const daysRemaining = Math.ceil((examDate - today) / (1000 * 60 * 60 * 24));
  const totalDays = 31;
  const daysPassed = totalDays - daysRemaining;
  
  // Formatação de tempo
  const formatTime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}min` : `${mins}min`;
  };
  
  return (
    <div className="space-y-6">
      {/* Header com Meta Geral */}
      <Card className="bg-gradient-to-r from-blue-50 to-emerald-50 dark:from-blue-950 dark:to-emerald-950">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-6 w-6 text-blue-600" />
            Meta: Aprovação TJ-CE
          </CardTitle>
          <CardDescription>
            Acompanhe seu progresso rumo à aprovação
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{daysRemaining}</div>
              <div className="text-sm text-muted-foreground">Dias restantes</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-emerald-600">{stats.totalSessions}</div>
              <div className="text-sm text-muted-foreground">Sessões realizadas</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{Math.round(stats.totalTime / 60)}h</div>
              <div className="text-sm text-muted-foreground">Tempo total</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{stats.daysStudied}</div>
              <div className="text-sm text-muted-foreground">Dias estudados</div>
            </div>
          </div>
          
          <div className="mt-4">
            <div className="flex justify-between text-sm mb-2">
              <span>Progresso do cronograma</span>
              <span>{Math.round((daysPassed / totalDays) * 100)}%</span>
            </div>
            <Progress value={(daysPassed / totalDays) * 100} className="h-3" />
          </div>
        </CardContent>
      </Card>
      
      {/* Estatísticas Semanais */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-purple-600" />
            Progresso Semanal
          </CardTitle>
          <CardDescription>
            Últimas 4 semanas de estudo
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stats.weeklyData.map((week, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>{week.week}</span>
                  <span>{week.sessions} sessões • {formatTime(week.time)}</span>
                </div>
                <Progress 
                  value={week.sessions > 0 ? Math.min(100, (week.sessions / 10) * 100) : 0} 
                  className="h-2" 
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      
      {/* Progresso por Disciplina */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-emerald-600" />
            Progresso por Disciplina
          </CardTitle>
          <CardDescription>
            Detalhamento do estudo por matéria
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stats.disciplinaStats.map((disciplina) => (
              <div key={disciplina.id} className="space-y-3 p-4 border border-border rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-4 h-4 rounded"
                      style={{ backgroundColor: disciplina.color }}
                    />
                    <div>
                      <h3 className="font-medium">{disciplina.nome}</h3>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{disciplina.sessionsCount} sessões</span>
                        <span>{formatTime(disciplina.totalTime)}</span>
                        <span>{disciplina.studiedThemes}/{disciplina.totalThemes} temas</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <Badge 
                      variant={disciplina.progress >= 80 ? 'default' : disciplina.progress >= 50 ? 'secondary' : 'destructive'}
                    >
                      {Math.round(disciplina.progress)}%
                    </Badge>
                  </div>
                </div>
                
                <Progress value={disciplina.progress} className="h-2" />
                
                {disciplina.sessionsCount > 0 && (
                  <div className="text-xs text-muted-foreground">
                    Média por sessão: {formatTime(disciplina.avgSessionTime)}
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      
      {/* Conquistas */}
      {stats.achievements.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-yellow-600" />
              Conquistas Desbloqueadas
            </CardTitle>
            <CardDescription>
              Marcos alcançados na sua jornada de estudos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {stats.achievements.map((achievement, index) => (
                <div 
                  key={index}
                  className="flex items-center gap-2 p-3 bg-accent rounded-lg"
                >
                  <span className="text-2xl">{achievement.icon}</span>
                  <span className="font-medium text-sm">{achievement.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Insights e Recomendações */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-orange-600" />
            Insights e Recomendações
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {stats.avgTimePerDay < 60 && (
              <div className="flex items-start gap-3 p-3 bg-orange-50 dark:bg-orange-950 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-sm">Aumente o tempo diário</h4>
                  <p className="text-sm text-muted-foreground">
                    Você está estudando {formatTime(stats.avgTimePerDay)} por dia. 
                    Tente aumentar para pelo menos 2-3 horas diárias.
                  </p>
                </div>
              </div>
            )}
            
            {stats.disciplinaStats.filter(d => d.progress < 20).length > 5 && (
              <div className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                <Target className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-sm">Foque nas disciplinas prioritárias</h4>
                  <p className="text-sm text-muted-foreground">
                    Você tem muitas disciplinas com pouco progresso. 
                    Concentre-se nas de prioridade alta primeiro.
                  </p>
                </div>
              </div>
            )}
            
            {stats.totalSessions > 0 && stats.avgSessionsPerDay >= 2 && (
              <div className="flex items-start gap-3 p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-sm">Excelente consistência!</h4>
                  <p className="text-sm text-muted-foreground">
                    Você está mantendo uma boa frequência de estudos. 
                    Continue assim para maximizar a retenção.
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

