"use client"

import { type MouseEvent, useEffect, useState } from "react"
import { Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { FAVORITES_UPDATED_EVENT, readFavoriteIds, toggleFavoriteId } from "@/lib/favorites"

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

  useEffect(() => {
    function syncFavorite() {
      const favorites = readFavoriteIds()
      setIsFavorite(favorites.has(itemId))
    }

    syncFavorite()
    window.addEventListener(FAVORITES_UPDATED_EVENT, syncFavorite)
    window.addEventListener("storage", syncFavorite)

    return () => {
      window.removeEventListener(FAVORITES_UPDATED_EVENT, syncFavorite)
      window.removeEventListener("storage", syncFavorite)
    }
  }, [itemId])

  function toggleFavorite(e?: MouseEvent) {
    e?.preventDefault()
    e?.stopPropagation()

    const favorites = toggleFavoriteId(itemId)
    setIsFavorite(favorites.has(itemId))
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
