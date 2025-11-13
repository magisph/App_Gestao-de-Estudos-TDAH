import { AppProvider, useApp } from '@/context/AppContext';
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import { Dashboard } from '@/components/dashboard/Dashboard';
import { SessionManager } from '@/components/session/SessionManager';
import { ProgressView } from '@/components/progress/ProgressView';
import { Calendar } from '@/components/calendar/Calendar';
import './App.css';

function AppContent() {
  const { state } = useApp();
  
  const renderCurrentView = () => {
    switch (state.ui.currentView) {
      case 'session':
        return <SessionManager />;
      case 'calendar':
        return <Calendar />;
      case 'progress':
        return <ProgressView />;
      default:
        return <Dashboard />;
    }
  };
  
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="flex">
        <Sidebar />
        
        <main className="flex-1 p-6 max-w-full overflow-hidden">
          {renderCurrentView()}
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;
