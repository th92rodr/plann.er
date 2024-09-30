import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { createActivityUsecase } from '@/usecases/activities/create-activity'
import { getActivitiesUsecase } from '@/usecases/activities/get-activities'

export const activitiesRoutes: FastifyPluginAsyncZod = async app => {
  app.route({
    method: 'GET',
    url: '/trips/:tripId/activities',
    schema: {
      params: z.object({
        tripId: z.string().uuid(),
      }),
    },
    handler: async request => {
      const { tripId } = request.params

      const { tripActivities } = await getActivitiesUsecase({ tripId })

      return { tripActivities }
    },
  })

  app.route({
    method: 'POST',
    url: '/trips/:tripId/activities',
    schema: {
      params: z.object({
        tripId: z.string().uuid(),
      }),
      body: z.object({
        title: z.string().min(1),
        occursAt: z.coerce.date(),
      }),
    },
    handler: async request => {
      const { tripId } = request.params
      const { title, occursAt } = request.body

      const { id } = await createActivityUsecase({ tripId, title, occursAt })

      return { id }
    },
  })
}
