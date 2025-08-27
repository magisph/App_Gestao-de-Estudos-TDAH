// Utilitários de data para o PWA de Gestão de Estudos

// Data da prova (fixa)
export const EXAM_DATE = new Date('2025-09-28'); // Sábado, 28 de setembro de 2025

// Data atual (pode ser sobrescrita para testes)
export const getCurrentDate = () => {
  // Para desenvolvimento, usar data fixa
  return new Date('2025-08-27'); // Quarta-feira, 27 de agosto de 2025
  
  // Para produção, descomentar a linha abaixo:
  // return new Date();
};

// Calcular dias restantes até a prova
export const getDaysRemaining = () => {
  const today = getCurrentDate();
  const examDate = EXAM_DATE;
  
  // Zerar as horas para calcular apenas dias completos
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const examStart = new Date(examDate.getFullYear(), examDate.getMonth(), examDate.getDate());
  
  const diffTime = examStart - todayStart;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return Math.max(0, diffDays);
};

// Calcular dias passados desde o início do cronograma
export const getDaysPassed = () => {
  const totalDays = 32; // Total de dias do cronograma
  const daysRemaining = getDaysRemaining();
  return totalDays - daysRemaining;
};

// Calcular porcentagem do cronograma concluída
export const getScheduleProgress = () => {
  const totalDays = 32;
  const daysPassed = getDaysPassed();
  return Math.round((daysPassed / totalDays) * 100);
};

// Verificar se é hoje
export const isToday = (date) => {
  const today = getCurrentDate();
  const checkDate = new Date(date);
  
  return today.getDate() === checkDate.getDate() &&
         today.getMonth() === checkDate.getMonth() &&
         today.getFullYear() === checkDate.getFullYear();
};

// Verificar se é esta semana
export const isThisWeek = (date) => {
  const today = getCurrentDate();
  const checkDate = new Date(date);
  
  // Calcular início da semana (domingo)
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay());
  startOfWeek.setHours(0, 0, 0, 0);
  
  // Calcular fim da semana (sábado)
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);
  
  return checkDate >= startOfWeek && checkDate <= endOfWeek;
};

// Formatação de data em português
export const formatDate = (date, format = 'short') => {
  const dateObj = new Date(date);
  
  const options = {
    short: { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    },
    long: { 
      weekday: 'long', 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    },
    weekday: { 
      weekday: 'long' 
    },
    time: { 
      hour: '2-digit', 
      minute: '2-digit' 
    }
  };
  
  return dateObj.toLocaleDateString('pt-BR', options[format]);
};

// Calcular semanas restantes
export const getWeeksRemaining = () => {
  const daysRemaining = getDaysRemaining();
  return Math.ceil(daysRemaining / 7);
};

// Gerar cronograma semanal
export const generateWeeklySchedule = () => {
  const today = getCurrentDate();
  const weeks = [];
  
  for (let i = 0; i < 5; i++) { // Próximas 5 semanas
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() + (i * 7) - today.getDay()); // Domingo da semana
    
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6); // Sábado da semana
    
    weeks.push({
      weekNumber: i + 1,
      startDate: new Date(weekStart),
      endDate: new Date(weekEnd),
      isCurrentWeek: i === 0,
      daysInWeek: 7
    });
  }
  
  return weeks;
};

// Calcular meta diária de estudo
export const getDailyStudyGoal = () => {
  const daysRemaining = getDaysRemaining();
  const totalHoursNeeded = 200; // Meta de 200 horas de estudo
  
  if (daysRemaining <= 0) return 0;
  
  return Math.ceil(totalHoursNeeded / daysRemaining * 60); // Retorna em minutos
};

// Verificar se está no prazo das metas
export const isOnTrack = (totalStudyTime) => {
  const daysPassed = getDaysPassed();
  const expectedTime = daysPassed * getDailyStudyGoal();
  
  return totalStudyTime >= expectedTime * 0.8; // 80% da meta é considerado "no prazo"
};

// Gerar insights baseados no calendário
export const getCalendarInsights = (sessions) => {
  const insights = [];
  const today = getCurrentDate();
  const daysRemaining = getDaysRemaining();
  
  // Verificar consistência semanal
  const thisWeekSessions = sessions.filter(s => isThisWeek(s.createdAt));
  if (thisWeekSessions.length < 5) {
    insights.push({
      type: 'warning',
      title: 'Meta semanal em risco',
      message: `Você tem apenas ${thisWeekSessions.length} sessões esta semana. Meta: 7 sessões.`
    });
  }
  
  // Verificar proximidade da prova
  if (daysRemaining <= 7) {
    insights.push({
      type: 'urgent',
      title: 'Reta final!',
      message: `Faltam apenas ${daysRemaining} dias. Foque nas disciplinas de maior peso.`
    });
  } else if (daysRemaining <= 14) {
    insights.push({
      type: 'info',
      title: 'Duas semanas finais',
      message: 'Intensifique os estudos e faça revisões das matérias já estudadas.'
    });
  }
  
  // Verificar se estudou hoje
  const todaySessions = sessions.filter(s => isToday(s.createdAt));
  if (todaySessions.length === 0 && today.getHours() > 12) {
    insights.push({
      type: 'reminder',
      title: 'Ainda não estudou hoje',
      message: 'Que tal começar com uma sessão de 25 minutos?'
    });
  }
  
  return insights;
};

// Calcular distribuição ideal de tempo por disciplina
export const getIdealTimeDistribution = (disciplinas) => {
  const daysRemaining = getDaysRemaining();
  const dailyGoal = getDailyStudyGoal();
  const totalAvailableTime = daysRemaining * dailyGoal;
  
  // Pesos por prioridade
  const priorityWeights = {
    'alta': 0.5,
    'média': 0.3,
    'baixa': 0.2
  };
  
  return disciplinas.map(disciplina => {
    const weight = priorityWeights[disciplina.priority_default] || 0.2;
    const recommendedTime = Math.round(totalAvailableTime * weight / disciplinas.filter(d => d.priority_default === disciplina.priority_default).length);
    
    return {
      ...disciplina,
      recommendedTime,
      timePerWeek: Math.round(recommendedTime / Math.max(1, Math.ceil(daysRemaining / 7)))
    };
  });
};

