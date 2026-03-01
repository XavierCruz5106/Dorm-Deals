import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { MyRatingsLocal } from "@/components/my-ratings-local"

export default async function RatingsPage() {
  const { userId } = await auth()
  if (!userId) {
    redirect("/")
  }

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

      <MyRatingsLocal />
    </div>
  )
}
