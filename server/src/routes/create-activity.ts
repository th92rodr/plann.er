import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { ClientError } from '../errors/client-error'
import { dayjs } from '../lib/dayjs'
import { prisma } from '../lib/prisma'

export async function createActivity(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    '/trips/:tripId/activities',
    {
      schema: {
        params: z.object({
          tripId: z.string().uuid(),
        }),
        body: z.object({
          title: z.string().min(4),
          occurs_at: z.coerce.date(),
        }),
      },
    },
    async request => {
      const { tripId } = request.params
      const { title, occurs_at: occursAt } = request.body

      const trip = await prisma.trip.findUnique({
        where: { id: tripId },
      })

      if (!trip) {
        throw new ClientError('Trip not found.')
      }

      if (dayjs(occursAt).isBefore(trip.starts_at) || dayjs(occursAt).isAfter(trip.ends_at)) {
        throw new ClientError('Invalid activity date.')
      }

      const activity = await prisma.activity.create({
        data: { title, occurs_at: occursAt, trip_id: tripId },
      })

      return { activity_id: activity.id }
    }
  )
}
