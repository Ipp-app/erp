-- Aktifkan Row Level Security (RLS) untuk tabel material_batches
ALTER TABLE public.material_batches ENABLE ROW LEVEL SECURITY;

-- Buat kebijakan RLS untuk mengizinkan semua pengguna membaca data dari material_batches
CREATE POLICY "Allow read access for all users on material_batches"
ON public.material_batches FOR SELECT
TO public
USING (true);

-- Aktifkan Row Level Security (RLS) untuk tabel raw_materials (jika belum)
ALTER TABLE public.raw_materials ENABLE ROW LEVEL SECURITY;

-- Buat kebijakan RLS untuk mengizinkan semua pengguna membaca data dari raw_materials (jika belum)
CREATE POLICY "Allow read access for all users on raw_materials"
ON public.raw_materials FOR SELECT
TO public
USING (true);

-- Aktifkan Row Level Security (RLS) untuk tabel suppliers
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;

-- Buat kebijakan RLS untuk mengizinkan semua pengguna membaca data dari suppliers
CREATE POLICY "Allow read access for all users on suppliers"
ON public.suppliers FOR SELECT
TO public
USING (true);