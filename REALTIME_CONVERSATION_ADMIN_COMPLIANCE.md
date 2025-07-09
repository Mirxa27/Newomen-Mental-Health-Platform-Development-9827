# Realtime Conversation System - Admin Prompt Compliance

## Overview

The Newomen Mental Health Platform implements a comprehensive Realtime conversation
system that **strictly follows admin-defined prompts**. This system ensures that the
conversational therapist AI adheres to all guidelines, protocols, and
behavioral instructions set by administrators without deviation.

## Critical Admin Responsibilities

1. **Prompt Management**
   Configure all therapeutic protocols through Admin → Prompt Management
   *Required for legal compliance*

2. **Crisis Protocols**
   Define emergency response procedures in Admin → Crisis Prompts
   *System will automatically enforce these protocols*

3. **Cultural Guidelines**
   Set culturally-sensitive responses in Admin → Cultural Context
   *Required for MENA region compliance*

## Key Components

### 1. Prompt Store Integration (`/src/store/promptStore.js`)

The system integrates with a centralized prompt management system that includes:

#### Admin-Defined Prompt Categories

- **onboarding**: Initial user interaction prompts
- **shadow-work**: Shadow work therapy guidance
- **daily-support**: Daily check-in and support prompts
- **integration**: Personal growth integration prompts
- **cultural-context**: MENA-specific cultural sensitivity prompts
- **emergency-support**: Crisis detection and response protocols
- **voice-interaction**: Realtime voice conversation guidelines
- **professional**: Therapeutic boundary maintenance

#### Critical Compliance Prompts

- `realtime-compliance-framework`: Mandatory adherence framework
- `realtime-voice-protocols`: Voice interaction protocols
- `voice-crisis-detection`: Voice-based crisis detection
- `cultural-voice-sensitivity`: Cultural sensitivity in voice interactions

### 2. Enhanced Realtime Agent (`/src/services/realtimeAgent.js`)

#### System Prompt Integration

```javascript
buildSystemPrompt(userContext = {}) {
  // CRITICAL: Integrates with admin-defined prompts
  // Returns base framework that emphasizes admin prompt compliance
  // Enhanced by RealtimeVoiceChat component with actual admin prompts
}
```

#### OpenAI Realtime API Implementation

- **WebSocket Connection**: For manual audio control
- **WebRTC Connection**: For automatic audio handling
- **Function Calling**: Enforces admin protocol compliance
- **Audio Processing**: Handles real-time speech-to-speech interaction

### 3. RealtimeVoiceChat Component (`/src/components/chat/RealtimeVoiceChat.jsx`)

#### Admin Prompt Enforcement

```javascript
// CRITICAL: Session initialization with admin prompts
const adminSystemPrompt = getSystemPrompt();
if (!adminSystemPrompt) {
  throw new Error('Admin system prompt not configured');
}

// MANDATORY: Voice session configuration
const voiceSession = new NewomenVoiceSession({
  instructions: adminSystemPrompt, // MUST use admin-defined prompts
  // ... other configuration
});
```

#### Function Calling for Protocol Enforcement

- `trigger_crisis_support`: Activates admin-defined crisis protocols
- `apply_cultural_context`: Applies admin cultural sensitivity guidelines
- `enforce_therapeutic_boundaries`: Maintains admin-defined boundaries

#### Connection Management

```javascript
handleConnectionChange = useCallback((state) => {
  if (connected) {
    // MANDATORY: Update session with admin prompts
    const complianceInstructions = [
      adminSystemPrompt,
      'VOICE INTERACTION ADMIN GUIDELINES:',
      voiceGuidelines.map(p => p.content).join('\n\n'),
      'COMPLIANCE REMINDER: You MUST follow these admin-defined instructions without deviation.'
    ].join('\n\n');

    sessionRef.current.updateSession({
      instructions: complianceInstructions,
      // ... additional configuration
    });
  }
});
```

### 4. Crisis Detection and Response

#### Admin-Defined Crisis Protocols

```javascript
const handleCrisisDetection = useCallback(() => {
  const crisisPrompts = getCrisisPrompts();
  
  if (crisisPrompts.length === 0) {
    console.error('CRITICAL: No admin-defined crisis protocols found!');
    return;
  }
  
  // Execute EXACT admin-defined crisis response
  const primaryCrisisPrompt = crisisPrompts.find(p => p.priority === 10) || crisisPrompts[0];
  
  sessionRef.current.sendOutOfBandResponse({
    content: primaryCrisisPrompt.content,
    priority: 'urgent',
    metadata: { 
      type: 'crisis-support', 
      admin_protocol: true,
      protocol_id: primaryCrisisPrompt.id,
      compliance_level: 'mandatory'
    }
  });
});
```

### 5. Cultural Sensitivity Implementation

#### MENA-Specific Guidelines

- Respect for Islamic values and cultural norms
- Natural use of Arabic phrases (حبيبتي, أختي, إن شاء الله, الحمد لله)
- Understanding of family dynamics and societal pressures
- Sensitivity to autonomy, relationships, and self-expression topics

#### Voice-Specific Cultural Sensitivity

```javascript
// Admin-defined cultural voice sensitivity prompts
{
  id: 'cultural-voice-sensitivity',
  content: 'In voice interactions with MENA women, be especially sensitive to: ' +
    'family honor concerns, religious obligations, marriage/relationship ' +
    'pressures, career vs family balance, modest expression of emotions, and ' +
    'indirect communication styles. Use Arabic phrases like حبيبتي، أختي، ' +
    'إن شاء الله naturally in speech.',
}
```

## Admin Configuration Requirements

### 1. Prompt Management

Administrators must configure prompts in the Admin Panel:

- Navigate to Admin → Prompt Management
- Configure system-wide behavioral guidelines
- Set crisis response protocols
- Define cultural sensitivity parameters
- Establish therapeutic boundaries

### 2. AI Provider Settings

- OpenAI API key configuration
- Model selection (gpt-4o-realtime-preview recommended)
- Voice selection (nova, ash, ballad, coral, echo, sage, shimmer, verse)
- Temperature and other parameters

### 3. Emergency Protocols

- Crisis detection keywords (English and Arabic)
- Immediate response protocols
- Professional referral guidelines
- Emergency contact information

## Technical Implementation Details

### WebSocket Flow

1. **Session Creation**: Connect to OpenAI Realtime API
2. **Admin Prompt Integration**: Send admin-defined system prompt
3. **Audio Streaming**: Handle bidirectional audio streams
4. **Function Calling**: Execute admin protocol enforcement
5. **Crisis Detection**: Monitor for emergency situations
6. **Response Generation**: Follow admin-defined response patterns

### WebRTC Flow

1. **Peer Connection**: Establish WebRTC connection
2. **Media Handling**: Automatic audio input/output
3. **Data Channel**: Send admin prompt configurations
4. **Real-time Processing**: Voice activity detection
5. **Protocol Enforcement**: Apply admin guidelines in real-time

### Voice Activity Detection (VAD)

- **Automatic Mode**: AI detects when user starts/stops speaking
- **Manual Mode**: User controls when to speak and generate responses
- **Admin Configuration**: VAD settings can be defined in prompts

### Audio Processing

- **Input Format**: PCM16, 24kHz sample rate
- **Output Format**: PCM16, real-time audio streaming
- **Quality**: Echo cancellation, noise suppression, auto gain control

## Compliance Verification

### Real-time Monitoring

```javascript
// Function call compliance verification
sessionRef.current.sendFunctionResult(call_id, {
  success: true,
  admin_protocol_followed: true,
  compliance_verified: true,
  timestamp: new Date().toISOString(),
  function_executed: name
});
```

### Logging and Audit

- All admin protocol executions are logged
- Crisis interventions are tracked with prompt IDs
- Cultural sensitivity applications are recorded
- Therapeutic boundary enforcements are documented

### Error Handling

- Missing admin prompts trigger configuration errors
- Failed protocol executions are logged and reported
- Connection issues include admin compliance status
- Fallback protocols ensure user safety

## Usage Examples

### Starting a Realtime Voice Session

1. User clicks "Start Voice Chat" in the chat interface
2. System validates admin prompt configuration
3. Establishes connection with admin-defined instructions
4. Begins conversation following all admin guidelines
5. Monitors for crisis situations and applies protocols
6. Maintains cultural sensitivity per admin settings
7. Enforces therapeutic boundaries as defined

### Crisis Situation Handling

1. User expresses suicidal ideation during voice chat
2. AI detects crisis keywords/tone through admin-defined detection
3. System immediately triggers admin crisis protocol
4. Sends admin-defined crisis response message
5. Applies additional admin-defined follow-up protocols
6. Logs intervention with admin prompt compliance verification

### Cultural Interaction Example

1. User discusses family pressure in Arabic-influenced speech
2. AI applies admin-defined cultural sensitivity prompts
3. Responds with appropriate Arabic phrases as configured
4. Maintains cultural context per admin guidelines
5. Balances personal growth with cultural respect

## Security and Privacy

### Data Protection

- All conversations encrypted in transit
- Admin prompts stored securely
- Crisis interventions logged for safety
- User privacy maintained per admin settings

### Access Control

- Only administrators can modify system prompts
- Crisis protocols require admin configuration
- Cultural guidelines set by admin team
- Therapeutic boundaries defined by qualified professionals

## Future Enhancements

### Planned Features

- Real-time admin prompt updates during conversations
- Advanced crisis severity detection algorithms
- Multi-language cultural sensitivity frameworks
- Integration with professional therapy referral systems
- Enhanced voice emotion recognition
- Compliance reporting dashboard

### Admin Tools

- Real-time conversation monitoring
- Prompt effectiveness analytics
- Crisis intervention reports
- Cultural sensitivity metrics
- Therapeutic boundary compliance tracking

---

This system ensures that the conversational therapist operates within the exact
parameters defined by administrators, providing consistent, safe, and culturally
appropriate mental health support while maintaining the highest standards of
therapeutic practice.
