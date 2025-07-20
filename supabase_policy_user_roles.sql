CREATE POLICY "Allow authenticated users to read their own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (user_id = auth.uid());