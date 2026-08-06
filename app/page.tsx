import Link from 'next/link';

export default function Home() {
  return (
    <div style={{ overflowX: 'hidden' }}>
      {/* 1. HERO SECTION */}
      <section style={{ 
        minHeight: '90vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        padding: '120px 24px',
        position: 'relative'
      }}>
        <div style={{ 
          position: 'absolute', 
          top: '-10%', left: '-10%', 
          width: '500px', height: '500px', 
          background: 'radial-gradient(circle, rgba(249, 212, 35, 0.15) 0%, rgba(0,0,0,0) 70%)',
          zIndex: -1
        }} />
        
        <div className="container animate-fade-in" style={{ textAlign: 'center', maxWidth: '900px', zIndex: 1 }}>
          <div style={{ 
            display: 'inline-block', 
            padding: '8px 16px', 
            background: 'rgba(255,255,255,0.05)', 
            borderRadius: '100px',
            border: '1px solid rgba(255,255,255,0.1)',
            marginBottom: '24px',
            color: 'var(--accent)',
            fontSize: '0.9rem',
            fontWeight: 600,
            letterSpacing: '1px'
          }}>
            🌟 POWERED BY GEMINI AI
          </div>
          
          <h1 style={{ fontSize: '4rem', lineHeight: 1.1, marginBottom: '24px' }}>
            Your Personal <span className="gradient-text">Sharia</span><br />
            Financial Planner
          </h1>
          
          <p style={{ fontSize: '1.2rem', color: 'var(--text-muted)', marginBottom: '40px', lineHeight: 1.6, maxWidth: '700px', margin: '0 auto 40px auto' }}>
            Platform kecerdasan buatan berkelas enterprise yang mendiagnosa kesehatan keuangan Anda dan merancang portofolio 100% Halal dalam hitungan detik. Tanpa riba, penuh berkah.
          </p>
          
          <div style={{ display: 'flex', gap: '20px', justifyContent: 'center' }}>
            <Link href="/dashboard" className="btn btn-primary" style={{ padding: '16px 32px', fontSize: '1.2rem', boxShadow: '0 10px 30px rgba(33, 147, 176, 0.3)' }}>
              Mulai Analisis Gratis ➔
            </Link>
            <a href="#cara-kerja" className="btn btn-outline" style={{ padding: '16px 32px', fontSize: '1.2rem' }}>
              Pelajari Cara Kerjanya
            </a>
          </div>
        </div>
      </section>

      {/* 2. FEATURES SECTION */}
      <section id="fitur" style={{ padding: '100px 24px', background: 'rgba(255,255,255,0.02)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <h2 style={{ fontSize: '2.5rem', marginBottom: '16px' }}>Mengapa Memilih Kami?</h2>
            <p style={{ fontSize: '1.1rem', color: 'var(--text-muted)' }}>Keunggulan analisis level eksekutif (CFO) di ujung jari Anda.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '30px' }}>
            {/* Feature 1 */}
            <div className="glass-card animate-fade-in" style={{ padding: '40px 30px' }}>
              <div style={{ width: '60px', height: '60px', background: 'rgba(33, 147, 176, 0.1)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', marginBottom: '24px' }}>🩺</div>
              <h3 style={{ marginBottom: '12px', fontSize: '1.4rem' }}>Diagnosa Mendalam</h3>
              <p style={{ color: 'var(--text-muted)', lineHeight: 1.6 }}>Menghitung metrik krusial seperti Networth, Rasio Likuiditas, dan Rasio Cicilan Hutang dari data kuesioner Anda secara akurat.</p>
            </div>
            
            {/* Feature 2 */}
            <div className="glass-card animate-fade-in" style={{ padding: '40px 30px', transitionDelay: '100ms' }}>
              <div style={{ width: '60px', height: '60px', background: 'rgba(249, 212, 35, 0.1)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', marginBottom: '24px' }}>🕋</div>
              <h3 style={{ marginBottom: '12px', fontSize: '1.4rem' }}>100% Syariah Compliance</h3>
              <p style={{ color: 'var(--text-muted)', lineHeight: 1.6 }}>AI kami dilatih secara ketat untuk menolak instrumen konvensional. Portofolio Anda hanya berisi Sukuk, Saham DES, dan Reksadana Syariah.</p>
            </div>
            
            {/* Feature 3 */}
            <div className="glass-card animate-fade-in" style={{ padding: '40px 30px', transitionDelay: '200ms' }}>
              <div style={{ width: '60px', height: '60px', background: 'rgba(255, 78, 80, 0.1)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', marginBottom: '24px' }}>📈</div>
              <h3 style={{ marginBottom: '12px', fontSize: '1.4rem' }}>Visualisasi Profesional</h3>
              <p style={{ color: 'var(--text-muted)', lineHeight: 1.6 }}>Lihat distribusi aset dan porsi pengeluaran (Cash Flow) Anda melalui grafik modern (Donut/Pie Charts) yang elegan dan interaktif.</p>
            </div>
            
            {/* Feature 4 */}
            <div className="glass-card animate-fade-in" style={{ padding: '40px 30px', transitionDelay: '300ms' }}>
              <div style={{ width: '60px', height: '60px', background: 'rgba(109, 213, 237, 0.1)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', marginBottom: '24px' }}>🧠</div>
              <h3 style={{ marginBottom: '12px', fontSize: '1.4rem' }}>AI CFO Engine</h3>
              <p style={{ color: 'var(--text-muted)', lineHeight: 1.6 }}>Tidak sekadar template kalkulator. AI menganalisis makro ekonomi saat ini (suku bunga, inflasi) untuk menyarankan jumlah investasi bulanan.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. HOW IT WORKS SECTION */}
      <section id="cara-kerja" style={{ padding: '120px 24px' }}>
        <div className="container" style={{ maxWidth: '1000px' }}>
          <div style={{ textAlign: 'center', marginBottom: '80px' }}>
            <h2 className="gradient-text" style={{ fontSize: '2.5rem', marginBottom: '16px' }}>Bagaimana Cara Kerjanya?</h2>
            <p style={{ fontSize: '1.1rem', color: 'var(--text-muted)' }}>Dapatkan cetak biru keuangan (Bookplan) Anda hanya dalam 3 langkah mudah.</p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
            {/* Step 1 */}
            <div className="glass-card" style={{ display: 'flex', gap: '32px', alignItems: 'center', padding: '40px' }}>
              <div style={{ fontSize: '4rem', fontWeight: 900, color: 'rgba(255,255,255,0.1)', lineHeight: 1 }}>1</div>
              <div>
                <h3 style={{ fontSize: '1.8rem', marginBottom: '12px', color: 'var(--primary)' }}>Isi Kuesioner (5 Menit)</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', lineHeight: 1.6 }}>Jawab form dinamis yang kami sediakan. Masukkan informasi dasar, rincian aset saat ini, hutang (jika ada), detail cash flow, dan impian finansial Anda di masa depan.</p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="glass-card" style={{ display: 'flex', gap: '32px', alignItems: 'center', padding: '40px', background: 'rgba(249, 212, 35, 0.03)', borderColor: 'rgba(249, 212, 35, 0.2)' }}>
              <div style={{ fontSize: '4rem', fontWeight: 900, color: 'rgba(249, 212, 35, 0.2)', lineHeight: 1 }}>2</div>
              <div>
                <h3 className="gold-text" style={{ fontSize: '1.8rem', marginBottom: '12px' }}>AI Menganalisis Data Anda</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', lineHeight: 1.6 }}>Tekan "Generate" dan biarkan AI CFO bekerja. Sistem akan memetakan kondisi Anda terhadap kondisi makro ekonomi dan prinsip-prinsip syariah secara real-time.</p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="glass-card" style={{ display: 'flex', gap: '32px', alignItems: 'center', padding: '40px' }}>
              <div style={{ fontSize: '4rem', fontWeight: 900, color: 'rgba(255,255,255,0.1)', lineHeight: 1 }}>3</div>
              <div>
                <h3 style={{ fontSize: '1.8rem', marginBottom: '12px', color: '#6dd5ed' }}>Terima & Kustomisasi Bookplan</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', lineHeight: 1.6 }}>Dapatkan hasil visualisasi (Action Plan) dan rekomendasi produk. Jangan khawatir, Anda bebas mengedit (*tweak*) angka alokasi investasi bulanan sebelum di-finalisasi!</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. CTA & FOOTER */}
      <section style={{ padding: '100px 24px', background: 'linear-gradient(180deg, rgba(33, 147, 176, 0.1) 0%, rgba(10, 10, 18, 1) 100%)', textAlign: 'center' }}>
        <div className="container">
          <h2 style={{ fontSize: '3rem', marginBottom: '24px' }}>Siap Membangun Masa Depan?</h2>
          <p style={{ fontSize: '1.2rem', color: 'var(--text-muted)', marginBottom: '40px', maxWidth: '600px', margin: '0 auto 40px auto' }}>
            Ratusan keluarga telah merestrukturisasi keuangan mereka menjadi lebih berkah. Kini giliran Anda.
          </p>
          <Link href="/dashboard" className="btn btn-primary" style={{ padding: '20px 40px', fontSize: '1.3rem', borderRadius: '100px' }}>
            Coba Dashboard Sekarang
          </Link>
        </div>
      </section>

      <footer style={{ padding: '40px 24px', borderTop: '1px solid rgba(255,255,255,0.05)', textAlign: 'center', color: 'var(--text-muted)' }}>
        <div className="container">
          <p style={{ marginBottom: '12px' }}>© 2026 FinsightPro AI. All rights reserved.</p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '24px', fontSize: '0.9rem' }}>
            <a href="#" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Kebijakan Privasi</a>
            <a href="#" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Syarat & Ketentuan</a>
            <a href="#" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Hubungi Konsultan</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
