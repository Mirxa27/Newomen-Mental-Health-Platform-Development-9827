import { api } from '../utils/api';

/**
 * Therapy Service - Handles therapeutic interventions and techniques
 */
export class TherapyService {
  constructor() {
    this.techniques = this.initializeTechniques();
    this.sessionContext = null;
    this.userProfile = null;
  }

  /**
   * Initialize therapeutic techniques library
   */
  initializeTechniques() {
    return {
      // Cognitive Behavioral Therapy (CBT) Techniques
      cbt: {
        thought_challenging: {
          name: 'Thought Challenging',
          description: 'Identify and challenge negative thought patterns',
          steps: [
            'Identify the negative thought',
            'Examine the evidence for and against the thought',
            'Consider alternative perspectives',
            'Develop a balanced, realistic thought',
            'Notice how you feel with the new thought'
          ],
          triggers: ['negative_self_talk', 'catastrophizing', 'black_white_thinking'],
          prompts: [
            'What evidence do you have that this thought is true?',
            'What evidence do you have that this thought is false?',
            'What would you tell a friend in this situation?',
            'What\'s a more balanced way to look at this?',
            'How might you view this situation in a year from now?'
          ]
        },
        behavioral_activation: {
          name: 'Behavioral Activation',
          description: 'Increase engagement in meaningful activities',
          steps: [
            'Identify values and meaningful activities',
            'Schedule pleasant activities',
            'Start with small, manageable tasks',
            'Track mood and activity connection',
            'Gradually increase activity levels'
          ],
          triggers: ['depression', 'low_motivation', 'isolation'],
          activities: [
            'Take a 10-minute walk',
            'Call a friend or family member',
            'Engage in a hobby you enjoy',
            'Listen to uplifting music',
            'Practice a skill you want to develop'
          ]
        },
        cognitive_restructuring: {
          name: 'Cognitive Restructuring',
          description: 'Systematically identify and modify distorted thinking patterns',
          steps: [
            'Identify the situation that triggered distress',
            'Notice automatic thoughts',
            'Identify cognitive distortions',
            'Generate alternative thoughts',
            'Evaluate the helpfulness of new thoughts'
          ],
          cognitive_distortions: [
            'All-or-nothing thinking',
            'Overgeneralization',
            'Mental filtering',
            'Discounting the positive',
            'Jumping to conclusions',
            'Magnification or minimization',
            'Emotional reasoning',
            'Should statements',
            'Labeling',
            'Personalization'
          ]
        }
      },

      // Dialectical Behavior Therapy (DBT) Techniques
      dbt: {
        distress_tolerance: {
          name: 'Distress Tolerance',
          description: 'Survive crisis situations without making them worse',
          acronyms: {
            TIPP: {
              name: 'Temperature, Intense exercise, Paced breathing, Paired muscle relaxation',
              description: 'Quick ways to change your body chemistry and calm down',
              techniques: [
                'Hold ice cubes or splash cold water on face',
                'Do jumping jacks or run in place',
                'Breathe out longer than you breathe in',
                'Tense and release muscle groups'
              ]
            },
            ACCEPTS: {
              name: 'Activities, Contributing, Comparisons, Emotions, Push away, Thoughts, Sensations',
              description: 'Distraction techniques for managing crisis',
              techniques: [
                'Engage in a pleasant activity',
                'Do something kind for someone else',
                'Think about how others cope with similar situations',
                'Generate different emotions through movies/music',
                'Push away painful thoughts temporarily',
                'Count, solve puzzles, or do mental exercises',
                'Focus on physical sensations (ice, exercise, etc.)'
              ]
            }
          }
        },
        emotion_regulation: {
          name: 'Emotion Regulation',
          description: 'Understand and manage difficult emotions',
          steps: [
            'Identify and label the emotion',
            'Understand the function of the emotion',
            'Reduce emotional vulnerability',
            'Increase positive emotions',
            'Be mindful of current emotions'
          ],
          please_skills: {
            name: 'PLEASE Skills',
            description: 'Reduce vulnerability to negative emotions',
            components: [
              'Treat PhysicaL illness',
              'Balance Eating',
              'Avoid mood-Altering substances',
              'Balance Sleep',
              'Get Exercise'
            ]
          }
        },
        mindfulness: {
          name: 'Mindfulness',
          description: 'Observe and participate in the present moment',
          what_skills: [
            'Observe - Notice what is happening',
            'Describe - Put words to the experience',
            'Participate - Fully engage in the moment'
          ],
          how_skills: [
            'Non-judgmentally - Without evaluating as good or bad',
            'One-mindfully - Focus on one thing at a time',
            'Effectively - Do what works for your goals'
          ]
        }
      },

      // Acceptance and Commitment Therapy (ACT) Techniques
      act: {
        values_clarification: {
          name: 'Values Clarification',
          description: 'Identify what truly matters to you',
          life_domains: [
            'Family relationships',
            'Friendships',
            'Career/Work',
            'Health/Physical well-being',
            'Personal growth',
            'Recreation/Leisure',
            'Community involvement',
            'Spirituality'
          ],
          exercises: [
            'Write your own eulogy',
            'Imagine your 80th birthday celebration',
            'Complete the sentence: "I want to be remembered as..."',
            'Identify your heroes and what you admire about them'
          ]
        },
        psychological_flexibility: {
          name: 'Psychological Flexibility',
          description: 'Adapt your behavior to match your values and circumstances',
          components: [
            'Present moment awareness',
            'Acceptance of thoughts and feelings',
            'Cognitive defusion',
            'Values-based action',
            'Committed action',
            'Self-as-context'
          ]
        },
        defusion_techniques: {
          name: 'Cognitive Defusion',
          description: 'Change your relationship with thoughts rather than their content',
          techniques: [
            'Thank your mind for the thought',
            'Sing the thought to a silly tune',
            'Say "I\'m having the thought that..."',
            'Visualize the thought as leaves floating down a stream',
            'Notice the thought as just words'
          ]
        }
      },

      // Mindfulness-Based Interventions
      mindfulness: {
        breathing_exercises: {
          name: 'Breathing Exercises',
          description: 'Use breath as an anchor to the present moment',
          techniques: [
            {
              name: 'Box Breathing',
              steps: ['Inhale for 4 counts', 'Hold for 4 counts', 'Exhale for 4 counts', 'Hold for 4 counts'],
              duration: '5-10 minutes'
            },
            {
              name: '4-7-8 Breathing',
              steps: ['Inhale for 4 counts', 'Hold for 7 counts', 'Exhale for 8 counts'],
              duration: '3-5 minutes'
            },
            {
              name: 'Belly Breathing',
              steps: ['Place hand on chest and belly', 'Breathe so only belly hand moves', 'Inhale slowly through nose', 'Exhale slowly through mouth'],
              duration: '5-15 minutes'
            }
          ]
        },
        body_scan: {
          name: 'Body Scan Meditation',
          description: 'Systematically focus attention on different parts of the body',
          steps: [
            'Lie down comfortably',
            'Start with your toes',
            'Notice sensations without judgment',
            'Move slowly up through your body',
            'End with your head and scalp'
          ],
          duration: '10-45 minutes'
        },
        loving_kindness: {
          name: 'Loving-Kindness Meditation',
          description: 'Cultivate compassion for yourself and others',
          phrases: [
            'May I be happy',
            'May I be healthy',
            'May I be at peace',
            'May I be free from suffering'
          ],
          progression: ['Self', 'Loved one', 'Neutral person', 'Difficult person', 'All beings']
        }
      },

      // Solution-Focused Brief Therapy (SFBT) Techniques
      sfbt: {
        miracle_question: {
          name: 'Miracle Question',
          description: 'Imagine a future where the problem is solved',
          question: 'Suppose tonight while you sleep, a miracle happens and the problem that brought you here is solved. What would be different when you wake up?',
          follow_up: [
            'What would you notice first?',
            'What would others notice?',
            'How would your day be different?',
            'What would you be doing differently?'
          ]
        },
        scaling_questions: {
          name: 'Scaling Questions',
          description: 'Rate progress and identify next steps',
          examples: [
            'On a scale of 1-10, how would you rate your confidence today?',
            'Where were you on this scale last week?',
            'What would need to happen to move from a 5 to a 6?',
            'What would a 10 look like for you?'
          ]
        },
        exception_finding: {
          name: 'Exception Finding',
          description: 'Identify times when the problem is less severe or absent',
          questions: [
            'When is the problem less bothersome?',
            'What\'s different about those times?',
            'What are you doing differently when the problem isn\'t there?',
            'How can we create more of these exceptions?'
          ]
        }
      }
    };
  }

  /**
   * Get appropriate therapeutic technique based on user situation
   */
  async getTherapeuticIntervention(userInput, sessionContext) {
    try {
      const analysis = await this.analyzeUserInput(userInput);
      const technique = this.selectTechnique(analysis, sessionContext);
      
      return {
        technique,
        intervention: this.generateIntervention(technique, analysis),
        followUp: this.generateFollowUp(technique)
      };
    } catch (error) {
      console.error('Error getting therapeutic intervention:', error);
      return this.getDefaultIntervention();
    }
  }

  /**
   * Analyze user input to identify emotional state and therapeutic needs
   */
  async analyzeUserInput(userInput) {
    // In a real implementation, this would use NLP/AI to analyze the input
    // For now, we'll use keyword matching and sentiment analysis
    
    const keywords = {
      anxiety: ['anxious', 'worried', 'nervous', 'panic', 'fear', 'scared'],
      depression: ['sad', 'depressed', 'hopeless', 'empty', 'down', 'low'],
      anger: ['angry', 'frustrated', 'mad', 'irritated', 'rage', 'furious'],
      stress: ['stressed', 'overwhelmed', 'pressure', 'busy', 'exhausted'],
      trauma: ['traumatic', 'flashback', 'triggered', 'nightmare', 'hurt'],
      relationships: ['relationship', 'partner', 'family', 'friend', 'conflict'],
      self_esteem: ['worthless', 'inadequate', 'failure', 'stupid', 'ugly'],
      grief: ['loss', 'death', 'grief', 'mourning', 'goodbye', 'miss']
    };

    const emotions = [];
    const severity = this.assessSeverity(userInput);
    const urgency = this.assessUrgency(userInput);

    // Simple keyword matching
    Object.entries(keywords).forEach(([emotion, words]) => {
      const matches = words.filter(word => 
        userInput.toLowerCase().includes(word.toLowerCase())
      );
      if (matches.length > 0) {
        emotions.push({
          emotion,
          confidence: matches.length / words.length,
          keywords: matches
        });
      }
    });

    return {
      emotions,
      severity,
      urgency,
      text: userInput,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Select appropriate technique based on analysis
   */
  selectTechnique(analysis, sessionContext) {
    const { emotions, severity, urgency } = analysis;
    
    // Handle crisis situations first
    if (urgency === 'high' || severity === 'severe') {
      return this.techniques.dbt.distress_tolerance;
    }

    // Select based on primary emotion
    if (emotions.length > 0) {
      const primaryEmotion = emotions[0].emotion;
      
      switch (primaryEmotion) {
        case 'anxiety':
          return Math.random() > 0.5 
            ? this.techniques.cbt.thought_challenging 
            : this.techniques.mindfulness.breathing_exercises;
            
        case 'depression':
          return Math.random() > 0.5
            ? this.techniques.cbt.behavioral_activation
            : this.techniques.act.values_clarification;
            
        case 'anger':
          return this.techniques.dbt.emotion_regulation;
          
        case 'stress':
          return this.techniques.mindfulness.breathing_exercises;
          
        default:
          return this.techniques.cbt.thought_challenging;
      }
    }

    // Default to thought challenging if no specific emotion detected
    return this.techniques.cbt.thought_challenging;
  }

  /**
   * Generate therapeutic intervention based on technique
   */
  generateIntervention(technique, analysis) {
    const baseIntervention = {
      technique_name: technique.name,
      description: technique.description,
      personalized_message: this.generatePersonalizedMessage(technique, analysis)
    };

    // Add technique-specific content
    if (technique.steps) {
      baseIntervention.steps = technique.steps;
    }
    
    if (technique.prompts) {
      baseIntervention.prompts = technique.prompts;
    }

    if (technique.techniques) {
      baseIntervention.techniques = technique.techniques;
    }

    return baseIntervention;
  }

  /**
   * Generate personalized message based on user's situation
   */
  generatePersonalizedMessage(technique, analysis) {
    const { emotions, severity } = analysis;
    const primaryEmotion = emotions[0]?.emotion || 'general';
    
    const messages = {
      anxiety: {
        mild: `I notice you're feeling anxious. Let's try ${technique.name} to help you feel more grounded.`,
        moderate: `It sounds like anxiety is really affecting you right now. ${technique.name} can help you regain some control.`,
        severe: `I can see you're experiencing intense anxiety. Let's work together using ${technique.name} to find some relief.`
      },
      depression: {
        mild: `I hear that you're feeling down. ${technique.name} might help lift your mood a bit.`,
        moderate: `Depression can make everything feel difficult. Let's try ${technique.name} to help you take a small step forward.`,
        severe: `I understand you're going through a really tough time. ${technique.name} can help us work through this together.`
      },
      general: {
        mild: `Let's explore ${technique.name} to help you with what you're experiencing.`,
        moderate: `${technique.name} can be really helpful for what you're going through.`,
        severe: `I'm here to support you. Let's try ${technique.name} together.`
      }
    };

    const emotionMessages = messages[primaryEmotion] || messages.general;
    return emotionMessages[severity] || emotionMessages.mild;
  }

  /**
   * Generate follow-up questions or activities
   */
  generateFollowUp(technique) {
    const followUps = {
      'Thought Challenging': [
        'How did that feel to challenge that thought?',
        'What evidence did you find that surprised you?',
        'What would you like to practice this technique with next?'
      ],
      'Behavioral Activation': [
        'Which activity feels most doable for you right now?',
        'How can we break this down into smaller steps?',
        'What support do you need to follow through?'
      ],
      'Distress Tolerance': [
        'Which technique felt most helpful?',
        'How intense was the distress before and after?',
        'What will you remember to use this technique next time?'
      ]
    };

    return followUps[technique.name] || [
      'How did that exercise feel for you?',
      'What did you notice during the practice?',
      'What would be helpful to explore next?'
    ];
  }

  /**
   * Assess severity of user's situation
   */
  assessSeverity(userInput) {
    const severeKeywords = ['suicidal', 'kill myself', 'end it all', 'can\'t go on', 'hopeless'];
    const moderateKeywords = ['overwhelming', 'can\'t handle', 'breaking down', 'desperate'];
    
    const text = userInput.toLowerCase();
    
    if (severeKeywords.some(keyword => text.includes(keyword))) {
      return 'severe';
    }
    
    if (moderateKeywords.some(keyword => text.includes(keyword))) {
      return 'moderate';
    }
    
    return 'mild';
  }

  /**
   * Assess urgency of user's situation
   */
  assessUrgency(userInput) {
    const urgentKeywords = ['emergency', 'crisis', 'help me', 'right now', 'immediate'];
    const text = userInput.toLowerCase();
    
    if (urgentKeywords.some(keyword => text.includes(keyword))) {
      return 'high';
    }
    
    return 'low';
  }

  /**
   * Get default intervention when analysis fails
   */
  getDefaultIntervention() {
    return {
      technique: this.techniques.mindfulness.breathing_exercises,
      intervention: {
        technique_name: 'Breathing Exercise',
        description: 'Let\'s start with a simple breathing exercise to help you feel more centered.',
        steps: [
          'Find a comfortable position',
          'Close your eyes or soften your gaze',
          'Take a slow, deep breath in through your nose',
          'Exhale slowly through your mouth',
          'Continue for a few minutes'
        ],
        personalized_message: 'Sometimes the best place to start is with our breath. This can help you feel more grounded.'
      },
      followUp: [
        'How did that feel?',
        'What did you notice about your breathing?',
        'Would you like to try another technique?'
      ]
    };
  }

  /**
   * Track user progress with techniques
   */
  async trackProgress(userId, technique, rating, feedback) {
    try {
      const progressData = {
        user_id: userId,
        technique_name: technique.name,
        technique_type: technique.type,
        rating: rating,
        feedback: feedback,
        timestamp: new Date().toISOString()
      };

      // In a real implementation, this would save to database
      // For now, we'll store in localStorage
      const existingProgress = JSON.parse(localStorage.getItem('therapy_progress') || '[]');
      existingProgress.push(progressData);
      localStorage.setItem('therapy_progress', JSON.stringify(existingProgress));

      return { success: true, message: 'Progress tracked successfully' };
    } catch (error) {
      console.error('Error tracking progress:', error);
      return { success: false, message: 'Failed to track progress' };
    }
  }

  /**
   * Get user's therapy progress
   */
  async getUserProgress(userId) {
    try {
      const progress = JSON.parse(localStorage.getItem('therapy_progress') || '[]');
      return progress.filter(p => p.user_id === userId);
    } catch (error) {
      console.error('Error getting user progress:', error);
      return [];
    }
  }

  /**
   * Get recommendations for next session
   */
  async getSessionRecommendations(userId) {
    try {
      const progress = await this.getUserProgress(userId);
      
      if (progress.length === 0) {
        return {
          recommended_techniques: ['mindfulness.breathing_exercises', 'cbt.thought_challenging'],
          focus_areas: ['stress_management', 'emotional_awareness'],
          notes: 'Starting with foundational techniques for emotional regulation'
        };
      }

      // Analyze progress to make recommendations
      const recentProgress = progress.slice(-5);
      const averageRating = recentProgress.reduce((sum, p) => sum + p.rating, 0) / recentProgress.length;
      
      const recommendations = {
        recommended_techniques: [],
        focus_areas: [],
        notes: ''
      };

      if (averageRating < 3) {
        recommendations.recommended_techniques.push('dbt.distress_tolerance');
        recommendations.focus_areas.push('crisis_management');
        recommendations.notes = 'Focus on distress tolerance and coping strategies';
      } else if (averageRating >= 4) {
        recommendations.recommended_techniques.push('act.values_clarification');
        recommendations.focus_areas.push('personal_growth');
        recommendations.notes = 'Ready to explore values and meaningful action';
      } else {
        recommendations.recommended_techniques.push('cbt.cognitive_restructuring');
        recommendations.focus_areas.push('thought_patterns');
        recommendations.notes = 'Continue working on thought patterns and behavioral changes';
      }

      return recommendations;
    } catch (error) {
      console.error('Error getting session recommendations:', error);
      return {
        recommended_techniques: ['mindfulness.breathing_exercises'],
        focus_areas: ['general_wellness'],
        notes: 'Default recommendations due to error'
      };
    }
  }
}

// Create singleton instance
export const therapyService = new TherapyService();
export default therapyService;