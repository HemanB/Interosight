# InteroSight Production Deployment Guide

## Overview
This guide covers deploying InteroSight with the production-ready Llama 3.1 8B integration, designed to handle high load from Reddit beta users.

## Architecture Features

### Load Handling
- **Rate Limiting**: 60 requests/minute in production (120 in development)
- **Request Queue**: Handles up to 100 concurrent requests in production
- **Response Caching**: 30-minute cache for repeated conversations
- **Retry Logic**: Exponential backoff with 3 retry attempts
- **Health Monitoring**: Real-time service health tracking

### Fallback Mechanisms
- **Graceful Degradation**: Fallback responses when API is unavailable
- **Offline Support**: App continues to work without LLM
- **Error Recovery**: Automatic service health restoration

## Environment Setup

### Required Environment Variables
```bash
# Required
HUGGING_FACE_API_KEY=your_hugging_face_api_key_here
NODE_ENV=production

# Optional (with defaults)
RATE_LIMIT_PER_MINUTE=60
MAX_QUEUE_SIZE=100
CACHE_EXPIRY_MINUTES=30
```

### Getting Hugging Face API Key
1. Go to [Hugging Face](https://huggingface.co/settings/tokens)
2. Create a new token with read permissions
3. Add the token to your environment variables

## Production Configuration

### Rate Limiting Strategy
- **Development**: 120 requests/minute (2 per second)
- **Production**: 60 requests/minute (1 per second)
- **Queue Management**: Automatic queuing during peak loads

### Caching Strategy
- **Cache Duration**: 30 minutes
- **Cache Keys**: Conversation hash-based
- **Cache Size**: Unlimited (cleared on app restart)

### Monitoring
- **Health Checks**: Every 10 seconds
- **Network Status**: Real-time connectivity monitoring
- **Queue Monitoring**: Visual queue length indicators

## Deployment Steps

### 1. Environment Configuration
```bash
# Create .env file
cp .env.example .env

# Edit .env with your API key
HUGGING_FACE_API_KEY=your_actual_api_key
NODE_ENV=production
```

### 2. Build and Deploy
```bash
# Install dependencies
npm install

# Build for production
npm run build

# Deploy to your platform
# (Expo, React Native, etc.)
```

### 3. Monitor Deployment
- Check NetworkStatus component for service health
- Monitor console logs for configuration validation
- Verify API connectivity with test messages

## Load Testing

### Expected Capacity
- **Concurrent Users**: 100+ simultaneous users
- **Request Rate**: 1 request/second per user
- **Queue Handling**: Up to 100 queued requests
- **Response Time**: <30 seconds (including queue time)

### Testing Commands
```bash
# Test LLM service health
npm run test:llm

# Test rate limiting
npm run test:load

# Test queue functionality
npm run test:queue
```

## Monitoring and Alerts

### Key Metrics to Monitor
1. **Response Latency**: Should be <30 seconds
2. **Queue Length**: Should be <50 for optimal performance
3. **Error Rate**: Should be <5%
4. **Cache Hit Rate**: Should be >20%

### Health Check Endpoints
- **Service Health**: `llmService.getHealthStatus()`
- **Queue Status**: `llmService.getHealthStatus().queueLength`
- **Error Count**: `llmService.getHealthStatus().errorCount`

## Troubleshooting

### Common Issues

#### High Queue Length
- **Symptom**: Queue length >50
- **Solution**: Increase rate limit or add more API keys

#### High Error Rate
- **Symptom**: Error count >10
- **Solution**: Check API key validity and network connectivity

#### Slow Response Times
- **Symptom**: Latency >30 seconds
- **Solution**: Check Hugging Face API status and rate limits

### Emergency Procedures
1. **Service Unavailable**: App falls back to cached responses
2. **API Key Issues**: Users see fallback messages
3. **Network Issues**: App continues in offline mode

## Scaling Considerations

### For Higher Load
1. **Multiple API Keys**: Rotate between different Hugging Face accounts
2. **Load Balancing**: Distribute requests across multiple endpoints
3. **Caching Enhancement**: Implement Redis for persistent caching
4. **Queue Optimization**: Use external queue service (Redis, SQS)

### Cost Optimization
1. **Cache Strategy**: Increase cache duration for common queries
2. **Rate Limiting**: Optimize based on actual usage patterns
3. **Model Selection**: Consider smaller models for faster responses

## Security Considerations

### API Key Security
- Never commit API keys to version control
- Use environment variables for all sensitive data
- Rotate API keys regularly

### Data Privacy
- No user data is stored in the LLM service
- All conversations are ephemeral
- Cache keys are hashed and don't contain sensitive data

## Support and Maintenance

### Regular Maintenance
- Monitor API usage and costs
- Update rate limits based on usage patterns
- Clear cache periodically to free memory
- Review error logs for patterns

### Emergency Contacts
- **Technical Issues**: Check Hugging Face status page
- **API Limits**: Contact Hugging Face support
- **App Issues**: Review error logs and health status

## Performance Benchmarks

### Expected Performance
- **Cold Start**: <5 seconds
- **Cached Response**: <1 second
- **Queue Wait Time**: <30 seconds (peak load)
- **Error Recovery**: <60 seconds

### Optimization Tips
1. **Pre-warm Cache**: Send common queries during app startup
2. **Queue Management**: Monitor and adjust queue size based on usage
3. **Response Optimization**: Tune model parameters for faster responses 