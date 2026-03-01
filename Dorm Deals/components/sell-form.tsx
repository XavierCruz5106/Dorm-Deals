"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createItem } from "@/app/actions"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

const CONDITIONS = ["New", "Like New", "Good", "Fair", "Poor"]

export function SellForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [condition, setCondition] = useState("Good")

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    formData.set("condition", condition)

    const result = await createItem(formData)

    if (result.error) {
      toast.error(result.error)
      setLoading(false)
      return
    }

    toast.success("Listing created successfully!")
    router.push("/my-listings")
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Label htmlFor="title">Title *</Label>
        <Input
          id="title"
          name="title"
          placeholder="e.g. Calculus Textbook, Mini Fridge"
          required
          maxLength={120}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          placeholder="Describe the item, its condition, and any details a buyer should know..."
          rows={4}
          maxLength={1000}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label htmlFor="price">Price ($) *</Label>
          <Input
            id="price"
            name="price"
            type="number"
            min="0.01"
            step="0.01"
            placeholder="25.00"
            required
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="condition">Condition</Label>
          <Select value={condition} onValueChange={setCondition}>
            <SelectTrigger id="condition">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CONDITIONS.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="image_url">Image URL</Label>
        <Input
          id="image_url"
          name="image_url"
          type="url"
          placeholder="https://example.com/photo.jpg"
        />
        <p className="text-xs text-muted-foreground">
          Paste a link to an image of your item. Use a service like Imgur or Google Drive (public link).
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="tags">Tags</Label>
        <Input
          id="tags"
          name="tags"
          placeholder="textbook, math, calculus"
        />
        <p className="text-xs text-muted-foreground">
          Separate tags with commas. Helps buyers find your item.
        </p>
      </div>

      <Button type="submit" size="lg" disabled={loading} className="mt-2">
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Creating Listing...
          </>
        ) : (
          "Create Listing"
        )}
      </Button>
    </form>
  )
}
