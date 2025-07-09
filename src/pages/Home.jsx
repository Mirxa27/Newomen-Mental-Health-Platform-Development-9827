import React from 'react';
import PageWrapper from '../components/layout/PageWrapper';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FiArrowRight } from 'react-icons/fi';
import { useAuthStore } from '../store/authStore';
import DailyAffirmation from '../components/dashboard/DailyAffirmation';
import MoodTracker from '../components/dashboard/MoodTracker';
import GlassCard from '../components/common/GlassCard';

const Home = () => {
  const { user } = useAuthStore();

  const features = [
    { title: "Connection Journey", description: "Explore your relationships.", link: "/connection-journey" },
    { title: "Chat with Newomen", description: "Your AI companion.", link: "/chat" },
    { title: "Breathing Practices", description: "Find your calm.", link: "/breathing" },
  ];

  return (
    <PageWrapper>
      <div className="space-y-8 p-4">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <h1 className="text-3xl font-bold text-gray-800">Welcome, {user?.name || 'Guest'}!</h1>
        </motion.div>

        <DailyAffirmation />
        <MoodTracker />

        <div className="grid md:grid-cols-3 gap-4">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index }}
            >
              <Link to={feature.link}>
                <GlassCard className="p-6 h-full flex flex-col justify-between">
                  <div>
                    <h3 className="text-xl font-bold">{feature.title}</h3>
                    <p className="text-gray-600">{feature.description}</p>
                  </div>
                  <FiArrowRight className="self-end mt-4" />
                </GlassCard>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </PageWrapper>
  );
};

export default Home;