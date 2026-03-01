"use client"

import { Search, SlidersHorizontal } from "lucide-react"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const CONDITIONS = ["all", "New", "Like New", "Good", "Fair", "Poor"] as const

interface SearchFilterProps {
  search: string
  condition: string
  onSearchChange: (value: string) => void
  onConditionChange: (value: string) => void
}

export function SearchFilter({
  search,
  condition,
  onSearchChange,
  onConditionChange,
}: SearchFilterProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search items..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9"
        />
      </div>
      <div className="flex items-center gap-2">
        <SlidersHorizontal className="h-4 w-4 text-muted-foreground sm:hidden" />
        <Select value={condition} onValueChange={onConditionChange}>
          <SelectTrigger className="w-full sm:w-[160px]">
            <SelectValue placeholder="Condition" />
          </SelectTrigger>
          <SelectContent>
            {CONDITIONS.map((c) => (
              <SelectItem key={c} value={c}>
                {c === "all" ? "All Conditions" : c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
