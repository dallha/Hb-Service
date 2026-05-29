'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, Eye, EyeOff, AlertTriangle, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface AdminLoginProps {
  onLoginSuccess: () => void;
}

export default function AdminLogin({ onLoginSuccess }: AdminLoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Email ou mot de passe incorrect');
      }

      onLoginSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="min-h-screen flex items-center justify-center bg-[#F8F7F5] px-4"
    >
      <div className="w-full max-w-sm">
        {/* Logo / Brand */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-[#1A1A1A] flex items-center justify-center mx-auto mb-4">
            <Lock className="w-6 h-6 text-[#D4AF37]" />
          </div>
          <h1 className="font-serif text-2xl text-[#1A1A1A] mb-1">
            Administration
          </h1>
          <p className="font-sans text-xs text-[#8C8C8C] tracking-wider uppercase">
            HB_Service
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8C8C8C]" />
            <Input
              type="email"
              placeholder="admin@hb-service.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-white border-[#E8E0D5] rounded-none font-sans text-sm h-12 pl-10"
              autoFocus
              disabled={loading}
              autoComplete="email"
            />
          </div>

          <div className="relative">
            <Input
              type={showPassword ? 'text' : 'password'}
              placeholder="Mot de passe"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-white border-[#E8E0D5] rounded-none font-sans text-sm h-12 pr-10"
              disabled={loading}
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8C8C8C] hover:text-[#1A1A1A] transition-colors"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 p-3 bg-[#C44536]/10 border border-[#C44536]/20"
            >
              <AlertTriangle className="w-4 h-4 text-[#C44536] shrink-0" />
              <p className="font-sans text-xs text-[#C44536]">{error}</p>
            </motion.div>
          )}

          <Button
            type="submit"
            disabled={loading || !email || !password}
            className="w-full bg-[#1A1A1A] hover:bg-[#1A1A1A]/90 text-[#F8F7F5] rounded-none font-sans text-xs tracking-wider uppercase h-12"
          >
            {loading ? 'Connexion...' : 'Se connecter'}
          </Button>
        </form>

        <p className="mt-6 text-center font-sans text-[10px] text-[#8C8C8C]">
          Accès réservé aux administrateurs
        </p>
      </div>
    </motion.div>
  );
}
