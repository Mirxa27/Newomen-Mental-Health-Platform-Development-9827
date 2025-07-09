import { BrowserRouter } from 'react-router-dom';
import { useEffect } from 'react';
import AppRouter from './router';
import { useSocket } from './hooks/useSocket';
import errorService from './services/errorService';
import './index.css';

function App() {
  // Initialize socket connection
  const { isConnected, connectionStatus } = useSocket();

  // Initialize error service
  useEffect(() => {
    errorService.initializeGlobalHandlers();
  }, []);

  return (
    <BrowserRouter>
      <AppRouter />
      {/* Connection status indicator for development */}
      {process.env.NODE_ENV === 'development' && (
        <div className={`fixed bottom-4 right-4 px-2 py-1 rounded text-xs font-mono z-50 ${
          isConnected ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
        }`}>
          Socket: {connectionStatus}
        </div>
      )}
    </BrowserRouter>
  );
}

export default App;