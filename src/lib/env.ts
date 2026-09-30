import { z } from 'zod'

const PublicEnv = z.object({
  NEXT_PUBLIC_SITE_URL: z.url({ protocol: /^https?$/ }).default('https://mumbrane.com'),
  NEXT_PUBLIC_BACKEND_ENABLED: z.enum(['true', 'false']).default('false'),
})

// Each variable is referenced literally so Next can inline NEXT_PUBLIC_* values at build time.
const parsed = PublicEnv.safeParse({
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  NEXT_PUBLIC_BACKEND_ENABLED: process.env.NEXT_PUBLIC_BACKEND_ENABLED,
})
if (!parsed.success) throw new Error(`Invalid public environment:\n${z.prettifyError(parsed.error)}`)

export const publicEnv = {
  siteUrl: new URL(parsed.data.NEXT_PUBLIC_SITE_URL),
  backendEnabled: parsed.data.NEXT_PUBLIC_BACKEND_ENABLED === 'true',
} as const
