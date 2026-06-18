# VisionDual

Application web de planification stratégique de vie sur 2 ans pour couples.

## Fonctionnalités

- **3 espaces** : Mon Espace, Son Espace, Notre Espace (commun)
- **5 piliers de vie** avec codes couleur et icônes
- **Cascade d'objectifs** sur 8 niveaux (Vision → Actions horaires)
- **Wizard SWOT & SMART** pour les visions globales
- **Progression dynamique** avec barres de pourcentage
- **Suggestions IA** de sous-tâches contextuelles
- **To-Do quotidienne** avec lien vers la vision racine
- **Time-blocking** pour planification horaire
- **Confettis** lors de la complétion d'objectifs majeurs

## Démarrage

```bash
npm install
npm run dev
```

## Base de données

Le schéma PostgreSQL/Supabase se trouve dans `supabase/schema.sql`.

### Connexion Supabase

1. Créez un projet sur [supabase.com](https://supabase.com)
2. Exécutez le script SQL dans l'éditeur SQL
3. Configurez les variables d'environnement :

```env
VITE_SUPABASE_URL=your-project-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## Stack technique

- React 18 + TypeScript + Vite
- Tailwind CSS (mode sombre)
- Zustand (état + persistance localStorage)
- Framer Motion (animations)
- canvas-confetti (célébrations)
