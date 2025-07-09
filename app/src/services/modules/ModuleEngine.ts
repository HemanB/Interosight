import { Module, ActivityConfig, UserModuleProgress, ModuleStatus } from '../../core/types/module.types';

export class ModuleEngine {
  private modules: Map<number, Module> = new Map();
  private userProgress: Map<string, UserModuleProgress[]> = new Map();

  constructor() {
    this.loadModules();
  }

  /**
   * Load all module configurations
   */
  private async loadModules(): Promise<void> {
    try {
      // Load Module 0
      const module0 = await this.loadModuleConfig(0);
      this.modules.set(0, module0);
      
      // In the future, load additional modules dynamically
      // const module1 = await this.loadModuleConfig(1);
      // this.modules.set(1, module1);
    } catch (error) {
      console.error('Error loading modules:', error);
    }
  }

  /**
   * Load a specific module configuration
   */
  private async loadModuleConfig(moduleId: number): Promise<Module> {
    try {
      const response = await fetch(`/modules/module-${moduleId}-onboarding/config.json`);
      const moduleConfig = await response.json();
      return moduleConfig as Module;
    } catch (error) {
      console.error(`Error loading module ${moduleId}:`, error);
      throw new Error(`Failed to load module ${moduleId}`);
    }
  }

  /**
   * Get all available modules for a user
   */
  async getAvailableModules(userId: string): Promise<Module[]> {
    const userProgress = this.userProgress.get(userId) || [];
    const completedModules = userProgress
      .filter(progress => progress.completedAt)
      .map(progress => progress.moduleId);

    const availableModules: Module[] = [];
    
    for (const [moduleId, module] of this.modules) {
      if (module.isActive && this.isModuleAvailable(moduleId, completedModules)) {
        availableModules.push(module);
      }
    }

    return availableModules.sort((a, b) => a.id - b.id);
  }

  /**
   * Check if a module is available based on prerequisites
   */
  private isModuleAvailable(moduleId: number, completedModules: number[]): boolean {
    const module = this.modules.get(moduleId);
    if (!module) return false;

    // If no prerequisites, module is available
    if (module.prerequisites.length === 0) return true;

    // Check if all prerequisites are completed
    return module.prerequisites.every(prereq => completedModules.includes(prereq));
  }

  /**
   * Get user's current module status
   */
  async getUserModuleStatus(userId: string, moduleId: number): Promise<ModuleStatus> {
    const userProgress = this.userProgress.get(userId) || [];
    const moduleProgress = userProgress.find(p => p.moduleId === moduleId);
    const module = this.modules.get(moduleId);

    if (!module) {
      throw new Error(`Module ${moduleId} not found`);
    }

    const completedModules = userProgress
      .filter(p => p.completedAt)
      .map(p => p.moduleId);

    let status: 'locked' | 'available' | 'in-progress' | 'completed';
    
    if (moduleProgress?.completedAt) {
      status = 'completed';
    } else if (moduleProgress?.startedAt) {
      status = 'in-progress';
    } else if (this.isModuleAvailable(moduleId, completedModules)) {
      status = 'available';
    } else {
      status = 'locked';
    }

    const activitiesCompleted = moduleProgress?.activitiesCompleted.length || 0;
    const totalActivities = module.activities.length;
    const progress = totalActivities > 0 ? (activitiesCompleted / totalActivities) * 100 : 0;

    return {
      moduleId,
      status,
      progress,
      activitiesCompleted,
      totalActivities,
    };
  }

  /**
   * Start a module for a user
   */
  async startModule(userId: string, moduleId: number): Promise<UserModuleProgress> {
    const module = this.modules.get(moduleId);
    if (!module) {
      throw new Error(`Module ${moduleId} not found`);
    }

    const userProgress = this.userProgress.get(userId) || [];
    const existingProgress = userProgress.find(p => p.moduleId === moduleId);

    if (existingProgress) {
      if (existingProgress.completedAt) {
        throw new Error(`Module ${moduleId} already completed`);
      }
      return existingProgress;
    }

    const newProgress: UserModuleProgress = {
      userId,
      moduleId,
      startedAt: new Date(),
      activitiesCompleted: [],
      reflectionSessions: [],
      score: 0,
      isActive: true,
    };

    userProgress.push(newProgress);
    this.userProgress.set(userId, userProgress);

    return newProgress;
  }

  /**
   * Complete an activity within a module
   */
  async completeActivity(
    userId: string, 
    moduleId: number, 
    activityId: string, 
    score: number
  ): Promise<void> {
    const userProgress = this.userProgress.get(userId) || [];
    const moduleProgress = userProgress.find(p => p.moduleId === moduleId);

    if (!moduleProgress) {
      throw new Error(`Module ${moduleId} not started for user ${userId}`);
    }

    if (!moduleProgress.activitiesCompleted.includes(activityId)) {
      moduleProgress.activitiesCompleted.push(activityId);
      moduleProgress.score += score;
    }

    // Check if module is completed
    const module = this.modules.get(moduleId);
    if (module && this.isModuleCompleted(moduleProgress, module)) {
      moduleProgress.completedAt = new Date();
      moduleProgress.isActive = false;
    }
  }

  /**
   * Check if a module is completed
   */
  private isModuleCompleted(progress: UserModuleProgress, module: Module): boolean {
    const requiredActivities = module.activities.filter(activity => activity.required);
    return requiredActivities.every(activity => 
      progress.activitiesCompleted.includes(activity.id)
    );
  }

  /**
   * Get next available module for a user
   */
  async getNextModule(userId: string): Promise<Module | null> {
    const availableModules = await this.getAvailableModules(userId);
    const userProgress = this.userProgress.get(userId) || [];
    
    // Find the first module that hasn't been started
    for (const module of availableModules) {
      const hasStarted = userProgress.some(p => p.moduleId === module.id);
      if (!hasStarted) {
        return module;
      }
    }

    return null;
  }

  /**
   * Get module by ID
   */
  getModule(moduleId: number): Module | undefined {
    return this.modules.get(moduleId);
  }

  /**
   * Get all modules
   */
  getAllModules(): Module[] {
    return Array.from(this.modules.values());
  }

  /**
   * Get user's overall progress
   */
  async getUserProgress(userId: string): Promise<{
    currentModule: number;
    modulesCompleted: number[];
    totalXP: number;
    totalModules: number;
  }> {
    const userProgress = this.userProgress.get(userId) || [];
    const completedModules = userProgress
      .filter(p => p.completedAt)
      .map(p => p.moduleId);
    
    const totalXP = userProgress.reduce((sum, p) => sum + p.score, 0);
    const currentModule = await this.getCurrentModule(userId);
    
    return {
      currentModule: currentModule?.id || 0,
      modulesCompleted: completedModules,
      totalXP,
      totalModules: this.modules.size,
    };
  }

  /**
   * Get user's current active module
   */
  private async getCurrentModule(userId: string): Promise<Module | null> {
    const userProgress = this.userProgress.get(userId) || [];
    const activeProgress = userProgress.find(p => p.isActive);
    
    if (activeProgress) {
      return this.modules.get(activeProgress.moduleId) || null;
    }

    return await this.getNextModule(userId);
  }
}

// Export singleton instance
export const moduleEngine = new ModuleEngine(); 