import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../components/common/SafeIcon';
import { useAuthStore } from '../store/authStore';

const { FiArrowRight, FiHeart, FiSun, FiMoon } = FiIcons;

const Home = () => {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuthStore();

  const features = [
    {
      icon: FiHeart,
      title: "Emotional Intelligence",
      description: "AI companion that understands your feelings and cultural context",
      titleAr: "الذكاء العاطفي",
      descriptionAr: "رفيق ذكي يفهم مشاعرك وسياقك الثقافي"
    },
    {
      icon: FiSun,
      title: "Shadow Work",
      description: "Guided journey to discover your authentic self",
      titleAr: "عمل الظل",
      descriptionAr: "رحلة موجهة لاكتشاف ذاتك الحقيقية"
    },
    {
      icon: FiMoon,
      title: "Cultural Sensitivity",
      description: "Conversations that honor your heritage and values",
      titleAr: "الحساسية الثقافية",
      descriptionAr: "محادثات تحترم تراثك وقيمك"
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-12 md:py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-4xl md:text-5xl lg:text-7xl font-bold text-gray-900 mb-6"
            >
              <span className="gradient-text">{t('homeTitle')}</span>
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-lg md:text-xl lg:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto px-4"
            >
              {t('homeSubtitle')}
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            >
              <Link
                to={isAuthenticated ? "/chat" : "/auth/register"}
                className="group bg-gradient-to-r from-primary-500 to-secondary-500 text-white px-6 md:px-8 py-3 md:py-4 rounded-full text-lg font-semibold hover:shadow-lg transition-all duration-300 flex items-center space-x-2"
              >
                <span>{t('startJourney')}</span>
                <SafeIcon
                  icon={FiArrowRight}
                  className="w-5 h-5 group-hover:translate-x-1 transition-transform"
                />
              </Link>
              
              {!isAuthenticated && (
                <Link
                  to="/auth/login"
                  className="text-gray-700 hover:text-primary-600 px-6 md:px-8 py-3 md:py-4 text-lg font-semibold transition-colors"
                >
                  {t('login')}
                </Link>
              )}
            </motion.div>
          </div>
        </div>
        
        {/* Floating Elements */}
        <div className="absolute top-20 left-10 w-16 md:w-20 h-16 md:h-20 bg-primary-200 rounded-full opacity-20 animate-float"></div>
        <div className="absolute bottom-20 right-10 w-24 md:w-32 h-24 md:h-32 bg-secondary-200 rounded-full opacity-20 animate-float" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/4 w-12 md:w-16 h-12 md:h-16 bg-accent-200 rounded-full opacity-20 animate-float" style={{ animationDelay: '2s' }}></div>
      </section>

      {/* Features Section */}
      <section className="py-12 md:py-20 px-4 bg-white/50">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-12 md:mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose Newomen?
            </h2>
            <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
              Experience the perfect blend of advanced AI technology and deep cultural understanding
            </p>
          </motion.div>
          
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                viewport={{ once: true }}
                className="bg-white/80 backdrop-blur-sm rounded-xl md:rounded-2xl p-6 md:p-8 shadow-lg hover:shadow-xl transition-shadow duration-300"
              >
                <div className="w-14 h-14 md:w-16 md:h-16 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-xl md:rounded-2xl flex items-center justify-center mb-6">
                  <SafeIcon icon={feature.icon} className="w-7 h-7 md:w-8 md:h-8 text-white" />
                </div>
                
                <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-4">
                  {feature.title}
                </h3>
                
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 md:py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="bg-gradient-to-r from-primary-500 to-secondary-500 rounded-2xl md:rounded-3xl p-8 md:p-12 text-white"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Begin Your Transformation?
            </h2>
            
            <p className="text-lg md:text-xl mb-8 opacity-90">
              Join thousands of women who have discovered their authentic selves through Newomen
            </p>
            
            <Link
              to={isAuthenticated ? "/shadow-work" : "/auth/register"}
              className="bg-white text-primary-600 px-6 md:px-8 py-3 md:py-4 rounded-full text-lg font-semibold hover:bg-gray-100 transition-colors inline-flex items-center space-x-2"
            >
              <span>Start Shadow Work</span>
              <SafeIcon icon={FiArrowRight} className="w-5 h-5" />
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Home;