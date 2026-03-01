import { auth } from "@clerk/nextjs/server"
import Link from "next/link"
import { notFound } from "next/navigation"
import {
  getProfileByUserId,
  getRatingSummaryForUser,
  getRatingsForUser,
  getUserPublicItems,
} from "@/app/actions"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ItemCard } from "@/components/item-card"

export default async function ProfileViewPage({
  params,
}: {
  params: Promise<{ userId: string }>
}) {
  const { userId: profileUserId } = await params
  const profile = await getProfileByUserId(profileUserId)
  if (!profile) {
    notFound()
  }

  const { userId } = await auth()
  const isOwner = userId === profileUserId
  const summary = await getRatingSummaryForUser(profileUserId)
  const ratings = await getRatingsForUser(profileUserId)
  const listings = await getUserPublicItems(profileUserId)

  const initials = (profile.display_name || "?")
    .split(" ")
    .map((part) => part[0] || "")
    .join("")
    .slice(0, 2)
    .toUpperCase()

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 lg:px-8">
      <div className="mb-8 rounded-2xl border border-border bg-card p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-4">
            <Avatar className="h-14 w-14">
              <AvatarFallback className="bg-primary text-primary-foreground">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-foreground">
                {profile.display_name || "Anonymous"}
              </h1>
              <div className="flex flex-wrap gap-2">
                {profile.major && <Badge variant="secondary">{profile.major}</Badge>}
                {profile.year && <Badge variant="outline">{profile.year}</Badge>}
                <Badge variant="outline">{summary.avgRating || 0.0} / 5</Badge>
                <Badge variant="outline">{summary.ratingCount} ratings</Badge>
              </div>
              {profile.bio && <p className="text-sm text-muted-foreground">{profile.bio}</p>}
              {profile.housing_preferences && (
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">Housing preferences:</span>{" "}
                  {profile.housing_preferences}
                </p>
              )}
            </div>
          </div>

          {isOwner && (
            <Button asChild>
              <Link href="/profile">Edit Profile</Link>
            </Button>
          )}
        </div>
      </div>

      <section className="mb-10">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-foreground">Listings</h2>
          <p className="text-sm text-muted-foreground">{listings.length} total</p>
        </div>
        {listings.length === 0 ? (
          <div className="rounded-xl border border-border bg-card p-6 text-sm text-muted-foreground">
            No listings yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {listings.map((item) => (
              <ItemCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </section>

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
    </div>
  )
}
