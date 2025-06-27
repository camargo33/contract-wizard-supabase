
import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { AppContextProvider } from '@/contexts/AppContext';
import Layout from '@/components/Layout';
import { LoadingSkeleton } from '@/components/ui/loading-skeleton';

// Lazy loading das páginas
const Index = React.lazy(() => import('@/pages/Index'));
const Upload = React.lazy(() => import('@/pages/Upload'));
const Historico = React.lazy(() => import('@/pages/Historico'));
const Relatorios = React.lazy(() => import('@/pages/Relatorios'));
const Configuracoes = React.lazy(() => import('@/pages/Configuracoes'));
const Auth = React.lazy(() => import('@/pages/Auth'));
const NotFound = React.lazy(() => import('@/pages/NotFound'));

// Configuração do React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutos
      gcTime: 1000 * 60 * 30, // 30 minutos (renamed from cacheTime)
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});

const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="text-center space-y-4">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--primary-blue)] mx-auto"></div>
      <LoadingSkeleton lines={3} />
    </div>
  </div>
);

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContextProvider>
        <Router>
          <div className="min-h-screen bg-background">
            <Routes>
              <Route path="/auth" element={
                <Suspense fallback={<LoadingFallback />}>
                  <Auth />
                </Suspense>
              } />
              
              <Route path="/" element={<Layout />}>
                <Route index element={
                  <Suspense fallback={<LoadingFallback />}>
                    <Index />
                  </Suspense>
                } />
                <Route path="upload" element={
                  <Suspense fallback={<LoadingFallback />}>
                    <Upload />
                  </Suspense>
                } />
                <Route path="historico" element={
                  <Suspense fallback={<LoadingFallback />}>
                    <Historico />
                  </Suspense>
                } />
                <Route path="relatorios" element={
                  <Suspense fallback={<LoadingFallback />}>
                    <Relatorios />
                  </Suspense>
                } />
                <Route path="configuracoes" element={
                  <Suspense fallback={<LoadingFallback />}>
                    <Configuracoes />
                  </Suspense>
                } />
              </Route>
              
              <Route path="*" element={
                <Suspense fallback={<LoadingFallback />}>
                  <NotFound />
                </Suspense>
              } />
            </Routes>
            <Toaster />
          </div>
        </Router>
      </AppContextProvider>
    </QueryClientProvider>
  );
}

export default App;
