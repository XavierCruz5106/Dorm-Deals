import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ProfileEditForm } from "@/components/profile-edit-form"
import { StripeConnectButtons } from "@/components/stripe-connect-buttons"
import {
  getOrCreateMyProfile,
  getRatingSummaryForUser,
  getUserPublicItems,
} from "@/app/actions"

export default async function EditProfilePage() {
  const { userId } = await auth()
  if (!userId) {
    redirect("/")
  }

  const profile = await getOrCreateMyProfile()
  const summary = await getRatingSummaryForUser(userId)
  const items = await getUserPublicItems(userId)

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 lg:px-8">
      <div className="mb-6 flex items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Edit Profile</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Keep your public student profile up to date.
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link href={`/profiles/${userId}`}>View Public Profile</Link>
        </Button>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground">Avg rating</p>
          <p className="text-xl font-semibold text-foreground">{summary.avgRating || "0.0"}</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground">Ratings</p>
          <p className="text-xl font-semibold text-foreground">{summary.ratingCount}</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground">Listings</p>
          <p className="text-xl font-semibold text-foreground">{items.length}</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground">Member ID</p>
          <p className="truncate text-sm font-semibold text-foreground">{userId}</p>
        </div>
      </div>

      <div className="mb-6 rounded-xl border border-border bg-card p-5">
        <h2 className="text-lg font-semibold text-foreground">Payments</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Connect the simulated Stripe system to receive demo payouts from purchases.
        </p>
        <p className="mt-3 text-sm text-foreground">
          Status: {profile?.stripe_account_id ? "Connected (Simulated)" : "Not connected"}
        </p>
        <div className="mt-4">
          <StripeConnectButtons isConnected={Boolean(profile?.stripe_account_id)} />
        </div>
      </div>

      <ProfileEditForm profile={profile} />
    </div>
  )
}
