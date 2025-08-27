import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  ChevronDown, 
  ChevronRight, 
  Clock, 
  Target,
  X,
  Filter
} from 'lucide-react';
import { useApp } from '../contexts/AppContext';

export function Sidebar() {
  const { state, dispatch, actions } = useApp();
  const [expandedDisciplinas, setExpandedDisciplinas] = useState(new Set());
  const [filterPriority, setFilterPriority] = useState('all');
  
  const toggleDisciplina = (disciplinaId) => {
    const newExpanded = new Set(expandedDisciplinas);
    if (newExpanded.has(disciplinaId)) {
      newExpanded.delete(disciplinaId);
    } else {
      newExpanded.add(disciplinaId);
    }
    setExpandedDisciplinas(newExpanded);
  };
  
  const selectDisciplina = (disciplina) => {
    dispatch({ type: actions.SELECT_DISCIPLINA, payload: disciplina });
  };
  
  const selectTheme = (theme) => {
    dispatch({ type: actions.SELECT_THEME, payload: theme });
  };
  
  const closeSidebar = () => {
    dispatch({ type: actions.TOGGLE_SIDEBAR });
  };
  
  const filteredDisciplinas = state.disciplinas.filter(disciplina => {
    if (filterPriority === 'all') return true;
    return disciplina.priority_default === filterPriority;
  });
  
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'alta':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'média':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'baixa':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };
  
  return (
    <>
      {/* Overlay para mobile */}
      {state.ui.sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={closeSidebar}
        />
      )}
      
      {/* Sidebar */}
      <aside className={`
        fixed md:static inset-y-0 left-0 z-50 w-80 bg-background border-r border-border
        transform transition-transform duration-200 ease-in-out
        ${state.ui.sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="flex flex-col h-full">
          {/* Header da Sidebar */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            <h2 className="font-semibold text-lg">Disciplinas</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={closeSidebar}
              className="md:hidden"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Filtros */}
          <div className="p-4 border-b border-border">
            <div className="flex items-center gap-2 mb-3">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Filtrar por prioridade</span>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <Button
                variant={filterPriority === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterPriority('all')}
              >
                Todas
              </Button>
              <Button
                variant={filterPriority === 'alta' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterPriority('alta')}
              >
                Alta
              </Button>
              <Button
                variant={filterPriority === 'média' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterPriority('média')}
              >
                Média
              </Button>
            </div>
          </div>
          
          {/* Lista de Disciplinas */}
          <ScrollArea className="flex-1">
            <div className="p-4 space-y-2">
              {filteredDisciplinas.map((disciplina) => (
                <div key={disciplina.id} className="space-y-1">
                  {/* Disciplina */}
                  <div
                    className={`
                      flex items-center gap-3 p-3 rounded-lg cursor-pointer
                      transition-colors hover:bg-accent
                      ${state.ui.selectedDisciplina?.id === disciplina.id 
                        ? 'bg-accent border border-border' 
                        : ''
                      }
                    `}
                    onClick={() => {
                      selectDisciplina(disciplina);
                      toggleDisciplina(disciplina.id);
                    }}
                  >
                    {/* Ícone da disciplina */}
                    <div 
                      className="w-8 h-8 rounded-md flex items-center justify-center text-white text-xs font-bold"
                      style={{ backgroundColor: disciplina.color }}
                    >
                      {disciplina.nome.charAt(0)}
                    </div>
                    
                    {/* Nome e info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-sm truncate">
                          {disciplina.nome}
                        </h3>
                        <Badge 
                          variant="secondary" 
                          className={`text-xs ${getPriorityColor(disciplina.priority_default)}`}
                        >
                          {disciplina.priority_default}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {disciplina.themes.length} temas
                      </p>
                    </div>
                    
                    {/* Seta de expansão */}
                    <Button variant="ghost" size="sm" className="p-1">
                      {expandedDisciplinas.has(disciplina.id) ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  
                  {/* Temas (expandidos) */}
                  {expandedDisciplinas.has(disciplina.id) && (
                    <div className="ml-11 space-y-1">
                      {disciplina.themes.map((theme) => (
                        <div
                          key={theme.id}
                          className={`
                            flex items-center gap-3 p-2 rounded-md cursor-pointer
                            transition-colors hover:bg-accent/50
                            ${state.ui.selectedTheme?.id === theme.id 
                              ? 'bg-accent/50 border border-border' 
                              : ''
                            }
                          `}
                          onClick={() => selectTheme(theme)}
                        >
                          <Target className="h-3 w-3 text-muted-foreground" />
                          
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-sm truncate">
                              {theme.nome}
                            </h4>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              {theme.default_estimate_minutes}min
                              <span>•</span>
                              {theme.subtemas.length} subtemas
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
          
          {/* Dicas de Captura (Efeito Zeigarnik) */}
          {state.ui.selectedDisciplina && (
            <div className="p-4 border-t border-border">
              <h3 className="font-medium text-sm mb-2">💡 Dicas de Produtividade</h3>
              <div className="space-y-2">
                {state.ui.selectedDisciplina.captureHints.map((hint, index) => (
                  <p key={index} className="text-xs text-muted-foreground bg-accent/30 p-2 rounded">
                    {hint}
                  </p>
                ))}
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}

