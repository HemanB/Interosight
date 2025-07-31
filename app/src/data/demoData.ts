import type { JournalEntry, MealLog, BehaviorLog, Insight, Module } from '../types';

// Demo Module Structure based on requirements
export const demoModules: Module[] = [
  {
    id: 'introduction',
    title: 'Introduction',
    description: 'Setting the stage for your recovery journey',
    type: 'base',
    order: 1,
    submodules: [
      {
        id: 'getting-started',
        title: 'Getting Started',
        description: 'Welcome to your personal recovery space',
        prompts: [
          'What brings you here today?',
          'What would you like this space to help you with?',
          'How are you feeling about starting this journey?'
        ],
        order: 1,
        requiredWordCount: 150
      },
      {
        id: 'privacy-data',
        title: 'Privacy & Data',
        description: 'Understanding how your data is protected',
        prompts: [
          'How do you feel about sharing your personal recovery data?',
          'What aspects of privacy are most important to you in a recovery tool?'
        ],
        order: 2,
        requiredWordCount: 100
      }
    ]
  },
  {
    id: 'identity',
    title: 'Identity',
    description: 'Exploring who you are beyond your eating disorder',
    type: 'base',
    order: 2,
    submodules: [
      {
        id: 'roles-authentic',
        title: 'Authentic Roles',
        description: 'The roles you play and which feel most authentic',
        prompts: [
          'What roles do you play in your life? Which feel most authentic to you?',
          'When do you feel most like yourself?'
        ],
        order: 1,
        requiredWordCount: 200
      },
      {
        id: 'values-decisions',
        title: 'Values & Decisions',
        description: 'The values that guide your choices',
        prompts: [
          'What values guide your decisions or relationships?',
          'What\'s something others might not see about you that you wish they did?'
        ],
        order: 2,
        requiredWordCount: 200
      }
    ]
  },
  {
    id: 'your-journey',
    title: 'Your Journey',
    description: 'Understanding what brought you here and where you\'re going',
    type: 'base',
    order: 3,
    submodules: [
      {
        id: 'why-now',
        title: 'Why Now?',
        description: 'Exploring your motivation at this moment',
        prompts: [
          'Why now? Why are you engaging with this tool at this point in your journey?',
          'What does "getting better" mean to you?'
        ],
        order: 1,
        requiredWordCount: 250
      },
      {
        id: 'recovery-attempts',
        title: 'Recovery History',
        description: 'Past attempts and what you\'ve learned',
        prompts: [
          'When did you first start noticing something felt off?',
          'What has helped or hurt your recovery efforts so far?'
        ],
        order: 2,
        requiredWordCount: 250
      }
    ]
  }
];

export const demoJournalEntries: JournalEntry[] = [
  {
    id: 'entry-1',
    userId: 'demo-user',
    moduleId: 'introduction',
    submoduleId: 'getting-started',
    prompt: 'What brings you here today?',
    response: 'I\'ve been struggling with my relationship with food for about two years now, and I feel like I\'m finally ready to really look at what\'s going on. I found this tool through Reddit and I\'m hoping it can help me understand my patterns better. I\'ve tried therapy before but sometimes I need something more structured between sessions. I want to build a healthier relationship with food and with myself.',
    wordCount: 68,
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
    updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    sessionId: 'session-1',
    isCompleted: true,
    metadata: {
      promptVersion: '1.0',
      responseTime: 450000, // 7.5 minutes
      editCount: 2,
      tags: ['motivation', 'therapy', 'reddit']
    }
  },
  {
    id: 'entry-2',
    userId: 'demo-user',
    moduleId: 'identity',
    submoduleId: 'roles-authentic',
    prompt: 'What roles do you play in your life? Which feel most authentic to you?',
    response: 'I\'m a student, a daughter, a friend, and sometimes I feel like I\'m a "patient" in recovery. The student role feels most authentic to me - I love learning and challenging myself intellectually. When I\'m deep in my studies, I feel like myself in a way that\'s separate from all the food stuff. Being a daughter sometimes feels complicated because my family worries about me, and I hate being the source of their anxiety. As a friend, I try to be supportive but I worry that I\'m not fully present when I\'m struggling.',
    wordCount: 94,
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
    updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    sessionId: 'session-2',
    isCompleted: true,
    metadata: {
      promptVersion: '1.0',
      responseTime: 380000, // 6.3 minutes
      editCount: 1,
      tags: ['identity', 'family', 'student']
    }
  },
  {
    id: 'entry-3',
    userId: 'demo-user',
    moduleId: 'your-journey',
    submoduleId: 'why-now',
    prompt: 'Why now? Why are you engaging with this tool at this point in your journey?',
    response: 'I think I\'m finally at a point where I\'m tired of feeling stuck. I\'ve been in this cycle for so long, and I can see how it\'s affecting not just me but the people I care about. I started a new semester and I want to be able to focus on my goals without food taking up so much mental space. I saw other people on Reddit talking about their recovery journeys and it made me realize I want to be intentional about mine too.',
    wordCount: 78,
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    sessionId: 'session-3',
    isCompleted: true,
    metadata: {
      promptVersion: '1.0',
      responseTime: 320000, // 5.3 minutes
      editCount: 0,
      tags: ['motivation', 'goals', 'semester']
    }
  }
];

export const demoMealLogs: MealLog[] = [
  {
    id: 'meal-1',
    userId: 'demo-user',
    mealType: 'breakfast',
    description: 'Oatmeal with berries and a small glass of orange juice',
    reflection: 'Felt anxious about eating breakfast but reminded myself it\'s important for my energy. The oatmeal was comforting.',
    satietyPre: 3,
    satietyPost: 6,
    emotionsPre: ['anxious', 'nervous'],
    emotionsPost: ['calm', 'grateful'],
    feelingPre: 4,
    feelingPost: 7,
    socialContext: 'alone',
    location: 'kitchen',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() // 2 hours ago
  },
  {
    id: 'meal-2',
    userId: 'demo-user',
    mealType: 'lunch',
    description: 'Salad with chicken and avocado from the campus cafeteria',
    reflection: 'Chose something that felt balanced. Was a bit overwhelmed by all the options but proud of myself for not overthinking it too much.',
    satietyPre: 5,
    satietyPost: 8,
    emotionsPre: ['overwhelmed', 'anxious'],
    emotionsPost: ['proud', 'satisfied'],
    feelingPre: 5,
    feelingPost: 7,
    socialContext: 'room_with_others',
    location: 'cafeteria',
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString() // 4 hours ago
  },
  {
    id: 'meal-3',
    userId: 'demo-user',
    mealType: 'dinner',
    description: 'Pasta with marinara sauce and garlic bread, shared with roommate',
    reflection: 'Really enjoyed this meal! Felt normal to eat with my roommate and we had a good conversation. The food tasted good.',
    satietyPre: 6,
    satietyPost: 8,
    emotionsPre: ['happy', 'social'],
    emotionsPost: ['satisfied', 'grateful', 'social'],
    feelingPre: 7,
    feelingPost: 8,
    socialContext: 'with_others',
    location: 'home',
    createdAt: new Date(Date.now() - 22 * 60 * 60 * 1000).toISOString() // Yesterday evening
  }
];

export const demoBehaviorLogs: BehaviorLog[] = [
  {
    id: 'behavior-1',
    userId: 'demo-user',
    trigger: 'Feeling overwhelmed about upcoming exam and comparing myself to classmates',
    behavior: 'Restricting food intake and excessive exercise (2 hour gym session)',
    reflection: 'I notice that when I feel out of control academically, I try to control other things. The gym session felt compulsive rather than enjoyable.',
    emotionsPre: ['overwhelmed', 'anxious', 'frustrated'],
    emotionsPost: ['guilty', 'exhausted', 'disappointed'],
    feelingPre: 3,
    feelingPost: 4,
    socialContext: 'alone',
    location: 'gym',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() // 3 days ago
  },
  {
    id: 'behavior-2',
    userId: 'demo-user',
    trigger: 'Received a lower grade than expected on an assignment',
    behavior: 'Avoided meals for the rest of the day and isolated from friends',
    reflection: 'The disappointment about the grade felt really intense. I think I was trying to punish myself somehow. Isolating made it worse.',
    emotionsPre: ['disappointed', 'angry', 'ashamed'],
    emotionsPost: ['lonely', 'weak', 'regretful'],
    feelingPre: 2,
    feelingPost: 3,
    socialContext: 'alone',
    location: 'bedroom',
    createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString() // 6 days ago
  }
];

export const demoInsights: Insight[] = [
  {
    id: 'insight-1',
    userId: 'demo-user',
    type: 'pattern',
    title: 'Academic Stress & Food Patterns',
    description: 'Your data shows a connection between academic stressors and changes in eating patterns. When you feel overwhelmed about school, you tend to restrict food or over-exercise.',
    data: {
      pattern: 'academic_stress_eating',
      confidence: 0.8,
      instances: 3,
      timeframe: '2 weeks'
    },
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    isRead: false
  },
  {
    id: 'insight-2',
    userId: 'demo-user',
    type: 'recommendation',
    title: 'Social Eating Benefits',
    description: 'You rated your highest satisfaction and most positive emotions when eating with others. Consider planning more social meals this week.',
    data: {
      recommendation: 'increase_social_eating',
      evidence: 'higher_satisfaction_scores',
      action: 'plan_2_social_meals_weekly'
    },
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    isRead: true
  },
  {
    id: 'insight-3',
    userId: 'demo-user',
    type: 'celebration',
    title: 'Consistent Morning Routine',
    description: 'Great job maintaining breakfast for 5 consecutive days! This consistency is building a strong foundation for your recovery.',
    data: {
      achievement: 'breakfast_consistency',
      streak: 5,
      improvement: 'routine_building'
    },
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    isRead: true
  }
]; 