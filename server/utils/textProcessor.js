// Corrected import: RecursiveCharacterTextSplitter is from @langchain/textsplitters
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters"; 

/**
 * Splits a given text into smaller, overlapping chunks suitable for embedding.
 * Uses a RecursiveCharacterTextSplitter to maintain semantic coherence.
 *
 * @param {string} text The raw text content to be chunked.
 * @param {Object} [options] Configuration options for chunking.
 * @param {number} [options.chunkSize=500] The maximum size of each text chunk (in characters).
 * @param {number} [options.chunkOverlap=50] The number of characters to overlap between consecutive chunks.
 * @returns {Promise<string[]>} A promise that resolves to an array of text chunks.
 */
export const chunkText = async (text, options = {}) => {
  const { chunkSize = 500, chunkOverlap = 50 } = options;

  // Initialize the RecursiveCharacterTextSplitter
  // It tries to split by paragraphs first, then lines, then words, then characters
  // to keep chunks semantically meaningful.
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: chunkSize,
    chunkOverlap: chunkOverlap,
    // Add more separators if your content has specific delimiters you want to prioritize
    // Common separators include: "\n\n", "\n", " ", ""
    separators: ["\n\n", "\n", " ", ""],
  });

  try {
    // Split the text into documents (which are essentially strings in this context)
    const docs = await splitter.createDocuments([text]);
    // Extract the pageContent (the actual text) from each document
    const chunks = docs.map(doc => doc.pageContent);
    console.log(`Text chunked into ${chunks.length} segments.`);
    return chunks;
  } catch (error) {
    console.error("Error chunking text:", error);
    throw new Error(`Failed to chunk text: ${error.message}`);
  }
};

/**
 * Generates a unique ID for a text chunk based on its content and source.
 * This is crucial for upserting and deleting specific chunks in the vector database.
 * A simple hash or combination of source + index can work.
 *
 * @param {string} sourceId A unique identifier for the original document (e.g., product ID, blog post ID, page URL).
 * @param {string} chunkText The text content of the chunk.
 * @param {number} chunkIndex The index of the chunk within its original document.
 * @returns {string} A unique string ID for the chunk.
 */
export const generateChunkId = (sourceId, chunkText, chunkIndex) => {
  // A simple approach: combine sourceId and chunkIndex.
  // For robustness, you might hash the chunkText to ensure uniqueness even if chunks are identical across different sourceIds.
  // However, for this implementation, sourceId-chunkIndex is sufficient for tracking.
  return `${sourceId}-${chunkIndex}`;
};
