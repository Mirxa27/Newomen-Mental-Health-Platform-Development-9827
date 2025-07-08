import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../components/common/SafeIcon';

const { FiHeart, FiTarget, FiUsers, FiStar, FiArrowRight } = FiIcons;

const About = () => {
  const { t } = useTranslation();

  const values = [
    {
      icon: FiHeart,
      title: "Empathy First",
      description: "We believe in the power of compassionate AI that understands the nuances of women's experiences across cultures."
    },
    {
      icon: FiTarget,
      title: "Authentic Growth",
      description: "Our platform focuses on genuine self-discovery through evidence-based shadow work and personal development."
    },
    {
      icon: FiUsers,
      title: "Cultural Sensitivity",
      description: "We honor diverse cultural contexts, especially MENA heritage, in our approach to mental health support."
    },
    {
      icon: FiStar,
      title: "Innovation",
      description: "We leverage cutting-edge AI technology to provide personalized, accessible mental health support."
    }
  ];

  const team = [
    {
      name: "Dr. Sarah Al-Rashid",
      role: "Founder & CEO",
      description: "Clinical psychologist specialized in women's mental health and cultural psychology."
    },
    {
      name: "Amina Hassan",
      role: "Head of AI Development",
      description: "AI researcher focused on culturally-aware natural language processing."
    },
    {
      name: "Leila Mansouri",
      role: "Head of UX Design",
      description: "Designer passionate about creating inclusive digital experiences."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 relative overflow-hidden">
      {/* Background floating elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-20 w-32 h-32 bg-primary-200/10 rounded-full animate-float"></div>
        <div className="absolute bottom-20 right-20 w-24 h-24 bg-secondary-200/10 rounded-full float-delayed"></div>
        <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-accent-200/10 rounded-full float-slow"></div>
        <div className="absolute bottom-1/4 right-1/4 w-20 h-20 bg-primary-200/5 rounded-full animate-float"></div>
      </div>

      <div className="relative z-10">
        {/* Hero Section */}
        <section className="py-12 md:py-20 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="liquid-glass rounded-3xl p-8 md:p-12 mb-12"
            >
              <div className="w-16 h-16 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-white font-bold text-xl">N</span>
              </div>
              
              <h1 className="text-4xl md:text-5xl font-bold gradient-text mb-6">
                About Newomen
              </h1>
              
              <p className="text-lg md:text-xl text-gray-600 leading-relaxed max-w-3xl mx-auto">
                We're building the future of women's mental health through AI-powered conversations 
                that honor cultural heritage and promote authentic self-discovery.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Mission Section */}
        <section className="py-12 md:py-16 px-4">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Our Mission
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                To empower women on their journey to authentic self-discovery through 
                culturally-sensitive AI conversations and evidence-based shadow work.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
              {values.map((value, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: index * 0.2 }}
                  viewport={{ once: true }}
                  className="liquid-glass rounded-xl p-6 hover:shadow-glow transition-all duration-300 group"
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="w-12 h-12 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center mb-4 group-hover:animate-glow">
                    <SafeIcon icon={value.icon} className="w-6 h-6 text-white" />
                  </div>
                  
                  <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-primary-600 transition-colors">
                    {value.title}
                  </h3>
                  
                  <p className="text-gray-600 leading-relaxed">
                    {value.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="py-12 md:py-16 px-4">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Our Team
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Meet the passionate individuals dedicated to transforming women's mental health through technology.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-8">
              {team.map((member, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: index * 0.2 }}
                  viewport={{ once: true }}
                  className="liquid-glass rounded-xl p-6 text-center hover:shadow-glow transition-all duration-300"
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="w-20 h-20 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-white font-bold text-xl">{member.name.charAt(0)}</span>
                  </div>
                  
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {member.name}
                  </h3>
                  
                  <p className="text-primary-600 font-medium mb-3">
                    {member.role}
                  </p>
                  
                  <p className="text-gray-600 leading-relaxed">
                    {member.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-12 md:py-16 px-4">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="liquid-glass rounded-3xl p-8 md:p-12 text-center relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-primary-500/10 to-secondary-500/10 rounded-3xl"></div>
              <div className="relative z-10">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                  Ready to Start Your Journey?
                </h2>
                
                <p className="text-lg md:text-xl text-gray-600 mb-8">
                  Join thousands of women who have found their authentic selves through Newomen.
                </p>
                
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link
                    to="/auth/register"
                    className="liquid-glass bg-gradient-to-r from-primary-500/80 to-secondary-500/80 text-white px-8 py-4 rounded-full text-lg font-semibold hover:shadow-glow transition-all duration-300 inline-flex items-center space-x-2 border border-primary-200/50"
                  >
                    <span>Get Started Today</span>
                    <SafeIcon icon={FiArrowRight} className="w-5 h-5" />
                  </Link>
                </motion.div>
              </div>
              
              {/* Floating elements inside CTA */}
              <div className="absolute top-4 right-4 w-8 h-8 bg-primary-200/20 rounded-full animate-float"></div>
              <div className="absolute bottom-4 left-4 w-6 h-6 bg-secondary-200/20 rounded-full float-delayed"></div>
            </motion.div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default About;