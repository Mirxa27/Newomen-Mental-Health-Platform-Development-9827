import express from 'express';
import paypalService from '../services/paypalService.js';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

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

router.post('/orders', authenticateToken, async (req, res) => {
    try {
        const { planId } = req.body;
        const plan = await prisma.subscriptionPlan.findUnique({ where: { id: planId } });
        if (!plan) return res.status(404).json({ error: 'Plan not found' });

        const order = await paypalService.createOrder(plan);
        res.json(order);
    } catch (error) {
        console.error('Failed to create order:', error);
        res.status(500).json({ error: 'Failed to create order' });
    }
});

router.post('/orders/:orderId/capture', authenticateToken, async (req, res) => {
    try {
        const { orderId } = req.params;
        const capture = await paypalService.captureOrder(orderId);

        // Here you would typically link the captured payment to a user's subscription
        // For example, find the user, and create/update their subscription record.

        res.json(capture);
    } catch (error) {
        console.error('Failed to capture order:', error);
        res.status(500).json({ error: 'Failed to capture order' });
    }
});

router.post('/subscriptions', authenticateToken, async (req, res) => {
    try {
        const { planId } = req.body;
        const subscription = await paypalService.createSubscription(planId, req.user.id);
        res.json(subscription);
    } catch (error) {
        console.error('Failed to create subscription:', error);
        res.status(500).json({ error: 'Failed to create subscription' });
    }
});


export default router; 