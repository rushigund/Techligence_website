import { Pinecone } from "@pinecone-database/pinecone";
import dotenv from "dotenv";

dotenv.config();

// Retrieve Pinecone configuration from environment variables
const PINECONE_API_KEY = process.env.PINECONE_API_KEY;
// For serverless, the client is initialized with just the API key.
// The index-specific host is provided when you get the index instance.
const PINECONE_INDEX_NAME = process.env.PINECONE_INDEX_NAME || "techligence-content-index";

let pineconeClient; // Declare a variable to hold the initialized Pinecone client

/**
 * Initializes the Pinecone client if it hasn't been initialized already.
 * For serverless, this only requires the API key.
 * @returns {Promise<Pinecone>} The initialized Pinecone client instance.
 * @throws {Error} If Pinecone API Key is not configured.
 */
export const initializePinecone = async () => {
  if (!PINECONE_API_KEY) {
    throw new Error("Pinecone API Key not configured in .env");
  }

  if (!pineconeClient) {
    try {
      console.log("Initializing Pinecone client for serverless...");
      pineconeClient = new Pinecone({
        apiKey: PINECONE_API_KEY,
        // For serverless, no controllerHostUrl or environment is passed here.
        // The client automatically infers the correct endpoint based on the API key.
      });
      console.log("Pinecone client initialized successfully.");
    } catch (error) {
      console.error("Error initializing Pinecone client:", error);
      throw new Error(`Failed to initialize Pinecone client: ${error.message}`);
    }
  }
  return pineconeClient;
};

/**
 * Ensures the Pinecone index exists. If not, it creates it.
 * For serverless, index creation is done via the client, and the host is then used for data operations.
 * @param {number} dimension The dimension of the vectors to be stored in the index.
 * @returns {Promise<void>}
 * @throws {Error} If index creation fails or client is not initialized.
 */
export const ensurePineconeIndex = async (dimension) => {
  if (!pineconeClient) {
    throw new Error("Pinecone client not initialized. Call initializePinecone first.");
  }

  try {
    const listIndexesResponse = await pineconeClient.listIndexes(); // Get the full response object
    // Access the 'indexes' array from the response object
    const indexes = listIndexesResponse.indexes; 

    if (indexes.some(index => index.name === PINECONE_INDEX_NAME)) {
      console.log(`Pinecone index '${PINECONE_INDEX_NAME}' already exists.`);
    } else {
      console.log(`Pinecone index '${PINECONE_INDEX_NAME}' not found. Creating new index...`);
      await pineconeClient.createIndex({
        name: PINECONE_INDEX_NAME,
        dimension: dimension, // Vector dimension (e.g., 768 for nomic-embed-text)
        metric: "cosine",
        // For serverless, you might specify cloud and region here if not inferred
        // For example: cloud: 'aws', region: 'us-east-1'
        cloud: 'aws', // Explicitly specify cloud as per your screenshot
        region: 'us-east-1' // Explicitly specify region as per your screenshot
      });
      console.log(`Pinecone index '${PINECONE_INDEX_NAME}' created successfully.`);
    }
  } catch (error) {
    console.error("Error checking/creating Pinecone index:", error);
    throw new Error(`Failed to check/create Pinecone index: ${error.message}`);
  }
};

/**
 * Upserts (inserts or updates) vectors into the Pinecone index.
 * @param {Array<Object>} vectors An array of vector objects, each with an 'id', 'values' (embedding), and optional 'metadata'.
 * Example: [{ id: 'doc1-chunk0', values: [0.1, 0.2, ...], metadata: { source: 'about', chunk_text: '...' } }]
 * @returns {Promise<void>}
 * @throws {Error} If the upsert operation fails.
 */
export const upsertVectors = async (vectors) => {
  if (!pineconeClient) {
    throw new Error("Pinecone client not initialized. Call initializePinecone first.");
  }

  try {
    // For serverless, you get the index instance by name.
    // The client handles the correct host resolution internally.
    const index = pineconeClient.index(PINECONE_INDEX_NAME);
    await index.upsert(vectors);
    console.log(`Successfully upserted ${vectors.length} vectors into Pinecone.`);
  } catch (error) {
    console.error("Error upserting vectors to Pinecone:", error);
    throw new Error(`Failed to upsert vectors to Pinecone: ${error.message}`);
  }
};

/**
 * Queries the Pinecone index for the top-k most similar vectors.
 * @param {number[]} queryVector The embedding vector of the query.
 * @param {number} topK The number of top similar vectors to retrieve.
 * @param {Object} [filter] Optional metadata filter to apply to the search.
 * @returns {Promise<Array<Object>>} A promise that resolves to an array of matching results.
 * Each result includes 'id', 'score', and 'metadata'.
 * @throws {Error} If the query operation fails.
 */
export const queryVectors = async (queryVector, topK = 5, filter = {}) => {
  if (!pineconeClient) {
    throw new Error("Pinecone client not initialized. Call initializePinecone first.");
  }

  try {
    const index = pineconeClient.index(PINECONE_INDEX_NAME);
    
    // Removed TypeScript type annotation ': any' as this is a JavaScript file.
    const queryOptions = { 
      vector: queryVector,
      topK: topK,
      includeMetadata: true,
    };

    // Conditionally add the filter property if it's not an empty object
    if (Object.keys(filter).length > 0) {
      queryOptions.filter = filter;
    }

    const queryResponse = await index.query(queryOptions);

    return queryResponse.matches || [];
  } catch (error) {
    console.error("Error querying Pinecone:", error);
    throw new Error(`Failed to query Pinecone: ${error.message}`);
  }
};

/**
 * Deletes vectors from the Pinecone index by their IDs.
 * @param {string[]} ids An array of vector IDs to delete.
 * @returns {Promise<void>}
 * @throws {Error} If the delete operation fails.
 */
export const deleteVectors = async (ids) => {
  if (!pineconeClient) {
    throw new Error("Pinecone client not initialized. Call initializePinecone first.");
  }

  try {
    const index = pineconeClient.index(PINECONE_INDEX_NAME);
    await index.delete1({ ids: ids }); // Use delete1 for array of IDs
    console.log(`Successfully deleted vectors with IDs: ${ids.join(", ")} from Pinecone.`);
  } catch (error) {
    console.error("Error deleting vectors from Pinecone:", error);
    throw new Error(`Failed to delete vectors from Pinecone: ${error.message}`);
  }
};
