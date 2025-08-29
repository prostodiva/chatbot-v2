import express from "express";
import getPool from "../config/database.js";
import { authenticateInternal } from "../middleware/internalAuth.js";
import { getAiResponse } from "../services/aiService.js";
import { generateEmbedding } from "../services/embeddingService.js";

const router = express.Router();


router.post("/chat", authenticateInternal, async (req, res) => {
    try {
        const pool = getPool();
        const { message, conversationId, rules } = req.body;
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

        // Fetch rules AFTER conversation is created/confirmed
        const rulesResult = await pool.query(
            'SELECT rules FROM conversations WHERE id = $1',
            [actualConversationId]
        );
        const conversationRules = rulesResult.rows[0]?.rules;

        //insert the user message
        const userResult = await pool.query(
            `INSERT INTO conversation_messages (conversation_id, role, content)
             VALUES ($1, $2, $3)
                 RETURNING *`,
            [actualConversationId, "user", messageContent]
        );

        const userMessage = userResult.rows[0];
        const embedding = await generateEmbedding(messageContent);

        // Ensure embedding is properly formatted as an array
        let embeddingArray;
        if (Array.isArray(embedding)) {
            embeddingArray = embedding;
        } else if (embedding && typeof embedding === 'object') {
            // If it's an object, extract the values and ensure they're numbers
            embeddingArray = Object.values(embedding).map(val => {
                const num = parseFloat(val);
                if (isNaN(num)) {
                    throw new Error(`Invalid embedding value: ${val}`);
                }
                return num;
            });
        } else {
            throw new Error(`Invalid embedding format: ${typeof embedding}`);
        }

        console.log('Embedding array type:', typeof embeddingArray);
        console.log('Embedding array length:', embeddingArray.length);
        console.log('First few values:', embeddingArray.slice(0, 5));
        console.log('Is Array?', Array.isArray(embeddingArray));
        console.log('First value type:', typeof embeddingArray[0]);

        // Convert to PostgreSQL vector string format
        const vectorString = '[' + embeddingArray.join(',') + ']';
        console.log('Vector string format:', vectorString.substring(0, 100) + '...');

        // Store the embedding in document_embeddings table
        await pool.query(
            `INSERT INTO document_embeddings (document_id, content, embedding) 
             VALUES ($1, $2, $3::vector)`,
            [userMessage.id.toString(), messageContent, vectorString]
        );

        // Include rules in AI prompt
        let aiPrompt = messageContent;
        if (conversationRules) {
            aiPrompt = `Rules for this conversation: ${conversationRules}\n\nUser message: ${messageContent}`;
            console.log('=== AI Prompt with Rules ===');
            console.log('Enhanced prompt:', aiPrompt);
        }

        const assistantReply = await getAiResponse(aiPrompt);

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




router.post("/chat/add", authenticateInternal, async (req, res) => {
    try {
        const pool = getPool();
        const { initialMessage } = req.body;
        const userId = req.user?.id;

        if (!userId) return res.status(401).json({ error: "Unauthorized" });

        // Create new conversation
        const convResult = await pool.query(
            'INSERT INTO conversations (user_id, query) VALUES ($1, $2) RETURNING *',
            [userId, initialMessage || 'New conversation']
        );

        const newConversation = convResult.rows[0];
        
        res.status(201).json({
            conversation: newConversation,
            message: 'Chat created successfully'
        });
    } catch (error) {
        console.error('Create chat error:', error);
        res.status(500).json({ error: 'Failed to create chat' });
    }
});


//chats
router.get("/chats", authenticateInternal, async (req, res) => {
    try {
        const pool = getPool();
        const userId = req.user?.id;

        if (!userId) return res.status(401).json({ error: "Unauthorized" });

        const result = await pool.query(
            `SELECT c.*, 
                    COUNT(cm.id) as message_count,
                    MAX(cm.created_at) as last_message_at
             FROM conversations c
             LEFT JOIN conversation_messages cm ON c.id = cm.conversation_id
             WHERE c.user_id = $1
             GROUP BY c.id
             ORDER BY c.created_at DESC`, // FIXED: was c.updated_at
            [userId]
        );

        res.json(result.rows);
    } catch (error) {
        console.error('Fetch chats error:', error);
        res.status(500).json({ error: 'Failed to fetch chats' });
    }
});


//routes to fetch specific conversation  (For displaying chat history)
router.get("/conversations/:conversationId/messages", authenticateInternal, async (req, res) => {
    try {
        const pool = getPool();
        const { conversationId } = req.params;
        const userId = req.user?.id;

        if (!userId) return res.status(401).json({ error: "Unauthorized" });

        // Verify the conversation belongs to the user
        const convCheck = await pool.query(
            'SELECT id FROM conversations WHERE id = $1 AND user_id = $2',
            [conversationId, userId]
        );

        if (convCheck.rows.length === 0) {
            return res.status(404).json({ error: "Conversation not found" });
        }

        // Fetch messages for the conversation
        const result = await pool.query(
            `SELECT id, role, content, created_at
             FROM conversation_messages 
             WHERE conversation_id = $1
             ORDER BY created_at ASC`,
            [conversationId]
        );

        // Format the messages properly
        const formattedMessages = result.rows.map(row => ({
            id: row.id,
            content: row.content,
            sender: row.role === 'user' ? 'user' : 'assistant',
            timestamp: row.created_at
        }));

        res.json(formattedMessages);
    } catch (error) {
        console.error('Fetch messages error:', error);
        res.status(500).json({ error: 'Failed to fetch messages' });
    }
});


//conversation - For getting conversation metadata (including rules)
// fetch a single conversation with rules
router.get("/conversations/:conversationId", authenticateInternal, async (req, res) => {
    try {
        const pool = getPool();
        const { conversationId } = req.params;
        const userId = req.user?.id;

        if (!userId) return res.status(401).json({ error: "Unauthorized" });

        // Verify the conversation belongs to the user
        const convCheck = await pool.query(
            'SELECT id FROM conversations WHERE id = $1 AND user_id = $2',
            [conversationId, userId]
        );

        if (convCheck.rows.length === 0) {
            return res.status(404).json({ error: "Conversation not found" });
        }

        // Fetch the conversation with rules
        const result = await pool.query(
            `SELECT id, user_id, query, response, created_at, rules
             FROM conversations 
             WHERE id = $1`,
            [conversationId]
        );

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Fetch conversation error:', error);
        res.status(500).json({ error: 'Failed to fetch conversation' });
    }
});

//update conversation rules
router.put("/conversations/:conversationId/rules", authenticateInternal, async (req, res) => {
    try {
        const pool = getPool();
        const { conversationId } = req.params;
        const { rules } = req.body;
        const userId = req.user?.id;
        if (!userId) return res.status(401).json({ error: "Unauthorized" });
        const convCheck = await pool.query(
            'SELECT id FROM conversations WHERE id = $1 AND user_id = $2',
            [conversationId, userId]
        );

        if (convCheck.rows.length === 0) {
            return res.status(404).json({ error: "Conversation not found" });
        }

        await pool.query(
            'UPDATE conversations SET rules = $1 WHERE id = $2',
            [rules, conversationId]
        );

        res.json({ message: 'Rules updated successfully' });
    } catch (error) {
        console.error('Update rules error:', error);
        res.status(500).json({ error: 'Failed to update rules' });
    }
});



export default router;
