import paypal from '@paypal/paypal-server-sdk';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

class PayPalService {
    constructor() {
        const clientId = process.env.PAYPAL_CLIENT_ID;
        const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
        const environment = new paypal.core.SandboxEnvironment(clientId, clientSecret);
        this.client = new paypal.core.PayPalHttpClient(environment);
    }

    async createOrder(plan) {
        const request = new paypal.orders.OrdersCreateRequest();
        request.requestBody({
            intent: 'CAPTURE',
            purchase_units: [{
                amount: {
                    currency_code: 'USD',
                    value: plan.price.toString(),
                },
            }],
        });

        const response = await this.client.execute(request);
        return response.result;
    }

    async captureOrder(orderId) {
        const request = new paypal.orders.OrdersCaptureRequest(orderId);
        request.requestBody({});
        const response = await this.client.execute(request);
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