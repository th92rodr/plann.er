import { db } from '@/database/prisma'
import { ClientError } from '@/errors/client-error'

interface IRequest {
  tripId: string
  title: string
  url: string
}

interface IResponse {
  id: string
}

export const createLinkUsecase = async ({ tripId, title, url }: IRequest): Promise<IResponse> => {
  const trip = await db.trip.findUnique({
    select: { id: true },
    where: { id: tripId },
  })

  if (!trip) {
    throw new ClientError('Trip not found.')
  }

  const link = await db.link.create({
    data: { title, url, tripId },
  })

  return { id: link.id }
}
