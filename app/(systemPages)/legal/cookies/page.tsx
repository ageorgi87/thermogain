import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export const metadata = {
  title: "Gestion des Cookies | ThermoGain",
  description: "Politique de gestion des cookies de ThermoGain",
}

export default function CookiesPage() {
  return (
    <Card>
        <CardHeader>
          <CardTitle className="text-3xl">Gestion des Cookies</CardTitle>
          <CardDescription>
            Informations sur l'utilisation des cookies sur ThermoGain
          </CardDescription>
        </CardHeader>
        <CardContent className="prose prose-sm max-w-none dark:prose-invert">
          <p className="text-muted-foreground mb-6">
            Dernière mise à jour : {new Date().toLocaleDateString("fr-FR", { year: "numeric", month: "long", day: "numeric" })}
          </p>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">1. Qu'est-ce qu'un cookie ?</h2>
            <p className="mb-4">
              Un cookie est un petit fichier texte déposé sur votre terminal (ordinateur, tablette,
              smartphone) lors de la visite d'un site web. Il permet au site de mémoriser des informations
              sur votre visite, comme votre langue préférée, vos paramètres d'affichage ou vos
              préférences de navigation.
            </p>
            <p>
              Les cookies ont une durée de validité limitée. Certains expirent à la fin de votre session
              de navigation (cookies de session), d'autres restent stockés plus longtemps sur votre
              terminal (cookies persistants).
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">2. Pourquoi ThermoGain utilise-t-il des cookies ?</h2>
            <p className="mb-4">
              ThermoGain utilise des cookies pour :
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Assurer le bon fonctionnement de la plateforme (cookies essentiels)</li>
              <li>Mémoriser vos préférences et paramètres (langue, thème, etc.)</li>
              <li>Maintenir votre session active lorsque vous êtes connecté</li>
              <li>Analyser l'utilisation du site pour améliorer nos services (cookies analytiques)</li>
              <li>Personnaliser votre expérience utilisateur</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">3. Types de cookies utilisés</h2>

            <h3 className="text-lg font-semibold mt-6 mb-3">3.1 Cookies strictement nécessaires</h3>
            <p className="mb-4">
              Ces cookies sont indispensables au fonctionnement du site. Ils permettent notamment :
            </p>
            <div className="overflow-x-auto mb-4">
              <table className="w-full border-collapse border border-gray-300 dark:border-gray-700 text-sm">
                <thead>
                  <tr className="bg-muted">
                    <th className="border border-gray-300 dark:border-gray-700 p-3 text-left font-semibold">Nom du cookie</th>
                    <th className="border border-gray-300 dark:border-gray-700 p-3 text-left font-semibold">Finalité</th>
                    <th className="border border-gray-300 dark:border-gray-700 p-3 text-left font-semibold">Durée</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-gray-300 dark:border-gray-700 p-3 font-mono text-xs">next-auth.session-token</td>
                    <td className="border border-gray-300 dark:border-gray-700 p-3">Gestion de la session utilisateur (authentification)</td>
                    <td className="border border-gray-300 dark:border-gray-700 p-3">30 jours</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 dark:border-gray-700 p-3 font-mono text-xs">next-auth.csrf-token</td>
                    <td className="border border-gray-300 dark:border-gray-700 p-3">Protection contre les attaques CSRF</td>
                    <td className="border border-gray-300 dark:border-gray-700 p-3">Session</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 dark:border-gray-700 p-3 font-mono text-xs">cookie-consent</td>
                    <td className="border border-gray-300 dark:border-gray-700 p-3">Mémorisation de vos préférences de cookies</td>
                    <td className="border border-gray-300 dark:border-gray-700 p-3">13 mois</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-sm italic">
              Ces cookies ne nécessitent pas votre consentement car ils sont strictement nécessaires
              à la fourniture du service demandé.
            </p>

            <h3 className="text-lg font-semibold mt-6 mb-3">3.2 Cookies de préférences</h3>
            <p className="mb-4">
              Ces cookies permettent de mémoriser vos préférences d'utilisation :
            </p>
            <div className="overflow-x-auto mb-4">
              <table className="w-full border-collapse border border-gray-300 dark:border-gray-700 text-sm">
                <thead>
                  <tr className="bg-muted">
                    <th className="border border-gray-300 dark:border-gray-700 p-3 text-left font-semibold">Nom du cookie</th>
                    <th className="border border-gray-300 dark:border-gray-700 p-3 text-left font-semibold">Finalité</th>
                    <th className="border border-gray-300 dark:border-gray-700 p-3 text-left font-semibold">Durée</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-gray-300 dark:border-gray-700 p-3 font-mono text-xs">theme</td>
                    <td className="border border-gray-300 dark:border-gray-700 p-3">Mémorisation du thème (clair/sombre)</td>
                    <td className="border border-gray-300 dark:border-gray-700 p-3">1 an</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 dark:border-gray-700 p-3 font-mono text-xs">language</td>
                    <td className="border border-gray-300 dark:border-gray-700 p-3">Mémorisation de la langue préférée</td>
                    <td className="border border-gray-300 dark:border-gray-700 p-3">1 an</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h3 className="text-lg font-semibold mt-6 mb-3">3.3 Cookies analytiques</h3>
            <p className="mb-4">
              Actuellement, ThermoGain n'utilise pas de cookies analytiques ou de suivi statistique.
            </p>
            <p className="text-sm italic">
              Si nous devions en utiliser à l'avenir, votre consentement préalable serait requis.
            </p>

            <h3 className="text-lg font-semibold mt-6 mb-3">3.4 Cookies de marketing (optionnels)</h3>
            <p className="mb-2">
              Actuellement, ThermoGain n'utilise pas de cookies de marketing ou de publicité ciblée.
            </p>
            <p className="text-sm italic">
              Si nous devions en utiliser à l'avenir, votre consentement explicite serait requis.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">4. Cookies tiers</h2>
            <p className="mb-4">
              Certains cookies peuvent être déposés par des services tiers que nous utilisons :
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Services d'authentification :</strong> NextAuth.js pour la gestion des sessions utilisateur</li>
              <li><strong>Services d'hébergement :</strong> Vercel pour l'hébergement de la plateforme</li>
            </ul>
            <p className="mt-4">
              Ces services tiers sont soumis à leurs propres politiques de confidentialité et de cookies.
              Nous vous recommandons de les consulter.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">5. Gestion de vos préférences</h2>

            <h3 className="text-lg font-semibold mt-6 mb-3">5.1 Via les paramètres de votre navigateur</h3>
            <p className="mb-4">
              Vous pouvez également configurer votre navigateur pour accepter ou refuser les cookies :
            </p>

            <div className="space-y-3">
              <div className="bg-muted p-3 rounded-lg">
                <p className="font-semibold mb-1">Google Chrome</p>
                <p className="text-sm">Paramètres → Confidentialité et sécurité → Cookies et autres données des sites</p>
              </div>

              <div className="bg-muted p-3 rounded-lg">
                <p className="font-semibold mb-1">Mozilla Firefox</p>
                <p className="text-sm">Paramètres → Vie privée et sécurité → Cookies et données de sites</p>
              </div>

              <div className="bg-muted p-3 rounded-lg">
                <p className="font-semibold mb-1">Safari</p>
                <p className="text-sm">Préférences → Confidentialité → Cookies et données de sites web</p>
              </div>

              <div className="bg-muted p-3 rounded-lg">
                <p className="font-semibold mb-1">Microsoft Edge</p>
                <p className="text-sm">Paramètres → Cookies et autorisations de site → Gérer et supprimer les cookies</p>
              </div>
            </div>

            <p className="mt-4 text-sm italic">
              Attention : le blocage de tous les cookies peut affecter votre expérience de navigation
              et empêcher l'utilisation de certaines fonctionnalités du site.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">6. Conséquences du refus des cookies</h2>
            <p className="mb-4">
              Le refus des cookies peut avoir les conséquences suivantes :
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Cookies essentiels :</strong> Le refus empêchera l'utilisation normale de la plateforme (impossibilité de se connecter, de sauvegarder des projets, etc.)</li>
              <li><strong>Cookies de préférences :</strong> Vos préférences (thème, langue) ne seront pas mémorisées entre les sessions</li>
              <li><strong>Cookies analytiques :</strong> Votre refus n'affectera pas votre utilisation du site, mais nous empêchera d'améliorer nos services sur la base de données statistiques</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">7. Durée de conservation</h2>
            <p>
              Conformément aux recommandations de la CNIL, les cookies sont conservés pour une durée
              maximale de 13 mois à compter de leur premier dépôt dans votre terminal. À l'issue de
              cette période, votre consentement devra être renouvelé.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">8. Base légale</h2>
            <p className="mb-4">
              L'utilisation des cookies est encadrée par :
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Le Règlement Général sur la Protection des Données (RGPD) n°2016/679</li>
              <li>La directive ePrivacy 2002/58/CE modifiée</li>
              <li>La loi Informatique et Libertés n°78-17 du 6 janvier 1978 modifiée</li>
              <li>Les lignes directrices de la CNIL sur les cookies et traceurs (octobre 2020)</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">9. Vos droits</h2>
            <p className="mb-4">
              Concernant les données collectées via les cookies, vous disposez des droits suivants :
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Droit d'accès aux données collectées</li>
              <li>Droit de rectification</li>
              <li>Droit à l'effacement</li>
              <li>Droit de retirer votre consentement</li>
              <li>Droit d'opposition</li>
            </ul>
            <p className="mt-4">
              Pour exercer ces droits, consultez notre{" "}
              <Link href="/legal/politique-confidentialite" className="text-primary hover:underline">
                Politique de Confidentialité
              </Link> ou contactez-nous à contact@thermogain.fr.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">10. Modifications</h2>
            <p>
              ThermoGain se réserve le droit de modifier la présente politique de cookies à tout moment.
              En cas de modification substantielle, nous vous en informerons via une notification sur
              le site ou par email. La version en vigueur est celle publiée sur cette page avec sa date
              de dernière mise à jour.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">11. Contact</h2>
            <p>
              Pour toute question concernant notre utilisation des cookies, vous pouvez nous contacter par email à : contact@thermogain.fr
            </p>
          </section>
        </CardContent>
      </Card>
  )
}
