"use server"

import { auth, currentUser } from "@clerk/nextjs/server"
import { revalidatePath } from "next/cache"
import { supabase } from "@/lib/supabase"

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
