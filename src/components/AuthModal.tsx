import React, { useState } from 'react';
import { X, Mail, ArrowRight, CheckCircle2, User, LogIn, UserPlus, Eye, EyeOff, Lock } from 'lucide-react';
import { WelcomeEmailData } from '../data/userStorage';
import { UserProfile } from '../types';
import { supabaseLogin, supabaseRegister } from '../lib/authService';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: UserProfile, welcomeEmail?: WelcomeEmailData) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onLoginSuccess }) => {
  const [authMode, setAuthMode] = useState<'register' | 'login'>('register');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const resetForm = () => {
    setEmail(''); setName(''); setPassword(''); setErrorMsg(null);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    if (!email.trim() || !password.trim()) {
      setErrorMsg('Please enter your email and password.');
      return;
    }
    setLoading(true);
    const res = await supabaseLogin(email.trim(), password);
    setLoading(false);
    if (res.success && res.user) {
      onLoginSuccess(res.user);
      onClose();
      resetForm();
    } else {
      setErrorMsg(res.message || 'Login failed.');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    if (!email.trim() || !email.includes('@')) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }
    if (!password.trim() || password.length < 6) {
      setErrorMsg('Password must be at least 6 characters.');
      return;
    }
    setLoading(true);
    const res = await supabaseRegister(email.trim(), password, name.trim());
    setLoading(false);
    if (res.success && res.user) {
      onLoginSuccess(res.user);
      onClose();
      resetForm();
    } else {
      setErrorMsg(res.message || 'Registration failed.');
    }
  };

  const inputClass = "w-full pl-10 pr-4 py-3 rounded-xl border border-[#E8E4DB] bg-white text-sm text-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-[#2D4030]";
  const labelClass = "block text-[11px] font-bold uppercase tracking-wider text-[#5A5A40] mb-1.5";

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div className="relative max-w-md w-full bg-[#FAF7F2] rounded-3xl overflow-hidden shadow-2xl border border-[#E8E4DB]" onClick={(e) => e.stopPropagation()}>

        <button onClick={onClose} className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-black/10 hover:bg-black/20 flex items-center justify-center cursor-pointer transition-colors">
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="bg-[#2D4030] text-white p-6 sm:p-8">
          <div className="flex items-center space-x-2 mb-3">
            <div className="w-8 h-8 rounded-xl bg-white/10 p-1 border border-white/20 shrink-0 overflow-hidden">
              <img src="/mayflower-logo.png" alt="The Mayflower" className="w-full h-full object-contain brightness-200" />
            </div>
            <span className="text-[10px] uppercase tracking-[0.25em] font-bold text-[#D1CDBC]">Sanctuary Portal</span>
          </div>
          <h3 className="font-serif text-2xl font-normal text-white">
            {authMode === 'register' ? 'Create Account' : 'Sign In'}
          </h3>
          <p className="text-xs text-[#D1CDBC] mt-1">
            {authMode === 'register' ? 'Register with your email and password.' : 'Login with your email and password.'}
          </p>
        </div>

        {/* Tabs */}
        <div className="grid grid-cols-2 bg-[#E8E4DB]/50 p-1.5 border-b border-[#E8E4DB] text-xs font-bold">
          {(['register', 'login'] as const).map((mode) => (
            <button key={mode} type="button" onClick={() => { setAuthMode(mode); setErrorMsg(null); }}
              className={`py-2.5 rounded-2xl transition-all cursor-pointer flex items-center justify-center space-x-1.5 ${authMode === mode ? 'bg-white text-[#1A1A1A] shadow-xs' : 'text-[#5A5A40] hover:text-[#1A1A1A]'}`}>
              {mode === 'register' ? <UserPlus className="w-3.5 h-3.5" /> : <LogIn className="w-3.5 h-3.5" />}
              <span>{mode === 'register' ? 'Register' : 'Login'}</span>
            </button>
          ))}
        </div>

        <div className="p-6 sm:p-8 space-y-4">
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* LOGIN */}
          {authMode === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className={labelClass}>Email Address *</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#7A7A7A] absolute left-3.5 top-3.5 pointer-events-none" />
                  <input type="email" required placeholder="e.g., admin@mayflower.com" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} />
                </div>
              </div>
              <div>
                <label className={labelClass}>Password *</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#7A7A7A] absolute left-3.5 top-3.5 pointer-events-none" />
                  <input type={showPassword ? 'text' : 'password'} required placeholder="Enter your password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full pl-10 pr-10 py-3 rounded-xl border border-[#E8E4DB] bg-white text-sm text-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-[#2D4030]" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-3.5 text-[#7A7A7A] cursor-pointer">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <button type="submit" disabled={loading} className="w-full py-3.5 rounded-xl bg-[#1A1A1A] hover:bg-[#2D4030] text-white text-xs uppercase tracking-widest font-bold transition-all shadow-md cursor-pointer flex items-center justify-center space-x-2">
                <span>{loading ? 'Signing In...' : 'Sign In'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* REGISTER */}
          {authMode === 'register' && (
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className={labelClass}>Email Address *</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#7A7A7A] absolute left-3.5 top-3.5 pointer-events-none" />
                  <input type="email" required placeholder="e.g., user@gmail.com" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} />
                </div>
              </div>
              <div>
                <label className={labelClass}>Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-[#7A7A7A] absolute left-3.5 top-3.5 pointer-events-none" />
                  <input type="text" placeholder="e.g., Priya" value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
                </div>
              </div>
              <div>
                <label className={labelClass}>Password *</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#7A7A7A] absolute left-3.5 top-3.5 pointer-events-none" />
                  <input type={showPassword ? 'text' : 'password'} required placeholder="Min. 6 characters" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full pl-10 pr-10 py-3 rounded-xl border border-[#E8E4DB] bg-white text-sm text-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-[#2D4030]" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-3.5 text-[#7A7A7A] cursor-pointer">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <button type="submit" disabled={loading} className="w-full py-3.5 rounded-xl bg-[#2D4030] hover:bg-[#1F3022] text-white text-xs uppercase tracking-widest font-bold transition-all shadow-md cursor-pointer flex items-center justify-center space-x-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>{loading ? 'Creating Account...' : 'Create Account'}</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
