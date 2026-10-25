import React, { useState } from 'react';
import {
  useWebsiteBuilder,
  ExecutiveLeaderItem,
  ClassWingItem,
  WingMemberItem,
  TourPhotoItem,
  CustomSectionItem,
  CustomPublicPage,
  WebsiteThemeColor,
  WebsiteCardShape
} from '../../context/WebsiteBuilderContext';
import { useNotifications } from '../../context/NotificationContext';
import {
  Globe,
  Image as ImageIcon,
  Upload,
  Sparkles,
  Crown,
  Layers,
  Camera,
  BookOpen,
  Settings,
  Plus,
  Trash2,
  Edit3,
  X,
  Eye,
  RotateCcw,
  UserPlus,
  Users,
  Sliders,
  Layout,
  ExternalLink,
  CheckCircle2,
  Palette,
  FilePlus,
  FileText,
  Cloud,
  Database
} from 'lucide-react';

interface SuperAdminWebsiteBuilderProps {
  onPreviewPublicSite?: () => void;
}

type BuilderTab =
  | 'theme_shapes'
  | 'custom_pages'
  | 'hero'
  | 'about'
  | 'leaders'
  | 'wings'
  | 'tours'
  | 'custom_sections';

const HERO_PRESET_IMAGES = [
  {
    label: 'University Architecture',
    url: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=1920&q=85'
  },
  {
    label: 'Classic Library Hall',
    url: 'https://images.unsplash.com/photo-1507842229356-51c61504d3ab?auto=format&fit=crop&w=1920&q=85'
  },
  {
    label: 'Grand Campus Courtyard',
    url: 'https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=1920&q=85'
  },
  {
    label: 'Mountain Expedition',
    url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1920&q=85'
  },
  {
    label: 'Islamic Geometric Dome',
    url: 'https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?auto=format&fit=crop&w=1920&q=85'
  }
];

export const SuperAdminWebsiteBuilder: React.FC<SuperAdminWebsiteBuilderProps> = ({
  onPreviewPublicSite
}) => {
  const {
    siteConfig,
    updateSiteConfig,
    updateLeader,
    addLeader,
    deleteLeader,
    addWing,
    updateWing,
    deleteWing,
    addWingMember,
    updateWingMember,
    deleteWingMember,
    addTourPhoto,
    updateTourPhoto,
    deleteTourPhoto,
    addAboutStat,
    updateAboutStat,
    deleteAboutStat,
    addCustomSection,
    updateCustomSection,
    deleteCustomSection,
    addCustomPage,
    updateCustomPage,
    deleteCustomPage,
    setThemePreset,
    setCardBorderRadius,
    resetWebsiteConfig,
    cloudSyncStatus,
    lastCloudSyncedAt,
    forceSyncToFirebase
  } = useWebsiteBuilder();

  const { playChime, addNotification } = useNotifications();
  const [activeTab, setActiveTab] = useState<BuilderTab>('theme_shapes');

  // Custom Pages Management State
  const [showPageModal, setShowPageModal] = useState(false);
  const [editingPageId, setEditingPageId] = useState<string | null>(null);
  const [pageTitle, setPageTitle] = useState('');
  const [pageSubtitle, setPageSubtitle] = useState('');
  const [pageSlug, setPageSlug] = useState('');
  const [pageNavbarLabel, setPageNavbarLabel] = useState('');
  const [pageShowInNav, setPageShowInNav] = useState(true);
  const [pageContent, setPageContent] = useState('');
  const [pageCoverImage, setPageCoverImage] = useState('');

  // Helper to convert uploaded image file to Data URL
  const handleFileUpload = (
    file: File | undefined,
    onLoaded: (base64Url: string) => void
  ) => {
    if (!file) return;
    if (file.size > 8 * 1024 * 1024) {
      addNotification({
        title: 'File Too Large',
        message: 'Please select an image smaller than 8 MB.',
        type: 'warning'
      });
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        onLoaded(reader.result);
        playChime('success');
        addNotification({
          title: 'Photo Uploaded',
          message: 'Image has been updated on your live public website.',
          type: 'success'
        });
      }
    };
    reader.readAsDataURL(file);
  };

  // ============================================================================
  // STATE FOR ADDING NEW LEADER
  // ============================================================================
  const [showAddLeaderForm, setShowAddLeaderForm] = useState(false);
  const [newLeaderForm, setNewLeaderForm] = useState({
    roleTitle: '',
    name: '',
    rollOrId: '',
    quoteOrBio: '',
    photo: ''
  });

  // ============================================================================
  // STATE FOR WINGS & WING MEMBERS
  // ============================================================================
  const [selectedWingId, setSelectedWingId] = useState<string>(
    siteConfig.wings[0]?.id || ''
  );
  const [showAddWingModal, setShowAddWingModal] = useState(false);
  const [newWingForm, setNewWingForm] = useState({
    name: '',
    motto: '',
    description: '',
    coverPhoto: ''
  });

  const [newMemberForm, setNewMemberForm] = useState({
    name: '',
    designation: 'Wing Member',
    rollOrId: '',
    photo: ''
  });
  const [editingMemberId, setEditingMemberId] = useState<string | null>(null);
  const [editMemberDraft, setEditMemberDraft] = useState<WingMemberItem | null>(null);

  // ============================================================================
  // STATE FOR CLASS TOUR PHOTOS
  // ============================================================================
  const [newTourForm, setNewTourForm] = useState({
    title: '',
    location: '',
    date: '',
    album: 'Annual Class Tour',
    description: '',
    imageUrl: ''
  });

  // ============================================================================
  // STATE FOR CUSTOM WEBSITE SECTIONS
  // ============================================================================
  const [newSectionForm, setNewSectionForm] = useState({
    heading: '',
    subheading: '',
    content: '',
    imageUrl: '',
    layout: 'split-right' as CustomSectionItem['layout'],
    buttonText: ''
  });

  const activeWing: ClassWingItem | undefined =
    siteConfig.wings.find(w => w.id === selectedWingId) || siteConfig.wings[0];

  const handleSaveToast = (sectionName: string) => {
    playChime('success');
    addNotification({
      title: `${sectionName} Saved`,
      message: 'All changes are immediately live on the AL-USWAH UNION public website.',
      type: 'success'
    });
  };

  const CORE_LEADER_IDS = new Set([
    'ldr_president',
    'ldr_leader_1',
    'ldr_leader_2',
    'ldr_treasurer',
    'ldr_cashier_1',
    'ldr_cashier_2'
  ]);

  return (
    <div className="space-y-6">
      {/* ==================================================================== */}
      {/* TOP HEADER BAR */}
      {/* ==================================================================== */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-amber-950/70 via-slate-900 to-emerald-950/70 border border-amber-500/30 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 shadow-2xl">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-500/30">
            <Globe size={14} className="text-amber-400" />
            <span>NO-CODE PUBLIC WEBSITE BUILDER & CMS</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Develop & Customize "{siteConfig.unionName}" Website
          </h2>
          <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
            Change the Hero heading and background photo, update the About Class section, manage Class President, Class Leader, Second Leader, Treasurer, Cashier & Second Cashier, add or edit Class Wings & Wing Members, upload Class Tour photos, and create custom website sections without writing a single line of code.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          {/* Cloud Firestore Status Badge */}
          <div className="flex items-center gap-2 px-3 py-2 rounded-2xl bg-slate-950/80 border border-emerald-500/30 text-xs text-slate-300">
            <span className={`w-2 h-2 rounded-full ${cloudSyncStatus === 'syncing' ? 'bg-amber-400 animate-ping' : 'bg-emerald-400'}`} />
            <Database size={13} className="text-emerald-400" />
            <span className="font-semibold text-emerald-300">Firebase Firestore:</span>
            <span className="font-bold text-white font-mono text-[11px]">
              {cloudSyncStatus === 'syncing' ? 'Syncing...' : 'Saved to Cloud'}
            </span>
            {lastCloudSyncedAt && (
              <span className="text-[10px] text-slate-400 font-mono hidden sm:inline">({lastCloudSyncedAt})</span>
            )}
          </div>

          {/* Explicit Save to Firebase Button */}
          <button
            onClick={forceSyncToFirebase}
            className="px-4 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition flex items-center gap-2 shadow-lg shadow-indigo-600/30 cursor-pointer"
            title="Force immediate save of all website pages, wings, and media to Firebase Firestore"
          >
            <Cloud size={15} className={cloudSyncStatus === 'syncing' ? 'animate-bounce' : ''} />
            <span>Save to Firebase</span>
          </button>

          {onPreviewPublicSite && (
            <button
              onClick={onPreviewPublicSite}
              className="px-5 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition flex items-center gap-2 shadow-xl shadow-amber-500/25 cursor-pointer"
            >
              <Eye size={16} />
              <span>View Live Public Website</span>
              <ExternalLink size={13} />
            </button>
          )}

          <button
            onClick={() => handleSaveToast('Website Configuration')}
            className="px-4 py-3 rounded-2xl bg-emerald-600/80 hover:bg-emerald-600 text-white font-bold text-xs transition flex items-center gap-2 shadow-lg shadow-emerald-600/25 cursor-pointer"
          >
            <CheckCircle2 size={15} />
            <span>Auto-Saved</span>
          </button>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* BUILDER NAVIGATION TABS */}
      {/* ==================================================================== */}
      <div className="flex items-center gap-2 overflow-x-auto p-1.5 bg-slate-900/90 rounded-2xl border border-slate-800">
        {[
          { id: 'theme_shapes', label: '🎨 Colors & Card Shapes', icon: <Palette size={15} /> },
          { id: 'custom_pages', label: '📄 Custom Public Pages', icon: <FileText size={15} /> },
          { id: 'hero', label: '1. Hero & Background Photo', icon: <ImageIcon size={15} /> },
          { id: 'about', label: '2. About Class & Mission', icon: <BookOpen size={15} /> },
          { id: 'leaders', label: '3. President, Leaders & Cashiers', icon: <Crown size={15} /> },
          { id: 'wings', label: '4. Class Wings & Members', icon: <Layers size={15} /> },
          { id: 'tours', label: '5. Class Tour Photos', icon: <Camera size={15} /> },
          { id: 'custom_sections', label: '6. Custom Sections & Settings', icon: <Sliders size={15} /> }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id as BuilderTab);
              playChime('click');
            }}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === tab.id
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* ==================================================================== */}
      {/* TAB 0A: THEME & CARD SHAPES TEMPLATE CUSTOMIZER                      */}
      {/* ==================================================================== */}
      {activeTab === 'theme_shapes' && (
        <div className="space-y-6">
          <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-6 shadow-xl">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-500/30">
                  <Palette size={14} className="text-amber-400" />
                  <span>Template & Visual Styling Engine</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-white mt-1.5">
                  App Colors & Card Shapes (No-Code Template Customizer)
                </h2>
                <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
                  Customize the visual identity across the entire public dashboard. Select from cohesive color palettes matching the admin & student portals, and adjust card border geometry.
                </p>
              </div>

              <button
                type="button"
                onClick={() => handleSaveToast('Theme & Shapes')}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg transition flex items-center gap-1.5 cursor-pointer"
              >
                <CheckCircle2 size={14} />
                <span>Save Theme Palette</span>
              </button>
            </div>

            {/* Color Palette Selector */}
            <div className="space-y-3">
              <label className="block text-xs font-bold text-white uppercase tracking-wider">
                1. Select Primary Color Theme Palette
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
                {[
                  {
                    id: 'gold_slate' as WebsiteThemeColor,
                    name: 'AL-USWAH Gold',
                    desc: 'Official Royal Gold & Dark Slate (Default)',
                    swatch: 'from-amber-400 to-yellow-600',
                    badge: 'bg-amber-500 text-slate-950',
                    border: 'border-amber-500'
                  },
                  {
                    id: 'emerald_slate' as WebsiteThemeColor,
                    name: 'Islamic Emerald',
                    desc: 'Academic Emerald Green & Forest Slate',
                    swatch: 'from-emerald-400 to-teal-600',
                    badge: 'bg-emerald-500 text-white',
                    border: 'border-emerald-500'
                  },
                  {
                    id: 'cyan_slate' as WebsiteThemeColor,
                    name: 'Cyber Cyan',
                    desc: 'Vibrant Tech Cyan & Deep Midnight Slate',
                    swatch: 'from-cyan-400 to-blue-500',
                    badge: 'bg-cyan-500 text-slate-950',
                    border: 'border-cyan-500'
                  },
                  {
                    id: 'indigo_slate' as WebsiteThemeColor,
                    name: 'Royal Indigo',
                    desc: 'Classical University Indigo & Dark Slate',
                    swatch: 'from-indigo-400 to-purple-600',
                    badge: 'bg-indigo-600 text-white',
                    border: 'border-indigo-500'
                  },
                  {
                    id: 'rose_slate' as WebsiteThemeColor,
                    name: 'Crimson Rose',
                    desc: 'Executive Crimson Rose & Bold Slate',
                    swatch: 'from-rose-500 to-pink-600',
                    badge: 'bg-rose-600 text-white',
                    border: 'border-rose-500'
                  }
                ].map(item => {
                  const isSelected = (siteConfig.themePreset || 'gold_slate') === item.id;
                  return (
                    <div
                      key={item.id}
                      onClick={() => setThemePreset(item.id)}
                      className={`p-4 rounded-2xl bg-slate-950 border transition cursor-pointer flex flex-col justify-between space-y-3 ${
                        isSelected
                          ? `${item.border} ring-2 ring-amber-400/50 shadow-xl bg-slate-900`
                          : 'border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className={`w-8 h-8 rounded-full bg-gradient-to-tr ${item.swatch} shadow-md`} />
                        {isSelected && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            Active
                          </span>
                        )}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white">{item.name}</div>
                        <div className="text-[11px] text-slate-400 mt-0.5">{item.desc}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Card Border Radius / Shape Customizer */}
            <div className="space-y-3 pt-3 border-t border-slate-800">
              <label className="block text-xs font-bold text-white uppercase tracking-wider">
                2. Select Card Shape & Corner Radius
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                {[
                  {
                    id: 'rounded-3xl' as WebsiteCardShape,
                    name: 'Curved Ultra-Modern (3xl)',
                    desc: '24px extra rounded corners (Default modern)',
                    previewClass: 'rounded-3xl'
                  },
                  {
                    id: 'rounded-2xl' as WebsiteCardShape,
                    name: 'Balanced Curved (2xl)',
                    desc: '16px smooth rounded corners',
                    previewClass: 'rounded-2xl'
                  },
                  {
                    id: 'rounded-xl' as WebsiteCardShape,
                    name: 'Clean Rounded (xl)',
                    desc: '12px compact rounded corners',
                    previewClass: 'rounded-xl'
                  },
                  {
                    id: 'rounded-none' as WebsiteCardShape,
                    name: 'Sharp Geometric (none)',
                    desc: '0px sharp, architectural brutalist corners',
                    previewClass: 'rounded-none'
                  }
                ].map(shape => {
                  const isSelected = (siteConfig.cardBorderRadius || 'rounded-3xl') === shape.id;
                  return (
                    <div
                      key={shape.id}
                      onClick={() => setCardBorderRadius(shape.id)}
                      className={`p-4 rounded-2xl bg-slate-950 border transition cursor-pointer flex flex-col justify-between space-y-3 ${
                        isSelected
                          ? 'border-amber-500 ring-2 ring-amber-400/50 shadow-xl bg-slate-900'
                          : 'border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div
                          className={`w-12 h-8 bg-slate-800 border-2 border-amber-400 flex items-center justify-center text-[10px] text-amber-300 font-mono ${shape.previewClass}`}
                        >
                          Shape
                        </div>
                        {isSelected && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            Active
                          </span>
                        )}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white">{shape.name}</div>
                        <div className="text-[11px] text-slate-400 mt-0.5">{shape.desc}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Live Preview Widget */}
            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <Eye size={14} className="text-amber-400" />
                <span>Live Style Preview Component</span>
              </div>
              <div
                className={`p-5 bg-slate-900/90 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 ${
                  siteConfig.cardBorderRadius || 'rounded-3xl'
                }`}
              >
                <div>
                  <div className="text-sm font-black text-white">AL-USWAH UNION Component Preview</div>
                  <div className="text-xs text-slate-400">
                    Active Preset: <strong>{siteConfig.themePreset || 'gold_slate'}</strong> • Radius:{' '}
                    <strong>{siteConfig.cardBorderRadius || 'rounded-3xl'}</strong>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition shadow ${
                      siteConfig.themePreset === 'emerald_slate'
                        ? 'bg-emerald-600 text-white'
                        : siteConfig.themePreset === 'cyan_slate'
                        ? 'bg-cyan-500 text-slate-950'
                        : siteConfig.themePreset === 'indigo_slate'
                        ? 'bg-indigo-600 text-white'
                        : siteConfig.themePreset === 'rose_slate'
                        ? 'bg-rose-600 text-white'
                        : 'bg-amber-500 text-slate-950'
                    }`}
                  >
                    Primary Button
                  </button>
                  <button
                    type="button"
                    onClick={() => onPreviewPublicSite && onPreviewPublicSite()}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 flex items-center gap-1.5 cursor-pointer"
                  >
                    <ExternalLink size={13} />
                    <span>View Public Page</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* TAB 0B: CUSTOM PUBLIC PAGES MANAGER                                  */}
      {/* ==================================================================== */}
      {activeTab === 'custom_pages' && (
        <div className="space-y-6">
          <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-6 shadow-xl">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
                  <FileText size={14} className="text-emerald-400" />
                  <span>Public Content Management System</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-white mt-1.5">
                  Custom Public Pages Manager
                </h2>
                <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
                  Create standalone pages for your public website (such as Class Charter, Rules, Annual Reports, Alumni, or Photo Galleries). These pages appear in the top navbar and footer.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setEditingPageId(null);
                  setPageTitle('');
                  setPageSubtitle('');
                  setPageSlug('');
                  setPageNavbarLabel('');
                  setPageShowInNav(true);
                  setPageContent('');
                  setPageCoverImage('');
                  setShowPageModal(true);
                  playChime('click');
                }}
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-600/30 transition flex items-center gap-2 cursor-pointer"
              >
                <Plus size={15} />
                <span>Create New Public Page</span>
              </button>
            </div>

            {/* List of Custom Pages */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {(siteConfig.customPages || []).map(page => (
                <div
                  key={page.id}
                  className="p-5 rounded-3xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition shadow-lg space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    {page.coverImageUrl && (
                      <img
                        src={page.coverImageUrl}
                        alt={page.title}
                        className="w-full h-32 rounded-2xl object-cover border border-slate-800"
                      />
                    )}
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                        /{page.slug}
                      </span>
                      {page.showInNavbar && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          In Navbar
                        </span>
                      )}
                    </div>
                    <h3 className="text-sm font-bold text-white line-clamp-1">{page.title}</h3>
                    {page.subtitle && (
                      <p className="text-xs text-slate-400 line-clamp-2">{page.subtitle}</p>
                    )}
                  </div>

                  <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                    <span className="text-[11px] text-slate-500">{page.createdAt}</span>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingPageId(page.id);
                          setPageTitle(page.title);
                          setPageSubtitle(page.subtitle || '');
                          setPageSlug(page.slug);
                          setPageNavbarLabel(page.navbarLabel);
                          setPageShowInNav(page.showInNavbar);
                          setPageContent(page.content);
                          setPageCoverImage(page.coverImageUrl || '');
                          setShowPageModal(true);
                          playChime('click');
                        }}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer"
                        title="Edit Page"
                      >
                        <Edit3 size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteCustomPage(page.id)}
                        className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition cursor-pointer"
                        title="Delete Page"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {(siteConfig.customPages || []).length === 0 && (
                <div className="col-span-full py-12 text-center rounded-3xl bg-slate-950/60 border border-dashed border-slate-800 space-y-3">
                  <FileText size={36} className="text-slate-600 mx-auto" />
                  <div className="text-sm font-bold text-white">No Custom Pages Created Yet</div>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    Click "Create New Public Page" to publish custom pages like your class constitution, achievements, or tour blogs.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Modal to Add / Edit Custom Page */}
          {showPageModal && (
            <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
              <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-xl p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 my-8">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
                      <FilePlus size={18} />
                    </div>
                    <h3 className="text-base font-bold text-white">
                      {editingPageId ? 'Edit Custom Public Page' : 'Create New Public Page'}
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowPageModal(false)}
                    className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
                  >
                    <X size={18} />
                  </button>
                </div>

                <form
                  onSubmit={e => {
                    e.preventDefault();
                    if (!pageTitle.trim()) return;
                    const slug = (pageSlug.trim() || pageTitle.trim().toLowerCase().replace(/[^a-z0-9]/g, '-')).toLowerCase();
                    const navLabel = pageNavbarLabel.trim() || pageTitle.trim().slice(0, 16);

                    if (editingPageId) {
                      updateCustomPage(editingPageId, {
                        title: pageTitle.trim(),
                        subtitle: pageSubtitle.trim(),
                        slug,
                        navbarLabel: navLabel,
                        showInNavbar: pageShowInNav,
                        content: pageContent.trim(),
                        coverImageUrl: pageCoverImage.trim()
                      });
                    } else {
                      addCustomPage({
                        title: pageTitle.trim(),
                        subtitle: pageSubtitle.trim(),
                        slug,
                        navbarLabel: navLabel,
                        showInNavbar: pageShowInNav,
                        content: pageContent.trim(),
                        coverImageUrl: pageCoverImage.trim(),
                        author: 'Class Administration'
                      });
                    }
                    setShowPageModal(false);
                  }}
                  className="space-y-4 text-xs"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-300 mb-1">Page Title *</label>
                      <input
                        type="text"
                        required
                        value={pageTitle}
                        onChange={e => {
                          setPageTitle(e.target.value);
                          if (!editingPageId && !pageSlug) {
                            setPageSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '-'));
                          }
                          if (!editingPageId && !pageNavbarLabel) {
                            setPageNavbarLabel(e.target.value.slice(0, 15));
                          }
                        }}
                        placeholder="e.g. Class Charter & Rules"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-300 mb-1">URL Slug</label>
                      <input
                        type="text"
                        value={pageSlug}
                        onChange={e => setPageSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                        placeholder="e.g. charter-and-rules"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-300 mb-1">Subtitle / Summary</label>
                    <input
                      type="text"
                      value={pageSubtitle}
                      onChange={e => setPageSubtitle(e.target.value)}
                      placeholder="Brief one-line summary displayed below title"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-300 mb-1">Navbar Button Label</label>
                      <input
                        type="text"
                        value={pageNavbarLabel}
                        onChange={e => setPageNavbarLabel(e.target.value)}
                        placeholder="e.g. Charter"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div className="flex items-center gap-2 pt-6">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={pageShowInNav}
                          onChange={e => setPageShowInNav(e.target.checked)}
                          className="rounded accent-emerald-500"
                        />
                        <span className="text-white font-bold">Show in Top Website Navbar</span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-300 mb-1">Cover Image URL</label>
                    <input
                      type="url"
                      value={pageCoverImage}
                      onChange={e => setPageCoverImage(e.target.value)}
                      placeholder="https://images.unsplash.com/..."
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-300 mb-1">
                      Page Content / Paragraphs *
                    </label>
                    <textarea
                      required
                      rows={7}
                      value={pageContent}
                      onChange={e => setPageContent(e.target.value)}
                      placeholder="Write your page content here. Paragraphs and lines will be formatted cleanly on the public page..."
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-emerald-500 leading-relaxed font-sans"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                    <button
                      type="button"
                      onClick={() => setShowPageModal(false)}
                      className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold transition cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition flex items-center gap-1.5 shadow-lg shadow-emerald-600/30 cursor-pointer"
                    >
                      <CheckCircle2 size={14} />
                      <span>{editingPageId ? 'Save Changes' : 'Publish Page'}</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ==================================================================== */}
      {/* TAB 1: HERO & BACKGROUND PHOTO */}
      {/* ==================================================================== */}
      {activeTab === 'hero' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Text & Heading Controls */}
          <div className="lg:col-span-7 p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                  <Sparkles size={18} className="text-amber-400" />
                  <span>Public Website Heading & Identity</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Customize the main union name, hero heading (e.g., AL-USWAH UNION), and welcome text.
                </p>
              </div>
              <button
                onClick={() => handleSaveToast('Hero Section')}
                className="px-3.5 py-2 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold hover:bg-amber-500 hover:text-slate-950 transition cursor-pointer"
              >
                Save Changes
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Navbar Brand / Union Name
                </label>
                <input
                  type="text"
                  value={siteConfig.unionName}
                  onChange={e => updateSiteConfig({ unionName: e.target.value })}
                  placeholder="AL-USWAH UNION"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Union Subtitle / Tagline
                </label>
                <input
                  type="text"
                  value={siteConfig.unionTagline}
                  onChange={e => updateSiteConfig({ unionTagline: e.target.value })}
                  placeholder="Official Class Union & Academic Brotherhood"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Hero Top Kicker Badge (Session / Batch)
                </label>
                <input
                  type="text"
                  value={siteConfig.heroKicker}
                  onChange={e => updateSiteConfig({ heroKicker: e.target.value })}
                  placeholder="Academic Session 2026 – 2027"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Logo Monogram Text (or upload logo)
                </label>
                <input
                  type="text"
                  value={siteConfig.logoText}
                  onChange={e => updateSiteConfig({ logoText: e.target.value })}
                  placeholder="AU"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-amber-400 mb-1.5">
                Main Hero Heading (Large Center Title)
              </label>
              <input
                type="text"
                value={siteConfig.heroHeading}
                onChange={e => updateSiteConfig({ heroHeading: e.target.value })}
                placeholder="AL-USWAH UNION"
                className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-amber-500/40 text-base font-black text-white focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                Hero Description / Welcome Message
              </label>
              <textarea
                rows={3}
                value={siteConfig.heroSubheading}
                onChange={e => updateSiteConfig({ heroSubheading: e.target.value })}
                placeholder="Describe your class union..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-500 leading-relaxed"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Primary Button Label
                </label>
                <input
                  type="text"
                  value={siteConfig.heroPrimaryBtnText}
                  onChange={e => updateSiteConfig({ heroPrimaryBtnText: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Secondary Button Label
                </label>
                <input
                  type="text"
                  value={siteConfig.heroSecondaryBtnText}
                  onChange={e => updateSiteConfig({ heroSecondaryBtnText: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>
          </div>

          {/* Right Column: Hero Background Photo Changer */}
          <div className="lg:col-span-5 p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-5">
            <div>
              <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                <ImageIcon size={18} className="text-emerald-400" />
                <span>Hero Background Photo</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Upload any photo from your device or paste an image link to display behind "{siteConfig.heroHeading}".
              </p>
            </div>

            {/* Live Mini Preview */}
            <div className="relative h-52 rounded-2xl overflow-hidden border border-slate-700 shadow-xl">
              <img
                src={siteConfig.heroBgImage}
                alt="Hero Background Preview"
                className="w-full h-full object-cover"
              />
              <div
                className="absolute inset-0 bg-slate-950 flex flex-col items-center justify-center p-4 text-center"
                style={{ opacity: siteConfig.heroOverlayOpacity / 100 }}
              />
              <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 text-[9px] font-bold uppercase tracking-widest mb-2">
                  {siteConfig.heroKicker}
                </span>
                <h4 className="text-xl font-black text-white tracking-tight drop-shadow">
                  {siteConfig.heroHeading}
                </h4>
                <p className="text-[10px] text-slate-200 line-clamp-2 max-w-xs mt-1">
                  {siteConfig.heroSubheading}
                </p>
              </div>
            </div>

            {/* Device File Upload Button */}
            <div className="space-y-3">
              <label className="w-full py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/25 cursor-pointer transition">
                <Upload size={16} />
                <span>Upload Background Photo from Device</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={e =>
                    handleFileUpload(e.target.files?.[0], base64 =>
                      updateSiteConfig({ heroBgImage: base64 })
                    )
                  }
                />
              </label>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 mb-1">
                  Or Paste Background Image URL
                </label>
                <input
                  type="text"
                  value={siteConfig.heroBgImage}
                  onChange={e => updateSiteConfig({ heroBgImage: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>

              {/* Overlay Darkness Slider */}
              <div>
                <div className="flex items-center justify-between text-xs font-bold text-slate-300 mb-1">
                  <span>Photo Dark Overlay Contrast</span>
                  <span className="text-amber-400 font-mono">{siteConfig.heroOverlayOpacity}%</span>
                </div>
                <input
                  type="range"
                  min={20}
                  max={90}
                  value={siteConfig.heroOverlayOpacity}
                  onChange={e =>
                    updateSiteConfig({ heroOverlayOpacity: Number(e.target.value) })
                  }
                  className="w-full accent-amber-500 cursor-pointer"
                />
              </div>

              {/* Quick Preset Gallery */}
              <div>
                <label className="block text-[11px] font-bold text-slate-400 mb-2">
                  Quick Background Presets:
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {HERO_PRESET_IMAGES.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        updateSiteConfig({ heroBgImage: preset.url });
                        playChime('click');
                      }}
                      className={`h-12 rounded-xl overflow-hidden border-2 transition cursor-pointer ${
                        siteConfig.heroBgImage === preset.url
                          ? 'border-amber-400 scale-105'
                          : 'border-slate-800 opacity-70 hover:opacity-100'
                      }`}
                      title={preset.label}
                    >
                      <img src={preset.url} alt={preset.label} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* TAB 2: ABOUT CLASS & MISSION */}
      {/* ==================================================================== */}
      {activeTab === 'about' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                  <BookOpen size={18} className="text-amber-400" />
                  <span>About Class Story, Mission & Vision</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Write about your class union, academic brotherhood, mission, and vision.
                </p>
              </div>
              <button
                onClick={() => handleSaveToast('About Class Section')}
                className="px-3.5 py-2 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold hover:bg-amber-500 hover:text-slate-950 transition cursor-pointer"
              >
                Save About Section
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  About Section Heading
                </label>
                <input
                  type="text"
                  value={siteConfig.aboutHeading}
                  onChange={e => updateSiteConfig({ aboutHeading: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  About Section Subtitle
                </label>
                <input
                  type="text"
                  value={siteConfig.aboutSubheading}
                  onChange={e => updateSiteConfig({ aboutSubheading: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                Full About Class Description
              </label>
              <textarea
                rows={5}
                value={siteConfig.aboutDescription}
                onChange={e => updateSiteConfig({ aboutDescription: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-500 leading-relaxed"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-amber-400 mb-1.5">
                  Our Mission
                </label>
                <textarea
                  rows={3}
                  value={siteConfig.aboutMission}
                  onChange={e => updateSiteConfig({ aboutMission: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-emerald-400 mb-1.5">
                  Our Vision
                </label>
                <textarea
                  rows={3}
                  value={siteConfig.aboutVision}
                  onChange={e => updateSiteConfig({ aboutVision: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Right Column: About Image & Highlight Stats */}
          <div className="lg:col-span-5 space-y-6">
            <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-4">
              <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                <ImageIcon size={16} className="text-emerald-400" />
                <span>About Section Featured Photo</span>
              </h3>

              <div className="h-44 rounded-2xl overflow-hidden border border-slate-800">
                <img
                  src={siteConfig.aboutImage}
                  alt="About Class"
                  className="w-full h-full object-cover"
                />
              </div>

              <label className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition">
                <Upload size={15} />
                <span>Upload About Class Photo</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={e =>
                    handleFileUpload(e.target.files?.[0], base64 =>
                      updateSiteConfig({ aboutImage: base64 })
                    )
                  }
                />
              </label>

              <input
                type="text"
                value={siteConfig.aboutImage}
                onChange={e => updateSiteConfig({ aboutImage: e.target.value })}
                placeholder="Or paste image URL..."
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 font-mono"
              />
            </div>

            {/* Highlight Stats Editor */}
            <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-extrabold text-white">
                  Highlight Counter Boxes
                </h3>
                <button
                  type="button"
                  onClick={() => addAboutStat('New Highlight', '100%')}
                  className="text-xs font-bold text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Plus size={13} />
                  <span>Add Box</span>
                </button>
              </div>

              <div className="space-y-2.5">
                {siteConfig.aboutStats.map(stat => (
                  <div key={stat.id} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={stat.value}
                      onChange={e => updateAboutStat(stat.id, stat.label, e.target.value)}
                      placeholder="Value (e.g. 100%)"
                      className="w-28 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-extrabold text-amber-400"
                    />
                    <input
                      type="text"
                      value={stat.label}
                      onChange={e => updateAboutStat(stat.id, e.target.value, stat.value)}
                      placeholder="Label (e.g. Active Members)"
                      className="flex-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                    />
                    <button
                      type="button"
                      onClick={() => deleteAboutStat(stat.id)}
                      className="p-2 text-slate-500 hover:text-rose-400 cursor-pointer"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* TAB 3: EXECUTIVE LEADERSHIP (PRESIDENT, LEADERS, TREASURER, CASHIERS) */}
      {/* ==================================================================== */}
      {activeTab === 'leaders' && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-extrabold text-white flex items-center gap-2">
                <Crown size={20} className="text-amber-400" />
                <span>Executive Union Leadership Committee</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Edit your <strong className="text-amber-300">Class President, Class Leader, Second Leader, Treasurer, Cashier, and Second Cashier</strong>. Upload their photos, change names, or add additional union posts.
              </p>
            </div>
            <button
              onClick={() => setShowAddLeaderForm(!showAddLeaderForm)}
              className="px-4 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center gap-2 cursor-pointer shrink-0"
            >
              <Plus size={15} />
              <span>Add New Leadership Post</span>
            </button>
          </div>

          {/* Add New Leader Modal/Box */}
          {showAddLeaderForm && (
            <div className="p-6 rounded-3xl bg-slate-900 border-2 border-amber-500/40 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-extrabold text-amber-400">
                  Add New Executive Leader Post
                </h4>
                <button
                  onClick={() => setShowAddLeaderForm(false)}
                  className="text-slate-400 hover:text-white cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Position / Role Title *
                  </label>
                  <input
                    type="text"
                    value={newLeaderForm.roleTitle}
                    onChange={e => setNewLeaderForm({ ...newLeaderForm, roleTitle: e.target.value })}
                    placeholder="e.g., General Secretary / Auditor"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Leader Full Name *
                  </label>
                  <input
                    type="text"
                    value={newLeaderForm.name}
                    onChange={e => setNewLeaderForm({ ...newLeaderForm, name: e.target.value })}
                    placeholder="Enter student name"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Roll / ID Number
                  </label>
                  <input
                    type="text"
                    value={newLeaderForm.rollOrId}
                    onChange={e => setNewLeaderForm({ ...newLeaderForm, rollOrId: e.target.value })}
                    placeholder="e.g., Roll #07"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Message / Responsibilities Quote
                  </label>
                  <input
                    type="text"
                    value={newLeaderForm.quoteOrBio}
                    onChange={e => setNewLeaderForm({ ...newLeaderForm, quoteOrBio: e.target.value })}
                    placeholder="Short quote or responsibility summary..."
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Upload Leader Photo or Paste URL
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={newLeaderForm.photo}
                      onChange={e => setNewLeaderForm({ ...newLeaderForm, photo: e.target.value })}
                      placeholder="Paste photo URL or upload ->"
                      className="flex-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                    />
                    <label className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold cursor-pointer flex items-center gap-1 shrink-0">
                      <Upload size={14} />
                      <span>Upload</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={e =>
                          handleFileUpload(e.target.files?.[0], base64 =>
                            setNewLeaderForm(prev => ({ ...prev, photo: base64 }))
                          )
                        }
                      />
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    if (!newLeaderForm.roleTitle.trim() || !newLeaderForm.name.trim()) return;
                    addLeader({
                      roleTitle: newLeaderForm.roleTitle.trim(),
                      name: newLeaderForm.name.trim(),
                      rollOrId: newLeaderForm.rollOrId.trim() || 'Union Officer',
                      quoteOrBio:
                        newLeaderForm.quoteOrBio.trim() ||
                        'Serving the AL-USWAH UNION with dedication and excellence.',
                      photo: newLeaderForm.photo.trim()
                    });
                    setNewLeaderForm({
                      roleTitle: '',
                      name: '',
                      rollOrId: '',
                      quoteOrBio: '',
                      photo: ''
                    });
                    setShowAddLeaderForm(false);
                    handleSaveToast('New Executive Leader');
                  }}
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs cursor-pointer"
                >
                  Save Leader to Website
                </button>
              </div>
            </div>
          )}

          {/* Leaders Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {siteConfig.leaders.map((leader: ExecutiveLeaderItem) => (
              <div
                key={leader.id}
                className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 hover:border-amber-500/40 transition space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-4">
                  {/* Top Photo + Role Preview */}
                  <div className="flex items-center gap-4">
                    <div className="relative w-20 h-20 rounded-2xl overflow-hidden border-2 border-amber-500/40 shrink-0 group bg-slate-800 flex items-center justify-center">
                      {leader.photo ? (
                        <img
                          src={leader.photo}
                          alt={leader.name || leader.roleTitle}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Crown size={24} className="text-amber-400/60" />
                      )}
                      <label
                        title="Upload New Photo"
                        className="absolute inset-0 bg-slate-950/75 opacity-0 group-hover:opacity-100 transition flex flex-col items-center justify-center text-amber-300 text-[10px] font-bold cursor-pointer"
                      >
                        <Upload size={15} />
                        <span>Change</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={e =>
                            handleFileUpload(e.target.files?.[0], base64 =>
                              updateLeader(leader.id, { photo: base64 })
                            )
                          }
                        />
                      </label>
                    </div>

                    <div className="flex-1 min-w-0 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-black uppercase tracking-wider truncate">
                          {leader.roleTitle}
                        </span>
                        {!CORE_LEADER_IDS.has(leader.id) && (
                          <button
                            onClick={() => deleteLeader(leader.id)}
                            className="text-slate-500 hover:text-rose-400 p-1 cursor-pointer"
                            title="Remove Position"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>

                      <input
                        type="text"
                        value={leader.roleTitle}
                        onChange={e => updateLeader(leader.id, { roleTitle: e.target.value })}
                        placeholder="Position Title (e.g. Class President)"
                        className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs font-bold text-amber-400"
                      />
                    </div>
                  </div>

                  {/* Leader Name & Roll Number */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <div className="sm:col-span-2">
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                        Officer Full Name
                      </label>
                      <input
                        type="text"
                        value={leader.name}
                        onChange={e => updateLeader(leader.id, { name: e.target.value })}
                        placeholder="Enter Full Name..."
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-extrabold text-white focus:border-amber-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                        Roll / ID
                      </label>
                      <input
                        type="text"
                        value={leader.rollOrId || ''}
                        onChange={e => updateLeader(leader.id, { rollOrId: e.target.value })}
                        placeholder="Roll #01"
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-300 focus:border-amber-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Quote / Bio */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                      Quote / Duty Statement
                    </label>
                    <textarea
                      rows={2}
                      value={leader.quoteOrBio || ''}
                      onChange={e => updateLeader(leader.id, { quoteOrBio: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 focus:border-amber-500 focus:outline-none"
                    />
                  </div>

                  {/* Photo Upload / URL Bar */}
                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="text"
                      value={leader.photo || ''}
                      onChange={e => updateLeader(leader.id, { photo: e.target.value })}
                      placeholder="Photo URL..."
                      className="flex-1 px-2.5 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-400 font-mono"
                    />
                    <label className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-[11px] font-bold flex items-center gap-1.5 cursor-pointer shrink-0">
                      <Upload size={12} />
                      <span>Upload Photo</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={e =>
                          handleFileUpload(e.target.files?.[0], base64 =>
                            updateLeader(leader.id, { photo: base64 })
                          )
                        }
                      />
                    </label>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* TAB 4: CLASS WINGS & WING MEMBERS MANAGER */}
      {/* ==================================================================== */}
      {activeTab === 'wings' && (
        <div className="space-y-6">
          {/* Top Header */}
          <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-extrabold text-white flex items-center gap-2">
                <Layers size={20} className="text-emerald-400" />
                <span>Class Wings & Wing Members Manager</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Create or edit Class Wings and add/update Wing Members (with photos, roles, and roll numbers). All wings and members appear dynamically on the public dashboard.
              </p>
            </div>
            <button
              onClick={() => setShowAddWingModal(!showAddWingModal)}
              className="px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 cursor-pointer shrink-0 shadow-lg shadow-emerald-600/20"
            >
              <Plus size={15} />
              <span>Create New Class Wing</span>
            </button>
          </div>

          {/* Create New Wing Modal Box */}
          {showAddWingModal && (
            <div className="p-6 rounded-3xl bg-slate-900 border-2 border-emerald-500/40 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-extrabold text-emerald-400">
                  Create New Class Wing
                </h4>
                <button
                  onClick={() => setShowAddWingModal(false)}
                  className="text-slate-400 hover:text-white cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Wing Name *
                  </label>
                  <input
                    type="text"
                    value={newWingForm.name}
                    onChange={e => setNewWingForm({ ...newWingForm, name: e.target.value })}
                    placeholder="e.g., Academic & Research Wing"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Wing Motto / Subtitle
                  </label>
                  <input
                    type="text"
                    value={newWingForm.motto}
                    onChange={e =>
                      setNewWingForm({ ...newWingForm, motto: e.target.value })
                    }
                    placeholder="e.g., Knowledge & Excellence"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Wing Cover Photo (Optional)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={newWingForm.coverPhoto}
                      onChange={e =>
                        setNewWingForm({ ...newWingForm, coverPhoto: e.target.value })
                      }
                      placeholder="Paste URL or upload"
                      className="flex-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                    />
                    <label className="px-3 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold cursor-pointer">
                      <Upload size={14} />
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={e =>
                          handleFileUpload(e.target.files?.[0], base64 =>
                            setNewWingForm(prev => ({ ...prev, coverPhoto: base64 }))
                          )
                        }
                      />
                    </label>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Wing Mission & Activities Description
                </label>
                <textarea
                  rows={2}
                  value={newWingForm.description}
                  onChange={e => setNewWingForm({ ...newWingForm, description: e.target.value })}
                  placeholder="Describe what this wing does for the class..."
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    if (!newWingForm.name.trim()) return;
                    addWing({
                      name: newWingForm.name.trim(),
                      motto: newWingForm.motto.trim() || 'Union Wing',
                      description:
                        newWingForm.description.trim() ||
                        'Dedicated wing of AL-USWAH UNION.',
                      coverPhoto: newWingForm.coverPhoto.trim()
                    });
                    setNewWingForm({
                      name: '',
                      motto: '',
                      description: '',
                      coverPhoto: ''
                    });
                    setShowAddWingModal(false);
                  }}
                  className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs cursor-pointer"
                >
                  Create Class Wing
                </button>
              </div>
            </div>
          )}

          {/* Empty state if no wings yet */}
          {siteConfig.wings.length === 0 ? (
            <div className="p-12 rounded-3xl bg-slate-900/90 border border-dashed border-slate-800 text-center space-y-3">
              <Layers size={32} className="text-emerald-400 mx-auto" />
              <h4 className="text-base font-extrabold text-white">
                No Class Wings Created Yet
              </h4>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Click "Create New Class Wing" above to create your first wing (e.g., Media Wing, Cultural Wing, Academic Wing, Social Welfare Wing) and add wing members.
              </p>
              <button
                onClick={() => setShowAddWingModal(true)}
                className="px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs inline-flex items-center gap-2 cursor-pointer"
              >
                <Plus size={15} />
                <span>Create First Class Wing</span>
              </button>
            </div>
          ) : (
            <>
              {/* Wing Selector Pills */}
              <div className="flex flex-wrap items-center gap-2.5">
                {siteConfig.wings.map((wing: ClassWingItem) => {
                  const isSelected = activeWing?.id === wing.id;
                  return (
                    <button
                      key={wing.id}
                      onClick={() => {
                        setSelectedWingId(wing.id);
                        setEditingMemberId(null);
                      }}
                      className={`px-4 py-2.5 rounded-2xl text-xs font-extrabold transition flex items-center gap-2.5 cursor-pointer border ${
                        isSelected
                          ? 'bg-emerald-600 text-white border-emerald-500 shadow-lg shadow-emerald-600/20'
                          : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <span>{wing.name}</span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] ${
                          isSelected ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {wing.members.length} Members
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Selected Wing Details & Members CRUD */}
              {activeWing && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Left 5 Cols: Edit Wing Info & Add New Wing Member */}
                  <div className="lg:col-span-5 space-y-6">
                    {/* Wing Info Card */}
                    <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-4">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                        <h4 className="text-sm font-extrabold text-white">
                          Edit Wing Details
                        </h4>
                        <button
                          onClick={() => {
                            deleteWing(activeWing.id);
                            const remaining = siteConfig.wings.filter(w => w.id !== activeWing.id);
                            if (remaining[0]) setSelectedWingId(remaining[0].id);
                          }}
                          className="text-xs text-rose-400 hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <Trash2 size={13} />
                          <span>Delete Wing</span>
                        </button>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-400 mb-1">
                          Wing Title
                        </label>
                        <input
                          type="text"
                          value={activeWing.name}
                          onChange={e => updateWing(activeWing.id, { name: e.target.value })}
                          className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-bold text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-400 mb-1">
                          Wing Subtitle / Motto
                        </label>
                        <input
                          type="text"
                          value={activeWing.motto || ''}
                          onChange={e =>
                            updateWing(activeWing.id, { motto: e.target.value })
                          }
                          className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-amber-400"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-400 mb-1">
                          Wing Description
                        </label>
                        <textarea
                          rows={3}
                          value={activeWing.description}
                          onChange={e => updateWing(activeWing.id, { description: e.target.value })}
                          className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-400 mb-1">
                          Wing Cover Banner Photo
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={activeWing.coverPhoto || ''}
                            onChange={e =>
                              updateWing(activeWing.id, { coverPhoto: e.target.value })
                            }
                            placeholder="Cover photo URL..."
                            className="flex-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-400 font-mono"
                          />
                          <label className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold cursor-pointer flex items-center gap-1.5">
                            <Upload size={13} />
                            <span>Upload</span>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={e =>
                                handleFileUpload(e.target.files?.[0], base64 =>
                                  updateWing(activeWing.id, { coverPhoto: base64 })
                                )
                              }
                            />
                          </label>
                        </div>
                      </div>
                    </div>

                    {/* Add Member to This Wing Card */}
                    <div className="p-6 rounded-3xl bg-emerald-950/20 border border-emerald-500/30 space-y-4">
                      <h4 className="text-sm font-extrabold text-emerald-400 flex items-center gap-2">
                        <UserPlus size={16} />
                        <span>Add Member to "{activeWing.name}"</span>
                      </h4>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-300 mb-1">
                            Member Name *
                          </label>
                          <input
                            type="text"
                            value={newMemberForm.name}
                            onChange={e =>
                              setNewMemberForm({ ...newMemberForm, name: e.target.value })
                            }
                            placeholder="e.g., Tariqul Islam"
                            className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-slate-300 mb-1">
                            Wing Role / Designation *
                          </label>
                          <input
                            type="text"
                            value={newMemberForm.designation}
                            onChange={e =>
                              setNewMemberForm({ ...newMemberForm, designation: e.target.value })
                            }
                            placeholder="Wing Head / Secretary / Member"
                            className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-300 mb-1">
                            Roll / ID Number
                          </label>
                          <input
                            type="text"
                            value={newMemberForm.rollOrId}
                            onChange={e =>
                              setNewMemberForm({ ...newMemberForm, rollOrId: e.target.value })
                            }
                            placeholder="e.g., Roll #12"
                            className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-slate-300 mb-1">
                            Member Photo (Optional)
                          </label>
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={newMemberForm.photo}
                              onChange={e =>
                                setNewMemberForm({ ...newMemberForm, photo: e.target.value })
                              }
                              placeholder="URL or Upload"
                              className="flex-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                            />
                            <label className="p-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer">
                              <Upload size={14} />
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={e =>
                                  handleFileUpload(e.target.files?.[0], base64 =>
                                    setNewMemberForm(prev => ({ ...prev, photo: base64 }))
                                  )
                                }
                              />
                            </label>
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          if (!newMemberForm.name.trim()) return;
                          addWingMember(activeWing.id, {
                            name: newMemberForm.name.trim(),
                            designation: newMemberForm.designation.trim() || 'Wing Member',
                            rollOrId: newMemberForm.rollOrId.trim() || '',
                            photo: newMemberForm.photo.trim()
                          });
                          setNewMemberForm({
                            name: '',
                            designation: 'Wing Member',
                            rollOrId: '',
                            photo: ''
                          });
                        }}
                        className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs flex items-center justify-center gap-2 cursor-pointer transition"
                      >
                        <Plus size={15} />
                        <span>Add Member to {activeWing.name}</span>
                      </button>
                    </div>
                  </div>

                  {/* Right 7 Cols: Current Wing Members Roster */}
                  <div className="lg:col-span-7 p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                      <div>
                        <h4 className="text-base font-extrabold text-white flex items-center gap-2">
                          <Users size={18} className="text-emerald-400" />
                          <span>
                            {activeWing.name} — Members ({activeWing.members.length})
                          </span>
                        </h4>
                        <p className="text-xs text-slate-400">
                          Click any member to edit their name, designation, photo, or remove them.
                        </p>
                      </div>
                    </div>

                    {activeWing.members.length === 0 ? (
                      <div className="p-12 text-center rounded-2xl border border-dashed border-slate-800 text-slate-400 text-xs">
                        No members in this wing yet. Use the form on the left to add wing members!
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {activeWing.members.map((member: WingMemberItem) => {
                          const isEditing = editingMemberId === member.id && editMemberDraft;

                          return (
                            <div
                              key={member.id}
                              className="p-4 rounded-2xl bg-slate-950/90 border border-slate-800 hover:border-emerald-500/40 transition space-y-3"
                            >
                              {isEditing && editMemberDraft ? (
                                <div className="space-y-2.5">
                                  <input
                                    type="text"
                                    value={editMemberDraft.name}
                                    onChange={e =>
                                      setEditMemberDraft({ ...editMemberDraft, name: e.target.value })
                                    }
                                    placeholder="Member Name"
                                    className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs font-bold text-white"
                                  />
                                  <div className="grid grid-cols-2 gap-2">
                                    <input
                                      type="text"
                                      value={editMemberDraft.designation}
                                      onChange={e =>
                                        setEditMemberDraft({
                                          ...editMemberDraft,
                                          designation: e.target.value
                                        })
                                      }
                                      placeholder="Designation"
                                      className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-emerald-400"
                                    />
                                    <input
                                      type="text"
                                      value={editMemberDraft.rollOrId || ''}
                                      onChange={e =>
                                        setEditMemberDraft({
                                          ...editMemberDraft,
                                          rollOrId: e.target.value
                                        })
                                      }
                                      placeholder="Roll #"
                                      className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-300"
                                    />
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <input
                                      type="text"
                                      value={editMemberDraft.photo || ''}
                                      onChange={e =>
                                        setEditMemberDraft({
                                          ...editMemberDraft,
                                          photo: e.target.value
                                        })
                                      }
                                      placeholder="Photo URL"
                                      className="flex-1 px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-[11px] text-slate-400"
                                    />
                                    <label className="px-2.5 py-1.5 rounded-lg bg-slate-800 text-white text-[11px] cursor-pointer">
                                      <Upload size={12} />
                                      <input
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={e =>
                                          handleFileUpload(e.target.files?.[0], base64 =>
                                            setEditMemberDraft((prev: WingMemberItem | null) =>
                                              prev ? { ...prev, photo: base64 } : null
                                            )
                                          )
                                        }
                                      />
                                    </label>
                                  </div>
                                  <div className="flex justify-end gap-2 pt-1">
                                    <button
                                      onClick={() => {
                                        setEditingMemberId(null);
                                        setEditMemberDraft(null);
                                      }}
                                      className="px-3 py-1 rounded-lg bg-slate-800 text-slate-300 text-xs cursor-pointer"
                                    >
                                      Cancel
                                    </button>
                                    <button
                                      onClick={() => {
                                        updateWingMember(activeWing.id, member.id, {
                                          name: editMemberDraft.name,
                                          designation: editMemberDraft.designation,
                                          rollOrId: editMemberDraft.rollOrId,
                                          photo: editMemberDraft.photo
                                        });
                                        setEditingMemberId(null);
                                        setEditMemberDraft(null);
                                        handleSaveToast('Wing Member Updated');
                                      }}
                                      className="px-3 py-1 rounded-lg bg-emerald-500 text-slate-950 font-bold text-xs cursor-pointer"
                                    >
                                      Save
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <div className="flex items-center justify-between gap-3">
                                  <div className="flex items-center gap-3 min-w-0">
                                    {member.photo ? (
                                      <img
                                        src={member.photo}
                                        alt={member.name}
                                        className="w-12 h-12 rounded-xl object-cover border border-slate-700 shrink-0"
                                      />
                                    ) : (
                                      <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-black text-emerald-400 shrink-0">
                                        {member.name.slice(0, 2).toUpperCase()}
                                      </div>
                                    )}
                                    <div className="min-w-0">
                                      <div className="text-xs font-extrabold text-white truncate">
                                        {member.name}
                                      </div>
                                      <div className="text-[11px] font-bold text-emerald-400">
                                        {member.designation}
                                      </div>
                                      {member.rollOrId && (
                                        <div className="text-[10px] font-mono text-slate-500">
                                          {member.rollOrId}
                                        </div>
                                      )}
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-1 shrink-0">
                                    <button
                                      onClick={() => {
                                        setEditingMemberId(member.id);
                                        setEditMemberDraft({ ...member });
                                      }}
                                      className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
                                      title="Edit Member"
                                    >
                                      <Edit3 size={14} />
                                    </button>
                                    <button
                                      onClick={() => deleteWingMember(activeWing.id, member.id)}
                                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 cursor-pointer"
                                      title="Remove Member"
                                    >
                                      <Trash2 size={14} />
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* ==================================================================== */}
      {/* TAB 5: CLASS TOUR PHOTOS GALLERY MANAGER */}
      {/* ==================================================================== */}
      {activeTab === 'tours' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left 5 Cols: Upload New Class Tour Photo */}
          <div className="lg:col-span-5 p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-4 h-fit">
            <h3 className="text-base font-extrabold text-white flex items-center gap-2">
              <Camera size={18} className="text-amber-400" />
              <span>Upload New Class Tour Photo</span>
            </h3>
            <p className="text-xs text-slate-400">
              Add memorable photos from study tours, excursions, and class retreats to the public gallery.
            </p>

            {/* Upload from device button */}
            <label className="w-full py-4 px-4 rounded-2xl border-2 border-dashed border-amber-500/40 hover:border-amber-400 bg-amber-500/5 hover:bg-amber-500/10 text-amber-300 font-bold text-xs flex flex-col items-center justify-center gap-2 cursor-pointer transition">
              <Upload size={22} className="text-amber-400" />
              <span>Click to Upload Tour Photo from Device</span>
              <span className="text-[10px] text-slate-400 font-normal">
                Supports JPG, PNG, WebP (or paste link below)
              </span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={e =>
                  handleFileUpload(e.target.files?.[0], base64 =>
                    setNewTourForm(prev => ({ ...prev, imageUrl: base64 }))
                  )
                }
              />
            </label>

            {newTourForm.imageUrl && (
              <div className="h-40 rounded-2xl overflow-hidden border border-slate-700 relative">
                <img
                  src={newTourForm.imageUrl}
                  alt="Tour Preview"
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => setNewTourForm({ ...newTourForm, imageUrl: '' })}
                  className="absolute top-2 right-2 p-1.5 rounded-full bg-slate-950/80 text-white hover:bg-rose-600 cursor-pointer"
                >
                  <X size={14} />
                </button>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Or Paste Photo URL
              </label>
              <input
                type="text"
                value={newTourForm.imageUrl}
                onChange={e => setNewTourForm({ ...newTourForm, imageUrl: e.target.value })}
                placeholder="https://images.unsplash.com/..."
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Photo Title / Memory Caption *
              </label>
              <input
                type="text"
                value={newTourForm.title}
                onChange={e => setNewTourForm({ ...newTourForm, title: e.target.value })}
                placeholder="e.g., Annual Mountain Retreat & Campfire"
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Tour Location *
                </label>
                <input
                  type="text"
                  value={newTourForm.location}
                  onChange={e => setNewTourForm({ ...newTourForm, location: e.target.value })}
                  placeholder="e.g., Sylhet / Cox's Bazar"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Date / Season
                </label>
                <input
                  type="text"
                  value={newTourForm.date}
                  onChange={e => setNewTourForm({ ...newTourForm, date: e.target.value })}
                  placeholder="e.g., Winter 2026"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Album / Category Tag
              </label>
              <input
                type="text"
                value={newTourForm.album}
                onChange={e => setNewTourForm({ ...newTourForm, album: e.target.value })}
                placeholder="e.g., Annual Class Tour / Historical Visit"
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Short Story / Description
              </label>
              <textarea
                rows={2}
                value={newTourForm.description}
                onChange={e => setNewTourForm({ ...newTourForm, description: e.target.value })}
                placeholder="Share a brief story about this moment..."
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
              />
            </div>

            <button
              type="button"
              onClick={() => {
                if (!newTourForm.title.trim() || !newTourForm.imageUrl.trim()) {
                  addNotification({
                    title: 'Missing Photo or Title',
                    message: 'Please upload/paste a photo and enter a title.',
                    type: 'warning'
                  });
                  return;
                }
                addTourPhoto({
                  title: newTourForm.title.trim(),
                  location: newTourForm.location.trim() || 'Class Excursion',
                  date: newTourForm.date.trim() || '2026',
                  album: newTourForm.album.trim() || 'Class Tour',
                  description:
                    newTourForm.description.trim() ||
                    'Unforgettable class tour memories of AL-USWAH UNION.',
                  imageUrl: newTourForm.imageUrl.trim()
                });
                setNewTourForm({
                  title: '',
                  location: '',
                  date: '',
                  album: 'Annual Class Tour',
                  description: '',
                  imageUrl: ''
                });
              }}
              className="w-full py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center justify-center gap-2 cursor-pointer transition shadow-lg shadow-amber-500/20"
            >
              <Plus size={16} />
              <span>Publish Photo to Tour Gallery</span>
            </button>
          </div>

          {/* Right 7 Cols: Existing Tour Photos Grid */}
          <div className="lg:col-span-7 p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-extrabold text-white">
                  Published Class Tour Photos ({siteConfig.tourPhotos.length})
                </h3>
                <p className="text-xs text-slate-400">
                  Edit captions, replace photos, or remove photos from the public gallery.
                </p>
              </div>
            </div>

            {siteConfig.tourPhotos.length === 0 ? (
              <div className="p-12 text-center rounded-2xl border border-dashed border-slate-800 text-slate-400 text-xs">
                No class tour photos uploaded yet. Use the form on the left to upload your class tour memories!
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {siteConfig.tourPhotos.map((photo: TourPhotoItem) => (
                  <div
                    key={photo.id}
                    className="rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden flex flex-col justify-between group"
                  >
                    <div>
                      <div className="relative h-44 overflow-hidden">
                        <img
                          src={photo.imageUrl}
                          alt={photo.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                        />
                        <div className="absolute top-2.5 left-2.5">
                          <span className="px-2.5 py-1 rounded-full bg-slate-950/80 text-amber-300 text-[10px] font-bold">
                            {photo.album || 'Class Tour'}
                          </span>
                        </div>
                        <button
                          onClick={() => deleteTourPhoto(photo.id)}
                          className="absolute top-2.5 right-2.5 p-2 rounded-full bg-slate-950/80 text-slate-300 hover:bg-rose-600 hover:text-white transition cursor-pointer"
                          title="Delete Tour Photo"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>

                      <div className="p-4 space-y-2.5">
                        <input
                          type="text"
                          value={photo.title}
                          onChange={e => updateTourPhoto(photo.id, { title: e.target.value })}
                          className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-extrabold text-white"
                        />
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="text"
                            value={photo.location}
                            onChange={e => updateTourPhoto(photo.id, { location: e.target.value })}
                            placeholder="Location"
                            className="w-full px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-[11px] text-amber-400"
                          />
                          <input
                            type="text"
                            value={photo.date}
                            onChange={e => updateTourPhoto(photo.id, { date: e.target.value })}
                            placeholder="Date"
                            className="w-full px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-[11px] text-slate-300"
                          />
                        </div>
                        <textarea
                          rows={2}
                          value={photo.description || ''}
                          onChange={e => updateTourPhoto(photo.id, { description: e.target.value })}
                          className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-[11px] text-slate-400"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* TAB 6: CUSTOM NO-CODE SECTIONS & VISIBILITY SETTINGS */}
      {/* ==================================================================== */}
      {activeTab === 'custom_sections' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left 7 Cols: Add & Edit Custom Website Sections */}
          <div className="lg:col-span-7 space-y-6">
            <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-4">
              <div>
                <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                  <Layout size={18} className="text-amber-400" />
                  <span>Add Custom Website Section (No-Code Builder)</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Want to add a new section to the website (e.g., "Our Achievements", "Library Corner", "Alumni Message", "Sports Championship")? Build it here and it will appear on the public website automatically.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Section Heading *
                  </label>
                  <input
                    type="text"
                    value={newSectionForm.heading}
                    onChange={e => setNewSectionForm({ ...newSectionForm, heading: e.target.value })}
                    placeholder="e.g., Annual Sports & Cultural Achievements"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Section Subheading / Kicker
                  </label>
                  <input
                    type="text"
                    value={newSectionForm.subheading}
                    onChange={e =>
                      setNewSectionForm({ ...newSectionForm, subheading: e.target.value })
                    }
                    placeholder="e.g., UNION HIGHLIGHTS"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Visual Layout Style
                  </label>
                  <select
                    value={newSectionForm.layout}
                    onChange={e =>
                      setNewSectionForm({
                        ...newSectionForm,
                        layout: e.target.value as CustomSectionItem['layout']
                      })
                    }
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                  >
                    <option value="split-right">Split Layout (Text Left + Photo Right)</option>
                    <option value="split-left">Split Layout (Photo Left + Text Right)</option>
                    <option value="centered">Centered Full-Width Spotlight</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Optional Call-to-Action Button Label
                  </label>
                  <input
                    type="text"
                    value={newSectionForm.buttonText}
                    onChange={e =>
                      setNewSectionForm({ ...newSectionForm, buttonText: e.target.value })
                    }
                    placeholder="e.g., Learn More"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Main Content / Paragraph *
                </label>
                <textarea
                  rows={3}
                  value={newSectionForm.content}
                  onChange={e =>
                    setNewSectionForm({ ...newSectionForm, content: e.target.value })
                  }
                  placeholder="Write the full text content for this custom section..."
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-300">
                  Section Photo (Optional)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newSectionForm.imageUrl}
                    onChange={e =>
                      setNewSectionForm({ ...newSectionForm, imageUrl: e.target.value })
                    }
                    placeholder="Paste image URL or upload ->"
                    className="flex-1 px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                  />
                  <label className="py-2 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shrink-0">
                    <Upload size={14} />
                    <span>Upload Photo</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={e =>
                        handleFileUpload(e.target.files?.[0], base64 =>
                          setNewSectionForm(prev => ({ ...prev, imageUrl: base64 }))
                        )
                      }
                    />
                  </label>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  if (!newSectionForm.heading.trim()) return;
                  addCustomSection({
                    heading: newSectionForm.heading.trim(),
                    subheading: newSectionForm.subheading.trim(),
                    content: newSectionForm.content.trim(),
                    imageUrl: newSectionForm.imageUrl.trim() || undefined,
                    layout: newSectionForm.layout,
                    buttonText: newSectionForm.buttonText.trim() || undefined,
                    visible: true
                  });
                  setNewSectionForm({
                    heading: '',
                    subheading: '',
                    content: '',
                    imageUrl: '',
                    layout: 'split-right',
                    buttonText: ''
                  });
                }}
                className="w-full py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center justify-center gap-2 cursor-pointer"
              >
                <Plus size={16} />
                <span>Add Section to Live Website</span>
              </button>
            </div>

            {/* Existing Custom Sections List */}
            {siteConfig.customSections.length > 0 && (
              <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-4">
                <h4 className="text-sm font-extrabold text-white">
                  Custom Sections on Public Website ({siteConfig.customSections.length})
                </h4>
                <div className="space-y-3">
                  {siteConfig.customSections.map((sec: CustomSectionItem) => (
                    <div
                      key={sec.id}
                      className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-4"
                    >
                      <div className="min-w-0 flex-1">
                        <span className="text-[10px] font-bold text-amber-400 uppercase">
                          {sec.subheading || 'Custom Section'} • {sec.layout}
                        </span>
                        <h5 className="text-sm font-extrabold text-white truncate">
                          {sec.heading}
                        </h5>
                        <p className="text-xs text-slate-400 line-clamp-1">{sec.content}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <label className="text-[11px] text-slate-300 flex items-center gap-1 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={sec.visible}
                            onChange={e =>
                              updateCustomSection(sec.id, { visible: e.target.checked })
                            }
                            className="accent-emerald-500"
                          />
                          <span>Visible</span>
                        </label>
                        <button
                          onClick={() => deleteCustomSection(sec.id)}
                          className="p-2 rounded-xl bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white transition cursor-pointer"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right 5 Cols: Section Visibility Toggles & Footer Settings */}
          <div className="lg:col-span-5 space-y-6">
            <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-4">
              <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                <Settings size={18} className="text-emerald-400" />
                <span>Website Section Visibility Controls</span>
              </h3>
              <p className="text-xs text-slate-400">
                Turn any section of the public website ON or OFF anytime.
              </p>

              <div className="space-y-2.5">
                {[
                  { key: 'showAboutSection', label: 'About Class & Mission Section' },
                  { key: 'showLeadersSection', label: 'Executive Leadership (President, Leaders, Cashiers)' },
                  { key: 'showWingsSection', label: 'Class Wings & Wing Members Showcase' },
                  { key: 'showToursSection', label: 'Class Tour Photos Gallery' },
                  { key: 'showPublicNotices', label: 'Public Notice Board Section' },
                  { key: 'showPublicRoutine', label: 'Public Class Routine Section' },
                  { key: 'showPublicResultsLookup', label: 'Public Exam Result Lookup (No Student Login)' }
                ].map(item => {
                  const isChecked = Boolean(
                    siteConfig[item.key as keyof typeof siteConfig]
                  );
                  return (
                    <label
                      key={item.key}
                      className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-950 border border-slate-800 cursor-pointer hover:border-slate-700"
                    >
                      <span className="text-xs font-bold text-slate-200">{item.label}</span>
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={e =>
                          updateSiteConfig({ [item.key]: e.target.checked })
                        }
                        className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
                      />
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Footer & Contact Details */}
            <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-4">
              <h3 className="text-sm font-extrabold text-white">
                Public Footer & Contact Information
              </h3>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 mb-1">
                  Campus / Department Location
                </label>
                <input
                  type="text"
                  value={siteConfig.contactAddress}
                  onChange={e => updateSiteConfig({ contactAddress: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-1">
                    Contact Email
                  </label>
                  <input
                    type="text"
                    value={siteConfig.contactEmail}
                    onChange={e => updateSiteConfig({ contactEmail: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-1">
                    Office / Union Phone
                  </label>
                  <input
                    type="text"
                    value={siteConfig.contactPhone}
                    onChange={e => updateSiteConfig({ contactPhone: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 mb-1">
                  Footer Copyright Note
                </label>
                <input
                  type="text"
                  value={siteConfig.footerCopyright}
                  onChange={e => updateSiteConfig({ footerCopyright: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-between items-center">
                <span className="text-[11px] text-slate-500">
                  Want to restore default union template?
                </span>
                <button
                  type="button"
                  onClick={() => {
                    resetWebsiteConfig();
                  }}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-rose-600 text-slate-300 hover:text-white text-[11px] font-bold transition flex items-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw size={12} />
                  <span>Reset Template</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
