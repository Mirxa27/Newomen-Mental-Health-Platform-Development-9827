import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { FiArrowRight } from 'react-icons/fi';
import { FiHeart } from 'react-icons/fi';
import { FiSun } from 'react-icons/fi';
import { FiMoon } from 'react-icons/fi';
import { FiStar } from 'react-icons/fi';
import { FiZap } from 'react-icons/fi';
import { FiShield } from 'react-icons/fi';
import { FiCompass } from 'react-icons/fi';
import { FiFeather } from 'react-icons/fi';
import { FiAward } from 'react-icons/fi';
import { FiUsers } from 'react-icons/fi';
import { FiTarget } from 'react-icons/fi';
import { FiTrendingUp } from 'react-icons/fi';
import { useAuthStore } from '../store/authStore';
import { useShadowWorkStore } from '../store/shadowWorkStore';

const Home = () => {
  const { t } = useTranslation();
  const { isAuthenticated, personalityType } = useAuthStore();
  const { affirmations } = useShadowWorkStore();
  const [dailyAffirmation, setDailyAffirmation] = React.useState('');

  const defaultAffirmations = ['You are worthy of growth and joy.'];
  const personalityAffirmations = {
    leader: ['Lead with compassion and courage.', 'Your vision inspires others.'],
    nurturer: ['Your kindness uplifts those around you.', 'Self-care fuels your giving heart.'],
    visionary: ['Your ideas shape a brighter future.', 'Creativity flows through you.'],
  };

  React.useEffect(() => {
    let pool = affirmations && affirmations.length > 0 ? affirmations : defaultAffirmations;
    if (personalityType && personalityAffirmations[personalityType]) {
      pool = personalityAffirmations[personalityType];
    }
    const index = Math.floor(Math.random() * pool.length);
    setDailyAffirmation(pool[index]);
  }, [affirmations, personalityType]);

  const features = [
    { 
      icon: FiCompass, 
      title: "Self-Discovery Journey", 
      description: "Uncover your true potential with guided introspection and personalized insights.", 
      gradient: "from-purple-500 to-pink-500" 
    },
    { 
      icon: FiFeather, 
      title: "Shadow Work Integration", 
      description: "Transform your hidden aspects into sources of strength and wisdom.", 
      gradient: "from-blue-500 to-cyan-500" 
    },
    { 
      icon: FiHeart, 
      title: "Emotional Mastery", 
      description: "Develop deep emotional intelligence and resilience through AI-guided conversations.", 
      gradient: "from-rose-500 to-pink-500" 
    },
    { 
      icon: FiSun, 
      title: "Daily Growth Practices", 
      description: "Cultivate positive habits with personalized recommendations and tracking.", 
      gradient: "from-amber-500 to-orange-500" 
    },
    { 
      icon: FiMoon, 
      title: "Mindfulness & Balance", 
      description: "Find inner peace with culturally-sensitive meditation and reflection exercises.", 
      gradient: "from-indigo-500 to-purple-500" 
    },
    { 
      icon: FiShield, 
      title: "Safe & Confidential", 
      description: "Your journey is protected with end-to-end encryption and complete privacy.", 
      gradient: "from-emerald-500 to-teal-500" 
    }
  ];

  const transformationSteps = [
    { icon: FiTarget, title: "Set Your Intention", description: "Define your personal growth goals" },
    { icon: FiZap, title: "Engage & Explore", description: "Daily conversations and exercises" },
    { icon: FiTrendingUp, title: "Track Progress", description: "Visualize your transformation journey" },
    { icon: FiAward, title: "Celebrate Growth", description: "Acknowledge your achievements" }
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
        {/* Enhanced Background Effects */}
        <div className="absolute inset-0">
          <div className="absolute top-0 -right-24 w-96 h-96 bg-gradient-to-br from-purple-500/30 to-pink-500/30 rounded-full filter blur-3xl animate-liquid-blob" />
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-gradient-to-br from-blue-500/30 to-cyan-500/30 rounded-full filter blur-3xl animate-liquid-blob animation-delay-4000" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-full filter blur-3xl" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="inline-flex items-center space-x-2 px-4 py-2 bg-purple-500/20 backdrop-blur-sm border border-purple-500/30 rounded-full mb-6"
            >
              <FiStar className="w-4 h-4 text-purple-300" />
              <span className="text-sm text-purple-300 font-medium">Transform Your Life Today</span>
            </motion.div>

            <motion.h1
              variants={itemVariants}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.3, duration: 0.8 }}
              className="text-5xl md:text-7xl font-bold mb-6 leading-tight"
            >
              <span className="block animated-gradient-text">
                Unlock Your
              </span>
              <span className="block animated-gradient-text">
                Authentic Self
              </span>
            </motion.h1>
            
            <motion.p
              variants={itemVariants}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.5, duration: 0.8 }}
              className="text-xl md:text-2xl text-gray-300 mb-10 max-w-3xl mx-auto leading-relaxed"
            >
              Embark on a transformative journey of self-discovery with AI-powered guidance 
              tailored to your unique cultural background and personal aspirations.
            </motion.p>

            {dailyAffirmation && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="text-lg text-white mt-6"
              >
                {dailyAffirmation}
              </motion.p>
            )}
            
            <motion.div
              variants={itemVariants}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.7, duration: 0.8 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            >
              <Link
                to={isAuthenticated ? "/chat" : "/auth/register"}
                className="group relative inline-flex items-center space-x-3 px-8 py-4 rounded-full text-lg font-semibold text-white overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 transition-all duration-300 group-hover:scale-105"></div>
                <span className="relative">Begin Your Journey</span>
                <FiArrowRight className="relative w-5 h-5 group-hover:translate-x-1.5 transition-transform" />
              </Link>
              <Link
                to="/about"
                className="inline-flex items-center space-x-2 px-8 py-4 rounded-full text-lg font-medium text-gray-300 border border-gray-600 hover:border-gray-400 hover:text-white transition-all duration-300"
              >
                <span>Learn More</span>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Founder Section */}
      <section className="py-20 px-4 relative">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8 }}
            className="grid md:grid-cols-2 gap-12 items-center"
          >
            {/* Image Column */}
            <div className="relative">
              <motion.div
                whileHover={{ scale: 1.02 }}
                transition={{ type: 'spring', stiffness: 300 }}
                className="relative rounded-3xl overflow-hidden shadow-2xl"
              >
                {/* Purple gradient overlay for consistency */}
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-pink-500/20 z-10"></div>
                {/* Placeholder for Katrina's image */}
                <div className="relative bg-gradient-to-br from-gray-800 to-gray-900 h-[500px] flex items-center justify-center">
                  <div className="text-center p-8">
                    <div className="w-32 h-32 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                      <span className="text-4xl font-bold text-white">KZ</span>
                    </div>
                    <p className="text-gray-400">Katrina Zhuk</p>
                  </div>
                </div>
              </motion.div>
              {/* Decorative elements */}
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-purple-500/20 rounded-full filter blur-2xl"></div>
              <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-pink-500/20 rounded-full filter blur-2xl"></div>
            </div>

            {/* Content Column */}
            <div>
              <motion.h2
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2, duration: 0.8 }}
                className="text-4xl md:text-5xl font-bold mb-4"
              >
                Meet <span className="animated-gradient-text">Katrina Zhuk</span>
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3, duration: 0.8 }}
                className="text-xl text-purple-400 font-medium mb-6"
              >
                Founder & Visionary
              </motion.p>
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4, duration: 0.8 }}
                className="space-y-4 text-gray-300 text-lg leading-relaxed"
              >
                <p>
                  At just 25 years old, Katrina embarked on a transformative journey from Belarus to Saudi Arabia, 
                  where she was deeply inspired by the culture, warmth, and resilience she encountered, 
                  leading her to create a global community for women's empowerment.
                </p>
                <p className="italic text-purple-300">
                  "Traveling to Saudi Arabia opened my heart and mind in ways I never imagined. 
                  Inspired by the strength and spirit of the women I met, I created Newomen as a 
                  community where women worldwide can connect, learn, and grow together through technology."
                </p>
                <p className="text-pink-300 font-medium">
                  "This is just the beginning of our shared community journey toward collective 
                  empowerment and self-discovery."
                </p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5, duration: 0.8 }}
                className="mt-8"
              >
                <Link
                  to="/auth/register"
                  className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full text-white font-semibold hover:shadow-lg hover:shadow-purple-500/30 transform hover:scale-105 transition-all duration-300"
                >
                  <span>Start Your Journey Today</span>
                  <FiArrowRight className="w-4 h-4" />
                </Link>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Transformation Journey Section */}
      <section className="py-20 px-4 relative">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Your <span className="animated-gradient-text">Transformation Journey</span>
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              A proven path to personal growth and self-discovery
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {transformationSteps.map((step, index) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.8 }}
                className="relative"
              >
                {/* Connection Line */}
                {index < transformationSteps.length - 1 && (
                  <div className="hidden lg:block absolute top-12 left-full w-full h-0.5 bg-gradient-to-r from-purple-500 to-transparent"></div>
                )}
                
                <div className="text-center">
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 360 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                    className="w-24 h-24 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-purple-500/30"
                  >
                    <step.icon className="w-10 h-10 text-white" />
                  </motion.div>
                  <h3 className="text-xl font-bold mb-2">{step.title}</h3>
                  <p className="text-gray-400">{step.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
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
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="animated-gradient-text">Empower Your Growth</span>
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Discover powerful tools designed to support your personal development journey
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
                className="relative p-8 bg-gray-900/50 backdrop-blur-lg border border-gray-800 rounded-3xl shadow-xl group overflow-hidden"
              >
                {/* Gradient background on hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>
                
                <div className={`relative z-10 w-16 h-16 bg-gradient-to-br ${feature.gradient} rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="relative z-10 text-xl font-bold text-white mb-3 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-purple-400 group-hover:to-pink-400 transition-all duration-300">
                  {feature.title}
                </h3>
                <p className="relative z-10 text-gray-400 leading-relaxed">
                  {feature.description}
                </p>
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
          className="max-w-6xl mx-auto relative"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 to-pink-900/20 rounded-3xl"></div>
          <div className="relative p-8 md:p-12 bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-3xl shadow-2xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold animated-gradient-text mb-4">Join Our Growing Community</h2>
              <p className="text-gray-400 text-lg">Thousands of women are transforming their lives with Newomen</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              {[
                { value: "15K+", label: "Active Members", icon: FiUsers },
                { value: "98%", label: "Satisfaction Rate", icon: FiHeart },
                { value: "24/7", label: "AI Support", icon: FiZap },
                { value: "50+", label: "Countries", icon: FiStar }
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  <stat.icon className="w-8 h-8 mx-auto mb-3 text-purple-400" />
                  <h3 className="text-4xl md:text-5xl font-bold animated-gradient-text mb-2">{stat.value}</h3>
                  <p className="text-gray-400 font-medium">{stat.label}</p>
                </motion.div>
              ))}
            </div>
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
          className="max-w-4xl mx-auto relative"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-purple-600 to-pink-600 rounded-3xl"></div>
          <div className="relative p-10 md:p-16 text-center text-white rounded-3xl shadow-2xl shadow-purple-500/30 overflow-hidden">
            <div className="absolute inset-0 animate-liquid-slow opacity-20" style={{ background: 'radial-gradient(circle at 30% 50%, rgba(255,255,255,0.3) 0%, transparent 50%)' }} />
            <div className="relative z-10">
              <h2 className="text-4xl md:text-5xl font-bold mb-6">Ready to Transform Your Life?</h2>
              <p className="text-xl mb-10 opacity-90 max-w-2xl mx-auto">
                Take the first step towards becoming your most authentic, empowered self.
              </p>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-block"
              >
                <Link
                  to={isAuthenticated ? "/shadow-work/1" : "/auth/register"}
                  className="group inline-flex items-center space-x-3 bg-white/20 backdrop-blur-md px-8 py-4 rounded-full text-lg font-semibold hover:bg-white/30 transform transition-all duration-300 border border-white/30"
                >
                  <span>Begin Your Shadow Work Journey</span>
                  <FiArrowRight className="w-5 h-5 group-hover:translate-x-1.5 transition-transform" />
                </Link>
              </motion.div>
            </div>
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
      `}</style>
    </div>
  );
};

export default Home;