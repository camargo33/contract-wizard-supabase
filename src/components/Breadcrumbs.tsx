
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

const routeNames: Record<string, string> = {
  '/': 'Início',
  '/upload': 'Upload de Contratos',
  '/historico': 'Histórico de Análises',
  '/relatorios': 'Relatórios',
  '/configuracoes': 'Configurações',
};

const Breadcrumbs = () => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  if (location.pathname === '/') return null;

  return (
    <div className="mb-6">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to="/" className="flex items-center text-[var(--primary-blue)] hover:text-[var(--primary-dark)]">
                <Home className="h-4 w-4 mr-1" />
                Início
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          
          {pathnames.map((pathname, index) => {
            const routeTo = `/${pathnames.slice(0, index + 1).join('/')}`;
            const isLast = index === pathnames.length - 1;
            const routeName = routeNames[routeTo] || pathname;

            return (
              <React.Fragment key={routeTo}>
                <BreadcrumbSeparator>
                  <ChevronRight className="h-4 w-4" />
                </BreadcrumbSeparator>
                <BreadcrumbItem>
                  {isLast ? (
                    <BreadcrumbPage className="text-[var(--neutral-gray)] font-medium">
                      {routeName}
                    </BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink asChild>
                      <Link 
                        to={routeTo}
                        className="text-[var(--primary-blue)] hover:text-[var(--primary-dark)]"
                      >
                        {routeName}
                      </Link>
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
              </React.Fragment>
            );
          })}
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  );
};

export default Breadcrumbs;
