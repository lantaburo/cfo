import React from 'react';

export default function FinancialCheckup({ basicInfo, assets, debts, expenses, result }: any) {
  const formatPercentage = (val: number) => `${val.toFixed(1)}%`;
  const formatNumber = (val: number) => val.toFixed(2);

  // Asset Totals
  const totalAsetLancar = assets.filter((a: any) => a.type === 'Lancar').reduce((sum: number, a: any) => sum + a.value, 0);
  const totalAsetInvestasi = assets.filter((a: any) => a.type === 'Investasi').reduce((sum: number, a: any) => sum + a.value, 0);
  const totalAssets = assets.reduce((sum: number, a: any) => sum + a.value, 0);

  // Debt Totals
  const totalDebts = debts.reduce((sum: number, d: any) => sum + d.principal, 0);
  const totalCicilan = debts.reduce((sum: number, d: any) => sum + d.monthlyInstallment, 0);
  const netWorth = totalAssets - totalDebts;

  // Expense Totals
  const totalPengeluaran = expenses.reduce((sum: number, e: any) => sum + e.amount, 0);
  const savingInvestasi = basicInfo.penghasilanBulanan - totalPengeluaran;

  // Ratios
  const liquidityRatio = totalAsetLancar / (totalPengeluaran || 1);
  const liquidAssetToNW = (totalAsetLancar / (netWorth || 1)) * 100;
  const netInvToNW = (totalAsetInvestasi / (netWorth || 1)) * 100;
  const debtToAsset = (totalDebts / (totalAssets || 1)) * 100;
  const solvencyRatio = (netWorth / (totalAssets || 1)) * 100;
  const debtServiceRatio = (totalCicilan / (basicInfo.penghasilanBulanan || 1)) * 100;
  const savingRatio = (savingInvestasi / (basicInfo.penghasilanBulanan || 1)) * 100;

  const ratios = [
    {
      name: 'Liquidity Ratio',
      score: formatNumber(liquidityRatio),
      condition: liquidityRatio >= 6 ? 'Good' : 'Poorly',
      guideline: '6', // Generally 3-6 months, PDF says 6
      conditionColor: liquidityRatio >= 6 ? '#2ecc71' : '#e74c3c'
    },
    {
      name: 'Liquid Asset To Net Worth Ratio',
      score: formatPercentage(liquidAssetToNW),
      condition: liquidAssetToNW >= 15 ? 'Good' : 'Poorly',
      guideline: '15%-20%',
      conditionColor: liquidAssetToNW >= 15 ? '#2ecc71' : '#e74c3c'
    },
    {
      name: 'Net Investment Asset To Net Worth Ratio',
      score: formatPercentage(netInvToNW),
      condition: netInvToNW > 50 ? 'Good' : 'Poorly',
      guideline: '> 50%',
      conditionColor: netInvToNW > 50 ? '#2ecc71' : '#e74c3c'
    },
    {
      name: 'Debt To Asset Ratio',
      score: formatPercentage(debtToAsset),
      condition: debtToAsset < 50 ? 'Good' : 'Poorly',
      guideline: '< 50%',
      conditionColor: debtToAsset < 50 ? '#2ecc71' : '#e74c3c'
    },
    {
      name: 'Solvency Ratio',
      score: formatPercentage(solvencyRatio),
      condition: solvencyRatio > 35 ? 'Good' : 'Poorly',
      guideline: '> 35%',
      conditionColor: solvencyRatio > 35 ? '#2ecc71' : '#e74c3c'
    },
    {
      name: 'Debt Service Ratio',
      score: formatPercentage(debtServiceRatio),
      condition: debtServiceRatio < 30 ? 'Good' : 'Poorly',
      guideline: '< 30%',
      conditionColor: debtServiceRatio < 30 ? '#2ecc71' : '#e74c3c'
    },
    {
      name: 'Saving Ratio',
      score: formatPercentage(savingRatio),
      condition: savingRatio > 10 ? 'Good' : 'Poorly',
      guideline: '> 10%',
      conditionColor: savingRatio > 10 ? '#2ecc71' : '#e74c3c'
    }
  ];

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '40px' }}>
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1 className="gradient-text" style={{ fontSize: '2.2rem', marginBottom: '8px' }}>Financial Check Up</h1>
        <p style={{ color: 'var(--text-muted)' }}>How healthy are your finances?</p>
      </div>

      {/* 1. FINANCIAL RATIO Table */}
      <div style={{ maxWidth: '900px', margin: '0 auto 40px auto', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '32px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ background: 'var(--primary)', color: 'white', padding: '16px', textAlign: 'left', borderRadius: '8px 0 0 0' }}>FINANCIAL RATIO</th>
              <th style={{ background: 'var(--primary)', color: 'white', padding: '16px', textAlign: 'center' }}>SCORE</th>
              <th style={{ background: 'var(--primary)', color: 'white', padding: '16px', textAlign: 'center' }}>CONDITION</th>
              <th style={{ background: 'var(--primary)', color: 'white', padding: '16px', textAlign: 'center', borderRadius: '0 8px 0 0' }}>GUIDE LINE</th>
            </tr>
          </thead>
          <tbody>
            {ratios.map((r, i) => (
              <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                <td style={{ padding: '16px', fontWeight: 'bold' }}>{r.name}</td>
                <td style={{ padding: '16px', textAlign: 'center' }}>{r.score}</td>
                <td style={{ padding: '16px', textAlign: 'center', color: r.conditionColor, fontWeight: 'bold' }}>{r.condition}</td>
                <td style={{ padding: '16px', textAlign: 'center' }}>{r.guideline}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 2. Resume Before FP */}
      <div style={{ maxWidth: '900px', margin: '0 auto', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '32px' }}>
        <h3 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', marginBottom: '16px' }}>Resume Before FP (Financial Planning)</h3>
        {result?.financial_checkup?.overall_health_summary ? (
          <p style={{ lineHeight: 1.6, color: 'var(--text-muted)', whiteSpace: 'pre-wrap' }}>{result.financial_checkup.overall_health_summary}</p>
        ) : (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
            <p>Silakan klik tombol "Generate Bookplan AI" di tab Input Data untuk mendapatkan Resume AI secara otomatis, atau Anda dapat menganalisis hasil rasio di atas secara mandiri.</p>
          </div>
        )}
      </div>
    </div>
  );
}
