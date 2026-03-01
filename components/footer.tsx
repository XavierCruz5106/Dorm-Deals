import Link from "next/link"
import { Store } from "lucide-react"

export function Footer() {
  return (
    <footer className="border-t border-border bg-muted/40">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-4 px-4 py-8 text-center lg:px-8">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary">
            <Store className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="font-semibold text-foreground">Dorm Deals</span>
        </Link>
        <p className="max-w-md text-sm text-muted-foreground text-balance">
          The trusted marketplace for University of Delaware students.
          Buy and sell textbooks, furniture, electronics, and more.
        </p>
        <p className="text-xs text-muted-foreground">
          Built for Blue Hens, by Blue Hens.
        </p>
      </div>
    </footer>
  )
}
