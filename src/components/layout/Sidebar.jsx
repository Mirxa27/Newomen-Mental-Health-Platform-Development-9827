import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import { useAuthStore } from '../../store/authStore';

const { FiHome, FiMessageCircle, FiEye, FiUser, FiCreditCard, FiSettings } = FiIcons;

const Sidebar = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const { user, subscription } = useAuthStore();

  const navigation = [
    { name: t('home'), href: '/', icon: FiHome },
    { name: t('chat'), href: '/chat', icon: FiMessageCircle },
    { name: t('shadowWork'), href: '/shadow-work/1', icon: FiEye },
    { name: t('profile'), href: '/profile', icon: FiUser },
    { name: t('subscription'), href: '/subscription', icon: FiCreditCard },
  ];

  if (user?.role === 'admin') {
    navigation.push({ name: t('admin'), href: '/admin', icon: FiSettings });
  }

  return (
    <div className="fixed left-0 top-16 h-full w-64 bg-white/80 backdrop-blur-lg border-r border-gray-200 z-40">
      <div className="p-4">
        {/* Subscription Status */}
        <div className="bg-gradient-to-r from-primary-500 to-secondary-500 rounded-lg p-4 mb-6 text-white">
          <div className="text-sm font-medium capitalize">{subscription.tier} Tier</div>
          <div className="text-2xl font-bold">{subscription.minutesRemaining}</div>
          <div className="text-xs opacity-90">minutes remaining</div>
        </div>

        {/* Navigation */}
        <nav className="space-y-2">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`
                  group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors
                  ${isActive 
                    ? 'bg-primary-50 text-primary-600 border-r-2 border-primary-500' 
                    : 'text-gray-700 hover:bg-gray-50 hover:text-primary-600'
                  }
                `}
              >
                <SafeIcon 
                  icon={item.icon} 
                  className={`
                    w-5 h-5 mr-3 transition-colors
                    ${isActive ? 'text-primary-600' : 'text-gray-400 group-hover:text-primary-600'}
                  `} 
                />
                {item.name}
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute left-0 w-1 h-8 bg-primary-500 rounded-r-full"
                  />
                )}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
};

export default Sidebar;