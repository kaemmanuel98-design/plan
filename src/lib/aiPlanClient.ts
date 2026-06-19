import { getPillar } from '../data/pillars';
import { getCascadePaths } from './cascadePaths';
import {
  generateSmartPlanMap,
  type PlanContent,
  type VisionPlanInput,
  type GeneratePlanOptions,
} from './smartPlanGenerator';
import { plansToDraft, type PlanDraft } from './planDraft';
import { getConfiguredSunsetTime } from './sabbath';

export type { VisionPlanInput, PlanContent, GeneratePlanOptions };
export type PlanSource = 'ai' | 'smart';

export interface GeneratePlanResult {
  plans: Record<string, PlanContent>;
  source: PlanSource;
  draft: PlanDraft;
}

function buildAiPrompt(input: VisionPlanInput, startDate: Date, now: Date, sunsetTime: string): string {
  const pillar = getPillar(input.pillarId);
  const paths = getCascadePaths(startDate, now);
  const pathList = paths
    .map((p) => {
      const extra =
        p.level === 'time_block'
          ? ' — inclure startTime et endTime (HH:MM) pour le time-blocking'
          : '';
      return `- "${p.path}" (${p.level}, ${p.periodLabel})${extra}`;
    })
    .join('\n');

  return `Tu es un coach expert en rétro-planification de vie sur 2 ans pour un couple.

VISION GLOBALE (2 ans) : "${input.title}"
DESCRIPTION : ${input.description || '(non renseignée)'}
PILIER DE VIE : ${pillar.label} — ${pillar.description}

SWOT :
- Forces : ${input.swot.strengths || '—'}
- Faiblesses : ${input.swot.weaknesses || '—'}
- Opportunités : ${input.swot.opportunities || '—'}
- Menaces : ${input.swot.threats || '—'}

Rétro-planifie depuis la vision jusqu'aux actions du jour :
- 2 objectifs annuels, 4 semestriels, 8 trimestriels, 24 mensuels (toute la période)
- Objectifs hebdomadaires UNIQUEMENT pour le mois en cours (jours dim.–ven. ; pas de samedi)
- Actions quotidiennes UNIQUEMENT pour la semaine en cours
- Blocs horaires (time_block) UNIQUEMENT pour le jour en cours avec startTime/endTime
- RESPECT DU SABBAT : aucune tâche ven. après le coucher du soleil → sam. avant le coucher du soleil ; le vendredi, blocs terminés avant ${sunsetTime}

PÉRIODES (clé JSON = path) :
${pathList}

Réponds UNIQUEMENT en JSON valide :
{
  "plans": {
    "1": { "title": "...", "description": "..." },
    "1.1.1.1.w1": { "title": "...", "description": "..." },
    "1.1.1.1.w1.d3.tb1": { "title": "07:00 – 08:00 : ...", "description": "...", "startTime": "07:00", "endTime": "08:00" }
  }
}

Règles STRICTES pour les titres :
- La vision globale (« ${input.title} ») ne doit JAMAIS être recopiée mot pour mot dans les titres des objectifs enfants
- Chaque titre = action concrète, mesurable, unique (verbe + quoi + résultat attendu)
- 24 titres mensuels TOUS différents, progressifs sur 2 ans vers la vision
- Titres annuels / semestriels / trimestriels : jalons spécifiques, pas de répétition
- Quotidien : micro-action du jour (pas le titre de la vision)
- time_block : format "HH:MM – HH:MM : activité précise"
- title max 120 car., description max 200 car., en français
- Chaque niveau découle logiquement du parent vers la vision sans copier-coller`;
}

export async function generateVisionPlan(
  input: VisionPlanInput,
  options: GeneratePlanOptions = {}
): Promise<GeneratePlanResult> {
  const startDate = options.startDate ?? new Date();
  const now = options.now ?? new Date();
  const sunsetTime = getConfiguredSunsetTime();
  const paths = getCascadePaths(startDate, now);
  const filteredPaths = options.tacticalOnly
    ? paths.filter((p) => p.level === 'weekly' || p.level === 'daily' || p.level === 'time_block')
    : paths;

  const smartFallback = (): GeneratePlanResult => {
    const plans = generateSmartPlanMap(input, { startDate, now, tacticalOnly: options.tacticalOnly });
    return {
      plans,
      source: 'smart',
      draft: plansToDraft(filteredPaths, plans, 'smart'),
    };
  };

  try {
    const res = await fetch('/api/generate-plan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...input,
        startDate: startDate.toISOString(),
        tacticalOnly: options.tacticalOnly,
        sunsetTime,
      }),
      signal: AbortSignal.timeout(55_000),
    });

    if (!res.ok) return smartFallback();

    const data = (await res.json()) as {
      plans?: Record<string, PlanContent>;
      source?: PlanSource;
    };

    if (!data.plans || Object.keys(data.plans).length < filteredPaths.length * 0.4) {
      return smartFallback();
    }

    const merged = { ...generateSmartPlanMap(input, { startDate, now, tacticalOnly: options.tacticalOnly }) };
    for (const [path, content] of Object.entries(data.plans)) {
      if (content?.title?.trim()) {
        merged[path] = {
          title: content.title.trim().slice(0, 120),
          description: (content.description ?? '').trim().slice(0, 200),
          startTime: content.startTime?.slice(0, 5),
          endTime: content.endTime?.slice(0, 5),
        };
      }
    }

    const source = data.source === 'ai' ? 'ai' : 'smart';
    return {
      plans: merged,
      source,
      draft: plansToDraft(filteredPaths, merged, source),
    };
  } catch {
    return smartFallback();
  }
}

export { buildAiPrompt };
