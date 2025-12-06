# API Mes Aides Réno - Documentation ThermoGain

> Documentation de l'intégration fonctionnelle de l'API Publicodes Mes Aides Réno pour le calcul des aides MaPrimeRénov' et CEE/Coup de pouce.

## Ressources

- **URL API** : `https://mesaidesreno.beta.gouv.fr/api/v1/`
- **Documentation officielle** : https://mesaidesreno.beta.gouv.fr/api-doc

---

## Règles de syntaxe CRITIQUES

### 1. Points dans les clés : SANS espaces

❌ **INCORRECT** : `"logement . type"`
✅ **CORRECT** : `"logement.type"`

**Exception** : Certains noms de champs contiennent naturellement des espaces :
- `"logement.période de construction"` ← "période de construction" est le nom du champ
- `"logement.propriétaire occupant"` ← "propriétaire occupant" est le nom du champ
- `"CEE.projet.remplacement chaudière thermique"` ← "remplacement chaudière thermique" est le nom du champ

### 2. Valeurs STRING : Entre guillemets simples

✅ **CORRECT** : `"logement.type": "'maison'"`

Les strings doivent être entourées de guillemets simples `'` dans la valeur.

### 3. Valeurs NOMBRE : Sans guillemets

✅ **CORRECT** : `"ménage.personnes": "2"`

Les nombres passent en string mais sans guillemets simples autour.

### 4. Valeurs BOOLEAN Publicodes : Sans guillemets

✅ **CORRECT** : `"gestes.chauffage.PAC.air-eau": "oui"`

Les booleans Publicodes (`oui`, `non`) SANS guillemets simples.

### 5. Query string : NE PAS encoder les clés

```typescript
// ✅ CORRECT
const queryString = Object.entries(params)
  .map(([key, value]) => `${key}=${value}`)
  .join("&")
```

---

## Implémentation ThermoGain

### Fichier : `mesAidesRenoPublicodesClient.ts`

**Fonction de construction des paramètres** :

```typescript
const buildPublicodesParams = (
  params: MesAidesRenoRequestParams
): Record<string, string> => {
  return {
    // Propriétaire
    "vous.propriétaire.statut": "'propriétaire'",

    // Ménage
    "ménage.personnes": params.nombre_personnes_menage.toString(),
    "ménage.revenu": params.revenu_fiscal_reference.toString(),
    "ménage.commune": `'${params.code_insee}'`,

    // Logement
    "logement.type": `'${params.type_logement}'`,
    "logement.surface": "100",
    "logement.période de construction": `'${convertAnneeConstruction(params.annee_construction)}'`,
    "logement.propriétaire occupant": "'oui'",
    "logement.résidence principale propriétaire": "'oui'",
    "logement.résidence principale locataire": "'non'",
    "logement.commune": `'${params.code_insee}'`,
    "logement.adresse": `'Code INSEE ${params.code_insee}'`,

    // DPE
    "DPE.actuel": convertClasseDPEToNumber(params.classe_dpe),
    "projet.DPE visé": "2",

    // Parcours
    "parcours d'aide": "'non accompagné'",

    // Geste PAC
    "gestes.chauffage.PAC.air-eau": "oui",
    "gestes.chauffage.PAC.air-eau.CEE.usage": "'chauffage et eau chaude'",
    "gestes.chauffage.PAC.air-eau.CEE.Etas": "'supérieur à 200 %'",

    // CEE
    "CEE.projet.remplacement chaudière thermique": params.type_chauffage_actuel?.includes("chaudière") ? "oui" : "non",
  };
};
```

**Fonctions de conversion** :

```typescript
// DPE lettre → numéro
const convertClasseDPEToNumber = (classe?: string): string => {
  const mapping: Record<string, string> = {
    A: "1", B: "2", C: "3", D: "4", E: "5", F: "6", G: "7",
  };
  return classe && mapping[classe] ? mapping[classe] : "5";
};

// Année → période de construction
const convertAnneeConstruction = (annee?: number): string => {
  if (!annee) return "au moins 15 ans";
  const age = new Date().getFullYear() - annee;
  if (age < 2) return "moins de 2 ans";
  if (age < 10) return "de 2 à 10 ans";
  if (age < 15) return "de 10 à 15 ans";
  return "au moins 15 ans";
};
```

**Construction de l'URL** :

```typescript
const queryString =
  Object.entries(publicodesParams)
    .map(([key, value]) => `${key}=${value}`)
    .join("&") +
  "&fields=gestes.chauffage.PAC.air-eau.montant";

const url = `${MES_AIDES_RENO_API_URL}?${queryString}`;
```

---

## Structure de la réponse API

```typescript
interface PublicodesApiResponse {
  "gestes.chauffage.PAC.air-eau.montant": {
    label: string;
    rawValue: number | null;
    formattedValue: string;
    missingVariables?: string[];
    details?: Array<{
      MPR?: {
        label: string;
        rawValue: number;
        formattedValue: string;
        missingVariables?: string[];
      };
      CEE?: {
        label: string;
        rawValue: number | null;
        formattedValue: string;
        missingVariables?: string[];
      };
      "Coup de pouce"?: {
        label: string;
        rawValue: number | null;
        formattedValue: string;
        missingVariables?: string[];
      };
    }>;
  };
}
```

---

## Extraction des montants

**Fichier : `saveCriteriaAndCalculate.ts`**

```typescript
const gesteField = apiResponse["gestes.chauffage.PAC.air-eau.montant"];

// Extraire MaPrimeRénov'
let ma_prime_renov = 0;
const mprDetail = gesteField.details.find((d: any) => d.MPR);
if (mprDetail?.MPR?.rawValue) {
  ma_prime_renov = Math.round(mprDetail.MPR.rawValue);
}

// Extraire CEE ou Coup de pouce
let cee = 0;
const ceeDetail = gesteField.details.find((d: any) => d.CEE);
if (ceeDetail?.CEE?.rawValue) {
  cee = Math.round(ceeDetail.CEE.rawValue);
}

// Si pas de CEE, chercher Coup de pouce
if (cee === 0) {
  const coupDePouceDetail = gesteField.details.find((d: any) => d["Coup de pouce"]);
  if (coupDePouceDetail?.["Coup de pouce"]?.rawValue) {
    cee = Math.round(coupDePouceDetail["Coup de pouce"].rawValue);
  }
}
```

**Points importants** :
- ✅ Arrondi à l'entier avec `Math.round()`
- ✅ Coup de pouce remplace CEE quand applicable
- ✅ Coup de pouce affiché comme "CEE" dans l'interface (car c'est une variante)

---

## Logiques comprises par itération

### 1. Coup de pouce vs CEE

Quand le "Coup de pouce Chauffage" s'applique :
- L'API retourne `CEE.rawValue = null`
- L'API retourne `"Coup de pouce".rawValue = montant`
- Dans ThermoGain, on affiche le Coup de pouce comme "CEE" pour simplifier

**Exemple de réponse** :
```json
{
  "details": [
    { "MPR": { "rawValue": 5000 } },
    { "Coup de pouce": { "rawValue": 4000 } },
    { "CEE": { "rawValue": null, "formattedValue": "Non applicable" } }
  ]
}
```

### 2. Variables obligatoires découvertes

Les champs ESSENTIELS pour éviter `missingVariables` :
- ✅ `logement.résidence principale propriétaire` (souvent oublié)
- ✅ `logement.propriétaire occupant`
- ✅ `logement.adresse` (ou code INSEE comme adresse factice)
- ✅ Tous les champs doivent utiliser la syntaxe SANS espaces autour des points

### 3. Conversion DPE

L'API attend des **numéros** (1-7), pas des lettres :
- A = 1
- B = 2
- E = 5 (défaut)
- G = 7

### 4. Années de construction

L'API attend des **périodes textuelles**, pas des années :
- Moins de 2 ans
- De 2 à 10 ans
- De 10 à 15 ans
- Au moins 15 ans

---

## Validation et debugging

### Vérifier que tout fonctionne

1. **Aucune variable manquante** :
```typescript
if (gesteField.missingVariables && gesteField.missingVariables.length > 0) {
  console.warn("⚠️ Variables manquantes:", gesteField.missingVariables);
}
```

2. **Montants retournés** :
```typescript
console.log("MPR:", ma_prime_renov);
console.log("CEE:", cee);
```

3. **Logs automatiques** :
```
🌐 Appel API Mes Aides Réno (Publicodes)
📡 URL API: https://mesaidesreno.beta.gouv.fr/api/v1/?...
✅ Réponse API reçue
📊 Fields retournés: [ 'gestes.chauffage.PAC.air-eau.montant' ]
```

### Résultat attendu

✅ **Succès** :
- `missingVariables: []`
- `ma_prime_renov > 0`
- `cee > 0` (ou Coup de pouce)
- Montants arrondis à l'entier

---

## Changelog

### 2024-12-06 - Ajout champ surface logement

**Amélioration** : La surface du logement n'est plus hardcodée

**Modifications appliquées** :
1. ✅ Ajout du champ `surface_logement` dans le schéma Prisma (ProjectAides)
2. ✅ Ajout du champ dans l'interface `MesAidesRenoRequestParams`
3. ✅ Ajout du champ surface dans le formulaire `AidCalculator.tsx`
4. ✅ Récupération de `surface_logement` depuis la DB dans `prepareApiParams.ts`
5. ✅ Utilisation de `params.surface_logement` dans l'API au lieu de "100" hardcodé

**Résultat** :
- Les utilisateurs DOIVENT saisir la surface exacte de leur logement (champ obligatoire)
- L'API reçoit la vraie surface pour un calcul plus précis
- Pas de fallback : la surface est obligatoire dans le formulaire et dans l'API

**Fichiers modifiés** :
- `aides.prisma`
- `types.ts`
- `AidCalculator.tsx`
- `saveCriteriaAndCalculate.ts`
- `prepareApiParams.ts`
- `mesAidesRenoPublicodesClient.ts`

---

### 2024-12-06 - Correction majeure

**Problème** : API retournait "Variables manquantes" systématiquement

**Solutions appliquées** :
1. ✅ Supprimé espaces autour des points (`logement.type` au lieu de `logement . type`)
2. ✅ Corrigé booleans Publicodes (sans guillemets simples)
3. ✅ Ajouté `logement.résidence principale propriétaire`
4. ✅ Ajouté gestion du Coup de pouce
5. ✅ Ajouté arrondi des montants avec `Math.round()`
6. ✅ Supprimé affichage du "Total des aides"

**Résultat** :
- API fonctionne parfaitement
- Aucune variable manquante
- Montants corrects et arrondis

**Fichiers modifiés** :
- `mesAidesRenoPublicodesClient.ts`
- `saveCriteriaAndCalculate.ts`
- `AidCalculator.tsx`
- `tsconfig.json`
- `aides.prisma` (ajout surface_logement)
- `prepareApiParams.ts` (récupération surface depuis DB)
- `types.ts` (ajout surface_logement à interface)

---

**Dernière mise à jour** : 6 décembre 2024
