import cors from '@fastify/cors'
import Fastify, { type FastifyInstance } from 'fastify'
import {
  type ZodTypeProvider,
  serializerCompiler,
  validatorCompiler,
} from 'fastify-type-provider-zod'

import { errorHandler } from '@/api/rest/error-handler'
import { confirmParticipant } from '@/api/rest/routes/confirm-participant'
import { confirmTrip } from '@/api/rest/routes/confirm-trip'
import { createActivity } from '@/api/rest/routes/create-activity'
import { createInvite } from '@/api/rest/routes/create-invite'
import { createLink } from '@/api/rest/routes/create-link'
import { createTrip } from '@/api/rest/routes/create-trip'
import { getActivities } from '@/api/rest/routes/get-activities'
import { getLinks } from '@/api/rest/routes/get-links'
import { getParticipant } from '@/api/rest/routes/get-participant'
import { getParticipants } from '@/api/rest/routes/get-participants'
import { getTripDetails } from '@/api/rest/routes/get-trip-details'
import { updateTrip } from '@/api/rest/routes/update-trip'
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
  server.register(createTrip)
  server.register(confirmTrip)
  server.register(confirmParticipant)
  server.register(createActivity)
  server.register(getActivities)
  server.register(createLink)
  server.register(getLinks)
  server.register(getParticipants)
  server.register(createInvite)
  server.register(updateTrip)
  server.register(getTripDetails)
  server.register(getParticipant)

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
