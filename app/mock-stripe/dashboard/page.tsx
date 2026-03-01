import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { supabase } from "@/lib/supabase"

type PurchaseRow = {
  id: string
  amount_total_cents: number | null
  currency: string | null
  created_at: string
  item_id: string
}

export default async function MockStripeDashboardPage() {
  const { userId } = await auth()
  if (!userId) {
    redirect("/sign-in")
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("stripe_account_id")
    .eq("user_id", userId)
    .single()

  const { data: payoutsData, error: payoutsError } = await supabase
    .from("purchases")
    .select("id,amount_total_cents,currency,created_at,item_id")
    .eq("seller_user_id", userId)
    .order("created_at", { ascending: false })
    .limit(20)

  const payouts: PurchaseRow[] =
    payoutsError && (payoutsError as { code?: string }).code === "PGRST205"
      ? []
      : ((payoutsData as PurchaseRow[]) ?? [])

  const totalCents = payouts.reduce((sum, row) => sum + Number(row.amount_total_cents || 0), 0)

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-950 px-4 py-10 text-slate-100">
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="rounded-2xl border border-slate-700 bg-slate-900/70 p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300">
            Stripe Simulator
          </p>
          <h1 className="mt-2 text-3xl font-bold">Payments Dashboard</h1>
          <p className="mt-2 text-sm text-slate-400">
            Demo-only dashboard for simulated checkout payouts.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-slate-700 bg-slate-900/70 p-4">
            <p className="text-xs text-slate-400">Connected account</p>
            <p className="mt-1 truncate text-sm font-semibold">
              {profile?.stripe_account_id || "Not connected"}
            </p>
          </div>
          <div className="rounded-xl border border-slate-700 bg-slate-900/70 p-4">
            <p className="text-xs text-slate-400">Payments received</p>
            <p className="mt-1 text-xl font-semibold">{payouts.length}</p>
          </div>
          <div className="rounded-xl border border-slate-700 bg-slate-900/70 p-4">
            <p className="text-xs text-slate-400">Gross volume</p>
            <p className="mt-1 text-xl font-semibold">${(totalCents / 100).toFixed(2)}</p>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-700 bg-slate-900/70 p-5">
          <h2 className="mb-4 text-lg font-semibold">Recent payments</h2>
          {payouts.length === 0 ? (
            <p className="text-sm text-slate-400">No payments yet.</p>
          ) : (
            <div className="space-y-3">
              {payouts.map((row) => (
                <div
                  key={row.id}
                  className="flex items-center justify-between rounded-lg border border-slate-700 px-4 py-3"
                >
                  <div>
                    <p className="text-sm font-medium">Item {row.item_id}</p>
                    <p className="text-xs text-slate-400">
                      {new Date(row.created_at).toLocaleString("en-US")}
                    </p>
                  </div>
                  <p className="font-semibold">
                    ${((row.amount_total_cents || 0) / 100).toFixed(2)}{" "}
                    {(row.currency || "usd").toUpperCase()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
