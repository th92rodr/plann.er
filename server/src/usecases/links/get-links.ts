import { db } from '@/database/prisma'
import { ClientError } from '@/errors/client-error'

interface IRequest {
  tripId: string
}

interface IResponse {
  links: {
    id: string
    title: string
    url: string
  }[]
}

export const getLinksUsecase = async ({ tripId }: IRequest): Promise<IResponse> => {
  const trip = await db.trip.findUnique({
    where: { id: tripId },
    include: {
      links: {
        select: { id: true, title: true, url: true },
      },
    },
  })

  if (!trip) {
    throw new ClientError('Trip not found.')
  }

  return { links: trip.links }
}
