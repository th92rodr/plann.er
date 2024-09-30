import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { env } from '@/env'
import { confirmParticipantUsecase } from '@/usecases/participants/confirm-participant'
import { createInviteUsecase } from '@/usecases/participants/create-invite'
import { getParticipantUsecase } from '@/usecases/participants/get-participant'
import { getParticipantsUsecase } from '@/usecases/participants/get-participants'

export const participantsRoutes: FastifyPluginAsyncZod = async app => {
  app.route({
    method: 'GET',
    url: '/participants/:participantId',
    schema: {
      params: z.object({
        participantId: z.string().uuid(),
      }),
    },
    handler: async request => {
      const { participantId } = request.params

      const { participant } = await getParticipantUsecase({ participantId })

      return { participant }
    },
  })

  app.route({
    method: 'GET',
    url: '/trips/:tripId/participants',
    schema: {
      params: z.object({
        tripId: z.string().uuid(),
      }),
    },
    handler: async request => {
      const { tripId } = request.params

      const { participants } = await getParticipantsUsecase({ tripId })

      return { participants }
    },
  })

  app.route({
    method: 'GET',
    url: '/participants/:participantId/confirm',
    schema: {
      params: z.object({
        participantId: z.string().uuid(),
      }),
    },
    handler: async (request, reply) => {
      const { participantId } = request.params

      const { tripId } = await confirmParticipantUsecase({ participantId })

      return reply.redirect(`${env.WEB_BASE_URL}/trips/${tripId}`)
    },
  })

  app.route({
    method: 'POST',
    url: '/trips/:tripId/invites',
    schema: {
      params: z.object({
        tripId: z.string().uuid(),
      }),
      body: z.object({
        email: z.string().email(),
      }),
    },
    handler: async request => {
      const { tripId } = request.params
      const { email } = request.body

      const { id } = await createInviteUsecase({ tripId, email })

      return { id }
    },
  })
}
