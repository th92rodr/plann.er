import { db } from '@/database/prisma'
import { ClientError } from '@/errors/client-error'
import { dayjs } from '@/lib/dayjs'

interface IRequest {
  tripId: string
}

interface IResponse {
  activities: {
    date: Date
    activities: {
      id: string
      title: string
      occursAt: Date
    }[]
  }[]
}

export const getActivitiesUsecase = async ({ tripId }: IRequest): Promise<IResponse> => {
  const trip = await db.trip.findUnique({
    where: { id: tripId },
    include: {
      activities: {
        select: { id: true, title: true, occursAt: true },
        orderBy: { occursAt: 'asc' },
      },
    },
  })

  if (!trip) {
    throw new ClientError('Trip not found.')
  }

  const tripLengthInDays = dayjs(trip.endsAt).diff(trip.startsAt, 'days')

  const activities = Array.from({ length: tripLengthInDays + 1 }).map((_, index) => {
    const date = dayjs(trip.startsAt).add(index, 'days')
    return {
      date: date.toDate(),
      activities: trip.activities.filter(activity => {
        return dayjs(activity.occursAt).isSame(date, 'day')
      }),
    }
  })

  return { activities }
}
