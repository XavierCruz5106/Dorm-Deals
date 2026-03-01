"use client"

import { useCallback, useEffect, useState } from "react"
import { getItems, type Item } from "@/app/actions"
import { ItemGrid } from "@/components/item-grid"
import { SearchFilter } from "@/components/search-filter"
import { Heart } from "lucide-react"
import { FAVORITES_UPDATED_EVENT, readFavoriteIds } from "@/lib/favorites"

export default function FavoritesPage() {
  const [items, setItems] = useState<Item[]>([])
  const [search, setSearch] = useState("")
  const [condition, setCondition] = useState("all")
  const [loading, setLoading] = useState(true)
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set())

  const fetchItems = useCallback(async () => {
    setLoading(true)
    const data = await getItems(
      search || undefined,
      condition !== "all" ? condition : undefined,
    )
    setItems(data)
    setLoading(false)
  }, [search, condition])

  useEffect(() => {
    const debounce = setTimeout(fetchItems, 250)
    return () => clearTimeout(debounce)
  }, [fetchItems])

  useEffect(() => {
    function syncFavorites() {
      setFavoriteIds(readFavoriteIds())
    }

    syncFavorites()
    window.addEventListener(FAVORITES_UPDATED_EVENT, syncFavorites)
    window.addEventListener("storage", syncFavorites)

    return () => {
      window.removeEventListener(FAVORITES_UPDATED_EVENT, syncFavorites)
      window.removeEventListener("storage", syncFavorites)
    }
  }, [])

  const favoriteItems = items.filter((item) => favoriteIds.has(item.id))

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-10 lg:px-8">
      <div className="mb-8 flex items-end justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-3xl font-bold text-foreground">
            <Heart className="h-7 w-7 fill-red-500 text-red-500" />
            Favorite Listings
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {favoriteItems.length} favorite{favoriteItems.length !== 1 ? "s" : ""} found
          </p>
        </div>
      </div>

      <div className="mb-6">
        <SearchFilter
          search={search}
          condition={condition}
          onSearchChange={setSearch}
          onConditionChange={setCondition}
        />
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="flex flex-col overflow-hidden rounded-xl border border-border"
            >
              <div className="aspect-[4/3] animate-pulse bg-muted" />
              <div className="flex flex-col gap-2 p-4">
                <div className="h-5 w-3/4 animate-pulse rounded bg-muted" />
                <div className="h-4 w-full animate-pulse rounded bg-muted" />
                <div className="flex gap-2 pt-2">
                  <div className="h-5 w-16 animate-pulse rounded-full bg-muted" />
                  <div className="h-5 w-12 animate-pulse rounded-full bg-muted" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <ItemGrid items={favoriteItems} />
      )}
    </div>
  )
}
