CREATE POLICY "Allow read access for daily_production_schedule"
ON public.daily_production_schedule
FOR SELECT
TO public
USING (true);