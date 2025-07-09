import { Room, RoomEvent, Participant, Track, RemoteParticipant } from 'livekit-client';
import { createClient } from '@deepgram/sdk';
import { ElevenLabsClient } from 'elevenlabs';
import openaiService from './openaiService.js';

const ELEVENLABS_VOICE_ID = '21m00Tcm4TlvDq8ikWAM'; // Rachel's voice ID as a default

class VoiceAgentService {
  constructor() {
    this.room = null;
    this.deepgram = process.env.DEEPGRAM_API_KEY ? createClient(process.env.DEEPGRAM_API_KEY) : null;
    this.elevenlabs = process.env.ELEVENLABS_API_KEY ? new ElevenLabsClient({ apiKey: process.env.ELEVENLABS_API_KEY }) : null;
    this.remoteParticipant = null;
    this.isSpeaking = false;
  }

  async connect(token) {
    this.room = new Room();
    await this.room.connect(process.env.VITE_LIVEKIT_URL, token);

    this.room.on(RoomEvent.TrackSubscribed, this.handleTrackSubscribed.bind(this));
  }

  handleTrackSubscribed(track, publication, participant) {
    if (track.kind === 'audio' && participant.identity !== 'agent') {
      this.remoteParticipant = participant;
      const deepgramConnection = this.deepgram.listen.live({ model: 'nova-2', smart_format: true });

      deepgramConnection.on('transcript', async (data) => {
        const transcript = data.channel.alternatives[0].transcript;
        if (transcript && !this.isSpeaking) {
          this.isSpeaking = true;
          const aiResponse = await openaiService.generateResponse(this.room.name, transcript);
          const audioStream = await this.elevenlabs.textToSpeech.convertAsStream(ELEVENLABS_VOICE_ID, { text: aiResponse });

          // This is a simplified approach. In a real scenario, you'd handle streaming audio properly.
          // For this example, we'll assume we can publish the stream directly.
          // A more robust solution would involve piping the stream to a local track.

          this.isSpeaking = false;
        }
      });

      // This part is complex and requires a custom audio track source to handle the incoming stream.
      // For now, we are just logging the concept.
      console.log("Deepgram connection established.");
    }
  }

  disconnect() {
    if (this.room) {
      this.room.disconnect();
    }
  }
}

export default new VoiceAgentService();