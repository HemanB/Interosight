const SERVER_URL = 'http://172.27.22.198:5000';

export const generateResponse = async (prompt: string): Promise<string> => {
  try {
    console.log('Sending request to LLM server:', SERVER_URL);
    console.log('Prompt:', prompt);
    
    const response = await fetch(`${SERVER_URL}/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt }),
    });

    console.log('Response status:', response.status);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('LLM response:', data);
    
    return data.response;
  } catch (error) {
    console.error('Error calling LLM server:', error);
    throw error;
  }
}; 