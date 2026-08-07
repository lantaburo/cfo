import React from 'react';

export default function InputData({
  step,
  setStep,
  basicInfo,
  setBasicInfo,
  assets,
  setAssets,
  debts,
  setDebts,
  expenses,
  setExpenses,
  goals,
  setGoals,
  formatCurrency,
  isAnalyzing,
  analyzeProgress,
  handleAnalyze
}: any) {
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
              <div style={{ gridColumn: '1 / -1', marginTop: '16px', background: 'rgba(255,255,255,0.02)', padding: '20px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <h4 style={{ marginBottom: '16px', color: 'var(--text-main)', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '12px' }}>Rincian Pendapatan Bulanan</h4>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '20px' }}>
                  {/* SUAMI */}
                  <div style={{ background: 'rgba(0,0,0,0.1)', padding: '16px', borderRadius: '8px' }}>
                    <h5 style={{ marginBottom: '16px', color: 'var(--primary-light)' }}>Suami</h5>
                    <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>Nominal Penghasilan (Rp)</label>
                    <input type="text" placeholder="Gaji/Bawa Pulang" value={formatCurrency(basicInfo.penghasilanSuami)} onChange={e => {
                      const val = parseInt(e.target.value.replace(/[^0-9]/g, ''), 10) || 0;
                      setBasicInfo({...basicInfo, penghasilanSuami: val, penghasilanBulanan: val + (Number(basicInfo.penghasilanIstri) || 0)});
                    }} className="glass-panel" style={{ width: '100%', padding: '12px', color: 'var(--text-main)', outline: 'none', marginBottom: '16px' }} />
                    
                    <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>Sumber Penghasilan</label>
                    <select value={basicInfo.sumberSuami} onChange={e => setBasicInfo({...basicInfo, sumberSuami: e.target.value})} className="glass-panel" style={{ width: '100%', padding: '12px', color: 'var(--text-main)', outline: 'none', marginBottom: basicInfo.sumberSuami === 'Lainnya' ? '12px' : '0' }}>
                      <option>Gaji Bulanan</option>
                      <option>Keuntungan Bisnis</option>
                      <option>Freelance / Proyek</option>
                      <option>Investasi / Pasif</option>
                      <option>Lainnya</option>
                    </select>
                    {basicInfo.sumberSuami === 'Lainnya' && (
                      <input type="text" placeholder="Sebutkan sumber..." value={basicInfo.sumberSuamiLainnya} onChange={e => setBasicInfo({...basicInfo, sumberSuamiLainnya: e.target.value})} className="glass-panel" style={{ width: '100%', padding: '12px', color: 'var(--text-main)', outline: 'none', marginTop: '12px' }} />
                    )}
                  </div>

                  {/* ISTRI */}
                  <div style={{ background: 'rgba(0,0,0,0.1)', padding: '16px', borderRadius: '8px' }}>
                    <h5 style={{ marginBottom: '16px', color: 'var(--primary-light)' }}>Istri</h5>
                    <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>Nominal Penghasilan (Rp)</label>
                    <input type="text" placeholder="Gaji/Bawa Pulang" value={formatCurrency(basicInfo.penghasilanIstri)} onChange={e => {
                      const val = parseInt(e.target.value.replace(/[^0-9]/g, ''), 10) || 0;
                      setBasicInfo({...basicInfo, penghasilanIstri: val, penghasilanBulanan: (Number(basicInfo.penghasilanSuami) || 0) + val});
                    }} className="glass-panel" style={{ width: '100%', padding: '12px', color: 'var(--text-main)', outline: 'none', marginBottom: '16px' }} />
                    
                    <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>Sumber Penghasilan</label>
                    <select value={basicInfo.sumberIstri} onChange={e => setBasicInfo({...basicInfo, sumberIstri: e.target.value})} className="glass-panel" style={{ width: '100%', padding: '12px', color: 'var(--text-main)', outline: 'none', marginBottom: basicInfo.sumberIstri === 'Lainnya' ? '12px' : '0' }}>
                      <option>Tidak Ada (Ibu Rumah Tangga)</option>
                      <option>Gaji Bulanan</option>
                      <option>Keuntungan Bisnis</option>
                      <option>Freelance / Proyek</option>
                      <option>Investasi / Pasif</option>
                      <option>Lainnya</option>
                    </select>
                    {basicInfo.sumberIstri === 'Lainnya' && (
                      <input type="text" placeholder="Sebutkan sumber..." value={basicInfo.sumberIstriLainnya} onChange={e => setBasicInfo({...basicInfo, sumberIstriLainnya: e.target.value})} className="glass-panel" style={{ width: '100%', padding: '12px', color: 'var(--text-main)', outline: 'none', marginTop: '12px' }} />
                    )}
                  </div>
                </div>

                <div style={{ padding: '16px', background: 'rgba(46, 204, 113, 0.1)', borderRadius: '6px', border: '1px solid rgba(46, 204, 113, 0.2)', textAlign: 'center' }}>
                  <span style={{ color: 'var(--text-main)' }}>Total Penghasilan Bulanan Gabungan (Otomatis): </span>
                  <strong style={{ fontSize: '1.2rem', color: '#2ecc71', marginLeft: '12px' }}>Rp {formatCurrency(basicInfo.penghasilanBulanan)}</strong>
                </div>
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
            {assets.map((asset: any, i: number) => (
              <div key={asset.id} style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
                <input type="text" placeholder="Nama Aset" value={asset.name} onChange={e => { const n = [...assets]; n[i].name = e.target.value; setAssets(n); }} className="glass-panel" style={{ flex: 2, padding: '10px', color: 'var(--text-main)' }} />
                <select value={asset.type} onChange={e => { const n = [...assets]; n[i].type = e.target.value; setAssets(n); }} className="glass-panel" style={{ flex: 1, padding: '10px', color: 'var(--text-main)' }}>
                  <option>Lancar</option><option>Investasi</option><option>Guna</option>
                </select>
                <input type="text" placeholder="Nilai (Rp)" value={formatCurrency(asset.value)} onChange={e => { const n = [...assets]; n[i].value = parseInt(e.target.value.replace(/[^0-9]/g, ''), 10) || 0; setAssets(n); }} className="glass-panel" style={{ flex: 1.5, padding: '10px', color: 'var(--text-main)' }} />
                <button onClick={() => setAssets(assets.filter((a: any) => a.id !== asset.id))} style={{ background: 'transparent', border: 'none', color: '#ff4e50', cursor: 'pointer', fontSize: '1.2rem' }}>✕</button>
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

            {debts.map((debt: any, i: number) => (
              <div key={debt.id} style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '24px', background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Hutang #{i + 1}</label>
                  <button onClick={() => setDebts(debts.filter((a: any) => a.id !== debt.id))} style={{ background: 'transparent', border: 'none', color: '#ff4e50', cursor: 'pointer', fontSize: '1.2rem', padding: '0 8px' }}>✕</button>
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
              {expenses.map((exp: any, i: number) => (
                <div key={exp.id} style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
                  <input type="text" placeholder="Item" value={exp.name} onChange={e => { const n = [...expenses]; n[i].name = e.target.value; setExpenses(n); }} className="glass-panel" style={{ flex: 2, padding: '10px', color: 'var(--text-main)' }} />
                  <select value={exp.category} onChange={e => { const n = [...expenses]; n[i].category = e.target.value; setExpenses(n); }} className="glass-panel" style={{ flex: 1, padding: '10px', color: 'var(--text-main)' }}>
                    <option>Primer</option><option>Kewajiban</option><option>Sekunder</option><option>Sosial</option><option>Tabungan/Investasi</option><option>Latte Factor</option>
                  </select>
                  <input type="text" placeholder="Nominal (Rp)" value={formatCurrency(exp.amount)} onChange={e => { const n = [...expenses]; n[i].amount = parseInt(e.target.value.replace(/[^0-9]/g, ''), 10) || 0; setExpenses(n); }} className="glass-panel" style={{ flex: 1.5, padding: '10px', color: 'var(--text-main)' }} />
                  <button onClick={() => setExpenses(expenses.filter((a: any) => a.id !== exp.id))} style={{ background: 'transparent', border: 'none', color: '#ff4e50', cursor: 'pointer', fontSize: '1.2rem' }}>✕</button>
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
            
            {goals.map((goal: any, i: number) => (
              <div key={goal.id} style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '24px', background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Tujuan Keuangan #{i + 1}</label>
                  <button onClick={() => setGoals(goals.filter((a: any) => a.id !== goal.id))} style={{ background: 'transparent', border: 'none', color: '#ff4e50', cursor: 'pointer', fontSize: '1.2rem', padding: '0 8px' }}>✕</button>
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

  return (
    <div className="glass-card animate-fade-in" style={{ maxWidth: '900px', margin: '0 auto' }}>
      <div style={{ display: 'flex', gap: '8px', marginBottom: '32px' }}>
        {[1,2,3,4,5].map(s => (
          <div key={s} style={{ height: '4px', flex: 1, background: s <= step ? 'var(--primary)' : 'rgba(255,255,255,0.1)', borderRadius: '2px', transition: '0.3s' }} />
        ))}
      </div>
      {renderInputStep()}
    </div>
  );
}
