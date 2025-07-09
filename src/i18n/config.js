import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  en: {
    translation: {
      // Navigation
      nav: {
        home: "Home",
        chat: "Chat",
        shadowWork: "Shadow Work",
        breathing: "Breathing Practices",
        personalityTest: "Personality Test",
        search: "Search",
        profile: "Profile",
        subscription: "Subscription",
        settings: "Settings",
        admin: "Admin",
        more: "More",
        quickActions: "Quick Actions",
        user: "User",
        newMe: "New Me",
        navigation: "Navigation",
        growth: "Growth",
        wellness: "Wellness",
        tools: "Tools",
        analytics: "Analytics",
        menu: "Menu",
        exploreFeatures: "Explore Features",
        growthDevelopment: "Growth & Development",
        quickTools: "Quick Tools",
        usageTip: "Tap and hold for quick actions, swipe for shortcuts",
        
        // Descriptions
        homeDesc: "Your journey starts here",
        chatDesc: "Talk with your AI companion",
        profileDesc: "Your personal space",
        shadowWorkDesc: "Explore your inner self",
        newMeDesc: "Daily growth challenges",
        breathingDesc: "Mindful breathing exercises",
        personalityTestDesc: "Discover your type",
        searchDesc: "Find and connect",
        subscriptionDesc: "Unlock premium features",
        settingsDesc: "Customize your experience"
      },
      
      // Breadcrumb
      breadcrumb: {
        home: "Home",
        about: "About",
        chat: "Chat",
        shadowWork: "Shadow Work",
        profile: "Profile",
        breathing: "Breathing Practices",
        search: "Search",
        personalityTest: "Personality Test",
        subscription: "Subscription",
        settings: "Settings",
        newMe: "New Me",
        auth: "Authentication",
        login: "Login",
        register: "Register",
        forgotPassword: "Forgot Password",
        admin: "Admin",
        realtime: "Real-Time",
        users: "Users",
        conversations: "Conversations",
        prompts: "Prompts",
        analytics: "Analytics",
        aiProviders: "AI Providers",
        branding: "Branding",
        therapeuticAgents: "Therapeutic Agents",
        navigation: "Navigation"
      },
      
      // Brand
      brand: {
        name: "Newomen"
      },
      
      // Legacy navigation (for backward compatibility)
      home: "Home",
      chat: "Chat",
      shadowWork: "Shadow Work",
      breathing: "Breathing Practices",
      breathingPractices: "Breathing Practices", 
      personalityTest: "Personality Test",
      search: "Search",
      profile: "Profile",
      subscription: "Subscription",
      settings: "Settings",
      admin: "Admin",
      more: "More",
      
      // Common
      welcome: "Welcome",
      continue: "Continue",
      back: "Back",
      next: "Next",
      save: "Save",
      cancel: "Cancel",
      loading: "Loading...",
      error: "Error",
      success: "Success",
      switchLanguage: "Switch Language",
      signIn: "Sign In",
      signUp: "Sign Up",
      selfDiscovery: "Self Discovery",
      close: "Close",
      userProfile: "User Profile",
      
      // Authentication
      login: "Login",
      register: "Register",
      logout: "Logout",
      email: "Email",
      password: "Password",
      confirmPassword: "Confirm Password",
      forgotPassword: "Forgot Password?",
      
      // Home
      homeTitle: "Your Journey to Authentic Self",
      homeSubtitle: "Discover your inner wisdom through culturally-aware conversations",
      startJourney: "Start Your Journey",
      
      // Chat
      chatPlaceholder: "Share what's on your heart...",
      voiceInput: "Voice Input",
      sendMessage: "Send Message",
      
      // Shadow Work
      shadowWorkTitle: "Shadow Work Journey",
        shadowWorkSubtitle: "Explore your inner depths and transform old patterns",
      question: "Question",
      of: "of",
      
      // Subscription
      discoveryTier: "Discovery Tier",
      growthTier: "Growth Tier",
      transformationTier: "Transformation Tier",
      freeMinutes: "{{minutes}} free minutes",
      minutesFor: "{{minutes}} minutes for ${{price}}",
      
      // Footer
      product: "Product",
      company: "Company",
      support: "Support",
      legal: "Legal",
      features: "Features",
      pricing: "Pricing",
      voiceChat: "Voice Chat",
      about: "About",
      blog: "Blog",
      careers: "Careers",
      contact: "Contact",
      helpCenter: "Help Center",
      community: "Community",
      faq: "FAQ",
      feedback: "Feedback",
      privacy: "Privacy Policy",
      terms: "Terms of Service",
      cookies: "Cookie Policy",
      disclaimer: "Disclaimer",
      stayConnected: "Stay Connected",
      newsletterDescription: "Get updates on new features and wellness tips",
      emailPlaceholder: "Enter your email",
      subscribe: "Subscribe",
      allRightsReserved: "All rights reserved",
      madeWith: "Made with",
      forWomen: "for women",
      footerDescription: "AI-powered platform for women's mental health and personal growth through culturally-sensitive conversations.",
      help: "Help",
      
      // Cultural expressions
      habibti: "حبيبتي",
      inshallah: "إن شاء الله",
      mashallah: "ما شاء الله",
      alhamdulillah: "الحمد لله",
    }
  },
  ar: {
    translation: {
      // Navigation
      nav: {
        home: "الرئيسية",
        chat: "المحادثة",
        shadowWork: "عمل الظل",
        breathing: "تمارين التنفس",
        personalityTest: "اختبار الشخصية",
        search: "البحث",
        profile: "الملف الشخصي",
        subscription: "الاشتراك",
        settings: "الإعدادات",
        admin: "الإدارة",
        more: "المزيد",
        quickActions: "الإجراءات السريعة",
        user: "المستخدم",
        newMe: "أنا الجديدة",
        navigation: "التنقل",
        growth: "النمو",
        wellness: "العافية",
        tools: "الأدوات",
        analytics: "التحليلات",
        menu: "القائمة",
        exploreFeatures: "استكشف الميزات",
        growthDevelopment: "النمو والتطوير",
        quickTools: "الأدوات السريعة",
        usageTip: "اضغط مع الاستمرار للإجراءات السريعة، اسحب للاختصارات",
        
        // Descriptions
        homeDesc: "رحلتك تبدأ هنا",
        chatDesc: "تحدث مع رفيقك الذكي",
        profileDesc: "مساحتك الشخصية",
        shadowWorkDesc: "اكتشف ذاتك الداخلية",
        newMeDesc: "تحديات النمو اليومية",
        breathingDesc: "تمارين التنفس الواعي",
        personalityTestDesc: "اكتشف نوع شخصيتك",
        searchDesc: "اعثر وتواصل",
        subscriptionDesc: "فتح الميزات المميزة",
        settingsDesc: "خصص تجربتك"
      },
      
      // Breadcrumb
      breadcrumb: {
        home: "الرئيسية",
        about: "حول",
        chat: "المحادثة",
        shadowWork: "عمل الظل",
        profile: "الملف الشخصي",
        breathing: "تمارين التنفس",
        search: "البحث",
        personalityTest: "اختبار الشخصية",
        subscription: "الاشتراك",
        settings: "الإعدادات",
        newMe: "أنا الجديدة",
        auth: "المصادقة",
        login: "تسجيل الدخول",
        register: "إنشاء حساب",
        forgotPassword: "نسيت كلمة المرور",
        admin: "الإدارة",
        realtime: "الوقت الفعلي",
        users: "المستخدمون",
        conversations: "المحادثات",
        prompts: "الاستفسارات",
        analytics: "التحليلات",
        aiProviders: "مقدمي الذكاء الاصطناعي",
        branding: "العلامة التجارية",
        therapeuticAgents: "الوكلاء العلاجيون",
        navigation: "التنقل"
      },
      
      // Brand
      brand: {
        name: "نيوومن"
      },
      
      // Legacy navigation (for backward compatibility)
      home: "الرئيسية",
      chat: "المحادثة",
      shadowWork: "عمل الظل",
      breathing: "تمارين التنفس",
      breathingPractices: "تمارين التنفس",
      personalityTest: "اختبار الشخصية",
      search: "البحث",
      profile: "الملف الشخصي",
      subscription: "الاشتراك",
      settings: "الإعدادات",
      admin: "الإدارة",
      more: "المزيد",
      
      // Common
      welcome: "مرحباً",
      continue: "متابعة",
      back: "رجوع",
      next: "التالي",
      save: "حفظ",
      cancel: "إلغاء",
      loading: "جاري التحميل...",
      error: "خطأ",
      success: "نجح",
      switchLanguage: "تغيير اللغة",
      signIn: "تسجيل الدخول",
      signUp: "إنشاء حساب",
      selfDiscovery: "اكتشاف الذات",
      close: "إغلاق",
      userProfile: "الملف الشخصي للمستخدم",
      
      // Authentication
      login: "تسجيل الدخول",
      register: "إنشاء حساب",
      logout: "تسجيل الخروج",
      email: "البريد الإلكتروني",
      password: "كلمة المرور",
      confirmPassword: "تأكيد كلمة المرور",
      forgotPassword: "نسيت كلمة المرور؟",
      
      // Home
      homeTitle: "رحلتك نحو ذاتك الحقيقية",
      homeSubtitle: "اكتشفي حكمتك الداخلية من خلال محادثات واعية ثقافياً",
      startJourney: "ابدئي رحلتك",
      
      // Chat
      chatPlaceholder: "شاركي ما يدور في قلبك...",
      voiceInput: "إدخال صوتي",
      sendMessage: "إرسال الرسالة",
      
      // Shadow Work
      shadowWorkTitle: "رحلة عمل الظل",
        shadowWorkSubtitle: "استكشفي أعماقك وحولي الأنماط القديمة",
      question: "السؤال",
      of: "من",
      
      // Subscription
      discoveryTier: "باقة الاكتشاف",
      growthTier: "باقة النمو",
      transformationTier: "باقة التحول",
      freeMinutes: "{{minutes}} دقيقة مجانية",
      minutesFor: "{{minutes}} دقيقة مقابل ${{price}}",
      
      // Footer
      product: "المنتج",
      company: "الشركة",
      support: "الدعم",
      legal: "القانونية",
      features: "الميزات",
      pricing: "التسعير",
      voiceChat: "المحادثة الصوتية",
      about: "حول",
      blog: "المدونة",
      careers: "الوظائف",
      contact: "اتصل بنا",
      helpCenter: "مركز المساعدة",
      community: "المجتمع",
      faq: "الأسئلة الشائعة",
      feedback: "التعليقات",
      privacy: "سياسة الخصوصية",
      terms: "شروط الخدمة",
      cookies: "سياسة الكوكيز",
      disclaimer: "إخلاء المسؤولية",
      stayConnected: "ابقي متصلة",
      newsletterDescription: "احصلي على تحديثات حول الميزات الجديدة ونصائح الصحة النفسية",
      emailPlaceholder: "أدخلي بريدك الإلكتروني",
      subscribe: "اشتراك",
      allRightsReserved: "جميع الحقوق محفوظة",
      madeWith: "صنع بـ",
      forWomen: "للنساء",
      footerDescription: "منصة مدعومة بالذكاء الاصطناعي لصحة المرأة النفسية والنمو الشخصي من خلال محادثات واعية ثقافياً.",
      help: "المساعدة",
      
      // Cultural expressions
      habibti: "حبيبتي",
      inshallah: "إن شاء الله",
      mashallah: "ما شاء الله",
      alhamdulillah: "الحمد لله",
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    debug: import.meta.env.MODE === 'development',
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
    },
  });
export default i18n;
