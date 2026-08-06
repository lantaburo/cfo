'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [isClient, setIsClient] = useState(false);
  const [isSuperadmin, setIsSuperadmin] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
    const userStr = localStorage.getItem('cfo_user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        const superadminEmail = process.env.NEXT_PUBLIC_SUPERADMIN_EMAIL || 'superadmin@cfo.com';
        if (user.email === superadminEmail) {
          setIsSuperadmin(true);
        }
      } catch(e) {}
    }
  }, [pathname]); // Re-run effect when route changes to detect login/logout

  const handleLogout = () => {
    localStorage.removeItem('cfo_user');
    setIsSuperadmin(false);
    router.push('/login');
  };

  const isLoggedIn = isClient && typeof window !== 'undefined' && localStorage.getItem('cfo_user') !== null;

  return (
    <nav style={{ padding: '20px 0', borderBottom: '1px solid var(--border-color)', position: 'sticky', top: 0, zIndex: 50, background: 'rgba(255, 255, 255, 0.9)', backdropFilter: 'blur(10px)' }}>
      <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link href="/" style={{ textDecoration: 'none', color: 'var(--primary)' }}>
          <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>
            Fin<span className="gradient-text">sight</span> <span className="gold-text">Pro</span>
          </div>
        </Link>
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          <Link href="/" style={{ opacity: pathname === '/' ? 1 : 0.8, color: 'var(--primary)', textDecoration: 'none', fontWeight: 500 }}>Home</Link>
          {isLoggedIn ? (
            <>
              <Link href="/dashboard" style={{ opacity: pathname.includes('/dashboard') ? 1 : 0.8, color: 'var(--primary)', textDecoration: 'none', fontWeight: 500 }}>Dashboard</Link>
              {isSuperadmin && (
                <Link href="/admin" style={{ opacity: pathname.includes('/admin') ? 1 : 0.8, color: 'var(--primary)', textDecoration: 'none', fontWeight: 500 }}>Admin</Link>
              )}
              <button onClick={handleLogout} style={{ background: 'transparent', border: '1px solid #ef4444', color: '#ef4444', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.9rem', marginLeft: '8px', fontWeight: 500 }}>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/login" style={{ opacity: pathname === '/login' ? 1 : 0.8, color: 'var(--primary)', textDecoration: 'none', fontWeight: 500 }}>Login</Link>
              <Link href="/register" style={{ opacity: pathname === '/register' ? 1 : 0.8, color: 'white', textDecoration: 'none', background: 'var(--primary)', padding: '6px 16px', borderRadius: '4px', fontWeight: 500 }}>Register</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
