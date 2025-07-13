import React, { useState, useEffect, useRef } from 'react';
import {
  Room,
  RoomEvent,
  RemoteParticipant,
  RemoteTrack,
  RemoteTrackPublication,
  LocalAudioTrack,
} from 'livekit-client';
import api from '../../utils/api';
import { useAuthStore } from '../../store/authStore';

const VoiceAgent = ({ roomName }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const roomRef = useRef(null);
  const localAudioTrackRef = useRef(null);
  const remoteAudioTrackRef = useRef(null);

  const { user } = useAuthStore();

  useEffect(() => {
    const connectToRoom = async () => {
      try {
        const response = await api.get(`/livekit/token?roomName=${roomName}&participantName=${user.name}`);
        const token = response.data.token;

        const room = new Room({
          adaptiveStream: true,
          dynacast: true,
        });

        roomRef.current = room;

        room
          .on(RoomEvent.Connected, () => {
            setIsConnected(true);
            console.log('Connected to LiveKit room');
          })
          .on(RoomEvent.Disconnected, () => {
            setIsConnected(false);
            console.log('Disconnected from LiveKit room');
          })
          .on(RoomEvent.TrackSubscribed, (track, publication, participant) => {
            if (track.kind === 'audio') {
              remoteAudioTrackRef.current = track;
              track.attach();
            }
          });

        await room.connect(process.env.VITE_LIVEKIT_URL, token);

        // Start the backend agent after connecting
        await api.post('/agent/start', { roomName });

        const localTrack = await navigator.mediaDevices.getUserMedia({ audio: true });
        const audioTrack = new LocalAudioTrack(localTrack.getAudioTracks()[0]);
        await room.localParticipant.publishTrack(audioTrack);
        localAudioTrackRef.current = audioTrack;

      } catch (error) {
        console.error('Failed to connect to LiveKit room:', error);
      }
    };

    if (user && roomName) {
      connectToRoom();
    }

    return () => {
      if (roomRef.current) {
        roomRef.current.disconnect();
      }
    };
  }, [user, roomName]);


  return (
    <div className="p-4 bg-gray-800 text-white rounded-lg">
      <h3 className="text-lg font-bold">Voice Agent</h3>
      <p>Status: {isConnected ? 'Connected' : 'Disconnected'}</p>
      {/* Add UI controls for mute, etc. later */}
    </div>
  );
};

export default VoiceAgent;
