"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"

function formatCardNumber(value: string) {
  return value
    .replace(/\D/g, "")
    .slice(0, 16)
    .replace(/(\d{4})(?=\d)/g, "$1 ")
}

function formatExpiry(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 4)
  if (digits.length < 3) {
    return digits
  }
  return `${digits.slice(0, 2)}/${digits.slice(2)}`
}

export function SimulatedCheckoutForm({ itemId }: { itemId: string }) {
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)
  const [cardNumber, setCardNumber] = useState("4242 4242 4242 4242")
  const [cardName, setCardName] = useState("Test Student")
  const [exp, setExp] = useState("12/30")
  const [cvc, setCvc] = useState("123")

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    try {
      setSubmitting(true)
      const response = await fetch("/api/checkout/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId, cardNumber, cardName, exp, cvc }),
      })

      const data = (await response.json()) as {
        success?: boolean
        error?: string
        redirectUrl?: string
      }

      if (!response.ok || !data.success || !data.redirectUrl) {
        toast.error(data.error || "Payment failed.")
        return
      }

      toast.success("Payment completed")
      router.push(data.redirectUrl)
      router.refresh()
    } catch (error) {
      console.error("Simulated checkout error:", error)
      toast.error("Could not process payment.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <label className="text-xs uppercase tracking-wide text-slate-300" htmlFor="card_number">
          Card number
        </label>
        <Input
          id="card_number"
          value={cardNumber}
          onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
          className="border-slate-700 bg-slate-900 text-slate-100"
          inputMode="numeric"
        />
      </div>

      <div className="space-y-2">
        <label className="text-xs uppercase tracking-wide text-slate-300" htmlFor="card_name">
          Cardholder name
        </label>
        <Input
          id="card_name"
          value={cardName}
          onChange={(e) => setCardName(e.target.value)}
          className="border-slate-700 bg-slate-900 text-slate-100"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <label className="text-xs uppercase tracking-wide text-slate-300" htmlFor="card_exp">
            Expiry
          </label>
          <Input
            id="card_exp"
            value={exp}
            onChange={(e) => setExp(formatExpiry(e.target.value))}
            className="border-slate-700 bg-slate-900 text-slate-100"
            placeholder="MM/YY"
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs uppercase tracking-wide text-slate-300" htmlFor="card_cvc">
            CVC
          </label>
          <Input
            id="card_cvc"
            value={cvc}
            onChange={(e) => setCvc(e.target.value.replace(/\D/g, "").slice(0, 4))}
            className="border-slate-700 bg-slate-900 text-slate-100"
            inputMode="numeric"
          />
        </div>
      </div>

      <Button type="submit" className="mt-2 w-full bg-sky-500 text-black hover:bg-sky-400" disabled={submitting}>
        {submitting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : (
          <>
            <Lock className="h-4 w-4" />
            Pay now
          </>
        )}
      </Button>

      <p className="text-center text-xs text-slate-400">
        Demo mode: no real card charge will occur.
      </p>
    </form>
  )
}
