import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight,
  Clock,
  Target,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Plus
} from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { 
  getCurrentDate, 
  getDaysRemaining, 
  getScheduleProgress,
  formatDate,
  isToday,
  generateWeeklySchedule,
  getDailyStudyGoal,
  getCalendarInsights
} from '../utils/dateUtils';

export function Calendar() {
  const { state, dispatch, actions } = useApp();
  const [currentMonth, setCurrentMonth] = useState(getCurrentDate());
  const [selectedDate, setSelectedDate] = useState(null);
  
  // Calcular dados do calendário
  const calendarData = useMemo(() => {
    const today = getCurrentDate();
    const daysRemaining = getDaysRemaining();
    const scheduleProgress = getScheduleProgress();
    const dailyGoal = getDailyStudyGoal();
    const weeklySchedule = generateWeeklySchedule();
    const insights = getCalendarInsights(state.sessions);
    
    return {
      today,
      daysRemaining,
      scheduleProgress,
      dailyGoal,
      weeklySchedule,
      insights
    };
  }, [state.sessions]);
  
  // Gerar dias do mês atual
  const generateCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay()); // Começar no domingo
    
    const days = [];
    const current = new Date(startDate);
    
    // Gerar 42 dias (6 semanas)
    for (let i = 0; i < 42; i++) {
      const dayData = {
        date: new Date(current),
        isCurrentMonth: current.getMonth() === month,
        isToday: isToday(current),
        sessions: state.sessions.filter(s => isToday(s.createdAt, current)),
        dayNumber: current.getDate()
      };
      
      days.push(dayData);
      current.setDate(current.getDate() + 1);
    }
    
    return days;
  };
  
  const calendarDays = generateCalendarDays();
  
  // Navegação do calendário
  const navigateMonth = (direction) => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(newMonth.getMonth() + direction);
    setCurrentMonth(newMonth);
  };
  
  // Calcular total de tempo por dia
  const getDayTotalTime = (sessions) => {
    return sessions.reduce((total, session) => total + (session.actualTime || 0), 0);
  };
  
  // Verificar se atingiu meta do dia
  const hasMetDailyGoal = (sessions) => {
    const totalTime = getDayTotalTime(sessions);
    return totalTime >= calendarData.dailyGoal;
  };
  
  return (
    <div className="space-y-6">
      {/* Header com informações gerais */}
      <Card className="bg-gradient-to-r from-blue-50 to-emerald-50 dark:from-blue-950 dark:to-emerald-950">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="h-6 w-6 text-blue-600" />
            Cronograma de Estudos
          </CardTitle>
          <CardDescription>
            {formatDate(calendarData.today, 'long')} • {calendarData.daysRemaining} dias para a prova
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{calendarData.daysRemaining}</div>
              <div className="text-sm text-muted-foreground">Dias restantes</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-emerald-600">{Math.round(calendarData.dailyGoal / 60)}h</div>
              <div className="text-sm text-muted-foreground">Meta diária</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{calendarData.scheduleProgress}%</div>
              <div className="text-sm text-muted-foreground">Cronograma</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {state.sessions.filter(s => isToday(s.createdAt)).length}
              </div>
              <div className="text-sm text-muted-foreground">Sessões hoje</div>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progresso do cronograma</span>
              <span>{calendarData.scheduleProgress}%</span>
            </div>
            <Progress value={calendarData.scheduleProgress} className="h-3" />
          </div>
        </CardContent>
      </Card>
      
      {/* Insights do calendário */}
      {calendarData.insights.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-orange-600" />
              Insights do Cronograma
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {calendarData.insights.map((insight, index) => (
                <div 
                  key={index}
                  className={`
                    flex items-start gap-3 p-3 rounded-lg
                    ${insight.type === 'urgent' ? 'bg-red-50 dark:bg-red-950' : ''}
                    ${insight.type === 'warning' ? 'bg-yellow-50 dark:bg-yellow-950' : ''}
                    ${insight.type === 'info' ? 'bg-blue-50 dark:bg-blue-950' : ''}
                    ${insight.type === 'reminder' ? 'bg-purple-50 dark:bg-purple-950' : ''}
                  `}
                >
                  {insight.type === 'urgent' && <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />}
                  {insight.type === 'warning' && <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />}
                  {insight.type === 'info' && <Target className="h-5 w-5 text-blue-600 mt-0.5" />}
                  {insight.type === 'reminder' && <Clock className="h-5 w-5 text-purple-600 mt-0.5" />}
                  
                  <div>
                    <h4 className="font-medium text-sm">{insight.title}</h4>
                    <p className="text-sm text-muted-foreground">{insight.message}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Cronograma semanal */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-emerald-600" />
            Próximas Semanas
          </CardTitle>
          <CardDescription>
            Planejamento semanal até a prova
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {calendarData.weeklySchedule.slice(0, 4).map((week) => {
              const weekSessions = state.sessions.filter(session => {
                const sessionDate = new Date(session.createdAt);
                return sessionDate >= week.startDate && sessionDate <= week.endDate;
              });
              
              const weekTotalTime = weekSessions.reduce((acc, s) => acc + (s.actualTime || 0), 0);
              const weekGoal = calendarData.dailyGoal * 7; // Meta semanal
              const weekProgress = weekGoal > 0 ? (weekTotalTime / weekGoal) * 100 : 0;
              
              return (
                <div key={week.weekNumber} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Badge variant={week.isCurrentWeek ? 'default' : 'secondary'}>
                        Semana {week.weekNumber}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {formatDate(week.startDate, 'short')} - {formatDate(week.endDate, 'short')}
                      </span>
                    </div>
                    
                    <div className="text-right text-sm">
                      <div className="font-medium">
                        {Math.round(weekTotalTime / 60)}h {weekTotalTime % 60}min
                      </div>
                      <div className="text-muted-foreground">
                        {weekSessions.length} sessões
                      </div>
                    </div>
                  </div>
                  
                  <Progress value={Math.min(100, weekProgress)} className="h-2" />
                  
                  <div className="text-xs text-muted-foreground">
                    Meta: {Math.round(weekGoal / 60)}h • 
                    Progresso: {Math.round(weekProgress)}%
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
      
      {/* Calendário mensal */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5 text-blue-600" />
              {formatDate(currentMonth, 'long').split(' ').slice(1).join(' ')}
            </div>
            
            <div className="flex gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateMonth(-1)}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateMonth(1)}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Cabeçalho dos dias da semana */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
              <div key={day} className="text-center text-sm font-medium text-muted-foreground p-2">
                {day}
              </div>
            ))}
          </div>
          
          {/* Dias do calendário */}
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((day, index) => {
              const totalTime = getDayTotalTime(day.sessions);
              const metGoal = hasMetDailyGoal(day.sessions);
              
              return (
                <div
                  key={index}
                  className={`
                    relative p-2 min-h-[60px] border border-border rounded cursor-pointer
                    transition-colors hover:bg-accent
                    ${!day.isCurrentMonth ? 'opacity-50' : ''}
                    ${day.isToday ? 'bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800' : ''}
                    ${selectedDate?.getTime() === day.date.getTime() ? 'ring-2 ring-blue-500' : ''}
                  `}
                  onClick={() => setSelectedDate(day.date)}
                >
                  <div className="text-sm font-medium">{day.dayNumber}</div>
                  
                  {day.sessions.length > 0 && (
                    <div className="mt-1 space-y-1">
                      <div className="flex items-center gap-1">
                        {metGoal ? (
                          <CheckCircle2 className="h-3 w-3 text-green-600" />
                        ) : (
                          <Clock className="h-3 w-3 text-orange-600" />
                        )}
                        <span className="text-xs">
                          {Math.round(totalTime / 60)}h{totalTime % 60 > 0 ? ` ${totalTime % 60}m` : ''}
                        </span>
                      </div>
                      
                      <div className="text-xs text-muted-foreground">
                        {day.sessions.length} sessão{day.sessions.length > 1 ? 'ões' : ''}
                      </div>
                    </div>
                  )}
                  
                  {day.isToday && (
                    <div className="absolute top-1 right-1">
                      <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
      
      {/* Detalhes do dia selecionado */}
      {selectedDate && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5 text-purple-600" />
              {formatDate(selectedDate, 'long')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {(() => {
              const dayData = calendarDays.find(d => d.date.getTime() === selectedDate.getTime());
              const dayTotalTime = getDayTotalTime(dayData?.sessions || []);
              
              return (
                <div className="space-y-4">
                  {dayData?.sessions.length > 0 ? (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">Sessões realizadas</span>
                        <Badge variant={hasMetDailyGoal(dayData.sessions) ? 'default' : 'secondary'}>
                          {Math.round(dayTotalTime / 60)}h {dayTotalTime % 60}min
                        </Badge>
                      </div>
                      
                      {dayData.sessions.map((session, index) => {
                        const disciplina = state.disciplinas.find(d => d.id === session.disciplinaId);
                        const theme = disciplina?.themes.find(t => t.id === session.themeId);
                        
                        return (
                          <div key={index} className="flex items-center gap-3 p-3 bg-accent rounded-lg">
                            <div 
                              className="w-4 h-4 rounded"
                              style={{ backgroundColor: disciplina?.color }}
                            />
                            <div className="flex-1">
                              <div className="font-medium text-sm">{disciplina?.nome}</div>
                              <div className="text-sm text-muted-foreground">{theme?.nome}</div>
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {session.actualTime || 0}min
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-6 text-muted-foreground">
                      <CalendarIcon className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p>Nenhuma sessão realizada neste dia</p>
                      {isToday(selectedDate) && (
                        <Button
                          className="mt-3 gap-2"
                          onClick={() => dispatch({ type: actions.SET_CURRENT_VIEW, payload: 'session' })}
                        >
                          <Plus className="h-4 w-4" />
                          Iniciar Sessão Hoje
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              );
            })()}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

