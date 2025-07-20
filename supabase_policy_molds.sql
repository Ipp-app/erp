CREATE POLICY "Allow read access for molds"
ON public.molds
FOR SELECT
TO public
USING (true);