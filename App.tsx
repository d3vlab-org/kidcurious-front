import React, { useEffect, useState } from 'react';
import { LanguageProvider } from './contexts/LanguageContext';
import { AgeProvider } from './contexts/AgeContext';
import { AppRouter } from './components/AppRouter';
import { kidAskAPI } from './services/api';
import { Loader2 } from 'lucide-react';

function App() {
  const [isHealthy, setIsHealthy] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check API health on app startup
    const checkHealth = async () => {
      try {
        await kidAskAPI.healthCheck();
        setIsHealthy(true);
      } catch (error) {
        console.error('API health check failed:', error);
        setIsHealthy(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkHealth();
  }, []);

  if (isLoading) {
    return (
      <div className="w-full max-w-sm mx-auto h-screen bg-gradient-to-b from-zoo-whale to-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-zoo-accent animate-spin mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-primary mb-2">MądreKidAsk</h2>
          <p className="text-muted-foreground">Ładowanie aplikacji...</p>
        </div>
      </div>
    );
  }

  if (!isHealthy) {
    return (
      <div className="w-full max-w-sm mx-auto h-screen bg-gradient-to-b from-red-100 to-white flex items-center justify-center p-6">
        <div className="text-center">
          <div className="text-6xl mb-6">⚠️</div>
          <h2 className="text-2xl font-bold text-red-600 mb-4">Problem z połączeniem</h2>
          <p className="text-red-700 mb-6">
            Nie mogę połączyć się z serwerem. Sprawdź połączenie internetowe i spróbuj ponownie.
          </p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-red-500 text-white px-6 py-3 rounded-xl font-medium hover:bg-red-600 transition-colors"
          >
            Odśwież aplikację
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <LanguageProvider>
        <AgeProvider>
          <AppRouter initialScreen="onboarding" />
        </AgeProvider>
      </LanguageProvider>
    </div>
  );
}

export default App;