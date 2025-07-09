import React from 'react';
import { Link } from 'react-router-dom';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import { useAuthStore } from '../../store/authStore';
import AdminLogo from '../admin/AdminLogo';

const { FiMenu, FiBell, FiUser, FiLogOut } = FiIcons;

const AdminHeader = ({ toggleSidebar }) => {
  const { user, logout } = useAuthStore();

  return (
    <header className="glass-nav-scrolled sticky top-0 z-50">
      <div className="flex items-center justify-between h-16 px-4 md:px-6">
        <div className="flex items-center">
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
          >
            <SafeIcon icon={FiMenu} className="w-5 h-5" />
          </button>
          
          <Link to="/admin" className="ml-3">
            <AdminLogo />
          </Link>
        </div>
        
        <div className="flex items-center space-x-4">
          <button className="p-2 rounded-full hover:bg-white/10 relative transition-colors">
            <SafeIcon icon={FiBell} className="w-5 h-5 text-white/70" />
            <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
          
          <div className="relative group">
            <div className="flex items-center space-x-2 p-2 rounded-lg cursor-pointer hover:bg-white/10 transition-colors">
              <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">{user?.name?.charAt(0) || 'A'}</span>
              </div>
              <div className="hidden md:block">
                <p className="text-sm font-medium text-white">{user?.name}</p>
                <p className="text-xs text-white/70">Administrator</p>
              </div>
            </div>
            
            <div className="hidden group-hover:block absolute right-0 mt-1 w-48 glass-modal rounded-lg shadow-lg py-1 z-50">
              <Link
                to="/profile"
                className="block px-4 py-2 text-sm text-white hover:bg-white/10 transition-colors"
              >
                Your Profile
              </Link>
              <Link
                to="/"
                className="block px-4 py-2 text-sm text-white hover:bg-white/10 transition-colors"
              >
                User View
              </Link>
              <hr className="my-1 border-white/10" />
              <button
                onClick={logout}
                className="block w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
              >
                <div className="flex items-center space-x-2">
                  <SafeIcon icon={FiLogOut} className="w-4 h-4" />
                  <span>Logout</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;