import React from 'react';
import { useGlobal } from '../context/GlobalContext.jsx';
import Navbar from './Navbar.jsx';
import Sidebar from './Sidebar.jsx';

const Layout = ({ children }) => {
  const { sidebarOpen } = useGlobal();

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar />
        <main className={`flex-1 overflow-y-auto transition-all duration-300 ${
          sidebarOpen ? 'lg:ml-64' : 'lg:ml-20'
        }`}>
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;