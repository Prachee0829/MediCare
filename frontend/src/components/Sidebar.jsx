import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Calendar, 
  FileText, 
  Users, 
  Package,
  BarChart3,
  History,
  Settings,
  Heart,
  ChevronLeft,
  ChevronRight,
  UserRound,
  CheckCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useGlobal } from '../context/GlobalContext.jsx';

const Sidebar = () => {
  const { user } = useAuth();
  const { sidebarOpen, setSidebarOpen } = useGlobal();

  const getMenuItems = () => {
    const baseItems = [
      { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard }
    ];

    switch (user?.role) {
      case 'admin':
        return [
          ...baseItems,
          { path: '/admin/users', label: 'User Management', icon: Users },
          { path: '/admin/approval-requests', label: 'Approval Requests', icon: CheckCircle },
          { path: '/patients', label: 'Patients', icon: UserRound },
          { path: '/doctors', label: 'Doctors', icon: Users },
          { path: '/pharmacists', label: 'Pharmacists', icon: Users },
          { path: '/reports', label: 'Reports', icon: BarChart3 },
          { path: '/inventory', label: 'Inventory', icon: Package },
        ];
      case 'doctor':
        return [
          ...baseItems,
          { path: '/appointments', label: 'Appointments', icon: Calendar },
          { path: '/calendar', label: 'My Schedule', icon: Calendar },
          { path: '/patients', label: 'Patients', icon: UserRound },
          { path: '/pharmacists', label: 'Pharmacists', icon: Users },
          { path: '/prescriptions', label: 'Prescriptions', icon: FileText },
        ];
      case 'patient':
        return [
          ...baseItems,
          { path: '/appointments', label: 'Book Appointment', icon: Calendar },
          { path: '/history', label: 'My Prescriptions', icon: History },
        ];
      case 'pharmacist':
        return [
          ...baseItems,
          { path: '/prescriptions', label: 'Prescriptions', icon: FileText },
          { path: '/inventory', label: 'Inventory', icon: Package },
        ];
      default:
        return baseItems;
    }
  };

  const menuItems = getMenuItems();

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed left-0 top-0 z-50 h-full bg-white shadow-xl transform transition-transform duration-300 ease-in-out ${
        sidebarOpen ? 'translate-x-0 w-64' : '-translate-x-full lg:translate-x-0 lg:w-20'
      } lg:relative lg:transform-none`}>
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className={`flex items-center space-x-3 ${sidebarOpen ? '' : 'lg:justify-center'}`}>
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-green-500 rounded-lg flex items-center justify-center">
              <Heart className="w-5 h-5 text-white" />
            </div>
            {sidebarOpen && (
              <span className="text-xl font-bold text-gray-800">MediCare</span>
            )}
          </div>
          
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="hidden lg:block p-1 rounded-lg hover:bg-gray-100 transition-colors"
          >
            {sidebarOpen ? (
              <ChevronLeft className="w-4 h-4 text-gray-600" />
            ) : (
              <ChevronRight className="w-4 h-4 text-gray-600" />
            )}
          </button>
        </div>

        {/* Navigation */}
        <nav className="mt-6 px-3">
          <ul className="space-y-2">
            {menuItems.map((item) => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center px-3 py-3 rounded-xl transition-all duration-200 group ${
                      isActive
                        ? 'bg-gradient-to-r from-blue-500 to-green-500 text-white shadow-lg'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800'
                    }`
                  }
                >
                  <item.icon className={`w-5 h-5 ${sidebarOpen ? 'mr-3' : 'mx-auto'}`} />
                  {sidebarOpen && (
                    <span className="font-medium">{item.label}</span>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* Footer */}
        <div className="absolute bottom-6 left-0 right-0 px-6">
          <NavLink
            to="/settings"
            className={({ isActive }) =>
              `flex items-center px-3 py-3 rounded-xl transition-all duration-200 group ${sidebarOpen ? 'space-x-3' : 'justify-center'} ${
                isActive
                  ? 'bg-gradient-to-r from-blue-500 to-green-500 text-white shadow-lg'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800'
              }`
            }
          >
            <Settings className={`w-5 h-5 ${sidebarOpen ? 'mr-3' : 'mx-auto'}`} />
            {sidebarOpen && (
              <span className="font-medium">Settings</span>
            )}
          </NavLink>
        </div>
      </div>
    </>
  );
};

export default Sidebar;