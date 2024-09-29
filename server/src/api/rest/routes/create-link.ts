import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { db } from '@/database/prisma'
import { ClientError } from '@/errors/client-error'

export async function createLink(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    '/trips/:tripId/links',
    {
      schema: {
        params: z.object({
          tripId: z.string().uuid(),
        }),
        body: z.object({
          title: z.string().min(1),
          url: z.string().url(),
        }),
      },
    },
    async request => {
      const { tripId } = request.params
      const { title, url } = request.body

      const trip = await db.trip.findUnique({
        where: { id: tripId },
      })

      if (!trip) {
        throw new ClientError('Trip not found.')
      }

      const link = await db.link.create({
        data: { title, url, trip_id: tripId },
      })

      return { link_id: link.id }
    }
  )
}
