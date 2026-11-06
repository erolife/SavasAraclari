// ============================================================================
// SUPABASE BAĞLANTI YAPILANDIRMASI (Araç Talep / Öneri Formu)
// ============================================================================
// `sql/arac_talepleri_kurulum.sql` betiğini Supabase SQL Editor'de çalıştırdıktan
// sonra Supabase Dashboard -> Project Settings -> API ekranındaki:
//   1) Project URL (ör. "https://xyzcompany.supabase.co")
//   2) Project API Keys -> "anon" / "public" anahtarını
// aşağıdaki alanlara yapıştırın.
// Not: `anon` anahtarı yalnızca RLS politikalarının izin verdiği (sadece yeni talep
// ekleme / INSERT) işlemini yapabilir; mevcut kayıtları veya iletişim bilgilerini okuyamaz.
// ============================================================================

window.SUPABASE_CONFIG = {
  url: '',       // Örn: 'https://xxxxxxxxxxxx.supabase.co'
  anonKey: '',   // Örn: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
  table: 'vehicle_requests'
};

