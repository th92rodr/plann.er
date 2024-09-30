import { db } from '@/database/prisma'
import { ClientError } from '@/errors/client-error'

interface IRequest {
  tripId: string
}

interface IResponse {
  id: string
  destination: string
  startsAt: Date
  endsAt: Date
  isConfirmed: boolean
}

export const getTripDetailsUsecase = async ({ tripId }: IRequest): Promise<IResponse> => {
  const trip = await db.trip.findUnique({
    select: {
      id: true,
      destination: true,
      startsAt: true,
      endsAt: true,
      isConfirmed: true,
    },
    where: { id: tripId },
  })

  if (!trip) {
    throw new ClientError('Trip not found.')
  }

  return trip
}
