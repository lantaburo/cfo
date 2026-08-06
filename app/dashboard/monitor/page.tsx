'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell } from 'recharts';

export default function MonitorPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState('monthly'); // 'daily' | 'weekly' | 'monthly'
  const router = useRouter();

  useEffect(() => {
    const savedUser = localStorage.getItem('cfo_user');
    if (!savedUser) {
      router.push('/login');
    } else {
      setUser(JSON.parse(savedUser));
      setLoading(false);
    }
  }, [router]);

  if (loading) return <div style={{ color: 'white', padding: '40px', textAlign: 'center' }}>Loading...</div>;

  if (!user?.actionPlan) {
    return (
      <div style={{ padding: '40px 24px', textAlign: 'center' }}>
        <h2 style={{ marginBottom: '24px' }}>Belum Ada Action Plan</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>Anda belum men-generate atau menyimpan Action Plan Anda.</p>
        <Link href="/dashboard" className="btn btn-primary" style={{ padding: '12px 24px' }}>Kembali ke Dashboard</Link>
      </div>
    );
  }

  const { investment_allocation_plan, debt_restructuring_plan } = user.actionPlan;
  const meta = user.meta || {};
  
  // Parse admin recommendations as simple to-do items by splitting lines
  const adminTodos = meta.adminRecommendation 
    ? meta.adminRecommendation.split('\n').filter((line: string) => line.trim().length > 0)
    : [];

  const chartData = investment_allocation_plan?.monthly_allocation?.map((alloc: any) => ({
    name: alloc.instrument,
    amount: alloc.amount
  })) || [];

  const COLORS = ['#2193b0', '#6dd5ed', '#f9d423', '#ff4e50', '#10b981'];

  return (
    <div style={{ padding: '40px 24px' }}>
      <div className="container" style={{ maxWidth: '1000px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
          <h2>Tracking & Monitoring</h2>
          <Link href="/dashboard" className="btn btn-outline" style={{ padding: '8px 16px' }}>⬅ Kembali</Link>
        </div>

        <div className="glass-panel" style={{ padding: '32px', marginBottom: '32px', background: 'linear-gradient(to right, rgba(16, 185, 129, 0.05), rgba(33, 147, 176, 0.05))', borderLeft: '4px solid var(--secondary)' }}>
          <h3 style={{ marginBottom: '8px', color: 'var(--primary)' }}>Fokus Anda Saat Ini</h3>
          <p style={{ lineHeight: 1.6, color: 'var(--text-muted)' }}>
            Halo <strong>{user.name}</strong>! Berikut adalah panduan harian, mingguan, dan bulanan Anda yang telah dirancang khusus oleh CFO AI dan disetujui oleh Anda pada <strong>{new Date(meta.approvedAt || Date.now()).toLocaleDateString('id-ID')}</strong>. 
          </p>
        </div>

        <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
          <button onClick={() => setActiveView('daily')} className={`btn ${activeView === 'daily' ? 'btn-primary' : 'btn-outline'}`} style={{ flex: 1 }}>Harian (To-Do)</button>
          <button onClick={() => setActiveView('weekly')} className={`btn ${activeView === 'weekly' ? 'btn-primary' : 'btn-outline'}`} style={{ flex: 1 }}>Mingguan (Review)</button>
          <button onClick={() => setActiveView('monthly')} className={`btn ${activeView === 'monthly' ? 'btn-primary' : 'btn-outline'}`} style={{ flex: 1 }}>Bulanan (Alokasi)</button>
        </div>

        {activeView === 'monthly' && (
          <div className="animate-fade-in">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px', marginBottom: '32px' }}>
              <div className="glass-card" style={{ padding: '32px' }}>
                <h3 style={{ marginBottom: '24px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
                  📈 Target Alokasi Bulan Ini
                </h3>
                {investment_allocation_plan?.monthly_allocation?.map((alloc: any, i: number) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', marginBottom: '20px', padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                    <input type="checkbox" style={{ width: '24px', height: '24px', marginTop: '4px', cursor: 'pointer', accentColor: 'var(--secondary)' }} />
                    <div>
                      <h4 style={{ fontSize: '1.2rem', marginBottom: '4px' }}>{alloc.instrument}</h4>
                      <p style={{ color: 'var(--primary)', fontWeight: 'bold', fontSize: '1.1rem', marginBottom: '8px' }}>Rp {alloc.amount.toLocaleString('id-ID')}</p>
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.5 }}><strong>Tujuan:</strong> {alloc.purpose || alloc.reason}</p>
                    </div>
                  </div>
                ))}
                {chartData.length === 0 && <p style={{ color: 'var(--text-muted)' }}>Tidak ada alokasi spesifik bulan ini.</p>}
              </div>

              <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column' }}>
                <h3 style={{ textAlign: 'center', marginBottom: '24px' }}>Visualisasi Alokasi</h3>
                <div style={{ flex: 1, minHeight: '300px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" horizontal={false} />
                      <XAxis type="number" tickFormatter={(val) => `Rp${val/1000000}M`} stroke="var(--text-muted)" fontSize={12} />
                      <YAxis dataKey="name" type="category" width={120} stroke="var(--text-muted)" fontSize={12} />
                      <RechartsTooltip formatter={(val: any) => `Rp ${Number(val).toLocaleString('id-ID')}`} contentStyle={{ background: 'var(--bg-color-light)', borderColor: 'var(--border-color)', borderRadius: '8px', color: 'var(--text-main)' }} />
                      <Bar dataKey="amount" radius={[0, 4, 4, 0]}>
                        {chartData.map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        )}

        {(activeView === 'daily' || activeView === 'weekly') && (
          <div className="animate-fade-in glass-card" style={{ padding: '32px' }}>
            <h3 style={{ marginBottom: '24px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
              {activeView === 'daily' ? '📝 Tugas Khusus & Rekomendasi CFO' : '🔍 Review Mingguan'}
            </h3>
            
            {activeView === 'daily' && (
              <>
                {adminTodos.length > 0 ? (
                  adminTodos.map((todo: string, idx: number) => (
                    <label key={idx} style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px', marginBottom: '12px', background: 'rgba(255,255,255,0.4)', borderRadius: '8px', cursor: 'pointer', border: '1px solid var(--border-color)', transition: 'background 0.2s' }}>
                      <input type="checkbox" style={{ width: '20px', height: '20px', accentColor: 'var(--primary)' }} />
                      <span style={{ fontSize: '1.05rem', color: 'var(--text-main)' }}>{todo.replace(/^[\d\-\.\*]+/, '').trim()}</span>
                    </label>
                  ))
                ) : (
                  <p style={{ color: 'var(--text-muted)' }}>Belum ada rekomendasi khusus (To-Do list) yang ditambahkan oleh CFO.</p>
                )}
                
                {debt_restructuring_plan && (
                  <div style={{ marginTop: '32px', padding: '24px', background: 'rgba(255, 78, 80, 0.05)', borderLeft: '4px solid #ff4e50', borderRadius: '4px' }}>
                    <h4 style={{ color: '#ff4e50', marginBottom: '8px' }}>Penting: Restrukturisasi Hutang</h4>
                    <p style={{ color: 'var(--text-main)' }}>{debt_restructuring_plan}</p>
                  </div>
                )}
              </>
            )}

            {activeView === 'weekly' && (
              <div style={{ color: 'var(--text-muted)' }}>
                <p style={{ marginBottom: '16px' }}>Tinjau kembali pergerakan keuangan Anda minggu ini:</p>
                <ul style={{ paddingLeft: '24px', lineHeight: 1.8 }}>
                  <li>Apakah ada pengeluaran tak terduga minggu ini?</li>
                  <li>Cek mutasi rekening, pastikan alokasi rutin sudah disisihkan.</li>
                  <li>Evaluasi rasio likuiditas Anda (Saat ini: CFO menyatakan butuh perbaikan bertahap).</li>
                </ul>
              </div>
            )}
          </div>
        )}

        <div style={{ marginTop: '40px', textAlign: 'center' }}>
          <button className="btn btn-primary" style={{ padding: '16px 40px', fontSize: '1.1rem', boxShadow: '0 4px 15px rgba(16, 185, 129, 0.3)' }} onClick={() => alert('Progress tersimpan! (Fitur Mockup Update Sheet)')}>
            Simpan Progress Checklist
          </button>
        </div>
      </div>
    </div>
  );
}
