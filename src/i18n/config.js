import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  en: {
    translation: {
      // Navigation
      home: "Home",
      chat: "Chat",
      shadowWork: "Shadow Work",
      profile: "Profile",
      subscription: "Subscription",
      admin: "Admin",
      
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
      home: "الرئيسية",
      chat: "المحادثة",
      shadowWork: "عمل الظل",
      profile: "الملف الشخصي",
      subscription: "الاشتراك",
      admin: "الإدارة",
      
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
