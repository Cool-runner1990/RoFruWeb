'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import Link from 'next/link';
import Image from 'next/image';
import { AppleCharacter, OrangeCharacter, GrapesCharacter } from '@/components/ui/FruitCharacters';

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      router.push('/');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Anmeldung fehlgeschlagen');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-background p-4 overflow-hidden">
      {/* Dekorative Früchte im Hintergrund */}
      <div className="absolute top-10 left-10 opacity-20">
        <AppleCharacter size={80} className="animate-bounce-slow" />
      </div>
      <div className="absolute top-20 right-16 opacity-20">
        <GrapesCharacter size={70} className="animate-bounce-slow delay-200" />
      </div>
      <div className="absolute bottom-16 left-20 opacity-20">
        <OrangeCharacter size={75} className="animate-bounce-slow delay-300" />
      </div>
      <div className="absolute bottom-10 right-10 opacity-20">
        <AppleCharacter size={65} className="animate-bounce-slow delay-100" />
      </div>

      <Card className="relative z-10 w-full max-w-md p-8 animate-fade-in">
        <div className="mb-8 text-center">
          <div className="mb-4 flex justify-center">
            <div className="relative h-24 w-48">
              <Image
                src="/logo-header.png"
                alt="Rodifructus Logo"
                fill
                className="object-contain"
                priority
              />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-on-surface">RoFruWeb</h1>
          <p className="mt-2 text-on-surface-variant">
            Wareneingangsfotos verwalten
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-semibold text-on-surface">
              E-Mail
            </label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@firma.de"
              required
              disabled={loading}
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-on-surface">
              Passwort
            </label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              disabled={loading}
            />
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 rounded border-outline accent-primary"
              />
              <span className="text-sm text-on-surface-variant">
                Angemeldet bleiben
              </span>
            </label>
            <Link
              href="/reset-password"
              className="text-sm text-primary hover:underline"
            >
              Passwort vergessen?
            </Link>
          </div>

          {error && (
            <div className="rounded-lg bg-error-light p-3 text-sm text-error">
              {error}
            </div>
          )}

          <Button
            type="submit"
            className="w-full"
            disabled={loading}
          >
            {loading ? 'Anmeldung läuft...' : 'Anmelden'}
          </Button>

          <div className="text-center text-sm text-on-surface-variant">
            Noch kein Konto?{' '}
            <Link href="/register" className="font-semibold text-primary hover:underline">
              Registrieren
            </Link>
          </div>
        </form>
      </Card>
    </div>
  );
}
