import React from 'react';
import { CheckCircle2, AlertCircle } from 'lucide-react';

interface AnalysisResultsProps {
  data: any;
  onReset: () => void;
}

export const AnalysisResults: React.FC<AnalysisResultsProps> = ({ data, onReset }) => {
  return (
    <div style={{
      background: '#161b22',
      border: '1px solid #21262d',
      borderRadius: '12px',
      padding: '24px',
      marginTop: '24px',
      position: 'relative'
    }}>
      <button 
        onClick={onReset}
        style={{ position: 'absolute', top: 16, right: 16, background: 'transparent', border: 'none', color: '#8b949e', cursor: 'pointer', fontSize: '12px' }}
      >
        Reset
      </button>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
        <CheckCircle2 color="#3fb950" size={24} />
        <h3 style={{ color: '#e6edf3', margin: 0 }}>Analysis Results</h3>
      </div>
      <div style={{ color: '#c9d1d9', fontSize: '14px', lineHeight: '1.6' }}>
        {data ? (
          <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
            {JSON.stringify(data, null, 2)}
          </pre>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#8b949e' }}>
            <AlertCircle size={16} />
            <span>No analysis results available yet.</span>
          </div>
        )}
      </div>
    </div>
  );
};
