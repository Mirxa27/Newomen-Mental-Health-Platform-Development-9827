import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { 
  FiArrowRight, 
  FiHeart, 
  FiSun, 
  FiMoon,
  FiStar,
  FiZap,
  FiShield
} from 'react-icons/fi';
import { useAuthStore } from '../store/authStore';

const Home = () => {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuthStore();

  const features = [
    {
      icon: FiHeart,
      title: "Emotional Intelligence",
      description: "AI companion that understands your feelings and cultural context",
      gradient: "from-pink-500 to-rose-500"
    },
    {
      icon: FiSun,
      title: "Shadow Work",
      description: "Guided journey to discover your authentic self",
      gradient: "from-amber-500 to-orange-500"
    },
    {
      icon: FiMoon,
      title: "Cultural Sensitivity",
      description: "Conversations that honor your heritage and values",
      gradient: "from-indigo-500 to-purple-500"
    },
    {
      icon: FiStar,
      title: "Personal Growth",
      description: "Transform challenges into opportunities for growth",
      gradient: "from-cyan-500 to-blue-500"
    },
    {
      icon: FiZap,
      title: "Instant Support",
      description: "24/7 access to your AI companion whenever you need",
      gradient: "from-yellow-500 to-green-500"
    },
    {
      icon: FiShield,
      title: "Private & Secure",
      description: "Your conversations are encrypted and completely confidential",
      gradient: "from-purple-500 to-pink-500"
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  return (
    <div className="relative">
      {/* Hero Section */}
      <section className="relative min-h-[100vh] flex items-center justify-center px-4 py-20 overflow-hidden">
        {/* Animated Background Elements */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute top-10 right-10 w-72 h-72 bg-gradient-to-br from-primary-400/30 to-secondary-400/30 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [360, 180, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute bottom-10 left-10 w-96 h-96 bg-gradient-to-tr from-secondary-400/30 to-accent-400/30 rounded-full blur-3xl"
        />

        <div className="relative z-10 max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="glass-card backdrop-blur-2xl rounded-glass-lg p-8 md:p-12 max-w-4xl mx-auto"
          >
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-mobile-hero font-bold mb-6"
            >
              <span className="bg-gradient-to-r from-primary-600 via-secondary-600 to-primary-600 bg-clip-text text-transparent animate-gradient">
                {t('homeTitle')}
              </span>
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="text-mobile-body text-gray-700 mb-10 max-w-2xl mx-auto"
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
                className="group glass-button-primary px-8 py-4 rounded-full text-lg font-semibold transform hover:scale-105 transition-all duration-300 flex items-center space-x-3"
              >
                <span>{t('startJourney')}</span>
                <FiArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
              </Link>
              
              {!isAuthenticated && (
                <Link
                  to="/auth/login"
                  className="glass-button px-8 py-4 rounded-full text-lg font-semibold hover:scale-105 transition-all duration-300"
                >
                  {t('login')}
                </Link>
              )}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 relative">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-mobile-title font-bold mb-4">
              <span className="bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                Why Choose Newomen?
              </span>
            </h2>
            <p className="text-mobile-body text-gray-600 max-w-2xl mx-auto">
              Experience the perfect blend of advanced AI technology and deep cultural understanding
            </p>
          </motion.div>
          
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {features.map((feature, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{ y: -5 }}
                className="glass-card rounded-glass group"
              >
                <div className={`w-16 h-16 bg-gradient-to-br ${feature.gradient} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                
                <h3 className="text-xl font-bold text-gray-800 mb-3">
                  {feature.title}
                </h3>
                
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
                
                {/* Liquid decoration */}
                <div className="absolute -top-4 -right-4 w-24 h-24 liquid-blob opacity-10 group-hover:opacity-20 transition-opacity duration-300" />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-4 relative">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 1 }}
          viewport={{ once: true }}
          className="max-w-6xl mx-auto"
        >
          <div className="glass-heavy rounded-glass-lg p-8 md:p-12">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              {[
                { value: "10K+", label: "Active Users" },
                { value: "95%", label: "Satisfaction" },
                { value: "24/7", label: "Support" },
                { value: "50+", label: "Languages" }
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <h3 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent mb-2">
                    {stat.value}
                  </h3>
                  <p className="text-gray-600 font-medium">{stat.label}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 relative">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto"
        >
          <div className="relative overflow-hidden rounded-glass-lg">
            <div className="absolute inset-0 bg-gradient-to-br from-primary-500 to-secondary-500 opacity-90" />
            <div className="absolute inset-0 animate-liquid opacity-20" 
                 style={{
                   background: 'radial-gradient(circle at 30% 50%, rgba(255,255,255,0.3) 0%, transparent 50%)',
                 }} />
            
            <div className="relative glass-heavy backdrop-blur-xl p-10 md:p-16 text-center text-white">
              <h2 className="text-mobile-title font-bold mb-6">
                Ready to Begin Your Transformation?
              </h2>
              
              <p className="text-mobile-body mb-10 opacity-90 max-w-2xl mx-auto">
                Join thousands of women who have discovered their authentic selves through Newomen
              </p>
              
              <Link
                to={isAuthenticated ? "/shadow-work/1" : "/auth/register"}
                className="inline-flex items-center space-x-3 bg-white/20 backdrop-blur-md text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-white/30 transform hover:scale-105 transition-all duration-300 border border-white/30"
              >
                <span>Start Shadow Work</span>
                <FiArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </motion.div>
      </section>
    </div>
  );
};

export default Home;
