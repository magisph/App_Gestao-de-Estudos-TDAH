import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Play, 
  Pause, 
  Square, 
  RotateCcw,
  Clock,
  Target,
  Zap,
  MessageSquare,
  CheckCircle2,
  AlertCircle,
  Settings,
  Plus,
  Minus
} from 'lucide-react';
import { useApp } from '../contexts/AppContext';

export function SessionManager() {
  const { state, dispatch, actions } = useApp();
  const [sessionNotes, setSessionNotes] = useState('');
  const [distractionText, setDistractionText] = useState('');
  const [showDistractionInput, setShowDistractionInput] = useState(false);
  const [customTime, setCustomTime] = useState(25);
  const [timerMode, setTimerMode] = useState('pomodoro'); // 'pomodoro', 'flowtime', 'custom'
  
  const currentSession = state.currentSession;
  const timer = state.timer;
  
  // Atualizar notas da sessão
  useEffect(() => {
    if (currentSession && sessionNotes !== currentSession.notes) {
      dispatch({
        type: actions.UPDATE_SESSION_NOTES,
        payload: sessionNotes
      });
    }
  }, [sessionNotes, currentSession, dispatch, actions]);
  
  // Formatação de tempo
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Calcular progresso do timer
  const progress = timer.totalTime > 0 ? ((timer.totalTime - timer.timeLeft) / timer.totalTime) * 100 : 0;
  
  // Controles do timer
  const startTimer = () => {
    if (!timer.isActive) {
      let duration;
      switch (timerMode) {
        case 'pomodoro':
          duration = state.settings.pomodoroSettings.workTime;
          break;
        case 'flowtime':
          duration = 60; // Flowtime começa com 60min mas pode ser estendido
          break;
        case 'custom':
          duration = customTime;
          break;
        default:
          duration = 25;
      }
      
      dispatch({
        type: actions.START_TIMER,
        payload: { duration, type: 'work' }
      });
    } else {
      dispatch({ type: actions.RESUME_TIMER });
    }
  };
  
  const pauseTimer = () => {
    dispatch({ type: actions.PAUSE_TIMER });
    if (currentSession) {
      dispatch({ type: actions.PAUSE_SESSION });
    }
  };
  
  const stopTimer = () => {
    dispatch({ type: actions.STOP_TIMER });
    if (currentSession) {
      dispatch({ type: actions.END_SESSION });
    }
  };
  
  const resetTimer = () => {
    dispatch({ type: actions.STOP_TIMER });
  };
  
  // Captura de distrações
  const captureDistraction = () => {
    if (distractionText.trim()) {
      dispatch({
        type: actions.ADD_DISTRACTION,
        payload: distractionText.trim()
      });
      setDistractionText('');
      setShowDistractionInput(false);
    }
  };
  
  const resolveDistraction = (distractionId) => {
    dispatch({
      type: actions.RESOLVE_DISTRACTION,
      payload: distractionId
    });
  };
  
  // Iniciar sessão rápida
  const startQuickSession = () => {
    if (state.ui.selectedDisciplina && state.ui.selectedTheme) {
      dispatch({
        type: actions.START_SESSION,
        payload: {
          disciplinaId: state.ui.selectedDisciplina.id,
          themeId: state.ui.selectedTheme.id,
          estimatedTime: customTime,
          subtema: null
        }
      });
    }
  };
  
  // Efeito sonoro quando timer termina (simulado)
  useEffect(() => {
    if (timer.timeLeft === 0 && timer.totalTime > 0) {
      // Aqui poderia tocar um som
      console.log('Timer finalizado!');
    }
  }, [timer.timeLeft, timer.totalTime]);
  
  return (
    <div className="space-y-6">
      {/* Seleção de Disciplina/Tema */}
      {!currentSession && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-blue-600" />
              Iniciar Nova Sessão
            </CardTitle>
            <CardDescription>
              Selecione uma disciplina e tema na sidebar para começar
            </CardDescription>
          </CardHeader>
          <CardContent>
            {state.ui.selectedDisciplina && state.ui.selectedTheme ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-accent rounded-lg">
                  <div 
                    className="w-6 h-6 rounded"
                    style={{ backgroundColor: state.ui.selectedDisciplina.color }}
                  />
                  <div>
                    <h3 className="font-medium">{state.ui.selectedDisciplina.nome}</h3>
                    <p className="text-sm text-muted-foreground">{state.ui.selectedTheme.nome}</p>
                  </div>
                </div>
                
                {/* Configuração de Tempo */}
                <div className="space-y-3">
                  <h4 className="font-medium text-sm">Modo de Estudo</h4>
                  
                  <div className="grid grid-cols-3 gap-2">
                    <Button
                      variant={timerMode === 'pomodoro' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setTimerMode('pomodoro')}
                    >
                      Pomodoro
                    </Button>
                    <Button
                      variant={timerMode === 'flowtime' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setTimerMode('flowtime')}
                    >
                      Flowtime
                    </Button>
                    <Button
                      variant={timerMode === 'custom' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setTimerMode('custom')}
                    >
                      Personalizado
                    </Button>
                  </div>
                  
                  {timerMode === 'custom' && (
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCustomTime(Math.max(5, customTime - 5))}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <Input
                        type="number"
                        value={customTime}
                        onChange={(e) => setCustomTime(Math.max(5, parseInt(e.target.value) || 5))}
                        className="w-20 text-center"
                        min="5"
                        max="180"
                      />
                      <span className="text-sm text-muted-foreground">min</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCustomTime(Math.min(180, customTime + 5))}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                  
                  <div className="text-sm text-muted-foreground">
                    {timerMode === 'pomodoro' && `${state.settings.pomodoroSettings.workTime} minutos de foco + pausas automáticas`}
                    {timerMode === 'flowtime' && 'Sessão flexível baseada no seu estado de flow'}
                    {timerMode === 'custom' && `${customTime} minutos personalizados`}
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button
                    onClick={() => {
                      // Sessão Zeigarnik de 2 minutos
                      dispatch({
                        type: actions.START_SESSION,
                        payload: {
                          disciplinaId: state.ui.selectedDisciplina.id,
                          themeId: state.ui.selectedTheme.id,
                          estimatedTime: 2,
                          subtema: 'Início Zeigarnik (2min)'
                        }
                      });
                    }}
                    variant="outline"
                    className="flex-1 gap-2"
                  >
                    <Zap className="h-4 w-4" />
                    Início 2min (Zeigarnik)
                  </Button>
                  
                  <Button
                    onClick={startQuickSession}
                    className="flex-1 gap-2"
                  >
                    <Play className="h-4 w-4" />
                    Iniciar Sessão
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Target className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>Selecione uma disciplina e tema na sidebar para começar uma sessão de estudo</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
      
      {/* Sessão Ativa */}
      {currentSession && (
        <div className="space-y-6">
          {/* Info da Sessão */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                Sessão Ativa
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3 mb-4">
                <div 
                  className="w-6 h-6 rounded"
                  style={{ 
                    backgroundColor: state.disciplinas.find(d => d.id === currentSession.disciplinaId)?.color 
                  }}
                />
                <div>
                  <h3 className="font-medium">
                    {state.disciplinas.find(d => d.id === currentSession.disciplinaId)?.nome}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {state.disciplinas
                      .find(d => d.id === currentSession.disciplinaId)?.themes
                      .find(t => t.id === currentSession.themeId)?.nome}
                  </p>
                  {currentSession.subtema && (
                    <Badge variant="secondary" className="text-xs mt-1">
                      {currentSession.subtema}
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Timer */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-blue-600" />
                  Timer
                </div>
                <Badge variant={timer.isPaused ? 'secondary' : 'default'}>
                  {timer.isPaused ? 'Pausado' : timer.isActive ? 'Ativo' : 'Parado'}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center space-y-4">
                {/* Display do Timer */}
                <div className="text-6xl font-mono font-bold">
                  {formatTime(timer.timeLeft)}
                </div>
                
                {/* Barra de Progresso */}
                <div className="space-y-2">
                  <Progress value={progress} className="h-3" />
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>0:00</span>
                    <span>{formatTime(timer.totalTime)}</span>
                  </div>
                </div>
                
                {/* Controles */}
                <div className="flex justify-center gap-2">
                  {!timer.isActive || timer.isPaused ? (
                    <Button onClick={startTimer} className="gap-2">
                      <Play className="h-4 w-4" />
                      {timer.isPaused ? 'Continuar' : 'Iniciar'}
                    </Button>
                  ) : (
                    <Button onClick={pauseTimer} variant="outline" className="gap-2">
                      <Pause className="h-4 w-4" />
                      Pausar
                    </Button>
                  )}
                  
                  <Button onClick={resetTimer} variant="outline" className="gap-2">
                    <RotateCcw className="h-4 w-4" />
                    Reiniciar
                  </Button>
                  
                  <Button onClick={stopTimer} variant="destructive" className="gap-2">
                    <Square className="h-4 w-4" />
                    Finalizar
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Captura de Distrações */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-orange-600" />
                Captura de Distrações
              </CardTitle>
              <CardDescription>
                Anote rapidamente pensamentos intrusivos sem perder o foco
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Input de Distração */}
                {showDistractionInput ? (
                  <div className="flex gap-2">
                    <Input
                      placeholder="Digite sua distração rapidamente..."
                      value={distractionText}
                      onChange={(e) => setDistractionText(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && captureDistraction()}
                      autoFocus
                    />
                    <Button onClick={captureDistraction} size="sm">
                      Capturar
                    </Button>
                    <Button 
                      onClick={() => setShowDistractionInput(false)} 
                      variant="outline" 
                      size="sm"
                    >
                      Cancelar
                    </Button>
                  </div>
                ) : (
                  <Button
                    onClick={() => setShowDistractionInput(true)}
                    variant="outline"
                    className="w-full gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Capturar Distração Rápida
                  </Button>
                )}
                
                {/* Lista de Distrações */}
                {state.distractions.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">Distrações Capturadas</h4>
                    {state.distractions.map((distraction) => (
                      <div
                        key={distraction.id}
                        className={`
                          flex items-center justify-between p-2 rounded border
                          ${distraction.resolved 
                            ? 'bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800' 
                            : 'bg-orange-50 border-orange-200 dark:bg-orange-950 dark:border-orange-800'
                          }
                        `}
                      >
                        <span className={`text-sm ${distraction.resolved ? 'line-through text-muted-foreground' : ''}`}>
                          {distraction.text}
                        </span>
                        {!distraction.resolved && (
                          <Button
                            onClick={() => resolveDistraction(distraction.id)}
                            size="sm"
                            variant="ghost"
                          >
                            <CheckCircle2 className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          
          {/* Notas da Sessão */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-purple-600" />
                Notas da Sessão
              </CardTitle>
              <CardDescription>
                Anote insights, dúvidas ou pontos importantes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Digite suas anotações sobre esta sessão de estudo..."
                value={sessionNotes}
                onChange={(e) => setSessionNotes(e.target.value)}
                rows={4}
              />
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

