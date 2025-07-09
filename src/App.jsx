import React, { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import useSocket from './hooks/useSocket';
import AppRouter from './router';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './store/authStore';
import NetworkStatus from './components/common/NetworkStatus';
import PWAInstallPrompt from './components/common/PWAInstallPrompt';
import errorService from './services/errorService';
import './index.css';

function App() {
  const { token } = useAuthStore();

  // Initialize socket connection if authenticated
  useSocket();

  // Initialize error service
  useEffect(() => {
    errorService.initializeGlobalHandlers();
  }, []);

  return (
    <HelmetProvider>
      <BrowserRouter>
        <NetworkStatus />
        <PWAInstallPrompt />
        <Toaster position="top-center" reverseOrder={false} />
        <AppRouter />
      </BrowserRouter>
    </HelmetProvider>
  );
}

export default App;