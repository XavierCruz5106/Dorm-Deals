import { auth } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

function isMissingFavoritesTable(error: unknown) {
  return Boolean(
    error &&
      typeof error === "object" &&
      "code" in error &&
      (error as { code?: string }).code === "PGRST205",
  )
}

export async function GET() {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ itemIds: [] as string[] })
  }

  const { data, error } = await supabase
    .from("favorites")
    .select("item_id")
    .eq("user_id", userId)

  if (error) {
    if (isMissingFavoritesTable(error)) {
      return NextResponse.json({ itemIds: [] as string[] })
    }

    console.error("Error fetching favorites:", error)
    return NextResponse.json({ error: "Failed to fetch favorites." }, { status: 500 })
  }

  const itemIds = ((data as Array<{ item_id: string }>) ?? []).map((row) => row.item_id)
  return NextResponse.json({ itemIds })
}

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: "You must be signed in." }, { status: 401 })
  }

  const body = (await req.json().catch(() => null)) as { itemId?: string } | null
  const itemId = String(body?.itemId || "")
  if (!itemId) {
    return NextResponse.json({ error: "Missing item id." }, { status: 400 })
  }

  const { data: item, error: itemError } = await supabase
    .from("items")
    .select("id")
    .eq("id", itemId)
    .single()

  if (itemError || !item) {
    return NextResponse.json({ error: "Item not found." }, { status: 404 })
  }

  const { error } = await supabase.from("favorites").upsert(
    {
      user_id: userId,
      item_id: itemId,
    },
    { onConflict: "user_id,item_id" },
  )

  if (error) {
    if (isMissingFavoritesTable(error)) {
      return NextResponse.json(
        { error: "Favorites table missing. Run DB migration 004 first." },
        { status: 400 },
      )
    }

    console.error("Error creating favorite:", error)
    return NextResponse.json({ error: "Failed to save favorite." }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}

export async function DELETE(req: Request) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: "You must be signed in." }, { status: 401 })
  }

  const url = new URL(req.url)
  const itemId = url.searchParams.get("itemId")?.trim() || ""
  if (!itemId) {
    return NextResponse.json({ error: "Missing item id." }, { status: 400 })
  }

  const { error } = await supabase
    .from("favorites")
    .delete()
    .eq("user_id", userId)
    .eq("item_id", itemId)

  if (error) {
    if (isMissingFavoritesTable(error)) {
      return NextResponse.json(
        { error: "Favorites table missing. Run DB migration 004 first." },
        { status: 400 },
      )
    }

    console.error("Error deleting favorite:", error)
    return NextResponse.json({ error: "Failed to remove favorite." }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
