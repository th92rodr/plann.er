import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { env } from '@/env'
import { confirmTripUsecase } from '@/usecases/trips/confirm-trip'
import { createTripUsecase } from '@/usecases/trips/create-trip'
import { getTripDetailsUsecase } from '@/usecases/trips/get-trip-details'
import { updateTripUsecase } from '@/usecases/trips/update-trip'

export const tripsRoutes: FastifyPluginAsyncZod = async app => {
  app.route({
    method: 'GET',
    url: '/trips/:tripId',
    schema: {
      params: z.object({
        tripId: z.string().uuid(),
      }),
    },
    handler: async request => {
      const { tripId } = request.params

      const trip = await getTripDetailsUsecase({ tripId })

      return {
        trip: {
          id: trip.id,
          destination: trip.destination,
          starts_at: trip.startsAt,
          ends_at: trip.endsAt,
          is_confirmed: trip.isConfirmed,
        },
      }
    },
  })

  app.route({
    method: 'GET',
    url: '/trips/:tripId/confirm',
    schema: {
      params: z.object({
        tripId: z.string().uuid(),
      }),
    },
    handler: async (request, reply) => {
      const { tripId } = request.params

      const { id } = await confirmTripUsecase({ tripId })

      return reply.redirect(`${env.FRONTEND_URL}/trips/${id}`)
    },
  })

  app.route({
    method: 'POST',
    url: '/trips',
    schema: {
      body: z.object({
        destination: z.string().min(1),
        starts_at: z.coerce.date(),
        ends_at: z.coerce.date(),
        owner_name: z.string(),
        owner_email: z.string().email(),
        emails_to_invite: z.array(z.string().email()),
      }),
    },
    handler: async request => {
      const {
        destination,
        starts_at: startsAt,
        ends_at: endsAt,
        owner_name: ownerName,
        owner_email: ownerEmail,
        emails_to_invite: emailsToInvite,
      } = request.body

      const { id } = await createTripUsecase({
        destination,
        startsAt,
        endsAt,
        ownerName,
        ownerEmail,
        emailsToInvite,
      })

      return { id }
    },
  })

  app.route({
    method: 'PUT',
    url: '/trips/:tripId',
    schema: {
      params: z.object({
        tripId: z.string().uuid(),
      }),
      body: z.object({
        destination: z.string().min(1),
        starts_at: z.coerce.date(),
        ends_at: z.coerce.date(),
      }),
    },
    handler: async request => {
      const { tripId } = request.params
      const { destination, starts_at: startsAt, ends_at: endsAt } = request.body

      const { id } = await updateTripUsecase({ tripId, destination, startsAt, endsAt })

      return { id }
    },
  })
}
