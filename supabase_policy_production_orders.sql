CREATE POLICY "Allow read access for production_orders"
ON public.production_orders
FOR SELECT
TO public
USING (true);