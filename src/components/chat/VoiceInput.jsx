import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import VoiceAgent from './VoiceAgent';

const { FiMic, FiMicOff, FiPhone } = FiIcons;

const VoiceInput = ({ onTranscript }) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [recognition, setRecognition] = useState(null);
  const [isSupported, setIsSupported] = useState(false);
  const [showVoiceAgent, setShowVoiceAgent] = useState(false);

  useEffect(() => {
    // Check for speech recognition support
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      setIsSupported(true);
      
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';
      
      recognition.onresult = (event) => {
        let finalTranscript = '';
        let interimTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }
        
        setTranscript(finalTranscript + interimTranscript);
        if (finalTranscript) {
          onTranscript(finalTranscript);
        }
      };
      
      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };
      
      recognition.onend = () => {
        setIsListening(false);
      };
      
      setRecognition(recognition);
    } else {
      setIsSupported(false);
    }
  }, [onTranscript]);

  const startListening = () => {
    if (recognition && isSupported) {
      setIsListening(true);
      setTranscript('');
      try {
        recognition.start();
      } catch (error) {
        console.error('Error starting recognition:', error);
        setIsListening(false);
      }
    }
  };

  const stopListening = () => {
    if (recognition) {
      recognition.stop();
      setIsListening(false);
    }
  };

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const handleVoiceAgentTranscript = (transcriptData) => {
    onTranscript(transcriptData.text || '');
  };

  const handleVoiceAgentResponse = (responseData) => {
    // Handle AI response if needed
    console.log('AI Response:', responseData);
  };

  if (!isSupported) {
    return (
      <div className="bg-white/80 backdrop-blur-sm rounded-xl md:rounded-2xl p-4 md:p-6 border border-gray-200">
        <div className="text-center">
          <div className="text-gray-500 mb-4">
            <SafeIcon icon={FiMicOff} className="w-10 h-10 mx-auto" />
          </div>
          <p className="text-sm text-gray-600">
            Voice input is not supported in this browser. Please try Chrome or Firefox.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white/80 backdrop-blur-sm rounded-xl md:rounded-2xl p-4 md:p-6 border border-gray-200">
        <div className="text-center">
          <div className="flex justify-center space-x-4 mb-4">
            {/* Basic Voice Input */}
            <motion.button
              onClick={toggleListening}
              className={`w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center transition-all duration-300 ${
                isListening 
                  ? 'bg-red-500 hover:bg-red-600 text-white' 
                  : 'bg-gradient-to-r from-primary-500 to-secondary-500 hover:shadow-lg text-white'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              aria-label={isListening ? "Stop listening" : "Start listening"}
              aria-pressed={isListening}
            >
              <SafeIcon icon={isListening ? FiMicOff : FiMic} className="w-6 h-6 md:w-8 md:h-8" />
            </motion.button>
            
            {/* Realtime Voice Agent */}
            <motion.button
              onClick={() => setShowVoiceAgent(true)}
              className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 hover:shadow-lg text-white flex items-center justify-center transition-all duration-300"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              aria-label="Start voice chat"
            >
              <SafeIcon icon={FiPhone} className="w-6 h-6 md:w-8 md:h-8" />
            </motion.button>
          </div>
          
          <div className="mt-4">
            <div className="flex justify-center space-x-4 text-xs md:text-sm text-gray-600 mb-2">
              <span>Basic Voice Input</span>
              <span>•</span>
              <span>Realtime Voice Chat</span>
            </div>
            
            <p className="text-xs md:text-sm text-gray-600 mb-2">
              {isListening ? 'Listening...' : 'Choose your voice interaction method'}
            </p>
            
            {isListening && (
              <div className="flex justify-center space-x-1 mb-4">
                {[0, 1, 2, 3, 4].map((i) => (
                  <motion.div
                    key={i}
                    className="w-1 bg-primary-500 rounded-full"
                    animate={{ height: [4, 20, 4] }}
                    transition={{ duration: 1, repeat: Infinity, delay: i * 0.1 }}
                  />
                ))}
              </div>
            )}
            
            {transcript && (
              <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-700">
                {transcript}
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Voice Agent Modal */}
      {showVoiceAgent && (
        <VoiceAgent
          onTranscript={handleVoiceAgentTranscript}
          onResponse={handleVoiceAgentResponse}
          onClose={() => setShowVoiceAgent(false)}
        />
      )}
    </>
  );
};

export default VoiceInput;