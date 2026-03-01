import { auth } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

function digitsOnly(value: string) {
  return value.replace(/\D/g, "")
}

function isLikelyFutureMonth(exp: string) {
  const cleaned = exp.trim()
  const [monthRaw, yearRaw] = cleaned.split("/")
  if (!monthRaw || !yearRaw) {
    return false
  }

  const month = Number(monthRaw)
  const year = Number(yearRaw.length === 2 ? `20${yearRaw}` : yearRaw)
  if (!Number.isInteger(month) || !Number.isInteger(year) || month < 1 || month > 12) {
    return false
  }

  const now = new Date()
  const currentMonth = now.getMonth() + 1
  const currentYear = now.getFullYear()

  return year > currentYear || (year === currentYear && month >= currentMonth)
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: "You must be signed in to purchase." }, { status: 401 })
    }

    const body = (await req.json()) as {
      itemId?: string
      cardNumber?: string
      cardName?: string
      exp?: string
      cvc?: string
    }

    const itemId = String(body.itemId || "")
    const cardNumber = digitsOnly(String(body.cardNumber || ""))
    const cardName = String(body.cardName || "").trim()
    const exp = String(body.exp || "").trim()
    const cvc = digitsOnly(String(body.cvc || ""))

    if (!itemId) {
      return NextResponse.json({ error: "Missing item." }, { status: 400 })
    }

    if (cardNumber.length < 16 || cardName.length < 2 || cvc.length < 3 || !isLikelyFutureMonth(exp)) {
      return NextResponse.json(
        { error: "Payment failed. Check card details and try again." },
        { status: 400 },
      )
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
    const paymentIntentId = `mock_pi_${crypto.randomUUID()}`

    const { error: purchaseError } = await supabase.from("purchases").upsert(
      {
        item_id: item.id,
        seller_user_id: item.user_id,
        buyer_user_id: userId,
        amount_total_cents: Math.round(Number(item.price) * 100),
        currency: "usd",
        stripe_checkout_session_id: purchaseId,
        stripe_payment_intent_id: paymentIntentId,
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
