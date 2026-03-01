import { auth } from "@clerk/nextjs/server"
import Link from "next/link"
import {
  getProfileByUserId,
  getUserPublicItems,
} from "@/app/actions"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ItemCard } from "@/components/item-card"
import { ProfileRatingsPanel } from "@/components/profile-ratings-panel"

export default async function ProfileViewPage({
  params,
}: {
  params: Promise<{ userId: string }>
}) {
  const { userId: profileUserId } = await params
  const profile = await getProfileByUserId(profileUserId)
  const listings = await getUserPublicItems(profileUserId)
  const fallbackProfile = profile || {
    display_name: listings[0]?.user_name || "Anonymous",
    major: null,
    year: null,
    bio: null,
    housing_preferences: null,
  }

  const { userId } = await auth()
  const isOwner = userId === profileUserId

  const initials = (fallbackProfile.display_name || "?")
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
                {fallbackProfile.display_name || "Anonymous"}
              </h1>
              <div className="flex flex-wrap gap-2">
                {fallbackProfile.major && <Badge variant="secondary">{fallbackProfile.major}</Badge>}
                {fallbackProfile.year && <Badge variant="outline">{fallbackProfile.year}</Badge>}
              </div>
              {fallbackProfile.bio && <p className="text-sm text-muted-foreground">{fallbackProfile.bio}</p>}
              {fallbackProfile.housing_preferences && (
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">Housing preferences:</span>{" "}
                  {fallbackProfile.housing_preferences}
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

      <ProfileRatingsPanel userId={profileUserId} />
    </div>
  )
}
