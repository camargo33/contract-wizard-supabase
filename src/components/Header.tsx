
import React from 'react';
import { Wifi, LogOut, Sun, Moon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useTheme } from '@/hooks/useTheme';

const Header = () => {
  const { toast } = useToast();
  const { theme, toggleTheme } = useTheme();

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      window.location.href = '/auth';
    } catch (error: any) {
      toast({
        title: "Erro ao sair",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <header className="ciabrasnet-gradient shadow-lg border-b border-[var(--primary-dark)]">
      <div className="px-6 py-4 flex justify-between items-center">
        <div className="flex items-center">
          <div className="flex items-center justify-center w-10 h-10 bg-white/20 rounded-lg mr-4">
            <Wifi className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">CIABRASNET</h1>
            <p className="text-sm text-blue-100">Analisador de Contratos</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="text-white hover:bg-white/20"
          >
            {theme === 'light' ? (
              <Moon className="h-4 w-4" />
            ) : (
              <Sun className="h-4 w-4" />
            )}
          </Button>
          
          <Button
            variant="outline"
            onClick={handleSignOut}
            className="bg-white/20 border-white/30 text-white hover:bg-white/30"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sair
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
