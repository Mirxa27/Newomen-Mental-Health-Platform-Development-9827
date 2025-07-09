import express from 'express';
import myFatoorahService from '../services/myFatoorahService.js';
import { validateSignature } from 'myfatoorah-toolkit';

const router = express.Router();

// Initiate Payment
router.post('/initiate', async (req, res) => {
    try {
        const { amount, currency } = req.body;
        const response = await myFatoorahService.initiatePayment(amount, currency);
        res.json(response);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Send Payment
router.post('/send', async (req, res) => {
    try {
        const { invoiceValue, customerName, notificationOption, data } = req.body;
        const response = await myFatoorahService.sendPayment(invoiceValue, customerName, notificationOption, data);
        res.json(response);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Execute Payment
router.post('/execute', async (req, res) => {
    try {
        const { invoiceValue, paymentMethodId, data } = req.body;
        const response = await myFatoorahService.executePayment(invoiceValue, paymentMethodId, data);
        res.json(response);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get Payment Status
router.get('/status/:keyType/:key', async (req, res) => {
    try {
        const { key, keyType } = req.params;
        const response = await myFatoorahService.getPaymentStatus(key, keyType);
        res.json(response);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Make a Refund
router.post('/refund', async (req, res) => {
    try {
        const refundRequest = req.body;
        const response = await myFatoorahService.makeRefund(refundRequest);
        res.json(response);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get Refund Status
router.get('/refund/status/:keyType/:key', async (req, res) => {
    try {
        const { key, keyType } = req.params;
        const response = await myFatoorahService.getRefundStatus(key, keyType);
        res.json(response);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Webhook
router.post('/webhook', async (req, res) => {
    const signature = req.get('MyFatoorah-Signature');
    try {
        await validateSignature(req.body, signature, process.env.MYFATOORAH_WEBHOOK_SECRET);
        // Handle webhook event
        console.log('MyFatoorah webhook event received:', req.body);
        res.status(200).send('OK');
    } catch (error) {
        console.error('Invalid MyFatoorah webhook signature:', error);
        res.status(400).send('Invalid signature');
    }
});


export default router; 