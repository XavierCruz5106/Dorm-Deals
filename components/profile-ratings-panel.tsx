"use client"

import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import {
  type LocalRating,
  getRatingSummaryForUser,
  getRatingsForUser,
  RATINGS_UPDATED_EVENT,
} from "@/lib/local-ratings"

export function ProfileRatingsPanel({ userId }: { userId: string }) {
  const [summary, setSummary] = useState({ avgRating: 0, ratingCount: 0 })
  const [ratings, setRatings] = useState<LocalRating[]>([])

  useEffect(() => {
    function sync() {
      setSummary(getRatingSummaryForUser(userId))
      setRatings(getRatingsForUser(userId))
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
    <>
      <div className="flex flex-wrap gap-2">
        <Badge variant="outline">{summary.avgRating || 0.0} / 5</Badge>
        <Badge variant="outline">{summary.ratingCount} ratings</Badge>
      </div>

      <section>
        <h2 className="mb-4 text-xl font-semibold text-foreground">Recent Ratings</h2>
        {ratings.length === 0 ? (
          <div className="rounded-xl border border-border bg-card p-6 text-sm text-muted-foreground">
            No ratings yet.
          </div>
        ) : (
          <div className="space-y-3">
            {ratings.slice(0, 10).map((rating) => (
              <div key={rating.id} className="rounded-xl border border-border bg-card p-4">
                <div className="mb-2 flex items-center justify-between">
                  <p className="font-medium text-foreground">
                    {rating.reviewerName || "Anonymous"}
                  </p>
                  <p className="text-sm font-semibold text-foreground">{rating.rating} / 5</p>
                </div>
                {rating.comment && <p className="text-sm text-muted-foreground">{rating.comment}</p>}
                {rating.tags?.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {rating.tags.map((tag) => (
                      <Badge key={`${rating.id}-${tag}`} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </>
  )
}
