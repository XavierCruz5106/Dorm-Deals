"use client"

import { useState } from "react"
import Link from "next/link"
import { Trash2 } from "lucide-react"
import { deleteConversation } from "@/app/actions"
import { toast } from "sonner"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"

interface ConversationItemProps {
  conversationId: string
  partnerName: string
  createdAt: string
}

export function ConversationItem({
  conversationId,
  partnerName,
  createdAt,
}: ConversationItemProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  async function handleDelete() {
    setIsDeleting(true)
    const result = await deleteConversation(conversationId)

    if (result.error) {
      toast.error(result.error)
      setIsDeleting(false)
      setShowDeleteDialog(false)
    } else {
      toast.success("Conversation deleted")
      setShowDeleteDialog(false)
      // page will auto-refresh due to revalidatePath
    }
  }

  return (
    <>
      <div className="mt-2 flex items-center gap-2">
        <Link
          href={`/messages/${conversationId}`}
          className="flex-1 block rounded-lg border border-border px-4 py-3 hover:bg-accent/50"
        >
          <p className="text-foreground">
            Conversation started {new Date(createdAt).toLocaleString()}
          </p>
        </Link>
        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => {
            e.preventDefault()
            setShowDeleteDialog(true)
          }}
          className="text-muted-foreground hover:text-destructive shrink-0"
          title="Delete conversation"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete conversation?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete your conversation with {partnerName} and all
              messages. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
