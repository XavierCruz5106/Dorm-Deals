// shared interfaces used by both server and client code

export type Conversation = {
  id: string
  user1_id: string
  user1_name: string | null
  user2_id: string
  user2_name: string | null
  item_id: string | null
  created_at: string
}

export type Message = {
  id: string
  conversation_id: string
  sender_id: string
  content: string
  created_at: string
}
