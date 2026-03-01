"use server"

import { auth, currentUser } from "@clerk/nextjs/server"
import { revalidatePath } from "next/cache"
import { supabase } from "@/lib/supabase"
import { Conversation, Message } from "@/lib/types"
import util from "util"

export type Item = {
  id: string
  user_id: string
  user_name: string | null
  user_image_url: string | null
  title: string
  description: string | null
  price: number
  image_url: string | null
  tags: string[]
  condition: string
  is_sold: boolean
  created_at: string
  updated_at: string
}

export async function getItems(search?: string, condition?: string) {
  let query = supabase
    .from("items")
    .select("*")
    .order("created_at", { ascending: false })

  if (search) {
    query = query.ilike("title", `%${search}%`)
  }

  if (condition && condition !== "all") {
    query = query.eq("condition", condition)
  }

  const { data, error } = await query

  if (error) {
    console.error("Error fetching items:", error)
    return []
  }

  return (data as Item[]) ?? []
}

export async function getItemById(id: string) {
  const { data, error } = await supabase
    .from("items")
    .select("*")
    .eq("id", id)
    .single()

  if (error) {
    console.error("Error fetching item:", error)
    return null
  }

  return data as Item
}

export async function getUserItems() {
  const { userId } = await auth()

  if (!userId) {
    return []
  }

  const { data, error } = await supabase
    .from("items")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching user items:", error)
    return []
  }

  return (data as Item[]) ?? []
}

export async function createItem(formData: FormData) {
  const { userId } = await auth()
  if (!userId) {
    return { error: "You must be signed in to create a listing." }
  }

  const user = await currentUser()

  const title = formData.get("title") as string
  const description = formData.get("description") as string
  const price = parseFloat(formData.get("price") as string)
  const image_url = formData.get("image_url") as string
  const condition = formData.get("condition") as string
  const tagsRaw = formData.get("tags") as string

  if (!title || !price || isNaN(price) || price <= 0) {
    return { error: "Title and a valid price are required." }
  }

  const tags = tagsRaw
    ? tagsRaw
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean)
    : []

  const { error } = await supabase.from("items").insert({
    user_id: userId,
    user_name:
      user?.firstName && user?.lastName
        ? `${user.firstName} ${user.lastName}`
        : user?.firstName || user?.username || "Anonymous",
    user_image_url: user?.imageUrl || null,
    title,
    description: description || null,
    price,
    image_url: image_url || null,
    tags,
    condition: condition || "Good",
  })

  if (error) {
    console.error("Error creating item:", error)
    return { error: "Failed to create listing. Please try again." }
  }

  revalidatePath("/")
  revalidatePath("/my-listings")
  return { success: true }
}

export async function toggleSold(id: string) {
  const { userId } = await auth()
  if (!userId) {
    return { error: "You must be signed in." }
  }

  const { data: item } = await supabase
    .from("items")
    .select("user_id, is_sold")
    .eq("id", id)
    .single()

  if (!item || item.user_id !== userId) {
    return { error: "You can only modify your own listings." }
  }

  const { error } = await supabase
    .from("items")
    .update({ is_sold: !item.is_sold, updated_at: new Date().toISOString() })
    .eq("id", id)

  if (error) {
    console.error("Error toggling sold:", error)
    return { error: "Failed to update listing." }
  }

  revalidatePath("/")
  revalidatePath("/my-listings")
  revalidatePath(`/items/${id}`)
  return { success: true }
}

export async function deleteItem(id: string) {
  const { userId } = await auth()
  if (!userId) {
    return { error: "You must be signed in." }
  }

  const { data: item } = await supabase
    .from("items")
    .select("user_id")
    .eq("id", id)
    .single()

  if (!item || item.user_id !== userId) {
    return { error: "You can only delete your own listings." }
  }

  const { error } = await supabase.from("items").delete().eq("id", id)

  if (error) {
    console.error("Error deleting item:", error)
    return { error: "Failed to delete listing." }
  }

  revalidatePath("/")
  revalidatePath("/my-listings")
  return { success: true }
}

// ----------------------------------------------------
// Messaging helpers
// ----------------------------------------------------

/**
 * Returns an existing conversation or creates a new one with the
 * specified other user.  The returned conversation includes the names
 * of both participants (taken from Clerk) so the UI can render them
 * without extra lookups.
 */
export async function getOrCreateConversation(
  otherUserId: string,
  otherUserName: string | null = null,
  itemId: string | null = null
) {
  const { userId } = await auth()
  if (!userId) return null
  if (userId === otherUserId) return null

  // look for an existing conversation in either direction
  let { data, error } = await supabase
    .from<Conversation>("conversations")
    .select("*")
    .or(
      `and(user1_id.eq.${userId},user2_id.eq.${otherUserId}),and(user1_id.eq.${otherUserId},user2_id.eq.${userId})`
    )
    .limit(1)

  if (error) {
    console.error("error fetching conversation", error)
  }

  if (data && data.length > 0) {
    return data[0]
  }

  // no existing conversation; create a new one
  const current = await currentUser()
  const user1Name =
    current?.firstName && current?.lastName
      ? `${current.firstName} ${current.lastName}`
      : current?.firstName || current?.username || null

  const { data: newConv, error: insertError } = await supabase
    .from<Conversation>("conversations")
    .insert({
      user1_id: userId,
      user1_name: user1Name,
      user2_id: otherUserId,
      user2_name: otherUserName,
      item_id: itemId,
    })
    .single()

  if (insertError) {
    console.error("error creating conversation", insertError)
    return null
  }

  return newConv
}

export async function getConversationsForUser() {
  const { userId } = await auth()
  if (!userId) return []

  const { data, error } = await supabase
    .from<Conversation>("conversations")
    .select("*")
    .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("error fetching conversations", error)
    return []
  }

  return (data as Conversation[]) ?? []
}

export async function getConversationById(id: string) {
  try {
    const { data, error } = await supabase
      .from<Conversation>("conversations")
      .select("*")
      .eq("id", id)
      .single()

    if (error) {
      console.error("error fetching conversation by id:", error?.message ?? error)
      try {
        console.error("error details:", util.inspect(error, { depth: null }))
      } catch (e) {
        // ignore inspect failures
      }
      return null
    }

    return data as Conversation
  } catch (err) {
    console.error("unexpected error in getConversationById:", err?.message ?? err)
    try {
      console.error("error details:", util.inspect(err, { depth: null }))
    } catch (e) {
      // ignore
    }
    return null
  }
}

export async function markMessagesRead(conversationId: string) {
  const { userId } = await auth()
  if (!userId) return

  try {
    const { error } = await supabase
      .from("messages")
      .update({ is_read: true })
      .eq("conversation_id", conversationId)
      .neq("sender_id", userId)
      .eq("is_read", false)

    // Supabase sometimes returns empty object; log only if actual message/code
    if (error && Object.keys(error).length) {
      console.error("error marking messages read", error)
    }
  } catch (err) {
    console.error("unexpected error marking messages read", err)
  }
}

export async function getUnreadCount() {
  const { userId } = await auth()
  if (!userId) return 0

  // get all conversation ids involving user
  const convs = await getConversationsForUser()
  if (!convs || convs.length === 0) return 0
  const ids = convs.map((c) => c.id)

  const { count, error } = await supabase
    .from<Message>("messages")
    .select("id", { count: "exact", head: true })
    .in("conversation_id", ids)
    .neq("sender_id", userId)
    .eq("is_read", false)

  if (error) {
    console.error("error counting unread messages", error)
    return 0
  }

  return count || 0
}

export async function getMessages(conversationId: string) {
  const { data, error } = await supabase
    .from<Message>("messages")
    .select("*")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true })

  if (error) {
    console.error("error fetching messages", error)
    return []
  }

  // mark them read for recipient (fire-and-forget)
  markMessagesRead(conversationId).catch((e) => {
    console.error("markMessagesRead failed", e)
  })

  return (data as Message[]) ?? []
}

