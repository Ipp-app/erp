ALTER TABLE public.material_batches
ADD COLUMN supplier_id uuid;

ALTER TABLE public.material_batches
ADD CONSTRAINT fk_material_batches_supplier_id
FOREIGN KEY (supplier_id)
REFERENCES public.suppliers (id);