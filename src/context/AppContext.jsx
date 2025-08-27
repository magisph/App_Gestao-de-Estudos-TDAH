import React, { createContext, useContext, useReducer, useEffect } from 'react';
import disciplinasData from '../assets/disciplinas.json';
import { initializePWA } from '../utils/pwaUtils';

// Estado inicial
const initialState = {
  // Dados das disciplinas
  disciplinas: disciplinasData.disciplinas,
  
  // Sessão atual
  currentSession: null,
  
  // Histórico de sessões
  sessions: [],
  
  // Configurações do usuário
  settings: {
    theme: 'system',
    defaultTimerType: 'pomodoro',
    pomodoroSettings: {
      workTime: 25,
      shortBreak: 5,
      longBreak: 15,
      longBreakInterval: 4
    },
    notifications: true,
    soundEnabled: true,
    autoStartBreaks: false
  },
  
  // Estado do timer
  timer: {
    isActive: false,
    isPaused: false,
    timeLeft: 0,
    totalTime: 0,
    type: 'work', // 'work', 'shortBreak', 'longBreak'
    sessionCount: 0
  },
  
  // Distrações capturadas
  distractions: [],
  
  // UI State
  ui: {
    sidebarOpen: false,
    currentView: 'dashboard', // 'dashboard', 'session', 'progress', 'calendar'
    selectedDisciplina: null,
    selectedTheme: null
  },
  
  // Estado PWA
  pwa: {
    isInstalled: false,
    isOnline: navigator.onLine,
    canInstall: false,
    updateAvailable: false,
    support: {}
  }
};

// Actions
const actionTypes = {
  // Sessões
  START_SESSION: 'START_SESSION',
  END_SESSION: 'END_SESSION',
  PAUSE_SESSION: 'PAUSE_SESSION',
  RESUME_SESSION: 'RESUME_SESSION',
  UPDATE_SESSION_NOTES: 'UPDATE_SESSION_NOTES',
  
  // Timer
  START_TIMER: 'START_TIMER',
  PAUSE_TIMER: 'PAUSE_TIMER',
  RESUME_TIMER: 'RESUME_TIMER',
  STOP_TIMER: 'STOP_TIMER',
  TICK_TIMER: 'TICK_TIMER',
  SWITCH_TIMER_MODE: 'SWITCH_TIMER_MODE',
  
  // Distrações
  ADD_DISTRACTION: 'ADD_DISTRACTION',
  RESOLVE_DISTRACTION: 'RESOLVE_DISTRACTION',
  CLEAR_DISTRACTIONS: 'CLEAR_DISTRACTIONS',
  
  // Configurações
  UPDATE_SETTINGS: 'UPDATE_SETTINGS',
  SET_THEME: 'SET_THEME',
  
  // UI
  SET_CURRENT_VIEW: 'SET_CURRENT_VIEW',
  TOGGLE_SIDEBAR: 'TOGGLE_SIDEBAR',
  SELECT_DISCIPLINA: 'SELECT_DISCIPLINA',
  SELECT_THEME: 'SELECT_THEME',
  
  // Dados
  LOAD_DATA: 'LOAD_DATA',
  SAVE_DATA: 'SAVE_DATA',
  
  // PWA
  SET_PWA_STATUS: 'SET_PWA_STATUS',
  SET_ONLINE_STATUS: 'SET_ONLINE_STATUS',
  SET_INSTALL_PROMPT: 'SET_INSTALL_PROMPT'
};

// Reducer
function appReducer(state, action) {
  switch (action.type) {
    case actionTypes.START_SESSION:
      return {
        ...state,
        currentSession: {
          id: Date.now().toString(),
          disciplinaId: action.payload.disciplinaId,
          themeId: action.payload.themeId,
          subtema: action.payload.subtema,
          estimatedTime: action.payload.estimatedTime,
          status: 'active',
          notes: '',
          distractions: [],
          createdAt: new Date(),
          actualTime: 0
        },
        timer: {
          ...state.timer,
          isActive: true,
          isPaused: false,
          timeLeft: action.payload.estimatedTime * 60,
          totalTime: action.payload.estimatedTime * 60,
          type: 'work',
          sessionCount: 0
        },
        ui: {
          ...state.ui,
          currentView: 'session'
        }
      };
      
    case actionTypes.END_SESSION:
      const completedSession = {
        ...state.currentSession,
        status: 'completed',
        completedAt: new Date(),
        actualTime: Math.round((state.timer.totalTime - state.timer.timeLeft) / 60)
      };
      
      return {
        ...state,
        currentSession: null,
        sessions: [...state.sessions, completedSession],
        timer: {
          ...initialState.timer
        },
        distractions: [],
        ui: {
          ...state.ui,
          currentView: 'dashboard'
        }
      };
      
    case actionTypes.PAUSE_SESSION:
      return {
        ...state,
        currentSession: {
          ...state.currentSession,
          status: 'paused'
        },
        timer: {
          ...state.timer,
          isPaused: true
        }
      };
      
    case actionTypes.RESUME_SESSION:
      return {
        ...state,
        currentSession: {
          ...state.currentSession,
          status: 'active'
        },
        timer: {
          ...state.timer,
          isPaused: false
        }
      };
      
    case actionTypes.UPDATE_SESSION_NOTES:
      return {
        ...state,
        currentSession: {
          ...state.currentSession,
          notes: action.payload
        }
      };
      
    case actionTypes.START_TIMER:
      return {
        ...state,
        timer: {
          ...state.timer,
          isActive: true,
          isPaused: false,
          timeLeft: action.payload.duration * 60,
          totalTime: action.payload.duration * 60,
          type: action.payload.type || 'work'
        }
      };
      
    case actionTypes.PAUSE_TIMER:
      return {
        ...state,
        timer: {
          ...state.timer,
          isPaused: true
        }
      };
      
    case actionTypes.RESUME_TIMER:
      return {
        ...state,
        timer: {
          ...state.timer,
          isPaused: false
        }
      };
      
    case actionTypes.STOP_TIMER:
      return {
        ...state,
        timer: {
          ...initialState.timer
        }
      };
      
    case actionTypes.TICK_TIMER:
      const newTimeLeft = Math.max(0, state.timer.timeLeft - 1);
      return {
        ...state,
        timer: {
          ...state.timer,
          timeLeft: newTimeLeft,
          isActive: newTimeLeft > 0 ? state.timer.isActive : false
        }
      };
      
    case actionTypes.ADD_DISTRACTION:
      const newDistraction = {
        id: Date.now().toString(),
        text: action.payload,
        timestamp: new Date(),
        resolved: false
      };
      
      return {
        ...state,
        distractions: [...state.distractions, newDistraction],
        currentSession: state.currentSession ? {
          ...state.currentSession,
          distractions: [...(state.currentSession.distractions || []), newDistraction]
        } : state.currentSession
      };
      
    case actionTypes.RESOLVE_DISTRACTION:
      return {
        ...state,
        distractions: state.distractions.map(d => 
          d.id === action.payload ? { ...d, resolved: true } : d
        )
      };
      
    case actionTypes.CLEAR_DISTRACTIONS:
      return {
        ...state,
        distractions: []
      };
      
    case actionTypes.UPDATE_SETTINGS:
      return {
        ...state,
        settings: {
          ...state.settings,
          ...action.payload
        }
      };
      
    case actionTypes.SET_THEME:
      return {
        ...state,
        settings: {
          ...state.settings,
          theme: action.payload
        }
      };
      
    case actionTypes.SET_CURRENT_VIEW:
      return {
        ...state,
        ui: {
          ...state.ui,
          currentView: action.payload
        }
      };
      
    case actionTypes.TOGGLE_SIDEBAR:
      return {
        ...state,
        ui: {
          ...state.ui,
          sidebarOpen: !state.ui.sidebarOpen
        }
      };
      
    case actionTypes.SELECT_DISCIPLINA:
      return {
        ...state,
        ui: {
          ...state.ui,
          selectedDisciplina: action.payload,
          selectedTheme: null
        }
      };
      
    case actionTypes.SELECT_THEME:
      return {
        ...state,
        ui: {
          ...state.ui,
          selectedTheme: action.payload
        }
      };
      
    case actionTypes.LOAD_DATA:
      return {
        ...state,
        ...action.payload
      };
      
    case actionTypes.SET_PWA_STATUS:
      return {
        ...state,
        pwa: { ...state.pwa, ...action.payload }
      };
    
    case actionTypes.SET_ONLINE_STATUS:
      return {
        ...state,
        pwa: { ...state.pwa, isOnline: action.payload }
      };
    
    case actionTypes.SET_INSTALL_PROMPT:
      return {
        ...state,
        pwa: { ...state.pwa, canInstall: action.payload }
      };
      
    default:
      return state;
  }
}

// Context
const AppContext = createContext();

// Provider
export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState);
  
  // Carregar dados do localStorage na inicialização
  useEffect(() => {
    const savedData = localStorage.getItem('gestao-estudos-data');
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        dispatch({ type: actionTypes.LOAD_DATA, payload: parsedData });
      } catch (error) {
        console.error('Erro ao carregar dados salvos:', error);
      }
    }
  }, []);
  
  // Salvar dados no localStorage quando o estado mudar
  useEffect(() => {
    const dataToSave = {
      sessions: state.sessions,
      settings: state.settings,
      distractions: state.distractions
    };
    localStorage.setItem('gestao-estudos-data', JSON.stringify(dataToSave));
  }, [state.sessions, state.settings, state.distractions]);
  
  // Timer tick effect
  useEffect(() => {
    let interval = null;
    
    if (state.timer.isActive && !state.timer.isPaused) {
      interval = setInterval(() => {
        dispatch({ type: actionTypes.TICK_TIMER });
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [state.timer.isActive, state.timer.isPaused]);
  
  // Aplicar tema
  useEffect(() => {
    const root = document.documentElement;
    
    if (state.settings.theme === 'dark') {
      root.classList.add('dark');
    } else if (state.settings.theme === 'light') {
      root.classList.remove('dark');
    } else {
      // System theme
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      if (mediaQuery.matches) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    }
  }, [state.settings.theme]);
  
  // Inicializar PWA
  useEffect(() => {
    const initPWA = async () => {
      try {
        const result = await initializePWA(dispatch, actionTypes);
        
        dispatch({
          type: actionTypes.SET_PWA_STATUS,
          payload: {
            isInstalled: result.installed,
            support: result.support
          }
        });
        
        // Cleanup quando componente desmontar
        return result.cleanup;
      } catch (error) {
        console.error('Erro ao inicializar PWA:', error);
      }
    };
    
    initPWA();
  }, []);
  
  // Listeners para conectividade
  useEffect(() => {
    const handleOnline = () => {
      dispatch({ type: actionTypes.SET_ONLINE_STATUS, payload: true });
    };
    
    const handleOffline = () => {
      dispatch({ type: actionTypes.SET_ONLINE_STATUS, payload: false });
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  
  const value = {
    state,
    dispatch,
    actions: actionTypes
  };
  
  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}

// Hook personalizado
export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp deve ser usado dentro de AppProvider');
  }
  return context;
}

export { actionTypes };

