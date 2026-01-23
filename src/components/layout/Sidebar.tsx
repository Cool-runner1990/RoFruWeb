'use client';

import { Camera, Barcode, Menu, ChevronLeft, Crown } from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';

export type TabType = 'foto' | 'ean' | 'admin';

interface SidebarProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  isOpen: boolean;
  onToggle: () => void;
}

interface TabConfig {
  id: TabType;
  label: string;
  icon: React.ElementType;
  isAdmin?: boolean;
}

const tabs: TabConfig[] = [
  { id: 'foto', label: 'Foto', icon: Camera },
  { id: 'ean', label: 'EAN', icon: Barcode },
  { id: 'admin', label: 'Admin', icon: Crown, isAdmin: true },
];

export default function Sidebar({ activeTab, onTabChange, isOpen, onToggle }: SidebarProps) {
  return (
    <aside
      className={cn(
        'fixed left-0 top-16 z-40 flex flex-col',
        'sidebar-gradient transition-all duration-300 ease-in-out',
        'border-r border-white/10',
        'h-[calc(100vh-4rem)]',
        isOpen ? 'w-56' : 'w-14'
      )}
    >
      {/* Toggle Button */}
      <div className="flex h-14 items-center px-3">
        <button
          onClick={onToggle}
          className="flex h-10 w-10 items-center justify-center rounded-lg text-white hover:bg-white/10 transition-colors"
          aria-label={isOpen ? 'Menü schließen' : 'Menü öffnen'}
        >
          {isOpen ? (
            <ChevronLeft className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>
      </div>

      {/* Tab Navigation */}
      <nav className="flex-1 px-2 py-2 space-y-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              title={!isOpen ? tab.label : undefined}
              className={cn(
                'w-full flex items-center gap-3 rounded-xl transition-all duration-200',
                isOpen ? 'px-4 py-3' : 'px-2 py-3 justify-center',
                'text-left font-medium',
                tab.isAdmin && 'admin-badge',
                tab.isAdmin && isActive && 'active',
                isActive
                  ? 'bg-white/20 text-white shadow-lg'
                  : tab.isAdmin
                    ? 'text-white/70 hover:text-white'
                    : 'text-white/70 hover:bg-white/10 hover:text-white'
              )}
            >
              <Icon className={cn(
                'h-5 w-5 flex-shrink-0',
                tab.isAdmin && 'admin-crown'
              )} />
              {isOpen && (
                <span className={cn(tab.isAdmin && 'admin-text font-semibold')}>
                  {tab.label}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer - Company Logo */}
      <div className={cn(
        'mt-auto p-3 flex flex-col items-center',
        isOpen ? 'gap-1' : 'gap-0'
      )}>
        {isOpen && (
          <span className="text-xs text-white/50">von</span>
        )}
        <div className={cn(
          'relative',
          isOpen ? 'h-24 w-24' : 'h-9 w-9'
        )}>
          <Image
            src="/logo-mobileobjects.png"
            alt="mobileObjects Logo"
            fill
            className="object-contain"
          />
        </div>
      </div>
    </aside>
  );
}
