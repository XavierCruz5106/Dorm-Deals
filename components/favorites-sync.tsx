"use client"

import { useAuth } from "@clerk/nextjs"
import { useEffect } from "react"
import { fetchDbFavoriteIds, readFavoriteIds, writeFavoriteIds } from "@/lib/favorites"

export function FavoritesSync() {
  const { isLoaded, isSignedIn } = useAuth()

  useEffect(() => {
    if (!isLoaded || !isSignedIn) {
      return
    }

    let cancelled = false

    async function syncFromDb() {
      try {
        const dbFavorites = await fetchDbFavoriteIds()
        if (!cancelled) {
          writeFavoriteIds(dbFavorites)
        }
      } catch {
        // no-op: fallback local favorites remain available
      }
    }

    async function syncToDbFromLocal() {
      try {
        const localFavorites = Array.from(readFavoriteIds())
        for (const itemId of localFavorites) {
          await fetch("/api/favorites", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ itemId }),
          })
        }
      } catch {
        // no-op
      }
    }

    syncToDbFromLocal().then(syncFromDb)

    return () => {
      cancelled = true
    }
  }, [isLoaded, isSignedIn])

  return null
}
