import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import type { Item } from "@/app/actions"
import { ImageIcon } from "lucide-react"

export function ItemCard({ item }: { item: Item }) {
  return (
    <Link
      href={`/items/${item.id}`}
      className="group relative flex flex-col overflow-hidden rounded-xl border border-border bg-card transition-all hover:shadow-lg hover:border-primary/30"
    >
      {/* Image */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
        {item.image_url ? (
          <img
            src={item.image_url}
            alt={item.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            crossOrigin="anonymous"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <ImageIcon className="h-12 w-12 text-muted-foreground/40" />
          </div>
        )}

        {/* Sold overlay */}
        {item.is_sold && (
          <div className="absolute inset-0 flex items-center justify-center bg-foreground/60">
            <span className="rounded-md bg-destructive px-4 py-1.5 text-sm font-bold uppercase tracking-wider text-primary-foreground">
              Sold
            </span>
          </div>
        )}

        {/* Price tag */}
        <div className="absolute bottom-2 right-2 rounded-md bg-primary px-2.5 py-1 text-sm font-bold text-primary-foreground shadow-sm">
          ${Number(item.price).toFixed(2)}
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="line-clamp-1 text-base font-semibold text-card-foreground group-hover:text-primary transition-colors">
          {item.title}
        </h3>

        {item.description && (
          <p className="line-clamp-2 text-sm text-muted-foreground">
            {item.description}
          </p>
        )}

        <div className="mt-auto flex flex-wrap items-center gap-1.5 pt-2">
          <Badge variant="secondary" className="text-xs">
            {item.condition}
          </Badge>
          {item.tags?.slice(0, 2).map((tag) => (
            <Badge key={tag} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
          {item.tags && item.tags.length > 2 && (
            <span className="text-xs text-muted-foreground">
              +{item.tags.length - 2}
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}
