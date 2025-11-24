import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Mise à jour de la durée de vie de la PAC pour tous les projets...')

  const result = await prisma.projectProjetPac.updateMany({
    where: {},
    data: {
      duree_vie_pac: 17,
    },
  })

  console.log(`✅ ${result.count} projets mis à jour avec duree_vie_pac = 17 ans`)
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
