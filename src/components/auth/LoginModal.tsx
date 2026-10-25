import React, { useState } from 'react';
import { UserRole } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import {
  X,
  ShieldCheck,
  ArrowRight,
  Lock,
  User,
  Eye,
  EyeOff,
  Sparkles
} from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultRole?: UserRole;
  onSuccess?: (role: UserRole) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const { login } = useAuth();
  const { playChime, addNotification } = useNotifications();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleLoginSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');

    setTimeout(() => {
      const u = username.trim().toLowerCase();
      const p = password.trim();
      if (
        (u === 'superadminabu@smartclass.pro' || u === 'admin' || u === 'superadmin') &&
        (p === 'superadminabuforsmartclass.pro' || p === 'admin')
      ) {
        login('SUPER_ADMIN');
        setIsLoading(false);
        onClose();
        if (onSuccess) onSuccess('SUPER_ADMIN');
      } else {
        setErrorMsg('Invalid login. Username: superadminabu@smartclass.pro | Password: superadminabuforsmartclass.pro');
        setIsLoading(false);
      }
    }, 350);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md p-6 sm:p-8 shadow-2xl relative animate-in fade-in zoom-in-95 space-y-6">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
        >
          <X size={18} />
        </button>

        {/* Modal Header */}
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 text-xs font-bold border border-rose-500/30">
            <ShieldCheck size={14} className="text-rose-400" />
            <span>SUPER ADMIN</span>
          </div>
          <h2 className="text-xl font-extrabold text-white">
            AL-USWAH SUPER ADMIN Sign In
          </h2>
          <p className="text-xs text-slate-400">
            Authenticate to access AL-USWAH attendance, funds, routine builder, and messaging.
          </p>
        </div>

        {/* Credentials Form */}
        <form onSubmit={handleLoginSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Username
            </label>
            <div className="relative">
              <User size={16} className="absolute left-3.5 top-3 text-slate-500" />
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="Enter administrator username"
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-rose-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Password
            </label>
            <div className="relative">
              <Lock size={16} className="absolute left-3.5 top-3 text-slate-500" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Enter administrator password"
                className="w-full pl-10 pr-10 py-2.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-rose-500"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3 text-slate-500 hover:text-slate-300"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
              {errorMsg}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded-2xl bg-rose-600 hover:bg-rose-500 transition text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-rose-600/30 cursor-pointer"
          >
            {isLoading ? (
              <span>Authenticating...</span>
            ) : (
              <>
                <ShieldCheck size={16} />
                <span>Sign In as Class IT Officer</span>
                <ArrowRight size={14} />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
