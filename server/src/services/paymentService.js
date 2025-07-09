import Stripe from 'stripe';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

class PaymentService {
  constructor() {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  }

  async createCustomer(user) {
    try {
      const customer = await this.stripe.customers.create({
        email: user.email,
        name: user.name,
        metadata: {
          userId: user.id,
        },
      });

      return customer;
    } catch (error) {
      console.error('Error creating Stripe customer:', error);
      throw new Error('Failed to create customer');
    }
  }

  async createSubscription(userId, planId, paymentMethodId) {
    try {
      // Get user and plan
      const user = await prisma.user.findUnique({ where: { id: userId } });
      const plan = await prisma.subscriptionPlan.findUnique({ where: { id: planId } });

      if (!user || !plan) {
        throw new Error('User or plan not found');
      }

      // Create or get Stripe customer
      let stripeCustomerId = user.stripeCustomerId;
      if (!stripeCustomerId) {
        const customer = await this.createCustomer(user);
        stripeCustomerId = customer.id;
        
        // Update user with stripe customer ID
        await prisma.user.update({
          where: { id: userId },
          data: { stripeCustomerId }
        });
      }

      // Attach payment method to customer
      await this.stripe.paymentMethods.attach(paymentMethodId, {
        customer: stripeCustomerId,
      });

      // Set as default payment method
      await this.stripe.customers.update(stripeCustomerId, {
        invoice_settings: {
          default_payment_method: paymentMethodId,
        },
      });

      // Create subscription
      const subscription = await this.stripe.subscriptions.create({
        customer: stripeCustomerId,
        items: [{ price: plan.stripePriceId }],
        payment_behavior: 'default_incomplete',
        payment_settings: { save_default_payment_method: 'on_subscription' },
        expand: ['latest_invoice.payment_intent'],
      });

      // Save subscription to database
      const dbSubscription = await prisma.subscription.create({
        data: {
          userId,
          planId,
          stripeCustomerId,
          stripeSubscriptionId: subscription.id,
          status: 'TRIALING',
          currentPeriodStart: new Date(subscription.current_period_start * 1000),
          currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        },
      });

      return {
        subscription: dbSubscription,
        clientSecret: subscription.latest_invoice.payment_intent.client_secret,
      };
    } catch (error) {
      console.error('Error creating subscription:', error);
      throw new Error('Failed to create subscription');
    }
  }

  async cancelSubscription(userId) {
    try {
      const subscription = await prisma.subscription.findUnique({
        where: { userId },
      });

      if (!subscription) {
        throw new Error('Subscription not found');
      }

      // Cancel at period end in Stripe
      await this.stripe.subscriptions.update(subscription.stripeSubscriptionId, {
        cancel_at_period_end: true,
      });

      // Update database
      const updatedSubscription = await prisma.subscription.update({
        where: { userId },
        data: {
          cancelAtPeriodEnd: true,
          status: 'CANCELLED',
        },
      });

      return updatedSubscription;
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      throw new Error('Failed to cancel subscription');
    }
  }

  async resumeSubscription(userId) {
    try {
      const subscription = await prisma.subscription.findUnique({
        where: { userId },
      });

      if (!subscription) {
        throw new Error('Subscription not found');
      }

      // Resume subscription in Stripe
      await this.stripe.subscriptions.update(subscription.stripeSubscriptionId, {
        cancel_at_period_end: false,
      });

      // Update database
      const updatedSubscription = await prisma.subscription.update({
        where: { userId },
        data: {
          cancelAtPeriodEnd: false,
          status: 'ACTIVE',
        },
      });

      return updatedSubscription;
    } catch (error) {
      console.error('Error resuming subscription:', error);
      throw new Error('Failed to resume subscription');
    }
  }

  async updatePaymentMethod(userId, paymentMethodId) {
    try {
      const user = await prisma.user.findUnique({ where: { id: userId } });
      
      if (!user || !user.stripeCustomerId) {
        throw new Error('Customer not found');
      }

      // Attach new payment method
      await this.stripe.paymentMethods.attach(paymentMethodId, {
        customer: user.stripeCustomerId,
      });

      // Set as default payment method
      await this.stripe.customers.update(user.stripeCustomerId, {
        invoice_settings: {
          default_payment_method: paymentMethodId,
        },
      });

      return { success: true };
    } catch (error) {
      console.error('Error updating payment method:', error);
      throw new Error('Failed to update payment method');
    }
  }

  async getPaymentMethods(userId) {
    try {
      const user = await prisma.user.findUnique({ where: { id: userId } });
      
      if (!user || !user.stripeCustomerId) {
        return [];
      }

      const paymentMethods = await this.stripe.paymentMethods.list({
        customer: user.stripeCustomerId,
        type: 'card',
      });

      return paymentMethods.data;
    } catch (error) {
      console.error('Error getting payment methods:', error);
      throw new Error('Failed to get payment methods');
    }
  }

  async createPaymentIntent(userId, amount, currency = 'usd', description = '') {
    try {
      const user = await prisma.user.findUnique({ where: { id: userId } });
      
      if (!user) {
        throw new Error('User not found');
      }

      let stripeCustomerId = user.stripeCustomerId;
      if (!stripeCustomerId) {
        const customer = await this.createCustomer(user);
        stripeCustomerId = customer.id;
        
        await prisma.user.update({
          where: { id: userId },
          data: { stripeCustomerId }
        });
      }

      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: amount * 100, // Convert to cents
        currency,
        customer: stripeCustomerId,
        description,
        automatic_payment_methods: { enabled: true },
      });

      // Save payment record
      await prisma.payment.create({
        data: {
          userId,
          stripePaymentId: paymentIntent.id,
          amount: amount * 100,
          currency,
          description,
          status: 'PENDING',
        },
      });

      return { clientSecret: paymentIntent.client_secret };
    } catch (error) {
      console.error('Error creating payment intent:', error);
      throw new Error('Failed to create payment intent');
    }
  }

  async handleWebhook(event) {
    try {
      switch (event.type) {
        case 'payment_intent.succeeded':
          await this.handlePaymentSucceeded(event.data.object);
          break;
        case 'payment_intent.payment_failed':
          await this.handlePaymentFailed(event.data.object);
          break;
        case 'invoice.payment_succeeded':
          await this.handleInvoicePaymentSucceeded(event.data.object);
          break;
        case 'invoice.payment_failed':
          await this.handleInvoicePaymentFailed(event.data.object);
          break;
        case 'customer.subscription.updated':
          await this.handleSubscriptionUpdated(event.data.object);
          break;
        case 'customer.subscription.deleted':
          await this.handleSubscriptionDeleted(event.data.object);
          break;
        default:
          console.log(`Unhandled event type: ${event.type}`);
      }
    } catch (error) {
      console.error('Error handling webhook:', error);
      throw error;
    }
  }

  async handlePaymentSucceeded(paymentIntent) {
    await prisma.payment.update({
      where: { stripePaymentId: paymentIntent.id },
      data: { status: 'COMPLETED' },
    });
  }

  async handlePaymentFailed(paymentIntent) {
    await prisma.payment.update({
      where: { stripePaymentId: paymentIntent.id },
      data: { 
        status: 'FAILED',
        failureReason: paymentIntent.last_payment_error?.message || 'Payment failed'
      },
    });
  }

  async handleInvoicePaymentSucceeded(invoice) {
    if (invoice.subscription) {
      const subscription = await prisma.subscription.findFirst({
        where: { stripeSubscriptionId: invoice.subscription },
      });

      if (subscription) {
        await prisma.subscription.update({
          where: { id: subscription.id },
          data: { status: 'ACTIVE' },
        });
      }
    }
  }

  async handleInvoicePaymentFailed(invoice) {
    if (invoice.subscription) {
      const subscription = await prisma.subscription.findFirst({
        where: { stripeSubscriptionId: invoice.subscription },
      });

      if (subscription) {
        await prisma.subscription.update({
          where: { id: subscription.id },
          data: { status: 'PAST_DUE' },
        });
      }
    }
  }

  async handleSubscriptionUpdated(subscription) {
    const dbSubscription = await prisma.subscription.findFirst({
      where: { stripeSubscriptionId: subscription.id },
    });

    if (dbSubscription) {
      const statusMap = {
        active: 'ACTIVE',
        past_due: 'PAST_DUE',
        canceled: 'CANCELLED',
        incomplete: 'PAST_DUE',
        incomplete_expired: 'EXPIRED',
        trialing: 'TRIALING',
        unpaid: 'PAST_DUE',
      };

      await prisma.subscription.update({
        where: { id: dbSubscription.id },
        data: {
          status: statusMap[subscription.status] || 'ACTIVE',
          currentPeriodStart: new Date(subscription.current_period_start * 1000),
          currentPeriodEnd: new Date(subscription.current_period_end * 1000),
          cancelAtPeriodEnd: subscription.cancel_at_period_end,
        },
      });
    }
  }

  async handleSubscriptionDeleted(subscription) {
    const dbSubscription = await prisma.subscription.findFirst({
      where: { stripeSubscriptionId: subscription.id },
    });

    if (dbSubscription) {
      await prisma.subscription.update({
        where: { id: dbSubscription.id },
        data: { status: 'CANCELLED' },
      });
    }
  }

  async getSubscriptionUsage(userId) {
    const analytics = await prisma.userAnalytics.findUnique({
      where: { userId },
    });

    const subscription = await prisma.subscription.findUnique({
      where: { userId },
      include: { plan: true },
    });

    if (!analytics || !subscription) {
      return { usage: 0, limit: 0, percentage: 0 };
    }

    const currentPeriodStart = subscription.currentPeriodStart;
    const now = new Date();
    
    // Calculate usage since current period start
    const messagesThisPeriod = await prisma.message.count({
      where: {
        conversation: {
          userId,
        },
        timestamp: {
          gte: currentPeriodStart,
          lte: now,
        },
      },
    });

    const voiceMinutesThisPeriod = await prisma.voiceSession.aggregate({
      where: {
        userId,
        createdAt: {
          gte: currentPeriodStart,
          lte: now,
        },
      },
      _sum: {
        duration: true,
      },
    });

    const messageLimit = subscription.plan.maxMessages || Infinity;
    const voiceLimit = subscription.plan.maxVoiceTime || Infinity;

    return {
      messages: {
        usage: messagesThisPeriod,
        limit: messageLimit,
        percentage: messageLimit === Infinity ? 0 : (messagesThisPeriod / messageLimit) * 100,
      },
      voiceMinutes: {
        usage: Math.floor((voiceMinutesThisPeriod._sum.duration || 0) / 60),
        limit: voiceLimit,
        percentage: voiceLimit === Infinity ? 0 : ((voiceMinutesThisPeriod._sum.duration || 0) / 60 / voiceLimit) * 100,
      },
    };
  }

  async checkUsageLimit(userId, type) {
    const usage = await this.getSubscriptionUsage(userId);
    
    if (type === 'message') {
      return usage.messages.percentage < 100;
    } else if (type === 'voice') {
      return usage.voiceMinutes.percentage < 100;
    }
    
    return true;
  }
}

export default new PaymentService();