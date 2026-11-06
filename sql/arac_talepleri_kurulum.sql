-- ============================================================================
-- ESKİDEN BUGÜNE SAVAŞ MAKİNELERİ (3D TEARDOWN MÜZESİ)
-- Araç Talep / Öneri Formu — Supabase Tablo ve RLS Güvenlik Kurulum Betiği
-- ============================================================================
-- KULLANIM:
-- 1. Supabase Dashboard -> SQL Editor ekranını açın.
-- 2. Bu betiğin tamamını yapıştırıp "Run" tuşuna basın.
-- 3. Project Settings -> API bölümünden "Project URL" ve "anon public" anahtarını
--    projedeki `js/supabase-config.js` dosyasına yapıştırın.
-- ============================================================================

-- 1. Tablo Oluşturma (Uzunluk ve Format Kısıtlamaları ile Güvenli Şema)
create table if not exists public.vehicle_requests (
  id uuid primary key default gen_random_uuid(),
  vehicle_name text not null
    check (char_length(trim(vehicle_name)) between 2 and 120),
  era_or_year text not null
    check (char_length(trim(era_or_year)) between 1 and 80),
  domain text not null
    check (domain in ('land', 'sea', 'air', 'space', 'other')),
  mechanism_notes text not null
    check (char_length(trim(mechanism_notes)) between 5 and 1500),
  reference_url text
    check (
      reference_url is null
      or (
        char_length(reference_url) <= 500
        and reference_url ~* '^https?://'
      )
    ),
  requester_name text
    check (requester_name is null or char_length(requester_name) <= 100),
  requester_contact text
    check (requester_contact is null or char_length(requester_contact) <= 150),
  status text not null default 'pending'
    check (status in ('pending', 'approved', 'in_progress', 'completed', 'rejected')),
  created_at timestamptz not null default now()
);

comment on table public.vehicle_requests is 'Ziyaretçilerin 3D müzeye eklenmesini talep ettiği tarihsel savaş araçları ve mekanizmalar.';

-- 2. Sıralama ve Yönetim İçin İndeks
create index if not exists idx_vehicle_requests_created_at
  on public.vehicle_requests (created_at desc);

create index if not exists idx_vehicle_requests_status
  on public.vehicle_requests (status);

-- 3. Row Level Security (RLS) Etkinleştirme
alter table public.vehicle_requests enable row level security;

-- 4. RLS Politikaları (GÜVENLİK NOTU):
-- Ziyaretçiler (anon) yalnızca yeni talep EKLEYEBİLİR (INSERT) ve durumu sadece 'pending' olabilir.
-- Ziyaretçilerin (anon) SELECT yetkisi YOKTUR; böylece öneren kişilerin e-posta/iletişim bilgileri
-- dışarıdan okunamaz.
drop policy if exists "Ziyaretciler arac talebi ekleyebilir" on public.vehicle_requests;
create policy "Ziyaretciler arac talebi ekleyebilir"
  on public.vehicle_requests
  for insert
  to anon, authenticated
  with check (status = 'pending');

-- Yalnızca giriş yapmış yönetici (authenticated / service_role) talepleri okuyabilir ve güncelleyebilir
drop policy if exists "Yonetici talepleri okuyabilir" on public.vehicle_requests;
create policy "Yonetici talepleri okuyabilir"
  on public.vehicle_requests
  for select
  to authenticated
  using (true);

drop policy if exists "Yonetici talepleri guncelleyebilir" on public.vehicle_requests;
create policy "Yonetici talepleri guncelleyebilir"
  on public.vehicle_requests
  for update
  to authenticated
  using (true)
  with check (true);

-- 5. Tablo Yetkileri
grant usage on schema public to anon, authenticated;
grant insert on table public.vehicle_requests to anon, authenticated;
grant select, update, delete on table public.vehicle_requests to authenticated;

