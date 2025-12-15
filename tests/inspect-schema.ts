/**
 * Script pour inspecter la structure réelle d'un projet dans la base de données
 */

import { prisma } from '../lib/prisma'

const inspect = async () => {
  // Récupérer un projet existant avec toutes ses relations
  const project = await prisma.project.findFirst({
    include: {
      housing: true,
      currentHeating: true,
      dhw: true,
      heatPump: true,
      couts: true,
      aides: true,
      financement: true,
      evolutions: true,
      results: true,
    },
  })

  if (!project) {
    console.log('❌ Aucun projet trouvé dans la base de données')
    await prisma.$disconnect()
    return
  }

  console.log('✅ Projet trouvé:', project.id)
  console.log('\n📋 Structure des données:\n')

  const sections = [
    { name: 'housing', data: project.housing },
    { name: 'currentHeating', data: project.currentHeating },
    { name: 'dhw', data: project.dhw },
    { name: 'heatPump', data: project.heatPump },
    { name: 'couts', data: project.couts },
    { name: 'aides', data: project.aides },
    { name: 'financement', data: project.financement },
    { name: 'evolutions', data: project.evolutions },
  ]

  for (const section of sections) {
    console.log(`\n${section.name.toUpperCase()}:`)
    if (section.data) {
      console.log(JSON.stringify(section.data, null, 2))
    } else {
      console.log('  (vide)')
    }
  }

  await prisma.$disconnect()
}

inspect()
