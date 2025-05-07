import React from 'react';
import Sidebar from './Sidebar';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="flex">
      {/* Sidebar */}
      <Sidebar />

      {/* Main content area */}
      <main className="flex-1 ml-64 p-6">
        {children}
      </main>
    </div>
  );
};

export default Layout;