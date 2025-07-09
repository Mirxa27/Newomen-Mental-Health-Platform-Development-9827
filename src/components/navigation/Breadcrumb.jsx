import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ChevronRightIcon, HomeIcon } from '@heroicons/react/24/outline';

const Breadcrumb = ({ className = '' }) => {
  const location = useLocation();
  const { t } = useTranslation();
  
  const pathSegments = location.pathname.split('/').filter(Boolean);
  
  if (pathSegments.length === 0) {
    return null;
  }

  const breadcrumbItems = [
    { name: t('breadcrumb.home'), href: '/', current: false }
  ];

  let currentPath = '';
  
  pathSegments.forEach((segment, index) => {
    currentPath += `/${segment}`;
    const isLast = index === pathSegments.length - 1;
    
    let name = segment;
    
    switch (segment) {
      case 'about':
        name = t('breadcrumb.about');
        break;
      case 'chat':
        name = t('breadcrumb.chat');
        break;
      case 'shadow-work':
        name = t('breadcrumb.shadowWork');
        break;
      case 'profile':
        name = t('breadcrumb.profile');
        break;
      case 'breathing':
        name = t('breadcrumb.breathing');
        break;
      case 'search':
        name = t('breadcrumb.search');
        break;
      case 'personality-test':
        name = t('breadcrumb.personalityTest');
        break;
      case 'subscription':
        name = t('breadcrumb.subscription');
        break;
      case 'settings':
        name = t('breadcrumb.settings');
        break;
      case 'new-me':
        name = t('breadcrumb.newMe');
        break;
      case 'auth':
        name = t('breadcrumb.auth');
        break;
      case 'login':
        name = t('breadcrumb.login');
        break;
      case 'register':
        name = t('breadcrumb.register');
        break;
      case 'forgot-password':
        name = t('breadcrumb.forgotPassword');
        break;
      case 'admin':
        name = t('breadcrumb.admin');
        break;
      case 'realtime':
        name = t('breadcrumb.realtime');
        break;
      case 'users':
        name = t('breadcrumb.users');
        break;
      case 'conversations':
        name = t('breadcrumb.conversations');
        break;
      case 'prompts':
        name = t('breadcrumb.prompts');
        break;
      case 'analytics':
        name = t('breadcrumb.analytics');
        break;
      case 'ai-providers':
        name = t('breadcrumb.aiProviders');
        break;
      case 'branding':
        name = t('breadcrumb.branding');
        break;
      case 'therapeutic-agents':
        name = t('breadcrumb.therapeuticAgents');
        break;
      default:
        name = segment.charAt(0).toUpperCase() + segment.slice(1);
    }
    
    breadcrumbItems.push({
      name,
      href: currentPath,
      current: isLast
    });
  });

  return (
    <nav 
      className={`flex ${className}`} 
      aria-label={t('breadcrumb.navigation')}
    >
      <ol className="flex items-center space-x-2">
        {breadcrumbItems.map((item, index) => (
          <li key={item.href} className="flex items-center">
            {index > 0 && (
              <ChevronRightIcon 
                className="h-4 w-4 text-gray-400 mx-2" 
                aria-hidden="true" 
              />
            )}
            
            {item.current ? (
              <span className="text-gray-600 font-medium text-sm">
                {index === 0 && (
                  <HomeIcon className="h-4 w-4 inline mr-1" />
                )}
                {item.name}
              </span>
            ) : (
              <Link
                to={item.href}
                className="text-blue-600 hover:text-blue-800 transition-colors duration-200 text-sm font-medium"
              >
                {index === 0 && (
                  <HomeIcon className="h-4 w-4 inline mr-1" />
                )}
                {item.name}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default Breadcrumb;