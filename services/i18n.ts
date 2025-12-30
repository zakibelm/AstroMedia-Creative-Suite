
import { useState, useEffect, createContext, useContext } from 'react';

export type Language = 'fr' | 'en';

export const translations = {
  fr: {
    nav: {
      dashboard: "Tableau de bord",
      campaign: "Créateur de Campagne",
      studio: "Studio Créatif",
      library: "Médiathèque",
      analytics: "Analyses",
      settings: "Paramètres"
    },
    system: {
      nominal: "Système Nominal",
      alpha: "v4.2.0-Alpha",
      welcome: "John Doe",
      plan: "Plan Premium"
    },
    dashboard: {
      title: "Commande Système",
      subtitle: "Hub global d'orchestration créative et statut des agents autonomes.",
      initiate: "+ Initier Campagne",
      stats: {
        reach: "Portée Réseau",
        conversion: "Delta Conversion",
        throughput: "Flux d'Actifs",
        roi: "ROI Campagne"
      },
      intelligence: "Intelligence d'Engagement",
      pipeline: "Pipeline de Campagne",
      ingestions: "Ingestions Temps Réel",
      transmission: "Pulse de Transmission",
      viewAll: "Voir Tout",
      openVault: "Ouvrir le Coffre →",
      goStudio: "Console de Diffusion →",
      emptyPipeline: "Aucune campagne active ou planifiée.",
      scheduledPrefix: "Planifié pour : "
    },
    campaign: {
      title: "Orchestrateur de Campagne",
      subtitle: "Configurez votre stratégie de routage LLM multi-agents.",
      steps: {
        objectives: "Objectifs Principaux",
        triggers: "Déclencheurs de Flux",
        review: "Revue de Déploiement"
      },
      goals: {
        engagement: "Engagement",
        conversion: "Conversion",
        awareness: "Notoriété"
      },
      launch: "Lancer le Déploiement",
      schedule: "Planifier la campagne",
      temporal: "Planification Temporelle",
      scheduleLabel: "Diffusion à un créneau spécifique",
      autoTriggerNote: "* Le nœud de déploiement automatique se déclenchera à l'horodatage sélectionné.",
      prev: "← Précédent",
      continue: "Continuer l'Exécution →",
      transmissionNote: "Prêt pour la transmission. Tous les actifs liés seront automatiquement routés.",
      scheduledNote: "Transmission planifiée. La campagne entrera dans la file d'attente multi-agents à l'heure spécifiée.",
      identifier: "Identifiant de Campagne",
      optGoal: "Objectif d'Optimisation"
    },
    studio: {
      title: "Studio Créatif",
      subtitle: "Matérialisez votre vision et déployez-la dans le monde.",
      tabs: {
        image: "Gén. Image",
        video: "Gén. Vidéo",
        library: "Bibliothèque",
        publish: "Publier"
      }
    },
    publish: {
      title: "Console de Diffusion",
      auth: "Authentification Service",
      source: "Matériel Source",
      target: "Cible de Diffusion",
      narrative: "Récit d'Engagement",
      execute: "Exécuter la Diffusion",
      logs: "Logs de Transmission"
    }
  },
  en: {
    nav: {
      dashboard: "Dashboard",
      campaign: "Campaign Builder",
      studio: "Creative Studio",
      library: "Content Library",
      analytics: "Analytics",
      settings: "Settings"
    },
    system: {
      nominal: "System Nominal",
      alpha: "v4.2.0-Alpha",
      welcome: "John Doe",
      plan: "Premium Plan"
    },
    dashboard: {
      title: "System Command",
      subtitle: "Global creative orchestration hub and autonomous agent status.",
      initiate: "+ Initiate Campaign",
      stats: {
        reach: "Network Reach",
        conversion: "Conversion Delta",
        throughput: "Asset Throughput",
        roi: "Campaign ROI"
      },
      intelligence: "Engagement Intelligence",
      pipeline: "Campaign Pipeline",
      ingestions: "Real-time Ingestions",
      transmission: "Transmission Pulse",
      viewAll: "View All",
      openVault: "Open Repository Vault →",
      goStudio: "Go to Broadcast Console →",
      emptyPipeline: "No active or scheduled campaigns.",
      scheduledPrefix: "Scheduled for: "
    },
    campaign: {
      title: "Campaign Orchestrator",
      subtitle: "Configure your multi-armed bandit LLM routing strategy.",
      steps: {
        objectives: "Core Objectives",
        triggers: "Workflow Triggers",
        review: "Deployment Review"
      },
      goals: {
        engagement: "Engagement",
        conversion: "Conversion",
        awareness: "Awareness"
      },
      launch: "Launch Deployment",
      schedule: "Schedule Campaign",
      temporal: "Temporal Scheduling",
      scheduleLabel: "Broadcast at a specific window",
      autoTriggerNote: "* Automatic deployment node will trigger at selected timestamp.",
      prev: "← Previous",
      continue: "Continue Execution →",
      transmissionNote: "Ready for transmission. All assets linked will be automatically routed.",
      scheduledNote: "Transmission scheduled. The campaign will enter the multi-agent queue at the specified time.",
      identifier: "Campaign Identifier",
      optGoal: "Optimization Goal"
    },
    studio: {
      title: "Creative Studio",
      subtitle: "Materialize your vision and deploy to the world.",
      tabs: {
        image: "Image Gen",
        video: "Video Gen",
        library: "Library",
        publish: "Publish"
      }
    },
    publish: {
      title: "Broadcast Console",
      auth: "Service Authentication",
      source: "Source Material",
      target: "Dispatch Target",
      narrative: "Engagement Narrative",
      execute: "Execute Broadcast",
      logs: "Transmission Logs"
    }
  }
};

type I18nContextType = {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: string) => any;
};

export const I18nContext = createContext<I18nContextType | undefined>(undefined);

export const useTranslation = () => {
  const context = useContext(I18nContext);
  if (!context) throw new Error("useTranslation must be used within I18nProvider");
  return context;
};
