"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toggleSold, deleteItem } from "@/app/actions"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { CheckCircle2, Undo2, Trash2, Loader2 } from "lucide-react"
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

export function ItemDetailActions({
  itemId,
  isSold,
}: {
  itemId: string
  isSold: boolean
}) {
  const router = useRouter()
  const [toggling, setToggling] = useState(false)
  const [deleting, setDeleting] = useState(false)

  async function handleToggleSold() {
    setToggling(true)
    const result = await toggleSold(itemId)
    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success(isSold ? "Listing marked as available" : "Listing marked as sold")
      router.refresh()
    }
    setToggling(false)
  }

  async function handleDelete() {
    setDeleting(true)
    const result = await deleteItem(itemId)
    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success("Listing deleted")
      router.push("/my-listings")
    }
    setDeleting(false)
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm font-medium text-muted-foreground">
        This is your listing
      </p>
      <div className="flex gap-3">
        <Button
          variant={isSold ? "outline" : "default"}
          className="flex-1 gap-2"
          onClick={handleToggleSold}
          disabled={toggling}
        >
          {toggling ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : isSold ? (
            <Undo2 className="h-4 w-4" />
          ) : (
            <CheckCircle2 className="h-4 w-4" />
          )}
          {isSold ? "Mark Available" : "Mark as Sold"}
        </Button>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" className="gap-2">
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete listing?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete your
                listing.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} disabled={deleting}>
                {deleting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  )
}
