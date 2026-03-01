import { auth } from "@clerk/nextjs/server"
import { redirect, notFound } from "next/navigation"
import { getOrCreateConversation, getItemById } from "@/app/actions"

export default async function StartChatPage({ params }: { params: Promise<{ sellerId: string; itemId: string }> }) {
  const { sellerId, itemId } = await params
  const { userId } = await auth()
  if (!userId) {
    redirect("/")
  }

  // if user tries to chat with themselves, send back
  if (userId === sellerId) {
    redirect("/")
  }

  const item = await getItemById(itemId)
  if (!item) {
    notFound()
  }

  // create or fetch conversation
  const conv = await getOrCreateConversation(sellerId, item.user_name, itemId)

  if (!conv) {
    // couldn't create - go back to item page
    redirect(`/items/${itemId}`)
  }

  redirect(`/messages/${conv.id}`)
}
