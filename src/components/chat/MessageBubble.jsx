import React from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';

const MessageBubble = ({ message }) => {
  const isUser = message.sender === 'user';
  const timestamp = new Date(message.timestamp);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3 }}
      className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      {isUser ? (
        // User message with gradient background
        <div className="max-w-xs sm:max-w-sm md:max-w-md px-4 py-3 rounded-2xl bg-gradient-to-r from-primary-500 to-secondary-500 text-white">
          <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
            {message.content}
          </p>
          <div className="text-xs mt-2 text-primary-100">
            {format(timestamp, 'HH:mm')}
          </div>

          {message.emotion && (
            <div className="mt-2 flex items-center space-x-2">
              <span className="text-xs opacity-70">
                Emotion: {message.emotion}
              </span>
            </div>
          )}
        </div>
      ) : (
        // Assistant message with glass effect
        <div className="glass-card max-w-xs sm:max-w-sm md:max-w-md">
          <div className="text-gray-800">
            <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
              {message.content}
            </p>
            <div className="text-xs mt-2 text-gray-500">
              {format(timestamp, 'HH:mm')}
            </div>

            {message.emotion && (
              <div className="mt-2 flex items-center space-x-2">
                <span className="text-xs opacity-70">
                  Emotion: {message.emotion}
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default MessageBubble;