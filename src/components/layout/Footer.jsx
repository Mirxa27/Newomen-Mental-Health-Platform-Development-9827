import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const { FiInstagram, FiTwitter, FiLinkedin, FiMail, FiHeart, FiShield, FiBook, FiHelpCircle, FiHome, FiMessageCircle, FiBookOpen, FiUser, FiSettings } = FiIcons;

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
        {/* Main Footer Content for larger screens */}
        <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-5 gap-8 mb-8">
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
            <div key={index}>
              <h3 className="text-sm font-semibold text-gray-700 tracking-wider uppercase mb-4">{section.title}</h3>
              <ul className="space-y-3">
                {section.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <Link to={link.href} className="text-sm text-gray-600 hover:text-primary-600 transition-colors duration-300">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Simplified Footer for Mobile */}
        <div className="md:hidden text-center">
          <Link to="/" className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">N</span>
            </div>
            <span className="text-xl font-bold gradient-text">Newomen</span>
          </Link>
          <p className="text-gray-600 text-sm leading-relaxed mb-4">
            {t('footerDescription')}
          </p>
          <div className="flex justify-center space-x-4 mb-6">
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

        {/* Bottom Bar */}
        <div className="border-t border-white/10 pt-8 mt-8 flex flex-col md:flex-row justify-between items-center text-sm text-gray-500">
          <p className="mb-4 md:mb-0">&copy; {currentYear} Newomen. {t('allRightsReserved')}</p>
          <div className="flex items-center space-x-4">
            <Link to="/privacy" className="hover:text-primary-500 transition-colors duration-300">{t('privacy')}</Link>
            <span className="opacity-50">|</span>
            <Link to="/terms" className="hover:text-primary-500 transition-colors duration-300">{t('terms')}</Link>
          </div>
        </div>
      </div>
    </motion.footer>
  );
};

export default Footer;
