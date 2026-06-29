export type Locale = "en" | "fr" | "ar"
export type TimeOfDay = "morning" | "afternoon" | "evening" | "night"

export interface GreetingOptions {
  name?: string
  locale?: Locale
  timeZone?: string
}

export interface GreetingResult {
  greeting: string
  emoji: string
  timeOfDay: TimeOfDay
}

const messages: Record<Locale, Record<TimeOfDay, string>> = {
  en: {
    morning: "Good morning",
    afternoon: "Good afternoon",
    evening: "Good evening",
    night: "Good night",
  },
  fr: {
    morning: "Bonjour",
    afternoon: "Bon après-midi",
    evening: "Bonsoir",
    night: "Bonne nuit",
  },
  ar: {
    morning: "صباح الخير",
    afternoon: "مساء الخير",
    evening: "مساء الخير",
    night: "تصبح على خير",
  },
}

const timeEmoji: Record<TimeOfDay, string> = {
  morning: "🌅",
  afternoon: "☀️",
  evening: "🌙",
  night: "🌌",
}

export function getTimeOfDay(hour: number): TimeOfDay {
  if (hour >= 5 && hour < 12) return "morning"
  if (hour >= 12 && hour < 18) return "afternoon"
  if (hour >= 18 && hour < 22) return "evening"
  return "night"
}

export function getLocalHour(timeZone?: string): number {
  try {
    const formatter = new Intl.DateTimeFormat("en", {
      hour: "numeric",
      hourCycle: "h23",
      timeZone,
    })
    return Number(formatter.format(new Date()))
  } catch {
    return new Date().getHours()
  }
}

export function getGreeting({ name, locale = "en", timeZone }: GreetingOptions = {}): GreetingResult {
  const hour = getLocalHour(timeZone)
  const timeOfDay = getTimeOfDay(hour)
  const base = messages[locale]?.[timeOfDay] ?? messages.en[timeOfDay]
  const emoji = timeEmoji[timeOfDay]
  const greeting = name ? `${base}, ${name}` : base

  return { greeting, emoji, timeOfDay }
}
