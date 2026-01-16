'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import Link from 'next/link';

export default function RegisterPage() {
  const router = useRouter();
  const supabase = createClient();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (password !== confirmPassword) {
      setError('Passwörter stimmen nicht überein');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('Passwort muss mindestens 6 Zeichen lang sein');
      setLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;

      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Registrierung fehlgeschlagen');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md p-8 animate-fade-in">
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-success-light">
              <span className="text-3xl">✓</span>
            </div>
            <h2 className="mb-2 text-2xl font-bold text-on-surface">
              Registrierung erfolgreich!
            </h2>
            <p className="mb-6 text-on-surface-variant">
              Bitte überprüfen Sie Ihre E-Mails und bestätigen Sie Ihre Registrierung.
            </p>
            <Button onClick={() => router.push('/login')}>
              Zur Anmeldung
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md p-8 animate-fade-in">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-on-surface">Registrierung</h1>
          <p className="mt-2 text-on-surface-variant">
            Erstellen Sie Ihr RoFruWeb-Konto
          </p>
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
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

          <div>
            <label className="mb-2 block text-sm font-semibold text-on-surface">
              Passwort bestätigen
            </label>
            <Input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              required
              disabled={loading}
            />
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
            {loading ? 'Registrierung läuft...' : 'Registrieren'}
          </Button>

          <div className="text-center text-sm text-on-surface-variant">
            Bereits ein Konto?{' '}
            <Link href="/login" className="font-semibold text-primary hover:underline">
              Anmelden
            </Link>
          </div>
        </form>
      </Card>
    </div>
  );
}
