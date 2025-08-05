import type { Module } from '../types';

const modules: Module[] = [
  {
    id: 'introduction',
    title: 'Introduction',
    description: 'Begin your journey of self-discovery and healing.',
    order: 1,
    submodules: [
      {
        id: 'intro-1',
        title: 'Welcome',
        prompt: 'Welcome to your journey. Take a moment to reflect on what brought you here today. What are your hopes and expectations for this process?',
        wordCountRequirement: { minimum: 100 },
        order: 1
      },
      {
        id: 'intro-2',
        title: 'Your Story',
        prompt: 'Everyone\'s journey is unique. Could you share a bit about your story and what you hope to achieve through this process?',
        wordCountRequirement: { minimum: 150 },
        order: 2
      }
    ]
  },
  {
    id: 'identity',
    title: 'Identity & Self',
    description: 'Explore who you are beyond your struggles.',
    order: 2,
    submodules: [
      {
        id: 'identity-1',
        title: 'Core Values',
        prompt: 'What are the core values that define you as a person? How do these values guide your decisions and actions?',
        wordCountRequirement: { minimum: 150 },
        order: 1
      },
      {
        id: 'identity-2',
        title: 'Authentic Self',
        prompt: 'When do you feel most authentically yourself? Describe situations or moments where you feel truly aligned with who you are.',
        wordCountRequirement: { minimum: 150 },
        order: 2
      }
    ]
  },
  {
    id: 'journey',
    title: 'Your Journey',
    description: 'Reflect on your path and envision your future.',
    order: 3,
    submodules: [
      {
        id: 'journey-1',
        title: 'Past Reflections',
        prompt: 'Looking back on your journey so far, what have been the most significant moments or realizations?',
        wordCountRequirement: { minimum: 150 },
        order: 1
      },
      {
        id: 'journey-2',
        title: 'Future Vision',
        prompt: 'Imagine yourself six months from now, living more aligned with your values. What does that look like?',
        wordCountRequirement: { minimum: 150 },
        order: 2
      }
    ]
  },
  {
    id: 'daily-impact',
    title: 'Daily Life',
    description: 'Understand how your experiences affect your daily life.',
    order: 4,
    isLocked: true,
    submodules: [
      {
        id: 'daily-1',
        title: 'Daily Patterns',
        prompt: 'How do your experiences influence your daily routines and decisions?',
        wordCountRequirement: { minimum: 150 },
        order: 1
      },
      {
        id: 'daily-2',
        title: 'Coping Strategies',
        prompt: 'What strategies have you developed to manage difficult moments in your day?',
        wordCountRequirement: { minimum: 150 },
        order: 2
      }
    ]
  },
  {
    id: 'relationships',
    title: 'Relationships',
    description: 'Explore how your journey affects and is affected by your relationships.',
    order: 5,
    isLocked: true,
    submodules: [
      {
        id: 'relationships-1',
        title: 'Support Systems',
        prompt: 'Who are the people in your life that support your journey? How do they show their support?',
        wordCountRequirement: { minimum: 150 },
        order: 1
      },
      {
        id: 'relationships-2',
        title: 'Communication',
        prompt: 'How do you communicate your needs and boundaries with others?',
        wordCountRequirement: { minimum: 150 },
        order: 2
      }
    ]
  },
  {
    id: 'emotions',
    title: 'Emotional Awareness',
    description: 'Develop a deeper understanding of your emotional landscape.',
    order: 6,
    isLocked: true,
    submodules: [
      {
        id: 'emotions-1',
        title: 'Emotional Patterns',
        prompt: 'What emotions do you find most challenging to experience? How do you typically respond to these emotions?',
        wordCountRequirement: { minimum: 150 },
        order: 1
      },
      {
        id: 'emotions-2',
        title: 'Emotional Growth',
        prompt: 'How has your relationship with your emotions evolved over time? What would you like to change about how you handle emotions?',
        wordCountRequirement: { minimum: 150 },
        order: 2
      }
    ]
  }
];

export const getModuleById = (moduleId: string): Module | undefined => {
  return modules.find(module => module.id === moduleId);
};

export const getAllModules = (): Module[] => {
  return [...modules].sort((a, b) => a.order - b.order);
};

export const getNextModule = (currentModuleId: string): Module | undefined => {
  const currentModule = getModuleById(currentModuleId);
  if (!currentModule) return undefined;
  
  return modules.find(module => module.order === currentModule.order + 1);
};

export const getPreviousModule = (currentModuleId: string): Module | undefined => {
  const currentModule = getModuleById(currentModuleId);
  if (!currentModule) return undefined;
  
  return modules.find(module => module.order === currentModule.order - 1);
}; 