import { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Layout from './components/Layout';
import AuthScreen from './screens/AuthScreen';
import HomeScreen from './screens/HomeScreen';
import LogScreen from './screens/LogScreen';
import HistoryScreen from './screens/HistoryScreen';
import SettingsScreen from './screens/SettingsScreen';
import ModuleScreen from './screens/ModuleScreen';
import FreeformJournalScreen from './screens/FreeformJournalScreen';
// import JournalScreen from './screens/JournalScreen';
// import AnalyticsScreen from './screens/AnalyticsScreen';

type ScreenType = 'home' | 'log' | 'freeform-journal' | 'module' | 'history' | 'settings';

interface ModuleState {
  screen: ScreenType;
  moduleId?: string;
}

type SetScreenFunction = (screen: { screen: string; moduleId?: string }) => void;

function AppInner() {
  const [currentScreen, setCurrentScreen] = useState<ModuleState>({ screen: 'home' });
  const { currentUser } = useAuth();

  if (!currentUser) {
    return <AuthScreen />;
  }

  const handleSetScreen: SetScreenFunction = (screen) => {
    setCurrentScreen(screen as ModuleState);
  };

  const renderScreen = () => {
    switch (currentScreen.screen) {
      case 'home':
        return <HomeScreen setCurrentScreen={handleSetScreen} />;
      case 'log':
        return <LogScreen />;
      case 'history':
        return <HistoryScreen />;
      case 'settings':
        return <SettingsScreen />;
      case 'freeform-journal':
        return <FreeformJournalScreen setCurrentScreen={handleSetScreen} />;
      case 'module':
        return <ModuleScreen moduleId={currentScreen.moduleId || 'introduction'} setCurrentScreen={handleSetScreen} />;
      default:
        return <HomeScreen setCurrentScreen={handleSetScreen} />;
    }
  };

  return (
    <Layout currentScreen={currentScreen.screen} setCurrentScreen={handleSetScreen}>
      {renderScreen()}
    </Layout>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppInner />
    </AuthProvider>
  );
}

export default App;
