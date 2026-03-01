import Link from "next/link"
import { getProfiles, getRatingSummaryForUser } from "@/app/actions"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"

export default async function ProfilesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const { q } = await searchParams
  const profiles = await getProfiles(q?.trim())

  const summaries = await Promise.all(
    profiles.map(async (profile) => ({
      userId: profile.user_id,
      summary: await getRatingSummaryForUser(profile.user_id),
    })),
  )

  const summaryMap = new Map(summaries.map((entry) => [entry.userId, entry.summary]))

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Student Profiles</h1>
        <p className="mt-1 text-muted-foreground">View sellers and their ratings before you buy.</p>
      </div>

      <form className="mb-6 flex items-center gap-2 rounded-lg border border-border bg-card p-3">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input
          name="q"
          defaultValue={q || ""}
          placeholder="Search by name, major, or bio"
          className="border-0 shadow-none focus-visible:ring-0"
        />
      </form>

      {profiles.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-8 text-center">
          <h2 className="text-lg font-semibold text-foreground">No profiles found</h2>
          <p className="mt-1 text-sm text-muted-foreground">Try a different search term.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {profiles.map((profile) => {
            const summary = summaryMap.get(profile.user_id)
            const initials = (profile.display_name || "?")
              .split(" ")
              .map((part) => part[0] || "")
              .join("")
              .slice(0, 2)
              .toUpperCase()

            return (
              <Link
                key={profile.user_id}
                href={`/profiles/${profile.user_id}`}
                className="rounded-xl border border-border bg-card p-5 transition hover:border-primary/40 hover:shadow-md"
              >
                <div className="mb-3 flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h2 className="font-semibold text-foreground">
                      {profile.display_name || "Anonymous"}
                    </h2>
                    <p className="text-xs text-muted-foreground">{profile.major || "UD Student"}</p>
                  </div>
                </div>

                {profile.bio && (
                  <p className="line-clamp-2 text-sm text-muted-foreground">{profile.bio}</p>
                )}

                <div className="mt-3 flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{summary?.ratingCount || 0} ratings</span>
                  <span className="font-semibold text-foreground">{summary?.avgRating || 0.0} / 5</span>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
