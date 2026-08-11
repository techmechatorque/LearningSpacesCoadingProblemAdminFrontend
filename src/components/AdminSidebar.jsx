import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, PlusCircle, ListTodo, LogOut, Code2, AlertTriangle, Trophy } from 'lucide-react';

const AdminSidebar = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');

  const menuItems = [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { name: 'Setters', path: '/admin/setters', icon: PlusCircle },
    { name: 'Approvals', path: '/admin/approvals', icon: ListTodo },
    { name: 'Problems', path: '/admin/problems', icon: Code2 },
    { name: 'Contests', path: '/admin/contests', icon: Trophy },
    { name: 'Issues', path: '/admin/issues', icon: AlertTriangle }
  ];

  return (
    <div className="w-64 bg-dark-card border-r border-dark-border h-full flex flex-col justify-between shrink-0">
      <div className="flex-1 py-6 space-y-6">
        {/* Header */}
        <div className="px-6 flex items-center space-x-2 text-brand-primary">
          <Code2 className="h-6 w-6 animate-pulse" />
          <span className="font-extrabold text-white text-lg tracking-tight">Admin Console</span>
        </div>

        {/* Navigation links */}
        <nav className="px-3 space-y-1.5">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  isActive(item.path)
                    ? 'bg-brand-primary/10 text-brand-primary font-semibold border border-brand-primary/20 shadow-md'
                    : 'text-dark-text hover:bg-dark-hover border border-transparent'
                }`}
              >
                <Icon className="h-4.5 w-4.5" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Logout button */}
      <div className="p-4 border-t border-dark-border bg-dark-bg/15">
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-brand-danger hover:bg-brand-danger/10 border border-brand-danger/20 hover:border-brand-danger/40 transition-all hover:cursor-pointer"
        >
          <LogOut className="h-4 w-4" />
          <span>Logout System</span>
        </button>
      </div>
    </div>
  );
};

export default AdminSidebar;
