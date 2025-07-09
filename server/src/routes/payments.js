import express from 'express';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import paymentService from '../services/paymentService.js';

const router = express.Router();
const prisma = new PrismaClient();

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// Get all available subscription plans
router.get('/plans', async (req, res) => {
  try {
    const plans = await prisma.subscriptionPlan.findMany({
      where: { isActive: true },
      orderBy: { price: 'asc' },
    });

    res.json(plans);
  } catch (error) {
    console.error('Error fetching plans:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get current user's subscription
router.get('/subscription', authenticateToken, async (req, res) => {
  try {
    const subscription = await prisma.subscription.findUnique({
      where: { userId: req.user.id },
      include: {
        plan: true,
        payments: {
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
      },
    });

    if (!subscription) {
      return res.status(404).json({ error: 'No subscription found' });
    }

    // Get usage information
    const usage = await paymentService.getSubscriptionUsage(req.user.id);

    res.json({
      subscription,
      usage,
    });
  } catch (error) {
    console.error('Error fetching subscription:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create a new subscription
router.post('/subscription', authenticateToken, async (req, res) => {
  try {
    const { planId, paymentMethodId } = req.body;

    if (!planId || !paymentMethodId) {
      return res.status(400).json({ error: 'Plan ID and payment method ID are required' });
    }

    // Check if user already has a subscription
    const existingSubscription = await prisma.subscription.findUnique({
      where: { userId: req.user.id },
    });

    if (existingSubscription) {
      return res.status(400).json({ error: 'User already has a subscription' });
    }

    const result = await paymentService.createSubscription(req.user.id, planId, paymentMethodId);

    res.status(201).json(result);
  } catch (error) {
    console.error('Error creating subscription:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// Cancel subscription
router.post('/subscription/cancel', authenticateToken, async (req, res) => {
  try {
    const subscription = await paymentService.cancelSubscription(req.user.id);
    res.json(subscription);
  } catch (error) {
    console.error('Error cancelling subscription:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// Resume subscription
router.post('/subscription/resume', authenticateToken, async (req, res) => {
  try {
    const subscription = await paymentService.resumeSubscription(req.user.id);
    res.json(subscription);
  } catch (error) {
    console.error('Error resuming subscription:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// Update payment method
router.put('/payment-method', authenticateToken, async (req, res) => {
  try {
    const { paymentMethodId } = req.body;

    if (!paymentMethodId) {
      return res.status(400).json({ error: 'Payment method ID is required' });
    }

    const result = await paymentService.updatePaymentMethod(req.user.id, paymentMethodId);
    res.json(result);
  } catch (error) {
    console.error('Error updating payment method:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// Get payment methods
router.get('/payment-methods', authenticateToken, async (req, res) => {
  try {
    const paymentMethods = await paymentService.getPaymentMethods(req.user.id);
    res.json(paymentMethods);
  } catch (error) {
    console.error('Error fetching payment methods:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// Create payment intent for one-time payments
router.post('/payment-intent', authenticateToken, async (req, res) => {
  try {
    const { amount, description } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Valid amount is required' });
    }

    const result = await paymentService.createPaymentIntent(req.user.id, amount, 'usd', description);
    res.json(result);
  } catch (error) {
    console.error('Error creating payment intent:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// Get payment history
router.get('/payments', authenticateToken, async (req, res) => {
  try {
    const payments = await prisma.payment.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    res.json(payments);
  } catch (error) {
    console.error('Error fetching payments:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Stripe webhook endpoint
router.post('/webhooks/stripe', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    event = paymentService.stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    await paymentService.handleWebhook(event);
    res.json({ received: true });
  } catch (error) {
    console.error('Error handling webhook:', error);
    res.status(500).json({ error: 'Webhook handler failed' });
  }
});

// Get subscription usage
router.get('/usage', authenticateToken, async (req, res) => {
  try {
    const usage = await paymentService.getSubscriptionUsage(req.user.id);
    res.json(usage);
  } catch (error) {
    console.error('Error fetching usage:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Check if user can perform an action (based on usage limits)
router.get('/usage/check/:type', authenticateToken, async (req, res) => {
  try {
    const { type } = req.params;
    const allowed = await paymentService.checkUsageLimit(req.user.id, type);
    res.json({ allowed });
  } catch (error) {
    console.error('Error checking usage limit:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;