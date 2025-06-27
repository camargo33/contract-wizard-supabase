
import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';
import { useToast } from '@/hooks/use-toast';

type Analysis = Database['public']['Tables']['analises']['Row'];

interface AppState {
  analyses: Analysis[];
  currentAnalysis: Analysis | null;
  loading: boolean;
}

type AppAction = 
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ANALYSES'; payload: Analysis[] }
  | { type: 'ADD_ANALYSIS'; payload: Analysis }
  | { type: 'UPDATE_ANALYSIS'; payload: Analysis }
  | { type: 'SET_CURRENT_ANALYSIS'; payload: Analysis | null };

const initialState: AppState = {
  analyses: [],
  currentAnalysis: null,
  loading: false,
};

const appReducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ANALYSES':
      return { ...state, analyses: action.payload };
    case 'ADD_ANALYSIS':
      return { ...state, analyses: [action.payload, ...state.analyses] };
    case 'UPDATE_ANALYSIS':
      return {
        ...state,
        analyses: state.analyses.map(a => 
          a.id === action.payload.id ? action.payload : a
        ),
        currentAnalysis: state.currentAnalysis?.id === action.payload.id 
          ? action.payload 
          : state.currentAnalysis
      };
    case 'SET_CURRENT_ANALYSIS':
      return { ...state, currentAnalysis: action.payload };
    default:
      return state;
  }
};

const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
} | null>(null);

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const { toast } = useToast();

  useEffect(() => {
    // Carregar análises iniciais
    const loadAnalyses = async () => {
      dispatch({ type: 'SET_LOADING', payload: true });
      try {
        const { data, error } = await supabase
          .from('analises')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        dispatch({ type: 'SET_ANALYSES', payload: data || [] });
      } catch (error: any) {
        toast({
          title: "Erro ao carregar dados",
          description: error.message,
          variant: "destructive",
        });
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    loadAnalyses();

    // Configurar subscription para tempo real
    const channel = supabase
      .channel('analyses-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'analises'
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            dispatch({ type: 'ADD_ANALYSIS', payload: payload.new as Analysis });
          } else if (payload.eventType === 'UPDATE') {
            dispatch({ type: 'UPDATE_ANALYSIS', payload: payload.new as Analysis });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [toast]);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within AppProvider');
  }
  return context;
};
