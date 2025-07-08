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
    { icon: FiHeart, title: "Emotional Intelligence", description: "AI companion that understands your feelings and cultural context.", gradient: "from-pink-500 to-rose-500" },
    { icon: FiSun, title: "Shadow Work", description: "Guided journey to discover your authentic self.", gradient: "from-amber-500 to-orange-500" },
    { icon: FiMoon, title: "Cultural Sensitivity", description: "Conversations that honor your heritage and values.", gradient: "from-indigo-500 to-purple-500" },
    { icon: FiStar, title: "Personal Growth", description: "Transform challenges into opportunities for growth.", gradient: "from-cyan-500 to-blue-500" },
    { icon: FiZap, title: "Instant Support", description: "24/7 access to your AI companion whenever you need.", gradient: "from-lime-500 to-green-500" },
    { icon: FiShield, title: "Private & Secure", description: "Your conversations are encrypted and completely confidential.", gradient: "from-teal-500 to-cyan-500" }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
  };

  return (
    <div className="text-white">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-4 py-24 overflow-hidden">
        {/* Background Blobs */}
        <div className="absolute top-0 -right-24 w-96 h-96 bg-primary-500/20 rounded-full filter blur-3xl animate-liquid-blob" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-secondary-500/20 rounded-full filter blur-3xl animate-liquid-blob animation-delay-4000" />

        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="p-8 md:p-12 bg-gray-900/30 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl"
          >
            <motion.h1
              variants={itemVariants}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.2, duration: 0.8 }}
              className="text-hero font-bold mb-6 leading-tight"
            >
              <span className="animated-gradient-text">
                {t('homeTitle', 'Find Your Authentic Self')}
              </span>
            </motion.h1>
            
            <motion.p
              variants={itemVariants}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.4, duration: 0.8 }}
              className="text-body text-gray-300 mb-10 max-w-2xl mx-auto"
            >
              {t('homeSubtitle', 'An AI-powered companion for women\'s mental health, designed with cultural sensitivity for your personal growth journey.')}
            </motion.p>
            
            <motion.div
              variants={itemVariants}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.6, duration: 0.8 }}
            >
              <Link
                to={isAuthenticated ? "/chat" : "/auth/register"}
                className="group inline-flex items-center space-x-3 px-8 py-4 rounded-full text-lg font-semibold text-white bg-primary-500 hover:bg-primary-600 shadow-lg shadow-primary-500/30 transform hover:scale-105 transition-all duration-300"
              >
                <span>{t('startJourney', 'Start Your Journey')}</span>
                <FiArrowRight className="w-5 h-5 group-hover:translate-x-1.5 transition-transform" />
              </Link>
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
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-title font-bold mb-4 animated-gradient-text">
              Why Choose Newomen?
            </h2>
            <p className="text-body text-gray-400 max-w-3xl mx-auto">
              Experience the perfect blend of advanced AI technology and deep cultural understanding, creating a safe space for your transformation.
            </p>
          </motion.div>
          
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {features.map((feature) => (
              <motion.div
                key={feature.title}
                variants={itemVariants}
                whileHover={{ y: -8, scale: 1.03 }}
                transition={{ type: 'spring', stiffness: 300 }}
                className="p-8 bg-gray-900/30 backdrop-blur-lg border border-white/10 rounded-2xl shadow-lg group"
              >
                <div className={`w-16 h-16 bg-gradient-to-br ${feature.gradient} rounded-xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                <p className="text-gray-400 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.8 }}
          className="max-w-5xl mx-auto p-8 md:p-12 bg-gray-900/30 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: "10K+", label: "Active Users" },
              { value: "95%", label: "Satisfaction" },
              { value: "24/7", label: "Support" },
              { value: "50+", label: "Languages" }
            ].map((stat, index) => (
              <div key={index}>
                <h3 className="text-4xl md:text-5xl font-bold animated-gradient-text mb-2">{stat.value}</h3>
                <p className="text-gray-400 font-medium">{stat.label}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto relative p-10 md:p-16 text-center text-white bg-gradient-to-br from-primary-500 to-secondary-500 rounded-3xl shadow-2xl shadow-primary-500/30 overflow-hidden"
        >
          <div className="absolute inset-0 animate-liquid-slow opacity-20" style={{ background: 'radial-gradient(circle at 30% 50%, rgba(255,255,255,0.3) 0%, transparent 50%)' }} />
          <div className="relative z-10">
            <h2 className="text-title font-bold mb-6">Ready to Begin Your Transformation?</h2>
            <p className="text-body mb-10 opacity-90 max-w-2xl mx-auto">
              Join thousands of women who have discovered their authentic selves through Newomen.
            </p>
            <Link
              to={isAuthenticated ? "/shadow-work/1" : "/auth/register"}
              className="group inline-flex items-center space-x-3 bg-white/20 backdrop-blur-md px-8 py-4 rounded-full text-lg font-semibold hover:bg-white/30 transform hover:scale-105 transition-all duration-300 border border-white/30"
            >
              <span>Start Shadow Work</span>
              <FiArrowRight className="w-5 h-5 group-hover:translate-x-1.5 transition-transform" />
            </Link>
          </div>
        </motion.div>
      </section>

      <style jsx global>{`
        @keyframes animated-gradient-text-flow {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animated-gradient-text {
          background: linear-gradient(-45deg, #a78bfa, #f472b6, #60a5fa, #a78bfa);
          background-size: 300% 300%;
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: animated-gradient-text-flow 10s ease infinite;
        }
        @keyframes liquid-blob-animation {
          0% { transform: scale(1) translate(0px, 0px) rotate(0deg); }
          25% { transform: scale(1.2) translate(20px, -30px) rotate(90deg); }
          50% { transform: scale(0.8) translate(-30px, 20px) rotate(180deg); }
          75% { transform: scale(1.1) translate(-10px, 30px) rotate(270deg); }
          100% { transform: scale(1) translate(0px, 0px) rotate(360deg); }
        }
        .animate-liquid-blob {
          animation: liquid-blob-animation 40s infinite ease-in-out alternate;
        }
        .animate-liquid-slow {
          animation: liquid-blob-animation 60s infinite ease-in-out alternate;
        }
        .animation-delay-4000 { animation-delay: -20s; }
        
        /* Responsive Typography */
        .text-hero { font-size: 2.5rem; } /* 40px */
        .text-title { font-size: 2rem; } /* 32px */
        .text-body { font-size: 1.125rem; } /* 18px */
        
        @media (min-width: 768px) {
          .text-hero { font-size: 4rem; } /* 64px */
          .text-title { font-size: 2.5rem; } /* 40px */
          .text-body { font-size: 1.25rem; } /* 20px */
        }
      `}</style>
    </div>
  );
};

export default Home;