-- create conversation and messages tables for chat feature

CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user1_id TEXT NOT NULL,
  user1_name TEXT,
  user2_id TEXT NOT NULL,
  user2_name TEXT,
  item_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE conversations DISABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_conversations_user1_id ON conversations (user1_id);
CREATE INDEX IF NOT EXISTS idx_conversations_user2_id ON conversations (user2_id);


CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE messages DISABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages (conversation_id);
