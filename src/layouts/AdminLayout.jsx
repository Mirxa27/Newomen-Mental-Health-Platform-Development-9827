import React, { useEffect, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import AdminSidebar from '../components/navigation/AdminSidebar';
import AdminHeader from '../components/navigation/AdminHeader';
import { useAuthStore } from '../store/authStore';
import { useMediaQuery } from '../hooks/useMediaQuery';

const AdminLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
  const [pageTitle, setPageTitle] = useState('Admin Dashboard');

  useEffect(() => {
    // Ensure user is admin, redirect if not
    if (user?.role !== 'admin') {
      navigate('/');
    }
  }, [user, navigate]);

  // Set page title based on current admin route
  useEffect(() => {
    const path = location.pathname;
    let title = 'Admin Dashboard - Newomen';
    
    if (path === '/admin/users') title = 'User Management - Admin';
    else if (path === '/admin/conversations') title = 'Conversations - Admin';
    else if (path === '/admin/prompts') title = 'Prompt Management - Admin';
    else if (path === '/admin/analytics') title = 'Analytics - Admin';
    else if (path === '/admin/ai-providers') title = 'AI Providers - Admin';
    else if (path === '/admin/settings') title = 'System Settings - Admin';
    
    setPageTitle(title);
    document.title = title;
  }, [location]);

  // Close sidebar on mobile when navigating
  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  }, [location.pathname, isMobile]);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <>
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="robots" content="noindex,nofollow" />
      </Helmet>
      
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50">
        <AdminHeader toggleSidebar={toggleSidebar} />
        
        <div className="flex h-[calc(100vh-64px)]">
          <AdminSidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
          
          <main 
            className={`flex-1 transition-all duration-300 overflow-auto p-3 md:p-8 ${
              sidebarOpen && !isMobile ? 'md:ml-64' : ''
            }`}
          >
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Outlet />
            </motion.div>
          </main>
        </div>
      </div>
    </>
  );
};

export default AdminLayout;