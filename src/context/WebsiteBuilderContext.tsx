import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useNotifications } from './NotificationContext';
import { doc, setDoc, onSnapshot, getDocFromServer } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';

export interface ExecutiveLeaderItem {
  id: string;
  roleTitle: string;
  name: string;
  rollOrId?: string;
  photo?: string;
  quoteOrBio?: string;
  phone?: string;
  email?: string;
}

export interface WingMemberItem {
  id: string;
  name: string;
  designation: string;
  rollOrId?: string;
  photo?: string;
}

export interface ClassWingItem {
  id: string;
  name: string;
  description: string;
  motto?: string;
  coverPhoto?: string;
  members: WingMemberItem[];
}

export interface TourPhotoItem {
  id: string;
  title: string;
  location: string;
  date: string;
  description?: string;
  imageUrl: string;
  album?: string;
}

export interface CustomSectionItem {
  id: string;
  heading: string;
  subheading?: string;
  content: string;
  imageUrl?: string;
  layout: 'split-right' | 'split-left' | 'centered';
  buttonText?: string;
  buttonLink?: string;
  visible: boolean;
}

export interface AboutHighlightStat {
  id: string;
  label: string;
  value: string;
}

export interface CustomPublicPage {
  id: string;
  title: string;
  slug: string;
  subtitle?: string;
  navbarLabel: string;
  showInNavbar: boolean;
  content: string;
  coverImageUrl?: string;
  createdAt: string;
  author?: string;
}

export type WebsiteThemeColor = 'gold_slate' | 'emerald_slate' | 'cyan_slate' | 'indigo_slate' | 'rose_slate';
export type WebsiteCardShape = 'rounded-3xl' | 'rounded-2xl' | 'rounded-xl' | 'rounded-none';

export interface PublicWebsiteConfig {
  // Brand & Navbar
  unionName: string;
  unionTagline: string;
  logoText: string;
  logoImageUrl: string;

  // Theme & Shape Template Customizer
  themePreset: WebsiteThemeColor;
  cardBorderRadius: WebsiteCardShape;

  // Custom User-Created Pages
  customPages: CustomPublicPage[];

  // Hero Section
  heroHeading: string;
  heroSubheading: string;
  heroKicker: string;
  heroBgImage: string;
  heroOverlayOpacity: number;
  heroPrimaryBtnText: string;
  heroSecondaryBtnText: string;

  // About Class Section
  showAboutSection: boolean;
  aboutHeading: string;
  aboutSubheading: string;
  aboutDescription: string;
  aboutMission: string;
  aboutVision: string;
  aboutImage: string;
  aboutStats: AboutHighlightStat[];

  // Executive Leadership (President, Class Leader, Second Leader, Treasurer, Cashier, Second Cashier)
  showLeadersSection: boolean;
  leadersHeading: string;
  leadersSubheading: string;
  leaders: ExecutiveLeaderItem[];

  // Class Wings & Wing Members
  showWingsSection: boolean;
  wingsHeading: string;
  wingsSubheading: string;
  wings: ClassWingItem[];

  // Class Tour Photos Gallery
  showToursSection: boolean;
  toursHeading: string;
  toursSubheading: string;
  tourPhotos: TourPhotoItem[];

  // Public Academic Modules Visibility
  showPublicNotices: boolean;
  showPublicRoutine: boolean;
  showPublicResultsLookup: boolean;

  // Custom No-Code Sections
  customSections: CustomSectionItem[];

  // Footer & Contact Info
  contactAddress: string;
  contactEmail: string;
  contactPhone: string;
  footerCopyright: string;
}

export const defaultWebsiteConfig: PublicWebsiteConfig = {
  unionName: 'AL-USWAH UNION',
  unionTagline: 'Official Class Union & Student Collective',
  logoText: 'AU',
  logoImageUrl: '',

  themePreset: 'gold_slate',
  cardBorderRadius: 'rounded-3xl',
  customPages: [
    {
      id: 'page_charter',
      title: 'Class Union Charter & Constitution',
      slug: 'charter',
      subtitle: 'Guiding principles, code of discipline, and student leadership responsibilities.',
      navbarLabel: 'Union Charter',
      showInNavbar: true,
      content: 'The AL-USWAH UNION was established under the collective resolution of Class 10-A to foster moral excellence, mutual brotherhood, and rigorous academic achievement.\n\nArticle 1: Academic Sincerity\nEvery member strives for genuine knowledge, cooperative study groups, and unyielding academic integrity in all examinations.\n\nArticle 2: Collective Welfare\nOur class wings and treasury function transparently to ensure no student is left behind in study materials, lab facilities, or educational opportunities.',
      coverImageUrl: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=1200&auto=format&fit=crop&q=80',
      createdAt: '2026-10-01',
      author: 'Executive Leadership'
    }
  ],

  heroHeading: 'AL-USWAH UNION',
  heroSubheading:
    'United in scholarship, leadership, and brotherhood. Welcome to our official class union portal showcasing our leadership, wings, academic excellence, and class memories.',
  heroKicker: 'Academic Session 2026 – 2027',
  heroBgImage:
    'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=1920&auto=format&fit=crop&q=85',
  heroOverlayOpacity: 65,
  heroPrimaryBtnText: 'Explore Class Wings',
  heroSecondaryBtnText: 'Meet Executive Leaders',

  showAboutSection: true,
  aboutHeading: 'About Our Class & Union',
  aboutSubheading: 'Cultivating intellectual excellence, moral character, and organized student leadership.',
  aboutDescription:
    'AL-USWAH UNION is the official student body representing our class. Through dedicated wings, student-led committees, educational tours, and academic initiatives, we work together to support every classmate and build lasting memories.',
  aboutMission:
    'To empower every student in our class through collaborative learning, cultural enrichment, and dedicated student welfare programs.',
  aboutVision:
    'To stand as an exemplary class union defined by unity, discipline, academic distinction, and service.',
  aboutImage:
    'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1200&auto=format&fit=crop&q=80',
  aboutStats: [
    { id: 'st_1', label: 'Executive Posts', value: '6' },
    { id: 'st_2', label: 'Active Class Wings', value: '0' },
    { id: 'st_3', label: 'Academic Session', value: '2026–27' }
  ],

  showLeadersSection: true,
  leadersHeading: 'Class Executive Leadership',
  leadersSubheading: 'Our elected class office bearers responsible for union administration, leadership, and treasury.',
  leaders: [
    {
      id: 'ldr_president',
      roleTitle: 'Class President',
      name: '',
      rollOrId: '',
      photo: '',
      quoteOrBio: 'Leading the union vision and presiding over all general body initiatives.'
    },
    {
      id: 'ldr_leader_1',
      roleTitle: 'Class Leader',
      name: '',
      rollOrId: '',
      photo: '',
      quoteOrBio: 'Coordinating daily class affairs, academic discipline, and student representation.'
    },
    {
      id: 'ldr_leader_2',
      roleTitle: 'Second Leader',
      name: '',
      rollOrId: '',
      photo: '',
      quoteOrBio: 'Assisting class coordination, schedule management, and student welfare.'
    },
    {
      id: 'ldr_treasurer',
      roleTitle: 'Treasurer',
      name: '',
      rollOrId: '',
      photo: '',
      quoteOrBio: 'Overseeing union financial planning, budgets, and audit transparency.'
    },
    {
      id: 'ldr_cashier_1',
      roleTitle: 'Cashier',
      name: '',
      rollOrId: '',
      photo: '',
      quoteOrBio: 'Managing class fund collections, dues records, and day-to-day disbursements.'
    },
    {
      id: 'ldr_cashier_2',
      roleTitle: 'Second Cashier',
      name: '',
      rollOrId: '',
      photo: '',
      quoteOrBio: 'Supporting fund collection, receipts, and event expense tracking.'
    }
  ],

  showWingsSection: true,
  wingsHeading: 'Class Wings & Committees',
  wingsSubheading: 'Specialized wings operated by our class members to lead academic, cultural, media, and welfare activities.',
  wings: [],

  showToursSection: true,
  toursHeading: 'Class Tour Photos & Memories',
  toursSubheading: 'Highlights from our educational study tours, excursions, and special class events.',
  tourPhotos: [],

  showPublicNotices: true,
  showPublicRoutine: false,
  showPublicResultsLookup: true,

  customSections: [],

  contactAddress: 'AL-USWAH Union Office, Main Academic Building',
  contactEmail: 'superadminabu@smartclass.pro',
  contactPhone: '',
  footerCopyright: '© 2026 AL-USWAH UNION. All rights reserved.'
};

interface WebsiteBuilderContextType {
  siteConfig: PublicWebsiteConfig;
  updateSiteConfig: (fields: Partial<PublicWebsiteConfig>) => void;
  // Executive Leaders
  updateLeader: (id: string, fields: Partial<ExecutiveLeaderItem>) => void;
  addLeader: (leader: Omit<ExecutiveLeaderItem, 'id'>) => void;
  deleteLeader: (id: string) => void;
  // Class Wings & Wing Members
  addWing: (wing: { name: string; description: string; motto?: string; coverPhoto?: string }) => void;
  updateWing: (wingId: string, fields: Partial<ClassWingItem>) => void;
  deleteWing: (wingId: string) => void;
  addWingMember: (wingId: string, member: Omit<WingMemberItem, 'id'>) => void;
  updateWingMember: (wingId: string, memberId: string, fields: Partial<WingMemberItem>) => void;
  deleteWingMember: (wingId: string, memberId: string) => void;
  // Tour Photos
  addTourPhoto: (photo: Omit<TourPhotoItem, 'id'>) => void;
  updateTourPhoto: (id: string, fields: Partial<TourPhotoItem>) => void;
  deleteTourPhoto: (id: string) => void;
  // About Stats
  addAboutStat: (label: string, value: string) => void;
  updateAboutStat: (id: string, label: string, value: string) => void;
  deleteAboutStat: (id: string) => void;
  // Custom Sections
  addCustomSection: (section: Omit<CustomSectionItem, 'id'>) => void;
  updateCustomSection: (id: string, fields: Partial<CustomSectionItem>) => void;
  deleteCustomSection: (id: string) => void;
  // Custom Pages
  addCustomPage: (page: Omit<CustomPublicPage, 'id' | 'createdAt'>) => void;
  updateCustomPage: (id: string, fields: Partial<CustomPublicPage>) => void;
  deleteCustomPage: (id: string) => void;
  // Theme & Shape
  setThemePreset: (theme: WebsiteThemeColor) => void;
  setCardBorderRadius: (shape: WebsiteCardShape) => void;
  // Reset
  resetWebsiteConfig: () => void;
  // Cloud Firestore Persistence
  cloudSyncStatus: 'synced' | 'syncing' | 'offline' | 'error';
  lastCloudSyncedAt: string | null;
  forceSyncToFirebase: () => Promise<void>;
  forcePullFromFirebase: () => Promise<void>;
}

const STORAGE_KEY = 'smartclass_public_website_config_v1';
const FIRESTORE_CONFIG_DOC = 'aluswah_main';

const WebsiteBuilderContext = createContext<WebsiteBuilderContextType | undefined>(undefined);

export const WebsiteBuilderProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { playChime, addNotification } = useNotifications();

  const [siteConfig, setSiteConfig] = useState<PublicWebsiteConfig>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return { ...defaultWebsiteConfig, ...parsed };
      }
    } catch {
      // ignore
    }
    return defaultWebsiteConfig;
  });

  const [cloudSyncStatus, setCloudSyncStatus] = useState<'synced' | 'syncing' | 'offline' | 'error'>('synced');
  const [lastCloudSyncedAt, setLastCloudSyncedAt] = useState<string | null>(null);
  const isInitialCloudLoadComplete = useRef(false);
  const isRemoteUpdateRef = useRef(false);

  // Sync to Cloud Firestore Helper
  const syncToFirestore = async (configToSave: PublicWebsiteConfig) => {
    setCloudSyncStatus('syncing');
    try {
      await setDoc(doc(db, 'website_config', FIRESTORE_CONFIG_DOC), {
        ...configToSave,
        updatedAt: new Date().toISOString()
      }, { merge: true });
      setCloudSyncStatus('synced');
      setLastCloudSyncedAt(new Date().toLocaleTimeString());
    } catch (err) {
      console.warn('Could not sync to Firestore (offline fallback active):', err);
      setCloudSyncStatus('offline');
    }
  };

  // 1. Real-time Cloud Firestore Listener (Cloud-First precedence)
  useEffect(() => {
    const fallbackTimer = setTimeout(() => {
      isInitialCloudLoadComplete.current = true;
    }, 3500);

    const docRef = doc(db, 'website_config', FIRESTORE_CONFIG_DOC);

    const unsubscribe = onSnapshot(
      docRef,
      (snapshot) => {
        isInitialCloudLoadComplete.current = true;
        if (snapshot.exists()) {
          const remoteData = snapshot.data() as Partial<PublicWebsiteConfig>;
          isRemoteUpdateRef.current = true;
          setSiteConfig(prev => {
            const merged = {
              ...defaultWebsiteConfig,
              ...prev,
              ...remoteData
            };
            try {
              localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
            } catch {
              // ignore
            }
            return merged;
          });
          setCloudSyncStatus('synced');
          setLastCloudSyncedAt(new Date().toLocaleTimeString());
        }
      },
      (error) => {
        console.warn('Firestore onSnapshot listener fallback to local:', error);
        setCloudSyncStatus('offline');
        isInitialCloudLoadComplete.current = true;
      }
    );

    return () => {
      clearTimeout(fallbackTimer);
      unsubscribe();
    };
  }, []);

  // 2. Local storage persistence & debounced sync to Firestore (guarded against overwriting cloud)
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(siteConfig));
      window.dispatchEvent(new CustomEvent('aluswah_website_updated'));
    } catch (e) {
      console.warn('Could not save website config to localStorage:', e);
    }

    if (!isInitialCloudLoadComplete.current) {
      return;
    }

    if (isRemoteUpdateRef.current) {
      isRemoteUpdateRef.current = false;
      return;
    }

    const timer = setTimeout(() => {
      syncToFirestore(siteConfig);
    }, 1000);

    return () => clearTimeout(timer);
  }, [siteConfig]);

  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        try {
          setSiteConfig({ ...defaultWebsiteConfig, ...JSON.parse(e.newValue) });
        } catch {
          // ignore
        }
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const forceSyncToFirebase = async () => {
    playChime('click');
    addNotification({
      title: 'Syncing Website Data',
      message: 'Saving all website pages, headers, and media to Cloud Firestore...',
      type: 'info'
    });
    await syncToFirestore(siteConfig);
    playChime('success');
    addNotification({
      title: 'Saved to Firebase Firestore',
      message: 'All website data is securely stored in your Firebase Firestore database!',
      type: 'success'
    });
  };

  const forcePullFromFirebase = async () => {
    setCloudSyncStatus('syncing');
    playChime('click');
    addNotification({
      title: 'Pulling Website Config',
      message: 'Fetching latest website structure from Firebase...',
      type: 'info'
    });
    try {
      const snap = await getDocFromServer(doc(db, 'website_config', FIRESTORE_CONFIG_DOC));
      if (snap.exists()) {
        const remoteData = snap.data() as Partial<PublicWebsiteConfig>;
        isRemoteUpdateRef.current = true;
        setSiteConfig(prev => {
          const merged = { ...defaultWebsiteConfig, ...prev, ...remoteData };
          try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
          } catch {
            // ignore
          }
          return merged;
        });
        isInitialCloudLoadComplete.current = true;
        setCloudSyncStatus('synced');
        setLastCloudSyncedAt(new Date().toLocaleTimeString());
        playChime('success');
        addNotification({
          title: 'Website Config Loaded!',
          message: 'Website data has been refreshed from Firebase Firestore.',
          type: 'success'
        });
      } else {
        setCloudSyncStatus('synced');
      }
    } catch (err) {
      console.warn('Failed to pull website config from Firestore:', err);
      setCloudSyncStatus('error');
    }
  };

  const updateSiteConfig = (fields: Partial<PublicWebsiteConfig>) => {
    setSiteConfig(prev => ({ ...prev, ...fields }));
  };

  // Executive Leaders
  const updateLeader = (id: string, fields: Partial<ExecutiveLeaderItem>) => {
    setSiteConfig(prev => ({
      ...prev,
      leaders: prev.leaders.map(l => (l.id === id ? { ...l, ...fields } : l))
    }));
  };

  const addLeader = (leader: Omit<ExecutiveLeaderItem, 'id'>) => {
    const newItem: ExecutiveLeaderItem = {
      ...leader,
      id: `ldr_${Date.now()}`
    };
    setSiteConfig(prev => ({
      ...prev,
      leaders: [...prev.leaders, newItem]
    }));
    playChime('success');
    addNotification({
      title: 'Leader Position Added',
      message: `${leader.roleTitle} has been added to the public leadership section.`,
      type: 'success'
    });
  };

  const deleteLeader = (id: string) => {
    setSiteConfig(prev => ({
      ...prev,
      leaders: prev.leaders.filter(l => l.id !== id)
    }));
    playChime('click');
  };

  // Class Wings & Wing Members
  const addWing = (wing: { name: string; description: string; motto?: string; coverPhoto?: string }) => {
    const newWing: ClassWingItem = {
      id: `wing_${Date.now()}`,
      name: wing.name,
      description: wing.description,
      motto: wing.motto || '',
      coverPhoto: wing.coverPhoto || '',
      members: []
    };
    setSiteConfig(prev => ({
      ...prev,
      wings: [...prev.wings, newWing]
    }));
    playChime('success');
    addNotification({
      title: 'Class Wing Created',
      message: `"${wing.name}" is now live on the public website.`,
      type: 'success'
    });
  };

  const updateWing = (wingId: string, fields: Partial<ClassWingItem>) => {
    setSiteConfig(prev => ({
      ...prev,
      wings: prev.wings.map(w => (w.id === wingId ? { ...w, ...fields } : w))
    }));
  };

  const deleteWing = (wingId: string) => {
    setSiteConfig(prev => ({
      ...prev,
      wings: prev.wings.filter(w => w.id !== wingId)
    }));
    playChime('click');
    addNotification({
      title: 'Class Wing Removed',
      message: 'The wing has been removed from the public website.',
      type: 'info'
    });
  };

  const addWingMember = (wingId: string, member: Omit<WingMemberItem, 'id'>) => {
    const newMember: WingMemberItem = {
      ...member,
      id: `wm_${Date.now()}`
    };
    setSiteConfig(prev => ({
      ...prev,
      wings: prev.wings.map(w =>
        w.id === wingId ? { ...w, members: [...w.members, newMember] } : w
      )
    }));
    playChime('success');
    addNotification({
      title: 'Wing Member Added',
      message: `${member.name} (${member.designation}) added to wing.`,
      type: 'success'
    });
  };

  const updateWingMember = (wingId: string, memberId: string, fields: Partial<WingMemberItem>) => {
    setSiteConfig(prev => ({
      ...prev,
      wings: prev.wings.map(w =>
        w.id === wingId
          ? {
              ...w,
              members: w.members.map(m => (m.id === memberId ? { ...m, ...fields } : m))
            }
          : w
      )
    }));
  };

  const deleteWingMember = (wingId: string, memberId: string) => {
    setSiteConfig(prev => ({
      ...prev,
      wings: prev.wings.map(w =>
        w.id === wingId
          ? { ...w, members: w.members.filter(m => m.id !== memberId) }
          : w
      )
    }));
    playChime('click');
  };

  // Tour Photos
  const addTourPhoto = (photo: Omit<TourPhotoItem, 'id'>) => {
    const newPhoto: TourPhotoItem = {
      ...photo,
      id: `tour_${Date.now()}`
    };
    setSiteConfig(prev => ({
      ...prev,
      tourPhotos: [newPhoto, ...prev.tourPhotos]
    }));
    playChime('success');
    addNotification({
      title: 'Tour Photo Published',
      message: `"${photo.title}" added to the public Class Tour Gallery.`,
      type: 'success'
    });
  };

  const updateTourPhoto = (id: string, fields: Partial<TourPhotoItem>) => {
    setSiteConfig(prev => ({
      ...prev,
      tourPhotos: prev.tourPhotos.map(p => (p.id === id ? { ...p, ...fields } : p))
    }));
  };

  const deleteTourPhoto = (id: string) => {
    setSiteConfig(prev => ({
      ...prev,
      tourPhotos: prev.tourPhotos.filter(p => p.id !== id)
    }));
    playChime('click');
  };

  // About Stats
  const addAboutStat = (label: string, value: string) => {
    setSiteConfig(prev => ({
      ...prev,
      aboutStats: [...prev.aboutStats, { id: `st_${Date.now()}`, label, value }]
    }));
  };

  const updateAboutStat = (id: string, label: string, value: string) => {
    setSiteConfig(prev => ({
      ...prev,
      aboutStats: prev.aboutStats.map(s => (s.id === id ? { ...s, label, value } : s))
    }));
  };

  const deleteAboutStat = (id: string) => {
    setSiteConfig(prev => ({
      ...prev,
      aboutStats: prev.aboutStats.filter(s => s.id !== id)
    }));
  };

  // Custom Sections
  const addCustomSection = (section: Omit<CustomSectionItem, 'id'>) => {
    const newSec: CustomSectionItem = {
      ...section,
      id: `csec_${Date.now()}`
    };
    setSiteConfig(prev => ({
      ...prev,
      customSections: [...prev.customSections, newSec]
    }));
    playChime('success');
    addNotification({
      title: 'Custom Website Section Added',
      message: `"${section.heading}" is now published on the public page.`,
      type: 'success'
    });
  };

  const updateCustomSection = (id: string, fields: Partial<CustomSectionItem>) => {
    setSiteConfig(prev => ({
      ...prev,
      customSections: prev.customSections.map(s => (s.id === id ? { ...s, ...fields } : s))
    }));
  };

  const deleteCustomSection = (id: string) => {
    setSiteConfig(prev => ({
      ...prev,
      customSections: prev.customSections.filter(s => s.id !== id)
    }));
    playChime('click');
  };

  // Custom Pages
  const addCustomPage = (page: Omit<CustomPublicPage, 'id' | 'createdAt'>) => {
    const newPage: CustomPublicPage = {
      ...page,
      id: `cpage_${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0]
    };
    setSiteConfig(prev => ({
      ...prev,
      customPages: [...(prev.customPages || []), newPage]
    }));
    playChime('success');
    addNotification({
      title: 'Custom Page Published',
      message: `"${page.title}" is now available on the public dashboard.`,
      type: 'success'
    });
  };

  const updateCustomPage = (id: string, fields: Partial<CustomPublicPage>) => {
    setSiteConfig(prev => ({
      ...prev,
      customPages: (prev.customPages || []).map(p => (p.id === id ? { ...p, ...fields } : p))
    }));
    playChime('click');
  };

  const deleteCustomPage = (id: string) => {
    setSiteConfig(prev => ({
      ...prev,
      customPages: (prev.customPages || []).filter(p => p.id !== id)
    }));
    playChime('alert');
    addNotification({
      title: 'Page Removed',
      message: 'Custom public page has been deleted.',
      type: 'warning'
    });
  };

  const setThemePreset = (theme: WebsiteThemeColor) => {
    setSiteConfig(prev => ({ ...prev, themePreset: theme }));
    playChime('click');
  };

  const setCardBorderRadius = (shape: WebsiteCardShape) => {
    setSiteConfig(prev => ({ ...prev, cardBorderRadius: shape }));
    playChime('click');
  };

  const resetWebsiteConfig = () => {
    setSiteConfig(defaultWebsiteConfig);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultWebsiteConfig));
    playChime('click');
    addNotification({
      title: 'Website Reset',
      message: 'Public website settings have been restored to clean defaults.',
      type: 'info'
    });
  };

  return (
    <WebsiteBuilderContext.Provider
      value={{
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
        forceSyncToFirebase,
        forcePullFromFirebase
      }}
    >
      {children}
    </WebsiteBuilderContext.Provider>
  );
};

export const useWebsiteBuilder = () => {
  const context = useContext(WebsiteBuilderContext);
  if (!context) {
    throw new Error('useWebsiteBuilder must be used within a WebsiteBuilderProvider');
  }
  return context;
};
