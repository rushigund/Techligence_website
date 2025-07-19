import Product from "../models/Products.js"; // For dynamic product content
import BlogPost from "../models/BlogPost.js"; // For dynamic blog post content
import JobListing from "../models/JobListing.js"; // For dynamic job listing content (assuming you have this model)

import { chunkText, generateChunkId } from "./textProcessor.js"; // Our text chunking utility
import { generateEmbedding } from "./ollamaClient.js"; // Our Ollama client for embeddings
import { initializePinecone, ensurePineconeIndex, upsertVectors, deleteVectors } from "../services/pineconeService.js"; // Our Pinecone service

// --- Static Content for Manual Ingestion ---
// This content will be ingested once or on manual trigger.
// You can expand this with more static pages or FAQs.
const staticPagesContent = [
  {
    sourceId: "about-us",
    sourceUrl: "/about",
    documentType: "static_page",
    title: "About Techligence",
    content: `
At Techligence, we are dedicated to developing cutting-edge autonomous robotic solutions that empower industries and enrich lives.

Our Mission: To innovate and deliver advanced robotic solutions that enhance productivity, safety, and efficiency across diverse industries.
Our Vision: To be the global leader in intelligent robotics, creating a future where humans and machines collaborate seamlessly.
Our Values: Innovation, Integrity, Excellence, Collaboration, Impact.

Meet the Visionaries: Our team comprises brilliant minds and passionate innovators dedicated to pushing the boundaries of robotics.
Dr. Anya Sharma - CEO & Co-founder: A visionary in AI and robotics, leading Techligence with a passion for innovation and ethical technology.
Mark Jensen - CTO & Co-founder: Expert in embedded systems and hardware design, driving the technical backbone of our robotic solutions.
Sarah Lee - Head of Research: Pioneering new frontiers in human-robot interaction and advanced machine learning algorithms.
Michael Chen - Lead Software Engineer: Architecting robust and scalable software platforms for our autonomous systems.

Our Journey: Milestones & Achievements
2018: Company Founded: Techligence established with a vision for autonomous robotics.
2019: First Prototype: Unveiled the initial 4WD exploration robot prototype.
2021: Series A Funding: Secured significant investment for R&D and expansion.
2023: Product Launch: Introduced the RoboTech Explorer Pro to the market.
2024: Global Expansion: Opened new offices in Europe and Asia.

Our Achievements: Proudly recognized for our contributions to the robotics industry. (Placeholder for Award images)

Have Questions or Want to Collaborate? We'd love to hear from you. Reach out to our team for inquiries, partnerships, or career opportunities.
`,
  },
  {
    sourceId: "contact-us",
    sourceUrl: "/contact",
    documentType: "static_page",
    title: "Contact Techligence",
    content: `
Have questions about our robotics solutions? Need technical support? Want to explore partnership opportunities? We're here to help.

Email Us: hello@techligence.com - Send us an email anytime
Call Us: +1 (555) 123-4567 - Mon-Fri from 8am to 6pm
Visit Us: 123 Tech Boulevard, San Francisco, CA 94105 - Our main headquarters
Business Hours: Monday - Friday: 8:00 AM - 6:00 PM Pacific Standard Time

Contact by Department:
Sales & Partnerships: sales@techligence.com - Product inquiries and business partnerships
Technical Support: support@techligence.com - Technical assistance and troubleshooting
General Inquiries: info@techligence.com - General questions and information

Office Hours:
Monday - Friday: 8:00 AM - 6:00 PM PST
Saturday: 9:00 AM - 2:00 PM PST
Sunday: Closed
* Emergency technical support available 24/7 for enterprise customers
`,
  },
  // Add more static pages or FAQs here as needed
];

// --- Ingestion Functions ---

/**
 * Processes a single content item (product, blog post, static page)
 * by chunking its text, generating embeddings, and upserting into Pinecone.
 *
 * @param {Object} item The content item to process.
 * @param {string} item.sourceId A unique ID for the item (e.g., product ID, blog post ID, page slug).
 * @param {string} item.sourceUrl The URL where the content can be found.
 * @param {string} item.documentType The type of document (e.g., 'product', 'blog', 'static_page').
 * @param {string} item.title The title of the content.
 * @param {string} item.content The main text content to be chunked and embedded.
 * @param {Object} [item.metadata={}] Additional metadata to store with each chunk.
 */
const processAndUpsertContent = async (item) => {
  try {
    console.log(`Processing content: ${item.title} (${item.documentType})`);
    const chunks = await chunkText(item.content); // Chunk the main content

    const vectorsToUpsert = [];
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      const embedding = await generateEmbedding(chunk); // Generate embedding for the chunk

      // Prepare metadata for Pinecone
      const metadata = {
        sourceId: item.sourceId,
        sourceUrl: item.sourceUrl,
        documentType: item.documentType,
        title: item.title,
        chunkText: chunk, // Store the chunk text in metadata for retrieval
        chunkIndex: i,
        // Add any other relevant metadata from the item
        ...item.metadata,
      };

      vectorsToUpsert.push({
        id: generateChunkId(item.sourceId, chunk, i), // Unique ID for each chunk
        values: embedding,
        metadata: metadata,
      });
    }

    // Upsert the generated vectors to Pinecone
    await upsertVectors(vectorsToUpsert);
    console.log(`Successfully ingested ${vectorsToUpsert.length} chunks for '${item.title}'.`);
  } catch (error) {
    console.error(`Error processing and upserting content for '${item.title}':`, error);
    throw error; // Re-throw to be caught by the calling function
  }
};

/**
 * Orchestrates the full content ingestion pipeline.
 * Fetches all dynamic content, processes static content, and updates Pinecone.
 */
export const ingestAllContent = async () => {
  console.log("Starting full content ingestion pipeline...");
  try {
    // 1. Initialize Pinecone and ensure index exists
    const pineconeClient = await initializePinecone();
    // Dimension for nomic-embed-text is 768. Ensure your Pinecone index is created with this dimension.
    await ensurePineconeIndex(768);

    // 2. Ingest Dynamic Content (Products, Blog Posts, Job Listings)
    // Products
    const products = await Product.find({});
    for (const product of products) {
      await processAndUpsertContent({
        sourceId: `product-${product.productId}`,
        sourceUrl: `/products/${product.productId}`,
        documentType: "product",
        title: product.name,
        content: `${product.name}. ${product.description}. Features: ${product.features.join(", ")}. Specifications: Speed ${product.specifications.speed}, Payload ${product.specifications.payload}, Range ${product.specifications.range}, Battery ${product.specifications.battery}. Price: ${product.price}.`,
        metadata: {
          category: product.category,
          inStock: product.inStock,
          price: product.price,
        },
      });
    }

    // Blog Posts
    const blogPosts = await BlogPost.find({});
    for (const post of blogPosts) {
      await processAndUpsertContent({
        sourceId: `blog-${post.postId}`,
        sourceUrl: `/blog/${post.postId}`,
        documentType: "blog",
        title: post.title,
        content: `${post.title}. ${post.excerpt}. Author: ${post.author}. Published: ${post.publishedDate.toISOString().split('T')[0]}. Read Time: ${post.readTime}. Content: ${post.content}`,
        metadata: {
          category: post.category,
          author: post.author,
          publishedDate: post.publishedDate.toISOString(),
        },
      });
    }

    // Job Listings (Assuming you have a JobListing model and relevant data)
    // If you don't have a JobListing model, you can remove this section.
    try {
      const jobListings = await JobListing.find({});
      for (const job of jobListings) {
        await processAndUpsertContent({
          sourceId: `job-${job._id}`, // Assuming _id is used for jobs
          sourceUrl: `/career`, // Or a specific job detail page if you have one
          documentType: "job_listing",
          title: job.title,
          content: `${job.title}. Department: ${job.department}. Location: ${job.location}. Type: ${job.type}. Salary: ${job.salary}. Description: ${job.description}. Skills: ${job.skills.join(", ")}.`,
          metadata: {
            department: job.department,
            location: job.location,
            type: job.type,
          },
        });
      }
    } catch (jobError) {
      console.warn("Could not find JobListing model or fetch jobs. Skipping job ingestion.", jobError.message);
      // This catch block allows the rest of the ingestion to proceed even if JobListing model is missing
    }


    // 3. Ingest Static Content
    for (const staticPage of staticPagesContent) {
      await processAndUpsertContent(staticPage);
    }

    console.log("Full content ingestion pipeline completed successfully!");
  } catch (error) {
    console.error("Full content ingestion pipeline failed:", error);
    throw error; // Re-throw the error for external handling
  }
};

/**
 * Processes and updates/deletes a single dynamic content item in Pinecone.
 * This is used for post-save/delete hooks.
 *
 * @param {string} type The type of content ('product', 'blog', 'job_listing').
 * @param {Object} data The data of the updated/deleted item.
 * @param {string} operation 'upsert' or 'delete'.
 */
export const updateSingleContentItem = async (type, data, operation) => {
  console.log(`Updating single content item: Type=${type}, Operation=${operation}`);
  try {
    await initializePinecone(); // Ensure Pinecone client is initialized

    let sourceId;
    let contentToProcess;
    let metadata = {};
    let sourceUrl;

    if (type === 'product') {
      sourceId = `product-${data.productId}`;
      sourceUrl = `/products/${data.productId}`;
      contentToProcess = `${data.name}. ${data.description}. Features: ${data.features.join(", ")}. Specifications: Speed ${data.specifications.speed}, Payload ${data.specifications.payload}, Range ${data.specifications.range}, Battery ${data.specifications.battery}. Price: ${data.price}.`;
      metadata = {
        category: data.category,
        inStock: data.inStock,
        price: data.price,
      };
    } else if (type === 'blog') {
      sourceId = `blog-${data.postId}`;
      sourceUrl = `/blog/${data.postId}`;
      contentToProcess = `${data.title}. ${data.excerpt}. Author: ${data.author}. Published: ${data.publishedDate.toISOString().split('T')[0]}. Read Time: ${data.readTime}. Content: ${data.content}`;
      metadata = {
        category: data.category,
        author: data.author,
        publishedDate: data.publishedDate.toISOString(),
      };
    } else if (type === 'job_listing') {
        // Assuming job listings use _id for sourceId
        sourceId = `job-${data._id}`;
        sourceUrl = `/career`; // Or specific job URL
        contentToProcess = `${data.title}. Department: ${data.department}. Location: ${data.location}. Type: ${data.type}. Salary: ${data.salary}. Description: ${data.description}. Skills: ${data.skills.join(", ")}.`;
        metadata = {
            department: data.department,
            location: data.location,
            type: data.type,
        };
    } else {
      console.warn(`Unknown content type for single item update: ${type}`);
      return;
    }

    if (operation === 'delete') {
      // For deletion, we need to delete all chunks associated with this sourceId
      // Pinecone doesn't have a direct "delete by metadata filter" for all index types,
      // so we'll delete by ID prefix if possible, or by fetching and then deleting.
      // For simplicity, we'll assume a direct ID deletion based on chunk IDs.
      // A more robust solution might involve storing chunk IDs in MongoDB or querying Pinecone first.
      console.log(`Attempting to delete all chunks for sourceId: ${sourceId}`);
      // As a placeholder, we'll log. A real implementation would need to know all chunk IDs
      // or use a Pinecone feature to delete by metadata filter (if available on your index type).
      // For now, if a document is deleted, its old chunks will remain until a full re-ingestion,
      // or you can implement a more sophisticated deletion strategy.
      // For this initial version, we'll rely on periodic full re-ingestion to clean up.
      console.warn("Direct deletion of all associated chunks by sourceId prefix is complex without knowing all chunk IDs. Consider a full re-ingestion for cleanup or a more advanced deletion strategy.");
      // If your Pinecone index supports it, you might use:
      // await pineconeClient.index(PINECONE_INDEX_NAME).delete({ filter: { sourceId: sourceId } });
      return;
    }

    // For 'upsert' operation
    await processAndUpsertContent({
      sourceId: sourceId,
      sourceUrl: sourceUrl,
      documentType: type,
      title: data.name || data.title, // Use name for product, title for blog/job
      content: contentToProcess,
      metadata: metadata,
    });

    console.log(`Single content item (${type}) ${operation} completed for ID: ${sourceId}`);

  } catch (error) {
    console.error(`Error updating single content item (${type}, ${operation}):`, error);
    throw error;
  }
};
