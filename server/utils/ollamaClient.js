import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

// Configuration for the Ollama API
const OLLAMA_HOST = process.env.OLLAMA_HOST || 'http://localhost:11434';
// Changed default to 'phi3:mini' for faster local generation on resource-constrained machines.
// This model is much smaller and more efficient than llama3.1:8b.
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'phi3:mini';
const OLLAMA_EMBEDDING_MODEL = process.env.OLLAMA_EMBEDDING_MODEL || 'nomic-embed-text'; // Dedicated model for embeddings (768 dimensions)

// Create an Axios instance for Ollama with a longer timeout
const ollamaApi = axios.create({
  baseURL: OLLAMA_HOST,
  timeout: 120000, // Increased timeout to 120 seconds (2 minutes)
});

/**
 * Generates a response from the Ollama LLM based on the provided prompt and context.
 * @param {string} prompt The user's query or instruction.
 * @param {string} [context=''] Optional context or relevant information from RAG.
 * @returns {Promise<string>} The generated text response from the LLM.
 * @throws {Error} If the LLM response generation fails.
 */
export const generateLLMResponse = async (prompt, context = '') => {
  try {
    console.log(`Sending prompt to Ollama LLM with model ${OLLAMA_MODEL}...`);

    // Combine prompt and context for the LLM
    const fullPrompt = context ? `Context: ${context}\n\nQuestion: ${prompt}` : prompt;

    const response = await ollamaApi.post('/api/generate', {
      model: OLLAMA_MODEL,
      prompt: fullPrompt,
      stream: false, // We want a single response, not a stream
      options: {
        temperature: 0.7, // Adjust for creativity vs. factualness
        num_ctx: 4096, // Context window size, adjust based on model capabilities and needs
      },
    });

    if (response.data && response.data.response) {
      console.log('LLM response received from Ollama.');
      return response.data.response;
    } else {
      throw new Error('No response data from Ollama.');
    }
  } catch (error) {
    // Check if the error is an Axios timeout error
    if (axios.isAxiosError(error) && error.code === 'ECONNABORTED') {
      console.error(`Error generating LLM response with Ollama model ${OLLAMA_MODEL}: timeout of ${ollamaApi.defaults.timeout}ms exceeded`);
      throw new Error(`Failed to generate LLM response: timeout of ${ollamaApi.defaults.timeout}ms exceeded`);
    }

    console.error(`Error generating LLM response with Ollama model ${OLLAMA_MODEL}:`, error.message);
    throw new Error(`Failed to generate LLM response: ${error.message}`);
  }
};

/**
 * Retrieves the embedding for a given text using the Ollama embedding model.
 * @param {string} text The text to embed.
 * @returns {Promise<number[]>} An array of numbers representing the embedding vector.
 * @throws {Error} If embedding generation fails.
 */
export const generateEmbedding = async (text) => {
  try {
    console.log('Generating embedding for text...');
    const response = await ollamaApi.post('/api/embeddings', {
      model: OLLAMA_EMBEDDING_MODEL, // Use the dedicated embedding model
      prompt: text,
    });

    if (response.data && response.data.embedding) {
      console.log('Embedding generated.');
      return response.data.embedding;
    } else {
      throw new Error('No embedding data from Ollama.');
    }
  } catch (error) {
    console.error('Error generating embedding:', error.message);
    throw new Error(`Failed to generate embedding: ${error.message}`);
  }
};
