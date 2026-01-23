'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { usePositions } from '@/lib/hooks/usePositions';
import { useArticles, useArticleCount } from '@/lib/hooks/useArticles';
import { ViewMode } from '@/types';
import Header from '@/components/layout/Header';
import Sidebar, { TabType } from '@/components/layout/Sidebar';
import DatePicker from '@/components/dashboard/DatePicker';
import ViewModeSelector from '@/components/dashboard/ViewModeSelector';
import PositionFeedCard from '@/components/dashboard/PositionFeedCard';
import PositionGridCard from '@/components/dashboard/PositionGridCard';
import PositionListItem from '@/components/dashboard/PositionListItem';
import EmptyState from '@/components/dashboard/EmptyState';
import ExcelUpload from '@/components/ean/ExcelUpload';
import ArticleTable from '@/components/ean/ArticleTable';
import ScansList from '@/components/ean/ScansList';
import Spinner from '@/components/ui/Spinner';
import Input from '@/components/ui/Input';
import { Search, FileSpreadsheet, Upload, Database, Scan, Crown, Shield, Settings, Users } from 'lucide-react';
import { useScanCount } from '@/lib/hooks/useScans';
import { cn } from '@/lib/utils';
import { AppleCharacter, OrangeCharacter, PearCharacter, LemonCharacter, GrapesCharacter } from '@/components/ui/FruitCharacters';

type EanSubTab = 'scans' | 'upload' | 'verwaltung';

export default function DashboardPage() {
  const router = useRouter();
  
  // Tab & Sidebar state
  const [activeTab, setActiveTab] = useState<TabType>('foto');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  // EAN sub-tab state
  const [eanSubTab, setEanSubTab] = useState<EanSubTab>('scans');
  
  // Photo tab state - Heute als Standard
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>('feed');
  const [searchTerm, setSearchTerm] = useState('');

  // Photo data
  const { positions, isLoading } = usePositions(selectedDate || undefined);

  // Article data
  const {
    articles,
    isLoading: articlesLoading,
    totalCount,
    page,
    pageSize,
    searchTerm: articleSearchTerm,
    setSearchTerm: setArticleSearchTerm,
    setPage,
    invalidate: invalidateArticles,
  } = useArticles();

  const { count: articleCount } = useArticleCount();
  const { count: scanCount } = useScanCount();

  const filteredPositions = useMemo(() => {
    if (!searchTerm) return positions;
    return positions.filter((pos) =>
      pos.position_code.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [positions, searchTerm]);

  const handlePositionClick = (positionCode: string) => {
    router.push(`/position/${positionCode}`);
  };

  const handleUploadSuccess = () => {
    invalidateArticles();
    // Nach erfolgreichem Upload zur Verwaltung wechseln
    setEanSubTab('verwaltung');
  };

  const renderPositions = () => {
    if (isLoading) {
      return (
        <div className="flex min-h-[400px] items-center justify-center">
          <Spinner size="lg" />
        </div>
      );
    }

    if (filteredPositions.length === 0) {
      return <EmptyState />;
    }

    if (viewMode === 'feed') {
      return (
        <div className="grid gap-6 sm:grid-cols-1 lg:grid-cols-2">
          {filteredPositions.map((position) => (
            <PositionFeedCard
              key={position.position_code}
              position={position}
              onClick={() => handlePositionClick(position.position_code)}
            />
          ))}
        </div>
      );
    }

    if (viewMode === 'grid') {
      return (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredPositions.map((position) => (
            <PositionGridCard
              key={position.position_code}
              position={position}
              onClick={() => handlePositionClick(position.position_code)}
            />
          ))}
        </div>
      );
    }

    return (
      <div className="space-y-3">
        {filteredPositions.map((position) => (
          <PositionListItem
            key={position.position_code}
            position={position}
            onClick={() => handlePositionClick(position.position_code)}
          />
        ))}
      </div>
    );
  };

  const renderFotoContent = () => (
    <>
      <div className="mb-6 space-y-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-3xl font-bold text-on-surface">Fotos</h2>
            <p className="mt-1 text-on-surface-variant">
              Wareneingangsfotos verwalten
            </p>
          </div>
          <ViewModeSelector
            viewMode={viewMode}
            onViewModeChange={setViewMode}
          />
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <DatePicker date={selectedDate} onDateChange={setSelectedDate} />
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-on-surface-variant z-10" />
            <Input
              type="text"
              placeholder="Position suchen..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="!pl-14"
            />
          </div>
        </div>
      </div>

      {renderPositions()}
    </>
  );

  const renderEanContent = () => (
    <>
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-3xl font-bold text-on-surface">Artikelstammdaten</h2>
            <p className="mt-1 text-on-surface-variant">
              EAN-Codes und Artikelinformationen verwalten
            </p>
          </div>
          <div className="flex items-center gap-2 text-on-surface-variant">
            <FileSpreadsheet className="h-5 w-5" />
            <span className="text-sm font-medium">
              {articleCount} Artikel
            </span>
          </div>
        </div>
      </div>

      {/* Sub-Tab Navigation */}
      <div className="mb-6">
        <div className="inline-flex rounded-xl bg-surface-variant/30 p-1 gap-1">
          <button
            onClick={() => setEanSubTab('scans')}
            className={cn(
              'flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all',
              eanSubTab === 'scans'
                ? 'bg-surface text-on-surface shadow-sm'
                : 'text-on-surface-variant hover:text-on-surface'
            )}
          >
            <Scan className="h-4 w-4" />
            Scans
            {scanCount > 0 && (
              <span className="ml-1 px-1.5 py-0.5 text-xs rounded-full bg-primary/10 text-primary">
                {scanCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setEanSubTab('upload')}
            className={cn(
              'admin-tab flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all',
              eanSubTab === 'upload'
                ? 'active bg-surface text-on-surface shadow-sm'
                : 'text-on-surface-variant hover:text-on-surface'
            )}
          >
            <Upload className="h-4 w-4 admin-icon" />
            <span className="admin-text">Upload</span>
          </button>
          <button
            onClick={() => setEanSubTab('verwaltung')}
            className={cn(
              'admin-tab flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all',
              eanSubTab === 'verwaltung'
                ? 'active bg-surface text-on-surface shadow-sm'
                : 'text-on-surface-variant hover:text-on-surface'
            )}
          >
            <Database className="h-4 w-4 admin-icon" />
            <span className="admin-text">Verwaltung</span>
          </button>
        </div>
      </div>

      {/* Sub-Tab Content */}
      {eanSubTab === 'scans' && (
        <ScansList />
      )}
      {eanSubTab === 'upload' && (
        <div className="rounded-2xl border border-outline/20 bg-surface/50 backdrop-blur-sm p-6">
          <ExcelUpload onUploadSuccess={handleUploadSuccess} />
        </div>
      )}
      {eanSubTab === 'verwaltung' && (
        <ArticleTable
          articles={articles}
          isLoading={articlesLoading}
          totalCount={totalCount}
          page={page}
          pageSize={pageSize}
          onPageChange={setPage}
          searchTerm={articleSearchTerm}
          onSearchChange={setArticleSearchTerm}
        />
      )}
    </>
  );

  const renderAdminContent = () => (
    <>
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl admin-badge flex items-center justify-center">
              <Crown className="h-6 w-6 admin-crown" />
            </div>
            <div>
              <h2 className="text-3xl font-bold admin-text">Administration</h2>
              <p className="mt-1 text-on-surface-variant">
                Systemeinstellungen und Benutzerverwaltung
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Admin Cards */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {/* Benutzer Card */}
        <div className="rounded-2xl border border-outline/20 bg-surface/50 backdrop-blur-sm p-6 admin-tab">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-xl bg-surface-variant/50 flex items-center justify-center">
              <Users className="h-6 w-6 admin-icon" />
            </div>
            <div>
              <h3 className="font-semibold text-on-surface">Benutzer</h3>
              <p className="text-sm text-on-surface-variant">Benutzerverwaltung</p>
            </div>
          </div>
          <p className="text-sm text-on-surface-variant mb-4">
            Benutzerkonten erstellen, bearbeiten und Berechtigungen verwalten.
          </p>
          <button className="w-full py-2 px-4 rounded-lg bg-surface-variant/50 text-on-surface-variant text-sm font-medium hover:bg-surface-variant transition-colors">
            Demnächst verfügbar
          </button>
        </div>

        {/* Einstellungen Card */}
        <div className="rounded-2xl border border-outline/20 bg-surface/50 backdrop-blur-sm p-6 admin-tab">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-xl bg-surface-variant/50 flex items-center justify-center">
              <Settings className="h-6 w-6 admin-icon" />
            </div>
            <div>
              <h3 className="font-semibold text-on-surface">Einstellungen</h3>
              <p className="text-sm text-on-surface-variant">Systemkonfiguration</p>
            </div>
          </div>
          <p className="text-sm text-on-surface-variant mb-4">
            Allgemeine Systemeinstellungen und Konfigurationsoptionen.
          </p>
          <button className="w-full py-2 px-4 rounded-lg bg-surface-variant/50 text-on-surface-variant text-sm font-medium hover:bg-surface-variant transition-colors">
            Demnächst verfügbar
          </button>
        </div>

        {/* Sicherheit Card */}
        <div className="rounded-2xl border border-outline/20 bg-surface/50 backdrop-blur-sm p-6 admin-tab">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-xl bg-surface-variant/50 flex items-center justify-center">
              <Shield className="h-6 w-6 admin-icon" />
            </div>
            <div>
              <h3 className="font-semibold text-on-surface">Sicherheit</h3>
              <p className="text-sm text-on-surface-variant">Zugriffssteuerung</p>
            </div>
          </div>
          <p className="text-sm text-on-surface-variant mb-4">
            Sicherheitseinstellungen, Audit-Logs und Zugriffskontrollen.
          </p>
          <button className="w-full py-2 px-4 rounded-lg bg-surface-variant/50 text-on-surface-variant text-sm font-medium hover:bg-surface-variant transition-colors">
            Demnächst verfügbar
          </button>
        </div>
      </div>

      {/* Info Banner */}
      <div className="mt-8 rounded-2xl admin-badge p-6">
        <div className="flex items-start gap-4">
          <Crown className="h-8 w-8 admin-crown flex-shrink-0 mt-1" />
          <div>
            <h3 className="font-semibold admin-text text-lg mb-2">
              Admin-Bereich
            </h3>
            <p className="text-on-surface-variant">
              Dieser Bereich ist für Administratoren reserviert. Hier können Sie systemweite 
              Einstellungen vornehmen und die Anwendung konfigurieren. Die Funktionen werden 
              in zukünftigen Updates erweitert.
            </p>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <div className="relative min-h-screen bg-background overflow-hidden">
      {/* Dezente Früchte-Dekoration im Hintergrund - gleichmäßig verteilt */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden hidden lg:block">
        {/* Linke Spalte - 8 Früchte gleichmäßig von oben nach unten */}
        <div className="absolute top-[5%] left-[3%] opacity-10">
          <AppleCharacter size={65} className="animate-bounce-slow" />
        </div>
        <div className="absolute top-[17%] left-[6%] opacity-10">
          <PearCharacter size={60} className="animate-bounce-slow delay-200" />
        </div>
        <div className="absolute top-[29%] left-[2%] opacity-10">
          <LemonCharacter size={55} className="animate-bounce-slow delay-100" />
        </div>
        <div className="absolute top-[41%] left-[5%] opacity-10">
          <GrapesCharacter size={65} className="animate-bounce-slow delay-300" />
        </div>
        <div className="absolute top-[53%] left-[3%] opacity-10">
          <OrangeCharacter size={60} className="animate-bounce-slow delay-400" />
        </div>
        <div className="absolute top-[65%] left-[6%] opacity-10">
          <AppleCharacter size={55} className="animate-bounce-slow delay-100" />
        </div>
        <div className="absolute top-[77%] left-[2%] opacity-10">
          <PearCharacter size={65} className="animate-bounce-slow delay-200" />
        </div>
        <div className="absolute top-[89%] left-[5%] opacity-10">
          <LemonCharacter size={60} className="animate-bounce-slow delay-300" />
        </div>
        
        {/* Rechte Spalte - 8 Früchte gleichmäßig von oben nach unten */}
        <div className="absolute top-[5%] right-[3%] opacity-10">
          <GrapesCharacter size={65} className="animate-bounce-slow delay-100" />
        </div>
        <div className="absolute top-[17%] right-[6%] opacity-10">
          <OrangeCharacter size={60} className="animate-bounce-slow delay-300" />
        </div>
        <div className="absolute top-[29%] right-[2%] opacity-10">
          <AppleCharacter size={55} className="animate-bounce-slow" />
        </div>
        <div className="absolute top-[41%] right-[5%] opacity-10">
          <PearCharacter size={65} className="animate-bounce-slow delay-200" />
        </div>
        <div className="absolute top-[53%] right-[3%] opacity-10">
          <LemonCharacter size={60} className="animate-bounce-slow delay-100" />
        </div>
        <div className="absolute top-[65%] right-[6%] opacity-10">
          <GrapesCharacter size={55} className="animate-bounce-slow delay-400" />
        </div>
        <div className="absolute top-[77%] right-[2%] opacity-10">
          <OrangeCharacter size={65} className="animate-bounce-slow delay-300" />
        </div>
        <div className="absolute top-[89%] right-[5%] opacity-10">
          <AppleCharacter size={60} className="animate-bounce-slow delay-200" />
        </div>
        
        {/* Zweite linke Spalte (etwas weiter innen) - 8 Früchte */}
        <div className="absolute top-[11%] left-[10%] opacity-10">
          <OrangeCharacter size={55} className="animate-bounce-slow delay-400" />
        </div>
        <div className="absolute top-[23%] left-[12%] opacity-10">
          <GrapesCharacter size={60} className="animate-bounce-slow delay-100" />
        </div>
        <div className="absolute top-[35%] left-[9%] opacity-10">
          <AppleCharacter size={50} className="animate-bounce-slow delay-200" />
        </div>
        <div className="absolute top-[47%] left-[11%] opacity-10">
          <LemonCharacter size={55} className="animate-bounce-slow delay-300" />
        </div>
        <div className="absolute top-[59%] left-[10%] opacity-10">
          <PearCharacter size={50} className="animate-bounce-slow" />
        </div>
        <div className="absolute top-[71%] left-[12%] opacity-10">
          <OrangeCharacter size={55} className="animate-bounce-slow delay-400" />
        </div>
        <div className="absolute top-[83%] left-[9%] opacity-10">
          <GrapesCharacter size={50} className="animate-bounce-slow delay-100" />
        </div>
        <div className="absolute top-[95%] left-[11%] opacity-10">
          <AppleCharacter size={55} className="animate-bounce-slow delay-200" />
        </div>
        
        {/* Zweite rechte Spalte (etwas weiter innen) - 8 Früchte */}
        <div className="absolute top-[11%] right-[10%] opacity-10">
          <PearCharacter size={55} className="animate-bounce-slow delay-200" />
        </div>
        <div className="absolute top-[23%] right-[12%] opacity-10">
          <LemonCharacter size={60} className="animate-bounce-slow delay-400" />
        </div>
        <div className="absolute top-[35%] right-[9%] opacity-10">
          <OrangeCharacter size={50} className="animate-bounce-slow delay-100" />
        </div>
        <div className="absolute top-[47%] right-[11%] opacity-10">
          <GrapesCharacter size={55} className="animate-bounce-slow delay-300" />
        </div>
        <div className="absolute top-[59%] right-[10%] opacity-10">
          <AppleCharacter size={50} className="animate-bounce-slow" />
        </div>
        <div className="absolute top-[71%] right-[12%] opacity-10">
          <PearCharacter size={55} className="animate-bounce-slow delay-200" />
        </div>
        <div className="absolute top-[83%] right-[9%] opacity-10">
          <LemonCharacter size={50} className="animate-bounce-slow delay-400" />
        </div>
        <div className="absolute top-[95%] right-[11%] opacity-10">
          <OrangeCharacter size={55} className="animate-bounce-slow delay-100" />
        </div>
      </div>

      {/* Header - durchgängig über gesamte Breite */}
      <Header />

      {/* Sidebar - unter dem Header */}
      <Sidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />

      {/* Main Content */}
      <main 
        className="relative z-10 pt-20 mt-16 p-4 lg:p-6 transition-all duration-300"
        style={{ marginLeft: sidebarOpen ? '14rem' : '3.5rem' }}
      >
        <div className="mx-auto max-w-6xl">
          {activeTab === 'foto' && renderFotoContent()}
          {activeTab === 'ean' && renderEanContent()}
          {activeTab === 'admin' && renderAdminContent()}
        </div>
      </main>
    </div>
  );
}
