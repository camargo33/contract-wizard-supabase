
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

const Breadcrumbs = () => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  const breadcrumbNameMap: { [key: string]: string } = {
    upload: 'Upload',
    historico: 'Histórico',
    relatorios: 'Relatórios',
    configuracoes: 'Configurações',
    auth: 'Autenticação'
  };

  if (pathnames.length === 0) return null;

  return (
    <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-6 p-4 bg-white rounded-lg border border-gray-200">
      <Link
        to="/"
        className="flex items-center space-x-1 hover:text-[var(--primary-blue)] transition-colors"
      >
        <Home className="h-4 w-4" />
        <span>Início</span>
      </Link>
      
      {pathnames.map((name, index) => {
        const routeTo = `/${pathnames.slice(0, index + 1).join('/')}`;
        const isLast = index === pathnames.length - 1;
        const displayName = breadcrumbNameMap[name] || name;

        return (
          <React.Fragment key={name}>
            <ChevronRight className="h-4 w-4 text-gray-400" />
            {isLast ? (
              <span className="font-medium text-[var(--primary-blue)]">
                {displayName}
              </span>
            ) : (
              <Link
                to={routeTo}
                className="hover:text-[var(--primary-blue)] transition-colors"
              >
                {displayName}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};

export default Breadcrumbs;
