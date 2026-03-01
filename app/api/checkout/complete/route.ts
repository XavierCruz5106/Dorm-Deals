import { auth } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"
import { supabaseServer as supabase } from "@/lib/supabase-server"

export async function POST(req: Request) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: "You must be signed in to purchase." }, { status: 401 })
    }

    const body = (await req.json()) as { itemId?: string }
    const itemId = String(body.itemId || "")

    if (!itemId) {
      return NextResponse.json({ error: "Missing item." }, { status: 400 })
    }

    const { data: item, error: itemError } = await supabase
      .from("items")
      .select("id,title,price,user_id,is_sold")
      .eq("id", itemId)
      .single()

    if (itemError || !item) {
      return NextResponse.json({ error: "Item not found." }, { status: 404 })
    }

    if (item.user_id === userId) {
      return NextResponse.json({ error: "You cannot buy your own listing." }, { status: 400 })
    }

    if (item.is_sold) {
      return NextResponse.json({ error: "Item has already been sold." }, { status: 400 })
    }

    const { error: updateError } = await supabase
      .from("items")
      .update({ is_sold: true, updated_at: new Date().toISOString() })
      .eq("id", itemId)
      .eq("is_sold", false)

    if (updateError) {
      console.error("Error marking item sold:", updateError)
      return NextResponse.json({ error: "Could not complete purchase." }, { status: 500 })
    }

    const purchaseId = `mock_checkout_${crypto.randomUUID()}`

    const { error: purchaseError } = await supabase.from("purchases").upsert(
      {
        item_id: item.id,
        seller_user_id: item.user_id,
        buyer_user_id: userId,
        amount_total_cents: Math.round(Number(item.price) * 100),
        currency: "usd",
        stripe_checkout_session_id: purchaseId,
        stripe_payment_intent_id: null,
      },
      { onConflict: "stripe_checkout_session_id" },
    )

    if (purchaseError && (purchaseError as { code?: string }).code !== "PGRST205") {
      console.error("Error recording simulated purchase:", purchaseError)
    }

    return NextResponse.json({
      success: true,
      redirectUrl: `/items/${item.id}?payment=success`,
      receiptId: purchaseId,
    })
  } catch (error) {
    console.error("Error completing simulated checkout:", error)
    return NextResponse.json({ error: "Could not process payment." }, { status: 500 })
  }
}
