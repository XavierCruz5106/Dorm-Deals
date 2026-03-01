"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { MessageSquare } from "lucide-react"

export function InboxLink() {
  const [count, setCount] = useState(0)

  useEffect(() => {
    let mounted = true
    async function fetchCount() {
      try {
        const res = await fetch("/api/unread")
        if (!res.ok) return
        const data = await res.json()
        if (mounted) setCount(data.count)
      } catch (e) {
        console.error(e)
      }
    }

    fetchCount()
    const interval = setInterval(fetchCount, 15000)
    return () => {
      mounted = false
      clearInterval(interval)
    }
  }, [])

  return (
    <Link href="/messages" className="relative flex items-center gap-1.5">
      <MessageSquare className="h-4 w-4" />
      <span>Inbox</span>
      {count > 0 && (
        <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-destructive" />
      )}
    </Link>
  )
}
