import { z } from 'zod'

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production']),
  SHUTDOWN_TIMEOUT: z.coerce.number(),
  DATABASE_URL: z.string().url(),
  HOST: z.string().default('localhost'),
  PORT: z.coerce.number().default(3333),
  CORS_ORIGIN: z.string(),
  FRONTEND_URL: z.string().url(),
})

export const env = envSchema.parse(process.env)
