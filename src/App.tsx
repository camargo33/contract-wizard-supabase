
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppProvider } from "./contexts/AppContext";
import { Suspense, lazy } from "react";
import { LoadingSkeleton } from "./components/ui/loading-skeleton";

// Lazy loading das páginas
const Index = lazy(() => import("./pages/Index"));
const Auth = lazy(() => import("./pages/Auth"));
const Layout = lazy(() => import("./components/Layout"));
const Upload = lazy(() => import("./pages/Upload"));
const Historico = lazy(() => import("./pages/Historico"));
const Relatorios = lazy(() => import("./pages/Relatorios"));
const Configuracoes = lazy(() => import("./pages/Configuracoes"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutos
      cacheTime: 1000 * 60 * 30, // 30 minutos
      retry: 3,
      refetchOnWindowFocus: false,
    },
  },
});

const PageSuspenseWrapper = ({ children }: { children: React.ReactNode }) => (
  <Suspense fallback={
    <div className="min-h-screen flex items-center justify-center">
      <div className="space-y-4 w-full max-w-md">
        <LoadingSkeleton lines={3} />
      </div>
    </div>
  }>
    {children}
  </Suspense>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AppProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={
              <PageSuspenseWrapper>
                <Index />
              </PageSuspenseWrapper>
            } />
            <Route path="/auth" element={
              <PageSuspenseWrapper>
                <Auth />
              </PageSuspenseWrapper>
            } />
            <Route path="/" element={
              <PageSuspenseWrapper>
                <Layout />
              </PageSuspenseWrapper>
            }>
              <Route path="upload" element={
                <PageSuspenseWrapper>
                  <Upload />
                </PageSuspenseWrapper>
              } />
              <Route path="historico" element={
                <PageSuspenseWrapper>
                  <Historico />
                </PageSuspenseWrapper>
              } />
              <Route path="relatorios" element={
                <PageSuspenseWrapper>
                  <Relatorios />
                </PageSuspenseWrapper>
              } />
              <Route path="configuracoes" element={
                <PageSuspenseWrapper>
                  <Configuracoes />
                </PageSuspenseWrapper>
              } />
            </Route>
            <Route path="*" element={
              <PageSuspenseWrapper>
                <NotFound />
              </PageSuspenseWrapper>
            } />
          </Routes>
        </BrowserRouter>
      </AppProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
