-- Aktifkan Row Level Security (RLS) untuk tabel raw_materials
ALTER TABLE public.raw_materials ENABLE ROW LEVEL SECURITY;

-- Buat kebijakan RLS untuk mengizinkan semua pengguna membaca data dari raw_materials
CREATE POLICY "Allow read access for all users on raw_materials"
ON public.raw_materials FOR SELECT
TO public
USING (true);