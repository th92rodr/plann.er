import { db } from '@/database/prisma'
import { ClientError } from '@/errors/client-error'
import { dayjs } from '@/lib/dayjs'

interface IRequest {
  tripId: string
  destination: string
  startsAt: Date
  endsAt: Date
}

interface IResponse {
  id: string
}

export const updateTripUsecase = async ({
  tripId,
  destination,
  startsAt,
  endsAt,
}: IRequest): Promise<IResponse> => {
  const trip = await db.trip.findUnique({
    select: { id: true },
    where: { id: tripId },
  })

  if (!trip) {
    throw new ClientError('Trip not found.')
  }

  if (dayjs(startsAt).isBefore(new Date())) {
    throw new ClientError('Invalid trip start date.')
  }

  if (dayjs(endsAt).isBefore(startsAt)) {
    throw new ClientError('Invalid trip end date.')
  }

  await db.trip.update({
    where: { id: tripId },
    data: { destination, startsAt, endsAt },
  })

  return { id: trip.id }
}
