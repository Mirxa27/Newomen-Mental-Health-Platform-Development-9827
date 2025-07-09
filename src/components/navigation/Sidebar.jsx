import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Home, MessageSquare, Eye, User, CreditCard, Settings, Wind, Target, Users } from 'lucide-react';
import SafeIcon from '../common/SafeIcon.jsx';
import { useAuthStore } from '../../store/authStore';
import { useGamificationStore } from '../../store/gamificationStore';
import GamificationProgress from '../gamification/GamificationProgress';

const Sidebar = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const { user, subscription } = useAuthStore();
  const { isFeatureUnlocked } = useGamificationStore();

  const navigation = [
    { name: t('home'), href: '/', icon: Home },
    { name: t('chat'), href: '/chat', icon: MessageSquare },
    { name: t('shadowWork'), href: '/shadow-work/1', icon: Eye },
    { 
      name: 'Breathing Library', 
      href: '/breathing', 
      icon: Wind,
      locked: !isFeatureUnlocked('breathing-library')
    },
    { 
      name: 'Diagnostic Tests', 
      href: '/onboarding/balance-wheel', 
      icon: Target,
      locked: !isFeatureUnlocked('diagnostic-tests')
    },
    { 
      name: 'Community', 
      href: '/community', 
      icon: Users,
      locked: !isFeatureUnlocked('community-search')
    },
    { name: t('profile'), href: '/profile', icon: User },
    { name: t('subscription'), href: '/subscription', icon: CreditCard },
  ];

  if (user?.role === 'admin') {
    navigation.push({ name: t('admin'), href: '/admin', icon: Settings });
  }

  return (
    <aside className="hidden md:block fixed left-0 top-16 h-[calc(100vh-64px)] w-64 liquid-glass border-r border-white/20 z-40">
      <div className="h-full flex flex-col justify-between p-4">
        <div>
          {/* Gamification Progress */}
          <div className="mb-6">
            <GamificationProgress />
          </div>

          {/* Subscription Status */}
          <div className="bg-gradient-to-r from-primary-500 to-secondary-500 rounded-lg p-4 mb-6 text-white">
            <div className="text-sm font-medium capitalize">{subscription.tier} Tier</div>
            <div className="text-2xl font-bold">{subscription.minutesRemaining}</div>
            <div className="text-xs opacity-90">minutes remaining</div>
          </div>

          {/* Navigation */}
          <nav className="space-y-2">
            {navigation.map((item) => {
              const isActive = 
                item.href === '/' 
                  ? location.pathname === item.href 
                  : location.pathname.startsWith(item.href);
              
              return (
                <Link
                  key={item.name}
                  to={item.locked ? '#' : item.href}
                  className={`
                    group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors relative
                    ${item.locked 
                      ? 'text-gray-400 cursor-not-allowed opacity-60'
                      : isActive 
                        ? 'bg-primary-50 text-primary-600' 
                        : 'text-gray-700 hover:bg-gray-50 hover:text-primary-600'
                    }
                  `}
                  onClick={(e) => item.locked && e.preventDefault()}
                >
                  <SafeIcon
                    icon={item.icon}
                    className={`
                      w-5 h-5 mr-3 transition-colors
                      ${item.locked
                        ? 'text-gray-400'
                        : isActive 
                          ? 'text-primary-600' 
                          : 'text-gray-400 group-hover:text-primary-600'
                      }
                    `}
                  />
                  {item.name}
                  {item.locked && (
                    <span className="ml-auto text-xs text-yellow-600">🔒</span>
                  )}
                  {!item.locked && isActive && (
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
        
        {/* Footer */}
        <div className="mt-auto pt-6 border-t border-gray-200">
          <div className="text-xs text-gray-500 mb-2">
            © {new Date().getFullYear()} Newomen
          </div>
          <div className="flex space-x-2">
            <a 
              href="/terms" 
              className="text-xs text-gray-500 hover:text-primary-600"
              target="_blank"
              rel="noopener noreferrer"
            >
              Terms
            </a>
            <span className="text-gray-300">|</span>
            <a 
              href="/privacy" 
              className="text-xs text-gray-500 hover:text-primary-600"
              target="_blank"
              rel="noopener noreferrer"
            >
              Privacy
            </a>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
