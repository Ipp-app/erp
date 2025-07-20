CREATE POLICY "Allow read access for machines"
ON public.machines
FOR SELECT
TO public
USING (true);