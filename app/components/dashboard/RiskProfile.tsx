'use client';

import { useState, useEffect } from 'react';

const DEFAULT_QUESTIONS = [
  {
    id: 1,
    question: "Tujuan investasi utama Anda adalah?",
    options: [
      { label: "Menjaga daya beli dan keamanan modal", score: 1 },
      { label: "Pertumbuhan modal dengan risiko rendah-sedang", score: 2 },
      { label: "Pertumbuhan modal yang signifikan", score: 3 },
      { label: "Pertumbuhan maksimal tanpa khawatir dengan volatilitas tinggi", score: 4 }
    ]
  },
  {
    id: 2,
    question: "Jangka waktu investasi Anda?",
    options: [
      { label: "Kurang dari 1 tahun", score: 1 },
      { label: "1-3 tahun", score: 2 },
      { label: "3-10 tahun", score: 3 },
      { label: "Lebih dari 10 tahun", score: 4 }
    ]
  },
  {
    id: 3,
    question: "Pengalaman Anda dalam berinvestasi?",
    options: [
      { label: "Belum pernah berinvestasi sama sekali", score: 1 },
      { label: "Pengalaman terbatas, hanya instrumen rendah risiko", score: 2 },
      { label: "Berpengalaman dengan berbagai instrumen", score: 3 },
      { label: "Sangat berpengalaman, sudah mengenal instrumen kompleks", score: 4 }
    ]
  },
  {
    id: 4,
    question: "Bagaimana reaksi Anda jika nilai investasi turun 20% dalam sebulan?",
    options: [
      { label: "Panik dan ingin segera menjual", score: 1 },
      { label: "Khawatir tapi masih bisa bertahan", score: 2 },
      { label: "Tenang dan menunggu pemulihan", score: 3 },
      { label: "Melihatnya sebagai peluang untuk membeli lebih banyak", score: 4 }
    ]
  },
  {
    id: 5,
    question: "Berapa persen dari total aset yang siap Anda alokasikan untuk investasi?",
    options: [
      { label: "Kurang dari 20%", score: 1 },
      { label: "20%-40%", score: 2 },
      { label: "40%-60%", score: 3 },
      { label: "Lebih dari 60%", score: 4 }
    ]
  },
  {
    id: 6,
    question: "Saat ini, dalam kondisi keuangan apa Anda berada?",
    options: [
      { label: "Masih memiliki hutang yang signifikan", score: 1 },
      { label: "Keuangan stabil, dengan dana darurat yang memadai", score: 2 },
      { label: "Surplus kas setelah kebutuhan operasional", score: 3 },
      { label: "Surplus kas yang konsisten dan terus bertambah", score: 4 }
    ]
  },
  {
    id: 7,
    question: "Kestabilan penghasilan Anda?",
    options: [
      { label: "Tidak stabil (misalnya: freelancer, bisnis baru)", score: 1 },
      { label: "Cukup stabil (gaji bulanan tetapi bisa berubah)", score: 2 },
      { label: "Stabil (gaji tetap dari perusahaan besar)", score: 3 },
      { label: "Sangat stabil dengan pertumbuhan terukur", score: 4 }
    ]
  },
  {
    id: 8,
    question: "Beban finansial Anda (cicilan, tanggungan keluarga)?",
    options: [
      { label: "Sangat berat (>50% penghasilan)", score: 1 },
      { label: "Sedang (30-50% penghasilan)", score: 2 },
      { label: "Ringan (10-30% penghasilan)", score: 3 },
      { label: "Minimal (<10% penghasilan)", score: 4 }
    ]
  },
  {
    id: 9,
    question: "Pengetahuan Anda tentang produk investasi (saham, obligasi, reksadana)?",
    options: [
      { label: "Sangat terbatas", score: 1 },
      { label: "Dasar (memahami konsep umum)", score: 2 },
      { label: "Baik (memahami risiko dan return setiap instrumen)", score: 3 },
      { label: "Sangat baik (bisa menganalisis dan menilai investasi)", score: 4 }
    ]
  },
  {
    id: 10,
    question: "Jika investasi Anda mengalami kerugian 30%, apakah Anda bisa tetap mempertahankannya?",
    options: [
      { label: "Tidak, saya pasti akan menjual", score: 1 },
      { label: "Sulit, tapi mungkin bisa jika tidak mendesak", score: 2 },
      { label: "Bisa, selama belum sampai waktu pencairan", score: 3 },
      { label: "Ya, saya yakin investasi akan kembali naik", score: 4 }
    ]
  },
  {
    id: 11,
    question: "Preferensi Anda terhadap volatilitas (fluktuasi nilai)?",
    options: [
      { label: "Tidak bisa mentolerir sama sekali", score: 1 },
      { label: "Bisa mentolerir fluktuasi kecil", score: 2 },
      { label: "Bisa mentolerir fluktuasi sedang", score: 3 },
      { label: "Nyaman dengan volatilitas tinggi", score: 4 }
    ]
  },
  {
    id: 12,
    question: "Apakah Anda memiliki dana darurat yang mencukup (3-6 bulan pengeluaran)?",
    options: [
      { label: "Tidak sama sekali", score: 1 },
      { label: "Ada, tapi kurang dari 3 bulan", score: 2 },
      { label: "Ada 3-6 bulan", score: 3 },
      { label: "Ada lebih dari 6 bulan", score: 4 }
    ]
  },
  {
    id: 13,
    question: "Seberapa sering Anda ingin memantau investasi Anda?",
    options: [
      { label: "Setiap hari", score: 4 },
      { label: "Mingguan", score: 3 },
      { label: "Bulanan", score: 2 },
      { label: "Tahunan atau tidak peduli", score: 1 }
    ]
  },
  {
    id: 14,
    question: "Tujuan utama investasi Anda dalam konteks jangka panjang?",
    options: [
      { label: "Tabungan hari tua/pensiun", score: 2 },
      { label: "Dana pendidikan anak", score: 2 },
      { label: "Membangun kekayaan dan warisan", score: 3 },
      { label: "Mengembangkan bisnis atau modal usaha", score: 4 }
    ]
  },
  {
    id: 15,
    question: "Bagaimana Anda menghadapi keputusan keuangan yang berisiko?",
    options: [
      { label: "Menghindari semaksimal mungkin", score: 1 },
      { label: "Hati-hati dan meminta konsultasi", score: 2 },
      { label: "Pertimbang matang-matang lalu ambil keputusan", score: 3 },
      { label: "Berani mengambil risiko yang terukur", score: 4 }
    ]
  },
  {
    id: 16,
    question: "Portofolio investasi ideal Anda adalah?",
    options: [
      { label: "100% instrumen aman (deposito, obligasi pemerintah)", score: 1 },
      { label: "70% aman, 30% pertumbuhan", score: 2 },
      { label: "50% aman, 50% pertumbuhan", score: 3 },
      { label: "30% aman, 70% pertumbuhan", score: 4 }
    ]
  },
  {
    id: 17,
    question: "Apakah Anda memiliki asuransi kesehatan dan jiwa yang memadai?",
    options: [
      { label: "Tidak sama sekali", score: 1 },
      { label: "Ada, tapi masih minimal", score: 2 },
      { label: "Ada dan cukup memadai", score: 3 },
      { label: "Ada dan sangat lengkap", score: 4 }
    ]
  },
  {
    id: 18,
    question: "Preferensi Anda tentang pendampingan investasi?",
    options: [
      { label: "Saya takut membuat keputusan sendiri", score: 1 },
      { label: "Saya lebih nyaman dengan panduan dari ahli", score: 2 },
      { label: "Saya bisa memutuskan sendiri dengan input ahli", score: 3 },
      { label: "Saya ingin otonomi penuh dalam keputusan", score: 4 }
    ]
  }
];

export default function RiskProfile({ riskProfile, setRiskProfile, onNext, isAnalyzing, analyzeProgress }: any) {
  const [questions, setQuestions] = useState<any[]>(DEFAULT_QUESTIONS);
  const [isLoading, setIsLoading] = useState(true);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>(riskProfile?.answers || {});

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const res = await fetch('/api/gsheets', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'getSettings' })
        });
        const data = await res.json();
        if (data.status === 'success' && data.settings?.risk_profile_questions) {
          const parsed = JSON.parse(data.settings.risk_profile_questions);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setQuestions(parsed);
          }
        }
      } catch (e) {
        console.error("Failed to load questions", e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchQuestions();
  }, []);

  const handleSelect = (score: number) => {
    setAnswers({ ...answers, [questions[currentQuestion].id]: score });
    
    // Auto-advance if not on the last question
    if (currentQuestion < questions.length - 1) {
      setTimeout(() => {
        setCurrentQuestion(curr => curr + 1);
      }, 300);
    }
  };

  const calculateProfile = () => {
    const totalScore = Object.values(answers).reduce((a: any, b: any) => a + b, 0);
    
    let type = '';
    let description = '';
    let allocation = '';
    
    // Adjust logic slightly to accommodate varying max scores.
    // Default max score is 18 * 4 = 72.
    // If questions change, we adapt percentages based on total available score.
    const maxScore = questions.length * 4;
    const scorePercentage = totalScore / maxScore;
    
    if (scorePercentage <= 0.41) { // 30/72
      type = 'KONSERVATIF';
      description = 'Penghindaran risiko tinggi. Prioritas utama: keamanan modal.';
      allocation = 'Deposito 60%, Obligasi 30%, Reksadana Pendapatan Tetap 10%';
    } else if (scorePercentage <= 0.62) { // 45/72
      type = 'MODERAT';
      description = 'Keseimbangan antara keamanan dan pertumbuhan. Fleksibel terhadap risiko sedang.';
      allocation = 'Obligasi 40%, Reksadana Campuran 35%, Saham/Equity 25%';
    } else if (scorePercentage <= 0.83) { // 60/72
      type = 'AGRESIF SEDANG';
      description = 'Fokus pada pertumbuhan jangka panjang. Dapat mentolerir volatilitas signifikan.';
      allocation = 'Reksadana Saham 50%, Reksadana Campuran 30%, Obligasi 20%';
    } else {
      type = 'AGRESIF';
      description = 'Fokus maksimal pada pertumbuhan. Nyaman dengan volatilitas tinggi.';
      allocation = 'Saham Individual/Reksadana Saham Agresif 70%, Reksadana Campuran 30%';
    }
    
    setRiskProfile({
      score: totalScore,
      maxScore: maxScore,
      type,
      description,
      allocation,
      answers
    });
  };

  const progressPercentage = ((currentQuestion) / questions.length) * 100;

  if (riskProfile?.score) {
    return (
      <div className="animate-fade-in" style={{ maxWidth: '800px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h2 className="gradient-text" style={{ fontSize: '2rem', marginBottom: '16px' }}>Hasil Profil Risiko Anda</h2>
          <p style={{ color: 'var(--text-muted)' }}>Asesmen telah selesai. Berikut adalah kecenderungan risiko investasi Anda.</p>
        </div>

        <div className="glass-panel" style={{ padding: '32px', textAlign: 'center', marginBottom: '32px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '4px', background: 'linear-gradient(90deg, #F9D423, #FF4E50)' }}></div>
          
          <div style={{ fontSize: '1.2rem', color: 'var(--text-muted)', marginBottom: '8px' }}>Skor Total: <span style={{ color: 'var(--text)', fontWeight: 'bold' }}>{riskProfile.score}</span>/{riskProfile.maxScore || 72}</div>
          
          <h1 className="gold-text" style={{ fontSize: '3rem', margin: '16px 0' }}>{riskProfile.type}</h1>
          
          <p style={{ fontSize: '1.1rem', lineHeight: 1.6, marginBottom: '24px' }}>{riskProfile.description}</p>
          
          <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '12px', padding: '24px', textAlign: 'left' }}>
            <h4 style={{ marginBottom: '12px', color: 'var(--primary)' }}>💼 Rekomendasi Alokasi Ideal:</h4>
            <p style={{ fontSize: '1.1rem' }}>{riskProfile.allocation}</p>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', marginTop: '32px' }}>
          {isAnalyzing ? (
            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '24px', borderRadius: '12px', border: '1px solid var(--border-color)', textAlign: 'center', width: '100%' }}>
              <h4 style={{ marginBottom: '16px', color: 'var(--primary)' }}>Kami sedang "atur uang bareng kamu" ditunggu ya...</h4>
              <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden', marginBottom: '12px' }}>
                <div style={{ 
                  height: '100%', 
                  width: `${analyzeProgress}%`, 
                  background: 'linear-gradient(90deg, var(--primary), var(--accent))', 
                  transition: 'width 0.3s ease-out' 
                }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                <span>{analyzeProgress < 30 ? 'Membaca profil risiko...' : analyzeProgress < 60 ? 'Menghitung rasio kesehatan...' : analyzeProgress < 90 ? 'Menyusun rekomendasi Syariah...' : 'Finalisasi hasil...'}</span>
                <span>{analyzeProgress >= 95 ? '95% (Menunggu AI...)' : `${analyzeProgress}%`}</span>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', justifyContent: 'center', gap: '16px' }}>
              <button onClick={() => setRiskProfile(null)} className="btn btn-outline">Ulangi Kuesioner</button>
              <button onClick={onNext} className="btn btn-primary" style={{ minWidth: '250px' }}>✅ Generate Bookplan AI</button>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (isLoading) {
    return <div className="flex-center" style={{ height: '300px', color: 'var(--text-muted)' }}>Memuat kuesioner...</div>;
  }

  const q = questions[currentQuestion];

  if (!q) {
    return <div className="flex-center" style={{ height: '300px', color: '#ef4444' }}>Gagal memuat pertanyaan.</div>;
  }

  return (
    <div className="animate-fade-in" style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h2 className="gradient-text" style={{ fontSize: '2rem', marginBottom: '16px' }}>Kenali Profil Risiko Anda</h2>
        <p style={{ color: 'var(--text-muted)' }}>Jawab 18 pertanyaan singkat untuk menemukan strategi investasi terbaik (± 5 menit)</p>
      </div>

      <div className="glass-panel" style={{ padding: '32px', marginBottom: '24px' }}>
        {/* Progress Bar */}
        <div style={{ marginBottom: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', color: 'var(--text-muted)' }}>
            <span>Pertanyaan {currentQuestion + 1} dari {questions.length}</span>
            <span>{Math.round(progressPercentage)}%</span>
          </div>
          <div style={{ height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${progressPercentage}%`, background: 'var(--primary)', transition: 'width 0.3s ease' }}></div>
          </div>
        </div>

        {/* Question */}
        <h3 style={{ fontSize: '1.4rem', marginBottom: '24px', lineHeight: 1.4 }}>
          {q.question}
        </h3>

        {/* Options */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {q.options && q.options.map((opt: any, idx: number) => {
            const isSelected = answers[q.id] === opt.score;
            return (
              <button 
                key={idx}
                onClick={() => handleSelect(opt.score)}
                style={{
                  padding: '16px 20px',
                  borderRadius: '12px',
                  border: isSelected ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                  background: isSelected ? 'rgba(33, 147, 176, 0.1)' : 'rgba(255,255,255,0.02)',
                  color: isSelected ? 'var(--primary)' : 'var(--text)',
                  textAlign: 'left',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}
                className="hover-card"
              >
                <div style={{
                  width: '24px', height: '24px', borderRadius: '50%',
                  border: isSelected ? '6px solid var(--primary)' : '2px solid var(--border-color)',
                  flexShrink: 0
                }} />
                {opt.label}
              </button>
            )
          })}
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <button 
          onClick={() => setCurrentQuestion(c => Math.max(0, c - 1))}
          disabled={currentQuestion === 0}
          className="btn btn-outline"
          style={{ opacity: currentQuestion === 0 ? 0 : 1, visibility: currentQuestion === 0 ? 'hidden' : 'visible' }}
        >
          ⬅ Sebelumnya
        </button>
        
        {currentQuestion === questions.length - 1 ? (
          <button 
            onClick={calculateProfile}
            disabled={!answers[questions[questions.length - 1].id]}
            className="btn btn-primary" style={{ padding: '12px 24px' }}
          >
            Lihat Hasil Profil Risiko ➔
          </button>
        ) : (
          <button 
            onClick={() => setCurrentQuestion(c => Math.min(questions.length - 1, c + 1))}
            disabled={!answers[q.id]}
            className="btn btn-primary"
            style={{ opacity: !answers[q.id] ? 0.5 : 1 }}
          >
            Selanjutnya ➔
          </button>
        )}
      </div>
    </div>
  );
}
