import { db } from '@/database/prisma'
import { ClientError } from '@/errors/client-error'

interface IRequest {
  participantId: string
}

interface IResponse {
  participant: {
    id: string
    name: string | null
    email: string
    isConfirmed: boolean
  }
}

export const getParticipantUsecase = async ({ participantId }: IRequest): Promise<IResponse> => {
  const participant = await db.participant.findUnique({
    select: { id: true, name: true, email: true, isConfirmed: true },
    where: { id: participantId },
  })

  if (!participant) {
    throw new ClientError('Participant not found.')
  }

  return { participant }
}
