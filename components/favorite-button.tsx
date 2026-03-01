"use client"

import { type MouseEvent, useEffect, useState } from "react"
import { Heart } from "lucide-react"
import { useAuth } from "@clerk/nextjs"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  FAVORITES_UPDATED_EVENT,
  readFavoriteIds,
  toggleFavoriteId,
} from "@/lib/favorites"

export function FavoriteButton({
  itemId,
  className,
  showLabel = false,
}: {
  itemId: string
  className?: string
  showLabel?: boolean
}) {
  const [isFavorite, setIsFavorite] = useState(false)
  const { isSignedIn, userId } = useAuth()

  useEffect(() => {
    function syncFavorite() {
      const favorites = isSignedIn ? readFavoriteIds(userId) : new Set<string>()
      setIsFavorite(favorites.has(itemId))
    }

    syncFavorite()
    window.addEventListener(FAVORITES_UPDATED_EVENT, syncFavorite)
    window.addEventListener("storage", syncFavorite)

    return () => {
      window.removeEventListener(FAVORITES_UPDATED_EVENT, syncFavorite)
      window.removeEventListener("storage", syncFavorite)
    }
  }, [itemId, isSignedIn, userId])

  function toggleFavorite(e?: MouseEvent) {
    e?.preventDefault()
    e?.stopPropagation()

    if (!isSignedIn || !userId) {
      toast.info("Sign in to save favorites to your account.")
      return
    }

    const favorites = toggleFavoriteId(itemId, userId)
    const nextFavoriteState = favorites.has(itemId)
    setIsFavorite(nextFavoriteState)
  }

  return (
    <Button
      type="button"
      size={showLabel ? "sm" : "icon"}
      variant="secondary"
      onClick={toggleFavorite}
      aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
      className={cn("gap-1.5", className)}
    >
      <Heart className={cn("h-4 w-4", isFavorite ? "fill-red-500 text-red-500" : "text-foreground")} />
      {showLabel ? <span>{isFavorite ? "Favorited" : "Favorite"}</span> : null}
    </Button>
  )
}
