'use client';
import { useState } from 'react';
import Link from 'next/link';

export default function Register() {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    try {
      const res = await fetch('/api/gsheets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'register', email, name, phone, password }),
      });

      const data = await res.json();
      
      if (data.status === 'success') {
        setMessage(data.message);
        setEmail('');
        setName('');
        setPhone('');
        setPassword('');
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
        <h2 style={{ textAlign: 'center', marginBottom: '24px' }}>Daftar Akun</h2>
        
        {message && <div style={{ background: 'rgba(33, 147, 176, 0.2)', color: '#6dd5ed', padding: '16px', borderRadius: '8px', marginBottom: '24px', lineHeight: 1.5, border: '1px solid rgba(33, 147, 176, 0.5)' }}>{message}</div>}
        {error && <div style={{ background: 'rgba(255, 78, 80, 0.2)', color: '#ff4e50', padding: '12px', borderRadius: '8px', marginBottom: '16px', border: '1px solid rgba(255, 78, 80, 0.5)' }}>{error}</div>}

        <form onSubmit={handleRegister}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>Nama Lengkap</label>
            <input type="text" required value={name} onChange={e => setName(e.target.value)} className="glass-panel" style={{ width: '100%', padding: '12px', color: 'var(--text-main)', outline: 'none' }} placeholder="Fulan bin Fulan" />
          </div>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>Email (Login ID)</label>
            <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="glass-panel" style={{ width: '100%', padding: '12px', color: 'var(--text-main)', outline: 'none' }} placeholder="fulan@example.com" />
          </div>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>No. WhatsApp</label>
            <input type="text" required value={phone} onChange={e => setPhone(e.target.value)} className="glass-panel" style={{ width: '100%', padding: '12px', color: 'var(--text-main)', outline: 'none' }} placeholder="0812xxxxxx" />
          </div>
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>Password</label>
            <input type="password" required value={password} onChange={e => setPassword(e.target.value)} className="glass-panel" style={{ width: '100%', padding: '12px', color: 'var(--text-main)', outline: 'none' }} placeholder="Masukkan Password" />
          </div>
          <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: '100%', padding: '12px', opacity: loading ? 0.7 : 1 }}>
            {loading ? 'Mendaftar...' : 'Daftar Sekarang'}
          </button>
        </form>
        
        <div style={{ textAlign: 'center', marginTop: '24px', color: 'var(--text-muted)' }}>
          Sudah punya akun? <Link href="/login" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 'bold' }}>Login di sini</Link>
        </div>
      </div>
    </div>
  );
}
