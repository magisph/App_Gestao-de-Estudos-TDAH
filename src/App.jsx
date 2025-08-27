import React from 'react';
import { AppProvider, useApp } from './contexts/AppContext';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { SessionManager } from './components/SessionManager';
import { ProgressView } from './components/ProgressView';
import { Calendar } from './components/Calendar';
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
