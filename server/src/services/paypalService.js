import { Client, Environment, LogLevel } from '@paypal/paypal-server-sdk';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

class PayPalService {
    constructor() {
        const clientId = process.env.PAYPAL_CLIENT_ID;
        const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
        
        if (!clientId || !clientSecret) {
            console.warn('PayPal credentials not configured');
            this.client = null;
            return;
        }
        
        this.client = new Client({
            clientCredentialsAuthCredentials: {
                oAuthClientId: clientId,
                oAuthClientSecret: clientSecret,
            },
            environment: Environment.Sandbox,
            logging: {
                logLevel: LogLevel.INFO,
                logRequest: { logBody: true },
                logResponse: { logHeaders: true },
            },
        });
    }

    async createOrder(plan) {
        if (!this.client) {
            throw new Error('PayPal client not initialized');
        }
        
        const request = {
            intent: 'CAPTURE',
            purchase_units: [{
                amount: {
                    currency_code: 'USD',
                    value: plan.price.toString(),
                },
            }],
        };

        const response = await this.client.ordersController.ordersCreate({
            body: request,
        });
        
        return response.result;
    }

    async captureOrder(orderId) {
        if (!this.client) {
            throw new Error('PayPal client not initialized');
        }
        
        const response = await this.client.ordersController.ordersCapture({
            id: orderId,
        });
        
        return response.result;
    }

    async createSubscription(planId, userId) {
        // This is a simplified example. A real implementation would involve creating a billing plan
        // on PayPal and then creating a subscription to that plan.

        const plan = await prisma.subscriptionPlan.findUnique({ where: { id: planId } });
        if (!plan) throw new Error('Plan not found');

        // For now, we'll just create a record in our database and assume the payment was handled.
        // A full implementation would use PayPal's Subscriptions API.
        const subscription = await prisma.subscription.create({
            data: {
                planId,
                userId,
                status: 'ACTIVE',
                // Add start and end dates based on the plan
            }
        });

        return subscription;
    }
}

export default new PayPalService(); 