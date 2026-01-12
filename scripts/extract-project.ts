import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const extractProjectData = async () => {
  const projectId = 'cmkb5x4pf0001ms3f37q5jc3h'

  try {
    console.log('🔍 Extracting all data for project:', projectId)
    console.log('=' .repeat(80))

    // Récupérer le projet avec TOUTES ses relations
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        housing: true,
        currentHeating: true,
        dhw: true,
        heatPump: true,
        costs: true,
        financialAid: true,
        financing: true,
        results: true,
        user: true
      }
    })

    if (!project) {
      console.error('❌ Project not found!')
      return
    }

    // Formater et afficher toutes les données
    console.log('\n📋 PROJECT DATA')
    console.log('=' .repeat(80))
    console.log(JSON.stringify(project, null, 2))

    // Résumé structuré
    console.log('\n\n📊 STRUCTURED SUMMARY')
    console.log('=' .repeat(80))

    console.log('\n🏠 LOGEMENT (Housing):')
    console.log(JSON.stringify(project.housing, null, 2))

    console.log('\n🔥 CHAUFFAGE ACTUEL (Current Heating):')
    console.log(JSON.stringify(project.currentHeating, null, 2))

    console.log('\n💧 ECS ACTUEL (Current DHW):')
    console.log(JSON.stringify(project.dhw, null, 2))

    console.log('\n⚡ PROJET PAC (Heat Pump Project):')
    console.log(JSON.stringify(project.heatPump, null, 2))

    console.log('\n💰 COÛTS (Costs):')
    console.log(JSON.stringify(project.costs, null, 2))

    console.log('\n🎁 AIDES FINANCIÈRES (Financial Aid):')
    console.log(JSON.stringify(project.financialAid, null, 2))

    console.log('\n💳 FINANCEMENT (Financing):')
    console.log(JSON.stringify(project.financing, null, 2))

    console.log('\n📈 RÉSULTATS (Results):')
    console.log(JSON.stringify(project.results, null, 2))

    console.log('\n\n✅ Extraction completed successfully!')

  } catch (error) {
    console.error('❌ Error extracting project data:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

extractProjectData()
