# Intero LLM Server

A simple Node.js server that provides mock LLM responses for the Intero app development.

## Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the server:**
   ```bash
   npm start
   ```

3. **Test the server:**
   ```bash
   node test_server.js
   ```

## Endpoints

- `GET /health` - Health check
- `POST /generate` - Generate LLM response
- `GET /models` - List available models
- `GET /test` - Test endpoint

## Usage

The server runs on `http://localhost:5000` and provides mock responses for:

- **Self-compassion** prompts
- **Body awareness** prompts  
- **Celebration** prompts
- **Emotional awareness** prompts

## Integration with Intero App

The React Native app is already configured to connect to `http://localhost:5000`. Just start this server and your app will automatically use it for all LLM requests.

## Development

For development with auto-restart:
```bash
npm run dev
```

## Response Categories

The server automatically detects the type of prompt and returns appropriate responses:

- **Body-related prompts** → Body awareness responses
- **Celebration/proud prompts** → Celebration responses  
- **Emotion/feeling prompts** → Emotional awareness responses
- **Everything else** → Self-compassion responses 