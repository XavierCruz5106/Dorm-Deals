"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"

export function BuyNowButton({ itemId }: { itemId: string }) {
  const [isLoading, setIsLoading] = useState(false)

  async function handleBuyNow() {
    try {
      setIsLoading(true)
      const response = await fetch("/api/checkout/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId }),
      })

      const data = (await response.json()) as {
        success?: boolean
        redirectUrl?: string
        error?: string
      }

      if (!response.ok) {
        toast.error(data.error || "Failed to complete purchase.")
        return
      }

      if (!data.success || !data.redirectUrl) {
        toast.error("Purchase response was incomplete.")
        return
      }

      toast.success("Purchase complete")
      window.location.href = data.redirectUrl
    } catch (error) {
      console.error("Buy now error:", error)
      toast.error("Could not complete purchase.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button size="lg" className="w-full" onClick={handleBuyNow} disabled={isLoading}>
      {isLoading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Processing...
        </>
      ) : (
        "Buy Now"
      )}
    </Button>
  )
}
