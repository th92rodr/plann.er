import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import dayjs from 'dayjs'
import { z } from 'zod'
import { prisma } from '../lib/prisma'

export async function createTrip(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    '/trips',
    {
      schema: {
        body: z.object({
          destination: z.string().min(4),
          starts_at: z.coerce.date(),
          ends_at: z.coerce.date(),
          owner_name: z.string(),
          owner_email: z.string().email(),
        }),
      },
    },
    async request => {
      const {
        destination,
        starts_at: startsAt,
        ends_at: endsAt,
        owner_name: ownerName,
        owner_email: ownerEmail,
      } = request.body

      if (dayjs(startsAt).isBefore(new Date())) {
        throw new Error('Invalid trip start date.')
      }

      if (dayjs(endsAt).isBefore(startsAt)) {
        throw new Error('Invalid trip end date.')
      }

      const trip = await prisma.trip.create({
        data: {
          destination,
          starts_at: startsAt,
          ends_at: endsAt,

          participants: {
            create: {
              name: ownerName,
              email: ownerEmail,
              is_owner: true,
              is_confirmed: true,
            },
          },
        },
      })

      return { trip_id: trip.id }
    }
  )
}
