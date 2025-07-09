import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiUpload, 
  FiX, 
  FiSave, 
  FiRotateCcw, 
  FiImage, 
  FiEye,
  FiDownload,
  FiTrash2,
  FiCheck
} from 'react-icons/fi';
import { useAIProviderStore } from '../../store/aiProviderStore';
import { useAuthStore } from '../../store/authStore';
import NewomenLogo from '../common/NewomenLogo';
import toast from 'react-hot-toast';

const BrandingSettings = () => {
  const { settings, updateSettings } = useAIProviderStore();
  const { token } = useAuthStore();
  const fileInputRef = useRef(null);
  
  const [brandingData, setBrandingData] = useState({
    brandName: settings?.brandingSettings?.brandName || 'Newomen',
    logoUrl: settings?.brandingSettings?.logoUrl || '',
    accentColor: settings?.brandingSettings?.accentColor || '#667eea',
    secondaryColor: settings?.brandingSettings?.secondaryColor || '#764ba2',
    tagline: settings?.brandingSettings?.tagline || 'Your Journey to Self',
    favicon: settings?.brandingSettings?.favicon || '',
    customCSS: settings?.brandingSettings?.customCSS || '',
  });

  const [isDragging, setIsDragging] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  // Predefined color palette
  const colorPalette = [
    '#667eea', '#764ba2', '#f093fb', '#f5576c',
    '#4facfe', '#00f2fe', '#43e97b', '#38f9d7',
    '#fa709a', '#fee140', '#a8edea', '#fed6e3',
    '#ff9a9e', '#fecfef', '#ffecd2', '#fcb69f'
  ];

  // Handle file upload
  const handleFileUpload = async (file) => {
    if (!file) return;
    
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Please upload a valid image file (JPEG, PNG, GIF, WebP, SVG)');
      return;
    }

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      toast.error('File size must be less than 5MB');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    const formData = new FormData();
    formData.append('logo', file);

    try {
      const response = await fetch('/api/admin/settings/branding/logo', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Logo upload failed');
      }

      const data = await response.json();

      setBrandingData(prev => ({
        ...prev,
        logoUrl: data.logoUrl
      }));

      toast.success('Logo uploaded successfully!');
    } catch (error) {
      toast.error(error.message || 'An error occurred during upload');
    } finally {
      setIsUploading(false);
    }
  };

  // Handle drag and drop
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    handleFileUpload(file);
  };

  // Handle input change
  const handleInputChange = (field, value) => {
    setBrandingData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Save settings
  const handleSave = () => {
    updateSettings({
      brandingSettings: brandingData
    });
    toast.success('Branding settings saved successfully!');
  };

  // Reset to defaults
  const handleReset = () => {
    setBrandingData({
      brandName: 'Newomen',
      logoUrl: '',
      accentColor: '#667eea',
      secondaryColor: '#764ba2',
      tagline: 'Your Journey to Self',
      favicon: '',
      customCSS: '',
    });
    toast.success('Settings reset to default');
  };

  // Download current logo
  const handleDownloadLogo = () => {
    if (!brandingData.logoUrl) return;
    
    const link = document.createElement('a');
    link.href = brandingData.logoUrl;
    link.download = `${brandingData.brandName}-logo.png`;
    link.click();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Branding Settings</h2>
          <p className="text-gray-400 mt-1">Customize your platform's visual identity</p>
        </div>
        
        <div className="flex items-center gap-3">
          <motion.button
            onClick={() => setPreviewMode(!previewMode)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <FiEye className="w-4 h-4" />
            {previewMode ? 'Edit' : 'Preview'}
          </motion.button>
          
          <motion.button
            onClick={handleReset}
            className="flex items-center gap-2 px-4 py-2 bg-gray-500/20 hover:bg-gray-500/30 text-gray-400 rounded-lg transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <FiRotateCcw className="w-4 h-4" />
            Reset
          </motion.button>
          
          <motion.button
            onClick={handleSave}
            className="flex items-center gap-2 px-4 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-lg transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <FiSave className="w-4 h-4" />
            Save
          </motion.button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Logo Upload Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white">Logo Management</h3>
          
          {/* Current Logo Display */}
          <div className="bg-gray-900/50 rounded-xl p-6 border border-white/10">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-white font-medium">Current Logo</h4>
              <div className="flex items-center gap-2">
                {brandingData.logoUrl && (
                  <>
                    <motion.button
                      onClick={handleDownloadLogo}
                      className="p-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg transition-colors"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <FiDownload className="w-4 h-4" />
                    </motion.button>
                    <motion.button
                      onClick={() => handleInputChange('logoUrl', '')}
                      className="p-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <FiTrash2 className="w-4 h-4" />
                    </motion.button>
                  </>
                )}
              </div>
            </div>
            
            <div className="flex items-center justify-center h-32 bg-gray-800/50 rounded-lg border border-white/10">
              <NewomenLogo 
                size="lg" 
                showText={true}
                animated={true}
              />
            </div>
          </div>

          {/* Upload Area */}
          <div className="relative">
            <motion.div
              className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${
                isDragging 
                  ? 'border-primary-500 bg-primary-500/10' 
                  : 'border-white/20 hover:border-white/40'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              whileHover={{ scale: 1.02 }}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => handleFileUpload(e.target.files[0])}
                className="hidden"
              />
              
              <motion.div
                className="space-y-4"
                animate={{ opacity: isUploading ? 0.5 : 1 }}
              >
                <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto">
                  <FiUpload className="w-8 h-8 text-white/70" />
                </div>
                
                <div>
                  <p className="text-white font-medium">Drop your logo here</p>
                  <p className="text-gray-400 text-sm mt-1">or click to browse</p>
                  <p className="text-xs text-gray-500 mt-2">
                    Supports: JPEG, PNG, GIF, WebP, SVG (max 5MB)
                  </p>
                </div>
                
                <motion.button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-6 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Choose File
                </motion.button>
              </motion.div>
              
              {/* Upload Progress */}
              <AnimatePresence>
                {isUploading && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-xl"
                  >
                    <div className="text-center">
                      <div className="w-16 h-16 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin mx-auto mb-4" />
                      <p className="text-white font-medium">Uploading...</p>
                      <p className="text-sm text-gray-400">{uploadProgress}%</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        </div>

        {/* Settings Form */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white">Brand Settings</h3>
          
          <div className="bg-gray-900/50 rounded-xl p-6 border border-white/10 space-y-4">
            {/* Brand Name */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Brand Name
              </label>
              <input
                type="text"
                value={brandingData.brandName}
                onChange={(e) => handleInputChange('brandName', e.target.value)}
                className="w-full bg-gray-800/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary-500"
                placeholder="Enter brand name"
              />
            </div>

            {/* Tagline */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Tagline
              </label>
              <input
                type="text"
                value={brandingData.tagline}
                onChange={(e) => handleInputChange('tagline', e.target.value)}
                className="w-full bg-gray-800/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary-500"
                placeholder="Enter tagline"
              />
            </div>

            {/* Color Settings */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Primary Color */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Primary Color
                </label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={brandingData.accentColor}
                    onChange={(e) => handleInputChange('accentColor', e.target.value)}
                    className="w-12 h-12 bg-gray-800/50 border border-white/10 rounded-lg cursor-pointer"
                  />
                  <input
                    type="text"
                    value={brandingData.accentColor}
                    onChange={(e) => handleInputChange('accentColor', e.target.value)}
                    className="flex-1 bg-gray-800/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary-500"
                  />
                </div>
              </div>

              {/* Secondary Color */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Secondary Color
                </label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={brandingData.secondaryColor}
                    onChange={(e) => handleInputChange('secondaryColor', e.target.value)}
                    className="w-12 h-12 bg-gray-800/50 border border-white/10 rounded-lg cursor-pointer"
                  />
                  <input
                    type="text"
                    value={brandingData.secondaryColor}
                    onChange={(e) => handleInputChange('secondaryColor', e.target.value)}
                    className="flex-1 bg-gray-800/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary-500"
                  />
                </div>
              </div>
            </div>

            {/* Color Palette */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Quick Color Palette
              </label>
              <div className="grid grid-cols-8 gap-2">
                {colorPalette.map((color, index) => (
                  <motion.button
                    key={index}
                    onClick={() => handleInputChange('accentColor', color)}
                    className="w-8 h-8 rounded-full border-2 border-white/20 hover:border-white/40 transition-colors"
                    style={{ backgroundColor: color }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    {brandingData.accentColor === color && (
                      <FiCheck className="w-4 h-4 text-white mx-auto" />
                    )}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Custom CSS */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Custom CSS
              </label>
              <textarea
                value={brandingData.customCSS}
                onChange={(e) => handleInputChange('customCSS', e.target.value)}
                className="w-full bg-gray-800/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary-500 font-mono text-sm"
                rows="6"
                placeholder="/* Custom CSS rules */&#10;.custom-class {&#10;  color: #667eea;&#10;}"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Preview Mode */}
      <AnimatePresence>
        {previewMode && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-gray-900/50 rounded-xl p-6 border border-white/10"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Live Preview</h3>
              <motion.button
                onClick={() => setPreviewMode(false)}
                className="p-2 bg-gray-500/20 hover:bg-gray-500/30 text-gray-400 rounded-lg transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <FiX className="w-4 h-4" />
              </motion.button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Logo Preview */}
              <div className="bg-gray-800/50 rounded-lg p-4 text-center">
                <p className="text-sm text-gray-400 mb-2">Logo</p>
                <NewomenLogo size="md" showText={true} animated={true} />
              </div>
              
              {/* Colors Preview */}
              <div className="bg-gray-800/50 rounded-lg p-4">
                <p className="text-sm text-gray-400 mb-2">Colors</p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-4 h-4 rounded-full" 
                      style={{ backgroundColor: brandingData.accentColor }}
                    />
                    <span className="text-xs text-white">Primary</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-4 h-4 rounded-full" 
                      style={{ backgroundColor: brandingData.secondaryColor }}
                    />
                    <span className="text-xs text-white">Secondary</span>
                  </div>
                </div>
              </div>
              
              {/* Typography Preview */}
              <div className="bg-gray-800/50 rounded-lg p-4">
                <p className="text-sm text-gray-400 mb-2">Typography</p>
                <div className="space-y-1">
                  <p className="text-white font-bold">{brandingData.brandName}</p>
                  <p className="text-xs text-gray-400">{brandingData.tagline}</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BrandingSettings;