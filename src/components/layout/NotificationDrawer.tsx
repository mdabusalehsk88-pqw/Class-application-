import React from 'react';
import { useNotifications } from '../../context/NotificationContext';
import { Bell, X, CheckCheck, Trash2, AlertCircle, CheckCircle2, Info } from 'lucide-react';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({ isOpen, onClose }) => {
  const { notifications, markAsRead, markAllAsRead, clearAll, unreadCount } = useNotifications();

  if (!isOpen) return null;

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'urgent':
        return <AlertCircle size={16} className="text-rose-400" />;
      case 'success':
        return <CheckCircle2 size={16} className="text-emerald-400" />;
      case 'warning':
        return <AlertCircle size={16} className="text-amber-400" />;
      default:
        return <Info size={16} className="text-indigo-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex justify-end">
      <div
        className="w-full max-w-md bg-slate-900 border-l border-slate-800 h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-200"
      >
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-500/20 text-indigo-400 rounded-xl">
              <Bell size={18} />
            </div>
            <div>
              <div className="font-bold text-sm text-white">Notifications Center</div>
              <div className="text-[11px] text-slate-400">
                {unreadCount > 0 ? `${unreadCount} unread alert${unreadCount > 1 ? 's' : ''}` : 'All alerts caught up'}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Action bar */}
        <div className="px-4 py-2 bg-slate-900/80 border-b border-slate-800 flex items-center justify-between text-xs">
          <button
            onClick={markAllAsRead}
            disabled={unreadCount === 0}
            className="text-indigo-400 hover:text-indigo-300 disabled:opacity-40 flex items-center gap-1 font-medium transition"
          >
            <CheckCheck size={14} />
            <span>Mark all read</span>
          </button>
          <button
            onClick={clearAll}
            disabled={notifications.length === 0}
            className="text-slate-500 hover:text-rose-400 disabled:opacity-40 flex items-center gap-1 font-medium transition"
          >
            <Trash2 size={13} />
            <span>Clear all</span>
          </button>
        </div>

        {/* Notification list */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
          {notifications.length === 0 ? (
            <div className="p-12 text-center text-slate-500 space-y-2">
              <Bell size={36} className="mx-auto opacity-30 text-indigo-400" />
              <div className="text-sm font-semibold">No New Notifications</div>
              <div className="text-xs">You are completely up-to-date with your academic activities!</div>
            </div>
          ) : (
            notifications.map(item => (
              <div
                key={item.id}
                onClick={() => markAsRead(item.id)}
                className={`p-3.5 rounded-2xl border transition cursor-pointer ${
                  item.read
                    ? 'bg-slate-900/60 border-slate-800/80 opacity-70 hover:opacity-100'
                    : 'bg-slate-850 border-indigo-500/30 shadow-md shadow-indigo-950/30'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">{getTypeIcon(item.type)}</div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div className="font-semibold text-xs text-white">{item.title}</div>
                      {!item.read && (
                        <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
                      )}
                    </div>
                    <div className="text-xs text-slate-300 mt-1 leading-relaxed">
                      {item.message}
                    </div>
                    <div className="text-[10px] text-slate-500 mt-2">{item.time}</div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
