// SEO Configuration for URL structures and metadata
export const seoConfig = {
  // Site-wide defaults
  site: {
    name: 'Newomen Mental Health Platform',
    description: 'AI-powered platform for women\'s mental health and personal growth through culturally-sensitive conversations.',
    url: 'https://newomen.com',
    image: '/og-image.jpg',
    twitterHandle: '@newomen',
    locale: 'en_US',
    type: 'website'
  },

  // URL structures for different content types
  urlStructures: {
    // Main pages
    home: {
      path: '/',
      title: 'Home',
      description: 'AI-powered platform for women\'s mental health and personal growth.',
      keywords: ['mental health', 'women', 'AI', 'personal growth', 'therapy', 'wellness'],
      priority: 1.0,
      changefreq: 'weekly'
    },
    about: {
      path: '/about',
      title: 'About Us',
      description: 'Learn about our mission to empower women through AI-powered mental health support.',
      keywords: ['about', 'mission', 'women mental health', 'AI therapy', 'team'],
      priority: 0.8,
      changefreq: 'monthly'
    },
    
    // User-specific pages
    chat: {
      path: '/chat',
      title: 'AI Chat',
      description: 'Chat with our AI therapist for personalized mental health support.',
      keywords: ['AI chat', 'therapy', 'mental health support', 'counseling', 'conversation'],
      priority: 0.9,
      changefreq: 'daily'
    },
    profile: {
      path: '/profile',
      title: 'Profile',
      description: 'Manage your profile and track your mental health journey.',
      keywords: ['profile', 'settings', 'mental health progress', 'personal data'],
      priority: 0.7,
      changefreq: 'weekly'
    },
    
    // Feature pages
    shadowWork: {
      path: '/shadow-work',
      title: 'Shadow Work',
      description: 'Explore your inner self through guided shadow work exercises.',
      keywords: ['shadow work', 'self-discovery', 'psychology', 'inner growth', 'jung'],
      priority: 0.8,
      changefreq: 'weekly'
    },
    shadowWorkQuestion: {
      path: '/shadow-work/:questionId',
      title: 'Shadow Work Question',
      description: 'Dive deep into specific shadow work questions for personal growth.',
      keywords: ['shadow work questions', 'self-reflection', 'personal development'],
      priority: 0.7,
      changefreq: 'monthly'
    },
    breathing: {
      path: '/breathing',
      title: 'Breathing Practices',
      description: 'Learn and practice breathing techniques for relaxation and stress relief.',
      keywords: ['breathing exercises', 'meditation', 'stress relief', 'relaxation', 'mindfulness'],
      priority: 0.8,
      changefreq: 'weekly'
    },
    newMe: {
      path: '/new-me',
      title: 'New Me - Daily Challenges',
      description: 'Take on daily challenges to transform yourself and build better habits.',
      keywords: ['daily challenges', 'personal growth', 'habits', 'self-improvement', 'transformation'],
      priority: 0.8,
      changefreq: 'daily'
    },
    
    // Assessment pages
    personalityTest: {
      path: '/personality-test',
      title: 'Personality Test',
      description: 'Discover your personality type with our comprehensive assessment.',
      keywords: ['personality test', 'psychology', 'self-assessment', 'personality type', 'MBTI'],
      priority: 0.8,
      changefreq: 'monthly'
    },
    
    // Community features
    search: {
      path: '/search',
      title: 'Search',
      description: 'Search for users and connect with the community.',
      keywords: ['search', 'community', 'users', 'social', 'connect'],
      priority: 0.6,
      changefreq: 'weekly'
    },
    
    // Account management
    subscription: {
      path: '/subscription',
      title: 'Subscription',
      description: 'Choose your subscription plan for premium features.',
      keywords: ['subscription', 'premium', 'pricing', 'mental health services', 'plans'],
      priority: 0.7,
      changefreq: 'monthly'
    },
    settings: {
      path: '/settings',
      title: 'Settings',
      description: 'Customize your experience and manage your account settings.',
      keywords: ['settings', 'account', 'preferences', 'customization', 'privacy'],
      priority: 0.6,
      changefreq: 'monthly'
    },
    
    // Authentication pages
    login: {
      path: '/auth/login',
      title: 'Login',
      description: 'Sign in to your account to access personalized mental health support.',
      keywords: ['login', 'sign in', 'account', 'authentication', 'access'],
      priority: 0.5,
      changefreq: 'yearly'
    },
    register: {
      path: '/auth/register',
      title: 'Register',
      description: 'Create your account to start your mental health journey.',
      keywords: ['register', 'sign up', 'create account', 'join', 'start'],
      priority: 0.7,
      changefreq: 'yearly'
    },
    forgotPassword: {
      path: '/auth/forgot-password',
      title: 'Forgot Password',
      description: 'Reset your password to regain access to your account.',
      keywords: ['forgot password', 'reset password', 'account recovery', 'help'],
      priority: 0.3,
      changefreq: 'yearly'
    }
  },

  // Dynamic content generators
  generateMetadata: (route, params = {}) => {
    const config = seoConfig.urlStructures[route];
    if (!config) return null;

    let title = config.title;
    let description = config.description;
    let path = config.path;

    // Handle dynamic routes
    if (route === 'shadowWorkQuestion' && params.questionId) {
      title = `Shadow Work Question ${params.questionId}`;
      description = `Explore question ${params.questionId} in your shadow work journey for deeper self-discovery.`;
      path = `/shadow-work/${params.questionId}`;
    }

    return {
      title: `${title} | ${seoConfig.site.name}`,
      description,
      keywords: config.keywords.join(', '),
      url: `${seoConfig.site.url}${path}`,
      image: seoConfig.site.image,
      type: seoConfig.site.type,
      priority: config.priority,
      changefreq: config.changefreq
    };
  },

  // Structured data generators
  generateStructuredData: (route, params = {}) => {
    const metadata = seoConfig.generateMetadata(route, params);
    if (!metadata) return null;

    const baseStructuredData = {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: metadata.title,
      description: metadata.description,
      url: metadata.url,
      image: metadata.image,
      publisher: {
        '@type': 'Organization',
        name: seoConfig.site.name,
        url: seoConfig.site.url
      }
    };

    // Add specific structured data based on route
    switch (route) {
      case 'about':
        return {
          ...baseStructuredData,
          '@type': 'AboutPage'
        };
      
      case 'personalityTest':
        return {
          ...baseStructuredData,
          '@type': 'WebApplication',
          applicationCategory: 'HealthApplication',
          operatingSystem: 'Web'
        };
      
      case 'shadowWork':
      case 'shadowWorkQuestion':
        return {
          ...baseStructuredData,
          '@type': 'EducationalOrganization',
          educationalUse: 'Self-improvement',
          audience: {
            '@type': 'Audience',
            audienceType: 'Women seeking personal growth'
          }
        };
      
      default:
        return baseStructuredData;
    }
  },

  // Sitemap generation helper
  generateSitemapEntry: (route, params = {}) => {
    const config = seoConfig.urlStructures[route];
    if (!config) return null;

    let path = config.path;
    if (route === 'shadowWorkQuestion' && params.questionId) {
      path = `/shadow-work/${params.questionId}`;
    }

    return {
      url: `${seoConfig.site.url}${path}`,
      lastmod: new Date().toISOString(),
      changefreq: config.changefreq,
      priority: config.priority
    };
  },

  // Open Graph and Twitter Card generators
  generateSocialMeta: (route, params = {}) => {
    const metadata = seoConfig.generateMetadata(route, params);
    if (!metadata) return null;

    return {
      openGraph: {
        title: metadata.title,
        description: metadata.description,
        url: metadata.url,
        type: metadata.type,
        image: metadata.image,
        siteName: seoConfig.site.name,
        locale: seoConfig.site.locale
      },
      twitter: {
        card: 'summary_large_image',
        site: seoConfig.site.twitterHandle,
        title: metadata.title,
        description: metadata.description,
        image: metadata.image
      }
    };
  }
};

export default seoConfig;