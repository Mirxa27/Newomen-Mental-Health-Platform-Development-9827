import React from 'react';
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FiHome, FiMessageCircle, FiUser, FiHeart, FiWind } from 'react-icons/fi';
import { useAuthStore } from '../../store/authStore';
import { useChatStore } from '../../store/chatStore';

const Navbar = () => {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuthStore();
  const { conversations } = useChatStore();

  const navItems = [
    { id: 'home', label: t('home'), path: '/', icon: FiHome },
    { id: 'chat', label: t('chat'), path: '/chat', icon: FiMessageCircle, requiresAuth: true, badge: conversations?.length || 0 },
    { id: 'shadowWork', label: t('shadowWork'), path: '/shadow-work/1', icon: FiHeart, requiresAuth: true },
    { id: 'breathing', label: t('breathing'), path: '/breathing', icon: FiWind, requiresAuth: true },
    { id: 'profile', label: t('profile'), path: '/profile', icon: FiUser, requiresAuth: true },
  ];

  const filteredNavItems = navItems.filter(item => !item.requiresAuth || isAuthenticated);

  return (
    <nav className="flex space-x-4">
      {filteredNavItems.map(item => (
        <NavLink
          key={item.id}
          to={item.path}
          className={({ isActive }) =>
            `flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              isActive 
                ? 'bg-white/10 text-white' 
                : 'text-gray-300 hover:bg-white/5 hover:text-white'
            }`
          }
        >
          <item.icon className="w-4 h-4" />
          <span>{item.label}</span>
          {item.badge > 0 && (
            <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {item.badge > 9 ? '9+' : item.badge}
            </span>
          )}
        </NavLink>
      ))}
    </nav>
  );
};

export default Navbar;
