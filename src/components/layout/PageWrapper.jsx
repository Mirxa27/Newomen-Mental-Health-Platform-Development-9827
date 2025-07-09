import React from 'react';
import { motion } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import Breadcrumb from '../navigation/Breadcrumb';
import StickyNavbar from '../navigation/StickyNavbar';
import MobileFooterNav from '../navigation/MobileFooterNav';

const PageWrapper = ({ 
  children, 
  showBreadcrumb = true, 
  showStickyNav = true,
  showMobileFooter = true,
  className = '',
  containerClassName = 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8',
  paddingTop = 'pt-16'
}) => {
  const location = useLocation();

  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    in: { opacity: 1, y: 0 },
    out: { opacity: 0, y: -20 }
  };

  const pageTransition = {
    type: "tween",
    ease: "anticipate",
    duration: 0.3
  };

  const hideNavigationPaths = ['/auth/login', '/auth/register', '/auth/forgot-password'];
  const shouldHideNavigation = hideNavigationPaths.includes(location.pathname);

  return (
    <div className={`min-h-screen ${className}`}>
      {/* Sticky Navigation */}
      {showStickyNav && !shouldHideNavigation && <StickyNavbar />}
      
      {/* Main Content */}
      <motion.div
        key={location.pathname}
        initial="initial"
        animate="in"
        exit="out"
        variants={pageVariants}
        transition={pageTransition}
        className={`${paddingTop}`}
      >
        <div className={containerClassName}>
          {/* Breadcrumb */}
          {showBreadcrumb && !shouldHideNavigation && (
            <div className="py-4">
              <Breadcrumb />
            </div>
          )}
          
          {/* Page Content */}
          <div className="pb-20 md:pb-8">
            {children}
          </div>
        </div>
      </motion.div>
      
      {/* Mobile Footer Navigation */}
      {showMobileFooter && !shouldHideNavigation && <MobileFooterNav />}
    </div>
  );
};

export default PageWrapper;