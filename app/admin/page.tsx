'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminDashboard() {
  const router = useRouter();
  const [isSuperadmin, setIsSuperadmin] = useState(false);
  
  // Settings State
  const [isLoadingSettings, setIsLoadingSettings] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [settings, setSettings] = useState({
    ai_provider: 'Gemini',
    ai_model: 'gemini-1.5-pro',
    ai_custom_url: '',
    ai_api_key: ''
  });

  // User Management State
  const [users, setUsers] = useState<any[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  
  // Recommendation State
  const [adminRecommendation, setAdminRecommendation] = useState('');
  const [cfoMessage, setCfoMessage] = useState('');
  const [isSavingMeta, setIsSavingMeta] = useState(false);

  const handleWhatsApp = (type: string, user: any) => {
    if (!user.phone) {
      alert('User ini belum mencantumkan nomor WhatsApp (User lama).');
      return;
    }
    
    let phone = user.phone.trim();
    if (phone.startsWith('0')) phone = '62' + phone.slice(1);
    
    let message = '';
    if (type === 'isi_data') {
      message = `Halo ${user.name}, kami dari tim CFO Finsight. Kami melihat Anda belum mengisi data keuangan di platform. Silakan lengkapi agar kami dapat membuat Action Plan yang tepat untuk Anda.`;
    } else if (type === 'ada_rekomendasi') {
      message = `Halo ${user.name}, kabar baik! Rekomendasi keuangan (Action Plan) Anda sudah kami siapkan. Silakan masuk ke dashboard untuk melihat dan memberikan persetujuan Anda.`;
    } else if (type === 'lainnya') {
      message = `Halo ${user.name}, ini dari tim CFO Finsight. `;
    }
    
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank');
  };

  const getTahap = (u: any) => {
    let meta = null;
    try { meta = u.meta ? JSON.parse(u.meta) : null; } catch(e){}
    
    if (meta && meta.isApproved) return 'Selesai (Tracking)';
    if (meta && meta.adminRecommendation) return 'Menunggu Persetujuan User';
    if (u.actionPlan) return '⚠️ Butuh Rekomendasi (Action Plan)';
    if (u.data) return 'Progress (Data Terisi)';
    return 'Pra Finansial Checkup';
  };

  useEffect(() => {
    const userStr = localStorage.getItem('cfo_user');
    if (!userStr) {
      router.push('/login');
      return;
    }

    try {
      const user = JSON.parse(userStr);
      const superadminEmail = process.env.NEXT_PUBLIC_SUPERADMIN_EMAIL || 'superadmin@cfo.com';
      
      if (user.email === superadminEmail) {
        setIsSuperadmin(true);
        fetchSettings();
        fetchUsers();
      } else {
        router.push('/dashboard');
      }
    } catch (e) {
      router.push('/login');
    }
  }, [router]);

  const fetchUsers = async () => {
    setIsLoadingUsers(true);
    try {
      const res = await fetch('/api/gsheets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'getUsers' })
      });
      const data = await res.json();
      if (data.status === 'success' && data.users) {
        setUsers(data.users);
      }
    } catch (e) {
      console.error("Failed to fetch users", e);
    } finally {
      setIsLoadingUsers(false);
    }
  };

  const handleToggleStatus = async (email: string, currentStatus: string) => {
    const newStatus = currentStatus === 'Active' ? 'Inactive' : 'Active';
    try {
      const res = await fetch('/api/gsheets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'updateUserStatus', email, status: newStatus })
      });
      const data = await res.json();
      if (data.status === 'success') {
        // Update local state
        setUsers(prev => prev.map(u => u.email === email ? { ...u, status: newStatus } : u));
      } else {
        alert('Gagal mengupdate status: ' + data.message);
      }
    } catch (e) {
      alert('Terjadi kesalahan jaringan saat mengupdate status.');
    }
  };

  const handleSaveAdminMeta = async () => {
    if (!selectedUser) return;
    setIsSavingMeta(true);
    try {
      const res = await fetch('/api/gsheets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'saveAdminMeta', 
          email: selectedUser.email, 
          adminRecommendation, 
          cfoMessage 
        })
      });
      const data = await res.json();
      if (data.status === 'success') {
        alert('Rekomendasi dan Pesan CFO berhasil dikirim!');
        setSelectedUser(null);
        fetchUsers(); // Refresh list to get updated meta if needed
      } else {
        alert('Gagal menyimpan: ' + data.message);
      }
    } catch (e) {
      alert('Terjadi kesalahan jaringan.');
    } finally {
      setIsSavingMeta(false);
    }
  };

  const fetchSettings = async () => {
    setIsLoadingSettings(true);
    try {
      const res = await fetch('/api/gsheets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'getSettings' })
      });
      const data = await res.json();
      if (data.status === 'success' && data.settings) {
        setSettings(prev => ({ ...prev, ...data.settings }));
      }
    } catch (e) {
      console.error("Failed to fetch settings", e);
    } finally {
      setIsLoadingSettings(false);
    }
  };

  const handleSaveSettings = async () => {
    setIsSaving(true);
    try {
      const res = await fetch('/api/gsheets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'saveSettings', settings })
      });
      const data = await res.json();
      if (data.status === 'success') {
        alert('Pengaturan berhasil disimpan!');
      } else {
        alert('Gagal menyimpan: ' + data.message);
      }
    } catch (e) {
      alert('Terjadi kesalahan jaringan.');
    } finally {
      setIsSaving(false);
    }
  };

  if (!isSuperadmin) {
    return <div className="flex-center" style={{ height: '100vh', color: 'var(--text-main)' }}>Memverifikasi akses...</div>;
  }

  return (
    <div className="container" style={{ padding: '40px 24px' }}>
      {!selectedUser ? (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
            <h2>Admin Dashboard</h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '350px 1fr', gap: '32px' }}>
        
        {/* Sidebar Settings */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          <div className="glass-card">
            <h3 style={{ marginBottom: '24px', fontSize: '1.2rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>Konfigurasi AI Provider</h3>
            
            {isLoadingSettings ? (
              <p style={{ color: 'var(--text-muted)' }}>Memuat pengaturan...</p>
            ) : (
              <>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>AI Provider</label>
                  <select 
                    value={settings.ai_provider} 
                    onChange={e => setSettings({...settings, ai_provider: e.target.value})} 
                    className="glass-panel" style={{ width: '100%', padding: '12px', color: 'var(--text-main)', outline: 'none' }}
                  >
                    <option value="Gemini">Google Gemini</option>
                    <option value="OpenAI">OpenAI (ChatGPT)</option>
                    <option value="Custom">Custom (OpenAI Compatible)</option>
                  </select>
                </div>
                
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>Model Name</label>
                  <input 
                    type="text" 
                    value={settings.ai_model} 
                    onChange={e => setSettings({...settings, ai_model: e.target.value})} 
                    placeholder="Contoh: gemini-1.5-pro atau gpt-4o"
                    className="glass-panel" style={{ width: '100%', padding: '12px', color: 'var(--text-main)', outline: 'none' }} 
                  />
                </div>

                {settings.ai_provider === 'Custom' && (
                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>Custom Base URL</label>
                    <input 
                      type="text" 
                      value={settings.ai_custom_url} 
                      onChange={e => setSettings({...settings, ai_custom_url: e.target.value})} 
                      placeholder="https://api.yourprovider.com/v1/chat/completions"
                      className="glass-panel" style={{ width: '100%', padding: '12px', color: 'var(--text-main)', outline: 'none' }} 
                    />
                  </div>
                )}

                <div style={{ marginBottom: '24px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>API Key</label>
                  <input 
                    type="password" 
                    value={settings.ai_api_key} 
                    onChange={e => setSettings({...settings, ai_api_key: e.target.value})} 
                    placeholder="sk-..."
                    className="glass-panel" style={{ width: '100%', padding: '12px', color: 'var(--text-main)', outline: 'none' }} 
                  />
                  <small style={{ color: 'var(--text-muted)', display: 'block', marginTop: '4px' }}>*Disimpan aman di Spreadsheet Anda</small>
                </div>

                <button onClick={handleSaveSettings} disabled={isSaving} className="btn btn-primary" style={{ width: '100%' }}>
                  {isSaving ? 'Menyimpan...' : 'Simpan Pengaturan AI'}
                </button>
              </>
            )}
          </div>
        </div>

        {/* Client List */}
        <div>
          <h3 style={{ marginBottom: '16px' }}>Manajemen User</h3>
          <div className="glass-panel" style={{ overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: 'rgba(0,0,0,0.02)', borderBottom: '1px solid var(--border-color)' }}>
                  <th style={{ padding: '16px' }}>Nama</th>
                  <th style={{ padding: '16px' }}>Email</th>
                  <th style={{ padding: '16px' }}>Tahap</th>
                  <th style={{ padding: '16px' }}>Status</th>
                  <th style={{ padding: '16px' }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {isLoadingUsers ? (
                  <tr><td colSpan={5} style={{ padding: '24px', textAlign: 'center' }}>Memuat pengguna...</td></tr>
                ) : users.length === 0 ? (
                  <tr><td colSpan={5} style={{ padding: '24px', textAlign: 'center' }}>Belum ada pengguna terdaftar</td></tr>
                ) : (
                  users.map((u, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '16px' }}>{u.name}</td>
                      <td style={{ padding: '16px' }}>{u.email}</td>
                      <td style={{ padding: '16px' }}>
                        <span style={{ 
                          padding: '6px 10px', 
                          borderRadius: '6px', 
                          fontSize: '0.85rem', 
                          fontWeight: getTahap(u).includes('Butuh Rekomendasi') ? 'bold' : 'normal',
                          background: getTahap(u).includes('Butuh Rekomendasi') ? 'rgba(249, 212, 35, 0.2)' : 'rgba(255,255,255,0.1)', 
                          color: getTahap(u).includes('Butuh Rekomendasi') ? 'var(--accent)' : 'inherit',
                          border: getTahap(u).includes('Butuh Rekomendasi') ? '1px solid rgba(249, 212, 35, 0.5)' : 'none'
                        }}>
                          {getTahap(u)}
                        </span>
                      </td>
                      <td style={{ padding: '16px' }}>
                        <span style={{ 
                          padding: '4px 8px', borderRadius: '12px', fontSize: '0.85rem', fontWeight: 600,
                          background: u.status === 'Active' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                          color: u.status === 'Active' ? '#10b981' : '#ef4444'
                        }}>
                          {u.status}
                        </span>
                      </td>
                      <td style={{ padding: '16px' }}>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button 
                            onClick={() => {
                              setSelectedUser(u);
                              setAdminRecommendation('');
                              setCfoMessage('');
                            }}
                            style={{ 
                              background: 'var(--primary)', 
                              border: 'none', 
                              color: 'white', 
                              padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: 500
                            }}
                          >
                            Detail
                          </button>
                          <button 
                            onClick={() => handleToggleStatus(u.email, u.status)}
                            style={{ 
                              background: 'transparent', 
                              border: `1px solid ${u.status === 'Active' ? '#ef4444' : '#10b981'}`, 
                              color: u.status === 'Active' ? '#ef4444' : '#10b981', 
                              padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: 500
                            }}
                          >
                            {u.status === 'Active' ? 'Nonaktifkan' : 'Aktifkan'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

          </div>
        </>
      ) : (
        <div className="animate-fade-in">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
            <h2>Detail Pengguna: {selectedUser.name}</h2>
            <button onClick={() => setSelectedUser(null)} className="btn btn-outline" style={{ padding: '8px 16px' }}>⬅ Kembali ke Daftar</button>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
            <div className="glass-card" style={{ padding: '24px' }}>
              <h3 style={{ marginBottom: '16px' }}>Informasi Profil</h3>
              <p><strong>Nama:</strong> {selectedUser.name}</p>
              <p><strong>Email:</strong> {selectedUser.email}</p>
              <p><strong>WhatsApp:</strong> {selectedUser.phone || <span style={{ color: 'var(--text-muted)' }}>Belum ada data</span>}</p>
              <p><strong>Tahap:</strong> {getTahap(selectedUser)}</p>
              <p><strong>Status:</strong> {selectedUser.status}</p>
              
              <div style={{ marginTop: '24px', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
                <h4 style={{ marginBottom: '12px' }}>Hubungi via WhatsApp (Klik to Chat)</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <button onClick={() => handleWhatsApp('isi_data', selectedUser)} className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', fontSize: '0.9rem', justifyContent: 'flex-start', color: '#10b981', borderColor: 'rgba(16,185,129,0.5)' }}>
                    💬 Ingatkan Isi Data Keuangan
                  </button>
                  <button onClick={() => handleWhatsApp('ada_rekomendasi', selectedUser)} className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', fontSize: '0.9rem', justifyContent: 'flex-start', color: '#6dd5ed', borderColor: 'rgba(109,213,237,0.5)' }}>
                    💬 Info Update / Ada Rekomendasi
                  </button>
                  <button onClick={() => handleWhatsApp('lainnya', selectedUser)} className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', fontSize: '0.9rem', justifyContent: 'flex-start' }}>
                    💬 Notifikasi Lainnya
                  </button>
                </div>
              </div>
            </div>
            
            <div className="glass-card" style={{ padding: '24px', background: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
              <h3 style={{ marginBottom: '16px', color: 'var(--primary)' }}>Panduan Dana Darurat</h3>
              <p style={{ marginBottom: '8px' }}>Rekomendasi alokasi dana darurat yang ideal:</p>
              <ul style={{ paddingLeft: '20px', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                <li><strong>Belum Menikah:</strong> 3-6 kali pengeluaran bulanan.</li>
                <li><strong>Menikah (Tanpa Anak):</strong> 6-9 kali pengeluaran bulanan.</li>
                <li><strong>Menikah (Dengan Anak):</strong> 9-12 kali pengeluaran bulanan.</li>
              </ul>
              {selectedUser.data && (
                <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px dashed var(--border-color)' }}>
                  <p><strong>Pengeluaran Bulanan:</strong> Rp {(() => {
                    try {
                      const data = typeof selectedUser.data === 'string' ? JSON.parse(selectedUser.data) : selectedUser.data;
                      return data.expenses.reduce((sum: any, e: any) => sum + (Number(e.amount) || 0), 0).toLocaleString('id-ID');
                    } catch(e) { return '-'; }
                  })()}</p>
                </div>
              )}
            </div>
          </div>

          <div className="glass-panel" style={{ padding: '32px', marginBottom: '32px' }}>
            {selectedUser.data && (() => {
              let data: any = {};
              try { data = typeof selectedUser.data === 'string' ? JSON.parse(selectedUser.data) : selectedUser.data; } catch(e){}
              
              const totalAssets = data.assets?.reduce((sum: number, a: any) => sum + (Number(a.value) || 0), 0) || 0;
              const totalDebts = data.debts?.reduce((sum: number, d: any) => sum + (Number(d.principal) || 0), 0) || 0;
              const networth = totalAssets - totalDebts;

              return (
                <div style={{ marginBottom: '24px' }}>
                  <h3 style={{ marginBottom: '24px', color: 'var(--primary)', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>Data Finansial Input User</h3>
                  
                  {/* Snapshot Metric */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                    <div style={{ background: 'rgba(255,255,255,0.05)', padding: '16px', borderRadius: '8px' }}>
                      <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Total Aset</div>
                      <div style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>Rp {totalAssets.toLocaleString('id-ID')}</div>
                    </div>
                    <div style={{ background: 'rgba(255,255,255,0.05)', padding: '16px', borderRadius: '8px' }}>
                      <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Total Hutang</div>
                      <div style={{ fontWeight: 'bold', fontSize: '1.2rem', color: '#ff4e50' }}>Rp {totalDebts.toLocaleString('id-ID')}</div>
                    </div>
                    <div style={{ background: 'rgba(255,255,255,0.05)', padding: '16px', borderRadius: '8px' }}>
                      <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Kekayaan Bersih</div>
                      <div style={{ fontWeight: 'bold', fontSize: '1.2rem', color: 'var(--secondary)' }}>Rp {networth.toLocaleString('id-ID')}</div>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
                    
                    {/* Basic Info */}
                    <div style={{ background: 'rgba(0,0,0,0.2)', padding: '16px', borderRadius: '8px' }}>
                      <h4 style={{ marginBottom: '12px', color: 'var(--text-main)' }}>Info Dasar</h4>
                      {data.basicInfo && Object.entries(data.basicInfo).map(([key, val]: any) => (
                        <div key={key} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', borderBottom: '1px dashed rgba(255,255,255,0.1)', paddingBottom: '4px' }}>
                          <span style={{ color: 'var(--text-muted)' }}>{key.replace(/([A-Z])/g, ' $1').replace(/^./, (str: string) => str.toUpperCase())}</span>
                          <strong>{val}</strong>
                        </div>
                      ))}
                    </div>

                    {/* Goals */}
                    <div style={{ background: 'rgba(0,0,0,0.2)', padding: '16px', borderRadius: '8px' }}>
                      <h4 style={{ marginBottom: '12px', color: 'var(--text-main)' }}>Tujuan Finansial</h4>
                      {data.goals?.map((g: any, i: number) => (
                        <div key={i} style={{ marginBottom: '12px', background: 'rgba(255,255,255,0.05)', padding: '8px', borderRadius: '4px' }}>
                          <div style={{ fontWeight: 'bold' }}>{g.name}</div>
                          <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between' }}>
                            <span>Target: Rp {Number(g.targetAmount || 0).toLocaleString('id-ID')}</span>
                            <span>{g.timeframe}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {/* Assets & Debts */}
                    <div style={{ background: 'rgba(0,0,0,0.2)', padding: '16px', borderRadius: '8px' }}>
                      <h4 style={{ marginBottom: '12px', color: 'var(--text-main)' }}>Aset Terdaftar</h4>
                      {data.assets?.map((a: any, i: number) => (
                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                          <span>{a.name} ({a.type})</span>
                          <strong>Rp {Number(a.value || 0).toLocaleString('id-ID')}</strong>
                        </div>
                      ))}
                    </div>

                    <div style={{ background: 'rgba(0,0,0,0.2)', padding: '16px', borderRadius: '8px' }}>
                      <h4 style={{ marginBottom: '12px', color: 'var(--text-main)' }}>Hutang Terdaftar</h4>
                      {data.debts?.map((d: any, i: number) => (
                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                          <span>{d.name} ({d.type})</span>
                          <strong style={{ color: '#ff4e50' }}>Rp {Number(d.principal || 0).toLocaleString('id-ID')}</strong>
                        </div>
                      ))}
                    </div>

                  </div>
                </div>
              );
            })()}
            
            {selectedUser.actionPlan && (() => {
              let plan: any = {};
              try { plan = typeof selectedUser.actionPlan === 'string' ? JSON.parse(selectedUser.actionPlan) : selectedUser.actionPlan; } catch(e){}

              return (
                <div style={{ marginBottom: '24px' }}>
                  <h3 style={{ marginBottom: '24px', color: 'var(--primary)', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', marginTop: '40px' }}>Analisis CFO AI (Action Plan)</h3>
                  
                  <div style={{ background: 'rgba(33, 147, 176, 0.1)', padding: '24px', borderRadius: '8px', marginBottom: '24px' }}>
                    <h4 style={{ marginBottom: '12px' }}>Skor Kesehatan Finansial: <span style={{ color: 'var(--secondary)' }}>{plan.financial_checkup?.current_financial_health_score}/100</span></h4>
                    <p style={{ fontSize: '1rem', lineHeight: 1.6, color: 'var(--text-muted)' }}>{plan.financial_checkup?.overall_health_summary}</p>
                  </div>

                  <div style={{ marginBottom: '24px' }}>
                    <h4 style={{ marginBottom: '12px', color: 'var(--text-main)' }}>Alokasi Rutin Bulanan</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
                      {plan.investment_allocation_plan?.monthly_allocation?.map((alloc: any, i: number) => (
                        <div key={i} style={{ background: 'rgba(255,255,255,0.05)', padding: '16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }}>
                          <div style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '4px' }}>{alloc.instrument}</div>
                          <div style={{ color: 'var(--primary)', fontWeight: 'bold', marginBottom: '8px' }}>Rp {Number(alloc.amount || 0).toLocaleString('id-ID')}</div>
                          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>Tujuan: {alloc.purpose || alloc.reason}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {plan.debt_restructuring_plan && (
                    <div style={{ background: 'rgba(255, 78, 80, 0.1)', padding: '24px', borderRadius: '8px', marginBottom: '24px', borderLeft: '4px solid #ff4e50' }}>
                      <h4 style={{ marginBottom: '12px', color: '#ff4e50' }}>Catatan Hutang</h4>
                      <p style={{ fontSize: '1rem', lineHeight: 1.6 }}>{plan.debt_restructuring_plan}</p>
                    </div>
                  )}
                </div>
              );
            })()}
            
            <div className="glass-card" style={{ padding: '32px', border: '1px solid var(--primary)', background: 'linear-gradient(to right, rgba(16, 185, 129, 0.05), rgba(33, 147, 176, 0.05))' }}>
              <h3 style={{ marginBottom: '24px', color: 'var(--primary)', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>📝 Tulis Rekomendasi & Pesan CFO</h3>
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-main)', fontWeight: 'bold' }}>Rekomendasi (To-do List Harian/Mingguan)</label>
                <textarea 
                  rows={5}
                  className="glass-panel" 
                  style={{ width: '100%', padding: '16px', outline: 'none', resize: 'vertical', fontSize: '1rem', background: 'rgba(0,0,0,0.2)' }}
                  placeholder="Contoh: 1. Buka rekening tabungan darurat. 2. Hubungi bank untuk restrukturisasi..."
                  value={adminRecommendation}
                  onChange={e => setAdminRecommendation(e.target.value)}
                />
              </div>
              <div style={{ marginBottom: '32px' }}>
                <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-main)', fontWeight: 'bold' }}>Pesan Personal CFO</label>
                <textarea 
                  rows={4}
                  className="glass-panel" 
                  style={{ width: '100%', padding: '16px', outline: 'none', resize: 'vertical', fontSize: '1rem', background: 'rgba(0,0,0,0.2)' }}
                  placeholder="Pesan motivasi atau catatan khusus dari CFO..."
                  value={cfoMessage}
                  onChange={e => setCfoMessage(e.target.value)}
                />
              </div>
              
              <button 
                className="btn btn-primary" 
                style={{ width: '100%', padding: '16px', fontSize: '1.1rem', fontWeight: 'bold' }}
                onClick={handleSaveAdminMeta}
                disabled={isSavingMeta}
              >
                {isSavingMeta ? 'Menyimpan...' : 'Kirim Rekomendasi & Pesan ke User'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
