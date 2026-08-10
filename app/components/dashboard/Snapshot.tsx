import React, { useState } from 'react';
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer, Legend } from 'recharts';

const COLORS = ['#F9D423', '#2193b0', '#6dd5ed', '#ff4e50', '#2ecc71', '#9b59b6'];

export default function Snapshot({ basicInfo, assets, debts, expenses }: any) {
  const [activeSubTab, setActiveSubTab] = useState('snapshot');

  const formatCurrency = (val: number | string) => {
    if (val === undefined || val === null || val === '') return '';
    const numStr = val.toString().replace(/[^0-9-]/g, '');
    const num = parseInt(numStr, 10);
    if (isNaN(num)) return '';
    if (num < 0) return `(${Math.abs(num).toLocaleString('id-ID')})`;
    return num.toLocaleString('id-ID');
  };

  // Asset Totals
  const totalAsetLancar = assets.filter((a: any) => a.type === 'Lancar').reduce((sum: number, a: any) => sum + a.value, 0);
  const totalAsetInvestasi = assets.filter((a: any) => a.type === 'Investasi').reduce((sum: number, a: any) => sum + a.value, 0);
  const totalAsetGuna = assets.filter((a: any) => a.type === 'Guna').reduce((sum: number, a: any) => sum + a.value, 0);
  const totalAssets = totalAsetLancar + totalAsetInvestasi + totalAsetGuna;

  // Debt Totals
  const totalDebts = debts.reduce((sum: number, d: any) => sum + d.principal, 0);
  const netWorth = totalAssets - totalDebts;

  // Expense Totals
  const totalPrimer = expenses.filter((e: any) => e.category === 'Primer').reduce((sum: number, e: any) => sum + e.amount, 0);
  const totalKewajibanExpenses = expenses.filter((e: any) => e.category === 'Kewajiban').reduce((sum: number, e: any) => sum + e.amount, 0);
  const totalDebtInstallments = debts.reduce((sum: number, d: any) => sum + d.monthlyInstallment, 0);
  const totalKewajiban = totalKewajibanExpenses + totalDebtInstallments;
  
  const totalSekunder = expenses.filter((e: any) => e.category === 'Sekunder').reduce((sum: number, e: any) => sum + e.amount, 0);
  const totalSosial = expenses.filter((e: any) => e.category === 'Sosial').reduce((sum: number, e: any) => sum + e.amount, 0);
  const totalTabunganInvestasi = expenses.filter((e: any) => e.category === 'Tabungan/Investasi').reduce((sum: number, e: any) => sum + e.amount, 0);
  const totalLatteFactor = expenses.filter((e: any) => e.category === 'Latte Factor').reduce((sum: number, e: any) => sum + e.amount, 0);
  
  const totalPengeluaran = totalPrimer + totalKewajiban + totalSekunder + totalSosial + totalTabunganInvestasi + totalLatteFactor;
  const disposableIncome = basicInfo.penghasilanBulanan - totalPengeluaran;

  // Chart Data
  const assetData = [
    { name: 'Aset Lancar', value: totalAsetLancar },
    { name: 'Aset Investasi', value: totalAsetInvestasi },
    { name: 'Aset Guna', value: totalAsetGuna },
  ].filter(d => d.value > 0);

  const netWorthData = [
    { name: 'Total Kekayaan Bersih', value: netWorth },
    { name: 'Total Hutang', value: totalDebts },
  ].filter(d => d.value > 0);

  const cashFlowData = [
    { name: 'Primer', value: totalPrimer },
    { name: 'Kewajiban', value: totalKewajiban },
    { name: 'Sekunder', value: totalSekunder },
    { name: 'Sosial', value: totalSosial },
    { name: 'Tabungan/Investasi', value: totalTabunganInvestasi },
    { name: 'Latte Factor', value: totalLatteFactor },
    { name: 'Disposable Income', value: disposableIncome > 0 ? disposableIncome : 0 },
  ].filter(d => d.value > 0);

  const navButtonStyle = (tabName: string) => ({
    background: 'transparent', 
    border: 'none', 
    color: activeSubTab === tabName ? 'var(--primary)' : 'var(--text-muted)', 
    fontSize: '1rem', 
    fontWeight: 600, 
    cursor: 'pointer',
    padding: '8px 16px',
    borderBottom: activeSubTab === tabName ? '2px solid var(--primary)' : '2px solid transparent'
  });

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '40px' }}>
      
      {/* Sub Tabs */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '24px', marginBottom: '32px', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
        <button onClick={() => setActiveSubTab('snapshot')} style={navButtonStyle('snapshot')}>A Snapshot</button>
        <button onClick={() => setActiveSubTab('networth')} style={navButtonStyle('networth')}>Net Worth (Before FP)</button>
        <button onClick={() => setActiveSubTab('cashflow')} style={navButtonStyle('cashflow')}>Cash Flow (Before FP)</button>
      </div>

      {activeSubTab === 'snapshot' && (
        <div className="animate-fade-in">
          {/* 1. A Snapshot */}
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <h1 className="gradient-text" style={{ fontSize: '2.2rem', marginBottom: '8px' }}>A Snapshot</h1>
            <p style={{ color: 'var(--text-muted)' }}>This is where you stand today: the starting line for your Action Program</p>
          </div>

          <div style={{ maxWidth: '800px', margin: '0 auto', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '32px', marginBottom: '40px' }}>
            <table style={{ width: '100%', marginBottom: '24px', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th colSpan={2} style={{ background: 'var(--primary)', color: 'white', padding: '12px', textAlign: 'center', borderRadius: '8px 8px 0 0' }}>INFORMASI DASAR</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '12px' }}>Usia</td>
                  <td style={{ padding: '12px', textAlign: 'right' }}>{basicInfo.usiaSuami} & {basicInfo.usiaIstri}</td>
                </tr>
                <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '12px' }}>Status</td>
                  <td style={{ padding: '12px', textAlign: 'right' }}>{basicInfo.status}</td>
                </tr>
                <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '12px' }}>Tanggungan</td>
                  <td style={{ padding: '12px', textAlign: 'right' }}>
                    {basicInfo.tanggungan && basicInfo.tanggungan.length > 0 
                      ? basicInfo.tanggungan.map((t: any) => `${t.hubungan || 'Tanggungan'} (${t.umur || 0} th)`).join(', ')
                      : 'Tidak ada'}
                  </td>
                </tr>
                <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '12px' }}>Penghasilan tahunan</td>
                  <td style={{ padding: '12px', textAlign: 'right' }}>Rp {formatCurrency((basicInfo.penghasilanBulanan * 12) + basicInfo.bonusTahunan)}</td>
                </tr>
                <tr>
                  <td style={{ padding: '12px' }}>Penghasilan bulanan</td>
                  <td style={{ padding: '12px', textAlign: 'right' }}>Rp {formatCurrency(basicInfo.penghasilanBulanan)}</td>
                </tr>
              </tbody>
            </table>

            <table style={{ width: '100%', marginBottom: '24px', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th colSpan={2} style={{ background: 'var(--primary)', color: 'white', padding: '12px', textAlign: 'center', borderRadius: '8px 8px 0 0' }}>ASET</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '12px' }}>Aset lancar</td>
                  <td style={{ padding: '12px', textAlign: 'right' }}>Rp {formatCurrency(totalAsetLancar)}</td>
                </tr>
                <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '12px' }}>Aset investasi</td>
                  <td style={{ padding: '12px', textAlign: 'right' }}>Rp {formatCurrency(totalAsetInvestasi)}</td>
                </tr>
                <tr>
                  <td style={{ padding: '12px' }}>Aset guna</td>
                  <td style={{ padding: '12px', textAlign: 'right' }}>Rp {formatCurrency(totalAsetGuna)}</td>
                </tr>
              </tbody>
            </table>

            <table style={{ width: '100%', marginBottom: '32px', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th colSpan={2} style={{ background: 'var(--primary)', color: 'white', padding: '12px', textAlign: 'center', borderRadius: '8px 8px 0 0' }}>HUTANG</th>
                </tr>
              </thead>
              <tbody>
                {debts.map((d: any) => (
                  <tr key={d.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '12px' }}>{d.name}</td>
                    <td style={{ padding: '12px', textAlign: 'right' }}>Rp {formatCurrency(d.principal)}</td>
                  </tr>
                ))}
                {debts.length === 0 && <tr><td colSpan={2} style={{ padding: '12px', textAlign: 'center', fontStyle: 'italic', color: 'var(--text-muted)' }}>Tidak ada hutang</td></tr>}
              </tbody>
            </table>

            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th colSpan={5} style={{ background: 'var(--primary)', color: 'white', padding: '12px', textAlign: 'center', borderRadius: '8px 8px 0 0' }}>THE BIG PICTURE</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ fontWeight: 'bold' }}>
                  <td style={{ padding: '16px', textAlign: 'center' }}>Total Aset<br/><span style={{ color: '#2193b0' }}>Rp {formatCurrency(totalAssets)}</span></td>
                  <td style={{ padding: '16px', textAlign: 'center', fontSize: '1.5rem' }}>-</td>
                  <td style={{ padding: '16px', textAlign: 'center' }}>Total Hutang<br/><span style={{ color: '#ff4e50' }}>Rp {formatCurrency(totalDebts)}</span></td>
                  <td style={{ padding: '16px', textAlign: 'center', fontSize: '1.5rem' }}>=</td>
                  <td style={{ padding: '16px', textAlign: 'center' }}>Kekayaan Bersih<br/><span style={{ color: 'var(--accent)' }}>Rp {formatCurrency(netWorth)}</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeSubTab === 'networth' && (
        <div className="animate-fade-in">
          {/* 2. NET WORTH Details */}
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <h2 style={{ fontSize: '1.8rem', marginBottom: '8px' }}>NET WORTH (Sebelum FP)</h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px', marginBottom: '40px' }}>
            {/* Detail Tables */}
            <div>
              {/* Aset Lancar */}
              <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '24px' }}>
                <thead>
                  <tr style={{ background: 'var(--primary)', color: 'white' }}>
                    <th style={{ padding: '8px', textAlign: 'left' }}>Aset Lancar</th>
                    <th style={{ padding: '8px', textAlign: 'right' }}>Nilai</th>
                  </tr>
                </thead>
                <tbody>
                  {assets.filter((a: any) => a.type === 'Lancar').map((a: any) => (
                    <tr key={a.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                      <td style={{ padding: '8px' }}>{a.name}</td>
                      <td style={{ padding: '8px', textAlign: 'right' }}>Rp {formatCurrency(a.value)}</td>
                    </tr>
                  ))}
                  <tr style={{ fontWeight: 'bold', background: 'rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '8px' }}>Total Aset Lancar</td>
                    <td style={{ padding: '8px', textAlign: 'right' }}>Rp {formatCurrency(totalAsetLancar)}</td>
                  </tr>
                </tbody>
              </table>

              {/* Aset Investasi */}
              <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '24px' }}>
                <thead>
                  <tr style={{ background: 'var(--primary)', color: 'white' }}>
                    <th style={{ padding: '8px', textAlign: 'left' }}>Aset Investasi</th>
                    <th style={{ padding: '8px', textAlign: 'right' }}>Nilai</th>
                  </tr>
                </thead>
                <tbody>
                  {assets.filter((a: any) => a.type === 'Investasi').map((a: any) => (
                    <tr key={a.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                      <td style={{ padding: '8px' }}>{a.name}</td>
                      <td style={{ padding: '8px', textAlign: 'right' }}>Rp {formatCurrency(a.value)}</td>
                    </tr>
                  ))}
                  <tr style={{ fontWeight: 'bold', background: 'rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '8px' }}>Total Aset Investasi</td>
                    <td style={{ padding: '8px', textAlign: 'right' }}>Rp {formatCurrency(totalAsetInvestasi)}</td>
                  </tr>
                </tbody>
              </table>

              {/* Aset Guna */}
              <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '24px' }}>
                <thead>
                  <tr style={{ background: 'var(--primary)', color: 'white' }}>
                    <th style={{ padding: '8px', textAlign: 'left' }}>Aset Guna</th>
                    <th style={{ padding: '8px', textAlign: 'right' }}>Nilai</th>
                  </tr>
                </thead>
                <tbody>
                  {assets.filter((a: any) => a.type === 'Guna').map((a: any) => (
                    <tr key={a.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                      <td style={{ padding: '8px' }}>{a.name}</td>
                      <td style={{ padding: '8px', textAlign: 'right' }}>Rp {formatCurrency(a.value)}</td>
                    </tr>
                  ))}
                  <tr style={{ fontWeight: 'bold', background: 'rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '8px' }}>Total Aset Guna</td>
                    <td style={{ padding: '8px', textAlign: 'right' }}>Rp {formatCurrency(totalAsetGuna)}</td>
                  </tr>
                </tbody>
              </table>
              
              {/* Summary */}
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', borderTop: '2px solid var(--primary)', fontWeight: 'bold' }}>
                <span>TOTAL ASET</span>
                <span>Rp {formatCurrency(totalAssets)}</span>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', borderTop: '2px solid var(--primary)', fontWeight: 'bold', marginTop: '16px' }}>
                <span>TOTAL HUTANG</span>
                <span>Rp {formatCurrency(totalDebts)}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '16px', background: 'var(--primary)', color: 'white', fontWeight: 'bold', marginTop: '16px', borderRadius: '8px' }}>
                <span>TOTAL NETWORTH</span>
                <span>Rp {formatCurrency(netWorth)}</span>
              </div>
            </div>

            {/* Charts */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '40px', justifyContent: 'center' }}>
              <div>
                <h4 style={{ textAlign: 'center', marginBottom: '16px' }}>ASET</h4>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie data={assetData} cx="50%" cy="50%" outerRadius={100} label={({ name, percent }) => `${((percent || 0) * 100).toFixed(0)}%`} labelLine={false} dataKey="value">
                      {assetData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                    </Pie>
                    <RechartsTooltip formatter={(value) => `Rp ${formatCurrency(value as number)}`} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div>
                <h4 style={{ textAlign: 'center', marginBottom: '16px' }}>NETWORTH</h4>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie data={netWorthData} cx="50%" cy="50%" outerRadius={100} label={({ name, percent }) => `${((percent || 0) * 100).toFixed(0)}%`} labelLine={false} dataKey="value">
                      {netWorthData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.name === 'Total Hutang' ? '#ff4e50' : '#3498db'} />)}
                    </Pie>
                    <RechartsTooltip formatter={(value) => `Rp ${formatCurrency(value as number)}`} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeSubTab === 'cashflow' && (
        <div className="animate-fade-in">
          {/* 3. CASH FLOW */}
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <h2 style={{ fontSize: '1.8rem', marginBottom: '8px' }}>CASH FLOW (Sebelum FP)</h2>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
            <div>
              {/* PENGHASILAN */}
              <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '24px' }}>
                <thead>
                  <tr style={{ background: 'var(--primary)', color: 'white' }}>
                    <th style={{ padding: '8px', textAlign: 'left' }}>PENGHASILAN</th>
                    <th style={{ padding: '8px', textAlign: 'right' }}>Bulanan</th>
                    <th style={{ padding: '8px', textAlign: 'right' }}>Tahunan</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                    <td style={{ padding: '8px' }}>Gaji Pokok / Usaha</td>
                    <td style={{ padding: '8px', textAlign: 'right' }}>Rp {formatCurrency(basicInfo.penghasilanBulanan)}</td>
                    <td style={{ padding: '8px', textAlign: 'right' }}>Rp {formatCurrency(basicInfo.penghasilanBulanan * 12)}</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                    <td style={{ padding: '8px' }}>Bonus / THR</td>
                    <td style={{ padding: '8px', textAlign: 'right' }}>-</td>
                    <td style={{ padding: '8px', textAlign: 'right' }}>Rp {formatCurrency(basicInfo.bonusTahunan)}</td>
                  </tr>
                  <tr style={{ fontWeight: 'bold', background: 'rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '8px' }}>Total Penghasilan</td>
                    <td style={{ padding: '8px', textAlign: 'right' }}>Rp {formatCurrency(basicInfo.penghasilanBulanan)}</td>
                    <td style={{ padding: '8px', textAlign: 'right' }}>Rp {formatCurrency((basicInfo.penghasilanBulanan * 12) + basicInfo.bonusTahunan)}</td>
                  </tr>
                </tbody>
              </table>

              {/* PENGELUARAN PRIMER */}
              <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '24px' }}>
                <thead>
                  <tr style={{ background: 'var(--primary)', color: 'white' }}>
                    <th style={{ padding: '8px', textAlign: 'left' }}>PENGELUARAN Primer</th>
                    <th style={{ padding: '8px', textAlign: 'right' }}>Bulanan</th>
                  </tr>
                </thead>
                <tbody>
                  {expenses.filter((e: any) => e.category === 'Primer').map((e: any) => (
                    <tr key={e.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                      <td style={{ padding: '8px' }}>{e.name}</td>
                      <td style={{ padding: '8px', textAlign: 'right' }}>Rp {formatCurrency(e.amount)}</td>
                    </tr>
                  ))}
                  <tr style={{ fontWeight: 'bold', background: 'rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '8px' }}>Total Pengeluaran Primer</td>
                    <td style={{ padding: '8px', textAlign: 'right' }}>Rp {formatCurrency(totalPrimer)}</td>
                  </tr>
                </tbody>
              </table>

              {/* KEWAJIBAN */}
              <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '24px' }}>
                <thead>
                  <tr style={{ background: 'var(--primary)', color: 'white' }}>
                    <th style={{ padding: '8px', textAlign: 'left' }}>Kewajiban (Pengeluaran & Cicilan)</th>
                    <th style={{ padding: '8px', textAlign: 'right' }}>Bulanan</th>
                  </tr>
                </thead>
                <tbody>
                  {debts.map((d: any) => (
                    <tr key={`debt-${d.id}`} style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                      <td style={{ padding: '8px' }}>Cicilan: {d.name}</td>
                      <td style={{ padding: '8px', textAlign: 'right' }}>Rp {formatCurrency(d.monthlyInstallment)}</td>
                    </tr>
                  ))}
                  {expenses.filter((e: any) => e.category === 'Kewajiban').map((e: any) => (
                    <tr key={e.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                      <td style={{ padding: '8px' }}>{e.name}</td>
                      <td style={{ padding: '8px', textAlign: 'right' }}>Rp {formatCurrency(e.amount)}</td>
                    </tr>
                  ))}
                  <tr style={{ fontWeight: 'bold', background: 'rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '8px' }}>Total Kewajiban</td>
                    <td style={{ padding: '8px', textAlign: 'right' }}>Rp {formatCurrency(totalKewajiban)}</td>
                  </tr>
                </tbody>
              </table>

              {/* SEKUNDER */}
              <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '24px' }}>
                <thead>
                  <tr style={{ background: 'var(--primary)', color: 'white' }}>
                    <th style={{ padding: '8px', textAlign: 'left' }}>Sekunder</th>
                    <th style={{ padding: '8px', textAlign: 'right' }}>Bulanan</th>
                  </tr>
                </thead>
                <tbody>
                  {expenses.filter((e: any) => e.category === 'Sekunder').map((e: any) => (
                    <tr key={e.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                      <td style={{ padding: '8px' }}>{e.name}</td>
                      <td style={{ padding: '8px', textAlign: 'right' }}>Rp {formatCurrency(e.amount)}</td>
                    </tr>
                  ))}
                  <tr style={{ fontWeight: 'bold', background: 'rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '8px' }}>Total Pengeluaran Sekunder</td>
                    <td style={{ padding: '8px', textAlign: 'right' }}>Rp {formatCurrency(totalSekunder)}</td>
                  </tr>
                </tbody>
              </table>

              {/* SOSIAL */}
              <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '24px' }}>
                <thead>
                  <tr style={{ background: 'var(--primary)', color: 'white' }}>
                    <th style={{ padding: '8px', textAlign: 'left' }}>Sosial</th>
                    <th style={{ padding: '8px', textAlign: 'right' }}>Bulanan</th>
                  </tr>
                </thead>
                <tbody>
                  {expenses.filter((e: any) => e.category === 'Sosial').map((e: any) => (
                    <tr key={e.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                      <td style={{ padding: '8px' }}>{e.name}</td>
                      <td style={{ padding: '8px', textAlign: 'right' }}>Rp {formatCurrency(e.amount)}</td>
                    </tr>
                  ))}
                  <tr style={{ fontWeight: 'bold', background: 'rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '8px' }}>Total Pengeluaran Sosial</td>
                    <td style={{ padding: '8px', textAlign: 'right' }}>Rp {formatCurrency(totalSosial)}</td>
                  </tr>
                </tbody>
              </table>

              {/* LATTE FACTOR */}
              <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '24px' }}>
                <thead>
                  <tr style={{ background: 'var(--primary)', color: 'white' }}>
                    <th style={{ padding: '8px', textAlign: 'left' }}>Latte Factor</th>
                    <th style={{ padding: '8px', textAlign: 'right' }}>Bulanan</th>
                  </tr>
                </thead>
                <tbody>
                  {expenses.filter((e: any) => e.category === 'Latte Factor').map((e: any) => (
                    <tr key={e.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                      <td style={{ padding: '8px' }}>{e.name}</td>
                      <td style={{ padding: '8px', textAlign: 'right' }}>Rp {formatCurrency(e.amount)}</td>
                    </tr>
                  ))}
                  <tr style={{ fontWeight: 'bold', background: 'rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '8px' }}>Total Latte Factor</td>
                    <td style={{ padding: '8px', textAlign: 'right' }}>Rp {formatCurrency(totalLatteFactor)}</td>
                  </tr>
                </tbody>
              </table>

              {/* TABUNGAN/INVESTASI */}
              <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '24px' }}>
                <thead>
                  <tr style={{ background: 'var(--primary)', color: 'white' }}>
                    <th style={{ padding: '8px', textAlign: 'left' }}>Tabungan & Investasi</th>
                    <th style={{ padding: '8px', textAlign: 'right' }}>Bulanan</th>
                  </tr>
                </thead>
                <tbody>
                  {expenses.filter((e: any) => e.category === 'Tabungan/Investasi').map((e: any) => (
                    <tr key={e.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                      <td style={{ padding: '8px' }}>{e.name}</td>
                      <td style={{ padding: '8px', textAlign: 'right' }}>Rp {formatCurrency(e.amount)}</td>
                    </tr>
                  ))}
                  <tr style={{ fontWeight: 'bold', background: 'rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '8px' }}>Total Tabungan/Investasi</td>
                    <td style={{ padding: '8px', textAlign: 'right' }}>Rp {formatCurrency(totalTabunganInvestasi)}</td>
                  </tr>
                </tbody>
              </table>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '16px', background: 'rgba(255,255,255,0.1)', color: 'var(--text-main)', fontWeight: 'bold', borderRadius: '8px', marginBottom: '16px', border: '1px solid var(--border-color)' }}>
                <span>TOTAL PENGELUARAN</span>
                <span style={{ color: 'var(--accent)' }}>Rp {formatCurrency(totalPengeluaran)}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '16px', background: 'var(--primary)', color: 'white', fontWeight: 'bold', borderRadius: '8px' }}>
                <span>DISPOSABLE INCOME (Sisa Belum Dialokasikan)</span>
                <span>Rp {formatCurrency(disposableIncome)}</span>
              </div>
            </div>

            {/* CASH FLOW Chart */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '40px', justifyContent: 'flex-start', paddingTop: '40px' }}>
              <div>
                <h4 style={{ textAlign: 'center', marginBottom: '16px' }}>CASH FLOW</h4>
                <ResponsiveContainer width="100%" height={350}>
                  <PieChart>
                    <Pie data={cashFlowData} cx="50%" cy="50%" outerRadius={120} label={({ name, percent }) => `${((percent || 0) * 100).toFixed(0)}%`} labelLine={false} dataKey="value">
                      {cashFlowData.map((entry, index) => {
                        let color = COLORS[index % COLORS.length];
                        if (entry.name === 'Kewajiban') color = '#ff4e50';
                        if (entry.name === 'Tabungan/Investasi') color = '#2ecc71';
                        return <Cell key={`cell-${index}`} fill={color} />;
                      })}
                    </Pie>
                    <RechartsTooltip formatter={(value) => `Rp ${formatCurrency(value as number)}`} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
