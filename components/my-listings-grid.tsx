"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { toggleSold, deleteItem, type Item } from "@/app/actions"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import {
  CheckCircle2,
  Undo2,
  Trash2,
  Loader2,
  ExternalLink,
  PackageOpen,
  Plus,
} from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { ItemImage } from "@/components/item-image"

export function MyListingsGrid({ items }: { items: Item[] }) {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
          <PackageOpen className="h-8 w-8 text-muted-foreground" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-foreground">No listings yet</h3>
          <p className="text-sm text-muted-foreground">
            Create your first listing to start selling.
          </p>
        </div>
        <Button asChild>
          <Link href="/sell" className="gap-1.5">
            <Plus className="h-4 w-4" />
            Create Listing
          </Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {items.map((item) => (
        <MyListingRow key={item.id} item={item} />
      ))}
    </div>
  )
}

function MyListingRow({ item }: { item: Item }) {
  const router = useRouter()
  const [toggling, setToggling] = useState(false)
  const [deleting, setDeleting] = useState(false)

  async function handleToggleSold() {
    setToggling(true)
    const result = await toggleSold(item.id)
    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success(item.is_sold ? "Marked as available" : "Marked as sold")
      router.refresh()
    }
    setToggling(false)
  }

  async function handleDelete() {
    setDeleting(true)
    const result = await deleteItem(item.id)
    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success("Listing deleted")
      router.refresh()
    }
    setDeleting(false)
  }

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-4 sm:flex-row sm:items-center">
      {/* Thumbnail */}
      <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg bg-muted">
        <ItemImage src={item.image_url} alt={item.title} fallbackClassName="bg-muted" />
        {item.is_sold && (
          <div className="absolute inset-0 flex items-center justify-center bg-foreground/60">
            <span className="text-[10px] font-bold uppercase text-primary-foreground">
              Sold
            </span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex flex-1 flex-col gap-1">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-card-foreground line-clamp-1">{item.title}</h3>
          {item.is_sold && <Badge variant="destructive" className="text-xs">Sold</Badge>}
        </div>
        <p className="text-lg font-bold text-primary">
          ${Number(item.price).toFixed(2)}
        </p>
        <p className="text-xs text-muted-foreground">
          {new Date(item.created_at).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 sm:flex-shrink-0">
        <Button variant="ghost" size="sm" asChild>
          <Link href={`/items/${item.id}`} className="gap-1">
            <ExternalLink className="h-3.5 w-3.5" />
            <span className="sr-only sm:not-sr-only">View</span>
          </Link>
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={handleToggleSold}
          disabled={toggling}
          className="gap-1"
        >
          {toggling ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : item.is_sold ? (
            <Undo2 className="h-3.5 w-3.5" />
          ) : (
            <CheckCircle2 className="h-3.5 w-3.5" />
          )}
          <span className="sr-only sm:not-sr-only">
            {item.is_sold ? "Relist" : "Sold"}
          </span>
        </Button>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" size="sm" className="gap-1">
              <Trash2 className="h-3.5 w-3.5" />
              <span className="sr-only sm:not-sr-only">Delete</span>
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete listing?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete &quot;{item.title}&quot;. This action
                cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} disabled={deleting}>
                {deleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  )
}
