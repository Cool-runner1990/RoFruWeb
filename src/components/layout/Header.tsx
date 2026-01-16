import { LogOut, Menu } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import ThemeToggle from './ThemeToggle';
import Image from 'next/image';

interface HeaderProps {
  onMenuClick?: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  return (
    <header className="sticky top-0 z-50 header-gradient px-4 py-2">
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        {/* Linke Seite - Menu Button */}
        <div className="flex items-center w-24">
          {onMenuClick && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onMenuClick}
              aria-label="Menü öffnen"
              className="lg:hidden text-white hover:bg-white/10"
            >
              <Menu className="h-5 w-5" />
            </Button>
          )}
        </div>

        {/* Mitte - Logo zentriert */}
        <div className="flex flex-col items-center justify-center flex-1">
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

        {/* Rechte Seite - Theme Toggle & Logout */}
        <div className="flex items-center gap-2 w-24 justify-end">
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
