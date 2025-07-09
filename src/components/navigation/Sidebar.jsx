import React from 'react';
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  FiHome, 
  FiMessageCircle, 
  FiUser, 
  FiHeart, 
  FiWind,
  FiSearch,
  FiSettings,
  FiCreditCard
} from 'react-icons/fi';
import { useAuthStore } from '../../store/authStore';
import { useChatStore } from '../../store/chatStore';

const Sidebar = () => {
  const { t } = useTranslation();
  const { isAuthenticated, user } = useAuthStore();
  const { conversations } = useChatStore();

  const sidebarItems = [
    { id: 'home', label: t('home'), path: '/', icon: FiHome },
    { id: 'chat', label: t('chat'), path: '/chat', icon: FiMessageCircle, requiresAuth: true, badge: conversations?.length || 0 },
    { id: 'shadowWork', label: t('shadowWork'), path: '/shadow-work/1', icon: FiHeart, requiresAuth: true },
    { id: 'breathing', label: t('breathing'), path: '/breathing', icon: FiWind, requiresAuth: true },
    { id: 'search', label: t('search'), path: '/search', icon: FiSearch, requiresAuth: true },
    { id: 'profile', label: t('profile'), path: '/profile', icon: FiUser, requiresAuth: true },
    { id: 'subscription', label: t('subscription'), path: '/subscription', icon: FiCreditCard, requiresAuth: true },
    { id: 'settings', label: t('settings'), path: '/settings', icon: FiSettings, requiresAuth: true },
  ];

  const filteredItems = sidebarItems.filter(item => !item.requiresAuth || isAuthenticated);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <aside className="w-64 glass-sidebar backdrop-blur-xl border-r border-white/10">
      <div className="flex flex-col h-full">
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center space-x-3">
            <img 
              className="h-12 w-12 rounded-full border-2 border-white/20" 
              src={user?.avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${user?.email}`} 
              alt={user?.name} 
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{user?.name}</p>
              <p className="text-xs text-gray-400 truncate">{user?.email}</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {filteredItems.map(item => (
            <NavLink
              key={item.id}
              to={item.path}
              className={({ isActive }) =>
                `group flex items-center px-3 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                  isActive 
                    ? 'bg-white/20 text-white shadow-lg' 
                    : 'text-gray-300 hover:bg-white/10 hover:text-white'
                }`
              }
            >
              <item.icon className="w-5 h-5 mr-3" />
              <span className="flex-1">{item.label}</span>
              {item.badge > 0 && (
                <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center ml-2">
                  {item.badge > 9 ? '9+' : item.badge}
                </span>
              )}
            </NavLink>
          ))}
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;
