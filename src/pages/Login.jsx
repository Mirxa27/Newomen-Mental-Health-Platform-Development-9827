import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { 
  FiMail, 
  FiLock, 
  FiEye, 
  FiEyeOff, 
  FiArrowRight,
  FiUser 
} from 'react-icons/fi';
// Assuming useAuth is correctly set up in your context
// import { useAuth } from '../context/AuthContext.jsx';

// --- Mock implementation for demonstration ---
const useAuth = () => ({
  login: async (email, password) => {
    console.log('Logging in with:', email, password);
    if (email === import.meta.env.VITE_ADMIN_EMAIL) {
      return { role: 'admin' };
    }
    return { role: 'user' };
  }
});
// --- End Mock ---

const Login = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      toast.error("Please enter both email and password.");
      return;
    }
    setIsLoading(true);
    
    try {
      const userData = await login(formData.email, formData.password);
      toast.success(`Welcome back${userData.role === 'admin' ? ', Admin' : ''}!`);
      navigate(userData.role === 'admin' ? '/admin' : '/chat');
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Login failed. Please check your credentials.';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden text-white">
      {/* Animated Background */}
      <div className="absolute inset-0 animated-gradient-bg z-0" />
      <div className="absolute top-0 -right-24 w-96 h-96 bg-primary-500/20 rounded-full filter blur-3xl animate-liquid-blob" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-secondary-500/20 rounded-full filter blur-3xl animate-liquid-blob animation-delay-4000" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 max-w-md w-full"
      >
        {/* Logo and Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-block mb-6 group">
            <motion.div 
              whileHover={{ scale: 1.1, rotate: 5 }}
              className="w-16 h-16 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-2xl flex items-center justify-center shadow-lg"
            >
              <span className="text-white font-bold text-3xl">N</span>
            </motion.div>
          </Link>
          <h2 className="text-4xl font-bold mb-2 animated-gradient-text">
            {t('welcome', 'Welcome')} Back
          </h2>
          <p className="text-gray-300">
            Continue your journey of self-discovery.
          </p>
        </div>

        {/* Admin Login Hint */}
        {import.meta.env.VITE_ADMIN_EMAIL && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="mb-6 p-4 rounded-2xl bg-blue-500/10 border border-blue-400/20"
          >
            <div className="flex items-start space-x-3">
              <div className="p-2 rounded-full bg-blue-500/20">
                <FiUser className="w-5 h-5 text-blue-300" />
              </div>
              <div>
                <p className="text-sm text-blue-200 font-medium">Admin Demo Access</p>
                <p className="text-xs text-blue-300 mt-1">Email: {import.meta.env.VITE_ADMIN_EMAIL}</p>
                <p className="text-xs text-blue-300">Password: (any password)</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Login Form */}
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          onSubmit={handleSubmit}
          className="p-8 space-y-6 bg-gray-900/30 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl"
        >
          {/* Email Input */}
          <div className="relative group">
            <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-400 transition-colors w-5 h-5" />
            <input
              id="email" name="email" type="email" required
              value={formData.email} onChange={handleChange}
              className="auth-input" placeholder="Enter your email"
            />
          </div>
          
          {/* Password Input */}
          <div className="relative group">
            <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-400 transition-colors w-5 h-5" />
            <input
              id="password" name="password" type={showPassword ? 'text' : 'password'} required
              value={formData.password} onChange={handleChange}
              className="auth-input pr-12" placeholder="Enter your password"
            />
            <button
              type="button" onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
            </button>
          </div>
          
          <div className="text-right">
            <Link to="/auth/forgot-password" className="text-sm text-primary-400 hover:text-primary-300 font-medium transition-colors">
              {t('forgotPassword', 'Forgot Password?')}
            </Link>
          </div>
          
          <motion.button
            type="submit" disabled={isLoading}
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            className="w-full py-3 text-lg font-semibold flex items-center justify-center space-x-2 group bg-primary-500 hover:bg-primary-600 rounded-xl text-white shadow-lg shadow-primary-500/20 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span>{isLoading ? 'Signing in...' : t('login', 'Login')}</span>
            {!isLoading && <FiArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
          </motion.button>
          
          <div className="text-center text-gray-400">
            Don't have an account?{' '}
            <Link to="/auth/register" className="text-primary-400 hover:text-primary-300 font-semibold transition-colors">
              {t('register', 'Sign Up')}
            </Link>
          </div>
        </motion.form>
      </motion.div>

      <style>{`
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
        @keyframes animated-gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animated-gradient-bg {
          background: linear-gradient(-45deg, #0f172a, #1e1b4b, #312e81, #4f46e5);
          background-size: 400% 400%;
          animation: animated-gradient 25s ease infinite;
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
        .animation-delay-4000 { animation-delay: -20s; }
        .auth-input {
          width: 100%;
          padding: 1rem 1rem 1rem 3rem;
          border-radius: 0.75rem;
          background-color: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: white;
          transition: border-color 0.3s, box-shadow 0.3s;
        }
        .auth-input::placeholder {
          color: #9ca3af; /* gray-400 */
        }
        .auth-input:focus {
          outline: none;
          border-color: rgba(96, 165, 250, 0.5); /* primary-400/50 */
          box-shadow: 0 0 0 3px rgba(96, 165, 250, 0.2);
        }
      `}</style>
    </div>
  );
};

export default Login;