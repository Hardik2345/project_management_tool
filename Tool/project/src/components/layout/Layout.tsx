import React from 'react';
import { useApp } from '../../contexts/AppContext';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { NotLoggedIn } from '../ui/NotLoggedIn';

export function Layout() {
  const { state: { currentUser } } = useApp();
  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <div className="lg:pl-64">
        <Header />
        <main className="py-6">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {!currentUser ? <NotLoggedIn /> : <Outlet />}
          </div>
        </main>
      </div>
    </div>
  );
}