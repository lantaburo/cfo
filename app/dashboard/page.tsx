'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer, Legend } from 'recharts';

const COLORS = ['#F9D423', '#2193b0', '#6dd5ed', '#ff4e50', '#f9d423'];

export default function Dashboard() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzeProgress, setAnalyzeProgress] = useState(0);
  const [result, setResult] = useState<any>(null);
  const [editableResult, setEditableResult] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('input'); // 'input' | 'action_plan' | 'review_cfo'
  const [step, setStep] = useState(1);
  const [user, setUser] = useState<any>(null);
  const [meta, setMeta] = useState<any>(null);
  const [isApproving, setIsApproving] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const savedUser = localStorage.getItem('cfo_user');
    if (!savedUser) {
      router.push('/login');
    } else {
      const parsed = JSON.parse(savedUser);
      setUser(parsed);
      if (parsed.financialData) {
        setBasicInfo(parsed.financialData.basicInfo || basicInfo);
        setAssets(parsed.financialData.assets || assets);
        setDebts(parsed.financialData.debts || debts);
        setExpenses(parsed.financialData.expenses || expenses);
        setGoals(parsed.financialData.goals || goals);
      }
      if (parsed.actionPlan) {
        setResult(parsed.actionPlan);
        setEditableResult(JSON.parse(JSON.stringify(parsed.actionPlan)));
        setActiveTab('action_plan');
      }
      if (parsed.meta) {
        setMeta(parsed.meta);
      }
    }
  }, [router]);

  const formatCurrency = (val: number | string) => {
    if (val === undefined || val === null) return '';
    const num = parseInt(val.toString().replace(/[^0-9]/g, ''), 10);
    return isNaN(num) ? '' : num.toLocaleString('id-ID');
  };

  // Form State
  const [basicInfo, setBasicInfo] = useState({
    usiaSuami: 34,
    usiaIstri: 32,
    status: 'Menikah',
    anak: 1,
    penghasilanBulanan: 58500000,
    bonusTahunan: 137500000
  });

  const [assets, setAssets] = useState([
    { id: 1, name: 'Tabungan Danamon (Suami)', type: 'Lancar', value: 300000 },
    { id: 2, name: 'Tabungan Standard Chartered (Istri)', type: 'Lancar', value: 463047606 },
    { id: 3, name: 'RDPT Schroder Dana Mantap', type: 'Investasi', value: 69341857 },
    { id: 4, name: 'Apartemen', type: 'Guna', value: 2500000000 },
  ]);

  const [debts, setDebts] = useState([
    { id: 1, name: 'KPA Apartemen', principal: 202298497, monthlyInstallment: 6192959 }
  ]);

  const [expenses, setExpenses] = useState([
    { id: 1, name: 'Belanja Bulanan (Groceries)', category: 'Primer', amount: 11000000 },
    { id: 2, name: 'Listrik & Transport', category: 'Primer', amount: 6000000 },
    { id: 3, name: 'Uang Sekolah Anak', category: 'Kewajiban', amount: 4500000 },
    { id: 4, name: 'Asuransi', category: 'Kewajiban', amount: 2000000 },
  ]);

  const [goals, setGoals] = useState<{id: number, name: string, targetAmount: number, timeframe?: string}[]>([
    { id: 2, name: 'Dana Pendidikan', targetAmount: 10192812825, timeframe: 'Panjang (>5 Tahun)' }
  ]);

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    setAnalyzeProgress(0);
    
    // Simulate AI thinking progress (0 to 95%)
    const progressInterval = setInterval(() => {
      setAnalyzeProgress(prev => {
        if (prev >= 95) return 95;
        // Fast at first, then slow down
        const increment = prev < 50 ? Math.floor(Math.random() * 10) + 5 : prev < 85 ? Math.floor(Math.random() * 5) + 1 : 1;
        return prev + increment > 95 ? 95 : prev + increment;
      });
    }, 600);

    try {
      const payload = {
        basicInfo,
        assets,
        debts,
        expenses,
        goals
      };

      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      
      clearInterval(progressInterval);

      if (!res.ok || data.error) {
        throw new Error(data.error || 'Terjadi kesalahan pada AI Server.');
      }
      
      if (!data.financial_checkup) {
        throw new Error('AI memberikan format respons yang salah. Silakan coba lagi.');
      }

      setAnalyzeProgress(100);
      
      // Give a tiny delay so user can see 100%
      setTimeout(() => {
        setResult(data);
        setEditableResult(JSON.parse(JSON.stringify(data)));
        setActiveTab('review_cfo');
        setIsAnalyzing(false);
      }, 500);

    } catch (error: any) {
      clearInterval(progressInterval);
      console.error(error);
      alert('Gagal menganalisis data:\n' + error.message);
      setIsAnalyzing(false);
    }
  };

  const handleApprove = async () => {
    setIsApproving(true);
    try {
      const res = await fetch('/api/gsheets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'approvePlan', email: user.email })
      });
      const data = await res.json();
      if (data.status === 'success') {
        const updatedMeta = { ...meta, isApproved: true };
        setMeta(updatedMeta);
        const savedUser = JSON.parse(localStorage.getItem('cfo_user') || '{}');
        savedUser.meta = updatedMeta;
        localStorage.setItem('cfo_user', JSON.stringify(savedUser));
        alert('Action Plan berhasil disetujui!');
        router.push('/dashboard/monitor');
      } else {
        alert('Gagal finalisasi: ' + data.message);
      }
    } catch (e) {
      alert('Terjadi kesalahan jaringan saat menyetujui plan.');
    } finally {
      setIsApproving(false);
    }
  };

  const handleFinalize = async () => {
    if (!user) return;
    try {
      const payload = {
        action: 'saveData',
        email: user.email,
        financialData: { basicInfo, assets, debts, expenses, goals },
        actionPlan: editableResult
      };
      
      const res = await fetch('/api/gsheets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      const data = await res.json();
      if (data.status === 'success') {
        alert('Data Final berhasil disimpan ke Spreadsheet!');
        
        // Update local storage
        const updatedUser = { ...user, financialData: payload.financialData, actionPlan: editableResult };
        localStorage.setItem('cfo_user', JSON.stringify(updatedUser));
        setUser(updatedUser);
        
        router.push('/dashboard/monitor');
      } else {
        alert('Gagal menyimpan: ' + data.message);
      }
    } catch (e) {
      alert('Terjadi kesalahan jaringan saat menyimpan.');
    }
  };

  const renderInputStep = () => {
    switch(step) {
      case 1:
        return (
          <div className="animate-fade-in">
            <h3 style={{ marginBottom: '12px' }}>Informasi Dasar & Pemasukan</h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: '24px', fontSize: '0.95rem' }}>Lengkapi data dasar ini agar AI dapat menyusun rencana keuangan yang paling sesuai dengan profil risiko dan kondisi Anda.</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>Usia Suami</label>
                <input type="number" placeholder="Contoh: 35" value={basicInfo.usiaSuami} onChange={e => setBasicInfo({...basicInfo, usiaSuami: +e.target.value})} className="glass-panel" style={{ width: '100%', padding: '12px', color: 'var(--text-main)', outline: 'none' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>Usia Istri</label>
                <input type="number" placeholder="Contoh: 32" value={basicInfo.usiaIstri} onChange={e => setBasicInfo({...basicInfo, usiaIstri: +e.target.value})} className="glass-panel" style={{ width: '100%', padding: '12px', color: 'var(--text-main)', outline: 'none' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>Status Pernikahan</label>
                <select value={basicInfo.status} onChange={e => setBasicInfo({...basicInfo, status: e.target.value})} className="glass-panel" style={{ width: '100%', padding: '12px', color: 'var(--text-main)', outline: 'none' }}>
                  <option>Menikah</option>
                  <option>Belum Menikah</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>Jumlah Tanggungan (Anak)</label>
                <input type="number" placeholder="Berapa anak yang ditanggung?" value={basicInfo.anak} onChange={e => setBasicInfo({...basicInfo, anak: +e.target.value})} className="glass-panel" style={{ width: '100%', padding: '12px', color: 'var(--text-main)', outline: 'none' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>Total Penghasilan Bulanan Bersih (Rp)</label>
                <input type="text" placeholder="Gaji bulanan gabungan suami & istri" value={formatCurrency(basicInfo.penghasilanBulanan)} onChange={e => setBasicInfo({...basicInfo, penghasilanBulanan: parseInt(e.target.value.replace(/[^0-9]/g, ''), 10) || 0})} className="glass-panel" style={{ width: '100%', padding: '12px', color: 'var(--text-main)', outline: 'none' }} />
                <small style={{ color: 'var(--text-muted)', display: 'block', marginTop: '6px' }}>*Gaji yang dibawa pulang (Take Home Pay)</small>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>Estimasi Bonus/THR Tahunan (Rp)</label>
                <input type="text" placeholder="Total THR & Bonus dalam setahun" value={formatCurrency(basicInfo.bonusTahunan)} onChange={e => setBasicInfo({...basicInfo, bonusTahunan: parseInt(e.target.value.replace(/[^0-9]/g, ''), 10) || 0})} className="glass-panel" style={{ width: '100%', padding: '12px', color: 'var(--text-main)', outline: 'none' }} />
                <small style={{ color: 'var(--text-muted)', display: 'block', marginTop: '6px' }}>*Total tambahan yang pasti didapat</small>
              </div>
            </div>
            <div style={{ marginTop: '32px', textAlign: 'right' }}>
              <button onClick={() => setStep(2)} className="btn btn-primary">Selanjutnya: Isi Data Aset ➔</button>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="animate-fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3>Daftar Aset</h3>
              <button onClick={() => setAssets([...assets, { id: Date.now(), name: '', type: 'Lancar', value: 0 }])} className="btn btn-outline" style={{ padding: '6px 12px', fontSize: '0.9rem' }}>+ Tambah Aset</button>
            </div>
            {assets.map((asset, i) => (
              <div key={asset.id} style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
                <input type="text" placeholder="Nama Aset" value={asset.name} onChange={e => { const n = [...assets]; n[i].name = e.target.value; setAssets(n); }} className="glass-panel" style={{ flex: 2, padding: '10px', color: 'var(--text-main)' }} />
                <select value={asset.type} onChange={e => { const n = [...assets]; n[i].type = e.target.value; setAssets(n); }} className="glass-panel" style={{ flex: 1, padding: '10px', color: 'var(--text-main)' }}>
                  <option>Lancar</option><option>Investasi</option><option>Guna</option>
                </select>
                <input type="text" placeholder="Nilai (Rp)" value={formatCurrency(asset.value)} onChange={e => { const n = [...assets]; n[i].value = parseInt(e.target.value.replace(/[^0-9]/g, ''), 10) || 0; setAssets(n); }} className="glass-panel" style={{ flex: 1.5, padding: '10px', color: 'var(--text-main)' }} />
                <button onClick={() => setAssets(assets.filter(a => a.id !== asset.id))} style={{ background: 'transparent', border: 'none', color: '#ff4e50', cursor: 'pointer', fontSize: '1.2rem' }}>✕</button>
              </div>
            ))}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '32px' }}>
              <button onClick={() => setStep(1)} className="btn btn-outline">⬅ Kembali</button>
              <button onClick={() => setStep(3)} className="btn btn-primary">Selanjutnya: Hutang ➔</button>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="animate-fade-in">
            <h3 style={{ marginBottom: '12px' }}>Daftar Hutang & Kewajiban</h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: '24px', fontSize: '0.95rem' }}>Masukkan semua hutang yang masih berjalan. Data ini penting untuk menghitung rasio hutang Anda.</p>
            
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
              <button onClick={() => setDebts([...debts, { id: Date.now(), name: '', principal: 0, monthlyInstallment: 0 }])} className="btn btn-outline" style={{ padding: '6px 12px', fontSize: '0.9rem' }}>+ Tambah Hutang</button>
            </div>

            {debts.map((debt, i) => (
              <div key={debt.id} style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '24px', background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Hutang #{i + 1}</label>
                  <button onClick={() => setDebts(debts.filter(a => a.id !== debt.id))} style={{ background: 'transparent', border: 'none', color: '#ff4e50', cursor: 'pointer', fontSize: '1.2rem', padding: '0 8px' }}>✕</button>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <div style={{ flex: 2 }}>
                    <input type="text" placeholder="Nama Pinjaman (Mis: KPR, Paylater)" value={debt.name} onChange={e => { const n = [...debts]; n[i].name = e.target.value; setDebts(n); }} className="glass-panel" style={{ width: '100%', padding: '10px', color: 'var(--text-main)', outline: 'none' }} />
                  </div>
                  <div style={{ flex: 1.5 }}>
                    <input type="text" placeholder="Sisa Pokok (Rp)" value={formatCurrency(debt.principal)} onChange={e => { const n = [...debts]; n[i].principal = parseInt(e.target.value.replace(/[^0-9]/g, ''), 10) || 0; setDebts(n); }} className="glass-panel" style={{ width: '100%', padding: '10px', color: 'var(--text-main)', outline: 'none' }} />
                    <small style={{ color: 'var(--text-muted)', display: 'block', marginTop: '4px', fontSize: '0.75rem' }}>*Total sisa hutang saat ini</small>
                  </div>
                  <div style={{ flex: 1.5 }}>
                    <input type="text" placeholder="Cicilan Bulanan (Rp)" value={formatCurrency(debt.monthlyInstallment)} onChange={e => { const n = [...debts]; n[i].monthlyInstallment = parseInt(e.target.value.replace(/[^0-9]/g, ''), 10) || 0; setDebts(n); }} className="glass-panel" style={{ width: '100%', padding: '10px', color: 'var(--text-main)', outline: 'none' }} />
                    <small style={{ color: 'var(--text-muted)', display: 'block', marginTop: '4px', fontSize: '0.75rem' }}>*Yang dibayar tiap bulan</small>
                  </div>
                </div>
              </div>
            ))}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '32px' }}>
              <button onClick={() => setStep(2)} className="btn btn-outline">⬅ Kembali</button>
              <button onClick={() => setStep(4)} className="btn btn-primary">Selanjutnya: Pengeluaran ➔</button>
            </div>
          </div>
        );
      case 4:
        return (
          <div className="animate-fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3>Cash Flow (Pengeluaran Bulanan)</h3>
              <button onClick={() => setExpenses([...expenses, { id: Date.now(), name: '', category: 'Primer', amount: 0 }])} className="btn btn-outline" style={{ padding: '6px 12px', fontSize: '0.9rem' }}>+ Tambah Pengeluaran</button>
            </div>
            <div style={{ maxHeight: '300px', overflowY: 'auto', paddingRight: '8px' }}>
              {expenses.map((exp, i) => (
                <div key={exp.id} style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
                  <input type="text" placeholder="Item" value={exp.name} onChange={e => { const n = [...expenses]; n[i].name = e.target.value; setExpenses(n); }} className="glass-panel" style={{ flex: 2, padding: '10px', color: 'var(--text-main)' }} />
                  <select value={exp.category} onChange={e => { const n = [...expenses]; n[i].category = e.target.value; setExpenses(n); }} className="glass-panel" style={{ flex: 1, padding: '10px', color: 'var(--text-main)' }}>
                    <option>Primer</option><option>Kewajiban</option><option>Sekunder</option>
                  </select>
                  <input type="text" placeholder="Nominal (Rp)" value={formatCurrency(exp.amount)} onChange={e => { const n = [...expenses]; n[i].amount = parseInt(e.target.value.replace(/[^0-9]/g, ''), 10) || 0; setExpenses(n); }} className="glass-panel" style={{ flex: 1.5, padding: '10px', color: 'var(--text-main)' }} />
                  <button onClick={() => setExpenses(expenses.filter(a => a.id !== exp.id))} style={{ background: 'transparent', border: 'none', color: '#ff4e50', cursor: 'pointer', fontSize: '1.2rem' }}>✕</button>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '32px' }}>
              <button onClick={() => setStep(3)} className="btn btn-outline">⬅ Kembali</button>
              <button onClick={() => setStep(5)} className="btn btn-primary">Selanjutnya: Tujuan ➔</button>
            </div>
          </div>
        );
      case 5:
        return (
          <div className="animate-fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3>Tujuan Keuangan (Financial Goals)</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                {goals.length >= 2 && (
                  <span style={{ fontSize: '0.8rem', background: 'rgba(249, 212, 35, 0.2)', color: 'var(--accent)', padding: '4px 8px', borderRadius: '4px', border: '1px solid var(--accent)' }}>💎 PRO FITUR: Max 2 Tujuan</span>
                )}
                <button 
                  onClick={() => goals.length < 2 && setGoals([...goals, { id: Date.now(), name: '', targetAmount: 0, timeframe: 'Pendek (1-3 Tahun)' }])}
                  className="btn btn-outline"
                  style={{ padding: '6px 12px', fontSize: '0.9rem', opacity: goals.length >= 2 ? 0.5 : 1, cursor: goals.length >= 2 ? 'not-allowed' : 'pointer' }}
                  disabled={goals.length >= 2}
                >
                  + Tambah Tujuan
                </button>
              </div>
            </div>
            
            {goals.map((goal, i) => (
              <div key={goal.id} style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '24px', background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Tujuan Keuangan #{i + 1}</label>
                  <button onClick={() => setGoals(goals.filter(a => a.id !== goal.id))} style={{ background: 'transparent', border: 'none', color: '#ff4e50', cursor: 'pointer', fontSize: '1.2rem', padding: '0 8px' }}>✕</button>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <div style={{ flex: 1.5 }}>
                    <input type="text" placeholder="Nama Tujuan (Mis: Pendidikan)" value={goal.name} onChange={e => { const n = [...goals]; n[i].name = e.target.value; setGoals(n); }} className="glass-panel" style={{ width: '100%', padding: '10px', color: 'var(--text-main)', outline: 'none' }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <select value={goal.timeframe} onChange={e => { const n = [...goals]; n[i].timeframe = e.target.value; setGoals(n); }} className="glass-panel" style={{ width: '100%', padding: '10px', color: 'var(--text-main)', outline: 'none' }}>
                      <option value="Pendek (1-3 Tahun)">Pendek (1-3 Tahun)</option>
                      <option value="Menengah (4-5 Tahun)">Menengah (4-5 Tahun)</option>
                      <option value="Panjang (>5 Tahun)">Panjang (&gt;5 Tahun)</option>
                    </select>
                  </div>
                  <div style={{ flex: 1.5 }}>
                    <input type="text" placeholder="Target Dana (Rp)" value={formatCurrency(goal.targetAmount)} onChange={e => { const n = [...goals]; n[i].targetAmount = parseInt(e.target.value.replace(/[^0-9]/g, ''), 10) || 0; setGoals(n); }} className="glass-panel" style={{ width: '100%', padding: '10px', color: 'var(--text-main)', outline: 'none' }} />
                  </div>
                </div>
              </div>
            ))}
            
            <div style={{ display: 'flex', flexDirection: 'column', marginTop: '32px' }}>
              {isAnalyzing ? (
                <div style={{ background: 'rgba(255,255,255,0.05)', padding: '24px', borderRadius: '12px', border: '1px solid var(--border-color)', textAlign: 'center' }}>
                  <h4 style={{ marginBottom: '16px', color: 'var(--primary)' }}>CFO AI sedang menganalisis data Anda...</h4>
                  <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden', marginBottom: '12px' }}>
                    <div style={{ 
                      height: '100%', 
                      width: `${analyzeProgress}%`, 
                      background: 'linear-gradient(90deg, var(--primary), var(--accent))', 
                      transition: 'width 0.3s ease-out' 
                    }} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                    <span>{analyzeProgress < 30 ? 'Membaca portofolio...' : analyzeProgress < 60 ? 'Menghitung rasio kesehatan...' : analyzeProgress < 90 ? 'Menyusun rekomendasi Syariah...' : 'Finalisasi hasil...'}</span>
                    <span>{analyzeProgress >= 95 ? '95% (Menunggu AI...)' : `${analyzeProgress}%`}</span>
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <button onClick={() => setStep(4)} className="btn btn-outline">⬅ Kembali</button>
                  <button onClick={handleAnalyze} className="btn btn-primary" style={{ minWidth: '200px' }}>
                    ✅ Generate Bookplan AI
                  </button>
                </div>
              )}
            </div>
          </div>
        );
    }
  };

  const navButtonStyle = (tabName: string) => ({
    background: 'transparent', 
    border: 'none', 
    color: activeTab === tabName ? 'var(--primary)' : 'var(--text-muted)', 
    fontSize: '1rem', 
    fontWeight: 600, 
    cursor: result ? 'pointer' : 'not-allowed', 
    opacity: result || tabName === 'input' ? 1 : 0.5 
  });

  return (
    <div className="container" style={{ padding: '40px 24px' }}>
      
      {/* Header Tabs */}
      <div style={{ display: 'flex', gap: '24px', marginBottom: '32px', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px', overflowX: 'auto' }}>
        <button onClick={() => setActiveTab('input')} style={navButtonStyle('input')}>1. Data Klien</button>
        <button onClick={() => result && setActiveTab('snapshot')} disabled={!result} style={navButtonStyle('snapshot')}>2. Snapshot</button>
        <button onClick={() => result && setActiveTab('action_plan')} disabled={!result} style={navButtonStyle('action_plan')}>3. Action Plan</button>
        <button onClick={() => result && setActiveTab('rekomendasi')} disabled={!result} style={navButtonStyle('rekomendasi')}>4. Rekomendasi</button>
        <button onClick={() => result && setActiveTab('edit_final')} disabled={!result} style={navButtonStyle('edit_final')}>5. Finalisasi</button>
      </div>

      {activeTab === 'input' && (
        <div className="glass-card animate-fade-in" style={{ maxWidth: '900px', margin: '0 auto' }}>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '32px' }}>
            {[1,2,3,4,5].map(s => (
              <div key={s} style={{ height: '4px', flex: 1, background: s <= step ? 'var(--primary)' : 'rgba(255,255,255,0.1)', borderRadius: '2px', transition: '0.3s' }} />
            ))}
          </div>
          {renderInputStep()}
        </div>
      )}

      {activeTab === 'snapshot' && result && (
        <div className="animate-fade-in">
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <h1 className="gradient-text" style={{ fontSize: '2.2rem', marginBottom: '8px' }}>A Snapshot of Your Current Finances</h1>
            <p style={{ color: 'var(--text-muted)' }}>This is where you stand today: the starting line for your Action Program</p>
          </div>

          <div style={{ maxWidth: '800px', margin: '0 auto', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '32px', marginBottom: '40px' }}>
            
            {/* The Basics */}
            <h3 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '8px', marginBottom: '16px', textAlign: 'center', fontStyle: 'italic', fontWeight: 'normal' }}>The Basics</h3>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}><span>Age (Suami & Istri)</span><span>{basicInfo.usiaSuami} & {basicInfo.usiaIstri}</span></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}><span>Kids</span><span>{basicInfo.anak}</span></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}><span>Annual Household Income</span><span>Rp {((basicInfo.penghasilanBulanan * 12) + basicInfo.bonusTahunan).toLocaleString('id-ID')}</span></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '32px' }}><span>Monthly Net Income</span><span>Rp {basicInfo.penghasilanBulanan.toLocaleString('id-ID')}</span></div>

            {/* Assets */}
            <h3 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '8px', marginBottom: '16px', textAlign: 'center', fontStyle: 'italic', fontWeight: 'normal' }}>Assets</h3>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}><span>Aset Lancar (Checking & Savings)</span><span>Rp {assets.filter(a => a.type === 'Lancar').reduce((sum, a) => sum + a.value, 0).toLocaleString('id-ID')}</span></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}><span>Aset Investasi (Invested Assets)</span><span>Rp {assets.filter(a => a.type === 'Investasi').reduce((sum, a) => sum + a.value, 0).toLocaleString('id-ID')}</span></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '32px' }}><span>Aset Guna (Real Estate & Others)</span><span>Rp {assets.filter(a => a.type === 'Guna').reduce((sum, a) => sum + a.value, 0).toLocaleString('id-ID')}</span></div>

            {/* Liabilities */}
            <h3 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '8px', marginBottom: '16px', textAlign: 'center', fontStyle: 'italic', fontWeight: 'normal' }}>Liabilities</h3>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '32px' }}><span>Total Hutang Berjalan</span><span>Rp {debts.reduce((sum, d) => sum + d.principal, 0).toLocaleString('id-ID')}</span></div>

            {/* The Big Picture */}
            <h3 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '8px', marginBottom: '16px', textAlign: 'center', fontStyle: 'italic', fontWeight: 'normal' }}>The Big Picture</h3>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.2)', padding: '16px', borderRadius: '8px' }}>
              <div style={{ textAlign: 'center' }}>
                <span style={{ display: 'block', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Total Assets</span>
                <span style={{ fontSize: '1.2rem', color: '#2193b0' }}>Rp {assets.reduce((sum, a) => sum + a.value, 0).toLocaleString('id-ID')}</span>
              </div>
              <span style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>-</span>
              <div style={{ textAlign: 'center' }}>
                <span style={{ display: 'block', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Total Liabilities</span>
                <span style={{ fontSize: '1.2rem', color: '#ff4e50' }}>Rp {debts.reduce((sum, d) => sum + d.principal, 0).toLocaleString('id-ID')}</span>
              </div>
              <span style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>=</span>
              <div style={{ textAlign: 'center' }}>
                <span style={{ display: 'block', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Net Worth</span>
                <span style={{ fontSize: '1.2rem', color: 'var(--primary)' }}>Rp {(assets.reduce((sum, a) => sum + a.value, 0) - debts.reduce((sum, d) => sum + d.principal, 0)).toLocaleString('id-ID')}</span>
              </div>
            </div>
          </div>

          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <h2 style={{ fontSize: '1.8rem', marginBottom: '8px' }}>Financial Ratio Analysis</h2>
            <p style={{ color: 'var(--text-muted)' }}>Indikator kesehatan arus kas dan rasio hutang terhadap kekayaan bersih.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '24px', marginBottom: '40px' }}>
            {/* Liquidity Ratio */}
            <div className="glass-panel" style={{ padding: '24px', borderTop: '4px solid #2193b0' }}>
              <h4 style={{ textAlign: 'center', marginBottom: '16px', letterSpacing: '1px' }}>LIQUIDITY RATIO</h4>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '0.9rem' }}><span>Total Aset Lancar</span><span>Rp {assets.filter(a => a.type === 'Lancar').reduce((sum, a) => sum + a.value, 0).toLocaleString('id-ID')}</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '0.9rem' }}><span>Pengeluaran Bulanan</span><span>Rp {expenses.reduce((sum, e) => sum + e.amount, 0).toLocaleString('id-ID')}</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', borderTop: '1px solid var(--border-color)', paddingTop: '8px', marginBottom: '12px' }}>
                <span>RASIO</span>
                <span>{(assets.filter(a => a.type === 'Lancar').reduce((sum, a) => sum + a.value, 0) / (expenses.reduce((sum, e) => sum + e.amount, 0) || 1)).toFixed(2)}x</span>
              </div>
              <div style={{ textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic', marginBottom: '8px' }}>Basic Guideline : &gt; Dana Darurat</div>
              <div style={{ textAlign: 'center', background: (assets.filter(a => a.type === 'Lancar').reduce((sum, a) => sum + a.value, 0) / (expenses.reduce((sum, e) => sum + e.amount, 0) || 1)) >= 3 ? 'rgba(46, 204, 113, 0.2)' : 'rgba(231, 76, 60, 0.2)', color: (assets.filter(a => a.type === 'Lancar').reduce((sum, a) => sum + a.value, 0) / (expenses.reduce((sum, e) => sum + e.amount, 0) || 1)) >= 3 ? '#2ecc71' : '#e74c3c', padding: '4px', borderRadius: '4px', fontWeight: 'bold', fontSize: '0.9rem' }}>
                {(assets.filter(a => a.type === 'Lancar').reduce((sum, a) => sum + a.value, 0) / (expenses.reduce((sum, e) => sum + e.amount, 0) || 1)) >= 3 ? 'SEHAT' : 'TIDAK SEHAT'}
              </div>
            </div>

            {/* Liquid Asset to Net Worth */}
            <div className="glass-panel" style={{ padding: '24px', borderTop: '4px solid #2193b0' }}>
              <h4 style={{ textAlign: 'center', marginBottom: '16px', letterSpacing: '1px' }}>LIQUID ASSET TO NET WORTH RATIO</h4>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '0.9rem' }}><span>Total Aset Lancar</span><span>Rp {assets.filter(a => a.type === 'Lancar').reduce((sum, a) => sum + a.value, 0).toLocaleString('id-ID')}</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '0.9rem' }}><span>Total Kekayaan Bersih</span><span>Rp {(assets.reduce((sum, a) => sum + a.value, 0) - debts.reduce((sum, d) => sum + d.principal, 0)).toLocaleString('id-ID')}</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', borderTop: '1px solid var(--border-color)', paddingTop: '8px', marginBottom: '12px' }}>
                <span>RASIO</span>
                <span>{((assets.filter(a => a.type === 'Lancar').reduce((sum, a) => sum + a.value, 0) / (assets.reduce((sum, a) => sum + a.value, 0) - debts.reduce((sum, d) => sum + d.principal, 0) || 1)) * 100).toFixed(2)}%</span>
              </div>
              <div style={{ textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic', marginBottom: '8px' }}>Basic Guideline : 15% - 20%</div>
              <div style={{ textAlign: 'center', background: ((assets.filter(a => a.type === 'Lancar').reduce((sum, a) => sum + a.value, 0) / (assets.reduce((sum, a) => sum + a.value, 0) - debts.reduce((sum, d) => sum + d.principal, 0) || 1)) * 100) >= 15 ? 'rgba(46, 204, 113, 0.2)' : 'rgba(231, 76, 60, 0.2)', color: ((assets.filter(a => a.type === 'Lancar').reduce((sum, a) => sum + a.value, 0) / (assets.reduce((sum, a) => sum + a.value, 0) - debts.reduce((sum, d) => sum + d.principal, 0) || 1)) * 100) >= 15 ? '#2ecc71' : '#e74c3c', padding: '4px', borderRadius: '4px', fontWeight: 'bold', fontSize: '0.9rem' }}>
                {((assets.filter(a => a.type === 'Lancar').reduce((sum, a) => sum + a.value, 0) / (assets.reduce((sum, a) => sum + a.value, 0) - debts.reduce((sum, d) => sum + d.principal, 0) || 1)) * 100) >= 15 ? 'SEHAT' : 'TIDAK SEHAT'}
              </div>
            </div>

            {/* Net Investment Asset to Net Worth */}
            <div className="glass-panel" style={{ padding: '24px', borderTop: '4px solid #f9d423' }}>
              <h4 style={{ textAlign: 'center', marginBottom: '16px', letterSpacing: '1px' }}>NET INVESTMENT TO NET WORTH</h4>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '0.9rem' }}><span>Total Aset Investasi</span><span>Rp {assets.filter(a => a.type === 'Investasi').reduce((sum, a) => sum + a.value, 0).toLocaleString('id-ID')}</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '0.9rem' }}><span>Total Kekayaan Bersih</span><span>Rp {(assets.reduce((sum, a) => sum + a.value, 0) - debts.reduce((sum, d) => sum + d.principal, 0)).toLocaleString('id-ID')}</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', borderTop: '1px solid var(--border-color)', paddingTop: '8px', marginBottom: '12px' }}>
                <span>RASIO</span>
                <span>{((assets.filter(a => a.type === 'Investasi').reduce((sum, a) => sum + a.value, 0) / (assets.reduce((sum, a) => sum + a.value, 0) - debts.reduce((sum, d) => sum + d.principal, 0) || 1)) * 100).toFixed(2)}%</span>
              </div>
              <div style={{ textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic', marginBottom: '8px' }}>Basic Guideline : &gt; 50%</div>
              <div style={{ textAlign: 'center', background: ((assets.filter(a => a.type === 'Investasi').reduce((sum, a) => sum + a.value, 0) / (assets.reduce((sum, a) => sum + a.value, 0) - debts.reduce((sum, d) => sum + d.principal, 0) || 1)) * 100) >= 50 ? 'rgba(46, 204, 113, 0.2)' : 'rgba(231, 76, 60, 0.2)', color: ((assets.filter(a => a.type === 'Investasi').reduce((sum, a) => sum + a.value, 0) / (assets.reduce((sum, a) => sum + a.value, 0) - debts.reduce((sum, d) => sum + d.principal, 0) || 1)) * 100) >= 50 ? '#2ecc71' : '#e74c3c', padding: '4px', borderRadius: '4px', fontWeight: 'bold', fontSize: '0.9rem' }}>
                {((assets.filter(a => a.type === 'Investasi').reduce((sum, a) => sum + a.value, 0) / (assets.reduce((sum, a) => sum + a.value, 0) - debts.reduce((sum, d) => sum + d.principal, 0) || 1)) * 100) >= 50 ? 'SEHAT' : 'TIDAK SEHAT'}
              </div>
            </div>

            {/* Solvency Ratio */}
            <div className="glass-panel" style={{ padding: '24px', borderTop: '4px solid #2ecc71' }}>
              <h4 style={{ textAlign: 'center', marginBottom: '16px', letterSpacing: '1px' }}>SOLVENCY RATIO</h4>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '0.9rem' }}><span>Total Kekayaan Bersih</span><span>Rp {(assets.reduce((sum, a) => sum + a.value, 0) - debts.reduce((sum, d) => sum + d.principal, 0)).toLocaleString('id-ID')}</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '0.9rem' }}><span>Total Aset</span><span>Rp {assets.reduce((sum, a) => sum + a.value, 0).toLocaleString('id-ID')}</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', borderTop: '1px solid var(--border-color)', paddingTop: '8px', marginBottom: '12px' }}>
                <span>RASIO</span>
                <span>{(((assets.reduce((sum, a) => sum + a.value, 0) - debts.reduce((sum, d) => sum + d.principal, 0)) / (assets.reduce((sum, a) => sum + a.value, 0) || 1)) * 100).toFixed(2)}%</span>
              </div>
              <div style={{ textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic', marginBottom: '8px' }}>Basic Guideline : &gt; 35%</div>
              <div style={{ textAlign: 'center', background: (((assets.reduce((sum, a) => sum + a.value, 0) - debts.reduce((sum, d) => sum + d.principal, 0)) / (assets.reduce((sum, a) => sum + a.value, 0) || 1)) * 100) >= 35 ? 'rgba(46, 204, 113, 0.2)' : 'rgba(231, 76, 60, 0.2)', color: (((assets.reduce((sum, a) => sum + a.value, 0) - debts.reduce((sum, d) => sum + d.principal, 0)) / (assets.reduce((sum, a) => sum + a.value, 0) || 1)) * 100) >= 35 ? '#2ecc71' : '#e74c3c', padding: '4px', borderRadius: '4px', fontWeight: 'bold', fontSize: '0.9rem' }}>
                {(((assets.reduce((sum, a) => sum + a.value, 0) - debts.reduce((sum, d) => sum + d.principal, 0)) / (assets.reduce((sum, a) => sum + a.value, 0) || 1)) * 100) >= 35 ? 'SEHAT' : 'TIDAK SEHAT'}
              </div>
            </div>

            {/* Debt to Asset */}
            <div className="glass-panel" style={{ padding: '24px', borderTop: '4px solid #ff4e50' }}>
              <h4 style={{ textAlign: 'center', marginBottom: '16px', letterSpacing: '1px' }}>DEBT TO ASSET RATIO</h4>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '0.9rem' }}><span>Total Hutang</span><span>Rp {debts.reduce((sum, d) => sum + d.principal, 0).toLocaleString('id-ID')}</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '0.9rem' }}><span>Total Aset</span><span>Rp {assets.reduce((sum, a) => sum + a.value, 0).toLocaleString('id-ID')}</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', borderTop: '1px solid var(--border-color)', paddingTop: '8px', marginBottom: '12px' }}>
                <span>RASIO</span>
                <span>{((debts.reduce((sum, d) => sum + d.principal, 0) / (assets.reduce((sum, a) => sum + a.value, 0) || 1)) * 100).toFixed(2)}%</span>
              </div>
              <div style={{ textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic', marginBottom: '8px' }}>Basic Guideline : &lt; 50%</div>
              <div style={{ textAlign: 'center', background: ((debts.reduce((sum, d) => sum + d.principal, 0) / (assets.reduce((sum, a) => sum + a.value, 0) || 1)) * 100) <= 50 ? 'rgba(46, 204, 113, 0.2)' : 'rgba(231, 76, 60, 0.2)', color: ((debts.reduce((sum, d) => sum + d.principal, 0) / (assets.reduce((sum, a) => sum + a.value, 0) || 1)) * 100) <= 50 ? '#2ecc71' : '#e74c3c', padding: '4px', borderRadius: '4px', fontWeight: 'bold', fontSize: '0.9rem' }}>
                {((debts.reduce((sum, d) => sum + d.principal, 0) / (assets.reduce((sum, a) => sum + a.value, 0) || 1)) * 100) <= 50 ? 'SEHAT' : 'TIDAK SEHAT'}
              </div>
            </div>

            {/* Debt Service Ratio */}
            <div className="glass-panel" style={{ padding: '24px', borderTop: '4px solid #ff4e50' }}>
              <h4 style={{ textAlign: 'center', marginBottom: '16px', letterSpacing: '1px' }}>DEBT SERVICE RATIO</h4>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '0.9rem' }}><span>Total Cicilan Bulanan</span><span>Rp {debts.reduce((sum, d) => sum + d.monthlyInstallment, 0).toLocaleString('id-ID')}</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '0.9rem' }}><span>Total Pemasukan Bulanan</span><span>Rp {basicInfo.penghasilanBulanan.toLocaleString('id-ID')}</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', borderTop: '1px solid var(--border-color)', paddingTop: '8px', marginBottom: '12px' }}>
                <span>RASIO</span>
                <span>{((debts.reduce((sum, d) => sum + d.monthlyInstallment, 0) / (basicInfo.penghasilanBulanan || 1)) * 100).toFixed(2)}%</span>
              </div>
              <div style={{ textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic', marginBottom: '8px' }}>Basic Guideline : &lt; 30%</div>
              <div style={{ textAlign: 'center', background: ((debts.reduce((sum, d) => sum + d.monthlyInstallment, 0) / (basicInfo.penghasilanBulanan || 1)) * 100) <= 30 ? 'rgba(46, 204, 113, 0.2)' : 'rgba(231, 76, 60, 0.2)', color: ((debts.reduce((sum, d) => sum + d.monthlyInstallment, 0) / (basicInfo.penghasilanBulanan || 1)) * 100) <= 30 ? '#2ecc71' : '#e74c3c', padding: '4px', borderRadius: '4px', fontWeight: 'bold', fontSize: '0.9rem' }}>
                {((debts.reduce((sum, d) => sum + d.monthlyInstallment, 0) / (basicInfo.penghasilanBulanan || 1)) * 100) <= 30 ? 'SEHAT' : 'TIDAK SEHAT'}
              </div>
            </div>

            {/* Saving Ratio */}
            <div className="glass-panel" style={{ padding: '24px', borderTop: '4px solid #2ecc71' }}>
              <h4 style={{ textAlign: 'center', marginBottom: '16px', letterSpacing: '1px' }}>SAVING RATIO</h4>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '0.9rem' }}><span>Sisa / Tabungan Bulanan</span><span>Rp {(basicInfo.penghasilanBulanan - expenses.reduce((sum, e) => sum + e.amount, 0) - debts.reduce((sum, d) => sum + d.monthlyInstallment, 0)).toLocaleString('id-ID')}</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '0.9rem' }}><span>Total Pemasukan Bulanan</span><span>Rp {basicInfo.penghasilanBulanan.toLocaleString('id-ID')}</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', borderTop: '1px solid var(--border-color)', paddingTop: '8px', marginBottom: '12px' }}>
                <span>RASIO</span>
                <span>{(((basicInfo.penghasilanBulanan - expenses.reduce((sum, e) => sum + e.amount, 0) - debts.reduce((sum, d) => sum + d.monthlyInstallment, 0)) / (basicInfo.penghasilanBulanan || 1)) * 100).toFixed(2)}%</span>
              </div>
              <div style={{ textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic', marginBottom: '8px' }}>Basic Guideline : &gt; 10%</div>
              <div style={{ textAlign: 'center', background: (((basicInfo.penghasilanBulanan - expenses.reduce((sum, e) => sum + e.amount, 0) - debts.reduce((sum, d) => sum + d.monthlyInstallment, 0)) / (basicInfo.penghasilanBulanan || 1)) * 100) >= 10 ? 'rgba(46, 204, 113, 0.2)' : 'rgba(231, 76, 60, 0.2)', color: (((basicInfo.penghasilanBulanan - expenses.reduce((sum, e) => sum + e.amount, 0) - debts.reduce((sum, d) => sum + d.monthlyInstallment, 0)) / (basicInfo.penghasilanBulanan || 1)) * 100) >= 10 ? '#2ecc71' : '#e74c3c', padding: '4px', borderRadius: '4px', fontWeight: 'bold', fontSize: '0.9rem' }}>
                {(((basicInfo.penghasilanBulanan - expenses.reduce((sum, e) => sum + e.amount, 0) - debts.reduce((sum, d) => sum + d.monthlyInstallment, 0)) / (basicInfo.penghasilanBulanan || 1)) * 100) >= 10 ? 'SEHAT' : 'TIDAK SEHAT'}
              </div>
            </div>
          </div>

          <div className="glass-card" style={{ marginBottom: '40px' }}>
            <h3 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', marginBottom: '16px' }}>📝 Catatan CFO (Overall Health Summary)</h3>
            <p style={{ lineHeight: 1.6, color: 'var(--text-muted)' }}>{result.financial_checkup?.overall_health_summary || 'Tidak ada catatan khusus.'}</p>
          </div>

          <div style={{ textAlign: 'center', marginTop: '48px', paddingTop: '24px', borderTop: '1px solid var(--border-color)' }}>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', maxWidth: '800px', margin: '0 auto', lineHeight: 1.6 }}>
              This analysis is based on information from your online financial profile, our call, and any information provided by you during the financial planning process. CFO AI Planner assumes all information you have provided is accurate and does not independently verify the accuracy of any such information.
            </p>
          </div>
          
          <div style={{ textAlign: 'right', marginTop: '32px' }}>
            <button onClick={() => setActiveTab('action_plan')} className="btn btn-primary">Lanjut ke Action Plan ➔</button>
          </div>
        </div>
      )}

      {activeTab === 'action_plan' && result && (
        <div className="animate-fade-in">
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <h1 className="gradient-text" style={{ fontSize: '2.5rem', marginBottom: '16px' }}>Your Personal Sharia Financial Planner</h1>
            <p style={{ fontSize: '1.2rem', color: 'var(--text-muted)' }}>Diagnosa Kesehatan, Visualisasi Aset & Proyeksi Tujuan</p>
          </div>

          {/* The Big Picture: Networth */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '24px', marginBottom: '40px', textAlign: 'center' }}>
            <div className="glass-card">
              <span style={{ color: 'var(--text-muted)' }}>Total Aset</span>
              <h2 style={{ color: '#2193b0', marginTop: '8px' }}>Rp {assets.reduce((sum, a) => sum + a.value, 0).toLocaleString('id-ID')}</h2>
            </div>
            <div className="glass-card">
              <span style={{ color: 'var(--text-muted)' }}>Total Hutang</span>
              <h2 style={{ color: '#ff4e50', marginTop: '8px' }}>Rp {debts.reduce((sum, d) => sum + d.principal, 0).toLocaleString('id-ID')}</h2>
            </div>
            <div className="glass-card" style={{ background: 'rgba(249, 212, 35, 0.05)', borderColor: 'rgba(249, 212, 35, 0.2)' }}>
              <span style={{ color: 'var(--text-muted)' }}>Kekayaan Bersih (Networth)</span>
              <h2 className="gold-text" style={{ marginTop: '8px' }}>Rp {(assets.reduce((sum, a) => sum + a.value, 0) - debts.reduce((sum, d) => sum + d.principal, 0)).toLocaleString('id-ID')}</h2>
            </div>
          </div>

          {/* Charts Section */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', marginBottom: '48px' }}>
            {/* Asset Chart */}
            <div className="glass-panel" style={{ height: '350px', padding: '24px' }}>
              <h3 style={{ textAlign: 'center', marginBottom: '16px' }}>Komposisi Aset</h3>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie 
                    data={[
                      { name: 'Lancar', value: assets.filter(a => a.type === 'Lancar').reduce((sum, a) => sum + a.value, 0) },
                      { name: 'Investasi', value: assets.filter(a => a.type === 'Investasi').reduce((sum, a) => sum + a.value, 0) },
                      { name: 'Guna', value: assets.filter(a => a.type === 'Guna').reduce((sum, a) => sum + a.value, 0) }
                    ].filter(d => d.value > 0)}
                    cx="50%" cy="50%" innerRadius={60} outerRadius={90} dataKey="value"
                  >
                    {[0,1,2].map((_, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                  </Pie>
                  <RechartsTooltip formatter={(val: any) => `Rp ${Number(val).toLocaleString('id-ID')}`} contentStyle={{ background: '#1a1a2e', borderColor: '#333' }} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Networth Chart */}
            <div className="glass-panel" style={{ height: '350px', padding: '24px' }}>
              <h3 style={{ textAlign: 'center', marginBottom: '16px' }}>Kekayaan Bersih</h3>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie 
                    data={[
                      { name: 'Total Aset', value: assets.reduce((sum, a) => sum + a.value, 0) },
                      { name: 'Total Hutang', value: debts.reduce((sum, d) => sum + d.principal, 0) }
                    ].filter(d => d.value > 0)}
                    cx="50%" cy="50%" innerRadius={0} outerRadius={90} dataKey="value"
                  >
                    <Cell fill="#2193b0" />
                    <Cell fill="#ff4e50" />
                  </Pie>
                  <RechartsTooltip formatter={(val: any) => `Rp ${Number(val).toLocaleString('id-ID')}`} contentStyle={{ background: '#1a1a2e', borderColor: '#333' }} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Cash Flow Chart */}
            <div className="glass-panel" style={{ height: '350px', padding: '24px' }}>
              <h3 style={{ textAlign: 'center', marginBottom: '16px' }}>Cash Flow Bulanan</h3>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie 
                    data={[
                      { name: 'Primer', value: expenses.filter(a => a.category === 'Primer').reduce((sum, a) => sum + a.amount, 0) },
                      { name: 'Kewajiban', value: expenses.filter(a => a.category === 'Kewajiban').reduce((sum, a) => sum + a.amount, 0) },
                      { name: 'Sekunder', value: expenses.filter(a => a.category === 'Sekunder').reduce((sum, a) => sum + a.amount, 0) },
                      { name: 'Sisa/Tabungan', value: basicInfo.penghasilanBulanan - expenses.reduce((sum, a) => sum + a.amount, 0) - debts.reduce((sum, a) => sum + a.monthlyInstallment, 0) }
                    ].filter(d => d.value > 0)}
                    cx="50%" cy="50%" innerRadius={60} outerRadius={90} dataKey="value"
                  >
                    {[0,1,2,3].map((_, index) => <Cell key={`cell-${index}`} fill={COLORS[(index + 1) % COLORS.length]} />)}
                  </Pie>
                  <RechartsTooltip formatter={(val: any) => `Rp ${Number(val).toLocaleString('id-ID')}`} contentStyle={{ background: '#1a1a2e', borderColor: '#333' }} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', marginBottom: '40px' }}>
            <div className="glass-card">
              <h3 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', marginBottom: '16px' }}>🩺 Ringkasan Kesehatan</h3>
              <p style={{ lineHeight: 1.6, color: 'var(--text-muted)' }}>{result.financial_checkup.overall_health_summary}</p>
            </div>
            <div className="glass-card">
              <h3 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', marginBottom: '16px' }}>📈 Asumsi Makro</h3>
              <p style={{ lineHeight: 1.6, color: 'var(--text-muted)' }}>{result.macro_micro_analysis.investment_climate}</p>
            </div>
          </div>

          <h2 style={{ marginBottom: '24px' }}>Proyeksi Tujuan Finansial</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px', marginBottom: '40px' }}>
            {result.goal_projections.map((goal: any, idx: number) => (
              <div key={idx} className="glass-panel" style={{ padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                  <h3 className="gold-text" style={{ fontSize: '1.4rem', margin: 0 }}>{goal.goal_name}</h3>
                  {goal.timeframe && (
                    <span style={{ fontSize: '0.8rem', background: 'rgba(255,255,255,0.1)', padding: '4px 8px', borderRadius: '4px' }}>
                      ⏱️ {goal.timeframe}
                    </span>
                  )}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Target Dana:</span>
                  <strong style={{ fontSize: '1.1rem' }}>Rp {(goal.target_amount).toLocaleString('id-ID')}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Kebutuhan Investasi Bulanan:</span>
                  <strong style={{ fontSize: '1.1rem', color: 'var(--primary)' }}>Rp {(goal.recommended_monthly_investment).toLocaleString('id-ID')}</strong>
                </div>
                {goal.notes && (
                  <p style={{ marginTop: '12px', fontSize: '0.9rem', color: 'var(--text-muted)', borderTop: '1px solid var(--border-color)', paddingTop: '12px' }}>
                    {goal.notes}
                  </p>
                )}
              </div>
            ))}
          </div>
          
          <div style={{ textAlign: 'right' }}>
            <button onClick={() => setActiveTab('rekomendasi')} className="btn btn-primary">Lihat Rekomendasi Alokasi ➔</button>
          </div>
        </div>
      )}

      {activeTab === 'rekomendasi' && result && (
        <div className="animate-fade-in">
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <h1 className="gradient-text" style={{ fontSize: '2.5rem', marginBottom: '16px' }}>Rekomendasi Portofolio Syariah</h1>
            <p style={{ fontSize: '1.2rem', color: 'var(--text-muted)' }}>Saran penempatan aset berdasarkan proyeksi AI</p>
          </div>

          <div style={{ marginBottom: '40px' }}>
            <h3 style={{ marginBottom: '16px' }}>Alokasi Lumpsum (Sekali Bayar)</h3>
            <div className="glass-panel" style={{ overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: 'rgba(255,255,255,0.05)', borderBottom: '1px solid var(--border-color)' }}>
                    <th style={{ padding: '16px' }}>Sumber Dana</th>
                    <th style={{ padding: '16px' }}>Nominal (Rp)</th>
                    <th style={{ padding: '16px' }}>Instrumen Disarankan</th>
                    <th style={{ padding: '16px' }}>Tujuan</th>
                  </tr>
                </thead>
                <tbody>
                  {result.investment_allocation_plan.lumpsum_allocation.map((l: any, i: number) => (
                    <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <td style={{ padding: '16px' }}>{l.source}</td>
                      <td style={{ padding: '16px', color: 'var(--accent)' }}>{(l.amount || 0).toLocaleString('id-ID')}</td>
                      <td style={{ padding: '16px' }}><strong>{l.instrument}</strong></td>
                      <td style={{ padding: '16px' }}>{l.purpose}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div style={{ marginBottom: '40px' }}>
            <h3 style={{ marginBottom: '16px' }}>Alokasi Bulanan (Rutin)</h3>
            <div className="glass-panel" style={{ overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: 'rgba(255,255,255,0.05)', borderBottom: '1px solid var(--border-color)' }}>
                    <th style={{ padding: '16px' }}>Nominal (Rp)</th>
                    <th style={{ padding: '16px' }}>Instrumen Disarankan</th>
                    <th style={{ padding: '16px' }}>Tujuan</th>
                  </tr>
                </thead>
                <tbody>
                  {result.investment_allocation_plan.monthly_allocation.map((l: any, i: number) => (
                    <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <td style={{ padding: '16px', color: 'var(--primary)' }}>{(l.amount || 0).toLocaleString('id-ID')}</td>
                      <td style={{ padding: '16px' }}><strong>{l.instrument}</strong></td>
                      <td style={{ padding: '16px' }}>{l.purpose}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="glass-card" style={{ marginBottom: '40px', background: 'rgba(255, 78, 80, 0.05)', borderColor: 'rgba(255, 78, 80, 0.2)' }}>
            <h3 style={{ marginBottom: '16px', color: '#ff4e50' }}>Peringatan Restrukturisasi Hutang</h3>
            <p style={{ fontSize: '1.1rem', lineHeight: 1.6 }}>{result.debt_restructuring_plan}</p>
          </div>
          
          <div style={{ textAlign: 'right' }}>
            {!meta?.adminRecommendation ? (
              <div className="glass-panel" style={{ padding: '16px', background: 'rgba(249, 212, 35, 0.1)', color: 'var(--accent)', textAlign: 'center', marginBottom: '24px' }}>
                Sedang menunggu rekomendasi CFO / Admin. Mohon periksa kembali nanti.
              </div>
            ) : meta.isApproved ? (
              <button onClick={() => router.push('/dashboard/monitor')} className="btn btn-primary">Lihat Dashboard Tracking & To-Do List ➔</button>
            ) : (
              <button onClick={() => setActiveTab('review_cfo')} className="btn btn-primary">Lanjut ke Review Rekomendasi CFO ➔</button>
            )}
          </div>
        </div>
      )}

      {activeTab === 'review_cfo' && meta && (
        <div className="animate-fade-in" style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <h1 className="gradient-text" style={{ fontSize: '2.5rem', marginBottom: '16px' }}>Review & Finalisasi</h1>
            <p style={{ fontSize: '1.2rem', color: 'var(--text-muted)' }}>Pesan dan Rekomendasi Khusus dari CFO Anda.</p>
          </div>

          <div className="glass-card" style={{ marginBottom: '32px', background: 'rgba(16, 185, 129, 0.05)', borderColor: 'rgba(16, 185, 129, 0.2)' }}>
            <h3 style={{ marginBottom: '16px', color: 'var(--secondary)' }}>📩 Pesan Personal CFO</h3>
            <p style={{ lineHeight: 1.6, fontSize: '1.1rem', whiteSpace: 'pre-wrap' }}>
              {meta.cfoMessage || "Tidak ada pesan tambahan dari CFO."}
            </p>
          </div>

          <div className="glass-card" style={{ marginBottom: '40px' }}>
            <h3 style={{ marginBottom: '16px' }}>📌 Rekomendasi To-Do List</h3>
            <pre style={{ lineHeight: 1.6, fontFamily: 'inherit', whiteSpace: 'pre-wrap' }}>
              {meta.adminRecommendation || "Tidak ada rekomendasi spesifik."}
            </pre>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '24px' }}>
            <button onClick={() => setActiveTab('action_plan')} className="btn btn-outline" style={{ minWidth: '200px' }}>⬅ Kembali ke Action Plan</button>
            <button onClick={handleApprove} disabled={isApproving} className="btn btn-primary" style={{ minWidth: '250px' }}>
              {isApproving ? 'Memproses...' : '✅ Setuju & Finalisasi'}
            </button>
          </div>

        </div>
      )}

    </div>
  );
}
