'use client';

import { useState } from 'react';
import { X, Mail, Send, Loader2 } from 'lucide-react';
import Button from './Button';
import Input from './Input';
import { cn } from '@/lib/utils';

interface EmailDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSend: (email: string, subject: string, message: string) => Promise<void>;
  selectedCount: number;
  positionCode: string;
}

export default function EmailDialog({
  isOpen,
  onClose,
  onSend,
  selectedCount,
  positionCode,
}: EmailDialogProps) {
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState(`Fotos Position ${positionCode}`);
  const [message, setMessage] = useState(
    `Anbei erhalten Sie ${selectedCount} Foto(s) zur Position ${positionCode}.`
  );
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !email.includes('@')) {
      setError('Bitte geben Sie eine gültige E-Mail-Adresse ein.');
      return;
    }

    setIsSending(true);
    try {
      await onSend(email, subject, message);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler beim Senden der E-Mail');
    } finally {
      setIsSending(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-scrim/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Dialog */}
      <div className="relative z-10 w-full max-w-md animate-slide-up rounded-xl bg-surface p-6 shadow-xl">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <Mail className="h-5 w-5 text-primary" />
            </div>
            <h2 className="text-xl font-semibold text-on-surface">
              Fotos per E-Mail senden
            </h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-on-surface-variant transition-colors hover:bg-surface-variant"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Info */}
        <div className="mb-4 rounded-lg bg-surface-variant p-3 text-sm text-on-surface-variant">
          {selectedCount} Foto(s) ausgewählt
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="mb-1 block text-sm font-medium text-on-surface"
            >
              Empfänger E-Mail *
            </label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="empfaenger@beispiel.de"
              required
            />
          </div>

          <div>
            <label
              htmlFor="subject"
              className="mb-1 block text-sm font-medium text-on-surface"
            >
              Betreff
            </label>
            <Input
              id="subject"
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Betreff der E-Mail"
            />
          </div>

          <div>
            <label
              htmlFor="message"
              className="mb-1 block text-sm font-medium text-on-surface"
            >
              Nachricht
            </label>
            <textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Ihre Nachricht..."
              rows={4}
              className={cn(
                'w-full rounded-lg border border-outline bg-surface px-3 py-2 text-on-surface',
                'placeholder:text-on-surface-variant',
                'focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20',
                'resize-none'
              )}
            />
          </div>

          {error && (
            <div className="rounded-lg bg-error/10 p-3 text-sm text-error">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              disabled={isSending}
            >
              Abbrechen
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={isSending}
              className="gap-2"
            >
              {isSending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Wird gesendet...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Senden
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
