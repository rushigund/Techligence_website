import express from "express";
import { body, validationResult } from "express-validator";
import { generateEmbedding, generateLLMResponse } from "../utils/ollamaClient.js"; // NEW: Import Ollama client functions
import { queryVectors } from "../services/pineconeService.js"; // NEW: Import Pinecone query function

const router = express.Router();

// POST /api/chatbot/message - Handle incoming chat messages
router.post(
  "/message",
  [
    body("message").notEmpty().withMessage("Message cannot be empty."),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: "Validation failed", errors: errors.array() });
    }

    const userMessage = req.body.message;
    console.log("Received user message:", userMessage);

    const MAX_RETRIES = 3;
    let retries = 0;

    while (retries < MAX_RETRIES) {
      try {
        // --- RAG Step 1: Generate Embedding for User Query ---
        console.log("Generating embedding for user query...");
        const queryEmbedding = await generateEmbedding(userMessage);
        console.log("Query embedding generated.");

        // --- RAG Step 2: Query Pinecone for Relevant Context ---
        console.log("Querying Pinecone for relevant content...");
        // topK: number of most relevant chunks to retrieve
        const relevantChunks = await queryVectors(queryEmbedding, 3); // Fetch top 3 relevant chunks
        console.log(`Found ${relevantChunks.length} relevant chunks from Pinecone.`);

        // --- RAG Step 3: Format Context and Query into a Prompt for LLM ---
        let contextString = "";
        const sources = new Map(); // Use a Map to store unique sources and assign footnote numbers
        let sourceCounter = 1;

        if (relevantChunks.length > 0) {
          contextString += "Here is some relevant information about Techligence, its products, blogs, and services:\n\n";
          relevantChunks.forEach((match) => {
            const chunkText = match.metadata.chunkText;
            const sourceUrl = match.metadata.sourceUrl;
            const title = match.metadata.title;

            // Assign a unique footnote number to each unique source URL
            let footnoteNumber;
            if (sources.has(sourceUrl)) {
              footnoteNumber = sources.get(sourceUrl);
            } else {
              footnoteNumber = sourceCounter++;
              sources.set(sourceUrl, footnoteNumber);
            }

            contextString += `- **${title}** (Source: [${footnoteNumber}])\n`;
            contextString += `${chunkText}\n\n`;
          });
          contextString += "---\n\n"; // Separator for clarity
        } else {
          console.log("No relevant chunks found for the query. Proceeding without specific context.");
          contextString += "No specific relevant information found in the knowledge base. Please answer based on general knowledge about a robotics/AI company like Techligence if possible.\n\n";
        }

        // Construct the final prompt for the LLM
        let fullPrompt = `You are the official assistant of Techligence, a company specializing in advanced robotics and AI solutions. Your goal is to provide accurate, concise, and helpful answers to user questions based *only* on the provided context. If the answer is not explicitly available in the context, state that you don't have enough information. Do not make up information.

${contextString}

Based on the information provided, please answer the following question:
User Question: ${userMessage}

Please ensure your answer maintains a professional and helpful tone, consistent with a technology company. If you cite information from the provided context, use the footnote numbers like [1], [2], etc., corresponding to the sources listed in the context.`;

        console.log("Sending prompt to Ollama LLM...");
        const llmResponse = await generateLLMResponse(fullPrompt);
        console.log("LLM response received.");

        // --- RAG Step 4: Format Response with Citations ---
        let finalResponse = llmResponse;

        // Append the footnotes at the end of the response
        if (sources.size > 0) {
          finalResponse += "\n\n**Sources:**\n";
          sources.forEach((number, url) => {
            const title = relevantChunks.find(match => match.metadata.sourceUrl === url)?.metadata.title || "Unknown Title";
            finalResponse += `[${number}] ${title} (${url})\n`;
          });
        }

        res.json({
          success: true,
          message: "Bot response generated successfully!",
          data: { response: finalResponse },
        });
        return; // Exit loop on success

      } catch (error) {
        if (error.message.includes("503 Service Unavailable") || error.message.includes("The model is overloaded")) {
          console.warn(`Ollama model overloaded, retrying... (Attempt ${retries + 1})`);
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, retries) * 1000)); // Exponential backoff
          retries++;
        } else {
          console.error("Error generating content from LLM/RAG pipeline:", error);
          res.status(500).json({
            success: false,
            message: "Failed to get a response from the chatbot. Please try again later.",
            error: error.message,
          });
          return; // Exit loop on non-retryable error
        }
      }
    }

    // If all retries fail
    res.status(500).json({
      success: false,
      message: "The chatbot is currently overloaded. Please try again after some time.",
      error: "Ollama model consistently overloaded.",
    });
  }
);

export default router;
