import { LLMConfig } from '../../services/chat/llm.service';

// Configuration for llama3.2:latest model
export const llmConfig: LLMConfig = {
  type: 'ollama', // Back to Ollama mode
  baseUrl: 'http://localhost:11434',
  model: 'llama3.2:latest',
  temperature: 0.7,
  maxTokens: 500,
};

// Function to get the configuration
export function getLLMConfig(): LLMConfig {
  return llmConfig;
}

// Function to update configuration at runtime
export function updateLLMConfig(newConfig: Partial<LLMConfig>): LLMConfig {
  return { ...llmConfig, ...newConfig };
}
