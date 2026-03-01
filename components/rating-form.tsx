"use client"

import { useEffect, useState } from "react"
import { useAuth, useUser } from "@clerk/nextjs"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Star } from "lucide-react"
import { toast } from "sonner"
import { getMyRatingForItem, upsertLocalRating } from "@/lib/local-ratings"

type Props = {
  itemId: string
  sellerName: string
  sellerUserId: string
}

export function RatingForm({ itemId, sellerName, sellerUserId }: Props) {
  const { isSignedIn, userId } = useAuth()
  const { user } = useUser()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [alreadyRated, setAlreadyRated] = useState(false)
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState("")
  const [tags, setTags] = useState("")

  useEffect(() => {
    if (!userId) {
      setAlreadyRated(false)
      return
    }

    const existing = getMyRatingForItem(itemId, userId)
    setAlreadyRated(Boolean(existing))
  }, [itemId, userId])

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    if (!isSignedIn || !userId) {
      toast.info("Sign in to leave a rating.")
      return
    }

    if (sellerUserId === userId) {
      toast.info("You cannot rate your own listing.")
      return
    }

    if (alreadyRated) {
      toast.info("You already rated this listing.")
      return
    }

    if (rating < 1 || rating > 5) {
      toast.error("Please choose a rating from 1 to 5 stars.")
      return
    }

    setIsSubmitting(true)
    const reviewerName =
      (user?.firstName && user?.lastName
        ? `${user.firstName} ${user.lastName}`
        : user?.firstName || user?.username) || "Anonymous"

    const parsedTags = tags
      ? tags
          .split(",")
          .map((value) => value.trim())
          .filter(Boolean)
      : []

    upsertLocalRating({
      itemId,
      reviewerUserId: userId,
      revieweeUserId: sellerUserId,
      reviewerName,
      rating,
      comment: comment || null,
      tags: parsedTags,
    })

    toast.success("Rating submitted")
    setAlreadyRated(true)
    setComment("")
    setTags("")
    setRating(0)
    setIsSubmitting(false)
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 rounded-xl border border-border bg-card p-4">
      <div className="space-y-1">
        <h3 className="font-semibold text-foreground">Rate {sellerName}</h3>
        <p className="text-sm text-muted-foreground">
          Share your experience to help other students buy safely.
        </p>
      </div>

      <div className="flex items-center gap-2">
        {[1, 2, 3, 4, 5].map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => setRating(value)}
            className="rounded p-1"
            aria-label={`Rate ${value} stars`}
          >
            <Star
              className={`h-6 w-6 ${value <= rating ? "fill-accent text-accent" : "text-muted-foreground"}`}
            />
          </button>
        ))}
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground" htmlFor="rating_comment">
          Review
        </label>
        <Textarea
          id="rating_comment"
          placeholder="What went well? Was the listing accurate?"
          rows={3}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground" htmlFor="rating_tags">
          Tags (comma separated)
        </label>
        <Input
          id="rating_tags"
          placeholder="Responsive, On time, Accurate listing"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
        />
      </div>

      <Button type="submit" disabled={isSubmitting || alreadyRated || rating < 1}>
        {alreadyRated ? "Already Rated" : isSubmitting ? "Submitting..." : "Submit Rating"}
      </Button>
    </form>
  )
}
