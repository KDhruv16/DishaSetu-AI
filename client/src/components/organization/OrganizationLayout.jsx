import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Building2, Briefcase, Users, MessageSquare, Settings, LogOut, Menu, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const OrganizationLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const navigation = [
    { name: 'Dashboard', href: '/organization', icon: LayoutDashboard },
    { name: 'Organization Profile', href: '/organization/profile', icon: Building2 },
    { name: 'Opportunities', href: '/organization/opportunities', icon: Briefcase },
    { name: 'Applications', href: '/organization/applications', icon: Users },
    { name: 'Interviews', href: '/organization/interviews', icon: MessageSquare, disabled: true },
    { name: 'Settings', href: '/organization/settings', icon: Settings, disabled: true },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile sidebar overlay */}
      <div 
        className={`fixed inset-0 bg-gray-900/80 z-40 lg:hidden transition-opacity ${
          isSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsSidebarOpen(false)}
      />

      {/* Sidebar */}
      <div 
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:block ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex h-16 shrink-0 items-center px-6 border-b border-gray-200">
            <span className="text-xl font-bold text-primary">DishaSetu AI</span>
            <span className="ml-2 px-2 py-0.5 text-xs font-semibold bg-primary/10 text-primary rounded-full">ORG</span>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
            {navigation.map((item) => (
              <NavLink
                key={item.name}
                to={item.disabled ? '#' : item.href}
                className={({ isActive }) => `
                  group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors
                  ${item.disabled ? 'opacity-50 cursor-not-allowed text-gray-500' : ''}
                  ${isActive && !item.disabled
                    ? 'bg-primary/10 text-primary'
                    : !item.disabled ? 'text-gray-700 hover:bg-gray-100 hover:text-gray-900' : ''
                  }
                `}
                onClick={(e) => {
                  if (item.disabled) e.preventDefault();
                  if (!item.disabled && window.innerWidth < 1024) {
                    setIsSidebarOpen(false);
                  }
                }}
              >
                <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
                {item.name}
                {item.disabled && <span className="ml-auto text-[10px] uppercase bg-gray-200 text-gray-600 px-2 py-0.5 rounded">Soon</span>}
              </NavLink>
            ))}
          </nav>

          {/* User & Logout */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center mb-4 px-3">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user?.name}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {user?.email}
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-3 py-2 text-sm font-medium text-red-600 rounded-lg hover:bg-red-50 transition-colors"
            >
              <LogOut className="mr-3 h-5 w-5" />
              Sign Out
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile header */}
        <div className="lg:hidden flex items-center justify-between h-16 px-4 bg-white border-b border-gray-200">
          <div className="flex items-center">
            <span className="text-xl font-bold text-primary">DishaSetu AI</span>
            <span className="ml-2 px-2 py-0.5 text-xs font-semibold bg-primary/10 text-primary rounded-full">ORG</span>
          </div>
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 text-gray-500 hover:text-gray-700 focus:outline-none"
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>

        {/* Content area */}
        <main className="flex-1 overflow-y-auto focus:outline-none p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
