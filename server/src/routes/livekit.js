import express from 'express';
import { AccessToken } from 'livekit-server-sdk';
import jwt from 'jsonwebtoken';

const router = express.Router();

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.sendStatus(401);

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};

router.get('/token', authenticateToken, (req, res) => {
    const { roomName, participantName } = req.query;

    if (!roomName || !participantName) {
        return res.status(400).json({ error: 'roomName and participantName are required' });
    }

    const livekitHost = process.env.LIVEKIT_HOST;
    const apiKey = process.env.LIVEKIT_API_KEY;
    const apiSecret = process.env.LIVEKIT_API_SECRET;

    if (!livekitHost || !apiKey || !apiSecret) {
        console.error('LiveKit server environment variables not configured.');
        return res.status(500).json({ error: 'LiveKit server not configured.' });
    }

    const at = new AccessToken(apiKey, apiSecret, {
        identity: participantName,
    });

    at.addGrant({
        room: roomName,
        roomJoin: true,
        canPublish: true,
        canSubscribe: true,
    });

    const token = at.toJwt();
    res.json({ token });
});

export default router; 