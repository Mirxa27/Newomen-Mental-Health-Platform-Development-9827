
import React from 'react';
import { motion } from 'framer-motion';
import { useAIProviderStore } from '../../store/aiProviderStore';

const NewomenLogo = ({ size = 'md', className = '', showText = true }) => {
  const { settings } = useAIProviderStore();
  
  const customLogo = settings?.brandingSettings?.logoUrl;
  const brandName = settings?.brandingSettings?.brandName || 'Newomen';

  const sizeClasses = {
    xs: 'w-6 h-6',
    sm: 'w-8 h-8', 
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-20 h-20',
    '2xl': 'w-24 h-24'
  };
  
  const textSizeClasses = {
    xs: 'text-xs',
    sm: 'text-sm',
    md: 'text-lg',
    lg: 'text-xl',
    xl: 'text-2xl',
    '2xl': 'text-3xl'
  };

  const logoContainerClasses = `relative flex items-center gap-3 ${className}`;

  if (customLogo) {
    return (
      <div className={logoContainerClasses}>
        <img 
          src={customLogo} 
          alt={brandName}
          className={`${sizeClasses[size]} object-contain`}
        />
        {showText && (
          <span className={`font-bold text-white ${textSizeClasses[size]}`}>
            {brandName}
          </span>
        )}
      </div>
    );
  }

  return (
    <div className={logoContainerClasses}>
      <motion.div
        whileHover={{ scale: 1.05, rotate: 5 }}
        className={`${sizeClasses[size]}`}
      >
        <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 36V12H20L28 24V12H36V36H28L20 24V36H12Z" fill="url(#paint0_linear_1_1)"/>
          <path d="M36 12C36 12 40 12 40 16C40 20 36 20 36 20" stroke="url(#paint1_linear_1_1)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <defs>
            <linearGradient id="paint0_linear_1_1" x1="12" y1="12" x2="36" y2="36" gradientUnits="userSpaceOnUse">
              <stop stopColor="#A78BFA"/>
              <stop offset="1" stopColor="#F472B6"/>
            </linearGradient>
            <linearGradient id="paint1_linear_1_1" x1="36" y1="12" x2="40" y2="16" gradientUnits="userSpaceOnUse">
              <stop stopColor="#A78BFA"/>
              <stop offset="1" stopColor="#F472B6"/>
            </linearGradient>
          </defs>
        </svg>
      </motion.div>
      {showText && (
        <span className={`font-bold text-white ${textSizeClasses[size]}`}>
          {brandName}
        </span>
      )}
    </div>
  );
};

export default NewomenLogo;
