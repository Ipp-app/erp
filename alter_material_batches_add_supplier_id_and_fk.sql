-- Tambahkan kolom supplier_id ke tabel material_batches jika belum ada.
-- Pastikan tipenya UUID agar bisa menjadi Foreign Key.
ALTER TABLE public.material_batches
ADD COLUMN IF NOT EXISTS supplier_id uuid;

-- Tambahkan Foreign Key Constraint untuk menghubungkan material_batches ke tabel suppliers.
-- Ini akan memungkinkan join 'suppliers(company_name)' bekerja.
ALTER TABLE public.material_batches
ADD CONSTRAINT fk_material_batches_supplier_id
FOREIGN KEY (supplier_id)
REFERENCES public.suppliers (id);