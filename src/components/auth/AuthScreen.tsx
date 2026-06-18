import { useEffect, useState } from 'react';
import type { SpaceType } from '../../types';
import { SPACE_ROLE_LABEL } from '../../lib/auth';
import { isSupabaseConfigured } from '../../lib/supabase';
import { useAuthStore } from '../../store/useAuthStore';
import { EmLogo } from '../brand/EmLogo';

type Mode = 'login' | 'signup';

export function AuthScreen() {
  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [spaceType, setSpaceType] = useState<SpaceType>('user_a');
  const [displayName, setDisplayName] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const signIn = useAuthStore((s) => s.signIn);
  const signUp = useAuthStore((s) => s.signUp);
  const authError = useAuthStore((s) => s.authError);
  const signupNotice = useAuthStore((s) => s.signupNotice);
  const slots = useAuthStore((s) => s.slots);
  const refreshSlots = useAuthStore((s) => s.refreshSlots);

  useEffect(() => {
    if (isSupabaseConfigured) refreshSlots();
  }, [refreshSlots]);

  const coupleFull = slots.user_a && slots.user_b;
  const canPickUserA = !slots.user_a;
  const canPickUserB = !slots.user_b;

  useEffect(() => {
    if (mode === 'signup') {
      if (canPickUserA && !canPickUserB) setSpaceType('user_a');
      else if (canPickUserB && !canPickUserA) setSpaceType('user_b');
    }
  }, [mode, canPickUserA, canPickUserB]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (mode === 'login') {
        await signIn(email.trim(), password);
      } else {
        await signUp(email.trim(), password, spaceType, displayName);
      }
    } catch {
      /* erreur dans le store */
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mobile-shell min-h-[100dvh] flex flex-col">
      <div className="mobile-container flex-1 flex flex-col justify-center py-12">
        <div className="mb-10 text-center">
          <EmLogo className="justify-center !text-[1.75rem]" />
          <p className="text-[11px] text-aw-faint mt-4 tracking-[0.15em] uppercase">
            Votre horizon à deux
          </p>
          <p className="text-[11px] text-aw-muted mt-2">
            Accès réservé — 2 comptes maximum
          </p>
        </div>

        {!isSupabaseConfigured && (
          <div
            className="mb-6 p-4 rounded-xl text-xs text-center leading-relaxed"
            style={{ backgroundColor: 'var(--aw-warm)', color: 'var(--aw-muted)' }}
          >
            Supabase n'est pas configuré sur ce déploiement.
            <br />
            Ajoutez <code className="text-[10px]">VITE_SUPABASE_URL</code> et{' '}
            <code className="text-[10px]">VITE_SUPABASE_ANON_KEY</code> dans Vercel, puis redéployez.
          </div>
        )}

        <div
          className="inline-flex p-0.5 rounded-full mx-auto mb-8"
          style={{ backgroundColor: 'var(--aw-warm)' }}
        >
          {(['login', 'signup'] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              className={`px-5 py-2 rounded-full text-xs font-medium transition-all ${
                mode === m ? 'bg-aw-white shadow-sm text-aw-black' : 'text-aw-faint'
              }`}
            >
              {m === 'login' ? 'Connexion' : 'Inscription'}
            </button>
          ))}
        </div>

        {signupNotice && (
          <p className="text-center text-xs text-emerald-700 dark:text-emerald-300 mb-6 px-4">
            {signupNotice}
          </p>
        )}

        {mode === 'signup' && coupleFull && (
          <p className="text-center text-xs text-amber-700 dark:text-amber-300 mb-6 px-4">
            Ce couple est complet. Seuls 2 comptes sont autorisés.
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && !coupleFull && (
            <>
              <div>
                <label className="aw-section-label block mb-2">Votre espace</label>
                <div className="grid grid-cols-2 gap-2">
                  {(
                    [
                      ['user_a', canPickUserA],
                      ['user_b', canPickUserB],
                    ] as const
                  ).map(([id, available]) => (
                    <button
                      key={id}
                      type="button"
                      disabled={!available}
                      onClick={() => setSpaceType(id)}
                      className={`py-3 rounded-xl text-sm font-medium border transition-all ${
                        spaceType === id
                          ? 'border-aw-accent bg-aw-accentSoft text-aw-black'
                          : 'border-aw-line text-aw-muted'
                      } ${!available ? 'opacity-40 cursor-not-allowed' : ''}`}
                    >
                      {SPACE_ROLE_LABEL[id]}
                      {!available && (
                        <span className="block text-[9px] text-aw-faint mt-0.5">Pris</span>
                      )}
                    </button>
                  ))}
                </div>
                <p className="text-[10px] text-aw-faint mt-2">
                  L'espace Couple est partagé automatiquement.
                </p>
              </div>
              <input
                className="input-field"
                placeholder="Prénom (optionnel)"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                autoComplete="name"
              />
            </>
          )}

          <input
            className="input-field"
            type="email"
            placeholder="E-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
          <input
            className="input-field"
            type="password"
            placeholder="Mot de passe"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
          />

          {authError && (
            <p className="text-xs text-center text-amber-700 dark:text-amber-300">{authError}</p>
          )}

          <button
            type="submit"
            className="btn-primary w-full"
            disabled={
              !isSupabaseConfigured || submitting || (mode === 'signup' && coupleFull)
            }
          >
            {submitting ? '…' : mode === 'login' ? 'Se connecter' : 'Créer mon compte'}
          </button>
        </form>
      </div>
    </div>
  );
}
