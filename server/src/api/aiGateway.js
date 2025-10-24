import axios from 'axios';
import config from '../config/index.js';

// Here, you can build logic to decide which API to use.
// For now, we'll try Perplexity first, then fall back to OpenAI.
// OpenRouter is great for accessing many models (like Claude) via one key.

export const getBestTextResponse = async (message, history = []) => {
  // --- Strategy 1: Try Perplexity (Good for web-aware answers) ---
  try {
    const response = await axios.post(
      'https://api.perplexity.ai/chat/completions',
      {
        model: 'llama-3-sonar-large-32k-online', // A powerful, web-enabled model
        messages: [
          ...history, // Pass in previous chat history
          { role: 'user', content: message },
        ],
      },
      {
        headers: {
          'Authorization': `Bearer ${config.perplexity.apiKey}`,
          'Content-Type': 'application/json',
        },
      }
    );
    return {
      source: 'Perplexity',
      text: response.data.choices[0].message.content,
    };
  } catch (err) {
    console.warn('Perplexity API failed, falling back to OpenAI...', err.message);

    // --- Strategy 2: Fallback to OpenAI (Reliable all-rounder) ---
    try {
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-4o',
          messages: [
            ...history,
            { role: 'user', content: message },
          ],
        },
        {
          headers: {
            'Authorization': `Bearer ${config.openai.apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );
      return {
        source: 'OpenAI',
        text: response.data.choices[0].message.content,
      };
    } catch (err2) {
      console.error('OpenAI API also failed:', err2.message);
      throw new Error('All AI providers failed.');
    }
  }
  // TODO: Add a 3rd fallback to OpenRouter if needed
};
