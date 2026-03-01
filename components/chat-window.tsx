"use client";

import React, { useEffect, useRef, useState } from "react";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { v4 as uuidv4 } from "uuid";

// Ensure these env vars are available to the client:
// NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  throw new Error("Missing Supabase client env vars");
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

type Message = {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  created_at: string;
  is_read: boolean;
};

export function ChatWindow({
  conversationId,
  currentUserId,
  initialMessages = [],
}: {
  conversationId: string;
  currentUserId: string;
  initialMessages?: Message[];
}) {
  const [messages, setMessages] = useState<Message[]>(initialMessages || []);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const channelRef = useRef<ReturnType<SupabaseClient["channel"]> | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);

  // Helper to scroll to bottom
  const scrollToBottom = () => {
    requestAnimationFrame(() => {
      if (listRef.current) {
        listRef.current.scrollTop = listRef.current.scrollHeight;
      }
    });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages.length]);

  useEffect(() => {
    let mounted = true;

    async function setupRealtime() {
      // Ensure Realtime has the current auth token (calls the Realtime access_token message)
      // This requires the user to be authenticated and the browser to have a valid session.
      try {
        await supabase.realtime.setAuth();
      } catch (err) {
        console.error("supabase.realtime.setAuth() failed:", err);
      }

      const topic = `conversation:${conversationId}:messages`;

      // Create private channel; enable self-send if you want the sender to receive their own broadcast via websocket
      const channel = supabase.channel(topic, {
        config: { private: true, broadcast: { self: true } },
      });

      channel
        .on(
          "broadcast",
          { event: "INSERT" },
          (payload: { payload: any; meta?: any }) => {
            // payload.payload will be the broadcast record inserted into realtime.messages by broadcast_changes
            // The broadcast_changes payload shape places the NEW record under payload.record or payload; payload depends on version
            try {
              const record =
                payload?.payload?.record ??
                payload?.payload?.new ??
                payload?.payload ??
                null;

              if (!record) return;

              // Normalize to our Message type shape
              const incoming: Message = {
                id: record.id,
                conversation_id: record.conversation_id,
                sender_id: record.sender_id,
                content: record.content,
                created_at: record.created_at,
                is_read: record.is_read ?? false,
              };

              // Append only if it's for this conversation
              if (incoming.conversation_id === conversationId) {
                setMessages((prev) => {
                  // avoid duplicates
                  if (prev.some((m) => m.id === incoming.id)) return prev;
                  return [...prev, incoming];
                });
              }
            } catch (e) {
              console.error("Error processing realtime broadcast payload", e);
            }
          }
        )
        .subscribe((status, err) => {
          if (err) {
            console.error("Realtime subscribe error:", err);
          }
          // Optional: handle status changes
        });

      channelRef.current = channel;
    }

    setupRealtime();

    return () => {
      mounted = false;
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [conversationId]);

  const sendMessage = async (text: string) => {
    if (!text?.trim()) return;
    setIsSending(true);
    const newId = uuidv4();
    const now = new Date().toISOString();

    // Optimistic update
    const optimistic: Message = {
      id: newId,
      conversation_id: conversationId,
      sender_id: currentUserId,
      content: text,
      created_at: now,
      is_read: false,
    };

    setMessages((prev) => [...prev, optimistic]);
    setInput("");

    try {
      const { error } = await supabase.from("messages").insert([
        {
          id: newId,
          conversation_id: conversationId,
          sender_id: currentUserId,
          content: text,
          created_at: now,
          is_read: false,
        },
      ]);

      if (error) {
        console.error("Insert message error:", error);
        // rollback optimistic update
        setMessages((prev) => prev.filter((m) => m.id !== newId));
        // show error to user as needed
      } else {
        // success — DB trigger will broadcast; if broadcast.self = true sender also receives broadcast,
        // but we already optimistically added the message so nothing else needed.
      }
    } catch (e) {
      console.error("Error sending message:", e);
      setMessages((prev) => prev.filter((m) => m.id !== newId));
    } finally {
      setIsSending(false);
    }
  };

  const onSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim()) return;
    await sendMessage(input.trim());
  };

  return (
    <div className="h-full flex flex-col">
      <div ref={listRef} className="flex-1 overflow-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.sender_id === currentUserId ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[75%] px-3 py-2 rounded-md ${
                msg.sender_id === currentUserId ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
              }`}
            >
              <div className="text-sm whitespace-pre-wrap">{msg.content}</div>
              <div className="text-xs text-muted-foreground mt-1 text-right">
                {new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </div>
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={onSubmit} className="border-t border-border px-4 py-3 flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 px-3 py-2 rounded-md border border-border bg-background"
        />
        <button
          type="submit"
          disabled={isSending}
          className="px-4 py-2 rounded-md bg-primary text-primary-foreground disabled:opacity-50"
        >
          Send
        </button>
      </form>
    </div>
  );
}