import type { PillarId } from '../types/index.js';
import type { CascadePathNode } from './cascadePaths.js';

/** Index 0–23 du mois dans l'horizon 2 ans. */
export function globalMonthIndex(path: CascadePathNode): number {
  if (path.monthInQuarter <= 0) return 0;
  return (path.year - 1) * 12 + (path.semester - 1) * 6 + (path.quarterInSem - 1) * 3 + (path.monthInQuarter - 1);
}

export function quarterIndex(path: CascadePathNode): number {
  return (path.year - 1) * 4 + (path.semester - 1) * 2 + (path.quarterInSem - 1);
}

export function semesterIndex(path: CascadePathNode): number {
  return (path.year - 1) * 2 + (path.semester - 1);
}

const ANNUAL: Record<PillarId, [string, string]> = {
  financier: [
    'Poser budget, épargne automatique et plan de remboursement des dettes',
    'Accélérer investissements et sécuriser le patrimoine cible',
  ],
  sport_sante: [
    'Installer routines sport, sommeil et nutrition mesurables',
    'Atteindre la forme cible et stabiliser les habitudes sur 12 mois',
  ],
  carriere: [
    'Monter en compétences clés et livrer des résultats visibles',
    'Atteindre le poste ou projet pro visé et capitaliser l\'expertise',
  ],
  couple_famille: [
    'Renforcer fondations : communication, budget commun, projets partagés',
    'Réaliser le jalon familial fixé (foyer, mariage, enfant, etc.)',
  ],
  developpement: [
    'Lancer parcours d\'apprentissage structuré et pratique régulière',
    'Maîtriser la compétence ou livrer le projet perso de la vision',
  ],
};

const SEMESTER: Record<PillarId, string[]> = {
  financier: [
    'Semestre 1 An 1 : audit patrimonial et fondations d\'épargne',
    'Semestre 2 An 1 : optimisation revenus et premiers investissements',
    'Semestre 1 An 2 : accélération épargne et diversification',
    'Semestre 2 An 2 : consolidation et atteinte du cap patrimonial',
  ],
  sport_sante: [
    'S1 An 1 : créer routine hebdo et bases cardio / force',
    'S2 An 1 : progresser charges et habitudes sommeil',
    'S1 An 2 : pic de performance et nutrition affinée',
    'S2 An 2 : stabiliser forme cible et prévention rechute',
  ],
  carriere: [
    'S1 An 1 : compétences manquantes et visibilité interne',
    'S2 An 1 : livrables majeurs et réseau professionnel',
    'S1 An 2 : prise de poste / projet phare',
    'S2 An 2 : ancrage et reconnaissance durable',
  ],
  couple_famille: [
    'S1 An 1 : rituels à deux et alignement des priorités',
    'S2 An 1 : décisions structurantes (logement, budget, famille)',
    'S1 An 2 : exécution du grand projet commun',
    'S2 An 2 : célébration et ancrage du nouveau équilibre',
  ],
  developpement: [
    'S1 An 1 : fondations théoriques et pratique quotidienne',
    'S2 An 1 : projet pilote et retours d\'expérience',
    'S1 An 2 : montée en maîtrise et création visible',
    'S2 An 2 : aboutissement et transmission / portfolio',
  ],
};

const QUARTERLY: Record<PillarId, string[]> = {
  financier: [
    'T1 : bilan net et fonds d\'urgence initial',
    'T2 : réduction dettes et automatisation épargne',
    'T3 : premiers investissements alignés profil de risque',
    'T4 : revue annuelle et ajustement trajectoire patrimoine',
    'T5 : accélération flux et optimisation fiscale',
    'T6 : diversification et revenus complémentaires',
    'T7 : rapprochement du cap patrimonial (90 %)',
    'T8 : sécurisation finale et plan de maintien',
  ],
  sport_sante: [
    'T1 : évaluation forme et programme de base',
    'T2 : progression charge / volume mesurable',
    'T3 : nutrition et récupération optimisées',
    'T4 : bilan santé et objectifs année 1',
    'T5 : cycle performance intermédiaire',
    'T6 : affûtage avant objectif final',
    'T7 : test grandeur nature (course, examen forme)',
    'T8 : mode maintien et habitudes ancrées',
  ],
  carriere: [
    'T1 : cartographie compétences et plan montée en charge',
    'T2 : livrable visible #1 et feedback manager',
    'T3 : réseau ciblé et visibilité externe',
    'T4 : bilan pro année 1 et repositionnement',
    'T5 : candidature / négociation / lancement projet phare',
    'T6 : exécution du jalon pro majeur',
    'T7 : consolidation poste ou projet',
    'T8 : reconnaissance et pérennisation',
  ],
  couple_famille: [
    'T1 : vision à deux écrite et budget commun',
    'T2 : rituels hebdo et gestion des conflits',
    'T3 : décision structurante #1 (logement, date, etc.)',
    'T4 : bilan relationnel année 1',
    'T5 : exécution projet familial (étapes concrètes)',
    'T6 : soutien mutuel sur charges et énergie',
    'T7 : préparation événement / jalon majeur',
    'T8 : célébration et nouvel équilibre',
  ],
  developpement: [
    'T1 : choix focus et plan d\'étude / pratique',
    'T2 : projet mini livrable #1',
    'T3 : feedback externe et itération',
    'T4 : portfolio ou preuve année 1',
    'T5 : projet ambitieux lancé',
    'T6 : itération et montée en difficulté',
    'T7 : livrable final quasi terminé',
    'T8 : publication / certification / aboutissement',
  ],
};

const MONTHLY: Record<PillarId, string[]> = {
  financier: [
    'Auditer patrimoine net, revenus et dépenses réelles',
    'Constituer fonds d\'urgence = 1 mois de charges',
    'Automatiser virement épargne (10 % des revenus)',
    'Renégocier 3 postes de charges fixes',
    'Rembourser la dette au taux le plus élevé',
    'Ouvrir compte ou enveloppe dédiée au projet',
    'Budget mensuel par catégories (enveloppes)',
    'Action revenus : négo salariale, mission ou side-income',
    'Mettre en place tableau de bord patrimonial mensuel',
    'Atteindre 2 mois de charges en réserve',
    'Démarrer ou rééquilibrer placements (PEA, AV, etc.)',
    'Réduire dépenses variables de 5 % vs mois précédent',
    'Revue mi-parcours : ajuster trajectoire patrimoniale',
    'Atteindre 3 mois de réserve + diversification',
    'Optimiser fiscalité (déductions, timing, enveloppes)',
    'Accélérer remboursement dette ou versement investissement',
    'Mettre en place 2e flux de revenus ou optimisation',
    'Atteindre 4 mois de réserve liquidités',
    'Réallouer portfolio selon horizon 2 ans',
    'Bilan fin année 1 : patrimoine net vs cible intermédiaire',
    'Augmenter taux d\'épargne / investissement (An 2)',
    'Consolider actifs et réduire risques inutiles',
    'Atteindre 90 % du cap patrimonial visé',
    'Sécuriser le seuil final et planifier le maintien',
  ],
  sport_sante: [
    'Évaluation forme : poids, cardio, mobilité de base',
    'Programme 3 séances / semaine + marche quotidienne',
    'Suivi sommeil : horaires fixes 7 jours',
    'Nutrition : +1 repas équilibré / jour, - sucres ajoutés',
    'Test effort initial (chrono, charges, distance)',
    'Ajouter 1 séance force ou mobilité ciblée',
    'Hydratation et récupération : protocole simple',
    'Préparer événement sportif ou défi du mois',
    'Semaine allégée : focus récupération active',
    'Progression mesurable (+5 % volume ou intensité)',
    'Bilan nutrition avec ajustements macros',
    'Renforcer zone faible identifiée (dos, genoux, etc.)',
    'Revue mi-année : objectifs forme réalistes',
    'Cycle intensif 3 semaines + 1 semaine récup',
    'Travail spécifique objectif final (endurance / force)',
    'Sommeil : éliminer 1 habitudes perturbatrice',
    'Simulation conditions réelles de l\'objectif',
    'Affûtage : réduire volume, garder intensité',
    'Test blanc grandeur nature',
    'Bilan année 1 : photos, metrics, ressenti',
    'Plan An 2 : pic performance programmé',
    'Nutrition compétition / objectif final',
    'Dernière poussée avant objectif cible',
    'Mode maintien : routine minimum viable 12 mois',
  ],
  carriere: [
    'Lister compétences écart vs poste / projet cible',
    'Formation ciblée 5 h (cours, livre, mentorat)',
    'Livrable visible #1 pour l\'équipe ou le manager',
    '1:1 manager : aligner attentes et visibilité',
    'Portfolio ou doc de preuves de compétences',
    'Réseau : 4 contacts pro qualifiés ce mois',
    'Side project ou initiative interne à fort impact',
    'Feedback 360 ou retour pairs sur performance',
    'Candidature ou expression d\'intérêt poste cible',
    'Certification ou examen pro planifié',
    'Présentation / talk / article de visibilité',
    'Négociation salaire, scope ou ressources',
    'Revue carrière mi-parcours : ajuster plan',
    'Projet transverse à forte visibilité direction',
    'Mentorat ou coaching externe (1 session)',
    'Livrable majeur livré et documenté',
    'Entretiens ou processus sélection actif',
    'Offre reçue ou projet phare lancé',
    'Onboarding nouveau rôle ou périmètre élargi',
    'Bilan année 1 : compétences acquises vs cible',
    'Consolider expertise reconnue sur le marché',
    'Leadership : déléguer, former, visibilité',
    'Jalon pro final : promotion, launch ou signature',
    'Plan 12 mois post-objectif : pérenniser succès',
  ],
  couple_famille: [
    'Atelier vision à deux : écrire l\'objectif commun',
    'Budget couple : revenus, charges, épargne partagée',
    'Rituel hebdo : rendez-vous sans écran (2 h)',
    'Répartition tâches domestiques équitable',
    'Conversation finances long terme (sans conflit)',
    'Projet fun à deux (voyage, activité, date)',
    'Rencontre familiale ou belle-famille planifiée',
    'Décision logement ou localisation (recherche active)',
    'Désaccord récurrent : protocole de résolution',
    'Célébration petite victoire commune',
    'Planification événement majeur (mariage, bébé, etc.)',
    'Soutien charge mentale : check-in émotionnel',
    'Revue mi-parcours relation et projet',
    'Étape administrative projet commun (dossier, RDV)',
    'Week-end projet : avancée concrète visible',
    'Alignement valeurs éducation / famille / argent',
    'Préparation jalon majeur (déménagement, etc.)',
    'Rituels ancrés : 3 habitudes couple non négociables',
    'Gestion stress externe sans impact couple',
    'Bilan année 1 : progrès vs vision commune',
    'Exécution phase finale du grand projet',
    'Logistique et célébration étape clé',
    'Intégration nouvelle routine de vie',
    'Gratitude et plan entretien du projet accompli',
  ],
  developpement: [
    'Choisir ressource principale (livre, cours, mentor)',
    '20 min / jour pratique calendrier bloqué',
    'Premier mini-livrable (page, sketch, commit, enregistrement)',
    'Feedback externe sur travail en cours',
    'Projet guidé tutoriel de A à Z',
    'Deep work : 2 sessions 90 min sans distraction',
    'Rejoindre communauté ou groupe de pratique',
    'Itération v2 du mini-projet avec améliorations',
    'Documenter apprentissage (notes, blog, journal)',
    'Défi public ou accountability partner',
    'Compétence satellite complémentaire (1 module)',
    'Projet intermédiaire autonome',
    'Revue mi-parcours : ajuster méthode et rythme',
    'Projet plus ambitieux lancé (scope défini)',
    'Feedback expert ou pair avancé',
    'Perfectionner point faible identifié',
    'Préparer livrable final (structure, plan)',
    'Sprint final : 10 h pratique concentrée',
    'Test / présentation devant public restreint',
    'Bilan année 1 : portfolio ou preuves',
    'Projet capstone An 2 démarré',
    'Itérations finales qualité professionnelle',
    'Publication, certification ou showcase',
    'Plan maintien compétence sur 12 mois',
  ],
};

const WEEKLY_FOCUS = [
  'Structurer et lancer les actions du mois',
  'Exécuter le cœur du plan (priorité #1)',
  'Combler les écarts et ajuster le rythme',
  'Bilan partiel et préparation période suivante',
];

const DAILY_MICRO: Record<PillarId, string[]> = {
  financier: [
    'Saisir dépenses du jour et respecter enveloppe',
    'Vérifier soldes et virement épargne',
    '15 min veille opportunité revenus / investissement',
    'Comparer 1 offre pour réduire une charge',
    'Avancer sur remboursement dette (paiement ou appel)',
    'Mettre à jour tableau patrimoine',
    'Lire 1 article finance appliquée au projet',
    'Préparer décision investissement (sans exécuter si rush)',
  ],
  sport_sante: [
    'Séance planifiée ou marche 30 min minimum',
    'Étirements et mobilité 10 min',
    'Préparer repas / snacks alignés objectif',
    'Coucher heure cible (+ alarme matin)',
    'Hydratation : objectif litres du jour',
    'Noter énergie et douleurs éventuelles',
    'Récupération active ou repos programmé',
  ],
  carriere: [
    'Tâche pro priorité #1 (90 min focus)',
    'Message réseau ou relance contact clé',
    '30 min montée compétence ciblée',
    'Documenter livrable ou avancement visible',
    'Préparer point manager ou client',
    'Supprimer 1 tâche basse valeur de la semaine',
  ],
  couple_famille: [
    'Geste attention ou message sincère au partenaire',
    'Tâche domestique prise sans rappel',
    '15 min discussion projet commun sans téléphone',
    'Préparer moment qualité planifié',
    'Exprimer gratitude spécifique du jour',
    'Avancer 1 action admin projet à deux',
  ],
  developpement: [
    '20 min pratique calibrée (timer)',
    'Revue notes veille et objectif du jour',
    'Petit commit / page / répétition enregistrée',
    'Corriger 1 faiblesse identifiée hier',
    'Lire ou regarder 1 segment formation',
    'Partager progrès ou question à la communauté',
  ],
};

const BLOCK_ACTION: Record<PillarId, [string, string, string]> = {
  financier: [
    'Revue budget et épargne du jour',
    'Point dépenses / opportunité économie',
    'Action patrimoine : paiement, versement ou recherche',
  ],
  sport_sante: [
    'Séance ou échauffement matinal',
    'Marche active ou étirements midi',
    'Séance force / cardio du soir',
  ],
  carriere: [
    'Deep work tâche prioritaire',
    'Networking ou formation courte',
    'Finaliser livrable ou emails clés',
  ],
  couple_famille: [
    'Message ou geste attention partenaire',
    'Tâche maison ou admin couple',
    'Temps quality planifié ensemble',
  ],
  developpement: [
    'Pratique focus matinale',
    'Révision ou lecture technique',
    'Session création / code / écriture',
  ],
};

function trimTitle(title: string, max = 120): string {
  const t = title.trim();
  return t.length <= max ? t : `${t.slice(0, max - 1)}…`;
}

/** Référence vision uniquement pour descriptions — jamais répétée comme titre enfant. */
export function visionContextLabel(visionTitle: string): string {
  return visionTitle.trim();
}

export interface PlanTitleResult {
  title: string;
  description: string;
}

export function buildPlanTitle(
  path: CascadePathNode,
  pillarId: PillarId,
  visionTitle: string,
  visionDescription: string,
  swotHint = ''
): PlanTitleResult {
  const vision = visionContextLabel(visionTitle);
  const monthIdx = globalMonthIndex(path);
  const qIdx = quarterIndex(path);
  const sIdx = semesterIndex(path);

  switch (path.level) {
    case 'annual': {
      const action = ANNUAL[pillarId][path.year - 1];
      return {
        title: trimTitle(`An ${path.year} — ${action}`),
        description: trimTitle(
          `Jalon annuel ${path.year}/2 vers l'objectif global. ${swotHint}`.trim(),
          200
        ),
      };
    }

    case 'semester': {
      const action = SEMESTER[pillarId][sIdx] ?? SEMESTER[pillarId][0];
      return {
        title: trimTitle(action),
        description: trimTitle(
          `Objectifs sur 6 mois (semestre ${path.semester}, année ${path.year}). Étape intermédiaire du plan 2 ans.`,
          200
        ),
      };
    }

    case 'quarterly': {
      const action = QUARTERLY[pillarId][qIdx] ?? QUARTERLY[pillarId][0];
      return {
        title: trimTitle(action),
        description: trimTitle(
          `Trimestre ${qIdx + 1}/8 : action clé avant le jalon suivant. ${swotHint}`.trim(),
          200
        ),
      };
    }

    case 'monthly': {
      const action = MONTHLY[pillarId][monthIdx] ?? MONTHLY[pillarId][monthIdx % 24];
      return {
        title: trimTitle(`${path.periodLabel} — ${action}`),
        description: trimTitle(
          `Mois ${monthIdx + 1}/24 du plan. ${visionDescription || action}`,
          200
        ),
      };
    }

    case 'weekly': {
      const week = path.weekInMonth ?? 1;
      const focus = WEEKLY_FOCUS[week - 1] ?? WEEKLY_FOCUS[0];
      const monthAction = MONTHLY[pillarId][monthIdx] ?? '';
      return {
        title: trimTitle(`Semaine ${week} — ${focus}`),
        description: trimTitle(
          `Déclinaison hebdo du mois : ${monthAction.slice(0, 90)}`,
          200
        ),
      };
    }

    case 'daily': {
      const micro = DAILY_MICRO[pillarId];
      const dayIdx = path.dayInWeek ?? 0;
      const action = micro[(monthIdx * 6 + dayIdx + weekDayOffset(path)) % micro.length];
      const dayLabel = path.periodLabel?.split('—')[0]?.trim() ?? 'Aujourd\'hui';
      return {
        title: trimTitle(`${dayLabel} : ${action}`),
        description: trimTitle(
          `Micro-action du jour (semaine ${path.weekInMonth ?? 1}). Ne pas reporter.`,
          200
        ),
      };
    }

    case 'time_block': {
      const tbIdx = parseInt(path.path.split('.tb')[1] ?? '1', 10) - 1;
      const slot = path.periodLabel ?? '';
      const action = BLOCK_ACTION[pillarId][tbIdx] ?? BLOCK_ACTION[pillarId][0];
      const [start, end] = slot.split('–').map((s) => s.trim());
      return {
        title: trimTitle(`${start} – ${end} : ${action}`),
        description: trimTitle(`Bloc horaire dédié — exécuter sans multitâche.`),
      };
    }

    default:
      return { title: trimTitle(vision), description: trimTitle(visionDescription, 200) };
  }
}

function weekDayOffset(path: CascadePathNode): number {
  return (path.year ?? 1) * 7 + (path.weekInMonth ?? 1);
}

/** Garantit l'unicité des titres dans un plan généré. */
export function dedupePlanTitles<T extends { title: string }>(entries: [string, T][]): [string, T][] {
  const seen = new Map<string, number>();
  return entries.map(([key, item]) => {
    const base = item.title.trim();
    const count = seen.get(base) ?? 0;
    seen.set(base, count + 1);
    if (count === 0) return [key, item];
    return [key, { ...item, title: trimTitle(`${base} (v${count + 1})`) }];
  });
}
