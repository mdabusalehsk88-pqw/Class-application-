import React, { useState, useEffect } from 'react';
import { LanguageProvider } from './context/LanguageContext';
import { ThemeProvider } from './context/ThemeContext';
import { NotificationProvider } from './context/NotificationContext';
import { GamificationProvider } from './context/GamificationContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { InstitutionProvider } from './context/InstitutionContext';
import { ChatProvider } from './context/ChatContext';
import { AIProvider } from './context/AIContext';
import { WebsiteBuilderProvider } from './context/WebsiteBuilderContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar, ActiveTab } from './components/layout/Sidebar';
import { CommandPalette } from './components/layout/CommandPalette';
import { NotificationDrawer } from './components/layout/NotificationDrawer';
import { LoginModal } from './components/auth/LoginModal';
import { AdminLoginGateway } from './components/auth/AdminLoginGateway';
import { PublicUnionWebsite } from './pages/public/PublicUnionWebsite';
import { StudentPersonalPortal } from './components/student/StudentPersonalPortal';

// Admin / Super Admin (IT Officer) Pages & Components
import { AdminCommandCenter } from './pages/admin/AdminCommandCenter';
import { AdminUserManagement } from './pages/admin/AdminUserManagement';
import { SuperAdminAttendance } from './components/admin/SuperAdminAttendance';
import { SuperAdminFunds } from './components/admin/SuperAdminFunds';
import { SuperAdminRoutine } from './components/admin/SuperAdminRoutine';
import { SuperAdminNotices } from './components/admin/SuperAdminNotices';
import { SuperAdminFiles } from './components/admin/SuperAdminFiles';
import { SuperAdminMessaging } from './components/admin/SuperAdminMessaging';
import { SuperAdminMarksPortal } from './components/admin/SuperAdminMarksPortal';
import { SuperAdminWebsiteBuilder } from './components/admin/SuperAdminWebsiteBuilder';

const MainLayout: React.FC = () => {
  const { currentRole, switchRole, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  // Controls whether unauthenticated visitor is viewing the Admin Login page vs the default Public Website
  const [showAdminLoginPage, setShowAdminLoginPage] = useState(false);
  // Controls whether an authenticated Admin is previewing the live Public Website
  const [isPreviewingPublicSite, setIsPreviewingPublicSite] = useState(false);

  // Reset login gateway view once authenticated
  useEffect(() => {
    if (isAuthenticated) {
      setShowAdminLoginPage(false);
    }
  }, [isAuthenticated]);

  // Handle Command Palette keyboard shortcut (Ctrl + K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // 1. When unauthenticated:
  //    By default, open the Public AL-USWAH UNION Website (no student login, only Admin Login button).
  //    When Admin Login is clicked, show the secure AdminLoginGateway.
  if (!isAuthenticated) {
    if (showAdminLoginPage) {
      return (
        <AdminLoginGateway
          onBackToPublicWebsite={() => setShowAdminLoginPage(false)}
        />
      );
    }
    return (
      <PublicUnionWebsite
        onOpenAdminLogin={() => setShowAdminLoginPage(true)}
      />
    );
  }
 
   // When logged in as student, render dedicated Student Personal Portal (showing only their own data)
   if (currentRole === 'STUDENT') {
     return <StudentPersonalPortal />;
   }

   // 2. When authenticated as Admin and previewing the Live Public Website:
   if (isPreviewingPublicSite) {
    return (
      <PublicUnionWebsite
        onOpenAdminLogin={() => setShowAdminLoginPage(true)}
        onReturnToAdminDashboard={() => setIsPreviewingPublicSite(false)}
        onOpenWebsiteBuilder={() => {
          setIsPreviewingPublicSite(false);
          setActiveTab('website_builder');
        }}
      />
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <AdminCommandCenter
            onNavigate={setActiveTab}
            onPreviewPublicSite={() => setIsPreviewingPublicSite(true)}
          />
        );

      case 'website_builder':
        return (
          <SuperAdminWebsiteBuilder
            onPreviewPublicSite={() => setIsPreviewingPublicSite(true)}
          />
        );

      case 'marks':
        return <SuperAdminMarksPortal />;

      case 'chat':
        return <SuperAdminMessaging />;

      case 'attendance':
        return <SuperAdminAttendance />;

      case 'cr_fund':
        return <SuperAdminFunds />;

      case 'routine':
        return <SuperAdminRoutine />;

      case 'notices':
        return <SuperAdminNotices />;

      case 'materials':
        return <SuperAdminFiles />;

      case 'admin_users':
        return <AdminUserManagement />;

      case 'admin_analytics':
        return (
          <AdminCommandCenter
            onNavigate={setActiveTab}
            onPreviewPublicSite={() => setIsPreviewingPublicSite(true)}
          />
        );

      default:
        return (
          <AdminCommandCenter
            onNavigate={setActiveTab}
            onPreviewPublicSite={() => setIsPreviewingPublicSite(true)}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans selection:bg-rose-500 selection:text-white transition-colors duration-200">
      {/* Main Top Navbar */}
      <Navbar
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
        onOpenLoginModal={() => setIsLoginModalOpen(true)}
        onNavigateToMessaging={() => setActiveTab('chat')}
        onPreviewPublicSite={() => setIsPreviewingPublicSite(true)}
      />

      {/* Body Layout: Sidebar + Main Content Area */}
      <div className="flex-1 flex max-w-[1920px] w-full mx-auto">
        {/* Left Super Admin Sidebar */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          isOpen={isSidebarOpen}
          onCloseMobile={() => setIsSidebarOpen(false)}
          onPreviewPublicSite={() => setIsPreviewingPublicSite(true)}
        />

        {/* Super Admin Main Console Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 w-full overflow-x-hidden max-w-7xl">
          {renderContent()}
        </main>
      </div>

      {/* Command Palette (Ctrl + K) */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onSelectTab={setActiveTab}
      />

      {/* Slide-out Notification Center Drawer */}
      <NotificationDrawer
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
      />

      {/* Authentication Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        defaultRole="SUPER_ADMIN"
        onSuccess={() => {
          switchRole('SUPER_ADMIN');
          setActiveTab('overview');
        }}
      />
    </div>
  );
};

export default function App() {
  return (
    <NotificationProvider>
      <GamificationProvider>
        <AuthProvider>
          <LanguageProvider>
            <ThemeProvider>
              <InstitutionProvider>
                <WebsiteBuilderProvider>
                  <ChatProvider>
                    <AIProvider>
                      <MainLayout />
                    </AIProvider>
                  </ChatProvider>
                </WebsiteBuilderProvider>
              </InstitutionProvider>
            </ThemeProvider>
          </LanguageProvider>
        </AuthProvider>
      </GamificationProvider>
    </NotificationProvider>
  );
}
