import { db } from '@/database/prisma'
import { ClientError } from '@/errors/client-error'
import { dayjs } from '@/lib/dayjs'

interface IRequest {
  tripId: string
  title: string
  occursAt: Date
}

interface IResponse {
  id: string
}

export const createActivityUsecase = async ({
  tripId,
  title,
  occursAt,
}: IRequest): Promise<IResponse> => {
  const trip = await db.trip.findUnique({
    select: { startsAt: true, endsAt: true },
    where: { id: tripId },
  })

  if (!trip) {
    throw new ClientError('Trip not found.')
  }

  if (dayjs(occursAt).isBefore(trip.startsAt) || dayjs(occursAt).isAfter(trip.endsAt)) {
    throw new ClientError('Invalid activity date.')
  }

  const activity = await db.activity.create({
    data: { title, occursAt, tripId },
  })

  return { id: activity.id }
}
