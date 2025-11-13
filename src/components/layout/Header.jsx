import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Menu, 
  Sun, 
  Moon, 
  Monitor, 
  Download,
  BookOpen,
  Timer,
  BarChart3,
  Calendar
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { getDaysRemaining } from '@/utils/dateUtils';

export function Header() {
  const { state, dispatch, actions } = useApp();
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [canInstall, setCanInstall] = useState(false);
  
  // Detectar evento de instalação PWA
  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setCanInstall(true);
    };
    
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);
  
  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setCanInstall(false);
      setDeferredPrompt(null);
    }
  };
  
  const toggleTheme = () => {
    const themes = ['light', 'dark', 'system'];
    const currentIndex = themes.indexOf(state.settings.theme);
    const nextTheme = themes[(currentIndex + 1) % themes.length];
    
    dispatch({
      type: actions.UPDATE_SETTINGS,
      payload: { theme: nextTheme }
    });
  };
  
  const getThemeIcon = () => {
    switch (state.settings.theme) {
      case 'light':
        return <Sun className="h-4 w-4" />;
      case 'dark':
        return <Moon className="h-4 w-4" />;
      default:
        return <Monitor className="h-4 w-4" />;
    }
  };
  
  const toggleSidebar = () => {
    dispatch({ type: actions.TOGGLE_SIDEBAR });
  };
  
  const setCurrentView = (view) => {
    dispatch({ type: actions.SET_CURRENT_VIEW, payload: view });
  };
  
  const daysRemaining = getDaysRemaining();
  
  return (
    <header className="bg-background border-b border-border sticky top-0 z-50">
      <div className="flex items-center justify-between px-4 py-3">
        {/* Logo e Menu */}
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleSidebar}
            className="md:hidden"
          >
            <Menu className="h-5 w-5" />
          </Button>
          
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
              <BookOpen className="h-5 w-5 text-white" />
            </div>
            <div className="hidden sm:block">
              <h1 className="font-semibold text-lg">Gestão de Estudos</h1>
              <p className="text-xs text-muted-foreground">TJ-CE • {daysRemaining} dias restantes</p>
            </div>
          </div>
        </div>
        
        {/* Navegação Central */}
        <nav className="hidden md:flex items-center gap-1">
          <Button
            variant={state.ui.currentView === 'dashboard' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setCurrentView('dashboard')}
            className="gap-2"
          >
            <BarChart3 className="h-4 w-4" />
            Dashboard
          </Button>
          
          <Button
            variant={state.ui.currentView === 'session' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setCurrentView('session')}
            className="gap-2"
          >
            <Timer className="h-4 w-4" />
            Sessão
          </Button>
          
          <Button
            variant={state.ui.currentView === 'calendar' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setCurrentView('calendar')}
            className="gap-2"
          >
            <Calendar className="h-4 w-4" />
            Calendário
          </Button>
          
          <Button
            variant={state.ui.currentView === 'progress' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setCurrentView('progress')}
            className="gap-2"
          >
            <BarChart3 className="h-4 w-4" />
            Progresso
          </Button>
        </nav>
        
        {/* Controles */}
        <div className="flex items-center gap-2">
          {/* Botão de Tema */}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleTheme}
            title={`Tema atual: ${state.settings.theme}`}
          >
            {getThemeIcon()}
          </Button>
          
          {/* Botão de Instalação PWA */}
          {canInstall && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleInstallClick}
              className="gap-2 hidden sm:flex"
            >
              <Download className="h-4 w-4" />
              Instalar App
            </Button>
          )}
        </div>
      </div>
      
      {/* Navegação Mobile */}
      <nav className="md:hidden border-t border-border">
        <div className="grid grid-cols-4">
          <Button
            variant={state.ui.currentView === 'dashboard' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setCurrentView('dashboard')}
            className="flex-col gap-1 rounded-none h-auto py-2"
          >
            <BarChart3 className="h-4 w-4" />
            <span className="text-xs">Dashboard</span>
          </Button>
          
          <Button
            variant={state.ui.currentView === 'session' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setCurrentView('session')}
            className="flex-col gap-1 rounded-none h-auto py-2"
          >
            <Timer className="h-4 w-4" />
            <span className="text-xs">Sessão</span>
          </Button>
          
          <Button
            variant={state.ui.currentView === 'calendar' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setCurrentView('calendar')}
            className="flex-col gap-1 rounded-none h-auto py-2"
          >
            <Calendar className="h-4 w-4" />
            <span className="text-xs">Calendário</span>
          </Button>
          
          <Button
            variant={state.ui.currentView === 'progress' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setCurrentView('progress')}
            className="flex-col gap-1 rounded-none h-auto py-2"
          >
            <BarChart3 className="h-4 w-4" />
            <span className="text-xs">Progresso</span>
          </Button>
        </div>
      </nav>
    </header>
  );
}

