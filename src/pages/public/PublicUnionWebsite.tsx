import React, { useState, useEffect } from 'react';
import { useWebsiteBuilder, TourPhotoItem, CustomPublicPage, WebsiteThemeColor } from '../../context/WebsiteBuilderContext';
import { useInstitution } from '../../context/InstitutionContext';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { StudentGradeCard } from '../../types';
import { GradeCardTemplate } from '../../components/common/GradeCardTemplate';
import {
  Shield,
  Sun,
  Moon,
  MapPin,
  Calendar,
  Mail,
  Phone,
  ArrowRight,
  ArrowLeft,
  Users,
  Award,
  Camera,
  BookOpen,
  Bell,
  Search,
  X,
  ChevronRight,
  Sliders,
  Compass,
  CheckCircle2,
  FileText,
  Menu,
  Lock
} from 'lucide-react';

interface PublicUnionWebsiteProps {
  onOpenAdminLogin: () => void;
  onReturnToAdminDashboard?: () => void;
  onOpenWebsiteBuilder?: () => void;
}

export const PublicUnionWebsite: React.FC<PublicUnionWebsiteProps> = ({
  onOpenAdminLogin,
  onReturnToAdminDashboard,
  onOpenWebsiteBuilder
}) => {
  const { siteConfig } = useWebsiteBuilder();
  const { notices, routines } = useInstitution();
  const { theme, toggleTheme } = useTheme();
  const { isAuthenticated, currentRole } = useAuth();

  const [selectedWingId, setSelectedWingId] = useState<string>('ALL');
  const [selectedAlbum, setSelectedAlbum] = useState<string>('ALL');
  const [lightboxPhoto, setLightboxPhoto] = useState<TourPhotoItem | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeCustomPage, setActiveCustomPage] = useState<CustomPublicPage | null>(null);

  // Theme accents & Shape Customization matching the unified admin/student slate styling
  const getThemeAccentClass = (preset: WebsiteThemeColor = 'gold_slate') => {
    switch (preset) {
      case 'emerald_slate':
        return {
          badge: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
          text: 'text-emerald-400',
          bg: 'bg-emerald-500',
          button: 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold',
          accentRing: 'ring-emerald-500',
          border: 'border-emerald-500/40',
          kicker: 'text-emerald-300'
        };
      case 'cyan_slate':
        return {
          badge: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30',
          text: 'text-cyan-400',
          bg: 'bg-cyan-500',
          button: 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold',
          accentRing: 'ring-cyan-500',
          border: 'border-cyan-500/40',
          kicker: 'text-cyan-300'
        };
      case 'indigo_slate':
        return {
          badge: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30',
          text: 'text-indigo-400',
          bg: 'bg-indigo-600',
          button: 'bg-indigo-600 hover:bg-indigo-500 text-white font-bold',
          accentRing: 'ring-indigo-500',
          border: 'border-indigo-500/40',
          kicker: 'text-indigo-300'
        };
      case 'rose_slate':
        return {
          badge: 'text-rose-400 bg-rose-500/10 border-rose-500/30',
          text: 'text-rose-400',
          bg: 'bg-rose-600',
          button: 'bg-rose-600 hover:bg-rose-500 text-white font-bold',
          accentRing: 'ring-rose-500',
          border: 'border-rose-500/40',
          kicker: 'text-rose-300'
        };
      case 'gold_slate':
      default:
        return {
          badge: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
          text: 'text-amber-400',
          bg: 'bg-amber-500',
          button: 'bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold',
          accentRing: 'ring-amber-500',
          border: 'border-amber-500/40',
          kicker: 'text-amber-300'
        };
    }
  };

  const themeTokens = getThemeAccentClass(siteConfig.themePreset || 'gold_slate');
  const radiusClass = siteConfig.cardBorderRadius || 'rounded-3xl';

  // Public Grade Card Lookup (No login required)
  const [resultSearchQuery, setResultSearchQuery] = useState('');
  const [foundGradeCard, setFoundGradeCard] = useState<StudentGradeCard | null>(null);
  const [searchAttempted, setSearchAttempted] = useState(false);
  const [allGradeCards, setAllGradeCards] = useState<StudentGradeCard[]>([]);

  useEffect(() => {
    const loadCards = () => {
      try {
        const stored = localStorage.getItem('smartclass_grade_cards');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) setAllGradeCards(parsed);
        }
      } catch {
        // ignore
      }
    };
    loadCards();
    window.addEventListener('storage', loadCards);
    window.addEventListener('al_uswah_grade_cards_updated', loadCards);
    return () => {
      window.removeEventListener('storage', loadCards);
      window.removeEventListener('al_uswah_grade_cards_updated', loadCards);
    };
  }, []);

  const handleResultSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resultSearchQuery.trim()) return;
    const q = resultSearchQuery.trim().toLowerCase();
    const match = allGradeCards.find(
      c =>
        c.admissionNo.toLowerCase() === q ||
        c.studentName.toLowerCase().includes(q)
    );
    setFoundGradeCard(match || null);
    setSearchAttempted(true);
  };

  const isAdminLoggedIn = isAuthenticated && (currentRole === 'SUPER_ADMIN' || currentRole === 'ADMIN');

  // Unique albums for tour photos
  const albums = ['ALL', ...Array.from(new Set(siteConfig.tourPhotos.map(p => p.album || 'General').filter(Boolean)))];

  const filteredTourPhotos =
    selectedAlbum === 'ALL'
      ? siteConfig.tourPhotos
      : siteConfig.tourPhotos.filter(p => (p.album || 'General') === selectedAlbum);

  const displayedWings =
    selectedWingId === 'ALL'
      ? siteConfig.wings
      : siteConfig.wings.filter(w => w.id === selectedWingId);

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    if (activeCustomPage) {
      setActiveCustomPage(null);
      setTimeout(() => {
        const el = document.getElementById(id);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        }
      }, 60);
      return;
    }
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      {/* Admin Live Preview Banner (Only shown when Admin is logged in and viewing the public page) */}
      {isAdminLoggedIn && (
        <div className="bg-slate-900 text-white border-b border-slate-800 px-4 py-2.5 text-xs">
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Shield size={14} className="text-emerald-400" />
              <span className="font-semibold">Admin Preview Mode:</span>
              <span className="text-slate-300">
                You are viewing the live public website as visitors see it.
              </span>
            </div>
            <div className="flex items-center gap-2">
              {onOpenWebsiteBuilder && (
                <button
                  onClick={onOpenWebsiteBuilder}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Sliders size={13} />
                  <span>Edit Website Content (CMS)</span>
                </button>
              )}
              {onReturnToAdminDashboard && (
                <button
                  onClick={onReturnToAdminDashboard}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-100 font-semibold border border-slate-700 transition cursor-pointer"
                >
                  Return to Admin Dashboard
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Top Public Navigation Header */}
      <header className="sticky top-0 z-40 bg-white/90 dark:bg-slate-950/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-4">
          {/* Brand */}
          <div
            onClick={() => {
              setActiveCustomPage(null);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="flex items-center gap-3 cursor-pointer"
          >
            {siteConfig.logoImageUrl ? (
              <img
                src={siteConfig.logoImageUrl}
                alt={siteConfig.unionName}
                className="w-10 h-10 rounded-xl object-cover border border-slate-200 dark:border-slate-800"
              />
            ) : (
              <div className="w-10 h-10 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-950 flex items-center justify-center font-black text-sm tracking-tight shadow-sm">
                {siteConfig.logoText || 'AU'}
              </div>
            )}
            <div>
              <div className="font-black text-base sm:text-lg tracking-tight text-slate-900 dark:text-white leading-none">
                {siteConfig.unionName || 'AL-USWAH UNION'}
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                {siteConfig.unionTagline}
              </div>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600 dark:text-slate-300">
            {siteConfig.showAboutSection && (
              <button
                onClick={() => scrollToSection('section-about')}
                className="hover:text-slate-900 dark:hover:text-white transition cursor-pointer"
              >
                About Class
              </button>
            )}
            {siteConfig.showLeadersSection && (
              <button
                onClick={() => scrollToSection('section-leaders')}
                className="hover:text-slate-900 dark:hover:text-white transition cursor-pointer"
              >
                Leadership
              </button>
            )}
            {siteConfig.showWingsSection && (
              <button
                onClick={() => scrollToSection('section-wings')}
                className="hover:text-slate-900 dark:hover:text-white transition cursor-pointer"
              >
                Class Wings
              </button>
            )}
            {siteConfig.showToursSection && (
              <button
                onClick={() => scrollToSection('section-tours')}
                className="hover:text-slate-900 dark:hover:text-white transition cursor-pointer"
              >
                Class Tours
              </button>
            )}
            {/* Custom Public Pages Added by Admin */}
            {siteConfig.customPages &&
              siteConfig.customPages
                .filter(p => p.showInNavbar)
                .map(page => (
                  <button
                    key={page.id}
                    onClick={() => {
                      setActiveCustomPage(page);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className={`transition cursor-pointer font-medium ${
                      activeCustomPage?.id === page.id
                        ? `${themeTokens.text} font-bold underline underline-offset-4`
                        : 'hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    {page.navbarLabel || page.title}
                  </button>
                ))}
            {siteConfig.showPublicNotices && notices.length > 0 && (
              <button
                onClick={() => scrollToSection('section-notices')}
                className="hover:text-slate-900 dark:hover:text-white transition cursor-pointer"
              >
                Notices
              </button>
            )}
            {siteConfig.showPublicResultsLookup && (
              <button
                onClick={() => scrollToSection('section-results')}
                className="hover:text-slate-900 dark:hover:text-white transition cursor-pointer"
              >
                Exam Results
              </button>
            )}
          </nav>

          {/* Right Controls: Theme Toggle + Admin Login ONLY (No Student Login) */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900 transition cursor-pointer"
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {theme === 'dark' ? <Sun size={17} className="text-amber-400" /> : <Moon size={17} />}
            </button>

            {isAdminLoggedIn ? (
              <button
                onClick={onReturnToAdminDashboard}
                className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-md shadow-rose-600/20"
              >
                <Shield size={14} />
                <span className="hidden sm:inline">Admin Dashboard</span>
              </button>
            ) : (
              <button
                onClick={onOpenAdminLogin}
                className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900 transition flex items-center gap-1.5 cursor-pointer text-xs font-semibold"
                title="Sign In to Portal"
              >
                <Lock size={13} className="text-amber-500" />
                <span className="hidden sm:inline">Portal Login</span>
              </button>
            )}

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900 transition"
              aria-label="Toggle navigation menu"
            >
              <Menu size={18} />
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-4 py-3 space-y-2 text-sm">
            {siteConfig.showAboutSection && (
              <button
                onClick={() => scrollToSection('section-about')}
                className="block w-full text-left py-2 font-medium text-slate-700 dark:text-slate-200"
              >
                About Class
              </button>
            )}
            {siteConfig.showLeadersSection && (
              <button
                onClick={() => scrollToSection('section-leaders')}
                className="block w-full text-left py-2 font-medium text-slate-700 dark:text-slate-200"
              >
                Class Leadership
              </button>
            )}
            {siteConfig.showWingsSection && (
              <button
                onClick={() => scrollToSection('section-wings')}
                className="block w-full text-left py-2 font-medium text-slate-700 dark:text-slate-200"
              >
                Class Wings
              </button>
            )}
            {siteConfig.showToursSection && (
              <button
                onClick={() => scrollToSection('section-tours')}
                className="block w-full text-left py-2 font-medium text-slate-700 dark:text-slate-200"
              >
                Class Tour Photos
              </button>
            )}
            {/* Custom Public Pages in Mobile Menu */}
            {siteConfig.customPages &&
              siteConfig.customPages
                .filter(p => p.showInNavbar)
                .map(page => (
                  <button
                    key={page.id}
                    onClick={() => {
                      setActiveCustomPage(page);
                      setMobileMenuOpen(false);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className={`block w-full text-left py-2 font-medium ${
                      activeCustomPage?.id === page.id
                        ? `${themeTokens.text} font-bold`
                        : 'text-slate-700 dark:text-slate-200'
                    }`}
                  >
                    📄 {page.navbarLabel || page.title}
                  </button>
                ))}
            {siteConfig.showPublicResultsLookup && (
              <button
                onClick={() => scrollToSection('section-results')}
                className="block w-full text-left py-2 font-medium text-slate-700 dark:text-slate-200"
              >
                Exam Results
              </button>
            )}
          </div>
        )}
      </header>

      {/* =================================================================== */}
      {/* CUSTOM PUBLIC PAGE DISPLAY (When visitor clicks custom nav link)     */}
      {/* =================================================================== */}
      {activeCustomPage ? (
        <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-in fade-in duration-200">
          {/* Top Sticky/Prominent Return Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-md">
            <button
              onClick={() => {
                setActiveCustomPage(null);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-sm"
            >
              <ArrowLeft size={15} />
              <span>← Back to AL-USWAH UNION Main Page</span>
            </button>

            <div className="flex items-center gap-2">
              {isAdminLoggedIn && onOpenWebsiteBuilder && (
                <button
                  onClick={onOpenWebsiteBuilder}
                  className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow"
                >
                  <Sliders size={13} />
                  <span>Edit in CMS</span>
                </button>
              )}
              <button
                onClick={() => {
                  setActiveCustomPage(null);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="px-3.5 py-2 rounded-xl bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                title="Close Page and Return to Main Page"
              >
                <X size={15} />
                <span>Close [✕]</span>
              </button>
            </div>
          </div>

          {/* Hero Cover & Title */}
          <article className={`overflow-hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl ${radiusClass}`}>
            {activeCustomPage.coverImageUrl && (
              <div className="relative h-64 sm:h-96 w-full overflow-hidden bg-slate-950">
                <img
                  src={activeCustomPage.coverImageUrl}
                  alt={activeCustomPage.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
              </div>
            )}

            <div className="p-6 sm:p-10 space-y-4">
              <div className="flex flex-wrap items-center gap-3 text-xs">
                <span className={`px-2.5 py-1 rounded-full font-mono text-[11px] font-bold border ${themeTokens.badge}`}>
                  AL-USWAH UNION Page
                </span>
                <span className="text-slate-500 dark:text-slate-400">
                  Published: {activeCustomPage.createdAt}
                </span>
                {activeCustomPage.author && (
                  <>
                    <span className="text-slate-400 dark:text-slate-600">•</span>
                    <span className="text-slate-700 dark:text-slate-300 font-medium">
                      Author: {activeCustomPage.author}
                    </span>
                  </>
                )}
              </div>

              <h1 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
                {activeCustomPage.title}
              </h1>

              {activeCustomPage.subtitle && (
                <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 font-medium">
                  {activeCustomPage.subtitle}
                </p>
              )}
            </div>

            {/* Content Body */}
            <div className="p-6 sm:p-10 border-t border-slate-200 dark:border-slate-800 space-y-6 text-slate-700 dark:text-slate-200 leading-relaxed text-sm sm:text-base">
              {activeCustomPage.content.split('\n\n').map((para, i) => (
                <p key={i} className="whitespace-pre-line">
                  {para}
                </p>
              ))}

              {/* Bottom Return Bar */}
              <div className="pt-8 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4">
                <button
                  onClick={() => {
                    setActiveCustomPage(null);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className={`px-5 py-2.5 rounded-xl font-bold text-xs transition flex items-center gap-2 cursor-pointer shadow ${themeTokens.button}`}
                >
                  <ArrowLeft size={15} />
                  <span>← Back to AL-USWAH UNION Home</span>
                </button>

                <div className="text-xs text-slate-500 font-mono">
                  AL-USWAH UNION • {siteConfig.unionName}
                </div>
              </div>
            </div>
          </article>
        </main>
      ) : (
        <>
        {/* HERO SECTION WITH CUSTOMIZABLE BACKGROUND PHOTO */}
        <section className="relative min-h-[540px] sm:min-h-[620px] flex items-center justify-center overflow-hidden bg-slate-950 text-white">
        {/* Background Photo */}
        {siteConfig.heroBgImage && (
          <img
            src={siteConfig.heroBgImage}
            alt={siteConfig.heroHeading}
            className="absolute inset-0 w-full h-full object-cover object-center"
          />
        )}

        {/* Customizable Dark Scrim Overlay for Legibility */}
        <div
          className="absolute inset-0 bg-slate-950 transition-opacity duration-300"
          style={{ opacity: (siteConfig.heroOverlayOpacity ?? 65) / 100 }}
        />

        {/* Subtle Bottom Gradient Fade */}
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-slate-950/90 to-transparent" />

        {/* Hero Content */}
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center space-y-6">
          {siteConfig.heroKicker && (
            <div className="text-xs sm:text-sm font-semibold tracking-widest uppercase text-amber-300/90">
              {siteConfig.heroKicker}
            </div>
          )}

          <h1
            className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white leading-[1.08]"
            style={{ textWrap: 'balance' }}
          >
            {siteConfig.heroHeading || 'AL-USWAH UNION'}
          </h1>

          {siteConfig.heroSubheading && (
            <p className="text-base sm:text-lg text-slate-200 max-w-2xl mx-auto leading-relaxed font-normal">
              {siteConfig.heroSubheading}
            </p>
          )}

          <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
            {siteConfig.heroPrimaryBtnText && (
              <button
                onClick={() => scrollToSection('section-wings')}
                className="px-6 py-3.5 rounded-xl bg-white text-slate-950 font-bold text-sm hover:bg-slate-100 transition flex items-center gap-2 cursor-pointer shadow-lg"
              >
                <span>{siteConfig.heroPrimaryBtnText}</span>
                <ArrowRight size={16} />
              </button>
            )}
            {siteConfig.heroSecondaryBtnText && (
              <button
                onClick={() => scrollToSection('section-leaders')}
                className="px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-sm border border-white/25 backdrop-blur-sm transition cursor-pointer"
              >
                {siteConfig.heroSecondaryBtnText}
              </button>
            )}
          </div>
        </div>
      </section>

      {/* =================================================================== */}
      {/* ABOUT CLASS & UNION SECTION                                         */}
      {/* =================================================================== */}
      {siteConfig.showAboutSection && (
        <section id="section-about" className="py-20 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Story, Mission & Vision */}
            <div className="lg:col-span-7 space-y-6">
              <div className="space-y-3">
                <div className="text-xs font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
                  01. Our Identity & Purpose
                </div>
                <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
                  {siteConfig.aboutHeading}
                </h2>
                {siteConfig.aboutSubheading && (
                  <p className="text-base font-medium text-slate-600 dark:text-slate-300">
                    {siteConfig.aboutSubheading}
                  </p>
                )}
              </div>

              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                {siteConfig.aboutDescription}
              </p>

              {/* Mission & Vision Grid */}
              {(siteConfig.aboutMission || siteConfig.aboutVision) && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-slate-200 dark:border-slate-800">
                  {siteConfig.aboutMission && (
                    <div className="space-y-2">
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                        Our Mission
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                        {siteConfig.aboutMission}
                      </p>
                    </div>
                  )}
                  {siteConfig.aboutVision && (
                    <div className="space-y-2">
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                        Our Vision
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                        {siteConfig.aboutVision}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Highlight Counters */}
              {siteConfig.aboutStats.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 pt-6 border-t border-slate-200 dark:border-slate-800">
                  {siteConfig.aboutStats.map(stat => (
                    <div key={stat.id}>
                      <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-mono tabular-nums">
                        {stat.value}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        {stat.label}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Right Column: About Image */}
            <div className="lg:col-span-5">
              {siteConfig.aboutImage ? (
                <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-lg bg-slate-100 dark:bg-slate-900 aspect-4/3">
                  <img
                    src={siteConfig.aboutImage}
                    alt={siteConfig.aboutHeading}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 p-12 text-center space-y-2 aspect-4/3 flex flex-col items-center justify-center">
                  <Compass size={32} className="text-slate-400" />
                  <p className="text-xs text-slate-500">Class Photo can be uploaded from Admin Dashboard</p>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* =================================================================== */}
      {/* CLASS EXECUTIVE LEADERSHIP SECTION                                  */}
      {/* (President, Class Leader, Second Leader, Treasurer, Cashier, 2nd)   */}
      {/* =================================================================== */}
      {siteConfig.showLeadersSection && (
        <section
          id="section-leaders"
          className="py-20 sm:py-24 bg-white dark:bg-slate-900/50 border-y border-slate-200 dark:border-slate-800/80"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
            <div className="max-w-2xl space-y-3">
              <div className="text-xs font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
                02. Union Office Bearers
              </div>
              <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
                {siteConfig.leadersHeading}
              </h2>
              {siteConfig.leadersSubheading && (
                <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">
                  {siteConfig.leadersSubheading}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {siteConfig.leaders.map(leader => {
                const initials = (leader.name || leader.roleTitle)
                  .split(' ')
                  .map(w => w[0])
                  .join('')
                  .slice(0, 2)
                  .toUpperCase();

                return (
                  <div
                    key={leader.id}
                    className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col justify-between space-y-5 transition hover:border-slate-300 dark:hover:border-slate-700"
                  >
                    <div className="flex items-start gap-4">
                      {leader.photo ? (
                        <img
                          src={leader.photo}
                          alt={leader.name || leader.roleTitle}
                          className="w-16 h-16 rounded-2xl object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-2xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center font-black text-lg shrink-0">
                          {initials}
                        </div>
                      )}

                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                          {leader.roleTitle}
                        </div>
                        <h3 className="text-lg font-extrabold text-slate-900 dark:text-white mt-0.5 truncate">
                          {leader.name || 'Not Assigned Yet'}
                        </h3>
                        {leader.rollOrId && (
                          <div className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                            {leader.rollOrId}
                          </div>
                        )}
                      </div>
                    </div>

                    {leader.quoteOrBio && (
                      <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed pt-3 border-t border-slate-200/80 dark:border-slate-800">
                        {leader.quoteOrBio}
                      </p>
                    )}

                    {(leader.phone || leader.email) && (
                      <div className="pt-2 flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                        {leader.phone && <span>{leader.phone}</span>}
                        {leader.phone && leader.email && <span aria-hidden="true">·</span>}
                        {leader.email && <span>{leader.email}</span>}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* =================================================================== */}
      {/* CLASS WINGS & WING MEMBERS SECTION                                  */}
      {/* =================================================================== */}
      {siteConfig.showWingsSection && (
        <section id="section-wings" className="py-20 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full space-y-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="max-w-2xl space-y-3">
              <div className="text-xs font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
                03. Student Wings & Departments
              </div>
              <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
                {siteConfig.wingsHeading}
              </h2>
              {siteConfig.wingsSubheading && (
                <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">
                  {siteConfig.wingsSubheading}
                </p>
              )}
            </div>

            {/* Interactive Wing Filter Control */}
            {siteConfig.wings.length > 1 && (
              <div className="flex items-center gap-1.5 p-1 bg-slate-200/70 dark:bg-slate-900 rounded-xl overflow-x-auto">
                <button
                  onClick={() => setSelectedWingId('ALL')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                    selectedWingId === 'ALL'
                      ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  All Wings ({siteConfig.wings.length})
                </button>
                {siteConfig.wings.map(wing => (
                  <button
                    key={wing.id}
                    onClick={() => setSelectedWingId(wing.id)}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                      selectedWingId === wing.id
                        ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    {wing.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {siteConfig.wings.length === 0 ? (
            <div className="p-12 rounded-2xl bg-white dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-800 text-center space-y-3">
              <Users size={32} className="mx-auto text-slate-400" />
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  No Class Wings Published Yet
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                  Class wings and their committee members can be added directly from the Admin Dashboard Website Builder.
                </p>
              </div>
              {isAdminLoggedIn && onOpenWebsiteBuilder && (
                <button
                  onClick={onOpenWebsiteBuilder}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Sliders size={13} />
                  <span>Add Class Wings in Admin CMS</span>
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {displayedWings.map(wing => (
                <div
                  key={wing.id}
                  className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col justify-between shadow-xs"
                >
                  <div>
                    {wing.coverPhoto && (
                      <div className="h-44 w-full overflow-hidden border-b border-slate-200 dark:border-slate-800">
                        <img
                          src={wing.coverPhoto}
                          alt={wing.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}

                    <div className="p-6 space-y-4">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className="text-xl font-black text-slate-900 dark:text-white">
                            {wing.name}
                          </h3>
                          {wing.motto && (
                            <div className="text-xs font-medium text-indigo-600 dark:text-indigo-400 mt-0.5">
                              {wing.motto}
                            </div>
                          )}
                        </div>
                        <span className="text-xs font-mono text-slate-500 dark:text-slate-400 shrink-0">
                          {wing.members.length} {wing.members.length === 1 ? 'Member' : 'Members'}
                        </span>
                      </div>

                      {wing.description && (
                        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                          {wing.description}
                        </p>
                      )}

                      {/* Wing Members List */}
                      <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-3">
                        <div className="text-xs font-bold text-slate-700 dark:text-slate-300">
                          Wing Members & Office Bearers
                        </div>

                        {wing.members.length === 0 ? (
                          <p className="text-xs text-slate-400 italic">
                            No members listed in this wing yet.
                          </p>
                        ) : (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {wing.members.map(member => (
                              <div
                                key={member.id}
                                className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200/70 dark:border-slate-800/80"
                              >
                                {member.photo ? (
                                  <img
                                    src={member.photo}
                                    alt={member.name}
                                    className="w-10 h-10 rounded-xl object-cover shrink-0 border border-slate-200 dark:border-slate-700"
                                  />
                                ) : (
                                  <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center font-bold text-xs shrink-0">
                                    {member.name.slice(0, 2).toUpperCase()}
                                  </div>
                                )}
                                <div className="min-w-0">
                                  <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                                    {member.name}
                                  </div>
                                  <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                                    {member.designation}
                                    {member.rollOrId ? ` · ${member.rollOrId}` : ''}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* =================================================================== */}
      {/* CLASS TOUR PHOTOS & MEMORIES GALLERY                                */}
      {/* =================================================================== */}
      {siteConfig.showToursSection && (
        <section
          id="section-tours"
          className="py-20 sm:py-24 bg-white dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-800/80"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div className="max-w-2xl space-y-3">
                <div className="text-xs font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
                  04. Study Tours & Gallery
                </div>
                <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
                  {siteConfig.toursHeading}
                </h2>
                {siteConfig.toursSubheading && (
                  <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">
                    {siteConfig.toursSubheading}
                  </p>
                )}
              </div>

              {albums.length > 2 && (
                <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-900 rounded-xl overflow-x-auto">
                  {albums.map(album => (
                    <button
                      key={album}
                      onClick={() => setSelectedAlbum(album)}
                      className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                        selectedAlbum === album
                          ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      {album === 'ALL' ? 'All Photos' : album}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {filteredTourPhotos.length === 0 ? (
              <div className="p-12 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-800 text-center space-y-3">
                <Camera size={32} className="mx-auto text-slate-400" />
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    No Class Tour Photos Uploaded Yet
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                    Upload class tour photos, study trip memories, and campus event pictures from the Admin Dashboard.
                  </p>
                </div>
                {isAdminLoggedIn && onOpenWebsiteBuilder && (
                  <button
                    onClick={onOpenWebsiteBuilder}
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <Camera size={13} />
                    <span>Upload Tour Photos in Admin CMS</span>
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTourPhotos.map(photo => (
                  <div
                    key={photo.id}
                    onClick={() => setLightboxPhoto(photo)}
                    className="group rounded-2xl overflow-hidden bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 cursor-pointer flex flex-col justify-between transition hover:shadow-lg"
                  >
                    <div className="aspect-16/10 w-full overflow-hidden bg-slate-200 dark:bg-slate-800 relative">
                      <img
                        src={photo.imageUrl}
                        alt={photo.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    <div className="p-5 space-y-2">
                      <h3 className="text-base font-bold text-slate-900 dark:text-white">
                        {photo.title}
                      </h3>
                      {photo.description && (
                        <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">
                          {photo.description}
                        </p>
                      )}
                      <div className="pt-1 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                        {photo.location && <span>{photo.location}</span>}
                        {photo.location && photo.date && <span aria-hidden="true">·</span>}
                        {photo.date && <span>{photo.date}</span>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* =================================================================== */}
      {/* CUSTOM NO-CODE SECTIONS CREATED BY ADMIN                            */}
      {/* =================================================================== */}
      {siteConfig.customSections
        .filter(sec => sec.visible)
        .map((sec, idx) => (
          <section
            key={sec.id}
            className="py-20 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full border-t border-slate-200 dark:border-slate-800/80"
          >
            {sec.layout === 'centered' ? (
              <div className="max-w-3xl mx-auto text-center space-y-6">
                {sec.subheading && (
                  <div className="text-xs font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
                    {sec.subheading}
                  </div>
                )}
                <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white">
                  {sec.heading}
                </h2>
                <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                  {sec.content}
                </p>
                {sec.imageUrl && (
                  <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 mt-6">
                    <img
                      src={sec.imageUrl}
                      alt={sec.heading}
                      className="w-full max-h-[460px] object-cover"
                    />
                  </div>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                <div
                  className={`lg:col-span-6 space-y-4 ${
                    sec.layout === 'split-left' ? 'lg:order-2' : 'lg:order-1'
                  }`}
                >
                  {sec.subheading && (
                    <div className="text-xs font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
                      {sec.subheading}
                    </div>
                  )}
                  <h2 className="text-3xl font-black text-slate-900 dark:text-white">
                    {sec.heading}
                  </h2>
                  <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                    {sec.content}
                  </p>
                </div>
                <div
                  className={`lg:col-span-6 ${
                    sec.layout === 'split-left' ? 'lg:order-1' : 'lg:order-2'
                  }`}
                >
                  {sec.imageUrl && (
                    <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 aspect-16/10">
                      <img
                        src={sec.imageUrl}
                        alt={sec.heading}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                </div>
              </div>
            )}
          </section>
        ))}

      {/* =================================================================== */}
      {/* PUBLIC NOTICES & ANNOUNCEMENTS (IF ENABLED & PRESENT)               */}
      {/* =================================================================== */}
      {siteConfig.showPublicNotices && notices.length > 0 && (
        <section
          id="section-notices"
          className="py-20 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full border-t border-slate-200 dark:border-slate-800/80 space-y-8"
        >
          <div className="space-y-2">
            <div className="text-xs font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
              Official Announcements
            </div>
            <h2 className="text-3xl font-black text-slate-900 dark:text-white">
              Union Notice Board
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {notices.map(notice => (
              <div
                key={notice.id}
                className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3"
              >
                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                  <span className="font-bold text-indigo-600 dark:text-indigo-400">
                    {notice.noticeType}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span>{notice.date}</span>
                  <span aria-hidden="true">·</span>
                  <span>{notice.author}</span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  {notice.title}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                  {notice.content}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* =================================================================== */}
      {/* PUBLIC CLASS ROUTINE (IF ENABLED & PRESENT)                         */}
      {/* =================================================================== */}
      {siteConfig.showPublicRoutine && routines.length > 0 && (
        <section className="py-20 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full border-t border-slate-200 dark:border-slate-800/80 space-y-8">
          <div className="space-y-2">
            <div className="text-xs font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
              Academic Timetable
            </div>
            <h2 className="text-3xl font-black text-slate-900 dark:text-white">
              Class Routine & Schedule
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {routines.map(item => (
              <div
                key={item.id}
                className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1.5"
              >
                <div className="text-xs font-mono text-indigo-600 dark:text-indigo-400 font-bold">
                  {item.day} · {item.startTime} – {item.endTime}
                </div>
                <div className="text-base font-bold text-slate-900 dark:text-white">
                  {item.subject}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  {item.teacher} · {item.room}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* =================================================================== */}
      {/* PUBLIC EXAMINATION GRADE CARD LOOKUP (NO STUDENT LOGIN NEEDED)      */}
      {/* =================================================================== */}
      {siteConfig.showPublicResultsLookup && (
        <section
          id="section-results"
          className="py-20 sm:py-24 bg-white dark:bg-slate-900/60 border-t border-slate-200 dark:border-slate-800/80"
        >
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
            <div className="text-center space-y-2">
              <div className="text-xs font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
                Academic Examination Portal
              </div>
              <h2 className="text-3xl font-black text-slate-900 dark:text-white">
                Official Grade Card Lookup
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400 max-w-lg mx-auto">
                Search by Student Admission Number or Full Name to view and print published examination grade cards.
              </p>
            </div>

            <form
              onSubmit={handleResultSearch}
              className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 max-w-xl mx-auto"
            >
              <div className="relative flex-1">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={resultSearchQuery}
                  onChange={e => setResultSearchQuery(e.target.value)}
                  placeholder="Enter Admission No (e.g. 806) or Student Name..."
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
              <button
                type="submit"
                className="px-6 py-3 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-950 text-xs font-bold hover:opacity-90 transition cursor-pointer"
              >
                Search Grade Card
              </button>
            </form>

            {searchAttempted && !foundGradeCard && (
              <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center text-xs text-slate-500">
                No published grade card found matching "{resultSearchQuery}".
              </div>
            )}

            {foundGradeCard && (
              <div className="pt-4">
                <GradeCardTemplate
                  card={foundGradeCard}
                  onClose={() => {
                    setFoundGradeCard(null);
                    setSearchAttempted(false);
                  }}
                />
              </div>
            )}
          </div>
        </section>
      )}
      </>
      )}

      {/* =================================================================== */}
      {/* FOOTER                                                              */}
      {/* =================================================================== */}
      <footer className="mt-auto bg-slate-950 text-slate-400 border-t border-slate-800 py-14 px-4 sm:px-6 lg:px-8">
        {/* Custom Pages Footer Quick Directory */}
        {siteConfig.customPages && siteConfig.customPages.length > 0 && (
          <div className="max-w-7xl mx-auto pb-6 mb-6 border-b border-slate-800/80 flex flex-wrap items-center gap-4 text-xs">
            <span className="font-bold text-slate-300">Public Union Pages:</span>
            {siteConfig.customPages.map(page => (
              <button
                key={page.id}
                onClick={() => {
                  setActiveCustomPage(page);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="text-slate-400 hover:text-amber-400 transition cursor-pointer underline underline-offset-2"
              >
                {page.title}
              </button>
            ))}
          </div>
        )}

        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-8 pb-10 border-b border-slate-800/80">
          <div className="md:col-span-6 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-white text-slate-950 flex items-center justify-center font-black text-xs">
                {siteConfig.logoText || 'AU'}
              </div>
              <span className="font-black text-lg text-white tracking-tight">
                {siteConfig.unionName}
              </span>
            </div>
            <p className="text-xs text-slate-400 max-w-md leading-relaxed">
              {siteConfig.unionTagline}
            </p>
          </div>

          <div className="md:col-span-6 flex flex-col md:items-end justify-between space-y-2 text-xs">
            {siteConfig.contactAddress && <div>{siteConfig.contactAddress}</div>}
            <div className="flex flex-wrap items-center gap-3">
              {siteConfig.contactEmail && <span>{siteConfig.contactEmail}</span>}
              {siteConfig.contactEmail && siteConfig.contactPhone && <span>·</span>}
              {siteConfig.contactPhone && <span>{siteConfig.contactPhone}</span>}
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>{siteConfig.footerCopyright}</div>
          <div>
            {isAdminLoggedIn ? (
              <button
                onClick={onReturnToAdminDashboard}
                className="text-slate-400 hover:text-white transition cursor-pointer"
              >
                Open Admin Dashboard →
              </button>
            ) : (
              <button
                onClick={onOpenAdminLogin}
                className="text-slate-400 hover:text-white transition cursor-pointer flex items-center gap-1.5"
              >
                <Lock size={12} className="text-amber-500" />
                <span>Portal Login</span>
              </button>
            )}
          </div>
        </div>
      </footer>

      {/* =================================================================== */}
      {/* FULL-SCREEN LIGHTBOX FOR CLASS TOUR PHOTOS                          */}
      {/* =================================================================== */}
      {lightboxPhoto && (
        <div
          onClick={() => setLightboxPhoto(null)}
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
        >
          <div
            onClick={e => e.stopPropagation()}
            className="max-w-4xl w-full bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl"
          >
            <div className="relative bg-black flex items-center justify-center max-h-[75vh]">
              <img
                src={lightboxPhoto.imageUrl}
                alt={lightboxPhoto.title}
                className="max-h-[75vh] w-auto object-contain"
              />
              <button
                onClick={() => setLightboxPhoto(null)}
                className="absolute top-4 right-4 p-2 rounded-xl bg-black/60 text-white hover:bg-black transition cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>
            <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-white">{lightboxPhoto.title}</h3>
                {lightboxPhoto.description && (
                  <p className="text-xs text-slate-300 mt-1">{lightboxPhoto.description}</p>
                )}
              </div>
              <div className="text-xs text-slate-400 shrink-0">
                {lightboxPhoto.location}
                {lightboxPhoto.location && lightboxPhoto.date ? ' · ' : ''}
                {lightboxPhoto.date}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
