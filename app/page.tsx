"use client"

import { useState, useEffect, useCallback } from "react"
import { getItems, type Item } from "@/app/actions"
import { ItemGrid } from "@/components/item-grid"
import { SearchFilter } from "@/components/search-filter"
import { SignInButton, SignedOut, useAuth } from "@clerk/nextjs"
import { Button } from "@/components/ui/button"
import { ArrowRight, Heart, Store } from "lucide-react"
import Link from "next/link"
import { FAVORITES_UPDATED_EVENT, readFavoriteIds } from "@/lib/favorites"

export default function HomePage() {
  const { isSignedIn, userId } = useAuth()
  const [items, setItems] = useState<Item[]>([])
  const [search, setSearch] = useState("")
  const [condition, setCondition] = useState("all")
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<"all" | "favorites">("all")
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set())

  const fetchItems = useCallback(async () => {
    setLoading(true)
    const data = await getItems(
      search || undefined,
      condition !== "all" ? condition : undefined
    )
    setItems(data)
    setLoading(false)
  }, [search, condition])

  useEffect(() => {
    const debounce = setTimeout(fetchItems, 300)
    return () => clearTimeout(debounce)
  }, [fetchItems])

  useEffect(() => {
    function syncFavorites() {
      setFavoriteIds(isSignedIn ? readFavoriteIds(userId) : new Set<string>())
    }

    syncFavorites()
    window.addEventListener(FAVORITES_UPDATED_EVENT, syncFavorites)
    window.addEventListener("storage", syncFavorites)

    return () => {
      window.removeEventListener(FAVORITES_UPDATED_EVENT, syncFavorites)
      window.removeEventListener("storage", syncFavorites)
    }
  }, [isSignedIn, userId])

  const filteredItems =
    viewMode === "favorites" ? items.filter((item) => favoriteIds.has(item.id)) : items

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative overflow-hidden bg-primary">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -left-20 -top-20 h-72 w-72 rounded-full bg-accent" />
          <div className="absolute -bottom-10 -right-10 h-56 w-56 rounded-full bg-accent" />
        </div>
        <div className="relative mx-auto flex max-w-7xl flex-col items-center gap-6 px-4 py-16 text-center lg:px-8 lg:py-24">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-accent shadow-lg">
            <Store className="h-8 w-8 text-accent-foreground" />
          </div>
          <h1 className="max-w-2xl text-4xl font-bold tracking-tight text-primary-foreground text-balance lg:text-5xl">
            Buy and sell with fellow Blue Hens
          </h1>
          <p className="max-w-lg text-lg text-primary-foreground/80 text-pretty">
            The trusted marketplace for University of Delaware students.
            Find textbooks, furniture, electronics, and more.
          </p>
          <div className="flex items-center gap-3">
            <Button size="lg" variant="secondary" asChild>
              <a href="#browse" className="gap-2">
                Browse Items
                <ArrowRight className="h-4 w-4" />
              </a>
            </Button>
            <SignedOut>
              <SignInButton mode="modal">
                <Button size="lg" variant="outline" className="border-primary-foreground/30 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground">
                  Sign In to Sell
                </Button>
              </SignInButton>
            </SignedOut>
          </div>
        </div>
      </section>

      {/* Browse */}
      <section id="browse" className="mx-auto w-full max-w-7xl px-4 py-10 lg:px-8">
        <div className="mb-8 flex flex-col gap-4">
          <div className="flex items-end justify-between">
            <div>
              <h2 className="text-2xl font-bold text-foreground">Recent Listings</h2>
              <p className="text-sm text-muted-foreground">
                {filteredItems.length} item{filteredItems.length !== 1 ? "s" : ""} shown
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex rounded-lg border border-border bg-card p-1">
                <Button
                  type="button"
                  variant={viewMode === "all" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("all")}
                >
                  All
                </Button>
                <Button
                  type="button"
                  variant={viewMode === "favorites" ? "default" : "ghost"}
                  size="sm"
                  className="gap-1.5"
                  onClick={() => setViewMode("favorites")}
                >
                  <Heart className="h-4 w-4" />
                  Favorites
                </Button>
              </div>
              <Link href="/sell">
                <Button variant="outline" size="sm" className="hidden sm:flex">
                  Post a Listing
                </Button>
              </Link>
            </div>
          </div>
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
          <ItemGrid items={filteredItems} />
        )}
      </section>
    </div>
  )
}
