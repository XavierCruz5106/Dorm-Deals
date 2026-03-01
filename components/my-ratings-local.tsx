"use client"

import { useAuth } from "@clerk/nextjs"
import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import {
  type LocalRating,
  getGivenRatingsByUser,
  getRatingSummaryForUser,
  getRatingsForUser,
  RATINGS_UPDATED_EVENT,
} from "@/lib/local-ratings"

export function MyRatingsLocal() {
  const { userId } = useAuth()
  const [received, setReceived] = useState<LocalRating[]>([])
  const [given, setGiven] = useState<LocalRating[]>([])
  const [summary, setSummary] = useState({ avgRating: 0, ratingCount: 0 })

  useEffect(() => {
    function sync() {
      if (!userId) {
        setReceived([])
        setGiven([])
        setSummary({ avgRating: 0, ratingCount: 0 })
        return
      }

      const receivedRatings = getRatingsForUser(userId)
      const givenRatings = getGivenRatingsByUser(userId)
      setReceived(receivedRatings)
      setGiven(givenRatings)
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
    <>
      <div className="mb-8 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground">Average rating</p>
          <p className="text-xl font-semibold text-foreground">{summary.avgRating || "0.0"}</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground">Received ratings</p>
          <p className="text-xl font-semibold text-foreground">{received.length}</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground">Given ratings</p>
          <p className="text-xl font-semibold text-foreground">{given.length}</p>
        </div>
      </div>

      <section className="mb-10">
        <h2 className="mb-3 text-xl font-semibold text-foreground">Ratings You Received</h2>
        {received.length === 0 ? (
          <div className="rounded-xl border border-border bg-card p-6 text-sm text-muted-foreground">
            No ratings received yet.
          </div>
        ) : (
          <div className="space-y-3">
            {received.map((rating) => (
              <div key={rating.id} className="rounded-xl border border-border bg-card p-4">
                <div className="mb-2 flex items-center justify-between">
                  <p className="font-medium text-foreground">{rating.reviewerName || "Anonymous"}</p>
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

      <section>
        <h2 className="mb-3 text-xl font-semibold text-foreground">Ratings You Gave</h2>
        {given.length === 0 ? (
          <div className="rounded-xl border border-border bg-card p-6 text-sm text-muted-foreground">
            No ratings submitted yet.
          </div>
        ) : (
          <div className="space-y-3">
            {given.map((rating) => (
              <div key={rating.id} className="rounded-xl border border-border bg-card p-4">
                <div className="mb-2 flex items-center justify-between">
                  <p className="font-medium text-foreground">Item ID: {rating.itemId}</p>
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
