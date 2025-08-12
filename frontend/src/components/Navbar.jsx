import React from 'react';
import { Menu, Search, User, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useGlobal } from '../context/GlobalContext.jsx';
import RoleBadge from './RoleBadge.jsx';
import { useNavigate } from 'react-router-dom';
import NotificationComponent from './NotificationComponent.jsx';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { sidebarOpen, setSidebarOpen } = useGlobal();
  const navigate = useNavigate();

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
          
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search..."
              className="pl-10 pr-4 py-2 w-80 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
            />
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <NotificationComponent />

          <div className="flex items-center space-x-3 border-l border-gray-200 pl-4">
            <div 
              className="w-8 h-8 bg-gradient-to-r from-blue-500 to-green-500 rounded-full flex items-center justify-center cursor-pointer hover:shadow-md transition-all"
              onClick={() => navigate('/settings')}
              title="Profile Settings"
            >
              <User className="w-4 h-4 text-white" />
            </div>
            <div className="hidden md:block">
              <p className="text-sm font-medium text-gray-800">{user?.name}</p>
              <div className="flex items-center space-x-2">
                {user?.role === 'doctor' && user?.specialization ? (
                  <p className="text-xs text-blue-600">{user.specialization}</p>
                ) : (
                  <RoleBadge role={user?.role || 'patient'} />
                )}
              </div>
            </div>
            <button
              onClick={logout}
              className="p-2 rounded-lg hover:bg-red-50 text-red-600 transition-colors"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;