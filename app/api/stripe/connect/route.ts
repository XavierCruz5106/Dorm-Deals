import { auth } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

function getAppUrl() {
  return process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
}

export async function POST() {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: "You must be signed in." }, { status: 401 })
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("stripe_account_id")
      .eq("user_id", userId)
      .single()

    if (profileError && (profileError as { code?: string }).code === "PGRST205") {
      return NextResponse.json(
        { error: "Profiles table is missing. Run DB migrations first." },
        { status: 400 },
      )
    }

    let stripeAccountId = profile?.stripe_account_id || null
    if (!stripeAccountId) {
      stripeAccountId = `acct_mock_${crypto.randomUUID().replaceAll("-", "").slice(0, 16)}`
      const { error: updateError } = await supabase
        .from("profiles")
        .upsert({ user_id: userId, stripe_account_id: stripeAccountId }, { onConflict: "user_id" })

      if (updateError) {
        console.error("Error saving mock stripe account id:", updateError)
        return NextResponse.json({ error: "Failed to connect payments." }, { status: 500 })
      }
    }

    return NextResponse.json({ url: `${getAppUrl()}/profile?stripe=connected&mock=1` })
  } catch (error) {
    console.error("Error connecting simulated Stripe:", error)
    return NextResponse.json({ error: "Failed to start mock onboarding." }, { status: 500 })
  }
}
