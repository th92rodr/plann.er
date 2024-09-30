import { db } from '@/database/prisma'
import { ClientError } from '@/errors/client-error'

interface IRequest {
  participantId: string
}

interface IResponse {
  id: string
  tripId: string
}

export const confirmParticipantUsecase = async ({
  participantId,
}: IRequest): Promise<IResponse> => {
  const participant = await db.participant.findUnique({
    select: { id: true, isConfirmed: true, tripId: true },
    where: { id: participantId },
  })

  if (!participant) {
    throw new ClientError('Participant not found.')
  }

  if (participant.isConfirmed) {
    return { id: participant.id, tripId: participant.tripId }
  }

  await db.participant.update({
    where: { id: participantId },
    data: { isConfirmed: true },
  })

  return { id: participant.id, tripId: participant.tripId }
}
