import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { getConversationsForUser } from "@/app/actions"
import { Conversation } from "@/lib/types"
import { clerkClient } from "@clerk/nextjs/server"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ConversationItem } from "@/components/conversation-item"

export default async function MessagesPage() {
  const { userId } = await auth()
  if (!userId) {
    redirect("/")
  }

  const conversations: Conversation[] = await getConversationsForUser()

  function renderPartnerName(conv: Conversation) {
    if (conv.user1_id === userId) {
      return conv.user2_name || conv.user2_id
    }
    return conv.user1_name || conv.user1_id
  }

  // group by partner id so multiple convs with same seller are separated
  const grouped: Record<string, Conversation[]> = {}
  conversations.forEach((conv) => {
    const partnerId = conv.user1_id === userId ? conv.user2_id : conv.user1_id
    if (!grouped[partnerId]) grouped[partnerId] = []
    grouped[partnerId].push(conv)
  })

  const client = await clerkClient()
  const partnerAvatars = Object.fromEntries(
    await Promise.all(
      Object.keys(grouped).map(async (partnerId) => {
        try {
          const user = await client.users.getUser(partnerId)
          return [partnerId, user.imageUrl]
        } catch {
          return [partnerId, null]
        }
      })
    )
  ) as Record<string, string | null>

  function getInitials(name: string) {
    return name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "U"
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 lg:px-8">
      <h1 className="text-3xl font-bold text-foreground mb-6">Inbox</h1>
      {conversations.length === 0 ? (
        <p className="text-muted-foreground">You have no conversations yet.</p>
      ) : (
        <div className="space-y-8">
          {Object.entries(grouped).map(([partnerId, convs]) => (
            <div key={partnerId}>
              <div className="mb-2 flex items-center gap-3">
                <Avatar className="size-9">
                  <AvatarImage
                    src={partnerAvatars[partnerId] || undefined}
                    alt={renderPartnerName(convs[0])}
                  />
                  <AvatarFallback>{getInitials(renderPartnerName(convs[0]))}</AvatarFallback>
                </Avatar>
                <p className="font-semibold text-lg">{renderPartnerName(convs[0])}</p>
              </div>
              <div className="divide-y divide-border">
                {convs.map((conv) => (
                  <ConversationItem
                    key={conv.id}
                    conversationId={conv.id}
                    partnerName={renderPartnerName(conv)}
                    createdAt={conv.created_at}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
