// Backend API route for generating ephemeral keys
// This would be implemented in your backend (Node.js/Express)

export const generateEphemeralKey = async (req, res) => {
  try {
    // For now, return the API key directly
    // In production, generate ephemeral keys through OpenAI API
    res.json({
      apiKey: process.env.OPENAI_API_KEY,
      expiresAt: Math.floor(Date.now() / 1000) + 3600, // 1 hour
    });
  } catch (error) {
    console.error('Error generating ephemeral key:', error);
    res.status(500).json({ error: 'Failed to generate ephemeral key' });
  }
};

// Example Express route setup
/*
const express = require('express');
const router = express.Router();

router.post('/openai/ephemeral-key', generateEphemeralKey);

module.exports = router;
*/