import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const projectId = 'cmi9j2ssd000rms8ev02vf2kl'

  console.log(`Vérification du projet ${projectId}...\n`)

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      projetPac: true,
      chauffageActuel: true,
      couts: true,
      aides: true,
      evolutions: true,
    },
  })

  if (!project) {
    console.log('❌ Projet non trouvé')
    return
  }

  console.log(`📋 Projet: ${project.name}`)
  console.log(`   ID: ${project.id}`)
  console.log()

  if (project.projetPac) {
    console.log('✅ ProjetPac trouvé:')
    console.log(`   Type PAC: ${project.projetPac.type_pac}`)
    console.log(`   Puissance: ${project.projetPac.puissance_pac_kw} kW`)
    console.log(`   COP estimé: ${project.projetPac.cop_estime}`)
    console.log(`   Durée vie PAC: ${project.projetPac.duree_vie_pac} ans ⭐`)
    console.log()
  } else {
    console.log('❌ ProjetPac non trouvé')
  }

  // Vérifier la valeur brute dans la base
  const rawPac = await prisma.$queryRaw`
    SELECT duree_vie_pac
    FROM "ProjectProjetPac"
    WHERE "projectId" = ${projectId}
  `

  console.log('🔍 Valeur brute dans la DB:')
  console.log(rawPac)
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
