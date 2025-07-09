import express from 'express';
import voiceAgentService from '../services/voiceAgentService.js';
import { AccessToken } from 'livekit-server-sdk';

const router = express.Router();

router.post('/start', async (req, res) => {
    const { roomName } = req.body;
    if (!roomName) {
        return res.status(400).json({ error: 'roomName is required' });
    }

    try {
        const apiKey = process.env.LIVEKIT_API_KEY;
        const apiSecret = process.env.LIVEKIT_API_SECRET;

        const at = new AccessToken(apiKey, apiSecret, {
            identity: 'agent', // The agent has a fixed identity
        });

        at.addGrant({
            room: roomName,
            roomJoin: true,
            canPublish: true,
            canSubscribe: true,
        });

        const token = at.toJwt();

        // Connect the agent to the room
        await voiceAgentService.connect(token);

        res.json({ message: 'Agent started successfully' });
    } catch (error) {
        console.error('Failed to start voice agent:', error);
        res.status(500).json({ error: 'Failed to start agent' });
    }
});

export default router; 