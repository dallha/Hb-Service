'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // MFA States
  const [isMfaStep, setIsMfaStep] = useState(false);
  const [mfaCode, setMfaCode] = useState('');
  const [factorId, setFactorId] = useState('');
  const [challengeId, setChallengeId] = useState('');

  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams?.get('redirect_to') || '/account';
  const supabase = createClient();
  const t = useTranslations('auth'); // Assuming we have auth translations, fallback to hardcoded text below for simplicity

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      toast.error(error.message);
      setIsLoading(false);
      return;
    }

    // Check if MFA is enabled for this user
    const { data: mfaData, error: mfaError } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
    if (mfaError) {
      toast.error(mfaError.message);
      setIsLoading(false);
      return;
    }

    if (mfaData?.nextLevel === 'aal2' && mfaData?.nextLevel !== mfaData?.currentLevel) {
      // User has MFA enabled but hasn't verified it yet
      const { data: factors, error: factorsError } = await supabase.auth.mfa.listFactors();
      if (factorsError || !factors.totp || factors.totp.length === 0) {
        toast.error("Erreur lors de la récupération des facteurs MFA.");
        setIsLoading(false);
        return;
      }
      
      const totpFactor = factors.totp[0];
      setFactorId(totpFactor.id);

      const { data: challenge, error: challengeError } = await supabase.auth.mfa.challenge({ factorId: totpFactor.id });
      if (challengeError) {
        toast.error(challengeError.message);
        setIsLoading(false);
        return;
      }

      setChallengeId(challenge.id);
      setIsMfaStep(true);
      setIsLoading(false);
      toast.info('Veuillez entrer votre code à 6 chiffres (MFA)');
    } else {
      // Sync user with Prisma just in case they don't exist
      await fetch('/api/users/sync-me', { method: 'POST' }).catch(() => {});
      
      toast.success('Connexion réussie !');
      router.push(redirectTo);
      router.refresh();
    }
  };

  const handleMfaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const { data, error } = await supabase.auth.mfa.verify({
      factorId,
      challengeId,
      code: mfaCode,
    });

    if (error) {
      toast.error("Code incorrect. Veuillez réessayer.");
      setIsLoading(false);
    } else {
      // Sync user with Prisma just in case they don't exist
      await fetch('/api/users/sync-me', { method: 'POST' }).catch(() => {});

      toast.success('Authentification MFA réussie !');
      router.push(redirectTo);
      router.refresh();
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-neutral-50 dark:bg-neutral-900">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full space-y-8 bg-white dark:bg-neutral-800 p-8 rounded-2xl shadow-xl"
      >
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-neutral-900 dark:text-white">
            {isMfaStep ? 'Double Authentification' : 'Connexion'}
          </h2>
          {!isMfaStep && (
            <p className="mt-2 text-center text-sm text-neutral-600 dark:text-neutral-400">
              Ou{' '}
              <Link href="/register" className="font-medium text-amber-600 hover:text-amber-500">
                créer un compte
              </Link>
            </p>
          )}
        </div>

        {!isMfaStep ? (
          <form className="mt-8 space-y-6" onSubmit={handleLogin}>
            <div className="space-y-4">
              <div>
                <Label htmlFor="email">Adresse E-mail</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1"
                  placeholder="vous@exemple.com"
                />
              </div>
              <div>
                <Label htmlFor="password">Mot de passe</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <Button type="submit" className="w-full bg-amber-600 hover:bg-amber-700 text-white" disabled={isLoading}>
              {isLoading ? 'Connexion en cours...' : 'Se connecter'}
            </Button>
          </form>
        ) : (
          <form className="mt-8 space-y-6" onSubmit={handleMfaSubmit}>
            <div className="space-y-4">
              <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                Veuillez entrer le code à 6 chiffres généré par votre application d'authentification (Google Authenticator, Authy, etc.).
              </p>
              <div>
                <Label htmlFor="mfaCode">Code de vérification</Label>
                <Input
                  id="mfaCode"
                  name="mfaCode"
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  pattern="[0-9]{6}"
                  maxLength={6}
                  required
                  value={mfaCode}
                  onChange={(e) => setMfaCode(e.target.value)}
                  className="mt-1 text-center text-2xl tracking-widest"
                  placeholder="123456"
                />
              </div>
            </div>

            <Button type="submit" className="w-full bg-amber-600 hover:bg-amber-700 text-white" disabled={isLoading || mfaCode.length !== 6}>
              {isLoading ? 'Vérification...' : 'Vérifier'}
            </Button>
            
            <div className="text-center mt-4">
              <button 
                type="button"
                onClick={() => {
                  setIsMfaStep(false);
                  setMfaCode('');
                }}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Retour à la connexion
              </button>
            </div>
          </form>
        )}
      </motion.div>
    </div>
  );
}
