import { HumeClient } from 'hume';

class HumeService {
  constructor() {
    const apiKey = process.env.HUME_API_KEY;
    if (apiKey) {
      this.client = new HumeClient({ apiKey });
      console.log('✅ Hume Service Initialized');
    } else {
      this.client = null;
      console.warn('⚠️ HUME_API_KEY not set. Hume service disabled.');
    }
  }

  isReady() {
    return !!this.client;
  }

  async analyzeText(text) {
    if (!this.isReady()) return null;
    try {
      const socket = this.client.expressionMeasurement.stream.connect({
        config: { language: {} },
      });
      await socket.tillSocketOpen();
      const response = await socket.sendText({ text });
      socket.close();
      return response?.predictions?.[0] || null;
    } catch (error) {
      console.error('Hume API error:', error);
      return null;
    }
  }
}

export default new HumeService();
