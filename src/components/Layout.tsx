
import React, { Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import Breadcrumbs from './Breadcrumbs';
import { LoadingSkeleton } from './ui/loading-skeleton';

const Layout = () => {
  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">
          <Breadcrumbs />
          <Suspense fallback={
            <div className="space-y-6">
              <LoadingSkeleton lines={5} />
            </div>
          }>
            <Outlet />
          </Suspense>
        </main>
      </div>
    </div>
  );
};

export default Layout;
