import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Home, MessageSquare, Eye, User, CreditCard, Settings } from 'lucide-react';
import SafeIcon from '../common/SafeIcon';
import { useAuthStore } from '../../store/authStore';

const MobileNavigation = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const { user, subscription } = useAuthStore();

  const navigation = [
    { name: t('home'), href: '/', icon: Home },
    { name: t('chat'), href: '/chat', icon: MessageSquare },
    { name: t('shadowWork'), href: '/shadow-work/1', icon: Eye },
    { name: t('profile'), href: '/profile', icon: User },
    { name: t('subscription'), href: '/subscription', icon: CreditCard },
  ];

  if (user?.role === 'admin') {
    navigation.push({ name: t('admin'), href: '/admin', icon: Settings });
  }

  return (
    <motion.div
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="liquid-glass fixed bottom-4 left-4 right-4 h-16 rounded-2xl border border-white/20 shadow-lg z-50 md:hidden"
    >
      <div className="flex justify-around items-center h-full">
        {navigation.map((item) => {
          const isActive = item.href === '/' 
            ? location.pathname === item.href 
            : location.pathname.startsWith(item.href);
            
          return (
            <Link
              key={item.name}
              to={item.href}
              className="flex flex-col items-center justify-center w-full h-full relative"
            >
              <div className={`relative transition-colors duration-300 ${isActive ? 'text-primary-600' : 'text-neutral-500'}`}>
                <SafeIcon icon={item.icon} className="w-6 h-6" />
                
                {item.href === '/chat' && subscription.minutesRemaining > 0 && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-background"></span>
                )}
                
                {isActive && (
                  <motion.div
                    layoutId="mobileActiveTab"
                    className="absolute -bottom-2 w-8 h-1 bg-primary rounded-full"
                    initial={false}
                    animate={{}}
                  />
                )}
              </div>
              <span className={`text-xs mt-1 font-medium transition-colors duration-300 ${isActive ? 'text-primary-600' : 'text-neutral-500'}`}>
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
