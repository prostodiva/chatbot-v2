/**
 *  When a user asks "What did we talk about earlier?",
 *  it will search through all previous messages in that conversation
 *  and find the most similar ones to provide context to the AI.
 *  */

import getPool from "../config/database.js"
import { generateEmbedding } from "./embeddingService.js";

export async function findSimilarDocumentsInConversation(query, conversationId, userId, limit = 5) {
    const pool = getPool();

    try {
        console.log('RAG search debug');
        console.log('query', query);
        console.log('ConversationId', conversationId);
        console.log('userId', userId);

        if (!conversationId) {
            console.log('No conversationId provided, skipping RAG search');
            return [];
        }

        if (!userId) {
            console.log('No userId provided, skipping RAG search');
            return [];
        }

        //generate embedding for the user's query
        const queryEmbedding = await generateEmbedding(query);

        //search for similar documents within the conversation using cosine similarity
        const vectorString = '[' + queryEmbedding.join(',') + ']';
        console.log('Query vector string format:', vectorString.substring(0, 100) + '...');

        // Search for similar documents within the conversation using cosine similarity
        const result = await pool.query(`
            SELECT
                de.document_id,
                de.content,
                de.embedding,
                1 - (de.embedding <=> $1::vector) as similarity,
                cm.created_at,
                cm.role
            FROM document_embeddings de
                     JOIN conversation_messages cm ON de.document_id = cm.id::text
            WHERE cm.conversation_id = $2
              AND cm.content != $3
              AND cm.content NOT LIKE '%what did we%'  -- Keep this exclusion
              AND cm.content NOT LIKE '%discuss%'      -- Keep this exclusion
              AND cm.content NOT LIKE '%talk about%'   -- Keep this exclusion
              AND LENGTH(cm.content) > 10              -- ✅ Only get substantial messages
            ORDER BY cm.created_at DESC
                LIMIT 10  -- ✅ Get more candidates
        `, [vectorString, conversationId, query]);


        console.log('found', result.rows.length, 'similar documents');

        // ✅ Better filtering: combine similarity with recency
        const relevantDocs = result.rows
            .filter(row => row.similarity > 0.05)  // ✅ Lower threshold to 0.1
            .sort((a, b) => {
                // Sort by recency first, then by similarity
                const timeDiff = new Date(b.created_at) - new Date(a.created_at);
                if (Math.abs(timeDiff) < 300000) { // ✅ Within 5 minutes (increased)
                    return b.similarity - a.similarity; // Sort by similarity
                }
                return timeDiff; // Sort by time
            })
            .slice(0, limit);

        console.log('similarity after filtering', relevantDocs.length);

        return relevantDocs;
    } catch (error) {
        console.error('vector search error',error);
        throw [];
    }
}