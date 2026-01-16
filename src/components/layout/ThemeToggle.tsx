'use client';

import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@/lib/hooks/useTheme';
import Button from '@/components/ui/Button';

interface ThemeToggleProps {
  className?: string;
}

export default function ThemeToggle({ className }: ThemeToggleProps) {
  const { theme, setTheme, resolvedTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      aria-label="Theme wechseln"
      className={className}
    >
      {resolvedTheme === 'dark' ? (
        <Sun className="h-5 w-5" />
      ) : (
        <Moon className="h-5 w-5" />
      )}
    </Button>
  );
}
