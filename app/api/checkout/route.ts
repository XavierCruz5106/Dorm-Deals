import { auth } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

function getAppUrl() {
  return process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: "You must be signed in to purchase." }, { status: 401 })
    }

    const body = await req.json()
    const itemId = String(body?.itemId || "")

    if (!itemId) {
      return NextResponse.json({ error: "Missing item." }, { status: 400 })
    }

    const { data: item, error: itemError } = await supabase
      .from("items")
      .select("id,user_id,is_sold")
      .eq("id", itemId)
      .single()

    if (itemError || !item) {
      return NextResponse.json({ error: "Item not found." }, { status: 404 })
    }

    if (item.user_id === userId) {
      return NextResponse.json({ error: "You cannot buy your own listing." }, { status: 400 })
    }

    if (item.is_sold) {
      return NextResponse.json({ error: "This item is already sold." }, { status: 400 })
    }

    const { data: sellerProfile } = await supabase
      .from("profiles")
      .select("stripe_account_id")
      .eq("user_id", item.user_id)
      .single()

    if (!sellerProfile?.stripe_account_id) {
      return NextResponse.json(
        { error: "Seller has not connected payments yet. Try again later." },
        { status: 400 },
      )
    }

    const appUrl = getAppUrl()
    return NextResponse.json({
      url: `${appUrl}/checkout/simulated?itemId=${encodeURIComponent(item.id)}`,
    })
  } catch (error) {
    console.error("Error creating simulated checkout session:", error)
    return NextResponse.json({ error: "Failed to start checkout." }, { status: 500 })
  }
}
