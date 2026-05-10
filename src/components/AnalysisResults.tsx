import React from 'react';
import { 
  CheckCircle2, 
  AlertCircle, 
  Target, 
  Award, 
  TrendingUp, 
  TrendingDown, 
  Lightbulb, 
  RotateCcw,
  ShieldCheck,
  ShieldAlert,
  Search,
  FileText
} from 'lucide-react';
import { motion } from 'framer-motion';

interface AnalysisResultsProps {
  data: {
    score: number;
    strengths: string[];
    weaknesses: string[];
    suggestions: string[];
    matched_skills: string[];
    missing_skills: string[];
    fileName: string;
  };
  onReset: () => void;
}

export const AnalysisResults: React.FC<AnalysisResultsProps> = ({ data, onReset }) => {
  if (!data) return null;

  // Color mapping based on score
  const getScoreColor = (score: number) => {
    if (score >= 80) return '#10b981'; // Green
    if (score >= 60) return '#f59e0b'; // Amber
    return '#ef4444'; // Red
  };

  const scoreColor = getScoreColor(data.score);

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '32px' }}>
      
      {/* ─── Score & Summary Header ─── */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-box"
        style={{ 
          borderRadius: '32px', 
          padding: '40px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          gap: '24px',
          background: 'rgba(255, 255, 255, 0.8)',
          border: '1px solid rgba(255, 255, 255, 0.5)',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <button 
          onClick={onReset}
          style={{ 
            position: 'absolute', top: 24, right: 24, 
            background: 'rgba(0,0,0,0.05)', border: 'none', 
            width: 36, height: 36, borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', color: '#64748b', transition: 'all 0.2s'
          }}
          title="Analyze another resume"
        >
          <RotateCcw size={18} />
        </button>

        <div style={{ position: 'relative', width: 140, height: 140 }}>
          <svg style={{ transform: 'rotate(-90deg)', width: '100%', height: '100%' }}>
            <circle
              cx="70" cy="70" r="60"
              stroke="#e2e8f0" strokeWidth="10" fill="transparent"
            />
            <motion.circle
              cx="70" cy="70" r="60"
              stroke={scoreColor} strokeWidth="10" fill="transparent"
              strokeDasharray={377}
              initial={{ strokeDashoffset: 377 }}
              animate={{ strokeDashoffset: 377 - (377 * data.score) / 100 }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              strokeLinecap="round"
            />
          </svg>
          <div style={{ 
            position: 'absolute', top: '50%', left: '50%', 
            transform: 'translate(-50%, -50%)', textAlign: 'center' 
          }}>
            <span style={{ fontSize: '2.5rem', fontWeight: 800, color: '#1e293b' }}>{data.score}</span>
            <span style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginTop: -4 }}>Score</span>
          </div>
        </div>

        <div>
          <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>
            {data.score >= 80 ? 'Excellent Match!' : data.score >= 60 ? 'Good Progress' : 'Needs Improvement'}
          </h3>
          <p style={{ color: '#64748b', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            <FileText size={16} /> {data.fileName}
          </p>
        </div>
      </motion.div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px' }}>
        
        {/* ─── Strengths ─── */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-box"
          style={{ borderRadius: '24px', padding: '32px', background: 'rgba(255, 255, 255, 0.7)' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
            <div style={{ background: '#ecfdf5', padding: 8, borderRadius: 10 }}>
              <TrendingUp size={20} color="#10b981" />
            </div>
            <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1e293b' }}>Top Strengths</h4>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {data.strengths.map((s, i) => (
              <div key={i} style={{ display: 'flex', gap: 12, fontSize: '0.95rem', color: '#475569', lineHeight: 1.5 }}>
                <ShieldCheck size={18} color="#10b981" style={{ flexShrink: 0, marginTop: 2 }} />
                <span>{s}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* ─── Weaknesses ─── */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-box"
          style={{ borderRadius: '24px', padding: '32px', background: 'rgba(255, 255, 255, 0.7)' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
            <div style={{ background: '#fef2f2', padding: 8, borderRadius: 10 }}>
              <TrendingDown size={20} color="#ef4444" />
            </div>
            <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1e293b' }}>Areas for Growth</h4>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {data.weaknesses.map((w, i) => (
              <div key={i} style={{ display: 'flex', gap: 12, fontSize: '0.95rem', color: '#475569', lineHeight: 1.5 }}>
                <ShieldAlert size={18} color="#ef4444" style={{ flexShrink: 0, marginTop: 2 }} />
                <span>{w}</span>
              </div>
            ))}
          </div>
        </motion.div>

      </div>

      {/* ─── Skills Analysis ─── */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="glass-box"
        style={{ borderRadius: '24px', padding: '32px', background: 'rgba(255, 255, 255, 0.7)' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
          <div style={{ background: '#eef2ff', padding: 8, borderRadius: 10 }}>
            <Target size={20} color="#4f46e5" />
          </div>
          <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1e293b' }}>Skills Intelligence</h4>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Matched Skills */}
          <div>
            <p style={{ fontSize: '0.85rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>Matched Skills</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {data.matched_skills.map((skill, i) => (
                <span 
                  key={i}
                  style={{ 
                    padding: '6px 14px', background: '#ecfdf5', 
                    color: '#047857', borderRadius: '100px', 
                    fontSize: '0.85rem', fontWeight: 600,
                    border: '1px solid #d1fae5'
                  }}
                >
                  {skill}
                </span>
              ))}
              {data.matched_skills.length === 0 && <span style={{ color: '#94a3b8', fontSize: '0.9rem', fontStyle: 'italic' }}>No specific skills identified.</span>}
            </div>
          </div>

          {/* Missing Skills */}
          <div>
            <p style={{ fontSize: '0.85rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>Missing Recommendations</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {data.missing_skills.map((skill, i) => (
                <span 
                  key={i}
                  style={{ 
                    padding: '6px 14px', background: '#f8fafc', 
                    color: '#64748b', borderRadius: '100px', 
                    fontSize: '0.85rem', fontWeight: 600,
                    border: '1px solid #e2e8f0'
                  }}
                >
                  + {skill}
                </span>
              ))}
              {data.missing_skills.length === 0 && <span style={{ color: '#94a3b8', fontSize: '0.9rem', fontStyle: 'italic' }}>Your skills match the target profile perfectly!</span>}
            </div>
          </div>
        </div>
      </motion.div>

      {/* ─── Suggestions ─── */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="glass-box"
        style={{ 
          borderRadius: '24px', 
          padding: '32px', 
          background: 'linear-gradient(135deg, rgba(79, 70, 229, 0.05) 0%, rgba(14, 165, 233, 0.05) 100%)',
          border: '1px solid rgba(99, 102, 241, 0.2)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <div style={{ background: '#fffbeb', padding: 8, borderRadius: 10 }}>
            <Lightbulb size={20} color="#f59e0b" />
          </div>
          <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1e293b' }}>AI Optimization Suggestions</h4>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {data.suggestions.map((s, i) => (
            <div key={i} style={{ 
              display: 'flex', gap: 14, padding: '16px', 
              background: 'rgba(255,255,255,0.5)', borderRadius: '16px',
              border: '1px solid rgba(255,255,255,0.3)'
            }}>
              <div style={{ 
                width: 24, height: 24, background: '#4f46e5', 
                borderRadius: '50%', color: 'white', display: 'flex', 
                alignItems: 'center', justifyContent: 'center', 
                fontSize: '11px', fontWeight: 800, flexShrink: 0 
              }}>
                {i + 1}
              </div>
              <p style={{ fontSize: '0.95rem', color: '#334155', lineHeight: 1.5, margin: 0 }}>{s}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* ─── Final CTA ─── */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        style={{ textAlign: 'center', padding: '20px 0' }}
      >
        <button 
          onClick={onReset}
          style={{ 
            padding: '14px 32px', borderRadius: '16px', border: 'none',
            background: 'white', color: '#4f46e5', fontWeight: 700,
            boxShadow: '0 10px 25px rgba(0,0,0,0.05)', cursor: 'pointer',
            transition: 'all 0.2s', display: 'inline-flex', alignItems: 'center', gap: 10
          }}
          onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
        >
          <RotateCcw size={18} /> Analyze Another Resume
        </button>
      </motion.div>

    </div>
  );
};
