import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import { useAuthStore } from '../../store/authStore';

const { FiHome, FiMessageCircle, FiEye, FiUser, FiCreditCard, FiSettings } = FiIcons;

const MobileNavigation = () => {
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
    <motion.div
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      className="liquid-glass fixed bottom-0 left-0 right-0 border-t border-white/20 shadow-glass z-50 md:hidden safe-area-bottom"
    >
      <div className="flex justify-around items-center h-16">
        {navigation.map((item) => {
          const isActive = item.href === '/' 
            ? location.pathname === item.href 
            : location.pathname.startsWith(item.href);
            
          return (
            <Link
              key={item.name}
              to={item.href}
              className="flex flex-col items-center justify-center w-full h-full"
            >
              <div className={`relative ${isActive ? 'text-primary-600' : 'text-gray-500'}`}>
                <SafeIcon icon={item.icon} className="w-5 h-5" />
                
                {/* Special indicator for Chat when there are minutes left */}
                {item.href === '/chat' && subscription.minutesRemaining > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 w-2 h-2 bg-green-500 rounded-full"></span>
                )}
                
                {/* Active indicator */}
                {isActive && (
                  <motion.div
                    layoutId="mobileActiveTab"
                    className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-primary-600 rounded-full"
                  />
                )}
              </div>
              <span className={`text-xs mt-1 ${isActive ? 'text-primary-600 font-medium' : 'text-gray-500'}`}>
                {item.name}
              </span>
            </Link>
          );
        })}
      </div>
    </motion.div>
  );
};

export default MobileNavigation;
