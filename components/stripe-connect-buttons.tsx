"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"

type Props = {
  isConnected: boolean
}

export function StripeConnectButtons({ isConnected }: Props) {
  const [connecting, setConnecting] = useState(false)
  const [openingDashboard, setOpeningDashboard] = useState(false)

  async function handleConnect() {
    try {
      setConnecting(true)
      const response = await fetch("/api/stripe/connect", { method: "POST" })
      const data = (await response.json()) as { url?: string; error?: string }

      if (!response.ok || !data.url) {
        toast.error(data.error || "Failed to start simulated onboarding.")
        return
      }

      window.location.href = data.url
    } catch (error) {
      console.error("Stripe connect error:", error)
      toast.error("Could not connect simulated payments right now.")
    } finally {
      setConnecting(false)
    }
  }

  async function handleDashboardLogin() {
    try {
      setOpeningDashboard(true)
      const response = await fetch("/api/stripe/login", { method: "POST" })
      const data = (await response.json()) as { url?: string; error?: string }

      if (!response.ok || !data.url) {
        toast.error(data.error || "Failed to open simulated dashboard.")
        return
      }

      window.location.href = data.url
    } catch (error) {
      console.error("Stripe dashboard error:", error)
      toast.error("Could not open simulated dashboard.")
    } finally {
      setOpeningDashboard(false)
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Button type="button" onClick={handleConnect} disabled={connecting}>
        {connecting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Connecting...
          </>
        ) : isConnected ? (
          "Update Payment Setup"
        ) : (
          "Connect Payments"
        )}
      </Button>
      {isConnected ? (
        <Button
          type="button"
          variant="outline"
          onClick={handleDashboardLogin}
          disabled={openingDashboard}
        >
          {openingDashboard ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Opening...
            </>
          ) : (
            "Open Payments Dashboard"
          )}
        </Button>
      ) : null}
    </div>
  )
}
