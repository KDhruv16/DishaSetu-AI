import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from '../common/Sidebar';

export const AppLayout = () => {
  return (
    <div className="flex min-h-screen bg-[#fafcff]">
      {/* Sidebar for desktop & mobile bottom nav */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 pb-16 lg:pb-0">
        <Outlet />
      </div>
    </div>
  );
};
