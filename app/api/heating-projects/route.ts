import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { heatingFormSchema } from "@/lib/schemas/heating-form"

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      return NextResponse.json({ error: "Utilisateur non trouvé" }, { status: 404 })
    }

    const body = await req.json()
    const validatedData = heatingFormSchema.parse(body)

    const heatingProject = await prisma.heatingProject.create({
      data: {
        // Logement
        departement: validatedData.logement.departement,
        annee_construction: validatedData.logement.annee_construction,
        surface_habitable: validatedData.logement.surface_habitable,
        nombre_occupants: validatedData.logement.nombre_occupants,
        isolation_murs: validatedData.logement.isolation_murs,
        isolation_combles: validatedData.logement.isolation_combles,
        double_vitrage: validatedData.logement.double_vitrage,

        // Chauffage actuel
        type_chauffage_actuel: validatedData.chauffage_actuel.type_chauffage,
        age_installation: validatedData.chauffage_actuel.age_installation,
        etat_installation: validatedData.chauffage_actuel.etat_installation,

        // Consommation
        type_energie: validatedData.consommation.type_chauffage,
        conso_fioul_litres: validatedData.consommation.conso_fioul_litres,
        prix_fioul_litre: validatedData.consommation.prix_fioul_litre,
        conso_gaz_kwh: validatedData.consommation.conso_gaz_kwh,
        prix_gaz_kwh: validatedData.consommation.prix_gaz_kwh,
        conso_gpl_kg: validatedData.consommation.conso_gpl_kg,
        prix_gpl_kg: validatedData.consommation.prix_gpl_kg,
        conso_pellets_kg: validatedData.consommation.conso_pellets_kg,
        prix_pellets_kg: validatedData.consommation.prix_pellets_kg,
        conso_bois_steres: validatedData.consommation.conso_bois_steres,
        prix_bois_stere: validatedData.consommation.prix_bois_stere,
        conso_elec_kwh: validatedData.consommation.conso_elec_kwh,
        prix_elec_kwh: validatedData.consommation.prix_elec_kwh,
        cop_actuel: validatedData.consommation.cop_actuel,
        conso_pac_kwh: validatedData.consommation.conso_pac_kwh,

        // Projet PAC
        type_pac: validatedData.projet_pac.type_pac,
        puissance_pac_kw: validatedData.projet_pac.puissance_pac_kw,
        cop_estime: validatedData.projet_pac.cop_estime,
        temperature_depart: validatedData.projet_pac.temperature_depart,
        emetteurs: validatedData.projet_pac.emetteurs,
        ballon_ecs: validatedData.projet_pac.ballon_ecs,
        volume_ballon: validatedData.projet_pac.volume_ballon,

        // Coûts
        cout_pac: validatedData.couts.cout_pac,
        cout_installation: validatedData.couts.cout_installation,
        cout_travaux_annexes: validatedData.couts.cout_travaux_annexes,
        cout_total: validatedData.couts.cout_total,

        // Aides
        ma_prime_renov: validatedData.aides.ma_prime_renov,
        cee: validatedData.aides.cee,
        autres_aides: validatedData.aides.autres_aides,
        total_aides: validatedData.aides.total_aides,
        reste_a_charge: validatedData.aides.reste_a_charge,

        // Financement
        mode_financement: validatedData.financement.mode_financement,
        apport_personnel: validatedData.financement.apport_personnel,
        montant_credit: validatedData.financement.montant_credit,
        taux_interet: validatedData.financement.taux_interet,
        duree_credit_mois: validatedData.financement.duree_credit_mois,
        mensualite: validatedData.financement.mensualite,

        // Évolutions
        evolution_prix_energie: validatedData.evolutions.evolution_prix_energie,
        evolution_prix_electricite: validatedData.evolutions.evolution_prix_electricite,
        duree_etude_annees: validatedData.evolutions.duree_etude_annees,

        userId: user.id,
      },
    })

    return NextResponse.json(heatingProject)
  } catch (error) {
    console.error("Error creating heating project:", error)
    return NextResponse.json(
      { error: "Erreur lors de la création du projet" },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      return NextResponse.json({ error: "Utilisateur non trouvé" }, { status: 404 })
    }

    const heatingProjects = await prisma.heatingProject.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(heatingProjects)
  } catch (error) {
    console.error("Error fetching heating projects:", error)
    return NextResponse.json(
      { error: "Erreur lors de la récupération des projets" },
      { status: 500 }
    )
  }
}
