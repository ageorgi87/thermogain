import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Vérification de la durée de vie de la PAC...\n')

  const projets = await prisma.projectProjetPac.findMany({
    select: {
      id: true,
      projectId: true,
      duree_vie_pac: true,
    },
  })

  if (projets.length === 0) {
    console.log('❌ Aucun projet PAC trouvé dans la base de données')
  } else {
    console.log(`📊 ${projets.length} projet(s) PAC trouvé(s):\n`)
    projets.forEach(projet => {
      console.log(`  - ID: ${projet.id}`)
      console.log(`    Project ID: ${projet.projectId}`)
      console.log(`    Durée vie PAC: ${projet.duree_vie_pac} ans`)
      console.log()
    })
  }

  // Vérifier tous les projets
  const allProjects = await prisma.project.findMany({
    select: {
      id: true,
      name: true,
      projetPac: {
        select: {
          duree_vie_pac: true,
        },
      },
    },
  })

  console.log(`\n📋 ${allProjects.length} projet(s) total:\n`)
  allProjects.forEach(project => {
    console.log(`  - ${project.name} (${project.id})`)
    if (project.projetPac) {
      console.log(`    ✅ ProjetPac existe - duree_vie_pac: ${project.projetPac.duree_vie_pac} ans`)
    } else {
      console.log(`    ❌ ProjetPac n'existe pas encore`)
    }
    console.log()
  })
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
