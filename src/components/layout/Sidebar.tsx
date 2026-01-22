'use client';

import { Camera, Barcode, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import Button from '@/components/ui/Button';

export type TabType = 'foto' | 'ean';

interface SidebarProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  isOpen: boolean;
  onClose: () => void;
}

const tabs: { id: TabType; label: string; icon: React.ElementType }[] = [
  { id: 'foto', label: 'Foto', icon: Camera },
  { id: 'ean', label: 'EAN', icon: Barcode },
];

export default function Sidebar({ activeTab, onTabChange, isOpen, onClose }: SidebarProps) {
  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 z-50 h-full w-56 transform transition-transform duration-300 ease-in-out',
          'lg:sticky lg:top-[60px] lg:h-[calc(100vh-60px)] lg:translate-x-0 lg:z-auto lg:flex-shrink-0',
          'bg-surface/80 backdrop-blur-xl border-r border-outline/20',
          'flex flex-col',
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Mobile Close Button */}
        <div className="flex items-center justify-between p-4 lg:hidden">
          <span className="text-lg font-semibold text-on-surface">Navigation</span>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            aria-label="Menü schließen"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Desktop Header */}
        <div className="hidden lg:block px-4 pt-4 pb-2">
          <span className="text-xs font-medium text-on-surface-variant uppercase tracking-wider">
            Bereich
          </span>
        </div>

        {/* Tab Navigation */}
        <nav className="px-3 py-2 space-y-1 flex-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => {
                  onTabChange(tab.id);
                  // Only close on mobile (when sidebar is open as overlay)
                  if (window.innerWidth < 1024) {
                    onClose();
                  }
                }}
                className={cn(
                  'w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200',
                  'text-left font-medium',
                  isActive
                    ? 'bg-primary text-on-primary shadow-lg shadow-primary/25'
                    : 'text-on-surface hover:bg-surface-variant/50'
                )}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Info Section - now at bottom using flex */}
        <div className="p-3 mt-auto">
          <div className="rounded-xl bg-surface-variant/30 p-3">
            <p className="text-xs text-on-surface-variant leading-relaxed">
              {activeTab === 'foto' 
                ? 'Wareneingangsfotos nach Positionen'
                : 'Artikelstammdaten importieren'
              }
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}
