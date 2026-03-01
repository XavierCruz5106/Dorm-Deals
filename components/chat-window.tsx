"use client"

import { useState, useEffect, useRef } from "react"
import { supabase } from "@/lib/supabase"
import { Message } from "@/lib/types"
import { toast } from "sonner"

interface ChatWindowProps {
  conversationId: string
  currentUserId: string
  initialMessages: Message[]
}

export function ChatWindow({
  conversationId,
  currentUserId,
  initialMessages,
}: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [newMsg, setNewMsg] = useState("")
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const channel = supabase
      .channel("public:messages")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          setMessages((m) => [...m, payload.new as Message])
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') return
        // log other statuses
        console.log('subscription status', status)
      })

    return () => {
      supabase.removeChannel(channel)
    }
  }, [conversationId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  async function send() {
    const text = newMsg.trim()
    if (!text) return

    // optimistic update so user sees their message immediately
    const optimistic: Message = {
      id: `temp-${Date.now()}`,
      conversation_id: conversationId,
      sender_id: currentUserId,
      content: text,
      created_at: new Date().toISOString(),
    }
    setMessages((m) => [...m, optimistic])
    setNewMsg("")

    console.log("sending message to conversation", conversationId)
    const { data, error } = await supabase.from("messages").insert({
      conversation_id: conversationId,
      sender_id: currentUserId,
      content: text,
    })

    // log raw results for debugging
    console.log("insert result", { conversationId, data, error })

    if (error) {
      console.error("error sending message", error)
      toast.error("Failed to send message")
      return
    }

    // when insert succeeds the real row should arrive via realtime subscription;
    // if data is returned we can replace optimistic bubble quickly
    if (data && Array.isArray(data) && (data as any).length > 0) {
      const real = (data as any)[0]
      setMessages((m) =>
        m.map((msg) => (msg.id === optimistic.id ? real : msg))
      )
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto px-4 py-2">
        {messages.map((m, idx) => {
          const prev = idx > 0 ? messages[idx - 1] : null
          const sameSender = prev && prev.sender_id === m.sender_id
          const alignment = m.sender_id === currentUserId ? "justify-end" : "justify-start"
          const bubbleColor = m.sender_id === currentUserId ? "bg-primary text-primary-foreground" : "bg-muted"
          const marginTop = sameSender ? "mt-1" : "mt-4"
          const tailClass = m.sender_id === currentUserId ? "after:border-l-primary after:left-full" : "after:border-r-muted after:right-full"

          return (
            <div key={m.id} className={`flex ${alignment} ${marginTop}`}> 
              <div
                className={`relative max-w-[70%] rounded-lg px-4 py-2 ${bubbleColor} after:content-[''] after:absolute after:top-1/2 after:-translate-y-1/2 after:border-[10px] ${tailClass}`}
              >
                <p>{m.content}</p>
                <span className="text-xs text-muted-foreground">
                  {new Date(m.created_at).toLocaleTimeString()}
                </span>
              </div>
            </div>
          )
        })}
        <div ref={bottomRef}></div>
      </div>
      <div className="border-t border-border px-4 py-2 flex items-center gap-2">
        <input
          className="flex-1 rounded-md border border-border px-3 py-2"
          value={newMsg}
          onChange={(e) => setNewMsg(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault()
              send()
            }
          }}
        />
        <button
          className="rounded bg-primary px-4 py-2 text-primary-foreground"
          onClick={send}
        >
          Send
        </button>
      </div>
    </div>
  )
}
