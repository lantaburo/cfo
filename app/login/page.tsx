'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/gsheets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'login', email, password }),
      });
      
      const data = await res.json();
      
      if (data.status === 'success') {
        // Save user info to localStorage
        localStorage.setItem('cfo_user', JSON.stringify({ 
            email: data.user.email, 
            name: data.user.name,
            financialData: data.data,
            actionPlan: data.actionPlan,
            meta: data.meta
        }));
        router.push('/dashboard');
      } else {
        setError(data.message);
      }
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan jaringan.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', padding: '24px' }}>
      <div className="glass-card animate-fade-in" style={{ maxWidth: '400px', width: '100%', padding: '40px' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '24px' }}>Masuk Dashboard</h2>
        
        {error && <div style={{ background: 'rgba(255, 78, 80, 0.2)', color: '#ff4e50', padding: '12px', borderRadius: '8px', marginBottom: '16px', border: '1px solid rgba(255, 78, 80, 0.5)' }}>{error}</div>}

        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>Email / No. WA Terdaftar</label>
            <input type="text" required value={email} onChange={e => setEmail(e.target.value)} className="glass-panel" style={{ width: '100%', padding: '12px', color: 'var(--text-main)', outline: 'none' }} placeholder="Masukkan Email atau WA" />
          </div>
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>Password</label>
            <input type="password" required value={password} onChange={e => setPassword(e.target.value)} className="glass-panel" style={{ width: '100%', padding: '12px', color: 'var(--text-main)', outline: 'none' }} placeholder="Masukkan Password" />
          </div>
          <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: '100%', padding: '12px', opacity: loading ? 0.7 : 1 }}>
            {loading ? 'Memeriksa Akses...' : 'Login'}
          </button>
        </form>
        
        <div style={{ textAlign: 'center', marginTop: '24px', color: 'var(--text-muted)' }}>
          Belum punya akun? <Link href="/register" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 'bold' }}>Daftar sekarang</Link>
        </div>
      </div>
    </div>
  );
}
