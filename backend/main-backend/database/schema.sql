

CREATE DATABASE assistant_main;

\c assistant_main

-- pgvector extension for embeddings
CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE document_embeddings (
                                     id SERIAL PRIMARY KEY,
                                     document_id VARCHAR(255) NOT NULL,
                                     content TEXT NOT NULL,
                                     embedding VECTOR(1536),
                                     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE conversations (
                               id SERIAL PRIMARY KEY,
                               user_id INT NOT NULL,  -- logical reference to assistant_auth.users(id)
                               query TEXT NOT NULL,
                               response TEXT,
                               created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE conversation_messages (
                                       id SERIAL PRIMARY KEY,
                                       conversation_id INT REFERENCES conversations(id),
                                       role VARCHAR(10) NOT NULL,  -- 'user' or 'assistant'
                                       content TEXT NOT NULL,
                                       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
