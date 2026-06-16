import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect } from 'react';
import MapView from './components/Map/MapView';
import DesignationFilter from './components/Controls/DesignationFilter';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
    },
  },
});

function App() {
  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <div className="w-screen h-screen bg-slate-900 overflow-hidden relative">
        <MapView />
        <DesignationFilter />
        {/* UI overlays — added in subsequent steps */}
      </div>
    </QueryClientProvider>
  );
}

export default App;
