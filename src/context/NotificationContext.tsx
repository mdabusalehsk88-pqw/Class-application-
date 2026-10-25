import React, { createContext, useContext, useState, useEffect } from 'react';

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  time: string;
  type: 'info' | 'success' | 'warning' | 'urgent';
  read: boolean;
  actionUrl?: string;
}

interface NotificationContextType {
  notifications: AppNotification[];
  unreadCount: number;
  soundEnabled: boolean;
  toggleSound: () => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearAll: () => void;
  addNotification: (notification: Omit<AppNotification, 'id' | 'read' | 'time'>) => void;
  playChime: (type?: 'click' | 'success' | 'alert' | 'levelUp') => void;
}

const initialNotifications: AppNotification[] = [];

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    try {
      const saved = localStorage.getItem('smartclass_notifications');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // fallback
    }
    return initialNotifications;
  });

  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    return localStorage.getItem('smartclass_sound') !== 'false';
  });

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('smartclass_notifications', JSON.stringify(notifications));
    } catch {
      // ignore
    }
  }, [notifications]);

  // Real-time inter-tab and window synchronization
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'smartclass_notifications' && e.newValue) {
        try {
          const fresh = JSON.parse(e.newValue);
          if (Array.isArray(fresh)) {
            setNotifications(fresh);
          }
        } catch {
          // ignore
        }
      }
    };

    const handleCustomNotif = (e: Event) => {
      const customEvent = e as CustomEvent<AppNotification>;
      if (customEvent.detail) {
        setNotifications(prev => {
          if (prev.some(n => n.id === customEvent.detail.id)) return prev;
          return [customEvent.detail, ...prev];
        });
        playChime(customEvent.detail.type === 'urgent' ? 'alert' : 'success');
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('al_uswah_notification', handleCustomNotif);

    // BroadcastChannel if supported
    let channel: BroadcastChannel | null = null;
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        channel = new BroadcastChannel('smartclass_notifications_channel');
        channel.onmessage = (event) => {
          if (event.data?.type === 'NEW_NOTIFICATION' && event.data?.payload) {
            const notif = event.data.payload as AppNotification;
            setNotifications(prev => {
              if (prev.some(n => n.id === notif.id)) return prev;
              return [notif, ...prev];
            });
            playChime(notif.type === 'urgent' ? 'alert' : 'success');
          }
        };
      } catch {
        // ignore
      }
    }

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('al_uswah_notification', handleCustomNotif);
      channel?.close();
    };
  }, []);

  const toggleSound = () => {
    setSoundEnabled(prev => {
      const next = !prev;
      localStorage.setItem('smartclass_sound', String(next));
      return next;
    });
  };

  // Synthetic Web Audio API Sound Generator (Crystal crisp, zero 404s)
  const playChime = (type: 'click' | 'success' | 'alert' | 'levelUp' = 'click') => {
    if (!soundEnabled) return;
    try {
      const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      const now = ctx.currentTime;
      if (type === 'click') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.05);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
        osc.start(now);
        osc.stop(now + 0.05);
      } else if (type === 'success') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(523.25, now);
        osc.frequency.setValueAtTime(659.25, now + 0.08);
        osc.frequency.setValueAtTime(783.99, now + 0.16);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
        osc.start(now);
        osc.stop(now + 0.3);
      } else if (type === 'levelUp') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.setValueAtTime(554.37, now + 0.09);
        osc.frequency.setValueAtTime(659.25, now + 0.18);
        osc.frequency.setValueAtTime(880, now + 0.27);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
        osc.start(now);
        osc.stop(now + 0.45);
      } else if (type === 'alert') {
        osc.type = 'square';
        osc.frequency.setValueAtTime(600, now);
        osc.frequency.setValueAtTime(400, now + 0.1);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
        osc.start(now);
        osc.stop(now + 0.25);
      }
    } catch {
      // AudioContext policy
    }
  };

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    playChime('click');
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const addNotification = (item: Omit<AppNotification, 'id' | 'read' | 'time'>) => {
    const newNotif: AppNotification = {
      ...item,
      id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      read: false,
      time: 'Just now'
    };

    setNotifications(prev => {
      const updated = [newNotif, ...prev];
      try {
        localStorage.setItem('smartclass_notifications', JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });

    // Broadcast to other tabs & windows
    try {
      window.dispatchEvent(new CustomEvent('al_uswah_notification', { detail: newNotif }));
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        const bc = new BroadcastChannel('smartclass_notifications_channel');
        bc.postMessage({ type: 'NEW_NOTIFICATION', payload: newNotif });
        bc.close();
      }
    } catch {
      // ignore
    }

    playChime(item.type === 'urgent' ? 'alert' : 'success');
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        soundEnabled,
        toggleSound,
        markAsRead,
        markAllAsRead,
        clearAll,
        addNotification,
        playChime
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) throw new Error('useNotifications must be used within NotificationProvider');
  return context;
};
