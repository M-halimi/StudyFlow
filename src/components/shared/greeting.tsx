"use client"

import { useState, useEffect } from "react"
import { getGreeting, type Locale } from "@/lib/greeting"

interface GreetingProps {
  name?: string
  locale?: Locale
  className?: string
}

export function Greeting({ name, locale = "en", className = "" }: GreetingProps) {
  const [greeting, setGreeting] = useState("")

  useEffect(() => {
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone
    const result = getGreeting({ name, locale, timeZone })
    const id = requestAnimationFrame(() => {
      setGreeting(`${result.emoji} ${result.greeting}`)
    })
    return () => cancelAnimationFrame(id)
  }, [name, locale])

  if (!greeting) return null

  return <p className={className}>{greeting}</p>
}
