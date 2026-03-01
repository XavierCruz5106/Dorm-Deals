"use client"

import { useAuth } from "@clerk/nextjs"
import { useEffect } from "react"
import { writeFavoriteIds } from "@/lib/favorites"

export function FavoritesSync() {
  const { isLoaded, isSignedIn, userId } = useAuth()

  useEffect(() => {
    if (!isLoaded) {
      return
    }

    if (!isSignedIn || !userId) {
      writeFavoriteIds(new Set<string>(), null)
      return
    }

    return
  }, [isLoaded, isSignedIn, userId])

  return null
}
