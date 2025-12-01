import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export const metadata = {
  title: "Politique de Confidentialité | ThermoGain",
  description: "Politique de confidentialité et protection des données personnelles de ThermoGain",
}

export default function PolitiqueConfidentialitePage() {
  return (
    <Card>
        <CardHeader>
          <CardTitle className="text-3xl">Politique de Confidentialité</CardTitle>
          <CardDescription>
            Protection des données personnelles - Conforme au RGPD
          </CardDescription>
        </CardHeader>
        <CardContent className="prose prose-sm max-w-none dark:prose-invert">
          <p className="text-muted-foreground mb-6">
            Dernière mise à jour : {new Date().toLocaleDateString("fr-FR", { year: "numeric", month: "long", day: "numeric" })}
          </p>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">1. Introduction</h2>
            <p className="mb-4">
              ThermoGain accorde une grande importance à la protection de vos données personnelles et au
              respect de votre vie privée. La présente Politique de Confidentialité vous informe sur la
              manière dont nous collectons, utilisons, stockons et protégeons vos données personnelles.
            </p>
            <p>
              Cette politique est conforme au Règlement Général sur la Protection des Données (RGPD)
              n°2016/679 du 27 avril 2016 et à la loi Informatique et Libertés n°78-17 du 6 janvier 1978
              modifiée.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">2. Responsable du traitement</h2>
            <p className="mb-4">
              Le responsable du traitement de vos données personnelles est l'éditeur du site ThermoGain,
              à titre personnel dans le cadre d'un projet gratuit et éducatif.
            </p>
            <div className="bg-muted p-4 rounded-lg">
              <p className="mb-1"><strong>Contact :</strong> contact@thermogain.fr</p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">3. Données personnelles collectées</h2>

            <h3 className="text-lg font-semibold mt-6 mb-3">3.1 Données collectées lors de la création de compte</h3>
            <p className="mb-2">Lors de votre inscription, nous collectons :</p>
            <ul className="list-disc pl-6 space-y-1 mb-4">
              <li>Prénom et nom</li>
              <li>Adresse e-mail professionnelle</li>
              <li>Mot de passe (chiffré)</li>
              <li>Nom de l'entreprise (optionnel)</li>
            </ul>

            <h3 className="text-lg font-semibold mt-6 mb-3">3.2 Données collectées lors de l'utilisation des services</h3>
            <p className="mb-2">Lors de votre utilisation de la plateforme, nous collectons :</p>
            <ul className="list-disc pl-6 space-y-1 mb-4">
              <li>Informations sur les projets créés (caractéristiques techniques des installations)</li>
              <li>Données de navigation (pages visitées, durée de session)</li>
              <li>Données techniques (adresse IP, type de navigateur, système d'exploitation)</li>
              <li>Logs de connexion et d'activité</li>
            </ul>

            <h3 className="text-lg font-semibold mt-6 mb-3">3.3 Données de paiement</h3>
            <p className="mb-4 italic">
              Le service étant actuellement gratuit, aucune donnée de paiement ou de facturation n'est collectée.
            </p>

            <h3 className="text-lg font-semibold mt-6 mb-3">3.4 Cookies et technologies similaires</h3>
            <p>
              Nous utilisons des cookies pour améliorer votre expérience. Pour plus d'informations,
              consultez notre{" "}
              <Link href="/legal/cookies" className="text-primary hover:underline">
                Politique de gestion des cookies
              </Link>.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">4. Finalités et bases légales du traitement</h2>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300 dark:border-gray-700 text-sm">
                <thead>
                  <tr className="bg-muted">
                    <th className="border border-gray-300 dark:border-gray-700 p-3 text-left font-semibold">Finalité</th>
                    <th className="border border-gray-300 dark:border-gray-700 p-3 text-left font-semibold">Base légale</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-gray-300 dark:border-gray-700 p-3">Création et gestion de votre compte</td>
                    <td className="border border-gray-300 dark:border-gray-700 p-3">Exécution du contrat</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 dark:border-gray-700 p-3">Fourniture des services de la plateforme</td>
                    <td className="border border-gray-300 dark:border-gray-700 p-3">Exécution du contrat</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 dark:border-gray-700 p-3">Support technique et service client</td>
                    <td className="border border-gray-300 dark:border-gray-700 p-3">Exécution du contrat / Intérêt légitime</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 dark:border-gray-700 p-3">Amélioration de nos services et analyses statistiques</td>
                    <td className="border border-gray-300 dark:border-gray-700 p-3">Intérêt légitime</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 dark:border-gray-700 p-3">Envoi de communications marketing (avec opt-in)</td>
                    <td className="border border-gray-300 dark:border-gray-700 p-3">Consentement</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 dark:border-gray-700 p-3">Sécurité et prévention de la fraude</td>
                    <td className="border border-gray-300 dark:border-gray-700 p-3">Intérêt légitime / Obligation légale</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 dark:border-gray-700 p-3">Respect des obligations légales et réglementaires</td>
                    <td className="border border-gray-300 dark:border-gray-700 p-3">Obligation légale</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">5. Destinataires des données</h2>
            <p className="mb-4">
              Vos données personnelles sont destinées :
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>À l'administrateur de ThermoGain</strong> : pour la gestion de votre compte et la fourniture des services</li>
              <li><strong>À nos prestataires de services :</strong>
                <ul className="list-circle pl-6 mt-2 space-y-1">
                  <li>Hébergement : Vercel Inc. (USA - garanties de protection RGPD)</li>
                  <li>Base de données : Neon (Union Européenne)</li>
                  <li>Authentification : NextAuth.js (traitement local)</li>
                </ul>
              </li>
              <li><strong>Aux autorités compétentes</strong> : en cas d'obligation légale ou de réquisition judiciaire</li>
            </ul>
            <p className="mt-4">
              Tous nos prestataires respectent le RGPD et garantissent un niveau de protection adéquat
              des données personnelles.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">6. Durée de conservation des données</h2>
            <p className="mb-4">
              Vos données personnelles sont conservées pour les durées suivantes :
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Données de compte :</strong> pendant toute la durée d'utilisation du service + 30 jours après suppression du compte</li>
              <li><strong>Données de projets :</strong> pendant toute la durée d'utilisation du service + 30 jours après suppression du compte</li>
              <li><strong>Logs de connexion :</strong> 12 mois maximum (sécurité)</li>
              <li><strong>Cookies :</strong> 13 mois maximum</li>
            </ul>
            <p className="mt-4">
              À l'issue de ces durées, vos données sont supprimées de manière sécurisée. Aucune donnée
              n'est conservée à des fins commerciales après la suppression de votre compte.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">7. Sécurité des données</h2>
            <p className="mb-4">
              ThermoGain met en œuvre toutes les mesures techniques et organisationnelles appropriées
              pour protéger vos données personnelles contre :
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>L'accès non autorisé</li>
              <li>La perte accidentelle</li>
              <li>La destruction</li>
              <li>L'altération</li>
              <li>La divulgation non autorisée</li>
            </ul>
            <p className="mt-4 mb-2">
              Nos mesures de sécurité incluent notamment :
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Chiffrement des mots de passe (bcrypt)</li>
              <li>Connexion HTTPS/TLS sécurisée obligatoire</li>
              <li>Hébergement sur infrastructure sécurisée (Vercel, Neon)</li>
              <li>Sauvegardes automatiques et régulières</li>
              <li>Contrôle d'accès et authentification sécurisée (NextAuth.js)</li>
              <li>Mise à jour régulière des dépendances de sécurité</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">8. Vos droits</h2>
            <p className="mb-4">
              Conformément au RGPD et à la loi Informatique et Libertés, vous disposez des droits suivants :
            </p>

            <div className="space-y-4">
              <div className="bg-muted p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Droit d'accès (Art. 15 RGPD)</h3>
                <p className="text-sm">Vous pouvez obtenir la confirmation que vos données sont traitées et accéder à ces données.</p>
              </div>

              <div className="bg-muted p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Droit de rectification (Art. 16 RGPD)</h3>
                <p className="text-sm">Vous pouvez demander la correction de données inexactes ou incomplètes.</p>
              </div>

              <div className="bg-muted p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Droit à l'effacement / "Droit à l'oubli" (Art. 17 RGPD)</h3>
                <p className="text-sm">Vous pouvez demander la suppression de vos données, sous réserve de nos obligations légales.</p>
              </div>

              <div className="bg-muted p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Droit à la limitation du traitement (Art. 18 RGPD)</h3>
                <p className="text-sm">Vous pouvez demander la limitation du traitement de vos données dans certaines situations.</p>
              </div>

              <div className="bg-muted p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Droit à la portabilité (Art. 20 RGPD)</h3>
                <p className="text-sm">Vous pouvez recevoir vos données dans un format structuré et demander leur transmission à un autre responsable.</p>
              </div>

              <div className="bg-muted p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Droit d'opposition (Art. 21 RGPD)</h3>
                <p className="text-sm">Vous pouvez vous opposer au traitement de vos données pour des raisons tenant à votre situation particulière.</p>
              </div>

              <div className="bg-muted p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Droit de retirer votre consentement</h3>
                <p className="text-sm">Lorsque le traitement est fondé sur votre consentement, vous pouvez le retirer à tout moment.</p>
              </div>

              <div className="bg-muted p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Droit de définir des directives post-mortem</h3>
                <p className="text-sm">Vous pouvez définir des directives relatives au sort de vos données après votre décès.</p>
              </div>
            </div>

            <h3 className="text-lg font-semibold mt-6 mb-3">Comment exercer vos droits ?</h3>
            <p className="mb-2">
              Pour exercer vos droits, vous pouvez nous contacter :
            </p>
            <ul className="list-disc pl-6 space-y-1 mb-4">
              <li>Par email : contact@thermogain.fr</li>
            </ul>
            <p className="mb-4">
              Nous vous répondrons dans un délai d'un mois maximum à compter de la réception de votre
              demande. En cas de demande complexe, ce délai peut être prolongé de deux mois supplémentaires.
            </p>
            <p>
              Pour des raisons de sécurité, nous pourrons vous demander de justifier de votre identité
              avant de traiter votre demande.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">9. Droit de réclamation</h2>
            <p className="mb-4">
              Si vous estimez que vos droits ne sont pas respectés, vous avez le droit d'introduire
              une réclamation auprès de la Commission Nationale de l'Informatique et des Libertés (CNIL) :
            </p>
            <div className="bg-muted p-4 rounded-lg">
              <p className="mb-1"><strong>CNIL</strong></p>
              <p className="mb-1">3 Place de Fontenoy</p>
              <p className="mb-1">TSA 80715</p>
              <p className="mb-1">75334 PARIS CEDEX 07</p>
              <p className="mb-1">Téléphone : 01 53 73 22 22</p>
              <p>Site web : <a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">www.cnil.fr</a></p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">10. Transferts de données hors UE</h2>
            <p>
              ThermoGain s'engage à ne pas transférer vos données personnelles en dehors de l'Union
              Européenne, sauf si cela est nécessaire pour la fourniture des services. Dans ce cas,
              nous nous assurons que des garanties appropriées sont en place (clauses contractuelles
              types de la Commission Européenne, certification Privacy Shield le cas échéant, etc.).
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">11. Mineurs</h2>
            <p>
              Nos services sont destinés aux professionnels et ne sont pas conçus pour les mineurs de
              moins de 18 ans. Nous ne collectons pas sciemment de données personnelles concernant des
              mineurs.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">12. Modifications de la Politique de Confidentialité</h2>
            <p>
              ThermoGain se réserve le droit de modifier la présente Politique de Confidentialité à
              tout moment. Toute modification substantielle sera portée à votre connaissance par email
              et/ou via une notification sur la plateforme. La version en vigueur est celle publiée
              sur cette page avec sa date de dernière mise à jour.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">13. Contact</h2>
            <p>
              Pour toute question concernant cette Politique de Confidentialité ou le traitement de
              vos données personnelles, vous pouvez nous contacter :
            </p>
            <ul className="list-disc pl-6 mt-2">
              <li>Par email : contact@thermogain.fr</li>
            </ul>
          </section>

          <div className="mt-8 p-4 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg">
            <p className="text-sm text-green-800 dark:text-green-200 mb-2">
              <strong>Service gratuit et respect de la vie privée :</strong>
            </p>
            <p className="text-sm text-green-800 dark:text-green-200">
              ThermoGain est un service gratuit qui collecte uniquement les données strictement nécessaires
              à son fonctionnement. Aucune donnée n'est vendue ou utilisée à des fins commerciales. Cette
              politique est conforme au RGPD et à la loi Informatique et Libertés. Si le service devait
              évoluer (ajout de fonctionnalités payantes, partenariats), cette politique serait mise à jour
              et vous seriez informé.
            </p>
          </div>
        </CardContent>
      </Card>
  )
}
