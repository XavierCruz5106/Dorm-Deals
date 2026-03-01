"use client"

import Link from "next/link"
import { SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs"
import { Store, Plus, Package, Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState } from "react"

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 lg:px-8">
        <Link href="/" className="flex items-center gap-2.5" onClick={() => setMobileOpen(false)}>
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <Store className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold tracking-tight text-foreground">
            Dorm Deals
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden items-center gap-2 md:flex">
          <SignedIn>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/my-listings" className="gap-1.5">
                <Package className="h-4 w-4" />
                My Listings
              </Link>
            </Button>
            <Button size="sm" asChild>
              <Link href="/sell" className="gap-1.5">
                <Plus className="h-4 w-4" />
                Sell Item
              </Link>
            </Button>
            <UserButton
              afterSignOutUrl="/"
              appearance={{
                elements: {
                  avatarBox: "h-8 w-8",
                },
              }}
            />
          </SignedIn>
          <SignedOut>
            <SignInButton mode="modal">
              <Button size="sm">Sign In</Button>
            </SignInButton>
          </SignedOut>
        </div>

        {/* Mobile hamburger */}
        <button
          className="flex items-center md:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? (
            <X className="h-6 w-6 text-foreground" />
          ) : (
            <Menu className="h-6 w-6 text-foreground" />
          )}
        </button>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t border-border bg-background px-4 py-4 md:hidden">
          <div className="flex flex-col gap-3">
            <SignedIn>
              <Button variant="ghost" size="sm" asChild className="justify-start">
                <Link href="/my-listings" onClick={() => setMobileOpen(false)} className="gap-2">
                  <Package className="h-4 w-4" />
                  My Listings
                </Link>
              </Button>
              <Button size="sm" asChild className="justify-start">
                <Link href="/sell" onClick={() => setMobileOpen(false)} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Sell Item
                </Link>
              </Button>
              <div className="pt-2">
                <UserButton
                  afterSignOutUrl="/"
                  appearance={{
                    elements: {
                      avatarBox: "h-8 w-8",
                    },
                  }}
                />
              </div>
            </SignedIn>
            <SignedOut>
              <SignInButton mode="modal">
                <Button size="sm" className="w-full">Sign In</Button>
              </SignInButton>
            </SignedOut>
          </div>
        </div>
      )}
    </header>
  )
}
