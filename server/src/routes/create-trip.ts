import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import nodemailer from 'nodemailer'
import { z } from 'zod'

import { ClientError } from '../errors/client-error'
import { dayjs } from '../lib/dayjs'
import { getMailClient } from '../lib/mail'
import { prisma } from '../lib/prisma'

export async function createTrip(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    '/trips',
    {
      schema: {
        body: z.object({
          destination: z.string().min(4),
          starts_at: z.coerce.date(),
          ends_at: z.coerce.date(),
          owner_name: z.string(),
          owner_email: z.string().email(),
          emails_to_invite: z.array(z.string().email()),
        }),
      },
    },
    async request => {
      const {
        destination,
        starts_at: startsAt,
        ends_at: endsAt,
        owner_name: ownerName,
        owner_email: ownerEmail,
        emails_to_invite: emailsToInvite,
      } = request.body

      if (dayjs(startsAt).isBefore(new Date())) {
        throw new ClientError('Invalid trip start date.')
      }

      if (dayjs(endsAt).isBefore(startsAt)) {
        throw new ClientError('Invalid trip end date.')
      }

      const trip = await prisma.trip.create({
        data: {
          destination,
          starts_at: startsAt,
          ends_at: endsAt,

          participants: {
            createMany: {
              data: [
                {
                  name: ownerName,
                  email: ownerEmail,
                  is_owner: true,
                  is_confirmed: true,
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

      const confirmationLink = `http://localhost:3333/trips/${trip.id}/confirm`

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

      return { trip_id: trip.id }
    }
  )
}
