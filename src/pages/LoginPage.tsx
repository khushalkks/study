import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  GraduationCap, Mail, ArrowRight, Sparkles, BrainCircuit,
  Zap, CheckCircle2, Lock, Globe, Stars, User, Eye, EyeOff
} from 'lucide-react';
import { apiLogin, apiRegister, saveSession } from '../auth';

type Mode = 'login' | 'register';

export default function LoginPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>('login');

  // Form fields
  const [name, setName]           = useState('');
  const [email, setEmail]         = useState('');
  const [password, setPassword]   = useState('');
  const [showPass, setShowPass]   = useState(false);

  // UI state
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState('');
  const [success, setSuccess]     = useState('');

  const switchMode = (m: Mode) => {
    setMode(m);
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      let data;
      if (mode === 'login') {
        data = await apiLogin(email, password);
      } else {
        if (!name.trim()) throw new Error('Name is required');
        if (password.length < 6) throw new Error('Password must be at least 6 characters');
        data = await apiRegister(name.trim(), email, password);
      }
      saveSession(data.access_token, data.user);
      setSuccess(mode === 'login' ? 'Welcome back!' : 'Account created! Redirecting...');
      setTimeout(() => navigate('/home'), 800);
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-root" style={{
      minHeight: '100vh',
      background: '#020617',
      display: 'flex',
      fontFamily: "'Inter', sans-serif",
      color: '#fff',
      overflow: 'hidden'
    }}>

      {/* ── Left: Visual ───────────────────────────────────────── */}
      <div className="login-visual" style={{
        flex: 1.2, position: 'relative', display: 'flex',
        alignItems: 'center', justifyContent: 'center',
        padding: '60px', overflow: 'hidden',
        background: 'radial-gradient(circle at 20% 30%, rgba(79,70,229,0.15) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(139,92,246,0.1) 0%, transparent 50%)'
      }}>
        <div style={{ position: 'absolute', inset: 0, opacity: 0.2, backgroundImage: 'radial-gradient(#334155 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

        <div style={{ position: 'relative', zIndex: 10, maxWidth: '580px' }}>
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, background: 'rgba(79,70,229,0.1)', border: '1px solid rgba(79,70,229,0.2)', padding: '8px 16px', borderRadius: '100px', marginBottom: '24px', color: '#818cf8', fontWeight: 600, fontSize: '0.85rem' }}>
              <Stars size={16} /> Elite Learning Ecosystem
            </div>
            <h1 style={{ fontSize: '4rem', fontWeight: 800, lineHeight: 1.1, letterSpacing: '-0.04em', marginBottom: '24px' }}>
              Master any subject with{' '}
              <span style={{ background: 'linear-gradient(to right, #818cf8, #c084fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>CortexCraft.</span>
            </h1>
            <p style={{ fontSize: '1.15rem', color: '#94a3b8', lineHeight: 1.6, marginBottom: '48px', maxWidth: '460px' }}>
              Your personal AI-powered study companion that thinks, plans, and guides you to mastery.
            </p>
          </motion.div>

          {/* Feature cards */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            {[
              { icon: <BrainCircuit size={20} />, title: 'Socratic Guidance', color: '#6366f1' },
              { icon: <Zap size={20} />,          title: 'Instant Mastery',   color: '#f59e0b' },
              { icon: <Globe size={20} />,         title: 'Global Network',    color: '#10b981' },
              { icon: <CheckCircle2 size={20} />,  title: 'Verified Logic',    color: '#ec4899' },
            ].map((item, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + i * 0.1 }}
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', padding: '18px', borderRadius: '18px', display: 'flex', alignItems: 'center', gap: '14px', backdropFilter: 'blur(10px)' }}
              >
                <div style={{ color: item.color }}>{item.icon}</div>
                <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{item.title}</span>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Floating decorative card */}
        <motion.div
          animate={{ y: [0, -18, 0], rotate: [2, -2, 2] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          style={{ position: 'absolute', top: '12%', right: '4%', background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.1)', padding: '22px', borderRadius: '22px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)', width: '210px' }}
        >
          <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: 10 }}>AI Strategy Active</div>
          <div style={{ height: 4, background: '#1e293b', borderRadius: 2, marginBottom: 8 }}>
            <motion.div animate={{ width: ['0%', '75%', '45%', '90%'] }} transition={{ duration: 4, repeat: Infinity }}
              style={{ height: '100%', background: 'linear-gradient(to right, #6366f1, #c084fc)', borderRadius: 2 }} />
          </div>
          <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#818cf8' }}>Optimizing study plan...</div>
        </motion.div>
      </div>

      {/* ── Right: Form ────────────────────────────────────────── */}
      <div className="login-form-container" style={{
        flex: 0.85, background: '#0a0f1e', display: 'flex',
        alignItems: 'center', justifyContent: 'center',
        padding: '40px', borderLeft: '1px solid rgba(255,255,255,0.05)', position: 'relative'
      }}>
        <motion.div initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }}
          className="login-form-wrapper"
          style={{ width: '100%', maxWidth: '400px' }}
        >
          {/* Logo */}
          <div style={{ marginBottom: '32px', textAlign: 'center' }}>
            <div style={{ display: 'inline-flex', background: '#4F46E5', color: '#fff', width: 52, height: 52, borderRadius: '14px', alignItems: 'center', justifyContent: 'center', marginBottom: 20, boxShadow: '0 10px 25px rgba(79,70,229,0.35)' }}>
              <GraduationCap size={26} />
            </div>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: 6 }}>
              {mode === 'login' ? 'Welcome back' : 'Create account'}
            </h2>
            <p style={{ color: '#475569', fontSize: '0.9rem' }}>
              {mode === 'login'
                ? 'Sign in to your CortexCraft workspace'
                : 'Join thousands of learners today'}
            </p>
          </div>

          {/* Mode toggle tabs */}
          <div style={{ display: 'flex', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', padding: '4px', marginBottom: '28px', border: '1px solid rgba(255,255,255,0.07)' }}>
            {(['login', 'register'] as Mode[]).map(m => (
              <button key={m} onClick={() => switchMode(m)} style={{
                flex: 1, padding: '9px', border: 'none', borderRadius: '9px', cursor: 'pointer',
                background: mode === m ? '#4F46E5' : 'transparent',
                color: mode === m ? '#fff' : '#64748b',
                fontWeight: 700, fontSize: '0.88rem', fontFamily: 'inherit', transition: 'all 0.2s'
              }}>
                {m === 'login' ? 'Sign In' : 'Sign Up'}
              </button>
            ))}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '16px' }}>

            <AnimatePresence mode="wait">
              {mode === 'register' && (
                <motion.div key="name-field"
                  initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.2 }}
                >
                  <FieldLabel>Full Name</FieldLabel>
                  <InputWrapper icon={<User size={16} />}>
                    <input
                      type="text" placeholder="Your full name"
                      value={name} onChange={e => setName(e.target.value)}
                      required style={inputStyle}
                    />
                  </InputWrapper>
                </motion.div>
              )}
            </AnimatePresence>

            <div>
              <FieldLabel>Email Address</FieldLabel>
              <InputWrapper icon={<Mail size={16} />}>
                <input
                  type="email" placeholder="name@example.com"
                  value={email} onChange={e => setEmail(e.target.value)}
                  required style={inputStyle}
                />
              </InputWrapper>
            </div>

            <div>
              <FieldLabel>Password</FieldLabel>
              <InputWrapper icon={<Lock size={16} />} right={
                <button type="button" onClick={() => setShowPass(!showPass)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#475569', padding: 0, display: 'flex' }}>
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              }>
                <input
                  type={showPass ? 'text' : 'password'}
                  placeholder={mode === 'register' ? 'Min. 6 characters' : '••••••••'}
                  value={password} onChange={e => setPassword(e.target.value)}
                  required style={inputStyle}
                />
              </InputWrapper>
            </div>

            {/* Error / Success */}
            <AnimatePresence>
              {error && (
                <motion.div key="error" initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  style={{ padding: '12px 16px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '10px', color: '#f87171', fontSize: '0.85rem', fontWeight: 600 }}>
                  ⚠️ {error}
                </motion.div>
              )}
              {success && (
                <motion.div key="success" initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  style={{ padding: '12px 16px', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: '10px', color: '#34d399', fontSize: '0.85rem', fontWeight: 600 }}>
                  ✓ {success}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit button */}
            <button type="submit" disabled={loading} style={{
              background: loading ? '#3730a3' : '#4F46E5',
              color: '#fff', border: 'none', padding: '15px',
              borderRadius: '12px', fontSize: '1rem', fontWeight: 700,
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
              marginTop: '4px', transition: 'all 0.2s',
              boxShadow: '0 8px 20px rgba(79,70,229,0.3)',
            }}
              onMouseEnter={e => !loading && (e.currentTarget.style.background = '#4338ca')}
              onMouseLeave={e => !loading && (e.currentTarget.style.background = '#4F46E5')}
            >
              {loading ? (
                <div style={{ width: 20, height: 20, border: '3px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
              ) : (
                <>{mode === 'login' ? 'Sign In' : 'Create Account'} <ArrowRight size={18} /></>
              )}
            </button>

            <p style={{ textAlign: 'center', color: '#475569', fontSize: '0.85rem', marginTop: 4 }}>
              {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
              <span
                onClick={() => switchMode(mode === 'login' ? 'register' : 'login')}
                style={{ color: '#818cf8', fontWeight: 700, cursor: 'pointer' }}
              >
                {mode === 'login' ? 'Sign up free' : 'Sign in'}
              </span>
            </p>
          </form>
        </motion.div>

        {/* Trust badges */}
        <div style={{ position: 'absolute', bottom: '28px', left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: '24px' }}>
          {[
            { icon: <Sparkles size={13} />, text: 'AI-Powered' },
            { icon: <CheckCircle2 size={13} />, text: 'Secure & Private' },
          ].map((b, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#334155', fontSize: '0.72rem', fontWeight: 600 }}>
              {b.icon} {b.text}
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        input { outline: none; }
        input:focus { border-color: #4f46e5 !important; box-shadow: 0 0 0 3px rgba(79,70,229,0.15); }
        @media (max-width: 900px) {
          .login-root { flex-direction: column !important; overflow-y: auto !important; }
          .login-visual { display: none !important; }
          .login-form-container { flex: 1 !important; padding: 60px 20px !important; border-left: none !important; }
          .login-form-wrapper { max-width: 100% !important; }
        }
      `}</style>
    </div>
  );
}

// ── Small helpers ──────────────────────────────────────────────────────────────
function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#94a3b8', marginBottom: '7px', marginLeft: '2px' }}>
      {children}
    </label>
  );
}

function InputWrapper({ icon, right, children }: { icon: React.ReactNode; right?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div style={{ position: 'relative' }}>
      <span style={{ position: 'absolute', left: 15, top: '50%', transform: 'translateY(-50%)', color: '#475569', pointerEvents: 'none' }}>
        {icon}
      </span>
      {children}
      {right && (
        <span style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)' }}>
          {right}
        </span>
      )}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  background: 'rgba(255,255,255,0.03)',
  border: '1px solid rgba(255,255,255,0.1)',
  padding: '13px 14px 13px 42px',
  borderRadius: '11px',
  color: '#fff',
  fontSize: '0.95rem',
  transition: 'all 0.2s',
  boxSizing: 'border-box',
  fontFamily: 'inherit',
};
