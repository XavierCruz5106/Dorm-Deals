import { getItemById } from "@/app/actions"
import { auth } from "@clerk/nextjs/server"
import { notFound } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ImageIcon, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ItemDetailActions } from "@/components/item-detail-actions"
import { RatingForm } from "@/components/rating-form"
import { FavoriteButton } from "@/components/favorite-button"
import { BuyNowButton } from "@/components/buy-now-button"
import { SellerRatingSummary } from "@/components/seller-rating-summary"

export default async function ItemDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const item = await getItemById(id)

  if (!item) {
    notFound()
  }

  const { userId } = await auth()
  const isOwner = userId === item.user_id

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 lg:px-8">
      <Link href="/" className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="h-4 w-4" />
        Back to listings
      </Link>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Image */}
        <div className="relative aspect-square overflow-hidden rounded-xl border border-border bg-muted">
          {item.image_url ? (
            <img
              src={item.image_url}
              alt={item.title}
              className="h-full w-full object-cover"
              crossOrigin="anonymous"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <ImageIcon className="h-20 w-20 text-muted-foreground/30" />
            </div>
          )}
          {item.is_sold && (
            <div className="absolute inset-0 flex items-center justify-center bg-foreground/60">
              <span className="rounded-lg bg-destructive px-6 py-2 text-lg font-bold uppercase tracking-wider text-primary-foreground">
                Sold
              </span>
            </div>
          )}
        </div>

        {/* Details */}
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary">{item.condition}</Badge>
              {item.is_sold && (
                <Badge variant="destructive">Sold</Badge>
              )}
            </div>
            <h1 className="text-3xl font-bold text-foreground text-balance">
              {item.title}
            </h1>
            <p className="text-3xl font-bold text-primary">
              ${Number(item.price).toFixed(2)}
            </p>
            <FavoriteButton itemId={item.id} showLabel />
          </div>

          {item.description && (
            <div className="flex flex-col gap-2">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Description
              </h2>
              <p className="whitespace-pre-wrap text-foreground leading-relaxed">
                {item.description}
              </p>
            </div>
          )}

          {item.tags && item.tags.length > 0 && (
            <div className="flex flex-col gap-2">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Tags
              </h2>
              <div className="flex flex-wrap gap-2">
                {item.tags.map((tag) => (
                  <Badge key={tag} variant="outline">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Seller info */}
          <div className="flex flex-col gap-2 rounded-lg border border-border bg-muted/40 p-4">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Seller
            </h2>
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={item.user_image_url || undefined} alt={item.user_name || "Seller"} />
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {item.user_name
                    ? item.user_name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()
                    : "?"}
                </AvatarFallback>
              </Avatar>
              <div>
                <Link
                  href={`/profiles/${item.user_id}`}
                  className="font-medium text-foreground hover:text-primary"
                >
                  {item.user_name || "Anonymous"}
                </Link>
                <p className="text-xs text-muted-foreground">
                  Listed {new Date(item.created_at).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
                <SellerRatingSummary userId={item.user_id} />
              </div>
            </div>
            <div>
              <Button variant="outline" size="sm" asChild>
                <Link href={`/profiles/${item.user_id}`}>View Profile</Link>
              </Button>
            </div>
          </div>

          {/* Owner actions */}
          {isOwner && (
            <ItemDetailActions itemId={item.id} isSold={item.is_sold} />
          )}

          {!isOwner && !item.is_sold && userId && <BuyNowButton itemId={item.id} />}

          {!isOwner && userId && (
            <Button size="lg" variant="outline" className="w-full" asChild>
              <Link href={`/messages/start/${item.user_id}/${item.id}`}>Contact Seller</Link>
            </Button>
          )}

          {!isOwner && !userId && (
            <Button size="lg" variant="outline" asChild>
              <Link href="/sign-in">Sign In to Contact Seller</Link>
            </Button>
          )}

          {!isOwner && userId && (
            <RatingForm
              itemId={item.id}
              sellerName={item.user_name || "this seller"}
              sellerUserId={item.user_id}
            />
          )}

          {!isOwner && item.is_sold && !userId && (
            <Button size="lg" variant="outline" asChild>
              <Link href="/sign-in">Sign In to Leave a Rating</Link>
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
