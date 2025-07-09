import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const { FiInstagram, FiTwitter, FiLinkedin, FiMail, FiHeart, FiShield, FiBook, FiHelpCircle } = FiIcons;

const Footer = () => {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    { icon: FiInstagram, href: 'https://instagram.com/newomen', label: 'Instagram' },
    { icon: FiTwitter, href: 'https://twitter.com/newomen', label: 'Twitter' },
    { icon: FiLinkedin, href: 'https://linkedin.com/company/newomen', label: 'LinkedIn' },
    { icon: FiMail, href: 'mailto:support@newomen.com', label: 'Email' },
  ];

  const footerLinks = [
    {
      title: t('product'),
      links: [
        { label: t('features'), href: '/#features' },
        { label: t('pricing'), href: '/subscription' },
        { label: 'Shadow Work', href: '/shadow-work/1' },
        { label: t('voiceChat'), href: '/chat' },
      ],
    },
    {
      title: t('company'),
      links: [
        { label: t('about'), href: '/about' },
        { label: t('blog'), href: '/blog' },
        { label: t('careers'), href: '/careers' },
        { label: t('contact'), href: '/contact' },
      ],
    },
    {
      title: t('support'),
      links: [
        { label: t('helpCenter'), href: '/help' },
        { label: t('community'), href: '/community' },
        { label: t('faq'), href: '/faq' },
        { label: t('feedback'), href: '/feedback' },
      ],
    },
    {
      title: t('legal'),
      links: [
        { label: t('privacy'), href: '/privacy' },
        { label: t('terms'), href: '/terms' },
        { label: t('cookies'), href: '/cookies' },
        { label: t('disclaimer'), href: '/disclaimer' },
      ],
    },
  ];

  return (
    <motion.footer 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="glass-navbar mt-auto relative"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-8">
          {/* Brand Section */}
          <div className="lg:col-span-1">
            <Link to="/" className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">N</span>
              </div>
              <span className="text-xl font-bold gradient-text">Newomen</span>
            </Link>
            <p className="text-gray-600 text-sm leading-relaxed mb-4">
              {t('footerDescription')}
            </p>
            <div className="flex space-x-4">
              {socialLinks.map((social, index) => (
                <motion.a
                  key={index}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="glass-button p-2 rounded-lg hover:shadow-lg transition-all duration-300"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  aria-label={social.label}
                >
                  <SafeIcon icon={social.icon} className="w-5 h-5 text-gray-600" />
                </motion.a>
              ))}
            </div>
          </div>

          {/* Footer Links */}
          {footerLinks.map((section, index) => (
            <div key={index} className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
                {section.title}
              </h3>
              <ul className="space-y-2">
                {section.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <Link
                      to={link.href}
                      className="text-sm text-gray-600 hover:text-primary-600 transition-colors duration-200 hover:translate-x-1 inline-block"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Newsletter Section */}
        <div className="glass-card rounded-2xl p-6 mb-8">
          <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
            <div className="text-center md:text-left">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {t('stayConnected')}
              </h3>
              <p className="text-gray-600 text-sm">
                {t('newsletterDescription')}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 w-full md:w-auto">
              <input
                type="email"
                placeholder={t('emailPlaceholder')}
                className="glass-input px-4 py-2 rounded-lg text-sm min-w-0 flex-1 sm:w-64"
              />
              <button className="glass-button px-6 py-2 rounded-lg text-sm font-medium text-primary-600 hover:text-white">
                {t('subscribe')}
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-200/50 pt-6">
          <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
            <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4 text-sm text-gray-600">
              <span>© {currentYear} Newomen. {t('allRightsReserved')}</span>
              <div className="flex items-center space-x-4">
                <Link to="/privacy" className="hover:text-primary-600 transition-colors">
                  <SafeIcon icon={FiShield} className="w-4 h-4 inline mr-1" />
                  {t('privacy')}
                </Link>
                <Link to="/terms" className="hover:text-primary-600 transition-colors">
                  <SafeIcon icon={FiBook} className="w-4 h-4 inline mr-1" />
                  {t('terms')}
                </Link>
                <Link to="/help" className="hover:text-primary-600 transition-colors">
                  <SafeIcon icon={FiHelpCircle} className="w-4 h-4 inline mr-1" />
                  {t('help')}
                </Link>
              </div>
            </div>
            <div className="flex items-center space-x-1 text-sm text-gray-600">
              <span>{t('madeWith')}</span>
              <SafeIcon icon={FiHeart} className="w-4 h-4 text-red-500" />
              <span>{t('forWomen')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-4 left-4 w-16 h-16 bg-primary-200/20 rounded-full animate-float"></div>
        <div className="absolute bottom-4 right-4 w-12 h-12 bg-secondary-200/20 rounded-full float-delayed"></div>
        <div className="absolute top-1/2 left-1/3 w-8 h-8 bg-accent-200/20 rounded-full float-slow"></div>
      </div>
    </motion.footer>
  );
};

export default Footer;