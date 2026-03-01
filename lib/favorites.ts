export const FAVORITES_STORAGE_KEY = "dorm_deals_favorites"
export const FAVORITES_UPDATED_EVENT = "dorm-deals:favorites-updated"

export function readFavoriteIds() {
  if (typeof window === "undefined") {
    return new Set<string>()
  }

  try {
    const raw = window.localStorage.getItem(FAVORITES_STORAGE_KEY)
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

export function writeFavoriteIds(values: Set<string>) {
  if (typeof window === "undefined") {
    return
  }

  window.localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(Array.from(values)))
  window.dispatchEvent(new CustomEvent(FAVORITES_UPDATED_EVENT))
}

export function toggleFavoriteId(itemId: string) {
  const values = readFavoriteIds()

  if (values.has(itemId)) {
    values.delete(itemId)
  } else {
    values.add(itemId)
  }

  writeFavoriteIds(values)
  return values
}
