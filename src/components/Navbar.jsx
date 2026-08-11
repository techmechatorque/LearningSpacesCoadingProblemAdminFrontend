import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Code2, LogOut, LayoutDashboard, User as UserIcon } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');

  return (
    <nav className="sticky top-0 z-50 border-b border-dark-border bg-dark-bg/85 backdrop-blur-md px-6 py-3">
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        {/* Logo / Branding */}
        <Link to="/" className="flex items-center space-x-2 text-xl font-bold tracking-tight text-white hover:text-brand-primary transition-colors">
          <Code2 className="h-6 w-6 text-brand-primary animate-pulse" />
          <span className="font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-neutral-200 to-brand-primary">
            CodeSpaces Admin
          </span>
        </Link>

        {/* Navigation Items */}
        <div className="flex items-center space-x-6">
          {user && (
            <Link
              to="/admin"
              className={`flex items-center space-x-1.5 text-sm font-medium transition-colors ${
                location.pathname.startsWith('/admin') ? 'text-brand-primary' : 'text-dark-muted hover:text-white'
              }`}
            >
              <LayoutDashboard className="h-4 w-4" />
              <span>Admin Panel</span>
            </Link>
          )}
        </div>

        {/* User Actions */}
        <div className="flex items-center space-x-4">
          {user ? (
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 rounded-full bg-dark-hover px-3 py-1.5 border border-dark-border">
                <UserIcon className="h-4 w-4 text-brand-primary" />
                <span className="text-sm font-medium text-dark-text max-w-[120px] truncate">{user.name}</span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-1 text-sm font-medium text-dark-muted hover:text-brand-danger transition-colors bg-transparent border-0 hover:cursor-pointer"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-3">
              <Link
                to="/login"
                className="text-sm font-medium text-dark-muted hover:text-white transition-colors"
              >
                Sign In
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
