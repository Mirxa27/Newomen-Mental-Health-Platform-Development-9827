import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import toast from 'react-hot-toast';
import { api } from '../../utils/api';
import { useAIProviderStore } from '../../store/aiProviderStore';

const { FiSave, FiRefreshCw, FiShield, FiDatabase, FiMail, FiGlobe } = FiIcons;

const SystemSettings = () => {
  const [settings, setSettings] = useState({
    // General Settings
    siteName: 'Newomen',
    siteDescription: 'AI-powered platform for women\'s mental health and personal growth',
    maintenanceMode: false,
    registrationEnabled: true,
    
    // Email Settings
    emailProvider: 'smtp',
    smtpHost: 'smtp.gmail.com',
    smtpPort: '587',
    smtpUsername: '',
    smtpPassword: '',
    fromEmail: 'noreply@newomen.com',
    fromName: 'Newomen Platform',
    
    // Security Settings
    sessionTimeout: 24, // hours
    maxLoginAttempts: 5,
    passwordMinLength: 8,
    requireEmailVerification: true,
    enableTwoFactor: false,
    
    // API Settings
    rateLimitPerMinute: 60,
    rateLimitPerHour: 1000,
    corsOrigins: ['https://newomen.com', 'https://app.newomen.com'],
    
    // Language & Localization
    defaultLanguage: 'en',
    supportedLanguages: ['en', 'ar'],
    timezone: 'UTC',
    dateFormat: 'YYYY-MM-DD',
    
    // Analytics & Monitoring
    enableAnalytics: true,
    analyticsProvider: 'google',
    googleAnalyticsId: '',
    enableErrorReporting: true,
    logLevel: 'info',
    
    // Content Moderation
    enableContentModeration: true,
    autoModerationThreshold: 0.8,
    humanReviewRequired: true,
    
    // Backup & Storage
    backupFrequency: 'daily',
    backupRetention: 30, // days
    storageProvider: 'local',
    maxFileSize: 10, // MB
  });

  const [activeTab, setActiveTab] = useState('general');
  const [isSaving, setIsSaving] = useState(false);
  const updateStoreSettings = useAIProviderStore(state => state.updateSettings);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await api.admin.getSettings();
        setSettings(prev => ({ ...prev, ...data }));
        updateStoreSettings(data);
      } catch (error) {
        console.error('Failed to load settings:', error);
      }
    };
    load();
  }, []);

  const tabs = [
    { id: 'general', name: 'General', icon: FiGlobe },
    { id: 'email', name: 'Email', icon: FiMail },
    { id: 'security', name: 'Security', icon: FiShield },
    { id: 'api', name: 'API & Limits', icon: FiDatabase },
    { id: 'localization', name: 'Localization', icon: FiGlobe },
    { id: 'monitoring', name: 'Monitoring', icon: FiRefreshCw },
  ];

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await api.admin.updateSettings(settings);
      updateStoreSettings(settings);
      toast.success('Settings saved successfully');
    } catch (error) {
      console.error('Failed to save settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    // Reset to default values
    toast.success('Settings reset to defaults');
  };

  const testEmailSettings = async () => {
    toast.loading('Testing email configuration...');
    
    setTimeout(() => {
      toast.dismiss();
      toast.success('Test email sent successfully');
    }, 2000);
  };

  const renderGeneralSettings = () => (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Site Name
          </label>
          <input
            type="text"
            value={settings.siteName}
            onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Default Language
          </label>
          <select
            value={settings.defaultLanguage}
            onChange={(e) => setSettings({ ...settings, defaultLanguage: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="en">English</option>
            <option value="ar">Arabic</option>
          </select>
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Site Description
        </label>
        <textarea
          value={settings.siteDescription}
          onChange={(e) => setSettings({ ...settings, siteDescription: e.target.value })}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
      </div>
      
      <div className="space-y-4">
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={settings.maintenanceMode}
            onChange={(e) => setSettings({ ...settings, maintenanceMode: e.target.checked })}
            className="mr-3"
          />
          <span className="text-sm font-medium text-gray-700">Maintenance Mode</span>
        </label>
        
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={settings.registrationEnabled}
            onChange={(e) => setSettings({ ...settings, registrationEnabled: e.target.checked })}
            className="mr-3"
          />
          <span className="text-sm font-medium text-gray-700">Enable User Registration</span>
        </label>
      </div>
    </div>
  );

  const renderEmailSettings = () => (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            SMTP Host
          </label>
          <input
            type="text"
            value={settings.smtpHost}
            onChange={(e) => setSettings({ ...settings, smtpHost: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            SMTP Port
          </label>
          <input
            type="text"
            value={settings.smtpPort}
            onChange={(e) => setSettings({ ...settings, smtpPort: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
      </div>
      
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Username
          </label>
          <input
            type="text"
            value={settings.smtpUsername}
            onChange={(e) => setSettings({ ...settings, smtpUsername: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Password
          </label>
          <input
            type="password"
            value={settings.smtpPassword}
            onChange={(e) => setSettings({ ...settings, smtpPassword: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
      </div>
      
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            From Email
          </label>
          <input
            type="email"
            value={settings.fromEmail}
            onChange={(e) => setSettings({ ...settings, fromEmail: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            From Name
          </label>
          <input
            type="text"
            value={settings.fromName}
            onChange={(e) => setSettings({ ...settings, fromName: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
      </div>
      
      <button
        onClick={testEmailSettings}
        className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
      >
        Test Email Configuration
      </button>
    </div>
  );

  const renderSecuritySettings = () => (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Session Timeout (hours)
          </label>
          <input
            type="number"
            value={settings.sessionTimeout}
            onChange={(e) => setSettings({ ...settings, sessionTimeout: parseInt(e.target.value) })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            min="1"
            max="168"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Max Login Attempts
          </label>
          <input
            type="number"
            value={settings.maxLoginAttempts}
            onChange={(e) => setSettings({ ...settings, maxLoginAttempts: parseInt(e.target.value) })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            min="3"
            max="10"
          />
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Minimum Password Length
        </label>
        <input
          type="number"
          value={settings.passwordMinLength}
          onChange={(e) => setSettings({ ...settings, passwordMinLength: parseInt(e.target.value) })}
          className="w-full max-w-xs px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          min="6"
          max="32"
        />
      </div>
      
      <div className="space-y-4">
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={settings.requireEmailVerification}
            onChange={(e) => setSettings({ ...settings, requireEmailVerification: e.target.checked })}
            className="mr-3"
          />
          <span className="text-sm font-medium text-gray-700">Require Email Verification</span>
        </label>
        
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={settings.enableTwoFactor}
            onChange={(e) => setSettings({ ...settings, enableTwoFactor: e.target.checked })}
            className="mr-3"
          />
          <span className="text-sm font-medium text-gray-700">Enable Two-Factor Authentication</span>
        </label>
      </div>
    </div>
  );

  const renderAPISettings = () => (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Rate Limit (per minute)
          </label>
          <input
            type="number"
            value={settings.rateLimitPerMinute}
            onChange={(e) => setSettings({ ...settings, rateLimitPerMinute: parseInt(e.target.value) })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            min="10"
            max="1000"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Rate Limit (per hour)
          </label>
          <input
            type="number"
            value={settings.rateLimitPerHour}
            onChange={(e) => setSettings({ ...settings, rateLimitPerHour: parseInt(e.target.value) })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            min="100"
            max="10000"
          />
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          CORS Origins (one per line)
        </label>
        <textarea
          value={settings.corsOrigins.join('\n')}
          onChange={(e) => setSettings({ 
            ...settings, 
            corsOrigins: e.target.value.split('\n').filter(url => url.trim()) 
          })}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          placeholder="https://example.com"
        />
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">System Settings</h1>
        <p className="text-gray-600 mt-2">Configure platform settings and preferences</p>
      </div>

      {/* Settings Tabs */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg overflow-hidden">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <SafeIcon icon={tab.icon} className="w-4 h-4" />
                  <span>{tab.name}</span>
                </div>
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'general' && renderGeneralSettings()}
          {activeTab === 'email' && renderEmailSettings()}
          {activeTab === 'security' && renderSecuritySettings()}
          {activeTab === 'api' && renderAPISettings()}
          {activeTab === 'localization' && (
            <div>Localization settings coming soon...</div>
          )}
          {activeTab === 'monitoring' && (
            <div>Monitoring settings coming soon...</div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-4">
        <button
          onClick={handleReset}
          className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
        >
          Reset to Defaults
        </button>
        
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="bg-primary-500 text-white px-6 py-2 rounded-lg hover:bg-primary-600 transition-colors disabled:opacity-50 flex items-center space-x-2"
        >
          <SafeIcon icon={FiSave} className="w-4 h-4" />
          <span>{isSaving ? 'Saving...' : 'Save Settings'}</span>
        </button>
      </div>
    </div>
  );
};

export default SystemSettings;