import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { getUserItems } from "@/app/actions"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { MyListingsGrid } from "@/components/my-listings-grid"

export default async function MyListingsPage() {
  const { userId } = await auth()

  if (!userId) {
    redirect("/")
  }

  const items = await getUserItems()

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 lg:px-8">
      <div className="mb-8 flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">My Listings</h1>
          <p className="mt-1 text-muted-foreground">
            {items.length} listing{items.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Button asChild>
          <Link href="/sell" className="gap-1.5">
            <Plus className="h-4 w-4" />
            New Listing
          </Link>
        </Button>
      </div>

      <MyListingsGrid items={items} />
    </div>
  )
}
