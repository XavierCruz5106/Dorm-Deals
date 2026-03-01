import { auth } from "@clerk/nextjs/server"
import { notFound } from "next/navigation"
import { getConversationById, getMessages } from "@/app/actions"
import { ChatWindow } from "@/components/chat-window"

export default async function ConversationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { userId } = await auth()
  if (!userId) {
    notFound()
  }

  const conv = await getConversationById(id)
  if (!conv) {
    notFound()
  }

  // make sure current user is part of conversation
  if (conv.user1_id !== userId && conv.user2_id !== userId) {
    notFound()
  }

  const initialMessages = await getMessages(id)

  const partnerName = conv.user1_id === userId ? conv.user2_name || "" : conv.user1_name || ""

  return (
    <div className="mx-auto max-w-3xl h-screen px-4 py-10 lg:px-8 flex flex-col">
      <div className="flex-1 min-h-0 overflow-hidden rounded-xl border border-border bg-card flex flex-col">
        <div className="border-b border-border px-4 py-3">
          <h1 className="text-2xl font-bold text-foreground">Chat with {partnerName || "User"}</h1>
        </div>
        <div className="flex-1 min-h-0">
          {/* ChatWindow handles its own scrolling and input */}
          <ChatWindow conversationId={id} currentUserId={userId} initialMessages={initialMessages} />
        </div>
      </div>
    </div>
  )
}
