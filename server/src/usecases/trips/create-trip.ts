import nodemailer from 'nodemailer'

import { db } from '@/database/prisma'
import { env } from '@/env'
import { ClientError } from '@/errors/client-error'
import { dayjs } from '@/lib/dayjs'
import { getMailClient } from '@/lib/mail'

interface IRequest {
  destination: string
  startsAt: Date
  endsAt: Date
  ownerName: string
  ownerEmail: string
  emailsToInvite: string[]
}

interface IResponse {
  id: string
}

export const createTripUsecase = async ({
  destination,
  startsAt,
  endsAt,
  ownerName,
  ownerEmail,
  emailsToInvite,
}: IRequest): Promise<IResponse> => {
  if (dayjs(startsAt).isBefore(new Date())) {
    throw new ClientError('Invalid trip start date.')
  }

  if (dayjs(endsAt).isBefore(startsAt)) {
    throw new ClientError('Invalid trip end date.')
  }

  const firstMinOfFirstDay = dayjs(startsAt).startOf('day').toDate()
  const lastMinOfLastDay = dayjs(endsAt).endOf('day').toDate()

  const trip = await db.trip.create({
    data: {
      destination,
      startsAt: firstMinOfFirstDay,
      endsAt: lastMinOfLastDay,

      participants: {
        createMany: {
          data: [
            {
              name: ownerName,
              email: ownerEmail,
              isOwner: true,
              isConfirmed: true,
            },
            ...emailsToInvite.map(email => {
              return { email }
            }),
          ],
        },
      },
    },
  })

  const formattedStartDate = dayjs(startsAt).format('LL')
  const formattedEndDate = dayjs(endsAt).format('LL')

  const confirmationLink = `${env.API_BASE_URL}/trips/${trip.id}/confirm`

  const mail = await getMailClient()

  const message = await mail.sendMail({
    from: {
      name: 'Equipe plann.er',
      address: 'oi@plann.er',
    },
    to: {
      name: ownerName,
      address: ownerEmail,
    },
    subject: `Confirme sua viagem para ${destination} em ${formattedStartDate}`,
    html: `
      <div style="font-family: sans-serif; font-size: 16px; line-height: 1.6;">
        <p>Você solicitou a criação de uma viagem para <strong>${destination}</strong> nas datas de <strong>${formattedStartDate}</strong> até <strong>${formattedEndDate}</strong>.</p>
        <p></p>
        <p>Para confirmar sua viagem, clique no link abaixo:</p>
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

  return { id: trip.id }
}
