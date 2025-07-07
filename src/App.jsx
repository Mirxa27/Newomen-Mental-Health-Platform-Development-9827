import React, { Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import LoadingSpinner from './components/common/LoadingSpinner';
import ErrorBoundary from './components/common/ErrorBoundary';
import Layout from './components/layout/Layout';
import Home from './pages/Home';
import Chat from './pages/Chat';
import ShadowWork from './pages/ShadowWork';
import Profile from './pages/Profile';
import Subscription from './pages/Subscription';
import Admin from './pages/Admin';
import Login from './pages/Login';
import Register from './pages/Register';
import ProtectedRoute from './components/auth/ProtectedRoute';
import { useAuthStore } from './store/authStore';
import './App.css';

function App() {
  const { i18n } = useTranslation();
  const { user } = useAuthStore();

  return (
    <ErrorBoundary>
      <div className={`app ${i18n.language === 'ar' ? 'rtl' : 'ltr'}`}>
        <Suspense fallback={<LoadingSpinner />}>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/" element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="chat" element={
                <ProtectedRoute>
                  <Chat />
                </ProtectedRoute>
              } />
              <Route path="shadow-work" element={
                <ProtectedRoute>
                  <ShadowWork />
                </ProtectedRoute>
              } />
              <Route path="profile" element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              } />
              <Route path="subscription" element={
                <ProtectedRoute>
                  <Subscription />
                </ProtectedRoute>
              } />
              <Route path="admin/*" element={
                <ProtectedRoute adminOnly>
                  <Admin />
                </ProtectedRoute>
              } />
            </Route>
          </Routes>
        </Suspense>
      </div>
    </ErrorBoundary>
  );
}

export default App;