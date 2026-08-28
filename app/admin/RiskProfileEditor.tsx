import React, { useState, useEffect } from 'react';
import { DEFAULT_QUESTIONS } from '../components/dashboard/RiskProfile';

export default function RiskProfileEditor({ settings, setSettings, isSaving, handleSaveSettings }: any) {
  const [questions, setQuestions] = useState<any[]>([]);

  useEffect(() => {
    if (settings.risk_profile_questions) {
      try {
        const parsed = JSON.parse(settings.risk_profile_questions);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setQuestions(parsed);
          return;
        }
      } catch (e) {
        console.error("Failed to parse risk_profile_questions", e);
      }
    }
    
    // Fallback default questions if empty or invalid
    setQuestions(DEFAULT_QUESTIONS);
  }, [settings.risk_profile_questions]);

  // Sync to parent settings
  const updateParent = (newQuestions: any[]) => {
    setQuestions(newQuestions);
    setSettings({ ...settings, risk_profile_questions: JSON.stringify(newQuestions) });
  };

  const addQuestion = () => {
    const newId = questions.length > 0 ? Math.max(...questions.map(q => q.id)) + 1 : 1;
    updateParent([...questions, { id: newId, question: 'Pertanyaan baru...', options: [{ label: 'Opsi 1', score: 1 }] }]);
  };

  const updateQuestion = (index: number, field: string, value: any) => {
    const updated = [...questions];
    updated[index][field] = value;
    updateParent(updated);
  };

  const addOption = (qIndex: number) => {
    const updated = [...questions];
    updated[qIndex].options.push({ label: 'Opsi baru', score: 1 });
    updateParent(updated);
  };

  const updateOption = (qIndex: number, oIndex: number, field: string, value: any) => {
    const updated = [...questions];
    updated[qIndex].options[oIndex][field] = field === 'score' ? Number(value) : value;
    updateParent(updated);
  };

  const removeOption = (qIndex: number, oIndex: number) => {
    const updated = [...questions];
    updated[qIndex].options.splice(oIndex, 1);
    updateParent(updated);
  };

  const removeQuestion = (index: number) => {
    if (confirm("Yakin ingin menghapus pertanyaan ini?")) {
      const updated = [...questions];
      updated.splice(index, 1);
      updateParent(updated);
    }
  };

  const handleResetToDefault = () => {
    if (confirm("Yakin ingin mereset kuesioner ke bawaan (18 pertanyaan asli)? Data saat ini akan hilang!")) {
      updateParent([]);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%', maxWidth: '900px' }}>
      
      <div className="glass-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px' }}>
        <div>
          <h3 style={{ marginBottom: '8px', color: 'var(--primary)' }}>Visual Form Builder: Profil Risiko</h3>
          <p style={{ color: 'var(--text-muted)', margin: 0 }}>Ubah pertanyaan, opsi, dan bobot skor untuk kuesioner profil risiko klien.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={handleResetToDefault} className="btn btn-outline" style={{ borderColor: 'rgba(239, 68, 68, 0.5)', color: '#ef4444' }}>
            Reset ke Bawaan
          </button>
          <button onClick={handleSaveSettings} disabled={isSaving} className="btn btn-primary">
            {isSaving ? 'Menyimpan...' : '💾 Simpan Perubahan'}
          </button>
        </div>
      </div>

      {questions.map((q, qIndex) => (
        <div key={q.id} className="glass-panel animate-fade-in" style={{ padding: '24px', position: 'relative' }}>
          <button 
            onClick={() => removeQuestion(qIndex)}
            style={{ position: 'absolute', top: '16px', right: '16px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: 'none', padding: '8px', borderRadius: '8px', cursor: 'pointer' }}
            title="Hapus Pertanyaan"
          >
            🗑️
          </button>
          
          <div style={{ marginBottom: '16px', width: '90%' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)', fontWeight: 'bold' }}>Pertanyaan {qIndex + 1}</label>
            <input 
              type="text" 
              value={q.question} 
              onChange={e => updateQuestion(qIndex, 'question', e.target.value)} 
              className="glass-panel" style={{ width: '100%', padding: '12px', color: 'var(--text-main)', outline: 'none', fontSize: '1.1rem' }} 
            />
          </div>

          <div style={{ marginLeft: '16px', paddingLeft: '16px', borderLeft: '2px solid rgba(255,255,255,0.1)' }}>
            <label style={{ display: 'block', marginBottom: '12px', color: 'var(--text-muted)' }}>Opsi Jawaban & Skor</label>
            {q.options.map((opt: any, oIndex: number) => (
              <div key={oIndex} style={{ display: 'flex', gap: '12px', marginBottom: '12px', alignItems: 'center' }}>
                <input 
                  type="text" 
                  value={opt.label} 
                  onChange={e => updateOption(qIndex, oIndex, 'label', e.target.value)} 
                  className="glass-panel" style={{ flex: 1, padding: '10px', color: 'var(--text-main)', outline: 'none' }} 
                  placeholder="Teks opsi..."
                />
                <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', padding: '4px' }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', padding: '0 8px' }}>Skor:</span>
                  <input 
                    type="number" 
                    value={opt.score} 
                    onChange={e => updateOption(qIndex, oIndex, 'score', e.target.value)} 
                    className="glass-panel" style={{ width: '60px', padding: '6px', textAlign: 'center', color: 'var(--accent)', fontWeight: 'bold', outline: 'none', border: 'none' }} 
                  />
                </div>
                <button 
                  onClick={() => removeOption(qIndex, oIndex)}
                  style={{ background: 'transparent', color: '#ef4444', border: 'none', fontSize: '1.2rem', cursor: 'pointer', padding: '0 8px' }}
                  title="Hapus Opsi"
                >
                  ✕
                </button>
              </div>
            ))}
            
            <button 
              onClick={() => addOption(qIndex)}
              style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-main)', border: '1px dashed var(--border-color)', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', marginTop: '8px', fontSize: '0.9rem' }}
            >
              + Tambah Opsi
            </button>
          </div>
        </div>
      ))}

      <button 
        onClick={addQuestion}
        style={{ width: '100%', padding: '24px', background: 'rgba(16, 185, 129, 0.05)', color: '#10b981', border: '2px dashed rgba(16, 185, 129, 0.3)', borderRadius: '12px', cursor: 'pointer', fontSize: '1.1rem', fontWeight: 'bold', transition: '0.2s' }}
      >
        + Tambah Pertanyaan Baru
      </button>
      
    </div>
  );
}
