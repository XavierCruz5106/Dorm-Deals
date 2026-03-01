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

    const { data: profile, error } = await supabase
      .from("profiles")
      .select("stripe_account_id")
      .eq("user_id", userId)
      .single()

    if (error && (error as { code?: string }).code === "PGRST205") {
      return NextResponse.json(
        { error: "Profiles table is missing. Run DB migrations first." },
        { status: 400 },
      )
    }

    if (!profile?.stripe_account_id) {
      return NextResponse.json({ error: "No payment account connected yet." }, { status: 400 })
    }

    return NextResponse.json({ url: `${getAppUrl()}/mock-stripe/dashboard` })
  } catch (error) {
    console.error("Error opening simulated Stripe dashboard:", error)
    return NextResponse.json({ error: "Failed to open payments dashboard." }, { status: 500 })
  }
}
