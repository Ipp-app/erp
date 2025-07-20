CREATE POLICY "Allow read access for production_shifts"
ON public.production_shifts
FOR SELECT
TO public
USING (true);