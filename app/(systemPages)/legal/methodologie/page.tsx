import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata = {
  title: "Méthodologie de Calcul | ThermoGain",
  description:
    "Méthodologie complète des calculs de rentabilité de pompes à chaleur",
};

export default function MethodologiePage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-3xl">Méthodologie de Calcul</CardTitle>
        <CardDescription>
          Explication détaillée de nos méthodes de calcul pour l'analyse de
          rentabilité des pompes à chaleur
        </CardDescription>
      </CardHeader>
      <CardContent className="prose prose-sm max-w-none dark:prose-invert">
        <p className="text-muted-foreground mb-6">
          Dernière mise à jour :{" "}
          {new Date().toLocaleDateString("fr-FR", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>

        {/* Table des matières */}
        <section className="mb-8 bg-muted/30 p-4 rounded-lg">
          <h2 className="text-xl font-semibold mb-3">Table des matières</h2>
          <ol className="list-decimal pl-6 space-y-1">
            <li>
              <a href="#introduction" className="text-primary hover:underline">
                Introduction
              </a>
            </li>
            <li>
              <a
                href="#donnees-sources"
                className="text-primary hover:underline"
              >
                Sources de données
              </a>
            </li>
            <li>
              <a
                href="#conversions-energetiques"
                className="text-primary hover:underline"
              >
                Conversions énergétiques
              </a>
            </li>
            <li>
              <a
                href="#cout-chauffage-actuel"
                className="text-primary hover:underline"
              >
                Coût du chauffage actuel
              </a>
            </li>
            <li>
              <a href="#cout-pac" className="text-primary hover:underline">
                Coût avec pompe à chaleur
              </a>
            </li>
            <li>
              <a
                href="#evolution-prix"
                className="text-primary hover:underline"
              >
                Évolution des prix de l'énergie
              </a>
            </li>
            <li>
              <a
                href="#economies-annuelles"
                className="text-primary hover:underline"
              >
                Économies annuelles
              </a>
            </li>
            <li>
              <a href="#rentabilite" className="text-primary hover:underline">
                Rentabilité et retour sur investissement
              </a>
            </li>
            <li>
              <a href="#financement" className="text-primary hover:underline">
                Impact du financement
              </a>
            </li>
            <li>
              <a href="#hypotheses" className="text-primary hover:underline">
                Hypothèses et limites
              </a>
            </li>
          </ol>
        </section>

        {/* 1. Introduction */}
        <section id="introduction" className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
          <p className="mb-4">
            ThermoGain utilise une méthodologie rigoureuse pour estimer la
            rentabilité d'un projet de pompe à chaleur (PAC). Nos calculs
            s'appuient sur des données officielles, des modèles économétriques
            validés et des normes du secteur.
          </p>
          <p className="mb-4">
            Cette page détaille chaque calcul effectué, les formules utilisées,
            et les sources de données pour assurer la transparence et la
            fiabilité de nos estimations.
          </p>
        </section>

        {/* 2. Sources de données */}
        <section id="donnees-sources" className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">2. Sources de données</h2>

          <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 p-4 rounded-lg mb-6">
            <p className="text-sm">
              <strong>📋 Référence technique :</strong> Toutes les constantes
              statiques utilisées dans nos calculs (facteurs de conversion,
              tarifs, COP moyens, etc.) sont centralisées dans le fichier{" "}
              <code className="bg-blue-100 dark:bg-blue-900 px-1.5 py-0.5 rounded text-xs">
                config/constants.ts
              </code>
              . Chaque valeur y est documentée avec sa source, son utilisation
              et sa date de dernière mise à jour.
            </p>
          </div>

          <h3 className="text-xl font-semibold mt-6 mb-3">
            2.1 Prix de l'énergie
          </h3>
          <p className="mb-4">
            Les prix moyens de l'énergie sont issus de l'
            <strong>
              API DIDO du Service des Données et Études Statistiques (SDES)
            </strong>
            , service du Ministère de la Transition Écologique.
          </p>
          <ul className="list-disc pl-6 space-y-2 mb-4">
            <li>
              <strong>Électricité</strong> : Prix moyen TTC résidentiel, tarif
              Base (dataset avec 18+ ans d'historique)
            </li>
            <li>
              <strong>Gaz naturel</strong> : Prix moyen TTC résidentiel (dataset
              avec 18+ ans d'historique)
            </li>
            <li>
              <strong>Fioul domestique</strong> : Prix moyen TTC à la livraison
              (dataset avec 42+ ans d'historique)
            </li>
            <li>
              <strong>Bois et pellets</strong> : Prix moyen TTC résidentiel
              (dataset avec 18+ ans d'historique)
            </li>
          </ul>
          <p className="mb-4 text-sm italic">
            Source :{" "}
            <a
              href="https://data.economie.gouv.fr/explore/?refine.publisher=SDES"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              data.economie.gouv.fr
            </a>
          </p>

          <h3 className="text-xl font-semibold mt-6 mb-3">
            2.2 Tarifs d'abonnement électrique
          </h3>
          <p className="mb-4">
            Les tarifs d'abonnement électrique sont basés sur les{" "}
            <strong>Tarifs Réglementés de Vente (TRV) d'EDF</strong> pour 2024 :
          </p>
          <div className="overflow-x-auto mb-4">
            <table className="w-full border-collapse border border-gray-300 dark:border-gray-700 text-sm">
              <thead>
                <tr className="bg-muted">
                  <th className="border border-gray-300 dark:border-gray-700 p-3 text-left font-semibold">
                    Puissance souscrite
                  </th>
                  <th className="border border-gray-300 dark:border-gray-700 p-3 text-left font-semibold">
                    Abonnement annuel TTC
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-gray-300 dark:border-gray-700 p-3">
                    3 kVA
                  </td>
                  <td className="border border-gray-300 dark:border-gray-700 p-3">
                    140,76 €/an
                  </td>
                </tr>
                <tr>
                  <td className="border border-gray-300 dark:border-gray-700 p-3">
                    6 kVA
                  </td>
                  <td className="border border-gray-300 dark:border-gray-700 p-3">
                    185,64 €/an
                  </td>
                </tr>
                <tr>
                  <td className="border border-gray-300 dark:border-gray-700 p-3">
                    9 kVA
                  </td>
                  <td className="border border-gray-300 dark:border-gray-700 p-3">
                    232,68 €/an
                  </td>
                </tr>
                <tr>
                  <td className="border border-gray-300 dark:border-gray-700 p-3">
                    12 kVA
                  </td>
                  <td className="border border-gray-300 dark:border-gray-700 p-3">
                    279,84 €/an
                  </td>
                </tr>
                <tr>
                  <td className="border border-gray-300 dark:border-gray-700 p-3">
                    15 kVA
                  </td>
                  <td className="border border-gray-300 dark:border-gray-700 p-3">
                    324,72 €/an
                  </td>
                </tr>
                <tr>
                  <td className="border border-gray-300 dark:border-gray-700 p-3">
                    18 kVA
                  </td>
                  <td className="border border-gray-300 dark:border-gray-700 p-3">
                    369,12 €/an
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="mb-4 text-sm italic">
            Source :{" "}
            <a
              href="https://particulier.edf.fr/fr/accueil/gestion-contrat/options/base.html"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              EDF - Tarif Bleu Base (en vigueur depuis 1er août 2025)
            </a>
          </p>

          <h3 className="text-xl font-semibold mt-6 mb-3">
            2.3 Coefficients de performance (COP)
          </h3>
          <p className="mb-4">
            Le COP (Coefficient de Performance) représente le rapport entre
            l'énergie thermique produite et l'énergie électrique consommée.
          </p>

          <h4 className="text-lg font-semibold mt-4 mb-2">
            2.3.1 COP nominal du fabricant
          </h4>
          <p className="mb-4">
            Le COP nominal est mesuré dans des conditions standardisées
            (généralement 7°C extérieur / 35°C départ d'eau pour les PAC
            hydrauliques). Les valeurs typiques selon l'ADEME :
          </p>
          <ul className="list-disc pl-6 space-y-2 mb-4">
            <li>
              <strong>PAC Air/Air</strong> : COP de 3 à 4 (moyenne : 3,5)
            </li>
            <li>
              <strong>PAC Air/Eau</strong> : COP de 2,5 à 3,5 (moyenne : 3)
            </li>
            <li>
              <strong>PAC Eau/Eau (géothermie)</strong> : COP de 4 à 5 (moyenne
              : 4,5)
            </li>
          </ul>

          <h4 className="text-lg font-semibold mt-4 mb-2">
            2.3.2 COP ajusté (conditions réelles)
          </h4>
          <p className="mb-4">
            Le COP réel en conditions d'exploitation diffère du COP nominal car
            il dépend de plusieurs facteurs. ThermoGain applique des{" "}
            <strong>ajustements automatiques</strong> basés sur :
          </p>
          <ul className="list-disc pl-6 space-y-2 mb-4">
            <li>
              <strong>Température de départ d'eau</strong> : Déduite
              automatiquement du type d'émetteur
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>Plancher chauffant : 35°C (facteur optimal : 1.0)</li>
                <li>Radiateurs basse température : 45°C (facteur : 0.85)</li>
                <li>Radiateurs moyenne température : 55°C (facteur : 0.75)</li>
                <li>Radiateurs haute température : 65°C (facteur : 0.65)</li>
              </ul>
            </li>
            <li>
              <strong>Zone climatique</strong> : Basée sur le code postal
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>Zone H3 (Sud) : facteur 1.0 (conditions optimales)</li>
                <li>Zone H2 (Centre) : facteur 0.95</li>
                <li>Zone H1c (Nord-Est) : facteur 0.9</li>
                <li>Zone H1b (Nord) : facteur 0.88</li>
                <li>Zone H1a (montagne) : facteur 0.85</li>
              </ul>
            </li>
          </ul>

          <div className="bg-muted/30 p-4 rounded-lg mb-4 font-mono text-sm">
            <p>
              <strong>Formule COP ajusté :</strong>
            </p>
            <p>
              COP ajusté = COP nominal × Facteur température × Facteur
              climatique
            </p>
            <br />
            <p>
              <strong>Exemple :</strong>
            </p>
            <p>COP nominal = 5 (Air/Eau)</p>
            <p>Radiateurs BT (45°C) → Facteur température = 0.85</p>
            <p>Zone H2 (Paris) → Facteur climatique = 0.95</p>
            <p>
              COP ajusté = 5 × 0.85 × 0.95 = <strong>4.04</strong>
            </p>
          </div>

          <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 p-4 rounded-lg mb-4">
            <p className="text-sm">
              <strong>📋 Mise à jour importante (décembre 2024) :</strong> Suite
              à une analyse approfondie des recommandations ADEME, nous avons
              supprimé la "double pénalité" qui appliquait à la fois un facteur
              température ET un facteur émetteur. Le type d'émetteur détermine
              maintenant uniquement la température de départ, et seul le facteur
              température est appliqué. Cela reflète mieux la réalité physique :
              un radiateur BT nécessite 45°C, cette température impacte
              directement le COP (règle ADEME : "10°C de moins = +1 point de
              COP"), il n'y a pas de pénalité supplémentaire liée au type
              d'émetteur.
            </p>
          </div>

          <h4 className="text-lg font-semibold mt-6 mb-2">
            2.3.3 Pourquoi pas de correction SCOP supplémentaire ?
          </h4>

          <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 p-4 rounded-lg mb-4">
            <p className="mb-3">
              <strong>📊 Position de ThermoGain :</strong> Nous utilisons le{" "}
              <strong>COP ajusté</strong> directement dans nos calculs de
              consommation, SANS appliquer de facteur de correction SCOP
              supplémentaire. Cette approche est justifiée par plusieurs
              raisons.
            </p>
          </div>

          <p className="mb-3">
            <strong>
              1. Étude ADEME 2023-2024 : Performance moyenne incluant
              installations médiocres
            </strong>
          </p>
          <p className="mb-4">
            L'étude ADEME sur 100 maisons équipées de PAC a mesuré un{" "}
            <strong>SCOP réel moyen de 2,9 pour les PAC Air/Eau</strong>.
            Cependant, cette moyenne INCLUT :
          </p>
          <ul className="list-disc pl-6 space-y-2 mb-4">
            <li>
              Des PAC <strong>surdimensionnées</strong> (cycles courts →
              dégradation du SCOP)
            </li>
            <li>
              Des <strong>régulations de qualité variable</strong> (systèmes mal
              paramétrés)
            </li>
            <li>
              Des{" "}
              <strong>
                installations faites par des professionnels de niveaux variés
              </strong>
            </li>
            <li>Des réglages non optimisés après installation</li>
          </ul>

          <p className="mb-3">
            <strong>
              2. ThermoGain s'adresse à des professionnels RGE qualifiés
            </strong>
          </p>
          <p className="mb-4">
            Cet outil est conçu pour des{" "}
            <strong>chauffagistes certifiés RGE</strong> qui :
          </p>
          <ul className="list-disc pl-6 space-y-2 mb-4">
            <li>
              ✅ Savent <strong>dimensionner correctement</strong> une PAC (pas
              de surdimensionnement)
            </li>
            <li>
              ✅ Maîtrisent l'
              <strong>installation selon les règles de l'art</strong>
            </li>
            <li>
              ✅ Paramètrent finement la <strong>régulation</strong> (loi d'eau,
              courbe de chauffe)
            </li>
            <li>
              ✅ Assurent un <strong>suivi et optimisation</strong> après
              installation
            </li>
          </ul>

          <p className="mb-4">
            L'étude ADEME elle-même confirme que les{" "}
            <strong>
              installations professionnelles optimales atteignent des SCOP bien
              supérieurs à 2,9
            </strong>
            . Exemple cité : une PAC géothermique NIBE a atteint un{" "}
            <strong>SCOP de 7,4</strong> grâce à une régulation intelligente et
            un installateur compétent.
          </p>

          <p className="mb-3">
            <strong>
              3. Le COP ajusté intègre déjà les conditions réelles
            </strong>
          </p>
          <p className="mb-4">Notre COP ajusté prend en compte :</p>
          <ul className="list-disc pl-6 space-y-2 mb-4">
            <li>
              La <strong>température de départ d'eau</strong> selon le type
              d'émetteur (règle ADEME : -1 point de COP par 10°C)
            </li>
            <li>
              La <strong>zone climatique</strong> (H1, H2, H3) avec facteurs
              différenciés
            </li>
            <li>
              Les conditions d'exploitation réelles du système de chauffage
            </li>
          </ul>

          <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 p-4 rounded-lg mb-4">
            <p className="mb-3">
              <strong>✅ Positionnement professionnel :</strong>
            </p>
            <p className="mb-3">
              Les économies présentées par ThermoGain reposent sur une{" "}
              <strong>
                installation professionnelle conforme aux règles de l'art
              </strong>
              par un installateur RGE qualifié. Un dimensionnement incorrect,
              une régulation mal paramétrée, ou une installation non optimisée
              peuvent réduire significativement les performances réelles.
            </p>
            <p className="text-sm">
              <strong>Notre approche :</strong> Présenter des chiffres réalistes
              pour des installations de qualité professionnelle, plutôt que des
              estimations pessimistes basées sur la moyenne incluant des
              installations médiocres. Cela valorise l'expertise des
              professionnels RGE et encourage la transition énergétique avec des
              projections fiables.
            </p>
          </div>

          <p className="mb-4 text-sm italic">
            Sources :
            <a
              href="https://www.ademe.fr/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline ml-1"
            >
              ADEME - Étude 2023-2024 sur 100 maisons équipées de PAC
            </a>
            ,
            <a
              href="https://www.quechoisir.org/actualite-pompes-a-chaleur-a-priori-plutot-rentables-mais-n171872/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline ml-1"
            >
              UFC Que Choisir - Analyse performances PAC
            </a>
          </p>

          <h3 className="text-xl font-semibold mt-6 mb-3">
            2.4 Durée de vie des équipements
          </h3>
          <p className="mb-4">
            La durée de vie moyenne d'une pompe à chaleur est estimée à{" "}
            <strong>17 ans</strong> selon les études de l'ADEME. Cette valeur
            est utilisée par défaut pour toutes les projections long terme.
          </p>
        </section>

        {/* 3. Conversions énergétiques */}
        <section id="conversions-energetiques" className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">
            3. Conversions énergétiques
          </h2>
          <p className="mb-4">
            Pour comparer les différentes énergies et calculer les besoins de
            chauffage en kWh, nous utilisons les facteurs de conversion suivants
            :
          </p>
          <div className="overflow-x-auto mb-4">
            <table className="w-full border-collapse border border-gray-300 dark:border-gray-700 text-sm">
              <thead>
                <tr className="bg-muted">
                  <th className="border border-gray-300 dark:border-gray-700 p-3 text-left font-semibold">
                    Énergie
                  </th>
                  <th className="border border-gray-300 dark:border-gray-700 p-3 text-left font-semibold">
                    Unité
                  </th>
                  <th className="border border-gray-300 dark:border-gray-700 p-3 text-left font-semibold">
                    Équivalent kWh
                  </th>
                  <th className="border border-gray-300 dark:border-gray-700 p-3 text-left font-semibold">
                    Source
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-gray-300 dark:border-gray-700 p-3">
                    Fioul domestique
                  </td>
                  <td className="border border-gray-300 dark:border-gray-700 p-3">
                    1 litre
                  </td>
                  <td className="border border-gray-300 dark:border-gray-700 p-3">
                    9,96 kWh PCI
                  </td>
                  <td className="border border-gray-300 dark:border-gray-700 p-3">
                    Standards européens
                  </td>
                </tr>
                <tr>
                  <td className="border border-gray-300 dark:border-gray-700 p-3">
                    Gaz naturel
                  </td>
                  <td className="border border-gray-300 dark:border-gray-700 p-3">
                    Direct
                  </td>
                  <td className="border border-gray-300 dark:border-gray-700 p-3">
                    kWh PCI
                  </td>
                  <td className="border border-gray-300 dark:border-gray-700 p-3">
                    Facture fournisseur
                  </td>
                </tr>
                <tr>
                  <td className="border border-gray-300 dark:border-gray-700 p-3">
                    GPL (propane)
                  </td>
                  <td className="border border-gray-300 dark:border-gray-700 p-3">
                    1 kg
                  </td>
                  <td className="border border-gray-300 dark:border-gray-700 p-3">
                    12,8 kWh PCI
                  </td>
                  <td className="border border-gray-300 dark:border-gray-700 p-3">
                    Standards européens
                  </td>
                </tr>
                <tr>
                  <td className="border border-gray-300 dark:border-gray-700 p-3">
                    Pellets (granulés)
                  </td>
                  <td className="border border-gray-300 dark:border-gray-700 p-3">
                    1 kg
                  </td>
                  <td className="border border-gray-300 dark:border-gray-700 p-3">
                    4,6 kWh PCI
                  </td>
                  <td className="border border-gray-300 dark:border-gray-700 p-3">
                    Standards européens (&lt;10% humidité)
                  </td>
                </tr>
                <tr>
                  <td className="border border-gray-300 dark:border-gray-700 p-3">
                    Bois (bûches)
                  </td>
                  <td className="border border-gray-300 dark:border-gray-700 p-3">
                    1 stère
                  </td>
                  <td className="border border-gray-300 dark:border-gray-700 p-3">
                    1800 kWh
                  </td>
                  <td className="border border-gray-300 dark:border-gray-700 p-3">
                    Bois sec 20-25% humidité
                  </td>
                </tr>
                <tr>
                  <td className="border border-gray-300 dark:border-gray-700 p-3">
                    Électricité
                  </td>
                  <td className="border border-gray-300 dark:border-gray-700 p-3">
                    Direct
                  </td>
                  <td className="border border-gray-300 dark:border-gray-700 p-3">
                    kWh
                  </td>
                  <td className="border border-gray-300 dark:border-gray-700 p-3">
                    Compteur électrique
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="mb-4 mt-4 text-sm bg-muted/30 p-3 rounded-lg">
            <strong>Note importante sur le PCI :</strong> Les facteurs de
            conversion utilisent le{" "}
            <strong>PCI (Pouvoir Calorifique Inférieur)</strong>
            et non le PCS (Pouvoir Calorifique Supérieur), conformément aux
            standards européens. Le PCI correspond à l'énergie réellement
            utilisable par les systèmes de chauffage modernes. Pour le bois, la
            valeur de 1800 kWh/stère correspond à du bois sec avec un taux
            d'humidité de 20-25% ; cette valeur peut varier selon l'essence et
            l'humidité du bois.
          </p>
        </section>

        {/* 4. Coût du chauffage actuel */}
        <section id="cout-chauffage-actuel" className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">
            4. Coût du chauffage actuel
          </h2>

          <h3 className="text-xl font-semibold mt-6 mb-3">
            4.1 Coûts variables (énergie)
          </h3>
          <p className="mb-4">
            Le coût variable annuel correspond au coût de l'énergie consommée
            pour le chauffage.
          </p>
          <div className="bg-muted/30 p-4 rounded-lg mb-4 font-mono text-sm">
            <p>
              <strong>Formule :</strong>
            </p>
            <p>Coût variable = Consommation × Prix unitaire</p>
            <br />
            <p>
              <strong>Exemples :</strong>
            </p>
            <ul className="list-disc pl-6 space-y-1 mt-2">
              <li>Fioul : 2000 litres × 1,20 €/L = 2400 €/an</li>
              <li>Gaz : 15000 kWh × 0,12 €/kWh = 1800 €/an</li>
              <li>Électricité : 8000 kWh × 0,25 €/kWh = 2000 €/an</li>
            </ul>
          </div>

          <h3 className="text-xl font-semibold mt-6 mb-3">4.2 Coûts fixes</h3>
          <p className="mb-4">
            Les coûts fixes incluent les frais récurrents indépendants de la
            consommation :
          </p>
          <ul className="list-disc pl-6 space-y-2 mb-4">
            <li>
              <strong>Abonnement électrique</strong> : Selon la puissance
              souscrite (voir tableau section 2.2)
            </li>
            <li>
              <strong>Abonnement gaz</strong> : Uniquement pour le chauffage au
              gaz (~120 €/an en moyenne)
            </li>
            <li>
              <strong>Entretien annuel</strong> : Coût d'entretien du système
              actuel
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>Chaudière gaz : ~120 €/an (entretien obligatoire)</li>
                <li>Chaudière fioul : ~150 €/an (entretien + ramonage)</li>
                <li>Chaudière GPL : ~130 €/an</li>
                <li>Poêle à granulés : ~100 €/an</li>
                <li>Poêle à bois : ~80 €/an (ramonage)</li>
                <li>
                  Radiateurs électriques : 0 €/an (pas d'entretien obligatoire)
                </li>
              </ul>
            </li>
          </ul>

          <div className="bg-muted/30 p-4 rounded-lg mb-4 font-mono text-sm">
            <p>
              <strong>Formule coût total :</strong>
            </p>
            <p>
              Coût annuel actuel = Coût variable + Abonnement électrique +
              Abonnement gaz + Entretien
            </p>
          </div>
        </section>

        {/* 5. Coût avec PAC */}
        <section id="cout-pac" className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">
            5. Coût avec pompe à chaleur
          </h2>

          <h3 className="text-xl font-semibold mt-6 mb-3">
            5.1 Calcul des besoins énergétiques
          </h3>

          <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 p-4 rounded-lg mb-4">
            <p className="mb-3">
              <strong>📊 Méthode MOYENNE (Décembre 2024) :</strong> ThermoGain
              utilise une approche équilibrée qui combine la{" "}
              <strong>consommation réelle déclarée</strong> et les{" "}
              <strong>besoins théoriques selon le DPE</strong>.
            </p>
          </div>

          <p className="mb-4">
            Les besoins énergétiques du logement sont calculés selon une{" "}
            <strong>moyenne pondérée (50/50)</strong> entre :
          </p>

          <ul className="list-disc pl-6 space-y-2 mb-4">
            <li>
              <strong>Consommation réelle</strong> : Votre consommation actuelle
              convertie en kWh (fioul, gaz, électricité...)
            </li>
            <li>
              <strong>Besoins théoriques DPE</strong> : Surface habitable ×
              Consommation DPE (kWh/m²/an)
            </li>
          </ul>

          <div className="bg-muted/30 p-4 rounded-lg mb-4 font-mono text-sm">
            <p>
              <strong>Formule complète :</strong>
            </p>
            <p>
              1. Consommation réelle = Consommation déclarée convertie en kWh
            </p>
            <p>2. Besoins DPE = Surface (m²) × Consommation DPE (kWh/m²/an)</p>
            <p>3. Besoins finaux = (Consommation réelle + Besoins DPE) ÷ 2</p>
            <br />
            <p>
              <strong>Exemple concret :</strong>
            </p>
            <p>Consommation réelle : 1500 L fioul × 9.96 kWh/L = 14 940 kWh</p>
            <p>Besoins DPE E (100m² × 290 kWh/m²) = 29 000 kWh</p>
            <p>
              Besoins finaux = (14 940 + 29 000) ÷ 2 ={" "}
              <strong>21 970 kWh</strong>
            </p>
          </div>

          <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 p-4 rounded-lg mb-4">
            <p className="mb-3">
              <strong>✅ Pourquoi cette approche ?</strong>
            </p>
            <ul className="list-disc pl-6 space-y-2 text-sm">
              <li>
                <strong>Ancré dans le concret</strong> : Tient compte de l'usage
                réel actuel du client
              </li>
              <li>
                <strong>Anticipe le confort optimal</strong> : Corrige les biais
                comportementaux (client qui se prive de chauffage)
              </li>
              <li>
                <strong>Évite les extrêmes</strong> : Ni trop optimiste
                (consommation sous-estimée), ni trop pessimiste (DPE déconnecté)
              </li>
              <li>
                <strong>Message commercial positif</strong> : "Avec la PAC, vous
                aurez un meilleur confort pour moins cher"
              </li>
            </ul>
          </div>

          <div className="bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 p-3 rounded-lg mb-4">
            <p className="text-sm">
              <strong>💡 Cas d'usage :</strong>
            </p>
            <ul className="list-disc pl-6 space-y-1 text-xs mt-2">
              <li>
                <strong>Client chauffe peu (16°C)</strong> → Moyenne anticipe
                amélioration confort à 19-20°C avec PAC
              </li>
              <li>
                <strong>Hiver atypique (très doux)</strong> → Moyenne compense
                la consommation temporairement basse
              </li>
              <li>
                <strong>Logement partiellement chauffé</strong> → Moyenne
                anticipe usage futur de toute la surface
              </li>
            </ul>
          </div>

          <h3 className="text-xl font-semibold mt-6 mb-3">
            5.2 Consommation électrique de la PAC
          </h3>
          <p className="mb-4">
            La PAC consomme moins d'électricité que les besoins grâce à son COP
            (elle récupère de l'énergie gratuite dans l'air ou le sol).
            ThermoGain utilise le <strong>COP ajusté</strong> (et non le COP
            nominal) pour refléter les conditions réelles d'exploitation.
          </p>
          <div className="bg-muted/30 p-4 rounded-lg mb-4 font-mono text-sm">
            <p>
              <strong>Formule :</strong>
            </p>
            <p>
              Consommation PAC (kWh) = Besoins énergétiques (kWh) ÷ COP ajusté
            </p>
            <br />
            <p>
              <strong>Exemple :</strong>
            </p>
            <p>COP nominal = 5</p>
            <p>COP ajusté = 4.04 (après ajustements température + climat)</p>
            <p>20 000 kWh ÷ 4.04 = 4950 kWh d'électricité consommée</p>
            <br />
            <p className="text-xs">
              Note : Pour 1 kWh d'électricité consommé, la PAC produit 4.04 kWh
              de chaleur dans cet exemple
            </p>
          </div>
          <div className="bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 p-3 rounded-lg mb-4">
            <p className="text-sm">
              <strong>⚠️ Important :</strong> L'utilisation du COP ajusté (et
              non nominal) garantit une estimation réaliste des coûts. Un COP
              nominal de 5 peut devenir 3.4 dans de mauvaises conditions
              (radiateurs HT en zone froide), ce qui modifie significativement
              la consommation électrique et donc la rentabilité du projet.
            </p>
          </div>

          <h3 className="text-xl font-semibold mt-6 mb-3">
            5.3 Coût variable avec PAC
          </h3>
          <div className="bg-muted/30 p-4 rounded-lg mb-4 font-mono text-sm">
            <p>
              <strong>Formule :</strong>
            </p>
            <p>
              Coût variable PAC = Consommation PAC (kWh) × Prix électricité
              (€/kWh)
            </p>
            <br />
            <p>
              <strong>Exemple :</strong>
            </p>
            <p>5714 kWh × 0,2516 €/kWh = 1438 €/an</p>
          </div>

          <h3 className="text-xl font-semibold mt-6 mb-3">
            5.4 Coûts fixes avec PAC
          </h3>
          <ul className="list-disc pl-6 space-y-2 mb-4">
            <li>
              <strong>Abonnement électrique augmenté</strong> : La PAC nécessite
              généralement une puissance souscrite plus élevée (9 ou 12 kVA au
              lieu de 6 kVA)
            </li>
            <li>
              <strong>Entretien PAC</strong> : Entretien annuel obligatoire
              (~120 €/an en moyenne)
            </li>
            <li>
              <strong>Suppression abonnement gaz</strong> : Si remplacement
              d'une chaudière gaz, l'abonnement gaz est supprimé (économie)
            </li>
          </ul>

          <div className="bg-muted/30 p-4 rounded-lg mb-4 font-mono text-sm">
            <p>
              <strong>Formule coût total PAC :</strong>
            </p>
            <p>
              Coût annuel PAC = Coût variable PAC + Abonnement électrique PAC +
              Entretien PAC
            </p>
            <br />
            <p>
              <strong>Exemple complet :</strong>
            </p>
            <p>
              1438 € (électricité) + 189,60 € (abonnement 9 kVA) + 120 €
              (entretien) = 1747,60 €/an
            </p>
          </div>
        </section>

        {/* 6. Eau Chaude Sanitaire (ECS) */}
        <section id="ecs" className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">
            6. Prise en compte de l'Eau Chaude Sanitaire (ECS)
          </h2>

          <p className="mb-4">
            L'ECS (Eau Chaude Sanitaire) représente la production d'eau chaude
            pour les usages domestiques (douches, bains, vaisselle, etc.).
            ThermoGain traite l'ECS selon <strong>4 scénarios possibles</strong>{" "}
            en fonction de votre installation actuelle et du projet PAC.
          </p>

          <h3 className="text-xl font-semibold mt-6 mb-3">
            6.1 Les 4 scénarios ECS
          </h3>

          <div className="space-y-4 mb-6">
            <div className="bg-muted/30 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">
                Scénario A : ECS intégrée → PAC sans gestion ECS
              </h4>
              <p className="text-sm mb-2">
                <strong>Situation :</strong> Votre système actuel produit à la
                fois le chauffage et l'ECS (ex: chaudière gaz). La future PAC ne
                gère que le chauffage.
              </p>
              <p className="text-sm">
                <strong>Calcul :</strong> L'ECS reste incluse dans le système de
                chauffage actuel. Pas de calcul séparé.
              </p>
            </div>

            <div className="bg-muted/30 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">
                Scénario B : ECS intégrée → PAC avec gestion ECS
              </h4>
              <p className="text-sm mb-2">
                <strong>Situation :</strong> Votre système actuel produit
                chauffage + ECS. La future PAC gérera aussi l'ECS (PAC
                thermodynamique ou ballon intégré).
              </p>
              <p className="text-sm mb-2">
                <strong>Problématique :</strong> La consommation totale actuelle
                ne distingue pas chauffage et ECS.
              </p>
              <p className="text-sm">
                <strong>Calcul :</strong> Estimation ADEME des besoins ECS (800
                kWh/personne/an). Si cette estimation dépasse la consommation
                totale, on applique un ratio 80/20 (80% chauffage, 20% ECS).
              </p>
            </div>

            <div className="bg-muted/30 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">
                Scénario C : ECS séparée → PAC sans gestion ECS
              </h4>
              <p className="text-sm mb-2">
                <strong>Situation :</strong> Vous avez déjà un système ECS
                séparé (ex: ballon électrique, chauffe-eau gaz). La PAC ne gère
                que le chauffage.
              </p>
              <p className="text-sm">
                <strong>Calcul :</strong> Le système ECS actuel est conservé.
                Coût ECS identique avant/après (pas d'économies sur cette
                partie).
              </p>
            </div>

            <div className="bg-muted/30 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">
                Scénario D : ECS séparée → PAC avec gestion ECS
              </h4>
              <p className="text-sm mb-2">
                <strong>Situation :</strong> Vous avez un système ECS séparé
                actuellement. La future PAC remplacera ce système (PAC
                thermodynamique).
              </p>
              <p className="text-sm">
                <strong>Calcul :</strong> Comparaison complète entre le coût ECS
                actuel et le coût ECS avec PAC.
              </p>
            </div>
          </div>

          <h3 className="text-xl font-semibold mt-6 mb-3">
            6.2 COP ECS (production d'eau chaude)
          </h3>
          <p className="mb-4">
            Le COP pour la production d'ECS est <strong>inférieur</strong> au
            COP chauffage car l'eau chaude sanitaire nécessite une température
            plus élevée (55-60°C vs 35-45°C pour le chauffage).
          </p>
          <div className="bg-muted/30 p-4 rounded-lg mb-4 font-mono text-sm">
            <p>
              <strong>Formule COP ECS :</strong>
            </p>
            <p>COP ECS = COP ajusté chauffage × 0,85</p>
            <br />
            <p>
              <strong>Exemple :</strong>
            </p>
            <p>COP ajusté chauffage = 4.04</p>
            <p>
              COP ECS = 4.04 × 0.85 = <strong>3.43</strong>
            </p>
          </div>
          <p className="text-sm italic mb-4">
            Source : Ratio standard du secteur basé sur la différence de
            température de production
          </p>

          <h3 className="text-xl font-semibold mt-6 mb-3">
            6.3 Estimation ADEME des besoins ECS
          </h3>
          <p className="mb-4">
            Lorsque la consommation ECS n'est pas connue séparément (Scénario
            B), nous utilisons la méthode ADEME :
          </p>
          <div className="bg-muted/30 p-4 rounded-lg mb-4 font-mono text-sm">
            <p>
              <strong>Formule :</strong>
            </p>
            <p>Besoins ECS (kWh/an) = Nombre d'occupants × 800 kWh</p>
            <br />
            <p>
              <strong>Exemple pour 4 personnes :</strong>
            </p>
            <p>Besoins ECS = 4 × 800 = 3200 kWh/an</p>
            <br />
            <p>
              <strong>Validation :</strong>
            </p>
            <p>
              Si l'estimation dépasse la consommation totale, application du
              ratio 80/20 :
            </p>
            <ul className="list-disc pl-6 space-y-1 mt-2">
              <li>80% de la consommation totale → chauffage</li>
              <li>20% de la consommation totale → ECS</li>
            </ul>
          </div>
          <p className="text-sm italic mb-4">
            Source :{" "}
            <a
              href="https://www.ademe.fr/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              ADEME - Estimation besoins ECS résidentiels
            </a>
          </p>

          <h3 className="text-xl font-semibold mt-6 mb-3">
            6.4 Calcul des économies ECS
          </h3>
          <div className="bg-muted/30 p-4 rounded-lg mb-4 font-mono text-sm">
            <p>
              <strong>Scénario D - Exemple complet :</strong>
            </p>
            <br />
            <p>
              <strong>ECS actuel (ballon électrique) :</strong>
            </p>
            <p>Consommation : 3200 kWh/an</p>
            <p>Prix électricité : 0.2516 €/kWh</p>
            <p>Entretien : 50 €/an</p>
            <p>Coût total = 3200 × 0.2516 + 50 = 855 €/an</p>
            <br />
            <p>
              <strong>ECS futur (PAC thermodynamique) :</strong>
            </p>
            <p>Besoins : 3200 kWh/an (identique)</p>
            <p>COP ECS : 3.43</p>
            <p>Consommation PAC : 3200 / 3.43 = 933 kWh/an</p>
            <p>Prix électricité PAC : 0.2516 €/kWh</p>
            <p>Coût = 933 × 0.2516 = 235 €/an</p>
            <p>(Entretien inclus dans entretien PAC)</p>
            <br />
            <p>
              <strong>Économies ECS annuelles :</strong>
            </p>
            <p>
              855 € - 235 € = <strong>620 €/an</strong>
            </p>
          </div>

          <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 p-4 rounded-lg mb-4">
            <p className="text-sm">
              <strong>💡 Bon à savoir :</strong> Les économies sur l'ECS peuvent
              représenter une part significative des économies totales, surtout
              si vous remplacez un ballon électrique (COP = 1) par une PAC
              thermodynamique (COP ≈ 3-3.5). Dans certains cas, les économies
              ECS peuvent atteindre 30-40% des économies totales du projet.
            </p>
          </div>
        </section>

        {/* 7. Évolution des prix */}
        <section id="evolution-prix" className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">
            6. Évolution des prix de l'énergie
          </h2>

          <h3 className="text-xl font-semibold mt-6 mb-3">
            6.1 Modèle Mean Reversion (nouveau - décembre 2024)
          </h3>
          <p className="mb-4">
            Depuis décembre 2024, ThermoGain utilise un{" "}
            <strong>modèle économétrique Mean Reversion</strong> basé sur
            l'historique complet de l'API DIDO-SDES (18 à 42 ans de données
            selon l'énergie).
          </p>
          <p className="mb-4">
            Ce modèle reflète la tendance naturelle des prix de l'énergie à
            revenir vers un taux d'équilibre long terme après des périodes de
            forte volatilité.
          </p>

          <h3 className="text-xl font-semibold mt-6 mb-3">
            6.2 Paramètres du modèle par énergie
          </h3>
          <div className="overflow-x-auto mb-4">
            <table className="w-full border-collapse border border-gray-300 dark:border-gray-700 text-sm">
              <thead>
                <tr className="bg-muted">
                  <th className="border border-gray-300 dark:border-gray-700 p-3 text-left font-semibold">
                    Énergie
                  </th>
                  <th className="border border-gray-300 dark:border-gray-700 p-3 text-left font-semibold">
                    Taux récent
                    <br />
                    (5 premières années)
                  </th>
                  <th className="border border-gray-300 dark:border-gray-700 p-3 text-left font-semibold">
                    Taux d'équilibre
                    <br />
                    (après transition)
                  </th>
                  <th className="border border-gray-300 dark:border-gray-700 p-3 text-left font-semibold">
                    Période de transition
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-gray-300 dark:border-gray-700 p-3">
                    Électricité
                  </td>
                  <td className="border border-gray-300 dark:border-gray-700 p-3">
                    +6,9 %/an
                  </td>
                  <td className="border border-gray-300 dark:border-gray-700 p-3">
                    +2,5 %/an
                  </td>
                  <td className="border border-gray-300 dark:border-gray-700 p-3">
                    5 ans
                  </td>
                </tr>
                <tr>
                  <td className="border border-gray-300 dark:border-gray-700 p-3">
                    Gaz naturel
                  </td>
                  <td className="border border-gray-300 dark:border-gray-700 p-3">
                    +8,7 %/an
                  </td>
                  <td className="border border-gray-300 dark:border-gray-700 p-3">
                    +3,5 %/an
                  </td>
                  <td className="border border-gray-300 dark:border-gray-700 p-3">
                    5 ans
                  </td>
                </tr>
                <tr>
                  <td className="border border-gray-300 dark:border-gray-700 p-3">
                    Fioul / GPL
                  </td>
                  <td className="border border-gray-300 dark:border-gray-700 p-3">
                    +7,2 %/an
                  </td>
                  <td className="border border-gray-300 dark:border-gray-700 p-3">
                    +2,5 %/an
                  </td>
                  <td className="border border-gray-300 dark:border-gray-700 p-3">
                    5 ans
                  </td>
                </tr>
                <tr>
                  <td className="border border-gray-300 dark:border-gray-700 p-3">
                    Bois / Pellets
                  </td>
                  <td className="border border-gray-300 dark:border-gray-700 p-3">
                    +3,4 %/an
                  </td>
                  <td className="border border-gray-300 dark:border-gray-700 p-3">
                    +2,0 %/an
                  </td>
                  <td className="border border-gray-300 dark:border-gray-700 p-3">
                    5 ans
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <h3 className="text-xl font-semibold mt-6 mb-3">
            6.3 Fonctionnement du modèle
          </h3>
          <p className="mb-4">Le modèle applique une évolution progressive :</p>
          <ul className="list-disc pl-6 space-y-2 mb-4">
            <li>
              <strong>Années 1-5</strong> : Taux récent appliqué (forte
              croissance observée actuellement)
            </li>
            <li>
              <strong>Années 6-10</strong> : Transition progressive vers le taux
              d'équilibre
            </li>
            <li>
              <strong>Années 11+</strong> : Taux d'équilibre stabilisé
              (croissance modérée long terme)
            </li>
          </ul>

          <div className="bg-muted/30 p-4 rounded-lg mb-4 font-mono text-sm">
            <p>
              <strong>Exemple - Évolution électricité :</strong>
            </p>
            <ul className="list-disc pl-6 space-y-1 mt-2">
              <li>Prix année 0 : 0,2516 €/kWh</li>
              <li>Prix année 1 : 0,2516 × 1,069 = 0,2690 €/kWh (+6,9%)</li>
              <li>Prix année 5 : ~0,3467 €/kWh</li>
              <li>Prix année 10 : ~0,4128 €/kWh (transition vers +2,5%)</li>
              <li>Prix année 17 : ~0,5083 €/kWh (+2,5%/an stabilisé)</li>
            </ul>
          </div>

          <p className="mb-4 text-sm italic">
            Note : Seuls les <strong>coûts variables</strong> (énergie) évoluent
            avec le temps. Les <strong>coûts fixes</strong> (abonnements,
            entretien) restent constants en euros constants.
          </p>
        </section>

        {/* 7. Économies annuelles */}
        <section id="economies-annuelles" className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">
            7. Économies annuelles
          </h2>

          <h3 className="text-xl font-semibold mt-6 mb-3">
            7.1 Économies annuelles moyennes (hors investissement)
          </h3>
          <p className="mb-4">
            Les économies annuelles moyennes représentent la différence moyenne
            entre le coût du chauffage actuel et le coût avec PAC, calculée sur
            toute la durée de vie de la PAC (17 ans par défaut).
          </p>
          <div className="bg-muted/30 p-4 rounded-lg mb-4 font-mono text-sm">
            <p>
              <strong>Formule :</strong>
            </p>
            <p>
              Économies moyennes = Σ(Coût actuel année i - Coût PAC année i) ÷
              Durée de vie
            </p>
            <br />
            <p>
              <strong>Exemple sur 17 ans :</strong>
            </p>
            <p>
              (2400€ - 1748€) année 1 + (2566€ - 1869€) année 2 + ... + (4163€ -
              2877€) année 17
            </p>
            <p>
              = 27 472 € d'économies totales ÷ 17 ans = 1616 €/an en moyenne
            </p>
          </div>
          <p className="mb-4">
            Cette métrique est importante car elle donne une vision réaliste des
            économies attendues, en tenant compte de l'évolution différente des
            prix de l'énergie actuelle et de l'électricité.
          </p>

          <h3 className="text-xl font-semibold mt-6 mb-3">
            7.2 Économies mensuelles
          </h3>
          <div className="bg-muted/30 p-4 rounded-lg mb-4 font-mono text-sm">
            <p>
              <strong>Formule :</strong>
            </p>
            <p>Économies mensuelles = Économies annuelles moyennes ÷ 12</p>
            <br />
            <p>
              <strong>Exemple :</strong>
            </p>
            <p>1616 €/an ÷ 12 = 135 €/mois</p>
          </div>
        </section>

        {/* 8. Rentabilité */}
        <section id="rentabilite" className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">
            8. Rentabilité et retour sur investissement
          </h2>

          <h3 className="text-xl font-semibold mt-6 mb-3">
            8.1 Investissement net (reste à charge)
          </h3>
          <div className="bg-muted/30 p-4 rounded-lg mb-4 font-mono text-sm">
            <p>
              <strong>Formule :</strong>
            </p>
            <p>Reste à charge = Coût total du projet - Total des aides</p>
            <br />
            <p>
              <strong>Détail :</strong>
            </p>
            <ul className="list-disc pl-6 space-y-1 mt-2">
              <li>Coût total = Coût PAC + Installation + Travaux annexes</li>
              <li>Aides = MaPrimeRénov' + CEE + Autres aides</li>
            </ul>
            <br />
            <p>
              <strong>Exemple :</strong>
            </p>
            <p>
              15 000 € (coût total) - 5 000 € (aides) = 10 000 € (reste à
              charge)
            </p>
          </div>

          <h3 className="text-xl font-semibold mt-6 mb-3">
            8.2 Période de retour sur investissement (ROI)
          </h3>
          <p className="mb-4">
            Le ROI (Return On Investment) correspond au nombre d'années
            nécessaire pour que les économies cumulées égalent l'investissement
            net.
          </p>
          <div className="bg-muted/30 p-4 rounded-lg mb-4 font-mono text-sm">
            <p>
              <strong>Méthode de calcul :</strong>
            </p>
            <ol className="list-decimal pl-6 space-y-2 mt-2">
              <li>
                Calculer les économies année par année (avec évolution des prix)
              </li>
              <li>Cumuler les économies jusqu'à atteindre le reste à charge</li>
              <li>
                Utiliser une interpolation linéaire pour plus de précision
              </li>
            </ol>
            <br />
            <p>
              <strong>Exemple :</strong>
            </p>
            <p>Reste à charge : 10 000 €</p>
            <p>Économies année 1 : 652 € → Cumulé : 652 €</p>
            <p>Économies année 2 : 697 € → Cumulé : 1349 €</p>
            <p>...</p>
            <p>Économies année 10 : 1286 € → Cumulé : 10 237 €</p>
            <p>
              <strong>→ ROI atteint en 9,8 ans</strong>
            </p>
          </div>

          <h3 className="text-xl font-semibold mt-6 mb-3">
            8.3 Taux de rentabilité annuel moyen
          </h3>
          <p className="mb-4">
            Le taux de rentabilité annuel permet de comparer le projet à
            d'autres investissements.
          </p>
          <div className="bg-muted/30 p-4 rounded-lg mb-4 font-mono text-sm">
            <p>
              <strong>Formule :</strong>
            </p>
            <p>
              Taux = ((Valeur finale / Investissement initial)^(1/durée) - 1) ×
              100
            </p>
            <br />
            <p>Avec :</p>
            <ul className="list-disc pl-6 space-y-1 mt-2">
              <li>
                Valeur finale = Investissement + Gain net sur durée de vie
              </li>
              <li>Gain net = Économies totales - Investissement</li>
            </ul>
            <br />
            <p>
              <strong>Exemple :</strong>
            </p>
            <p>Investissement : 10 000 €</p>
            <p>Économies totales sur 17 ans : 27 472 €</p>
            <p>Gain net : 27 472 € - 10 000 € = 17 472 €</p>
            <p>Valeur finale : 10 000 € + 17 472 € = 27 472 €</p>
            <p>
              Taux = ((27 472 / 10 000)^(1/17) - 1) × 100 ={" "}
              <strong>6,2 %/an</strong>
            </p>
          </div>

          <h3 className="text-xl font-semibold mt-6 mb-3">
            8.4 Gain net sur durée de vie
          </h3>
          <div className="bg-muted/30 p-4 rounded-lg mb-4 font-mono text-sm">
            <p>
              <strong>Formule :</strong>
            </p>
            <p>
              Gain net = Coût total actuel (17 ans) - (Investissement + Coût
              total PAC (17 ans))
            </p>
            <br />
            <p>
              <strong>Exemple :</strong>
            </p>
            <p>Coût total actuel : 50 789 €</p>
            <p>Coût total PAC : 10 000 € + 12 317 € = 23 317 €</p>
            <p>
              Gain net : 50 789 € - 23 317 € = <strong>17 472 €</strong>
            </p>
          </div>
        </section>

        {/* 9. Impact du financement */}
        <section id="financement" className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">
            9. Impact du financement
          </h2>

          <h3 className="text-xl font-semibold mt-6 mb-3">
            9.1 Mensualité de crédit
          </h3>
          <p className="mb-4">
            Pour un financement par crédit, la mensualité est calculée selon la
            formule bancaire standard :
          </p>
          <div className="bg-muted/30 p-4 rounded-lg mb-4 font-mono text-sm">
            <p>
              <strong>Formule :</strong>
            </p>
            <p>
              Mensualité = Capital × (Taux mensuel / (1 - (1 + Taux
              mensuel)^(-Durée en mois)))
            </p>
            <br />
            <p>Avec :</p>
            <ul className="list-disc pl-6 space-y-1 mt-2">
              <li>Taux mensuel = Taux annuel / 12</li>
            </ul>
            <br />
            <p>
              <strong>Exemple :</strong>
            </p>
            <p>Capital : 10 000 €</p>
            <p>Taux annuel : 3,5 %</p>
            <p>Durée : 60 mois (5 ans)</p>
            <p>Taux mensuel : 3,5% / 12 = 0,2917%</p>
            <p>
              Mensualité = 10 000 × (0,002917 / (1 - (1,002917)^(-60))) ={" "}
              <strong>181,54 €/mois</strong>
            </p>
          </div>

          <h3 className="text-xl font-semibold mt-6 mb-3">
            9.2 Coût total du crédit
          </h3>
          <div className="bg-muted/30 p-4 rounded-lg mb-4 font-mono text-sm">
            <p>
              <strong>Formule :</strong>
            </p>
            <p>Coût total = Mensualité × Durée en mois</p>
            <br />
            <p>
              <strong>Exemple :</strong>
            </p>
            <p>181,54 € × 60 mois = 10 892,40 €</p>
            <p>
              Dont intérêts : 10 892,40 € - 10 000 € = <strong>892,40 €</strong>
            </p>
          </div>

          <h3 className="text-xl font-semibold mt-6 mb-3">
            9.3 Investissement réel avec crédit
          </h3>
          <p className="mb-4">
            Pour le calcul du ROI en cas de financement par crédit,
            l'investissement réel prend en compte les intérêts :
          </p>
          <div className="bg-muted/30 p-4 rounded-lg mb-4 font-mono text-sm">
            <p>
              <strong>Formules selon le mode de financement :</strong>
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>
                <strong>Comptant</strong> : Investissement réel = Reste à charge
              </li>
              <li>
                <strong>Crédit</strong> : Investissement réel = Coût total du
                crédit
              </li>
              <li>
                <strong>Mixte</strong> : Investissement réel = Apport personnel
                + Coût total du crédit
              </li>
            </ul>
            <br />
            <p>
              <strong>Exemple crédit :</strong>
            </p>
            <p>Reste à charge : 10 000 €</p>
            <p>Coût total crédit : 10 892,40 €</p>
            <p>
              Investissement réel = 10 892,40 € (utilisé pour calculer le ROI)
            </p>
          </div>
        </section>

        {/* 10. Hypothèses et limites */}
        <section id="hypotheses" className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">
            10. Hypothèses et limites
          </h2>

          <h3 className="text-xl font-semibold mt-6 mb-3">
            10.1 Hypothèses principales
          </h3>
          <ul className="list-disc pl-6 space-y-2 mb-4">
            <li>
              <strong>Besoins énergétiques constants</strong> : Les besoins de
              chauffage sont supposés identiques chaque année (même surface,
              même occupation, même isolation)
            </li>
            <li>
              <strong>Évolution des prix</strong> : Le modèle Mean Reversion est
              basé sur l'historique long terme mais ne peut prédire les chocs
              ponctuels (crises géopolitiques, catastrophes naturelles, etc.)
            </li>
            <li>
              <strong>Performance de la PAC</strong> : Le COP est supposé
              constant sur toute la durée de vie (en pratique, il peut
              légèrement diminuer avec le temps)
            </li>
            <li>
              <strong>Température de départ</strong> : Elle est automatiquement
              déduite du type d'émetteur selon les standards techniques :
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>Plancher chauffant : 35°C</li>
                <li>Radiateurs basse température : 45°C</li>
                <li>Ventilo-convecteurs : 45°C</li>
                <li>Radiateurs moyenne température : 55°C</li>
                <li>Radiateurs haute température : 65°C</li>
              </ul>
              Cette simplification évite les incohérences entre type d'émetteur
              et température, tout en restant fidèle aux pratiques du secteur.
            </li>
            <li>
              <strong>Durée de vie</strong> : 17 ans est une moyenne ; la durée
              réelle dépend de la qualité de l'installation et de l'entretien
            </li>
            <li>
              <strong>Coûts fixes constants</strong> : Les abonnements et coûts
              d'entretien sont exprimés en euros constants (pas d'inflation
              appliquée)
            </li>
          </ul>

          <h3 className="text-xl font-semibold mt-6 mb-3">
            10.2 Limites du calculateur
          </h3>
          <ul className="list-disc pl-6 space-y-2 mb-4">
            <li>
              Le calculateur ne prend pas en compte les éventuelles rénovations
              énergétiques futures (isolation, fenêtres) qui réduiraient les
              besoins
            </li>
            <li>
              Les aides financières évoluent selon la réglementation ; les
              montants affichés sont indicatifs
            </li>
            <li>
              Le calcul ne tient pas compte d'éventuels travaux de réparation ou
              de remplacement anticipé
            </li>
            <li>
              Les tarifs d'énergie peuvent varier selon le fournisseur et
              l'offre choisie
            </li>
          </ul>

          <h3 className="text-xl font-semibold mt-6 mb-3">
            10.3 Recommandations
          </h3>
          <p className="mb-4">Pour obtenir une estimation fiable :</p>
          <ul className="list-disc pl-6 space-y-2 mb-4">
            <li>
              Renseignez votre consommation réelle à partir de vos factures
              (évitez les estimations)
            </li>
            <li>
              Demandez plusieurs devis professionnels pour le coût
              d'installation
            </li>
            <li>
              Vérifiez votre éligibilité aux aides avec un conseiller France
              Rénov'
            </li>
            <li>
              Assurez-vous que votre logement est correctement isolé avant
              d'installer une PAC
            </li>
            <li>
              Faites réaliser une étude thermique pour dimensionner correctement
              la PAC
            </li>
          </ul>
        </section>

        {/* Contact et mise à jour */}
        <section className="mb-8 bg-muted/30 p-4 rounded-lg">
          <h2 className="text-xl font-semibold mb-3">
            Questions ou suggestions ?
          </h2>
          <p className="mb-3">
            Cette méthodologie est régulièrement mise à jour pour refléter les
            meilleures pratiques et les données les plus récentes.
          </p>
          <p>
            Pour toute question sur nos calculs ou pour signaler une erreur,
            contactez-nous via{" "}
            <a
              href="/contact"
              className="text-primary hover:underline"
            >
              la page contact
            </a>
          </p>
        </section>
      </CardContent>
    </Card>
  );
}
