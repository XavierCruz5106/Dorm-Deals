import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { SellForm } from "@/components/sell-form"

export default async function SellPage() {
  const { userId } = await auth()

  if (!userId) {
    redirect("/")
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Create a Listing</h1>
        <p className="mt-1 text-muted-foreground">
          Fill out the details below to sell your item to fellow Blue Hens.
        </p>
      </div>
      <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <SellForm />
      </div>
    </div>
  )
}
