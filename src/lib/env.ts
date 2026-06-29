const requiredServerEnvVars = [
  "DATABASE_URL",
  "DIRECT_URL",
  "AUTH_SECRET",
] as const

const requiredPublicEnvVars = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
] as const

type EnvVar = string

function missingEnvVars(vars: readonly EnvVar[]): EnvVar[] {
  return vars.filter((key) => !process.env[key])
}

export function validateEnv(): void {
  const missing = [
    ...missingEnvVars(requiredServerEnvVars),
    ...missingEnvVars(requiredPublicEnvVars),
  ]

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables:\n  ${missing.join("\n  ")}\n\n` +
        "Set them in .env or Vercel environment variables."
    )
  }

  if (process.env.AUTH_SECRET === "your-auth-secret-change-in-production") {
    throw new Error(
      "AUTH_SECRET is still the default placeholder. Generate a real secret:\n" +
        "  npx auth secret\n" +
        "Then set the output value as AUTH_SECRET in .env"
    )
  }

  if (
    process.env.NEXT_PUBLIC_SUPABASE_URL?.includes("your-project-ref")
  ) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL is still the placeholder. " +
        "Set it to your actual Supabase project URL from Settings > API."
    )
  }

  if (
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.includes("your-anon-key")
  ) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_ANON_KEY is still the placeholder. " +
        "Set it to your actual Supabase anon key from Settings > API."
    )
  }

  if (
    process.env.SUPABASE_SERVICE_ROLE_KEY?.includes("your-service-role-key")
  ) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY is still the placeholder. " +
        "Set it to your actual Supabase service role key from Settings > API.\n" +
        "WARNING: Never expose this key to the client."
    )
  }
}

export function getEnvVar(key: string): string {
  const value = process.env[key]
  if (!value) {
    throw new Error(
      `Environment variable "${key}" is not set. ` +
        "Check your .env file or Vercel environment variables."
    )
  }
  return value
}

export function getOptionalEnvVar(key: string, defaultValue = ""): string {
  return process.env[key] ?? defaultValue
}
