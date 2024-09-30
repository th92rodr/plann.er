import { PrismaClient } from '@prisma/client'

import { dayjs } from '@/lib/dayjs'

const db = new PrismaClient()

async function main() {
  await db.link.deleteMany()
  await db.activity.deleteMany()
  await db.participant.deleteMany()
  await db.trip.deleteMany()

  await db.trip.create({
    data: {
      destination: 'Rome',
      startsAt: dayjs(new Date()).toDate(),
      endsAt: dayjs(new Date()).add(7, 'day').toDate(),
      isConfirmed: true,

      participants: {
        createMany: {
          data: [
            {
              name: 'John Doe',
              email: 'john.doe@mail.com',
              isOwner: true,
              isConfirmed: true,
            },
            {
              name: 'Jane Doe',
              email: 'jane.doe@mail.com',
            },
            {
              name: 'Jake Doe',
              email: 'jake.doe@mail.com',
            },
          ],
        },
      },

      activities: {
        createMany: {
          data: [
            {
              title: 'Concert',
              occursAt: dayjs(new Date()).add(1, 'day').toDate(),
            },
            {
              title: 'Movies',
              occursAt: dayjs(new Date()).add(2, 'day').toDate(),
            },
            {
              title: 'Dinner',
              occursAt: dayjs(new Date()).add(4, 'day').toDate(),
            },
            {
              title: 'Bowling',
              occursAt: dayjs(new Date()).add(6, 'day').toDate(),
            },
          ],
        },
      },

      links: {
        createMany: {
          data: [
            {
              title: 'Accommodation reservation',
              url: 'https://www.accommodation.com',
            },
            {
              title: 'Museum tickets',
              url: 'https://www.museum.com',
            },
          ],
        },
      },
    },
  })
}

main()
  .then(async () => {
    console.log('Database seeding finished successfully.')
    await db.$disconnect()
  })
  .catch(async error => {
    console.error('Database seeding failed:', error)
    await db.$disconnect()
    process.exit(1)
  })
