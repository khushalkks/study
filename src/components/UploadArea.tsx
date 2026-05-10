import React, { useState } from 'react';
import { UploadCloud, FileText, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface UploadAreaProps {
  onUpload: (file: File) => void;
}

export const UploadArea: React.FC<UploadAreaProps> = ({ onUpload }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onUpload(file);
    }
  };

  return (
    <motion.div 
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        if (file) onUpload(file);
      }}
      style={{
        border: `2px dashed ${isDragging ? '#4f46e5' : '#cbd5e1'}`,
        borderRadius: '24px',
        padding: '60px 40px',
        textAlign: 'center',
        cursor: 'pointer',
        background: isDragging ? 'rgba(79, 70, 229, 0.05)' : 'rgba(255, 255, 255, 0.4)',
        transition: 'all 0.3s ease',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      <input
        type="file"
        onChange={handleFileChange}
        style={{ display: 'none' }}
        id="file-upload"
        accept=".pdf,.docx,.txt"
      />
      <label htmlFor="file-upload" style={{ cursor: 'pointer', display: 'block' }}>
        <div style={{ 
          width: 80, height: 80, 
          background: 'white', borderRadius: '24px', 
          boxShadow: '0 15px 30px rgba(99, 102, 241, 0.1)', 
          display: 'flex', alignItems: 'center', justifyContent: 'center', 
          margin: '0 auto 24px',
          transition: 'transform 0.3s ease'
        }}>
          <UploadCloud size={36} color="#4f46e5" />
        </div>
        
        <h3 style={{ color: '#0f172a', fontSize: '1.25rem', fontWeight: 800, marginBottom: '8px' }}>
          Drop your resume here
        </h3>
        <p style={{ color: '#64748b', fontSize: '0.95rem', maxWidth: '280px', margin: '0 auto' }}>
          AI will scan your PDF, DOCX, or TXT to analyze your potential.
        </p>
        
        <div style={{ 
          marginTop: '24px', display: 'inline-flex', alignItems: 'center', gap: 8, 
          padding: '6px 16px', background: 'rgba(79, 70, 229, 0.1)', 
          color: '#4f46e5', borderRadius: '100px', fontSize: '0.8rem', fontWeight: 700 
        }}>
          Max file size: 10MB
        </div>
      </label>
    </motion.div>
  );
};
