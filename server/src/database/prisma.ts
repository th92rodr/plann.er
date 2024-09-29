import { PrismaClient } from '@prisma/client'
import { PrismaClientInitializationError } from '@prisma/client/runtime/library'

import { env } from '@/env'

export let db: PrismaClient

export async function dbConnect() {
  if (db) {
    console.log('Database already connected.')
    return
  }

  try {
    db = new PrismaClient({
      log: env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : [],
    })
    await db.$connect()
    console.log('Database connected successfully.')
  } catch (error) {
    if (error instanceof PrismaClientInitializationError) {
      console.error('Failed to initialize Prisma Client:', error.message)
    } else {
      console.error('Unexpected error during database connection:', error)
    }
    throw error
  }
}

export async function dbDisconnect() {
  if (db) {
    await db.$disconnect()
    console.log('Database disconnected.')
  }
}
