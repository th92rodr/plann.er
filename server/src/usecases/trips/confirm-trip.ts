import nodemailer from 'nodemailer'

import { db } from '@/database/prisma'
import { env } from '@/env'
import { ClientError } from '@/errors/client-error'
import { dayjs } from '@/lib/dayjs'
import { getMailClient } from '@/lib/mail'

interface IRequest {
  tripId: string
}

interface IResponse {
  id: string
}

export const confirmTripUsecase = async ({ tripId }: IRequest): Promise<IResponse> => {
  const trip = await db.trip.findUnique({
    where: { id: tripId },
    include: {
      participants: {
        select: { id: true, email: true },
        where: { isOwner: false },
      },
    },
  })

  if (!trip) {
    throw new ClientError('Trip not found.')
  }

  if (trip.isConfirmed) {
    return { id: trip.id }
  }

  await db.trip.update({
    where: { id: tripId },
    data: { isConfirmed: true },
  })

  const formattedStartDate = dayjs(trip.startsAt).format('LL')
  const formattedEndDate = dayjs(trip.endsAt).format('LL')

  const mail = await getMailClient()

  await Promise.all(
    trip.participants.map(async participant => {
      const confirmationLink = `${env.API_BASE_URL}/participants/${participant.id}/confirm`

      const message = await mail.sendMail({
        from: {
          name: 'Equipe plann.er',
          address: 'oi@plann.er',
        },
        to: participant.email,
        subject: `Confirme sua presença na viagem para ${trip.destination} em ${formattedStartDate}`,
        html: `
          <div style="font-family: sans-serif; font-size: 16px; line-height: 1.6;">
            <p>Você foi convidado(a) para participar de uma viagem para <strong>${trip.destination}</strong> nas datas de <strong>${formattedStartDate}</strong> até <strong>${formattedEndDate}</strong>.</p>
            <p></p>
            <p>Para confirmar sua presença na viagem, clique no link abaixo:</p>
            <p></p>
            <p>
              <a href="${confirmationLink}">Confirmar viagem</a>
            </p>
            <p></p>
            <p>Caso você não saiba do que se trata esse e-mail, apenas ignore esse e-mail.</p>
          </div>
        `.trim(),
      })

      console.log(nodemailer.getTestMessageUrl(message))
    })
  )

  return { id: trip.id }
}
