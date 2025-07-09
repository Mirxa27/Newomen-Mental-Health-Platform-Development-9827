import express from 'express';
import openaiService from '../services/openaiService.js';

const router = express.Router();

router.post('/analyze', async (req, res) => {
    try {
        const { answers } = req.body;

        // In a real application, you would use the openaiService to generate a more complex analysis.
        // For now, we will just return a mocked response.
        const analysis = `Based on the responses, it seems Partner 1 values quality time, while Partner 2 prefers acts of service. To improve your connection, try setting aside dedicated time for each other without distractions.`;

        res.json({ analysis });
    } catch (error) {
        console.error('Failed to analyze answers:', error);
        res.status(500).json({ error: 'Failed to analyze answers' });
    }
});

export default router; 