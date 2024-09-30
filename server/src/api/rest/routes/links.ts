import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { createLinkUsecase } from '@/usecases/links/create-link'
import { getLinksUsecase } from '@/usecases/links/get-links'

export const linksRoutes: FastifyPluginAsyncZod = async app => {
  app.route({
    method: 'GET',
    url: '/trips/:tripId/links',
    schema: {
      params: z.object({
        tripId: z.string().uuid(),
      }),
    },
    handler: async request => {
      const { tripId } = request.params

      const { links } = await getLinksUsecase({ tripId })

      return { links }
    },
  })

  app.route({
    method: 'POST',
    url: '/trips/:tripId/links',
    schema: {
      params: z.object({
        tripId: z.string().uuid(),
      }),
      body: z.object({
        title: z.string().min(1),
        url: z.string().url(),
      }),
    },
    handler: async request => {
      const { tripId } = request.params
      const { title, url } = request.body

      const { id } = await createLinkUsecase({ tripId, title, url })

      return { id }
    },
  })
}
