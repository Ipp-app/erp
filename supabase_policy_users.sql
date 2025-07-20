CREATE POLICY "Allow authenticated users to read their own user data"
ON public.users
FOR SELECT
TO authenticated
USING (id = auth.uid());