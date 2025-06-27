
import React from 'react';
import { NavLink } from 'react-router-dom';
import { Upload, History, BarChart3, Settings, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';

const navigationItems = [
  {
    name: 'Upload',
    href: '/upload',
    icon: Upload,
  },
  {
    name: 'Histórico',
    href: '/historico',
    icon: History,
  },
  {
    name: 'Relatórios',
    href: '/relatorios',
    icon: BarChart3,
  },
  {
    name: 'Configurações',
    href: '/configuracoes',
    icon: Settings,
  },
];

const Sidebar = () => {
  return (
    <div className="bg-slate-900 text-white w-64 min-h-screen p-4">
      <div className="flex items-center mb-8">
        <FileText className="h-8 w-8 text-blue-400 mr-3" />
        <h1 className="text-xl font-semibold">Analisador de Contratos</h1>
      </div>
      
      <nav className="space-y-2">
        {navigationItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            className={({ isActive }) =>
              cn(
                'flex items-center px-4 py-3 rounded-lg transition-colors',
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              )
            }
          >
            <item.icon className="h-5 w-5 mr-3" />
            {item.name}
          </NavLink>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;
