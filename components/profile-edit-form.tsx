"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { upsertMyProfile, type Profile } from "@/app/actions"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

type Props = {
  profile: Profile | null
}

export function ProfileEditForm({ profile }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [displayName, setDisplayName] = useState(profile?.display_name || "")
  const [bio, setBio] = useState(profile?.bio || "")
  const [major, setMajor] = useState(profile?.major || "")
  const [year, setYear] = useState(profile?.year || "")
  const [housingPreferences, setHousingPreferences] = useState(profile?.housing_preferences || "")

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    const formData = new FormData()
    formData.set("display_name", displayName)
    formData.set("bio", bio)
    formData.set("major", major)
    formData.set("year", year)
    formData.set("housing_preferences", housingPreferences)

    startTransition(async () => {
      const result = await upsertMyProfile(formData)
      if (result.error) {
        toast.error(result.error)
        return
      }

      toast.success("Profile updated")
      router.refresh()
    })
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 rounded-xl border border-border bg-card p-5">
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground" htmlFor="display_name">
          Display Name
        </label>
        <Input
          id="display_name"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          placeholder="Your name"
          required
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground" htmlFor="bio">
          Bio
        </label>
        <Textarea
          id="bio"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="Tell other students a bit about yourself"
          rows={4}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground" htmlFor="major">
            Major
          </label>
          <Input
            id="major"
            value={major}
            onChange={(e) => setMajor(e.target.value)}
            placeholder="Computer Science"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground" htmlFor="year">
            Year
          </label>
          <Input
            id="year"
            value={year}
            onChange={(e) => setYear(e.target.value)}
            placeholder="Sophomore"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground" htmlFor="housing_preferences">
          Housing Preferences
        </label>
        <Textarea
          id="housing_preferences"
          value={housingPreferences}
          onChange={(e) => setHousingPreferences(e.target.value)}
          placeholder="Quiet hours, roommates, neighborhood, budget range..."
          rows={3}
        />
      </div>

      <Button type="submit" disabled={isPending}>
        {isPending ? "Saving..." : "Save Profile"}
      </Button>
    </form>
  )
}
