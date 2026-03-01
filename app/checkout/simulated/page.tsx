import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { SimulatedCheckoutForm } from "@/components/simulated-checkout-form"

export default async function SimulatedCheckoutPage({
  searchParams,
}: {
  searchParams: Promise<{ itemId?: string }>
}) {
  const { userId } = await auth()
  if (!userId) {
    redirect("/sign-in")
  }

  const params = await searchParams
  const itemId = params.itemId
  if (!itemId) {
    redirect("/")
  }

  const { data: item } = await supabase
    .from("items")
    .select("id,title,price,user_id,is_sold")
    .eq("id", itemId)
    .single()

  if (!item || item.is_sold || item.user_id === userId) {
    redirect(item ? `/items/${item.id}` : "/")
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-b from-slate-950 to-slate-900 px-4 py-12 text-slate-100">
      <div className="mx-auto max-w-xl rounded-2xl border border-slate-700 bg-slate-950/80 p-6 shadow-2xl">
        <div className="mb-6">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-300">
            Simulated Stripe Checkout
          </p>
          <h1 className="mt-2 text-2xl font-bold">Complete purchase</h1>
          <p className="mt-2 text-sm text-slate-400">
            This is a fully local payment simulator for demo use.
          </p>
        </div>

        <div className="mb-6 rounded-lg border border-slate-700 bg-slate-900/70 p-4">
          <p className="text-sm text-slate-400">Item</p>
          <p className="font-medium">{item.title}</p>
          <p className="mt-3 text-sm text-slate-400">Total</p>
          <p className="text-2xl font-semibold">${Number(item.price).toFixed(2)}</p>
        </div>

        <SimulatedCheckoutForm itemId={item.id} />
      </div>
    </div>
  )
}
