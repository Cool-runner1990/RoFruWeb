'use client';

import { PositionCategory, POSITION_CATEGORIES } from '@/types';
import { cn } from '@/lib/utils';
import { Tag, ChevronDown } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

interface CategorySelectorProps {
  value: PositionCategory;
  onChange: (category: PositionCategory) => void;
  disabled?: boolean;
}

export default function CategorySelector({
  value,
  onChange,
  disabled = false,
}: CategorySelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedCategory = POSITION_CATEGORIES.find((c) => c.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={cn(
          'flex items-center gap-2 rounded-lg border border-outline px-3 py-2 text-sm transition-colors',
          'hover:bg-surface-variant focus:outline-none focus:ring-2 focus:ring-primary',
          disabled && 'cursor-not-allowed opacity-50'
        )}
      >
        <Tag className="h-4 w-4 text-on-surface-variant" />
        {selectedCategory ? (
          <span className="flex items-center gap-2">
            <span
              className={cn('h-3 w-3 rounded-full', selectedCategory.color)}
            />
            {selectedCategory.label}
          </span>
        ) : (
          <span className="text-on-surface-variant">Kategorie wählen</span>
        )}
        <ChevronDown
          className={cn(
            'ml-1 h-4 w-4 transition-transform',
            isOpen && 'rotate-180'
          )}
        />
      </button>

      {isOpen && (
        <div className="absolute left-0 top-full z-50 mt-1 w-48 rounded-lg border border-outline bg-surface shadow-lg">
          <div className="p-1">
            {POSITION_CATEGORIES.map((category) => (
              <button
                key={category.value || 'none'}
                onClick={() => {
                  onChange(category.value);
                  setIsOpen(false);
                }}
                className={cn(
                  'flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors',
                  'hover:bg-surface-variant',
                  value === category.value && 'bg-primary/10 text-primary'
                )}
              >
                <span className={cn('h-3 w-3 rounded-full', category.color)} />
                {category.label}
              </button>
            ))}
            {value && (
              <>
                <div className="my-1 border-t border-outline" />
                <button
                  onClick={() => {
                    onChange(null);
                    setIsOpen(false);
                  }}
                  className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-on-surface-variant transition-colors hover:bg-surface-variant"
                >
                  Kategorie entfernen
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
