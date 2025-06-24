// Configuration for InteroSight LLM Service
export interface AppConfig {
  // API Configuration
  huggingFaceApiKey: string;
  huggingFaceBaseUrl: string;
  modelName: string;
  
  // Rate Limiting
  rateLimitPerMinute: number;
  maxRetries: number;
  timeout: number;
  
  // Caching
  cacheEnabled: boolean;
  cacheExpiryMinutes: number;
  
  // Queue Management
  queueEnabled: boolean;
  maxQueueSize: number;
  
  // Environment
  isProduction: boolean;
  isDevelopment: boolean;
  
  // Monitoring
  enableHealthMonitoring: boolean;
  healthCheckInterval: number;
}

// Load configuration from environment variables
const loadConfig = (): AppConfig => {
  const isProduction = process.env.NODE_ENV === 'production';
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  return {
    // API Configuration
    huggingFaceApiKey: process.env.HUGGING_FACE_API_KEY || '',
    huggingFaceBaseUrl: 'https://api-inference.huggingface.co/models',
    modelName: 'meta-llama/Meta-Llama-3.1-8B-Instruct',
    
    // Rate Limiting - More conservative in production
    rateLimitPerMinute: isProduction ? 60 : 120,
    maxRetries: 3,
    timeout: 30000,
    
    // Caching
    cacheEnabled: true,
    cacheExpiryMinutes: 30,
    
    // Queue Management
    queueEnabled: true,
    maxQueueSize: isProduction ? 100 : 200,
    
    // Environment
    isProduction,
    isDevelopment,
    
    // Monitoring
    enableHealthMonitoring: true,
    healthCheckInterval: 10000, // 10 seconds
  };
};

export const config = loadConfig();

// Validate critical configuration
export const validateConfig = (): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (!config.huggingFaceApiKey) {
    errors.push('HUGGING_FACE_API_KEY is required');
  }
  
  if (config.rateLimitPerMinute <= 0) {
    errors.push('rateLimitPerMinute must be greater than 0');
  }
  
  if (config.maxQueueSize <= 0) {
    errors.push('maxQueueSize must be greater than 0');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Get configuration for LLM service
export const getLLMConfig = () => ({
  apiKey: config.huggingFaceApiKey,
  baseUrl: config.huggingFaceBaseUrl,
  modelName: config.modelName,
  maxRetries: config.maxRetries,
  timeout: config.timeout,
  rateLimitPerMinute: config.rateLimitPerMinute,
  cacheEnabled: config.cacheEnabled,
  cacheExpiryMinutes: config.cacheExpiryMinutes,
  queueEnabled: config.queueEnabled,
  maxQueueSize: config.maxQueueSize,
});

// Log configuration (without sensitive data)
export const logConfig = () => {
  console.log('InteroSight Configuration:');
  console.log('- Environment:', config.isProduction ? 'Production' : 'Development');
  console.log('- Model:', config.modelName);
  console.log('- Rate Limit:', config.rateLimitPerMinute, 'requests/minute');
  console.log('- Cache Enabled:', config.cacheEnabled);
  console.log('- Queue Enabled:', config.queueEnabled);
  console.log('- Max Queue Size:', config.maxQueueSize);
  console.log('- Health Monitoring:', config.enableHealthMonitoring);
}; 