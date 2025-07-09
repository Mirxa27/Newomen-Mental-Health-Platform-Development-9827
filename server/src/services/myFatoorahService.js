import { MyFatoorah } from 'myfatoorah-toolkit';

class MyFatoorahService {
    constructor() {
        this.myfatoorah = new MyFatoorah(
            process.env.MYFATOORAH_COUNTRY_ISO,
            process.env.NODE_ENV !== 'production',
            process.env.MYFATOORAH_API_KEY
        );
    }

    async initiatePayment(amount, currency) {
        try {
            const response = await this.myfatoorah.initiatePayment(amount, currency);
            return response;
        } catch (error) {
            console.error('Error initiating MyFatoorah payment:', error);
            throw new Error('Failed to initiate payment');
        }
    }

    async sendPayment(invoiceValue, customerName, notificationOption = 'LNK', data = {}) {
        try {
            const response = await this.myfatoorah.sendPayment(invoiceValue, customerName, notificationOption, data);
            return response;
        } catch (error) {
            console.error('Error sending MyFatoorah payment:', error);
            throw new Error('Failed to send payment');
        }
    }

    async executePayment(invoiceValue, paymentMethodId, data = {}) {
        try {
            const response = await this.myfatoorah.executePayment(invoiceValue, paymentMethodId, data);
            return response;
        } catch (error) {
            console.error('Error executing MyFatoorah payment:', error);
            throw new Error('Failed to execute payment');
        }
    }

    async getPaymentStatus(key, keyType) {
        try {
            const response = await this.myfatoorah.getPaymentStatus(key, keyType);
            return response;
        } catch (error) {
            console.error('Error getting MyFatoorah payment status:', error);
            throw new Error('Failed to get payment status');
        }
    }

    async makeRefund(refundRequest) {
        try {
            const response = await this.myfatoorah.makeRefund(refundRequest);
            return response;
        } catch (error) {
            console.error('Error making MyFatoorah refund:', error);
            throw new Error('Failed to make refund');
        }
    }

    async getRefundStatus(key, keyType) {
        try {
            const response = await this.myfatoorah.getRefundStatus(key, keyType);
            return response;
        } catch (error) {
            console.error('Error getting MyFatoorah refund status:', error);
            throw new Error('Failed to get refund status');
        }
    }
}

export default new MyFatoorahService(); 