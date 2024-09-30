import nodemailer from 'nodemailer'

import { db } from '@/database/prisma'
import { env } from '@/env'
import { ClientError } from '@/errors/client-error'
import { dayjs } from '@/lib/dayjs'
import { getMailClient } from '@/lib/mail'

interface IRequest {
  tripId: string
  email: string
}

interface IResponse {
  id: string
}

export const createInviteUsecase = async ({ tripId, email }: IRequest): Promise<IResponse> => {
  const trip = await db.trip.findUnique({
    select: { startsAt: true, endsAt: true, destination: true },
    where: { id: tripId },
  })

  if (!trip) {
    throw new ClientError('Trip not found.')
  }

  const participant = await db.participant.create({
    data: { email, tripId },
  })

  const formattedStartDate = dayjs(trip.startsAt).format('LL')
  const formattedEndDate = dayjs(trip.endsAt).format('LL')
  const confirmationLink = `http://${env.HOST}:${env.PORT}/participants/${participant.id}/confirm`

  const mail = await getMailClient()

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

  return { id: participant.id }
}
