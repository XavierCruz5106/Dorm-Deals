import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import {
  getMyGivenRatings,
  getRatingsForUser,
  getRatingSummaryForUser,
} from "@/app/actions"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

export default async function RatingsPage() {
  const { userId } = await auth()
  if (!userId) {
    redirect("/")
  }

  const [received, given, summary] = await Promise.all([
    getRatingsForUser(userId),
    getMyGivenRatings(),
    getRatingSummaryForUser(userId),
  ])

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 lg:px-8">
      <div className="mb-8 flex items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-foreground">My Ratings</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Track your reputation as a buyer and seller.
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link href={`/profiles/${userId}`}>View Public Profile</Link>
        </Button>
      </div>

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
                  <p className="font-medium text-foreground">
                    {rating.reviewer_name || "Anonymous"}
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
                  <p className="font-medium text-foreground">Item ID: {rating.item_id}</p>
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
    </div>
  )
}
