
import React from 'react';
import { NavLink } from 'react-router-dom';
import { Upload, History, BarChart3, Settings, Wifi, Network } from 'lucide-react';
import { cn } from '@/lib/utils';

const navigationItems = [
  {
    name: 'Upload',
    href: '/upload',
    icon: Upload,
    description: 'Analisar contratos'
  },
  {
    name: 'Histórico',
    href: '/historico',
    icon: History,
    description: 'Análises anteriores'
  },
  {
    name: 'Relatórios',
    href: '/relatorios',
    icon: BarChart3,
    description: 'Estatísticas'
  },
  {
    name: 'Configurações',
    href: '/configuracoes',
    icon: Settings,
    description: 'Modelos e config'
  },
];

const Sidebar = () => {
  return (
    <aside className="bg-[var(--primary-dark)] text-white w-64 min-h-screen shadow-xl">
      <div className="p-6">
        <div className="flex items-center mb-8">
          <div className="flex items-center justify-center w-10 h-10 bg-[var(--accent-orange)] rounded-lg mr-3">
            <Network className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Sistema</h2>
            <p className="text-xs text-blue-200">Análise Inteligente</p>
          </div>
        </div>
        
        <nav className="space-y-2">
          {navigationItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              className={({ isActive }) =>
                cn(
                  'flex items-center px-4 py-3 rounded-lg transition-all duration-300 group',
                  isActive
                    ? 'bg-[var(--accent-orange)] text-white shadow-lg'
                    : 'text-blue-100 hover:bg-white/10 hover:text-white'
                )
              }
            >
              <item.icon className="h-5 w-5 mr-3 transition-transform duration-300 group-hover:scale-110" />
              <div>
                <div className="font-medium">{item.name}</div>
                <div className="text-xs opacity-80">{item.description}</div>
              </div>
            </NavLink>
          ))}
        </nav>
      </div>
      
      <div className="absolute bottom-0 left-0 right-0 p-6">
        <div className="flex items-center justify-center p-4 bg-white/10 rounded-lg">
          <Wifi className="h-5 w-5 mr-2 text-blue-200" />
          <span className="text-sm text-blue-200">Sistema Online</span>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
