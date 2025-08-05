import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import HomeScreen from '../../screens/HomeScreen';
import { AuthProvider } from '../../contexts/AuthContext';
import { loadModuleProgress } from '../../services/firebaseService';

// Mock the Firebase service
vi.mock('../../services/firebaseService', () => ({
  loadModuleProgress: vi.fn()
}));

// Mock the modules data
vi.mock('../../data/modules', () => ({
  modules: [
    {
      id: 'introduction',
      title: 'Introduction',
      description: 'Get started with your recovery journey',
      type: 'base' as const,
      status: 'current' as const,
      submodules: [
        { id: 'intro-1', title: 'Welcome', prompt: 'Tell me about yourself' },
        { id: 'intro-2', title: 'Goals', prompt: 'What are your goals?' },
        { id: 'intro-3', title: 'Challenges', prompt: 'What challenges do you face?' },
        { id: 'intro-4', title: 'Support', prompt: 'What support do you need?' }
      ],
      completedSubmodules: 0,
      totalSubmodules: 4
    },
    {
      id: 'nutrition',
      title: 'Nutrition',
      description: 'Learn about healthy eating habits',
      type: 'base' as const,
      status: 'locked' as const,
      submodules: [],
      completedSubmodules: 0,
      totalSubmodules: 0
    }
  ]
}));

// Mock the auth context
const mockSetCurrentScreen = vi.fn();

const renderHomeScreen = (user = { uid: 'test-user', email: 'test@example.com' }) => {
  return render(
    <AuthProvider>
      <HomeScreen setCurrentScreen={mockSetCurrentScreen} />
    </AuthProvider>
  );
};

describe('HomeScreen', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSetCurrentScreen.mockClear();
  });

  describe('Rendering Tests', () => {
    it('renders all main elements successfully', () => {
      renderHomeScreen();

      // Check for main header
      expect(screen.getByText('Welcome to Interosight')).toBeInTheDocument();

      // Check for action cards
      expect(screen.getByText('Start Your Journey')).toBeInTheDocument();
      expect(screen.getByText('Freeform Journaling')).toBeInTheDocument();
      expect(screen.getByText('Track Your Day')).toBeInTheDocument();

      // Check for module cards
      expect(screen.getByText('Introduction')).toBeInTheDocument();
      expect(screen.getByText('Nutrition')).toBeInTheDocument();

      // Check for progress indicators
      expect(screen.getByText('0%')).toBeInTheDocument();
    });

    it('renders all action card descriptions', () => {
      renderHomeScreen();

      expect(screen.getByText(/Begin your structured recovery journey/)).toBeInTheDocument();
      expect(screen.getByText(/Write freely about anything on your mind/)).toBeInTheDocument();
      expect(screen.getByText(/Log meals and behaviors with context/)).toBeInTheDocument();
    });

    it('renders all module descriptions', () => {
      renderHomeScreen();

      expect(screen.getByText(/Get started with your recovery journey/)).toBeInTheDocument();
      expect(screen.getByText(/Learn about healthy eating habits/)).toBeInTheDocument();
    });

    it('renders progress indicators for all modules', () => {
      renderHomeScreen();

      // Check for progress text
      expect(screen.getByText('0%')).toBeInTheDocument();
      
      // Check for progress bars (they should be present)
      const progressBars = screen.getAllByRole('progressbar');
      expect(progressBars.length).toBeGreaterThan(0);
    });

    it('renders all status icons correctly', () => {
      renderHomeScreen();

      // Check for status indicators (current, locked, completed)
      const statusElements = screen.getAllByText(/○|🔒|✓/);
      expect(statusElements.length).toBeGreaterThan(0);
    });
  });

  describe('Button Functionality Tests', () => {
    it('calls setCurrentScreen with correct parameters when "Start Your Journey" is clicked', async () => {
      renderHomeScreen();

      const startJourneyButton = screen.getByText('Start Your Journey');
      fireEvent.click(startJourneyButton);

      expect(mockSetCurrentScreen).toHaveBeenCalledWith({
        screen: 'module',
        moduleId: 'introduction'
      });
    });

    it('calls setCurrentScreen with correct parameters when "Freeform Journaling" is clicked', async () => {
      renderHomeScreen();

      const freeformButton = screen.getByText('Freeform Journaling');
      fireEvent.click(freeformButton);

      expect(mockSetCurrentScreen).toHaveBeenCalledWith({
        screen: 'freeform-journal'
      });
    });

    it('calls setCurrentScreen with correct parameters when "Track Your Day" is clicked', async () => {
      renderHomeScreen();

      const trackButton = screen.getByText('Track Your Day');
      fireEvent.click(trackButton);

      expect(mockSetCurrentScreen).toHaveBeenCalledWith({
        screen: 'log'
      });
    });

    it('calls setCurrentScreen when Introduction module card is clicked', async () => {
      renderHomeScreen();

      const introModule = screen.getByText('Introduction').closest('div');
      if (introModule) {
        fireEvent.click(introModule);
      }

      expect(mockSetCurrentScreen).toHaveBeenCalledWith({
        screen: 'module',
        moduleId: 'introduction'
      });
    });

    it('does not call setCurrentScreen when locked module card is clicked', async () => {
      renderHomeScreen();

      const nutritionModule = screen.getByText('Nutrition').closest('div');
      if (nutritionModule) {
        fireEvent.click(nutritionModule);
      }

      expect(mockSetCurrentScreen).not.toHaveBeenCalled();
    });
  });

  describe('State-Based Functionality Tests', () => {
    it('shows correct progress percentage for new user', () => {
      renderHomeScreen();

      expect(screen.getByText('0%')).toBeInTheDocument();
    });

    it('shows loading state when module progress is being loaded', async () => {
      // Mock the loadModuleProgress to return a promise that doesn't resolve immediately
      vi.mocked(loadModuleProgress).mockImplementation(() => 
        new Promise(() => {}) // Never resolves
      );

      renderHomeScreen();

      // Should show loading indicator
      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('shows error state when module progress loading fails', async () => {
      vi.mocked(loadModuleProgress).mockRejectedValue(new Error('Failed to load'));

      renderHomeScreen();

      await waitFor(() => {
        expect(screen.getByText(/Failed to load module progress/)).toBeInTheDocument();
      });
    });

    it('updates progress display when module progress is loaded', async () => {
      const mockProgress = {
        userId: 'test-user',
        moduleId: 'introduction',
        submoduleProgress: {
          'intro-1': { status: 'completed' as const },
          'intro-2': { status: 'completed' as const },
          'intro-3': { status: 'in_progress' as const },
          'intro-4': { status: 'not_started' as const }
        },
        overallProgress: 50,
        lastAccessed: new Date(),
        unlockedAt: new Date()
      };

      vi.mocked(loadModuleProgress).mockResolvedValue(mockProgress);

      renderHomeScreen();

      await waitFor(() => {
        expect(screen.getByText('50%')).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility Tests', () => {
    it('has proper ARIA labels for interactive elements', () => {
      renderHomeScreen();

      // Check that buttons have accessible names
      expect(screen.getByRole('button', { name: 'Start Your Journey' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Freeform Journaling' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Track Your Day' })).toBeInTheDocument();
    });

    it('has proper heading structure', () => {
      renderHomeScreen();

      // Check for main heading
      expect(screen.getByRole('heading', { name: 'Welcome to Interosight' })).toBeInTheDocument();
    });

    it('has proper progress bar accessibility', () => {
      renderHomeScreen();

      const progressBars = screen.getAllByRole('progressbar');
      progressBars.forEach(progressBar => {
        expect(progressBar).toHaveAttribute('aria-valuenow');
        expect(progressBar).toHaveAttribute('aria-valuemin');
        expect(progressBar).toHaveAttribute('aria-valuemax');
      });
    });
  });

  describe('Error Handling Tests', () => {
    it('handles network errors gracefully', async () => {
      vi.mocked(loadModuleProgress).mockRejectedValue(new Error('Network error'));

      renderHomeScreen();

      await waitFor(() => {
        expect(screen.getByText(/Failed to load module progress/)).toBeInTheDocument();
      });
    });

    it('allows retry when loading fails', async () => {
      vi.mocked(loadModuleProgress).mockRejectedValue(new Error('Failed to load'));

      renderHomeScreen();

      await waitFor(() => {
        expect(screen.getByText(/Failed to load module progress/)).toBeInTheDocument();
      });

      // Check for retry button or functionality
      const retryButton = screen.getByText(/refresh the page/);
      expect(retryButton).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('handles empty module list gracefully', () => {
      // Mock empty modules
      vi.mocked(require('../../data/modules')).modules = [];

      renderHomeScreen();

      // Should still render the main structure
      expect(screen.getByText('Welcome to Interosight')).toBeInTheDocument();
      expect(screen.getByText('Start Your Journey')).toBeInTheDocument();
    });

    it('handles undefined setCurrentScreen prop', () => {
      render(
        <AuthProvider>
          <HomeScreen />
        </AuthProvider>
      );

      // Should not crash and still render
      expect(screen.getByText('Welcome to Interosight')).toBeInTheDocument();
    });

    it('handles null user gracefully', () => {
      render(
        <AuthProvider>
          <HomeScreen setCurrentScreen={mockSetCurrentScreen} />
        </AuthProvider>
      );

      // Should show appropriate state for no user
      expect(screen.getByText('Welcome to Interosight')).toBeInTheDocument();
    });
  });
}); 