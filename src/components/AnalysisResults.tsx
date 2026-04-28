import React from 'react';
import { CheckCircle2, AlertCircle } from 'lucide-react';

interface AnalysisResultsProps {
  results: any;
}

export const AnalysisResults: React.FC<AnalysisResultsProps> = ({ results }) => {
  return (
    <div style={{
      background: '#161b22',
      border: '1px solid #21262d',
      borderRadius: '12px',
      padding: '24px',
      marginTop: '24px'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
        <CheckCircle2 color="#3fb950" size={24} />
        <h3 style={{ color: '#e6edf3', margin: 0 }}>Analysis Results</h3>
      </div>
      <div style={{ color: '#c9d1d9', fontSize: '14px', lineHeight: '1.6' }}>
        {results ? (
          <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
            {JSON.stringify(results, null, 2)}
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
