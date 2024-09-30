import { db } from '@/database/prisma'
import { ClientError } from '@/errors/client-error'

interface IRequest {
  tripId: string
}

interface IResponse {
  participants: {
    id: string
    name: string | null
    email: string
    isConfirmed: boolean
  }[]
}

export const getParticipantsUsecase = async ({ tripId }: IRequest): Promise<IResponse> => {
  const trip = await db.trip.findUnique({
    where: { id: tripId },
    include: {
      participants: {
        select: { id: true, name: true, email: true, isConfirmed: true },
      },
    },
  })

  if (!trip) {
    throw new ClientError('Trip not found.')
  }

  return { participants: trip.participants }
}
