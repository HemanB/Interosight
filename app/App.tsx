import React from 'react';
import { AuthProvider } from './src/providers/AuthProvider';
import { ChatProvider } from './src/providers/ChatProvider';
import { AppNavigator } from './src/navigation/AppNavigator';

export default function App() {
  console.log('[APP DEBUG] App component loading...');
  
  return (
    <AuthProvider>
      <ChatProvider>
        <AppNavigator />
      </ChatProvider>
    </AuthProvider>
  );
}
