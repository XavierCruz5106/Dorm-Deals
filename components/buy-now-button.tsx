"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"

export function BuyNowButton({ itemId }: { itemId: string }) {
  const [isLoading, setIsLoading] = useState(false)

  async function handleCheckout() {
    try {
      setIsLoading(true)
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId }),
      })

      const data = (await response.json()) as { url?: string; error?: string }

      if (!response.ok) {
        toast.error(data.error || "Failed to start checkout.")
        return
      }

      if (!data.url) {
        toast.error("Checkout URL missing.")
        return
      }

      window.location.href = data.url
    } catch (error) {
      console.error("Checkout error:", error)
      toast.error("Could not open simulated checkout.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button size="lg" className="w-full" onClick={handleCheckout} disabled={isLoading}>
      {isLoading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Redirecting...
        </>
      ) : (
        "Buy Now"
      )}
    </Button>
  )
}
