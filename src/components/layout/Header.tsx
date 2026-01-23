'use client';

import { LogOut } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import ThemeToggle from './ThemeToggle';
import Image from 'next/image';

export default function Header() {
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 header-gradient px-4 py-2">
      <div className="relative flex items-center justify-center h-12">
        {/* Zentral - Logo */}
        <div className="flex items-center">
          <div className="relative h-12 w-48">
            <Image
              src="/logo-header.png"
              alt="Rodifructus Logo"
              fill
              className="object-contain"
              priority
            />
          </div>
        </div>

        {/* Rechte Seite - Theme Toggle & Logout (absolut positioniert) */}
        <div className="absolute right-0 flex items-center gap-2">
          <ThemeToggle className="text-white hover:bg-white/10" />
          <Button
            variant="ghost"
            size="icon"
            onClick={handleLogout}
            aria-label="Abmelden"
            className="text-white hover:bg-white/10"
          >
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}
