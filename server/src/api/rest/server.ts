import cors from '@fastify/cors'
import Fastify, { type FastifyInstance } from 'fastify'
import {
  type ZodTypeProvider,
  serializerCompiler,
  validatorCompiler,
} from 'fastify-type-provider-zod'

import { errorHandler } from '@/api/rest/error-handler'
import { activitiesRoutes } from '@/api/rest/routes/activities'
import { linksRoutes } from '@/api/rest/routes/links'
import { participantsRoutes } from '@/api/rest/routes/participants'
import { tripsRoutes } from '@/api/rest/routes/trips'
import { env } from '@/env'

let server: FastifyInstance

export async function start() {
  if (server) {
    console.log('HTTP server already started.')
    return
  }

  server = Fastify({
    logger: {
      level: env.NODE_ENV === 'development' ? 'info' : 'error',
    },
  }).withTypeProvider<ZodTypeProvider>()

  // Setup CORS
  server.register(cors, {
    origin: env.CORS_ORIGIN,
  })

  server.setValidatorCompiler(validatorCompiler)
  server.setSerializerCompiler(serializerCompiler)

  // Register error handler
  server.setErrorHandler(errorHandler)

  // Register routes
  server.register(tripsRoutes)
  server.register(activitiesRoutes)
  server.register(linksRoutes)
  server.register(participantsRoutes)

  try {
    await server.listen({ host: env.HOST, port: env.PORT })
    console.log(`HTTP server listening at: http://${env.HOST}:${env.PORT}`)
  } catch (error) {
    server.log.error('Failed starting HTTP server.')
    throw error
  }
}

export async function stop() {
  if (server) {
    await server.close()
    console.log('HTTP server stopped.')
  }
}
