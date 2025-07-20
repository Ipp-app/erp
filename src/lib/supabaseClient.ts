import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://jutinlgcuwmglwgcaoxj.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp1dGlubGdjdXdtZ2x3Z2Nhb3hqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI1OTg1MzMsImV4cCI6MjA2ODE3NDUzM30.LiadEWpy-J2aTLNU8BkXufpf5sJyWz6P6PYYtst9Z_w';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
