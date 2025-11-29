import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"

export const metadata = {
  title: "Méthodologie de Calcul | ThermoGain",
  description: "Méthodologie complète des calculs de rentabilité de pompes à chaleur",
}

export default function MethodologiePage() {
  return (
    <div className="container mx-auto py-8 max-w-5xl px-4">
      <div className="mb-6">
        <Link href="/">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour à l'accueil
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-3xl">Méthodologie de Calcul</CardTitle>
          <CardDescription>
            Explication détaillée de nos méthodes de calcul pour l'analyse de rentabilité des pompes à chaleur
          </CardDescription>
        </CardHeader>
        <CardContent className="prose prose-sm max-w-none dark:prose-invert">
          <p className="text-muted-foreground mb-6">
            Dernière mise à jour : {new Date().toLocaleDateString("fr-FR", { year: "numeric", month: "long", day: "numeric" })}
          </p>

          {/* Table des matières */}
          <section className="mb-8 bg-muted/30 p-4 rounded-lg">
            <h2 className="text-xl font-semibold mb-3">Table des matières</h2>
            <ol className="list-decimal pl-6 space-y-1">
              <li><a href="#introduction" className="text-primary hover:underline">Introduction</a></li>
              <li><a href="#donnees-sources" className="text-primary hover:underline">Sources de données</a></li>
              <li><a href="#conversions-energetiques" className="text-primary hover:underline">Conversions énergétiques</a></li>
              <li><a href="#cout-chauffage-actuel" className="text-primary hover:underline">Coût du chauffage actuel</a></li>
              <li><a href="#cout-pac" className="text-primary hover:underline">Coût avec pompe à chaleur</a></li>
              <li><a href="#evolution-prix" className="text-primary hover:underline">Évolution des prix de l'énergie</a></li>
              <li><a href="#economies-annuelles" className="text-primary hover:underline">Économies annuelles</a></li>
              <li><a href="#rentabilite" className="text-primary hover:underline">Rentabilité et retour sur investissement</a></li>
              <li><a href="#financement" className="text-primary hover:underline">Impact du financement</a></li>
              <li><a href="#hypotheses" className="text-primary hover:underline">Hypothèses et limites</a></li>
            </ol>
          </section>

          {/* 1. Introduction */}
          <section id="introduction" className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
            <p className="mb-4">
              ThermoGain utilise une méthodologie rigoureuse pour estimer la rentabilité d'un projet de pompe à chaleur (PAC).
              Nos calculs s'appuient sur des données officielles, des modèles économétriques validés et des normes du secteur.
            </p>
            <p className="mb-4">
              Cette page détaille chaque calcul effectué, les formules utilisées, et les sources de données pour assurer
              la transparence et la fiabilité de nos estimations.
            </p>
          </section>

          {/* 2. Sources de données */}
          <section id="donnees-sources" className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">2. Sources de données</h2>

            <h3 className="text-xl font-semibold mt-6 mb-3">2.1 Prix de l'énergie</h3>
            <p className="mb-4">
              Les prix moyens de l'énergie sont issus de l'<strong>API DIDO du Service des Données et Études Statistiques (SDES)</strong>,
              service du Ministère de la Transition Écologique.
            </p>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li><strong>Électricité</strong> : Prix moyen TTC résidentiel, tarif Base (dataset avec 18+ ans d'historique)</li>
              <li><strong>Gaz naturel</strong> : Prix moyen TTC résidentiel (dataset avec 18+ ans d'historique)</li>
              <li><strong>Fioul domestique</strong> : Prix moyen TTC à la livraison (dataset avec 42+ ans d'historique)</li>
              <li><strong>Bois et pellets</strong> : Prix moyen TTC résidentiel (dataset avec 18+ ans d'historique)</li>
            </ul>
            <p className="mb-4 text-sm italic">
              Source : <a href="https://data.economie.gouv.fr/explore/?refine.publisher=SDES" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">data.economie.gouv.fr</a>
            </p>

            <h3 className="text-xl font-semibold mt-6 mb-3">2.2 Tarifs d'abonnement électrique</h3>
            <p className="mb-4">
              Les tarifs d'abonnement électrique sont basés sur les <strong>Tarifs Réglementés de Vente (TRV) d'EDF</strong> pour 2024 :
            </p>
            <div className="overflow-x-auto mb-4">
              <table className="w-full border-collapse border border-gray-300 dark:border-gray-700 text-sm">
                <thead>
                  <tr className="bg-muted">
                    <th className="border border-gray-300 dark:border-gray-700 p-3 text-left font-semibold">Puissance souscrite</th>
                    <th className="border border-gray-300 dark:border-gray-700 p-3 text-left font-semibold">Abonnement annuel TTC</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td className="border border-gray-300 dark:border-gray-700 p-3">3 kVA</td><td className="border border-gray-300 dark:border-gray-700 p-3">112,86 €/an</td></tr>
                  <tr><td className="border border-gray-300 dark:border-gray-700 p-3">6 kVA</td><td className="border border-gray-300 dark:border-gray-700 p-3">151,20 €/an</td></tr>
                  <tr><td className="border border-gray-300 dark:border-gray-700 p-3">9 kVA</td><td className="border border-gray-300 dark:border-gray-700 p-3">189,60 €/an</td></tr>
                  <tr><td className="border border-gray-300 dark:border-gray-700 p-3">12 kVA</td><td className="border border-gray-300 dark:border-gray-700 p-3">228,24 €/an</td></tr>
                  <tr><td className="border border-gray-300 dark:border-gray-700 p-3">15 kVA</td><td className="border border-gray-300 dark:border-gray-700 p-3">265,56 €/an</td></tr>
                  <tr><td className="border border-gray-300 dark:border-gray-700 p-3">18 kVA</td><td className="border border-gray-300 dark:border-gray-700 p-3">301,08 €/an</td></tr>
                </tbody>
              </table>
            </div>
            <p className="mb-4 text-sm italic">
              Source : <a href="https://particulier.edf.fr/fr/accueil/gestion-contrat/options/base.html" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">EDF - Tarif Bleu Base 2024</a>
            </p>

            <h3 className="text-xl font-semibold mt-6 mb-3">2.3 Coefficients de performance (COP)</h3>
            <p className="mb-4">
              Le COP (Coefficient de Performance) représente le rapport entre l'énergie thermique produite et l'énergie électrique consommée.
              Les valeurs typiques selon l'ADEME :
            </p>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li><strong>PAC Air/Air</strong> : COP de 3 à 4 (moyenne : 3,5)</li>
              <li><strong>PAC Air/Eau</strong> : COP de 2,5 à 3,5 (moyenne : 3)</li>
              <li><strong>PAC Eau/Eau (géothermie)</strong> : COP de 4 à 5 (moyenne : 4,5)</li>
            </ul>
            <p className="mb-4 text-sm italic">
              Source : <a href="https://www.ademe.fr/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">ADEME - Guide des pompes à chaleur</a>
            </p>

            <h3 className="text-xl font-semibold mt-6 mb-3">2.4 Durée de vie des équipements</h3>
            <p className="mb-4">
              La durée de vie moyenne d'une pompe à chaleur est estimée à <strong>17 ans</strong> selon les études de l'ADEME.
              Cette valeur est utilisée par défaut pour toutes les projections long terme.
            </p>
          </section>

          {/* 3. Conversions énergétiques */}
          <section id="conversions-energetiques" className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">3. Conversions énergétiques</h2>
            <p className="mb-4">
              Pour comparer les différentes énergies et calculer les besoins de chauffage en kWh, nous utilisons les facteurs de conversion suivants :
            </p>
            <div className="overflow-x-auto mb-4">
              <table className="w-full border-collapse border border-gray-300 dark:border-gray-700 text-sm">
                <thead>
                  <tr className="bg-muted">
                    <th className="border border-gray-300 dark:border-gray-700 p-3 text-left font-semibold">Énergie</th>
                    <th className="border border-gray-300 dark:border-gray-700 p-3 text-left font-semibold">Unité</th>
                    <th className="border border-gray-300 dark:border-gray-700 p-3 text-left font-semibold">Équivalent kWh</th>
                    <th className="border border-gray-300 dark:border-gray-700 p-3 text-left font-semibold">Source</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-gray-300 dark:border-gray-700 p-3">Fioul domestique</td>
                    <td className="border border-gray-300 dark:border-gray-700 p-3">1 litre</td>
                    <td className="border border-gray-300 dark:border-gray-700 p-3">10 kWh</td>
                    <td className="border border-gray-300 dark:border-gray-700 p-3">ADEME</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 dark:border-gray-700 p-3">Gaz naturel</td>
                    <td className="border border-gray-300 dark:border-gray-700 p-3">Direct</td>
                    <td className="border border-gray-300 dark:border-gray-700 p-3">kWh PCI</td>
                    <td className="border border-gray-300 dark:border-gray-700 p-3">Facture fournisseur</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 dark:border-gray-700 p-3">GPL (propane)</td>
                    <td className="border border-gray-300 dark:border-gray-700 p-3">1 kg</td>
                    <td className="border border-gray-300 dark:border-gray-700 p-3">12,8 kWh</td>
                    <td className="border border-gray-300 dark:border-gray-700 p-3">ADEME</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 dark:border-gray-700 p-3">Pellets (granulés)</td>
                    <td className="border border-gray-300 dark:border-gray-700 p-3">1 kg</td>
                    <td className="border border-gray-300 dark:border-gray-700 p-3">4,8 kWh</td>
                    <td className="border border-gray-300 dark:border-gray-700 p-3">ADEME</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 dark:border-gray-700 p-3">Bois (bûches)</td>
                    <td className="border border-gray-300 dark:border-gray-700 p-3">1 stère</td>
                    <td className="border border-gray-300 dark:border-gray-700 p-3">1800 kWh</td>
                    <td className="border border-gray-300 dark:border-gray-700 p-3">ADEME</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 dark:border-gray-700 p-3">Électricité</td>
                    <td className="border border-gray-300 dark:border-gray-700 p-3">Direct</td>
                    <td className="border border-gray-300 dark:border-gray-700 p-3">kWh</td>
                    <td className="border border-gray-300 dark:border-gray-700 p-3">Compteur électrique</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* 4. Coût du chauffage actuel */}
          <section id="cout-chauffage-actuel" className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">4. Coût du chauffage actuel</h2>

            <h3 className="text-xl font-semibold mt-6 mb-3">4.1 Coûts variables (énergie)</h3>
            <p className="mb-4">
              Le coût variable annuel correspond au coût de l'énergie consommée pour le chauffage.
            </p>
            <div className="bg-muted/30 p-4 rounded-lg mb-4 font-mono text-sm">
              <p><strong>Formule :</strong></p>
              <p>Coût variable = Consommation × Prix unitaire</p>
              <br />
              <p><strong>Exemples :</strong></p>
              <ul className="list-disc pl-6 space-y-1 mt-2">
                <li>Fioul : 2000 litres × 1,20 €/L = 2400 €/an</li>
                <li>Gaz : 15000 kWh × 0,12 €/kWh = 1800 €/an</li>
                <li>Électricité : 8000 kWh × 0,25 €/kWh = 2000 €/an</li>
              </ul>
            </div>

            <h3 className="text-xl font-semibold mt-6 mb-3">4.2 Coûts fixes</h3>
            <p className="mb-4">
              Les coûts fixes incluent les frais récurrents indépendants de la consommation :
            </p>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li><strong>Abonnement électrique</strong> : Selon la puissance souscrite (voir tableau section 2.2)</li>
              <li><strong>Abonnement gaz</strong> : Uniquement pour le chauffage au gaz (~120 €/an en moyenne)</li>
              <li><strong>Entretien annuel</strong> : Coût d'entretien du système actuel
                <ul className="list-disc pl-6 mt-2 space-y-1">
                  <li>Chaudière gaz : ~120 €/an (entretien obligatoire)</li>
                  <li>Chaudière fioul : ~150 €/an (entretien + ramonage)</li>
                  <li>Chaudière GPL : ~130 €/an</li>
                  <li>Poêle à granulés : ~100 €/an</li>
                  <li>Poêle à bois : ~80 €/an (ramonage)</li>
                  <li>Radiateurs électriques : 0 €/an (pas d'entretien obligatoire)</li>
                </ul>
              </li>
            </ul>

            <div className="bg-muted/30 p-4 rounded-lg mb-4 font-mono text-sm">
              <p><strong>Formule coût total :</strong></p>
              <p>Coût annuel actuel = Coût variable + Abonnement électrique + Abonnement gaz + Entretien</p>
            </div>
          </section>

          {/* 5. Coût avec PAC */}
          <section id="cout-pac" className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">5. Coût avec pompe à chaleur</h2>

            <h3 className="text-xl font-semibold mt-6 mb-3">5.1 Calcul des besoins énergétiques</h3>
            <p className="mb-4">
              Les besoins énergétiques du logement sont calculés à partir de la consommation actuelle convertie en kWh.
            </p>
            <div className="bg-muted/30 p-4 rounded-lg mb-4 font-mono text-sm">
              <p><strong>Formule :</strong></p>
              <p>Besoins (kWh) = Consommation actuelle convertie en kWh</p>
              <br />
              <p><strong>Exemple avec fioul :</strong></p>
              <p>2000 litres × 10 kWh/L = 20 000 kWh de besoins annuels</p>
            </div>

            <h3 className="text-xl font-semibold mt-6 mb-3">5.2 Consommation électrique de la PAC</h3>
            <p className="mb-4">
              La PAC consomme moins d'électricité que les besoins grâce à son COP (elle récupère de l'énergie gratuite dans l'air ou le sol).
            </p>
            <div className="bg-muted/30 p-4 rounded-lg mb-4 font-mono text-sm">
              <p><strong>Formule :</strong></p>
              <p>Consommation PAC (kWh) = Besoins énergétiques (kWh) ÷ COP</p>
              <br />
              <p><strong>Exemple :</strong></p>
              <p>20 000 kWh ÷ 3,5 (COP) = 5714 kWh d'électricité consommée</p>
              <br />
              <p className="text-xs">Note : Pour 1 kWh d'électricité consommé, la PAC produit 3,5 kWh de chaleur</p>
            </div>

            <h3 className="text-xl font-semibold mt-6 mb-3">5.3 Coût variable avec PAC</h3>
            <div className="bg-muted/30 p-4 rounded-lg mb-4 font-mono text-sm">
              <p><strong>Formule :</strong></p>
              <p>Coût variable PAC = Consommation PAC (kWh) × Prix électricité (€/kWh)</p>
              <br />
              <p><strong>Exemple :</strong></p>
              <p>5714 kWh × 0,2516 €/kWh = 1438 €/an</p>
            </div>

            <h3 className="text-xl font-semibold mt-6 mb-3">5.4 Coûts fixes avec PAC</h3>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li><strong>Abonnement électrique augmenté</strong> : La PAC nécessite généralement une puissance souscrite plus élevée (9 ou 12 kVA au lieu de 6 kVA)</li>
              <li><strong>Entretien PAC</strong> : Entretien annuel obligatoire (~120 €/an en moyenne)</li>
              <li><strong>Suppression abonnement gaz</strong> : Si remplacement d'une chaudière gaz, l'abonnement gaz est supprimé (économie)</li>
            </ul>

            <div className="bg-muted/30 p-4 rounded-lg mb-4 font-mono text-sm">
              <p><strong>Formule coût total PAC :</strong></p>
              <p>Coût annuel PAC = Coût variable PAC + Abonnement électrique PAC + Entretien PAC</p>
              <br />
              <p><strong>Exemple complet :</strong></p>
              <p>1438 € (électricité) + 189,60 € (abonnement 9 kVA) + 120 € (entretien) = 1747,60 €/an</p>
            </div>
          </section>

          {/* 6. Évolution des prix */}
          <section id="evolution-prix" className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">6. Évolution des prix de l'énergie</h2>

            <h3 className="text-xl font-semibold mt-6 mb-3">6.1 Modèle Mean Reversion (nouveau - décembre 2024)</h3>
            <p className="mb-4">
              Depuis décembre 2024, ThermoGain utilise un <strong>modèle économétrique Mean Reversion</strong> basé sur l'historique complet
              de l'API DIDO-SDES (18 à 42 ans de données selon l'énergie).
            </p>
            <p className="mb-4">
              Ce modèle reflète la tendance naturelle des prix de l'énergie à revenir vers un taux d'équilibre long terme après des périodes
              de forte volatilité.
            </p>

            <h3 className="text-xl font-semibold mt-6 mb-3">6.2 Paramètres du modèle par énergie</h3>
            <div className="overflow-x-auto mb-4">
              <table className="w-full border-collapse border border-gray-300 dark:border-gray-700 text-sm">
                <thead>
                  <tr className="bg-muted">
                    <th className="border border-gray-300 dark:border-gray-700 p-3 text-left font-semibold">Énergie</th>
                    <th className="border border-gray-300 dark:border-gray-700 p-3 text-left font-semibold">Taux récent<br/>(5 premières années)</th>
                    <th className="border border-gray-300 dark:border-gray-700 p-3 text-left font-semibold">Taux d'équilibre<br/>(après transition)</th>
                    <th className="border border-gray-300 dark:border-gray-700 p-3 text-left font-semibold">Période de transition</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-gray-300 dark:border-gray-700 p-3">Électricité</td>
                    <td className="border border-gray-300 dark:border-gray-700 p-3">+6,9 %/an</td>
                    <td className="border border-gray-300 dark:border-gray-700 p-3">+2,5 %/an</td>
                    <td className="border border-gray-300 dark:border-gray-700 p-3">5 ans</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 dark:border-gray-700 p-3">Gaz naturel</td>
                    <td className="border border-gray-300 dark:border-gray-700 p-3">+8,7 %/an</td>
                    <td className="border border-gray-300 dark:border-gray-700 p-3">+3,5 %/an</td>
                    <td className="border border-gray-300 dark:border-gray-700 p-3">5 ans</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 dark:border-gray-700 p-3">Fioul / GPL</td>
                    <td className="border border-gray-300 dark:border-gray-700 p-3">+7,2 %/an</td>
                    <td className="border border-gray-300 dark:border-gray-700 p-3">+2,5 %/an</td>
                    <td className="border border-gray-300 dark:border-gray-700 p-3">5 ans</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 dark:border-gray-700 p-3">Bois / Pellets</td>
                    <td className="border border-gray-300 dark:border-gray-700 p-3">+3,4 %/an</td>
                    <td className="border border-gray-300 dark:border-gray-700 p-3">+2,0 %/an</td>
                    <td className="border border-gray-300 dark:border-gray-700 p-3">5 ans</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h3 className="text-xl font-semibold mt-6 mb-3">6.3 Fonctionnement du modèle</h3>
            <p className="mb-4">
              Le modèle applique une évolution progressive :
            </p>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li><strong>Années 1-5</strong> : Taux récent appliqué (forte croissance observée actuellement)</li>
              <li><strong>Années 6-10</strong> : Transition progressive vers le taux d'équilibre</li>
              <li><strong>Années 11+</strong> : Taux d'équilibre stabilisé (croissance modérée long terme)</li>
            </ul>

            <div className="bg-muted/30 p-4 rounded-lg mb-4 font-mono text-sm">
              <p><strong>Exemple - Évolution électricité :</strong></p>
              <ul className="list-disc pl-6 space-y-1 mt-2">
                <li>Prix année 0 : 0,2516 €/kWh</li>
                <li>Prix année 1 : 0,2516 × 1,069 = 0,2690 €/kWh (+6,9%)</li>
                <li>Prix année 5 : ~0,3467 €/kWh</li>
                <li>Prix année 10 : ~0,4128 €/kWh (transition vers +2,5%)</li>
                <li>Prix année 17 : ~0,5083 €/kWh (+2,5%/an stabilisé)</li>
              </ul>
            </div>

            <p className="mb-4 text-sm italic">
              Note : Seuls les <strong>coûts variables</strong> (énergie) évoluent avec le temps.
              Les <strong>coûts fixes</strong> (abonnements, entretien) restent constants en euros constants.
            </p>
          </section>

          {/* 7. Économies annuelles */}
          <section id="economies-annuelles" className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">7. Économies annuelles</h2>

            <h3 className="text-xl font-semibold mt-6 mb-3">7.1 Économies annuelles moyennes (hors investissement)</h3>
            <p className="mb-4">
              Les économies annuelles moyennes représentent la différence moyenne entre le coût du chauffage actuel et le coût avec PAC,
              calculée sur toute la durée de vie de la PAC (17 ans par défaut).
            </p>
            <div className="bg-muted/30 p-4 rounded-lg mb-4 font-mono text-sm">
              <p><strong>Formule :</strong></p>
              <p>Économies moyennes = Σ(Coût actuel année i - Coût PAC année i) ÷ Durée de vie</p>
              <br />
              <p><strong>Exemple sur 17 ans :</strong></p>
              <p>(2400€ - 1748€) année 1 + (2566€ - 1869€) année 2 + ... + (4163€ - 2877€) année 17</p>
              <p>= 27 472 € d'économies totales ÷ 17 ans = 1616 €/an en moyenne</p>
            </div>
            <p className="mb-4">
              Cette métrique est importante car elle donne une vision réaliste des économies attendues, en tenant compte de l'évolution
              différente des prix de l'énergie actuelle et de l'électricité.
            </p>

            <h3 className="text-xl font-semibold mt-6 mb-3">7.2 Économies mensuelles</h3>
            <div className="bg-muted/30 p-4 rounded-lg mb-4 font-mono text-sm">
              <p><strong>Formule :</strong></p>
              <p>Économies mensuelles = Économies annuelles moyennes ÷ 12</p>
              <br />
              <p><strong>Exemple :</strong></p>
              <p>1616 €/an ÷ 12 = 135 €/mois</p>
            </div>
          </section>

          {/* 8. Rentabilité */}
          <section id="rentabilite" className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">8. Rentabilité et retour sur investissement</h2>

            <h3 className="text-xl font-semibold mt-6 mb-3">8.1 Investissement net (reste à charge)</h3>
            <div className="bg-muted/30 p-4 rounded-lg mb-4 font-mono text-sm">
              <p><strong>Formule :</strong></p>
              <p>Reste à charge = Coût total du projet - Total des aides</p>
              <br />
              <p><strong>Détail :</strong></p>
              <ul className="list-disc pl-6 space-y-1 mt-2">
                <li>Coût total = Coût PAC + Installation + Travaux annexes</li>
                <li>Aides = MaPrimeRénov' + CEE + Autres aides</li>
              </ul>
              <br />
              <p><strong>Exemple :</strong></p>
              <p>15 000 € (coût total) - 5 000 € (aides) = 10 000 € (reste à charge)</p>
            </div>

            <h3 className="text-xl font-semibold mt-6 mb-3">8.2 Période de retour sur investissement (ROI)</h3>
            <p className="mb-4">
              Le ROI (Return On Investment) correspond au nombre d'années nécessaire pour que les économies cumulées
              égalent l'investissement net.
            </p>
            <div className="bg-muted/30 p-4 rounded-lg mb-4 font-mono text-sm">
              <p><strong>Méthode de calcul :</strong></p>
              <ol className="list-decimal pl-6 space-y-2 mt-2">
                <li>Calculer les économies année par année (avec évolution des prix)</li>
                <li>Cumuler les économies jusqu'à atteindre le reste à charge</li>
                <li>Utiliser une interpolation linéaire pour plus de précision</li>
              </ol>
              <br />
              <p><strong>Exemple :</strong></p>
              <p>Reste à charge : 10 000 €</p>
              <p>Économies année 1 : 652 € → Cumulé : 652 €</p>
              <p>Économies année 2 : 697 € → Cumulé : 1349 €</p>
              <p>...</p>
              <p>Économies année 10 : 1286 € → Cumulé : 10 237 €</p>
              <p><strong>→ ROI atteint en 9,8 ans</strong></p>
            </div>

            <h3 className="text-xl font-semibold mt-6 mb-3">8.3 Taux de rentabilité annuel moyen</h3>
            <p className="mb-4">
              Le taux de rentabilité annuel permet de comparer le projet à d'autres investissements.
            </p>
            <div className="bg-muted/30 p-4 rounded-lg mb-4 font-mono text-sm">
              <p><strong>Formule :</strong></p>
              <p>Taux = ((Valeur finale / Investissement initial)^(1/durée) - 1) × 100</p>
              <br />
              <p>Avec :</p>
              <ul className="list-disc pl-6 space-y-1 mt-2">
                <li>Valeur finale = Investissement + Gain net sur durée de vie</li>
                <li>Gain net = Économies totales - Investissement</li>
              </ul>
              <br />
              <p><strong>Exemple :</strong></p>
              <p>Investissement : 10 000 €</p>
              <p>Économies totales sur 17 ans : 27 472 €</p>
              <p>Gain net : 27 472 € - 10 000 € = 17 472 €</p>
              <p>Valeur finale : 10 000 € + 17 472 € = 27 472 €</p>
              <p>Taux = ((27 472 / 10 000)^(1/17) - 1) × 100 = <strong>6,2 %/an</strong></p>
            </div>

            <h3 className="text-xl font-semibold mt-6 mb-3">8.4 Gain net sur durée de vie</h3>
            <div className="bg-muted/30 p-4 rounded-lg mb-4 font-mono text-sm">
              <p><strong>Formule :</strong></p>
              <p>Gain net = Coût total actuel (17 ans) - (Investissement + Coût total PAC (17 ans))</p>
              <br />
              <p><strong>Exemple :</strong></p>
              <p>Coût total actuel : 50 789 €</p>
              <p>Coût total PAC : 10 000 € + 12 317 € = 23 317 €</p>
              <p>Gain net : 50 789 € - 23 317 € = <strong>17 472 €</strong></p>
            </div>
          </section>

          {/* 9. Impact du financement */}
          <section id="financement" className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">9. Impact du financement</h2>

            <h3 className="text-xl font-semibold mt-6 mb-3">9.1 Mensualité de crédit</h3>
            <p className="mb-4">
              Pour un financement par crédit, la mensualité est calculée selon la formule bancaire standard :
            </p>
            <div className="bg-muted/30 p-4 rounded-lg mb-4 font-mono text-sm">
              <p><strong>Formule :</strong></p>
              <p>Mensualité = Capital × (Taux mensuel / (1 - (1 + Taux mensuel)^(-Durée en mois)))</p>
              <br />
              <p>Avec :</p>
              <ul className="list-disc pl-6 space-y-1 mt-2">
                <li>Taux mensuel = Taux annuel / 12</li>
              </ul>
              <br />
              <p><strong>Exemple :</strong></p>
              <p>Capital : 10 000 €</p>
              <p>Taux annuel : 3,5 %</p>
              <p>Durée : 60 mois (5 ans)</p>
              <p>Taux mensuel : 3,5% / 12 = 0,2917%</p>
              <p>Mensualité = 10 000 × (0,002917 / (1 - (1,002917)^(-60))) = <strong>181,54 €/mois</strong></p>
            </div>

            <h3 className="text-xl font-semibold mt-6 mb-3">9.2 Coût total du crédit</h3>
            <div className="bg-muted/30 p-4 rounded-lg mb-4 font-mono text-sm">
              <p><strong>Formule :</strong></p>
              <p>Coût total = Mensualité × Durée en mois</p>
              <br />
              <p><strong>Exemple :</strong></p>
              <p>181,54 € × 60 mois = 10 892,40 €</p>
              <p>Dont intérêts : 10 892,40 € - 10 000 € = <strong>892,40 €</strong></p>
            </div>

            <h3 className="text-xl font-semibold mt-6 mb-3">9.3 Investissement réel avec crédit</h3>
            <p className="mb-4">
              Pour le calcul du ROI en cas de financement par crédit, l'investissement réel prend en compte les intérêts :
            </p>
            <div className="bg-muted/30 p-4 rounded-lg mb-4 font-mono text-sm">
              <p><strong>Formules selon le mode de financement :</strong></p>
              <ul className="list-disc pl-6 space-y-2 mt-2">
                <li><strong>Comptant</strong> : Investissement réel = Reste à charge</li>
                <li><strong>Crédit</strong> : Investissement réel = Coût total du crédit</li>
                <li><strong>Mixte</strong> : Investissement réel = Apport personnel + Coût total du crédit</li>
              </ul>
              <br />
              <p><strong>Exemple crédit :</strong></p>
              <p>Reste à charge : 10 000 €</p>
              <p>Coût total crédit : 10 892,40 €</p>
              <p>Investissement réel = 10 892,40 € (utilisé pour calculer le ROI)</p>
            </div>
          </section>

          {/* 10. Hypothèses et limites */}
          <section id="hypotheses" className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">10. Hypothèses et limites</h2>

            <h3 className="text-xl font-semibold mt-6 mb-3">10.1 Hypothèses principales</h3>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li><strong>Besoins énergétiques constants</strong> : Les besoins de chauffage sont supposés identiques chaque année (même surface, même occupation, même isolation)</li>
              <li><strong>Évolution des prix</strong> : Le modèle Mean Reversion est basé sur l'historique long terme mais ne peut prédire les chocs ponctuels (crises géopolitiques, catastrophes naturelles, etc.)</li>
              <li><strong>Performance de la PAC</strong> : Le COP est supposé constant sur toute la durée de vie (en pratique, il peut légèrement diminuer avec le temps)</li>
              <li><strong>Durée de vie</strong> : 17 ans est une moyenne ; la durée réelle dépend de la qualité de l'installation et de l'entretien</li>
              <li><strong>Coûts fixes constants</strong> : Les abonnements et coûts d'entretien sont exprimés en euros constants (pas d'inflation appliquée)</li>
            </ul>

            <h3 className="text-xl font-semibold mt-6 mb-3">10.2 Limites du calculateur</h3>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li>Le calculateur ne prend pas en compte les éventuelles rénovations énergétiques futures (isolation, fenêtres) qui réduiraient les besoins</li>
              <li>Les aides financières évoluent selon la réglementation ; les montants affichés sont indicatifs</li>
              <li>Le calcul ne tient pas compte d'éventuels travaux de réparation ou de remplacement anticipé</li>
              <li>Les tarifs d'énergie peuvent varier selon le fournisseur et l'offre choisie</li>
            </ul>

            <h3 className="text-xl font-semibold mt-6 mb-3">10.3 Recommandations</h3>
            <p className="mb-4">
              Pour obtenir une estimation fiable :
            </p>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li>Renseignez votre consommation réelle à partir de vos factures (évitez les estimations)</li>
              <li>Demandez plusieurs devis professionnels pour le coût d'installation</li>
              <li>Vérifiez votre éligibilité aux aides avec un conseiller France Rénov'</li>
              <li>Assurez-vous que votre logement est correctement isolé avant d'installer une PAC</li>
              <li>Faites réaliser une étude thermique pour dimensionner correctement la PAC</li>
            </ul>
          </section>

          {/* Contact et mise à jour */}
          <section className="mb-8 bg-muted/30 p-4 rounded-lg">
            <h2 className="text-xl font-semibold mb-3">Questions ou suggestions ?</h2>
            <p className="mb-3">
              Cette méthodologie est régulièrement mise à jour pour refléter les meilleures pratiques et les données les plus récentes.
            </p>
            <p>
              Pour toute question sur nos calculs ou pour signaler une erreur, contactez-nous à{" "}
              <a href="mailto:contact@thermogain.fr" className="text-primary hover:underline">contact@thermogain.fr</a>
            </p>
          </section>
        </CardContent>
      </Card>
    </div>
  )
}
