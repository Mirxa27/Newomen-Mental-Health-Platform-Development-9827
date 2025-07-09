/**
 * AudioWorklet Processor for real-time voice processing
 * Handles low-latency audio capture and level monitoring
 */
class VoiceProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    
    this.bufferSize = 4096;
    this.audioBuffer = new Float32Array(this.bufferSize);
    this.bufferIndex = 0;
    this.sampleRate = 24000; // Target sample rate for OpenAI
    
    // Audio level monitoring
    this.levelSmoothingFactor = 0.8;
    this.currentLevel = 0;
    this.levelFrameCount = 0;
    
    // Resampling for different sample rates
    this.resampleRatio = sampleRate / this.sampleRate;
    this.lastSample = 0;
    
    console.log('VoiceProcessor initialized with sample rate:', sampleRate);
  }

  process(inputs, outputs, parameters) {
    const input = inputs[0];
    
    if (input && input.length > 0) {
      const inputChannel = input[0];
      
      // Process audio data
      for (let i = 0; i < inputChannel.length; i++) {
        const sample = inputChannel[i];
        
        // Calculate audio level for visualization
        this.updateAudioLevel(sample);
        
        // Resample if needed
        if (this.resampleRatio !== 1) {
          this.resampleAndBuffer(sample);
        } else {
          this.audioBuffer[this.bufferIndex] = sample;
          this.bufferIndex++;
        }
        
        // Send buffer when full
        if (this.bufferIndex >= this.bufferSize) {
          this.sendAudioData();
          this.bufferIndex = 0;
        }
      }
      
      // Send audio level periodically
      this.levelFrameCount++;
      if (this.levelFrameCount >= 128) { // ~2.7ms at 48kHz
        this.port.postMessage({
          type: 'audio-level',
          data: this.currentLevel
        });
        this.levelFrameCount = 0;
      }
    }
    
    return true; // Keep processor alive
  }

  updateAudioLevel(sample) {
    const sampleLevel = Math.abs(sample);
    this.currentLevel = this.currentLevel * this.levelSmoothingFactor + 
                       sampleLevel * (1 - this.levelSmoothingFactor);
  }

  resampleAndBuffer(sample) {
    // Simple linear interpolation resampling
    if (this.resampleRatio > 1) {
      // Downsampling
      const step = 1 / this.resampleRatio;
      for (let r = 0; r < 1; r += step) {
        const interpolated = this.lastSample * (1 - r) + sample * r;
        this.audioBuffer[this.bufferIndex] = interpolated;
        this.bufferIndex++;
        
        if (this.bufferIndex >= this.bufferSize) {
          this.sendAudioData();
          this.bufferIndex = 0;
        }
      }
    } else {
      // Upsampling or same rate
      this.audioBuffer[this.bufferIndex] = sample;
      this.bufferIndex++;
    }
    
    this.lastSample = sample;
  }

  sendAudioData() {
    // Convert Float32 to Int16 PCM
    const pcmData = new Int16Array(this.bufferSize);
    for (let i = 0; i < this.bufferSize; i++) {
      const sample = Math.max(-1, Math.min(1, this.audioBuffer[i]));
      pcmData[i] = sample < 0 ? sample * 0x8000 : sample * 0x7FFF;
    }
    
    // Send to main thread
    this.port.postMessage({
      type: 'audio-data',
      data: pcmData
    });
  }
}

registerProcessor('voice-processor', VoiceProcessor);