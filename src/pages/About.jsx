import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { FiUsers } from 'react-icons/fi';
import { FiAward } from 'react-icons/fi';
import { FiHeart } from 'react-icons/fi';
import { FiFeather } from 'react-icons/fi';
import { FiSun } from 'react-icons/fi';
import { FiMoon } from 'react-icons/fi';
import { FiStar } from 'react-icons/fi';
import { FiZap } from 'react-icons/fi';
import { FiShield } from 'react-icons/fi';
import { FiCompass } from 'react-icons/fi';
import { FiTarget } from 'react-icons/fi';
import { FiTrendingUp } from 'react-icons/fi';
import SafeIcon from '../components/common/SafeIcon';
import { FiArrowRight, FiBookOpen, FiGlobe } from 'react-icons/fi';

const About = () => {
  const { t } = useTranslation();

  const values = [
    {
      icon: FiCompass,
      title: "Authentic Leadership",
      description: "We believe in leading with authenticity and empowering women to discover their unique voice and purpose."
    },
    {
      icon: FiHeart,
      title: "Holistic Growth",
      description: "Personal development that honors mind, body, and spirit while respecting cultural heritage and individual values."
    },
    {
      icon: FiGlobe,
      title: "Global Community",
      description: "Creating bridges between cultures through shared experiences of growth, healing, and transformation."
    },
    {
      icon: FiAward,
      title: "Excellence & Innovation",
      description: "Combining cutting-edge AI technology with ancient wisdom to create transformative experiences."
    }
  ];

  const milestones = [
    { year: "2021", event: "Journey begins in Saudi Arabia", description: "Katrina's transformative experience sparks the vision" },
    { year: "2022", event: "Newomen concept born", description: "Developing the framework for culturally-sensitive AI coaching" },
    { year: "2023", event: "Platform launch", description: "Opening doors to women worldwide seeking authentic growth" },
    { year: "2024", event: "Global expansion", description: "Reaching 50+ countries and 15,000+ empowered women" }
  ];

  return (
    <div className="min-h-screen bg-gray-950 text-white relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-96 h-96 bg-purple-500/10 rounded-full filter blur-3xl animate-liquid-blob"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-pink-500/10 rounded-full filter blur-3xl animate-liquid-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10">
        {/* Hero Section */}
        <section className="py-20 px-4">
          <div className="max-w-5xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.8 }}
                className="inline-flex items-center space-x-2 px-4 py-2 bg-purple-500/20 backdrop-blur-sm border border-purple-500/30 rounded-full mb-6"
              >
                <FiBookOpen className="w-4 h-4 text-purple-300" />
                <span className="text-sm text-purple-300 font-medium">Our Story</span>
              </motion.div>
              
              <h1 className="text-5xl md:text-6xl font-bold mb-6">
                <span className="animated-gradient-text">Empowering Women</span>
                <br />
                <span className="text-gray-100">Through Technology & Wisdom</span>
              </h1>
              
              <p className="text-xl text-gray-100 leading-relaxed max-w-3xl mx-auto">
                Newomen is more than a platform—it's a movement born from one woman's
                transformative journey and her vision to create a global sisterhood of
                empowered, authentic leaders.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Founder Story Section */}
        <section className="py-16 px-4">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="grid md:grid-cols-2 gap-12 items-center mb-20"
            >
              {/* Content */}
              <div className="order-2 md:order-1">
                <h2 className="text-4xl font-bold mb-6">
                  The Vision Behind <span className="animated-gradient-text">Newomen</span>
                </h2>
                <div className="space-y-4 text-gray-100 text-lg leading-relaxed">
                  <p>
                    In 2021, Katrina Zhuk, a young entrepreneur from Belarus, embarked on a
                    life-changing journey to Saudi Arabia. What began as a business trip
                    transformed into a profound awakening.
                  </p>
                  <p>
                    "I was deeply moved by the strength, resilience, and wisdom of the women
                    I met," Katrina reflects. "Despite cultural differences, I discovered a
                    universal truth: every woman yearns for authentic self-expression and
                    meaningful connection."
                  </p>
                  <p className="italic text-purple-300">
                    "This experience ignited my passion to create a platform where women from
                    all backgrounds could access the tools for personal transformation while
                    honoring their cultural heritage."
                  </p>
                  <p>
                    Today, Newomen stands as a testament to the power of cross-cultural
                    understanding and the universal journey of self-discovery.
                  </p>
                </div>
              </div>

              {/* Image */}
              <div className="order-1 md:order-2 relative">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                  className="relative rounded-3xl overflow-hidden shadow-2xl"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-pink-500/20 z-10"></div>
                  <img
                    src="/images/katrina-zhuk.jpg"
                    alt="Katrina Zhuk, Founder & CEO of Newomen"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
                    <p className="text-xl text-white font-medium">Katrina Zhuk</p>
                    <p className="text-purple-300">Founder & CEO</p>
                  </div>
                </motion.div>
                <div className="absolute -top-4 -right-4 w-24 h-24 bg-purple-500/20 rounded-full filter blur-2xl"></div>
                <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-pink-500/20 rounded-full filter blur-2xl"></div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Timeline Section */}
        <section className="py-16 px-4">
          <div className="max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-4xl font-bold mb-4">
                Our <span className="animated-gradient-text">Journey</span>
              </h2>
              <p className="text-xl text-gray-100">From vision to global movement</p>
            </motion.div>

            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-1/2 transform -translate-x-1/2 w-0.5 h-full bg-gradient-to-b from-purple-500 to-pink-500"></div>

              {milestones.map((milestone, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8, delay: index * 0.2 }}
                  viewport={{ once: true }}
                  className={`relative flex items-center mb-12 ${
                    index % 2 === 0 ? 'md:flex-row-reverse' : ''
                  }`}
                >
                  <div className={`w-full md:w-5/12 ${index % 2 === 0 ? 'md:text-right' : ''}`}>
                    <div className={`p-6 bg-gray-900/50 backdrop-blur-lg border border-gray-800 rounded-2xl ${
                      index % 2 === 0 ? 'md:ml-auto' : 'md:mr-auto'
                    }`}>
                      <h3 className="text-2xl font-bold text-purple-400 mb-2">{milestone.year}</h3>
                      <h4 className="text-xl font-semibold mb-2">{milestone.event}</h4>
                      <p className="text-gray-100">{milestone.description}</p>
                    </div>
                  </div>
                  
                  {/* Center dot */}
                  <div className="absolute left-1/2 transform -translate-x-1/2 w-4 h-4 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full border-4 border-gray-950"></div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="py-16 px-4">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-4xl font-bold mb-4">
                Our <span className="animated-gradient-text">Core Values</span>
              </h2>
              <p className="text-xl text-gray-100 max-w-2xl mx-auto">
                The principles that guide our mission to empower women worldwide
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {values.map((value, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="relative p-6 bg-gray-900/50 backdrop-blur-lg border border-gray-800 rounded-2xl group hover:border-purple-500/50 transition-all duration-300"
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <SafeIcon icon={value.icon} className="w-7 h-7 text-white" />
                  </div>
                  
                  <h3 className="text-xl font-bold mb-3 group-hover:text-purple-400 transition-colors">
                    {value.title}
                  </h3>
                  
                  <p className="text-gray-100 leading-relaxed">
                    {value.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Mission Statement */}
        <section className="py-16 px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto relative"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 to-pink-600/20 rounded-3xl blur-xl"></div>
            <div className="relative p-10 md:p-16 bg-gray-900/80 backdrop-blur-xl border border-gray-800 rounded-3xl text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-6 animated-gradient-text">
                Our Mission
              </h2>
              <p className="text-xl text-gray-100 leading-relaxed mb-8">
                To create a global community where every woman can embark on a transformative
                journey of self-discovery, leveraging AI technology and cultural wisdom to
                unlock her authentic potential and lead with purpose.
              </p>
              <div className="flex justify-center space-x-8 text-gray-100">
                <div>
                  <FiUsers className="w-8 h-8 mx-auto mb-2 text-purple-400" />
                  <p className="text-sm">Global Reach</p>
                </div>
                <div>
                  <FiHeart className="w-8 h-8 mx-auto mb-2 text-pink-400" />
                  <p className="text-sm">Compassionate AI</p>
                </div>
                <div>
                  <FiStar className="w-8 h-8 mx-auto mb-2 text-purple-400" />
                  <p className="text-sm">Proven Results</p>
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-4">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                Join the <span className="animated-gradient-text">Movement</span>
              </h2>
              
              <p className="text-xl text-gray-100 mb-10 max-w-2xl mx-auto">
                Be part of a global sisterhood committed to authentic growth and collective empowerment.
              </p>
              
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-block"
              >
                <Link
                  to="/auth/register"
                  className="group relative inline-flex items-center space-x-3 px-8 py-4 rounded-full text-lg font-semibold text-white overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 transition-all duration-300 group-hover:scale-105"></div>
                  <span className="relative">Start Your Journey Today</span>
                  <SafeIcon icon={FiArrowRight} className="relative w-5 h-5 group-hover:translate-x-1.5 transition-transform" />
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </section>
      </div>

    </div>
  );
};

export default About;