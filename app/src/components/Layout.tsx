import React from 'react';
import { Home, FileText, History, User, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface LayoutProps {
  children: React.ReactNode;
  currentScreen: 'home' | 'log' | 'freeform-journal' | 'module' | 'history' | 'settings';
  setCurrentScreen: (screen: { screen: string; moduleId?: string }) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, currentScreen, setCurrentScreen }) => {
  const { userProfile, logout } = useAuth();

  const navigation = [
    { name: 'Home', screen: 'home' as const, icon: Home },
    { name: 'History', screen: 'history' as const, icon: History },
    { name: 'Log', screen: 'log' as const, icon: FileText },
  ];

  return (
    <div className="flex h-screen bg-olive-50">
      {/* Sidebar */}
      <div className="sidebar">
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-center h-16 border-b border-olive-200">
            <h1 className="text-xl font-semibold text-gray-900">InteroSight</h1>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navigation.map((item) => {
              const isActive = currentScreen === item.screen;
              return (
                <button
                  key={item.name}
                  onClick={() => setCurrentScreen({ screen: item.screen })}
                  className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                    isActive
                      ? 'bg-primary-100 text-primary-800 border border-primary-200'
                      : 'text-gray-700 hover:bg-olive-100'
                  }`}
                >
                  <item.icon className="w-5 h-5 mr-3" />
                  {item.name}
                </button>
              );
            })}
          </nav>

          {/* User Profile / Auth */}
          <div className="p-4 border-t border-olive-200">
            {userProfile ? (
              <div className="space-y-3">
                <button
                  onClick={() => setCurrentScreen({ screen: 'settings' })}
                  className={`w-full flex items-center px-3 py-2 rounded-lg transition-colors cursor-pointer ${
                    currentScreen === 'settings'
                      ? 'bg-primary-100 text-primary-800 border border-primary-200'
                      : 'bg-olive-50 hover:bg-olive-100'
                  }`}
                >
                  <User className="w-5 h-5 mr-3 text-gray-600" />
                  <div className="flex-1 min-w-0 text-left">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {userProfile.displayName}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {userProfile.email}
                    </p>
                  </div>
                </button>
                <button
                  onClick={logout}
                  className="w-full flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:bg-olive-100 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <button className="w-full px-3 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors">
                  Sign Up
                </button>
                <button className="w-full px-3 py-2 text-sm font-medium text-primary-600 hover:bg-primary-50 rounded-lg transition-colors">
                  Sign In
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content flex-1 overflow-auto">
        {children}
      </div>
    </div>
  );
};

export default Layout; 