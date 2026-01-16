'use client';

import { cn } from '@/lib/utils';

interface FruitProps {
  className?: string;
  size?: number;
}

// Trauriger Apfel - für Reklamationen
export function SadAppleCharacter({ className, size = 48 }: FruitProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className={cn('drop-shadow-lg', className)}
    >
      {/* Stiel */}
      <path d="M50 8 L50 18" stroke="#6B4423" strokeWidth="4" strokeLinecap="round" />
      {/* Blatt - etwas welk */}
      <ellipse cx="58" cy="12" rx="10" ry="6" fill="#8BC34A" transform="rotate(35 58 12)" />
      <path d="M50 14 Q58 12 62 18" stroke="#689F38" strokeWidth="1.5" fill="none" />
      
      {/* Apfel-Körper - etwas blasser */}
      <defs>
        <radialGradient id="sadAppleGrad" cx="35%" cy="35%" r="60%">
          <stop offset="0%" stopColor="#EF5350" />
          <stop offset="50%" stopColor="#E53935" />
          <stop offset="100%" stopColor="#C62828" />
        </radialGradient>
      </defs>
      <ellipse cx="50" cy="58" rx="34" ry="36" fill="url(#sadAppleGrad)" />
      
      {/* Einbuchtung oben */}
      <ellipse cx="50" cy="24" rx="8" ry="4" fill="#C62828" />
      
      {/* Highlight/Glanz */}
      <ellipse cx="36" cy="45" rx="8" ry="12" fill="#EF9A9A" opacity="0.5" />
      <circle cx="32" cy="40" r="4" fill="white" opacity="0.4" />
      
      {/* Traurige Augen - nach unten gebogen */}
      <path d="M34 52 Q38 58 42 52" stroke="#4A2C2A" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <path d="M58 52 Q62 58 66 52" stroke="#4A2C2A" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      
      {/* Träne */}
      <ellipse cx="68" cy="58" rx="3" ry="5" fill="#64B5F6" opacity="0.8" />
      
      {/* Trauriger Mund - nach unten */}
      <path d="M40 75 Q50 65 60 75" stroke="#4A2C2A" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      
      {/* Blassere Wangen */}
      <ellipse cx="30" cy="65" rx="6" ry="4" fill="#FFAB91" opacity="0.4" />
      <ellipse cx="70" cy="65" rx="6" ry="4" fill="#FFAB91" opacity="0.4" />
    </svg>
  );
}

// Lächelnder Apfel - exakt wie im Logo
export function AppleCharacter({ className, size = 48 }: FruitProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className={cn('drop-shadow-lg', className)}
    >
      {/* Stiel */}
      <path d="M50 8 L50 18" stroke="#6B4423" strokeWidth="4" strokeLinecap="round" />
      {/* Blatt */}
      <ellipse cx="58" cy="12" rx="10" ry="6" fill="#4CAF50" transform="rotate(25 58 12)" />
      <path d="M50 14 Q58 10 62 16" stroke="#388E3C" strokeWidth="1.5" fill="none" />
      
      {/* Apfel-Körper - 3D Gradient Look */}
      <defs>
        <radialGradient id="appleGrad" cx="35%" cy="35%" r="60%">
          <stop offset="0%" stopColor="#EF5350" />
          <stop offset="50%" stopColor="#E53935" />
          <stop offset="100%" stopColor="#C62828" />
        </radialGradient>
      </defs>
      <ellipse cx="50" cy="58" rx="34" ry="36" fill="url(#appleGrad)" />
      
      {/* Einbuchtung oben */}
      <ellipse cx="50" cy="24" rx="8" ry="4" fill="#C62828" />
      
      {/* Highlight/Glanz */}
      <ellipse cx="36" cy="45" rx="8" ry="12" fill="#EF9A9A" opacity="0.5" />
      <circle cx="32" cy="40" r="4" fill="white" opacity="0.4" />
      
      {/* Gesicht - geschlossene ^_^ Augen wie im Logo */}
      <path d="M34 56 Q38 50 42 56" stroke="#4A2C2A" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <path d="M58 56 Q62 50 66 56" stroke="#4A2C2A" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      
      {/* Lächeln */}
      <path d="M40 70 Q50 80 60 70" stroke="#4A2C2A" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      
      {/* Rosa Wangen */}
      <ellipse cx="30" cy="65" rx="6" ry="4" fill="#FFAB91" opacity="0.7" />
      <ellipse cx="70" cy="65" rx="6" ry="4" fill="#FFAB91" opacity="0.7" />
    </svg>
  );
}

// Lächelnde Birne - exakt wie im Logo
export function PearCharacter({ className, size = 48 }: FruitProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 110"
      className={cn('drop-shadow-lg', className)}
    >
      {/* Stiel */}
      <path d="M50 4 L48 14" stroke="#6B4423" strokeWidth="4" strokeLinecap="round" />
      {/* Blatt */}
      <ellipse cx="56" cy="8" rx="8" ry="5" fill="#4CAF50" transform="rotate(20 56 8)" />
      
      {/* Birnen-Körper - charakteristische Form */}
      <defs>
        <radialGradient id="pearGrad" cx="35%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#E6D87A" />
          <stop offset="50%" stopColor="#D4C36A" />
          <stop offset="100%" stopColor="#B8A84F" />
        </radialGradient>
      </defs>
      
      {/* Birnenform - schmaler oben, breiter unten */}
      <path d="M50 16 
               C35 16 28 28 28 40
               C28 52 20 70 20 82
               C20 100 35 106 50 106
               C65 106 80 100 80 82
               C80 70 72 52 72 40
               C72 28 65 16 50 16" 
            fill="url(#pearGrad)" />
      
      {/* Highlight/Glanz */}
      <ellipse cx="38" cy="50" rx="8" ry="18" fill="#F5F0C4" opacity="0.5" />
      <circle cx="35" cy="42" r="4" fill="white" opacity="0.4" />
      
      {/* Gesicht - kleine Punkt-Augen wie im Logo */}
      <circle cx="38" cy="70" r="3" fill="#4A2C2A" />
      <circle cx="62" cy="70" r="3" fill="#4A2C2A" />
      
      {/* Lächeln */}
      <path d="M42 85 Q50 93 58 85" stroke="#4A2C2A" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      
      {/* Rosa Wangen */}
      <ellipse cx="30" cy="78" rx="6" ry="4" fill="#FFAB91" opacity="0.7" />
      <ellipse cx="70" cy="78" rx="6" ry="4" fill="#FFAB91" opacity="0.7" />
    </svg>
  );
}

// Lächelnde Zitrone - exakt wie im Logo
export function LemonCharacter({ className, size = 48 }: FruitProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className={cn('drop-shadow-lg', className)}
    >
      {/* Blatt oben */}
      <ellipse cx="50" cy="10" rx="6" ry="4" fill="#4CAF50" />
      
      {/* Zitronen-Körper - ovale Form mit Spitzen */}
      <defs>
        <radialGradient id="lemonGrad" cx="35%" cy="35%" r="60%">
          <stop offset="0%" stopColor="#FFF59D" />
          <stop offset="50%" stopColor="#FFEB3B" />
          <stop offset="100%" stopColor="#F9A825" />
        </radialGradient>
      </defs>
      
      {/* Zitronenform */}
      <ellipse cx="50" cy="55" rx="32" ry="38" fill="url(#lemonGrad)" />
      {/* Spitze oben */}
      <ellipse cx="50" cy="20" rx="12" ry="8" fill="url(#lemonGrad)" />
      {/* Spitze unten */}
      <ellipse cx="50" cy="90" rx="8" ry="6" fill="url(#lemonGrad)" />
      
      {/* Highlight/Glanz */}
      <ellipse cx="38" cy="42" rx="6" ry="12" fill="#FFFDE7" opacity="0.6" />
      <circle cx="35" cy="36" r="3" fill="white" opacity="0.5" />
      
      {/* Gesicht - kleine Punkt-Augen wie im Logo */}
      <circle cx="38" cy="52" r="3" fill="#4A2C2A" />
      <circle cx="62" cy="52" r="3" fill="#4A2C2A" />
      
      {/* Lächeln */}
      <path d="M42 68 Q50 76 58 68" stroke="#4A2C2A" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      
      {/* Rosa Wangen */}
      <ellipse cx="30" cy="60" rx="5" ry="3.5" fill="#FFAB91" opacity="0.7" />
      <ellipse cx="70" cy="60" rx="5" ry="3.5" fill="#FFAB91" opacity="0.7" />
    </svg>
  );
}

// Lächelnde Orange - exakt wie im Logo
export function OrangeCharacter({ className, size = 48 }: FruitProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className={cn('drop-shadow-lg', className)}
    >
      {/* Blatt oben */}
      <ellipse cx="50" cy="10" rx="8" ry="5" fill="#4CAF50" />
      <path d="M50 10 L50 18" stroke="#6B4423" strokeWidth="2" />
      
      {/* Orangen-Körper */}
      <defs>
        <radialGradient id="orangeGrad" cx="35%" cy="35%" r="60%">
          <stop offset="0%" stopColor="#FFB74D" />
          <stop offset="50%" stopColor="#FF9800" />
          <stop offset="100%" stopColor="#E65100" />
        </radialGradient>
      </defs>
      <circle cx="50" cy="55" r="38" fill="url(#orangeGrad)" />
      
      {/* Highlight/Glanz */}
      <ellipse cx="35" cy="40" rx="8" ry="12" fill="#FFCC80" opacity="0.5" />
      <circle cx="32" cy="35" r="4" fill="white" opacity="0.4" />
      
      {/* Gesicht - geschlossene ^_^ Augen wie im Logo */}
      <path d="M32 52 Q36 46 40 52" stroke="#4A2C2A" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <path d="M60 52 Q64 46 68 52" stroke="#4A2C2A" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      
      {/* Offener lächelnder Mund wie im Logo */}
      <path d="M38 68 Q50 82 62 68" stroke="#4A2C2A" strokeWidth="2.5" fill="#4A2C2A" strokeLinecap="round" />
      
      {/* Rosa Wangen */}
      <ellipse cx="28" cy="62" rx="6" ry="4" fill="#FFAB91" opacity="0.7" />
      <ellipse cx="72" cy="62" rx="6" ry="4" fill="#FFAB91" opacity="0.7" />
    </svg>
  );
}

// Trauben - exakt wie im Logo
export function GrapesCharacter({ className, size = 48 }: FruitProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 110"
      className={cn('drop-shadow-lg', className)}
    >
      {/* Stiel */}
      <path d="M50 2 C50 2 48 8 50 12" stroke="#6B4423" strokeWidth="3" strokeLinecap="round" />
      
      {/* Großes Blatt wie im Logo */}
      <path d="M52 8 Q70 2 75 15 Q68 20 60 18 Q55 22 50 12" fill="#4CAF50" />
      <path d="M55 12 Q62 8 68 14" stroke="#388E3C" strokeWidth="1" fill="none" />
      
      {/* Trauben-Beeren mit Gradient */}
      <defs>
        <radialGradient id="grapeGrad1" cx="35%" cy="35%" r="60%">
          <stop offset="0%" stopColor="#C5E1A5" />
          <stop offset="100%" stopColor="#7CB342" />
        </radialGradient>
        <radialGradient id="grapeGrad2" cx="35%" cy="35%" r="60%">
          <stop offset="0%" stopColor="#AED581" />
          <stop offset="100%" stopColor="#689F38" />
        </radialGradient>
      </defs>
      
      {/* Obere Reihe */}
      <circle cx="38" cy="28" r="12" fill="url(#grapeGrad1)" />
      <circle cx="62" cy="28" r="12" fill="url(#grapeGrad1)" />
      <circle cx="50" cy="24" r="12" fill="url(#grapeGrad2)" />
      
      {/* Mittlere Reihe */}
      <circle cx="30" cy="48" r="12" fill="url(#grapeGrad1)" />
      <circle cx="50" cy="44" r="12" fill="url(#grapeGrad2)" />
      <circle cx="70" cy="48" r="12" fill="url(#grapeGrad1)" />
      
      {/* Untere Reihe */}
      <circle cx="38" cy="66" r="12" fill="url(#grapeGrad1)" />
      <circle cx="62" cy="66" r="12" fill="url(#grapeGrad1)" />
      
      {/* Unterste Beere */}
      <circle cx="50" cy="84" r="12" fill="url(#grapeGrad2)" />
      
      {/* Highlights auf einigen Beeren */}
      <circle cx="34" cy="24" r="3" fill="white" opacity="0.4" />
      <circle cx="46" cy="20" r="3" fill="white" opacity="0.4" />
      <circle cx="58" cy="24" r="3" fill="white" opacity="0.4" />
      <circle cx="46" cy="40" r="3" fill="white" opacity="0.4" />
      <circle cx="34" cy="62" r="3" fill="white" opacity="0.4" />
      <circle cx="46" cy="80" r="3" fill="white" opacity="0.4" />
    </svg>
  );
}

// Alle Früchte zusammen als Gruppe
export function FruitGroup({ className }: { className?: string }) {
  return (
    <div className={cn('flex items-end justify-center gap-2', className)}>
      <AppleCharacter size={40} className="animate-bounce-slow" />
      <PearCharacter size={44} className="animate-bounce-slow delay-100" />
      <LemonCharacter size={36} className="animate-bounce-slow delay-200" />
      <OrangeCharacter size={40} className="animate-bounce-slow delay-300" />
      <GrapesCharacter size={38} className="animate-bounce-slow delay-400" />
    </div>
  );
}

// Einzelne zufällige Frucht
export function RandomFruit({ className, size = 48 }: FruitProps) {
  const fruits = [AppleCharacter, PearCharacter, LemonCharacter, OrangeCharacter, GrapesCharacter];
  const FruitComponent = fruits[Math.floor(Math.random() * fruits.length)];
  return <FruitComponent className={className} size={size} />;
}
