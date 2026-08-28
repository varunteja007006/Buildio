"use client"

import * as React from "react"
import { useQueryState, parseAsString } from "nuqs"
import { Search, X } from "lucide-react"

import { Input } from "@workspace/ui/components/input"
import { Button } from "@workspace/ui/components/button"

interface DataTableSearchProps {
  placeholder?: string
}

export function DataTableSearch({ placeholder = "Search..." }: DataTableSearchProps) {
  const [value, setValue] = useQueryState("search", parseAsString.withDefault(""))
  const [draft, setDraft] = React.useState(value)
  const [prevValue, setPrevValue] = React.useState(value)
  const timer = React.useRef<ReturnType<typeof setTimeout> | null>(null)

  if (value !== prevValue) {
    setPrevValue(value)
    setDraft(value)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const next = e.target.value
    setDraft(next)
    if (timer.current) clearTimeout(timer.current)
    timer.current = setTimeout(() => {
      setValue(next || null)
    }, 350)
  }

  return (
    <div className="relative w-full max-w-sm">
      <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        value={draft}
        onChange={handleChange}
        placeholder={placeholder}
        className="pl-8 pr-8"
      />
      {draft ? (
        <Button
          variant="ghost"
          size="icon-sm"
          className="absolute top-1/2 right-1.5 -translate-y-1/2"
          onClick={() => {
            setValue(null)
            setDraft("")
          }}
        >
          <span className="sr-only">Clear search</span>
          <X className="size-3.5" />
        </Button>
      ) : null}
    </div>
  )
}