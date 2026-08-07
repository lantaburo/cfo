'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer, Legend } from 'recharts';
import InputData from '../components/dashboard/InputData';
import Snapshot from '../components/dashboard/Snapshot';
import FinancialCheckup from '../components/dashboard/FinancialCheckup';

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
        setActiveTab('snapshot');
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

  // Removed renderInputStep(), it is now in InputData.tsx

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
        <button onClick={() => setActiveTab('input')} style={navButtonStyle('input')}>1. Input Data</button>
        <button onClick={() => setActiveTab('snapshot')} style={navButtonStyle('snapshot')}>2. Snapshot</button>
        <button onClick={() => setActiveTab('checkup')} style={navButtonStyle('checkup')}>3. Financial Checkup</button>
        <button onClick={() => result && setActiveTab('action_plan')} disabled={!result} style={navButtonStyle('action_plan')}>4. Action Plan</button>
        <button onClick={() => result && setActiveTab('rekomendasi')} disabled={!result} style={navButtonStyle('rekomendasi')}>5. Rekomendasi</button>
        <button onClick={() => result && setActiveTab('edit_final')} disabled={!result} style={navButtonStyle('edit_final')}>6. Finalisasi</button>
      </div>

      {activeTab === 'input' && (
        <InputData 
          step={step}
          setStep={setStep}
          basicInfo={basicInfo}
          setBasicInfo={setBasicInfo}
          assets={assets}
          setAssets={setAssets}
          debts={debts}
          setDebts={setDebts}
          expenses={expenses}
          setExpenses={setExpenses}
          goals={goals}
          setGoals={setGoals}
          formatCurrency={formatCurrency}
          isAnalyzing={isAnalyzing}
          analyzeProgress={analyzeProgress}
          handleAnalyze={handleAnalyze}
        />
      )}

      {activeTab === 'snapshot' && (
        <Snapshot 
          basicInfo={basicInfo}
          assets={assets}
          debts={debts}
          expenses={expenses}
        />
      )}

      {activeTab === 'checkup' && (
        <FinancialCheckup 
          basicInfo={basicInfo}
          assets={assets}
          debts={debts}
          expenses={expenses}
          result={result}
        />
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
