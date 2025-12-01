import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export const metadata = {
  title: "Conditions d'Utilisation | ThermoGain",
  description: "Conditions d'utilisation de la plateforme ThermoGain",
}

export default function CGVPage() {
  return (
    <Card>
        <CardHeader>
          <CardTitle className="text-3xl">Conditions d'Utilisation</CardTitle>
          <CardDescription>
            Conditions applicables à l'utilisation gratuite de la plateforme ThermoGain
          </CardDescription>
        </CardHeader>
        <CardContent className="prose prose-sm max-w-none dark:prose-invert">
          <p className="text-muted-foreground mb-6">
            Dernière mise à jour : {new Date().toLocaleDateString("fr-FR", { year: "numeric", month: "long", day: "numeric" })}
          </p>

          <div className="mb-8 p-4 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg">
            <p className="text-sm text-green-800 dark:text-green-200">
              <strong>Service gratuit :</strong> ThermoGain est actuellement proposé gratuitement à tous les utilisateurs.
              Aucune information de paiement n'est requise. Ces conditions d'utilisation s'appliquent au service gratuit.
              Si le service devenait payant à l'avenir, vous en seriez informé et de nouvelles Conditions Générales de
              Vente seraient mises en place.
            </p>
          </div>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">1. Objet et champ d'application</h2>
            <p className="mb-4">
              Les présentes Conditions d'Utilisation (ci-après "CGU") régissent l'accès et l'utilisation
              de la plateforme ThermoGain par toute personne physique ou morale, ci-après dénommée "l'Utilisateur".
            </p>
            <p className="mb-4">
              ThermoGain est un service gratuit permettant aux professionnels du génie climatique de réaliser
              des études de rentabilité pour les installations de pompes à chaleur.
            </p>
            <p>
              L'utilisation du service implique l'acceptation pleine et entière des présentes CGU. En créant
              un compte, l'Utilisateur reconnaît avoir lu et accepté ces conditions.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">2. Services proposés</h2>
            <p className="mb-4">
              ThermoGain propose gratuitement les services suivants :
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Accès à une plateforme de calcul de rentabilité de pompes à chaleur</li>
              <li>Dimensionnement automatique des installations selon les normes en vigueur</li>
              <li>Calcul du COP ajusté en fonction des caractéristiques du logement et de la zone climatique</li>
              <li>Analyses financières : ROI, période de retour, économies annuelles</li>
              <li>Génération de rapports détaillés</li>
              <li>Sauvegarde et gestion de projets multiples</li>
            </ul>
            <p className="mt-4">
              Les services sont fournis "en l'état" et peuvent être modifiés, interrompus ou arrêtés
              à tout moment sans préavis.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">3. Gratuité du service</h2>
            <p className="mb-4">
              L'accès et l'utilisation de ThermoGain sont actuellement entièrement gratuits. Aucune
              information de paiement n'est collectée.
            </p>
            <p className="mb-4">
              <strong>Évolution future :</strong> ThermoGain se réserve le droit d'introduire des
              fonctionnalités payantes ou un système d'abonnement à l'avenir. Dans ce cas :
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Les utilisateurs existants seront informés au minimum 30 jours à l'avance</li>
              <li>De nouvelles Conditions Générales de Vente (CGV) seront établies</li>
              <li>Les utilisateurs pourront choisir d'accepter les nouvelles conditions ou de cesser d'utiliser le service</li>
              <li>Aucun paiement ne sera exigé sans consentement explicite de l'utilisateur</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">4. Création de compte</h2>
            <p className="mb-4">
              L'accès aux services nécessite la création d'un compte utilisateur gratuit. Lors de
              l'inscription, l'Utilisateur s'engage à fournir des informations exactes et à maintenir
              ces informations à jour.
            </p>
            <p>
              L'Utilisateur est responsable de la confidentialité de ses identifiants de connexion et
              de toutes les activités effectuées sous son compte.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">5. Obligations de l'Utilisateur</h2>
            <p className="mb-4">
              L'Utilisateur s'engage à :
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Fournir des informations exactes lors de la création de son compte</li>
              <li>Maintenir la confidentialité de ses identifiants de connexion</li>
              <li>Utiliser les services conformément aux présentes CGU et à la législation en vigueur</li>
              <li>Ne pas tenter de contourner les mesures de sécurité de la plateforme</li>
              <li>Ne pas utiliser les services à des fins illégales ou malveillantes</li>
              <li>Ne pas surcharger ou perturber le fonctionnement du service</li>
              <li>Respecter les droits de propriété intellectuelle de ThermoGain</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">6. Service "en l'état"</h2>
            <p className="mb-4">
              Le service ThermoGain est fourni gratuitement "en l'état", sans garantie d'aucune sorte.
              ThermoGain s'efforce de fournir un service de qualité mais ne peut garantir :
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>La disponibilité continue du service (des interruptions peuvent survenir pour maintenance)</li>
              <li>L'absence totale d'erreurs ou de bugs</li>
              <li>La sauvegarde permanente de vos données (il est recommandé de faire vos propres sauvegardes)</li>
              <li>Un support technique systématique</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">7. Limitations de responsabilité</h2>
            <p className="mb-4">
              Les calculs et résultats fournis par ThermoGain sont basés sur des méthodologies reconnues
              mais sont fournis <strong>à titre indicatif uniquement</strong>. Ils ne constituent ni une
              étude thermique réglementaire, ni un engagement contractuel.
            </p>
            <p className="mb-4">
              ThermoGain ne peut être tenu responsable :
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Des décisions prises par l'Utilisateur sur la base des résultats fournis</li>
              <li>Des erreurs dues à des données incorrectes fournies par l'Utilisateur</li>
              <li>Des interruptions de service ou pertes de données</li>
              <li>Des dommages directs ou indirects résultant de l'utilisation du service</li>
              <li>De l'exactitude absolue des calculs dans tous les scénarios possibles</li>
            </ul>
            <p className="mt-4 font-semibold">
              L'Utilisateur reconnaît et accepte que l'utilisation du service gratuit se fait à ses propres
              risques. Le service étant gratuit, aucune responsabilité financière ne peut être engagée.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">8. Propriété intellectuelle</h2>
            <p className="mb-4">
              Tous les éléments de la plateforme ThermoGain (logiciels, algorithmes, interfaces, contenus,
              design, etc.) sont protégés par le droit d'auteur et restent la propriété de leur(s) auteur(s).
            </p>
            <p className="mb-4">
              L'utilisation gratuite du service confère uniquement un droit d'utilisation personnel et
              non commercial. L'Utilisateur s'engage à ne pas :
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Copier, modifier ou redistribuer le code source ou les algorithmes</li>
              <li>Créer des services dérivés ou concurrents basés sur ThermoGain</li>
              <li>Utiliser le service dans un cadre commercial sans autorisation</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">9. Données personnelles</h2>
            <p>
              Le traitement des données personnelles de l'Utilisateur est régi par notre{" "}
              <Link href="/legal/politique-confidentialite" className="text-primary hover:underline">
                Politique de Confidentialité
              </Link>, conforme au Règlement Général sur la Protection des Données (RGPD).
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">10. Suspension et fermeture de compte</h2>
            <p className="mb-4">
              L'Utilisateur peut supprimer son compte à tout moment depuis son espace personnel ou en
              contactant contact@thermogain.fr.
            </p>
            <p className="mb-4">
              ThermoGain se réserve le droit de suspendre ou supprimer un compte en cas de :
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Non-respect des présentes CGU</li>
              <li>Utilisation frauduleuse, abusive ou malveillante du service</li>
              <li>Activités illégales ou préjudiciables</li>
              <li>Inactivité prolongée (plus de 2 ans)</li>
            </ul>
            <p className="mt-4">
              En cas de suspension, l'Utilisateur sera informé par email sauf en cas d'urgence ou
              d'activité illégale manifeste.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">11. Modification des CGU</h2>
            <p>
              ThermoGain se réserve le droit de modifier les présentes CGU à tout moment. Les
              modifications substantielles seront notifiées par email et/ou via le Site. La poursuite
              de l'utilisation du service après notification vaut acceptation des nouvelles conditions.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">12. Loi applicable</h2>
            <p>
              Les présentes CGU sont soumises au droit français. En cas de litige, une résolution amiable
              sera recherchée en priorité. À défaut, les tribunaux français seront compétents.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">13. Contact</h2>
            <p>
              Pour toute question concernant ces conditions d'utilisation ou le service, vous pouvez
              nous contacter :
            </p>
            <ul className="list-disc pl-6 mt-2">
              <li>Par email : contact@thermogain.fr</li>
            </ul>
          </section>

          <div className="mt-8 p-4 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg">
            <p className="text-sm text-green-800 dark:text-green-200 mb-2">
              <strong>Projet en phase de développement :</strong>
            </p>
            <p className="text-sm text-green-800 dark:text-green-200">
              ThermoGain est actuellement en phase de développement et de test. Le service est proposé
              gratuitement pour recueillir des retours d'expérience et améliorer la plateforme. Vos
              suggestions sont les bienvenues à contact@thermogain.fr. Si le service évoluait vers une
              offre payante, ces CGU seraient remplacées par des Conditions Générales de Vente (CGV)
              complètes et vous seriez informé à l'avance.
            </p>
          </div>
        </CardContent>
      </Card>
  )
}
