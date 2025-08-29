import express from "express";
import getPool from "../config/database.js";
import { authenticateInternal } from "../middleware/internalAuth.js";
import { getAiResponse } from "../services/aiService.js";
import { generateEmbedding } from "../services/embeddingService.js";

const router = express.Router();

router.post("/chat", authenticateInternal, async (req, res) => {
    try {
        const pool = getPool();
        const { message, conversationId } = req.body;
        const userId = req.user?.id;

        if (!userId) return res.status(401).json({ error: "Unauthorized" });

        // Extract the actual message content from the nested structure
        const messageContent = message.content?.content || message.content || message;
        console.log('=== Debug: Message and Embedding ===');
        console.log('Full message object:', message);
        console.log('Extracted content:', messageContent);
        console.log('Content type:', typeof messageContent);

        // Create conversation if it doesn't exist
        let actualConversationId = conversationId;
        if (conversationId) {
            // Check if conversation exists
            const convCheck = await pool.query(
                'SELECT id FROM conversations WHERE id = $1',
                [conversationId]
            );
            
            if (convCheck.rows.length === 0) {
                // Create new conversation
                const convResult = await pool.query(
                    'INSERT INTO conversations (user_id, query) VALUES ($1, $2) RETURNING id',
                    [userId, messageContent]
                );
                actualConversationId = convResult.rows[0].id;
            }
        } else {
            // Create new conversation if none provided
            const convResult = await pool.query(
                'INSERT INTO conversations (user_id, query) VALUES ($1, $2) RETURNING id',
                [userId, messageContent]
            );
            actualConversationId = convResult.rows[0].id;
        }

        // Now insert the user message
        const userResult = await pool.query(
            `INSERT INTO conversation_messages (conversation_id, role, content)
             VALUES ($1, $2, $3)
                 RETURNING *`,
            [actualConversationId, "user", messageContent]
        );

        const userMessage = userResult.rows[0];
        const embedding = await generateEmbedding(messageContent); // Use messageContent here

        // Store the embedding in document_embeddings table
        await pool.query(
            `INSERT INTO document_embeddings (document_id, content, embedding) 
             VALUES ($1, $2, $3::vector)`,
            [userMessage.id.toString(), messageContent, embedding]
        );

        const assistantReply = await getAiResponse(messageContent); // Use messageContent here

        const assistantResult = await pool.query(
            `INSERT INTO conversation_messages (conversation_id, role, content)
             VALUES ($1, $2, $3)
                 RETURNING *`,
            [actualConversationId, "assistant", assistantReply]
        );

        res.json({
            message: assistantReply,
            timestamp: assistantResult.rows[0].created_at,
            conversationId: actualConversationId
        });
    } catch (err) {
        console.error("Chat API error:", err);
        console.error("Error details:", {
            message: err.message,
            stack: err.stack,
            code: err.code,
            detail: err.detail,
            hint: err.hint,
            where: err.where
        });
        res.status(500).json({ error: "Failed to process chat" });
    }
});

export default router;
