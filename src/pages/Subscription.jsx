import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../components/common/SafeIcon';
import { useAuthStore } from '../store/authStore';

const { FiCheck, FiStar, FiZap, FiCrown } = FiIcons;

const Subscription = () => {
  const { t } = useTranslation();
  const { subscription, updateSubscription } = useAuthStore();
  const [selectedTier, setSelectedTier] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const tiers = [
    {
      id: 'discovery',
      name: t('discoveryTier'),
      price: 0,
      minutes: 10,
      icon: FiStar,
      color: 'from-gray-400 to-gray-600',
      features: [
        'AI conversations',
        'Basic emotional support',
        'Limited shadow work',
        'Community access',
      ],
    },
    {
      id: 'growth',
      name: t('growthTier'),
      price: 22,
      minutes: 100,
      icon: FiZap,
      color: 'from-primary-400 to-primary-600',
      features: [
        'Everything in Discovery',
        'Advanced AI conversations',
        'Full shadow work journey',
        'Personalized insights',
        'Voice interactions',
        'Progress tracking',
      ],
    },
    {
      id: 'transformation',
      name: t('transformationTier'),
      price: 222,
      minutes: 1000,
      icon: FiCrown,
      color: 'from-accent-400 to-accent-600',
      features: [
        'Everything in Growth',
        'Priority AI responses',
        'Advanced analytics',
        'Personal coach access',
        'Custom affirmations',
        'Unlimited shadow work',
        'Premium community',
      ],
    },
  ];

  const handleSubscription = (tier) => {
    setIsProcessing(true);
    
    // Simulate payment processing
    setTimeout(() => {
      const selectedTierData = tiers.find(t => t.id === tier);
      
      updateSubscription({
        tier: tier,
        minutesRemaining: selectedTierData.minutes,
        isActive: true,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
      });
      
      toast.success(`Successfully upgraded to ${selectedTierData.name}!`);
      setSelectedTier(null);
      setIsProcessing(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8 md:mb-12"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Choose Your Journey
          </h1>
          <p className="text-lg md:text-xl text-gray-600">
            Select the subscription tier that best supports your transformation
          </p>
        </motion.div>

        {/* Current Subscription */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/80 backdrop-blur-sm rounded-xl md:rounded-2xl p-4 md:p-6 shadow-lg mb-6 md:mb-8"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Current Subscription</h3>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-3 md:space-y-0">
            <div>
              <p className="text-sm text-gray-600">Plan</p>
              <p className="font-medium text-gray-900 capitalize">{subscription.tier} Tier</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Minutes Remaining</p>
              <p className="font-medium text-gray-900">{subscription.minutesRemaining}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Status</p>
              <p className={`font-medium ${subscription.isActive ? 'text-green-600' : 'text-red-600'}`}>
                {subscription.isActive ? 'Active' : 'Expired'}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Pricing Tiers */}
        <div className="grid md:grid-cols-3 gap-6 md:gap-8 mb-8 md:mb-12">
          {tiers.map((tier, index) => (
            <motion.div
              key={tier.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + index * 0.1 }}
              className={`relative bg-white/80 backdrop-blur-sm rounded-xl md:rounded-2xl p-6 md:p-8 shadow-lg border-2 transition-all duration-300 ${
                subscription.tier === tier.id ? 'border-primary-500 ring-2 ring-primary-200' : 'border-transparent hover:border-gray-300'
              }`}
            >
              {/* Popular Badge */}
              {tier.id === 'growth' && (
                <div className="absolute -top-3 md:-top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-primary-500 text-white px-3 md:px-4 py-1 rounded-full text-xs md:text-sm font-medium">
                    Most Popular
                  </div>
                </div>
              )}
              
              {/* Current Plan Badge */}
              {subscription.tier === tier.id && (
                <div className="absolute -top-3 md:-top-4 right-4">
                  <div className="bg-green-500 text-white px-2 md:px-3 py-1 rounded-full text-xs md:text-sm font-medium">
                    Current
                  </div>
                </div>
              )}
              
              <div className="text-center mb-5 md:mb-6">
                <div className={`w-12 h-12 md:w-16 md:h-16 mx-auto mb-3 md:mb-4 rounded-xl md:rounded-2xl bg-gradient-to-r ${tier.color} flex items-center justify-center`}>
                  <SafeIcon icon={tier.icon} className="w-6 h-6 md:w-8 md:h-8 text-white" />
                </div>
                
                <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">{tier.name}</h3>
                
                <div className="mb-3 md:mb-4">
                  {tier.price === 0 ? (
                    <span className="text-2xl md:text-3xl font-bold text-gray-900">Free</span>
                  ) : (
                    <div>
                      <span className="text-2xl md:text-3xl font-bold text-gray-900">${tier.price}</span>
                      <span className="text-gray-600">/month</span>
                    </div>
                  )}
                </div>
                
                <p className="text-gray-600">
                  {tier.minutes} minutes included
                </p>
              </div>
              
              <ul className="space-y-2 md:space-y-3 mb-6 md:mb-8">
                {tier.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-start space-x-3">
                    <SafeIcon icon={FiCheck} className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-xs md:text-sm text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
              
              {tier.id !== subscription.tier && (
                <div className="space-y-4">
                  {tier.price === 0 ? (
                    <button
                      onClick={() => {
                        updateSubscription({
                          tier: tier.id,
                          minutesRemaining: tier.minutes,
                          isActive: true,
                        });
                        toast.success('Switched to Discovery tier!');
                      }}
                      className="w-full py-2 md:py-3 px-4 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                    >
                      Switch to Free
                    </button>
                  ) : (
                    <button
                      onClick={() => handleSubscription(tier.id)}
                      disabled={isProcessing}
                      className="w-full py-2 md:py-3 px-4 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-lg font-semibold hover:shadow-lg transition-all duration-300 disabled:opacity-70"
                    >
                      {isProcessing ? 'Processing...' : `Subscribe - $${tier.price}`}
                    </button>
                  )}
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {/* FAQ Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white/80 backdrop-blur-sm rounded-xl md:rounded-2xl p-6 md:p-8 shadow-lg"
        >
          <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-6 text-center">
            Frequently Asked Questions
          </h3>
          
          <div className="grid md:grid-cols-2 gap-4 md:gap-6">
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">How do minutes work?</h4>
              <p className="text-xs md:text-sm text-gray-600">
                Minutes are consumed based on your conversation length with the AI. Voice interactions and longer text conversations use more minutes.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Can I change my plan anytime?</h4>
              <p className="text-xs md:text-sm text-gray-600">
                Yes, you can upgrade or downgrade your subscription at any time. Changes take effect immediately.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">What happens if I run out of minutes?</h4>
              <p className="text-xs md:text-sm text-gray-600">
                You can upgrade your plan or purchase additional minutes. Your conversation history is always preserved.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Is my data secure?</h4>
              <p className="text-xs md:text-sm text-gray-600">
                Absolutely. All conversations are encrypted and we follow strict privacy protocols to protect your personal information.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Subscription;