CREATE POLICY "Allow read access for products"
ON public.products
FOR SELECT
TO public
USING (true);