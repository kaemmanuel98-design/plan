import type { SpaceType } from '../types';
import { SPACE_ROLE_LABEL } from './auth';

export function mapAuthError(message: string): string {
  const lower = message.toLowerCase();

  if (lower.includes('only request this after') || lower.includes('rate limit')) {
    return 'Trop de tentatives. Patientez une minute avant de réessayer.';
  }
  if (lower.includes('user already registered') || lower.includes('already been registered')) {
    return 'Cet e-mail est déjà utilisé. Connectez-vous ou utilisez un autre e-mail.';
  }
  if (lower.includes('invalid login credentials')) {
    return 'E-mail ou mot de passe incorrect.';
  }
  if (lower.includes('email not confirmed')) {
    return 'Confirmez votre e-mail avant de vous connecter.';
  }
  if (lower.includes('non authentifié')) {
    return 'Session expirée. Réessayez de vous inscrire ou connectez-vous.';
  }
  if (lower.includes('déjà attribué') || lower.includes('already')) {
    return 'Ce rôle (Monsieur/Madame) est déjà pris. Choisissez l\'autre ou connectez-vous.';
  }
  if (lower.includes('couple est complet') || lower.includes('2 comptes')) {
    return 'Les 2 comptes du couple existent déjà. Utilisez Connexion.';
  }
  if (lower.includes('profil déjà créé')) {
    return 'Profil déjà existant. Utilisez Connexion.';
  }

  return message;
}

export interface SignupHints {
  spaceType: SpaceType;
  displayName: string;
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export { sleep };

export function displayNameFromMeta(
  metadata: Record<string, unknown> | undefined,
  spaceType: SpaceType
): string {
  const name = metadata?.display_name;
  if (typeof name === 'string' && name.trim()) return name.trim();
  return SPACE_ROLE_LABEL[spaceType];
}
