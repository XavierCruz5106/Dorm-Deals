"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { createRating } from "@/app/actions"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Star } from "lucide-react"
import { toast } from "sonner"

type Props = {
  itemId: string
  sellerName: string
  alreadyRated: boolean
}

export function RatingForm({ itemId, sellerName, alreadyRated }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState("")
  const [tags, setTags] = useState("")

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    if (alreadyRated) {
      toast.info("You already rated this listing.")
      return
    }

    const formData = new FormData()
    formData.set("item_id", itemId)
    formData.set("rating", String(rating))
    formData.set("comment", comment)
    formData.set("tags", tags)

    startTransition(async () => {
      const result = await createRating(formData)
      if (result.error) {
        toast.error(result.error)
        return
      }

      toast.success("Rating submitted")
      setComment("")
      setTags("")
      setRating(0)
      router.refresh()
    })
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

      <Button type="submit" disabled={isPending || alreadyRated || rating < 1}>
        {alreadyRated ? "Already Rated" : isPending ? "Submitting..." : "Submit Rating"}
      </Button>
    </form>
  )
}
