"use client"

import { useEffect, useState } from "react"
import {
  getRatingSummaryForUser,
  RATINGS_UPDATED_EVENT,
} from "@/lib/local-ratings"

export function SellerRatingSummary({ userId }: { userId: string }) {
  const [summary, setSummary] = useState({ avgRating: 0, ratingCount: 0 })

  useEffect(() => {
    function sync() {
      setSummary(getRatingSummaryForUser(userId))
    }

    sync()
    window.addEventListener(RATINGS_UPDATED_EVENT, sync)
    window.addEventListener("storage", sync)
    return () => {
      window.removeEventListener(RATINGS_UPDATED_EVENT, sync)
      window.removeEventListener("storage", sync)
    }
  }, [userId])

  return (
    <p className="text-xs text-muted-foreground">
      {summary.avgRating || 0.0} / 5 from {summary.ratingCount} rating
      {summary.ratingCount !== 1 ? "s" : ""}
    </p>
  )
}
