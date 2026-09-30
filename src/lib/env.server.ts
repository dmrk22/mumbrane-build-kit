import 'server-only'
import { z } from 'zod'

// Future Neon configuration. Every variable is optional until the backend phase.
const ServerEnv = z.object({
  DATABASE_URL: z.string().startsWith('postgres').optional(), // pooled connection string
  DATABASE_URL_UNPOOLED: z.string().startsWith('postgres').optional(), // migrations only
})

export function serverEnv() {
  const parsed = ServerEnv.safeParse({
    DATABASE_URL: process.env.DATABASE_URL,
    DATABASE_URL_UNPOOLED: process.env.DATABASE_URL_UNPOOLED,
  })
  if (!parsed.success) throw new Error('Invalid server environment') // never echo values
  return parsed.data
}
