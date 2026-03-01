export const FAVORITES_STORAGE_KEY = "dorm_deals_favorites"
export const FAVORITES_UPDATED_EVENT = "dorm-deals:favorites-updated"

export function emitFavoritesUpdated() {
  if (typeof window === "undefined") {
    return
  }

  window.dispatchEvent(new CustomEvent(FAVORITES_UPDATED_EVENT))
}

function favoritesStorageKey(userId?: string | null) {
  return userId ? `${FAVORITES_STORAGE_KEY}:${userId}` : `${FAVORITES_STORAGE_KEY}:guest`
}

export function readFavoriteIds(userId?: string | null) {
  if (typeof window === "undefined") {
    return new Set<string>()
  }

  try {
    const raw = window.localStorage.getItem(favoritesStorageKey(userId))
    if (!raw) {
      return new Set<string>()
    }

    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) {
      return new Set<string>()
    }

    return new Set(parsed.map((value) => String(value)))
  } catch {
    return new Set<string>()
  }
}

export function writeFavoriteIds(values: Set<string>, userId?: string | null) {
  if (typeof window === "undefined") {
    return
  }

  window.localStorage.setItem(favoritesStorageKey(userId), JSON.stringify(Array.from(values)))
  emitFavoritesUpdated()
}

export function toggleFavoriteId(itemId: string, userId?: string | null) {
  const values = readFavoriteIds(userId)

  if (values.has(itemId)) {
    values.delete(itemId)
  } else {
    values.add(itemId)
  }

  writeFavoriteIds(values, userId)
  return values
}

export async function fetchDbFavoriteIds() {
  const response = await fetch("/api/favorites", {
    method: "GET",
    cache: "no-store",
  })

  if (!response.ok) {
    const data = (await response.json().catch(() => null)) as { error?: string } | null
    throw new Error(data?.error || "Failed to fetch favorites.")
  }

  const data = (await response.json()) as { itemIds?: string[] }
  return new Set((data.itemIds || []).map((itemId) => String(itemId)))
}

export async function addDbFavorite(itemId: string) {
  const response = await fetch("/api/favorites", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ itemId }),
  })

  if (!response.ok) {
    const data = (await response.json().catch(() => null)) as { error?: string } | null
    throw new Error(data?.error || "Failed to save favorite.")
  }
}

export async function removeDbFavorite(itemId: string) {
  const response = await fetch(`/api/favorites?itemId=${encodeURIComponent(itemId)}`, {
    method: "DELETE",
  })

  if (!response.ok) {
    const data = (await response.json().catch(() => null)) as { error?: string } | null
    throw new Error(data?.error || "Failed to remove favorite.")
  }
}
