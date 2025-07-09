import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import { useAuthStore } from '../../store/authStore';
import { useGamificationStore } from '../../store/gamificationStore';
import toast from 'react-hot-toast';

const { FiSearch, FiUser, FiHeart, FiMessageCircle, FiStar, FiTrendingUp } = FiIcons;

// Mock community data - in production this would come from your API
const mockCommunityMembers = [
  {
    id: 1,
    nickname: "BloomingSister",
    avatar: null,
    level: 8,
    crystals: 2450,
    joinedDate: "2024-01-15",
    assessmentAreas: ["relationships", "self-esteem"],
    progressShared: {
      shadowWork: 85,
      diagnosticTests: 3,
      breathingPractices: 12
    },
    bio: "On a journey of self-discovery and healing. Love connecting with other strong women!",
    isCommunityMember: true
  },
  {
    id: 2,
    nickname: "WiseHeart",
    avatar: null,
    level: 12,
    crystals: 4200,
    joinedDate: "2023-11-20",
    assessmentAreas: ["health", "family", "self-dev"],
    progressShared: {
      shadowWork: 100,
      diagnosticTests: 5,
      breathingPractices: 25
    },
    bio: "Practicing mindfulness and supporting my sisters on their healing journeys.",
    isCommunityMember: true
  },
  {
    id: 3,
    nickname: "CourageousJourney",
    avatar: null,
    level: 6,
    crystals: 1800,
    joinedDate: "2024-03-10",
    assessmentAreas: ["self-esteem", "relationships"],
    progressShared: {
      shadowWork: 65,
      diagnosticTests: 2,
      breathingPractices: 8
    },
    bio: "Learning to love myself and build healthier relationships every day.",
    isCommunityMember: true
  },
  {
    id: 4,
    nickname: "SereneStrength",
    avatar: null,
    level: 10,
    crystals: 3100,
    joinedDate: "2023-12-05",
    assessmentAreas: ["health", "self-dev"],
    progressShared: {
      shadowWork: 90,
      diagnosticTests: 4,
      breathingPractices: 20
    },
    bio: "Finding strength in vulnerability and sharing wisdom with my community.",
    isCommunityMember: true
  }
];

const CommunitySearch = () => {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const { isFeatureUnlocked } = useGamificationStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);

  useEffect(() => {
    if (!isFeatureUnlocked('community-search')) {
      toast.error('Community search unlocks at level 6!');
    }
  }, [isFeatureUnlocked]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsLoading(true);
    
    // Mock search delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Filter mock data based on search query
    const filtered = mockCommunityMembers.filter(member =>
      member.nickname.toLowerCase().includes(searchQuery.toLowerCase()) &&
      member.isCommunityMember &&
      member.id !== user?.id // Don't show current user
    );
    
    setSearchResults(filtered);
    setIsLoading(false);
    
    if (filtered.length === 0) {
      toast.info('No community members found with that nickname.');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const getProgressColor = (percentage) => {
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (!isFeatureUnlocked('community-search')) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <SafeIcon icon={FiSearch} className="w-10 h-10 text-gray-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Community Search Locked
          </h2>
          <p className="text-gray-600 mb-6 max-w-md">
            Continue your growth journey to unlock the ability to connect with other community members!
          </p>
          <p className="text-sm text-gray-500">
            Unlocks at Level 6
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 p-4">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Community Search
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Connect with other community members by searching their nicknames. 
            Only members who have opted to share their progress are visible.
          </p>
        </motion.div>

        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg mb-8"
        >
          <div className="flex items-center space-x-4">
            <div className="flex-1 relative">
              <SafeIcon icon={FiSearch} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Search by nickname..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            <button
              onClick={handleSearch}
              disabled={!searchQuery.trim() || isLoading}
              className="px-6 py-3 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50"
            >
              {isLoading ? 'Searching...' : 'Search'}
            </button>
          </div>
        </motion.div>

        {/* Search Results */}
        <AnimatePresence>
          {searchResults.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              {searchResults.map((member, index) => (
                <motion.div
                  key={member.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all cursor-pointer"
                  onClick={() => setSelectedMember(member)}
                >
                  <div className="flex items-start space-x-4">
                    <div className="w-16 h-16 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full flex items-center justify-center">
                      {member.avatar ? (
                        <img
                          src={member.avatar}
                          alt={member.nickname}
                          className="w-16 h-16 rounded-full object-cover"
                        />
                      ) : (
                        <SafeIcon icon={FiUser} className="w-8 h-8 text-white" />
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-xl font-semibold text-gray-900">
                          {member.nickname}
                        </h3>
                        <div className="flex items-center space-x-2">
                          <div className="flex items-center space-x-1 text-yellow-600">
                            <SafeIcon icon={FiStar} className="w-4 h-4" />
                            <span className="text-sm font-medium">Level {member.level}</span>
                          </div>
                        </div>
                      </div>
                      
                      <p className="text-gray-600 mb-3">{member.bio}</p>
                      
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                          <div className={`text-lg font-bold ${getProgressColor(member.progressShared.shadowWork)}`}>
                            {member.progressShared.shadowWork}%
                          </div>
                          <div className="text-xs text-gray-500">Shadow Work</div>
                        </div>
                        <div>
                          <div className="text-lg font-bold text-blue-600">
                            {member.progressShared.diagnosticTests}
                          </div>
                          <div className="text-xs text-gray-500">Tests Complete</div>
                        </div>
                        <div>
                          <div className="text-lg font-bold text-green-600">
                            {member.progressShared.breathingPractices}
                          </div>
                          <div className="text-xs text-gray-500">Breathing Sessions</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Member Detail Modal */}
        <AnimatePresence>
          {selectedMember && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
              onClick={() => setSelectedMember(null)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-white rounded-2xl p-8 max-w-md w-full shadow-xl"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="text-center mb-6">
                  <div className="w-20 h-20 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    {selectedMember.avatar ? (
                      <img
                        src={selectedMember.avatar}
                        alt={selectedMember.nickname}
                        className="w-20 h-20 rounded-full object-cover"
                      />
                    ) : (
                      <SafeIcon icon={FiUser} className="w-10 h-10 text-white" />
                    )}
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    {selectedMember.nickname}
                  </h3>
                  <div className="flex items-center justify-center space-x-4 text-sm text-gray-600">
                    <div className="flex items-center space-x-1">
                      <SafeIcon icon={FiStar} className="w-4 h-4 text-yellow-500" />
                      <span>Level {selectedMember.level}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <SafeIcon icon={FiTrendingUp} className="w-4 h-4 text-primary-500" />
                      <span>{selectedMember.crystals} crystals</span>
                    </div>
                  </div>
                </div>
                
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-900 mb-2">About</h4>
                  <p className="text-gray-600">{selectedMember.bio}</p>
                </div>
                
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-900 mb-3">Focus Areas</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedMember.assessmentAreas.map((area, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm"
                      >
                        {area.replace('-', ' ')}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div className="flex space-x-4">
                  <button
                    onClick={() => {
                      toast.info('Connection feature coming soon!');
                      setSelectedMember(null);
                    }}
                    className="flex-1 bg-gradient-to-r from-primary-500 to-secondary-500 text-white py-2 px-4 rounded-lg hover:shadow-lg transition-all flex items-center justify-center space-x-2"
                  >
                    <SafeIcon icon={FiHeart} className="w-4 h-4" />
                    <span>Connect</span>
                  </button>
                  <button
                    onClick={() => {
                      toast.info('Messaging feature coming soon!');
                      setSelectedMember(null);
                    }}
                    className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition-all flex items-center justify-center space-x-2"
                  >
                    <SafeIcon icon={FiMessageCircle} className="w-4 h-4" />
                    <span>Message</span>
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default CommunitySearch;
