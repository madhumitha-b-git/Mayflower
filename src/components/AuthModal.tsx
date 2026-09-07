import React, { useState } from 'react';
import { X, Mail, KeyRound, ArrowRight, CheckCircle2, User, LogIn, UserPlus, Eye, EyeOff, Lock } from 'lucide-react';
import { requestEmailOTP, verifyEmailOTPAndLogin, loginWithPassword, WelcomeEmailData } from '../data/userStorage';
import { UserProfile } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: UserProfile, welcomeEmail?: WelcomeEmailData) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onLoginSuccess }) => {
  const [authMode, setAuthMode] = useState<'register' | 'login'>('register');
  const [step, setStep] = useState<'input' | 'otp'>('input');

  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [simulatedOTP, setSimulatedOTP] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const resetForm = () => {
    setEmail(''); setName(''); setPassword(''); setOtpCode('');
    setSimulatedOTP(null); setStep('input'); setErrorMsg(null);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    if (!email.trim() || !password.trim()) {
      setErrorMsg('Please enter your email and password.');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      const res = loginWithPassword(email, password);
      setLoading(false);
      if (res.success && res.user) {
        onLoginSuccess(res.user);
        onClose();
        resetForm();
      } else {
        setErrorMsg(res.message || 'Login failed.');
      }
    }, 300);
  };

  const handleRequestOTP = (e: React.FormEvent) => {
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
    setTimeout(() => {
      const res = requestEmailOTP(email, name);
      setSimulatedOTP(res.otp);
      setStep('otp');
      setLoading(false);
    }, 400);
  };

  const handleVerifyOTP = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    if (!otpCode.trim()) {
      setErrorMsg('Please enter the OTP code.');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      const res = verifyEmailOTPAndLogin(email, otpCode, name, 'Customer', password);
      setLoading(false);
      if (res.success && res.user) {
        onLoginSuccess(res.user, res.welcomeEmail);
        onClose();
        resetForm();
      } else {
        setErrorMsg(res.message || 'OTP verification failed.');
      }
    }, 400);
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
            {authMode === 'register' ? (step === 'input' ? 'Create Account' : 'Verify OTP') : 'Sign In'}
          </h3>
          <p className="text-xs text-[#D1CDBC] mt-1">
            {authMode === 'register' ? 'Register with email, password & OTP verification.' : 'Login with your email and password.'}
          </p>
        </div>

        {/* Tabs */}
        {step === 'input' && (
          <div className="grid grid-cols-2 bg-[#E8E4DB]/50 p-1.5 border-b border-[#E8E4DB] text-xs font-bold">
            {(['register', 'login'] as const).map((mode) => (
              <button key={mode} type="button" onClick={() => { setAuthMode(mode); setErrorMsg(null); }}
                className={`py-2.5 rounded-2xl transition-all cursor-pointer flex items-center justify-center space-x-1.5 ${authMode === mode ? 'bg-white text-[#1A1A1A] shadow-xs' : 'text-[#5A5A40] hover:text-[#1A1A1A]'}`}>
                {mode === 'register' ? <UserPlus className="w-3.5 h-3.5" /> : <LogIn className="w-3.5 h-3.5" />}
                <span>{mode === 'register' ? 'Register' : 'Login'}</span>
              </button>
            ))}
          </div>
        )}

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
                  <input type="email" required placeholder="e.g., admin@gmail.com" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} />
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
              <div className="p-3 rounded-xl bg-[#FAF7F2] border border-[#E8E4DB] text-xs text-[#5A5A40]">
                <span className="font-bold text-[#1A1A1A] block mb-1">Staff Demo Credentials</span>
                <div className="grid grid-cols-2 gap-x-4 gap-y-0.5">
                  {[['Super Admin','superadmin@gmail.com','superadmin@1234'],['Owner','owner@gmail.com','owner@1234'],['Admin','admin@gmail.com','admin@1234'],['Manager','manager@gmail.com','manager@1234'],['Chef','chef@gmail.com','chef@1234'],['HR','hr@gmail.com','hr@1234'],['Accountant','accountant@gmail.com','accountant@1234']].map(([role, em, pw]) => (
                    <button key={role} type="button" onClick={() => { setEmail(em); setPassword(pw); }}
                      className="text-left text-[10px] text-[#2D4030] font-semibold hover:underline cursor-pointer truncate">
                      {role}
                    </button>
                  ))}
                </div>
              </div>
              <button type="submit" disabled={loading} className="w-full py-3.5 rounded-xl bg-[#1A1A1A] hover:bg-[#2D4030] text-white text-xs uppercase tracking-widest font-bold transition-all shadow-md cursor-pointer flex items-center justify-center space-x-2">
                <span>{loading ? 'Signing In...' : 'Sign In'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* REGISTER - Step 1 */}
          {authMode === 'register' && step === 'input' && (
            <form onSubmit={handleRequestOTP} className="space-y-4">
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
                <span>{loading ? 'Generating OTP...' : 'Generate OTP'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* REGISTER - Step 2: OTP */}
          {authMode === 'register' && step === 'otp' && (
            <form onSubmit={handleVerifyOTP} className="space-y-4">
              <div className="p-4 rounded-xl bg-[#FAF7F2] border border-[#E8E4DB] text-center space-y-1">
                <div className="text-xs font-bold text-[#2D4030] flex items-center justify-center space-x-1">
                  <KeyRound className="w-4 h-4" /><span>Your OTP Code</span>
                </div>
                <div className="font-mono text-3xl font-bold tracking-widest text-[#1E3932] py-1">{simulatedOTP}</div>
                <p className="text-xs text-[#5A5A40]">Enter this code below to complete registration</p>
              </div>
              <div>
                <label className={labelClass}>Enter OTP *</label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-[#7A7A7A] absolute left-3.5 top-3.5 pointer-events-none" />
                  <input type="text" maxLength={6} required placeholder="6-digit code" value={otpCode} onChange={(e) => setOtpCode(e.target.value)} className="w-full pl-10 pr-4 py-3 rounded-xl border border-[#E8E4DB] bg-white text-center font-mono text-xl font-bold tracking-widest text-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-[#2D4030]" />
                </div>
              </div>
              <div className="flex justify-between text-xs">
                <button type="button" onClick={() => setStep('input')} className="text-[#5A5A40] hover:text-[#1A1A1A] font-semibold underline cursor-pointer">Back</button>
                <button type="button" onClick={() => { const res = requestEmailOTP(email, name); setSimulatedOTP(res.otp); }} className="text-[#2D4030] font-semibold hover:underline cursor-pointer">Resend OTP</button>
              </div>
              <button type="submit" disabled={loading} className="w-full py-3.5 rounded-xl bg-[#2D4030] hover:bg-[#1F3022] text-white text-xs uppercase tracking-widest font-bold transition-all shadow-md cursor-pointer flex items-center justify-center space-x-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>{loading ? 'Verifying...' : 'Verify & Register'}</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
