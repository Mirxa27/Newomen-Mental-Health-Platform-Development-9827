# Newomen - Your Journey to Authentic Self

A comprehensive AI-powered platform for women's mental health and personal growth through culturally-sensitive conversations and shadow work.

## 🌟 Features

### Core Functionality
- **AI Companion Chat**: Culturally-aware conversations with emotional intelligence
- **Shadow Work Journey**: Guided self-discovery through structured questionnaires
- **Voice Interactions**: Real-time voice chat with AI companion
- **Multi-language Support**: English and Arabic with cultural context
- **Progressive Web App**: Full mobile experience with offline capabilities

### Mobile-First Design
- **Responsive Layout**: Optimized for all screen sizes
- **Touch-Friendly Interface**: 44px+ touch targets for accessibility
- **Native App Ready**: Capacitor integration for iOS and Android
- **Offline Support**: Service worker with caching strategies
- **Push Notifications**: Real-time engagement features

### Technical Features
- **Real-time Voice**: WebRTC and Speech APIs integration powered by the [OpenAI Agents SDK](https://openai.github.io/openai-agents-js/guides/voice-agents/quickstart/)
- **Secure Authentication**: Role-based access control
- **Admin Dashboard**: Comprehensive management interface

 - **AI Provider Management**: Configure OpenAI, Anthropic and custom models under `/admin/ai-providers`. Provider settings are stored locally so they persist between sessions and all chat and voice interactions automatically use the selected provider, endpoint, model and tuning parameters.
- **Analytics**: User engagement and usage tracking
- **Subscription Management**: Tiered pricing with usage tracking

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/newomen-platform.git
   cd newomen-platform
   ```

2. **Install dependencies** (run this from the project root)
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Configure your `.env` file with:
   - OpenAI API key
   - Supabase credentials (if using backend)
   - Other service configurations

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open in browser**
   Navigate to `http://localhost:5173`

## 📱 Mobile Development

### PWA Development
The app is built as a Progressive Web App (PWA) with:
- Service Worker for offline functionality
- Web App Manifest for installation
- Responsive design with mobile-first approach

### Native App Development

#### Android
```bash
npm run build:android
```

#### iOS
```bash
npm run build:ios
```

### Mobile Testing
- **Local Development**: Use Chrome DevTools device simulation
- **Real Device Testing**: Access via local network IP
- **PWA Testing**: Test installation and offline features

## 🏗️ Architecture

### Frontend
- **React 18**: Modern React with hooks and functional components
- **Vite**: Fast build tool and development server
- **Tailwind CSS**: Utility-first CSS framework
- **Framer Motion**: Smooth animations and transitions
- **React Router**: Client-side routing
- **Zustand**: State management

### Mobile Integration
- **Capacitor**: Native functionality bridge
- **PWA**: Progressive Web App capabilities
- **Service Workers**: Offline support and caching
- **Web APIs**: Camera, microphone, geolocation access

### AI Integration
- **OpenAI API**: GPT-4 for conversations
- **Speech Recognition**: Browser Speech API
- **Speech Synthesis**: Text-to-speech capabilities
- **Cultural Context**: MENA-specific AI responses

## 📂 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── admin/          # Admin dashboard components
│   ├── auth/           # Authentication components
│   ├── chat/           # Chat and voice components
│   ├── common/         # Shared components
│   ├── layout/         # Layout components
│   └── navigation/     # Navigation components
├── hooks/              # Custom React hooks
├── layouts/            # Page layouts
├── pages/              # Page components
├── services/           # API and external services
├── store/              # State management
├── utils/              # Utility functions
├── i18n/               # Internationalization
└── router/             # Route configuration
```

## 🔧 Configuration

### Environment Variables
```bash
# OpenAI
VITE_OPENAI_API_KEY=your_openai_key_here

# Supabase (optional)
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_key

# App Configuration
VITE_APP_ENV=development
```

Create a `.env` file based on `.env.example` and make sure `VITE_OPENAI_API_KEY` is set to a valid key. The admin panel allows storing provider keys, but the fallback environment value is required for voice chat initialization.

When running the app locally you can also store your OpenAI API key in the browser by navigating to **Admin → AI Provider Settings**, editing the default provider and entering your key. The realtime voice service will read this value automatically if the backend endpoint is unavailable.
If you see "Missing API key" errors when starting a voice session, ensure the key is stored in the admin panel or defined as `VITE_OPENAI_API_KEY`.

### Admin Access
- Set the admin email in your `.env` file:
  ```bash
  VITE_ADMIN_EMAIL=admin@example.com
  ```
- Use any password during development (demo mode)

## 📱 Mobile Features

### Native Capabilities
- **Haptic Feedback**: Touch feedback on interactions
- **Status Bar**: Native status bar styling
- **Safe Area**: Support for notched devices
- **Keyboard Handling**: Smart keyboard behavior
- **Network Detection**: Online/offline status
- **Share Integration**: Native sharing capabilities

### PWA Features
- **Install Prompt**: Smart installation prompts
- **Offline Mode**: Cached content and functionality
- **Push Notifications**: Engagement features
- **Background Sync**: Data synchronization

## 🎨 Design System

### Colors
- **Primary**: Purple gradient (#667eea to #764ba2)
- **Secondary**: Blue tones
- **Accent**: Orange highlights
- **Neutral**: Grayscale palette

### Typography
- **Headings**: Bold, clear hierarchy
- **Body Text**: Readable, accessible
- **Arabic Support**: Noto Sans Arabic font

### Spacing
- **Touch Targets**: Minimum 44px
- **Padding**: Consistent 4px grid
- **Margins**: Responsive spacing

## 🧪 Testing

### Development Testing
```bash
npm run dev
```

### Build Testing
```bash
npm run build
npm run preview
```

### Mobile Testing
1. **Chrome DevTools**: Device simulation
2. **Local Network**: Test on real devices
3. **Lighthouse**: Performance and PWA audits

## 🚀 Deployment

### Web Deployment
```bash
npm run build
```

Deploy the `dist` folder to your hosting provider.

### Mobile App Deployment

#### Android
1. Build the app: `npm run build:android`
2. Open Android Studio
3. Build and sign APK/Bundle
4. Deploy to Google Play Store

#### iOS
1. Build the app: `npm run build:ios`
2. Open Xcode
3. Configure signing and provisioning
4. Deploy to App Store

## 🔒 Security

- **API Key Security**: Environment variables and server-side generation
- **Authentication**: Secure session management
- **Data Privacy**: No sensitive data stored locally
- **HTTPS**: Secure communication protocols

## 🌍 Localization

### Supported Languages
- **English**: Primary language
- **Arabic**: Cultural context and RTL support

### Adding Languages
1. Add translations to `src/i18n/config.js`
2. Update language detection
3. Test RTL layouts if needed

## 📊 Analytics

- **User Engagement**: Conversation metrics
- **Usage Tracking**: Feature utilization
- **Performance**: Load times and errors
- **Business Metrics**: Subscription and retention

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is proprietary. All rights reserved.

## 📞 Support

For support and questions:
- **Email**: support@newomen.com
- **Documentation**: [docs.newomen.com](https://docs.newomen.com)
- **Issues**: GitHub Issues

## 🚀 Future Roadmap

### Short Term
- [ ] Enhanced voice features
- [ ] More languages
- [ ] Advanced analytics
- [ ] Community features

### Long Term
- [ ] AI model training
- [ ] Wearable integration
- [ ] Therapy provider network
- [ ] Advanced personalization

---

Built with ❤️ for women's empowerment and authentic self-discovery.
