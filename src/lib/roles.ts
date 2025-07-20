import { supabase } from './supabaseClient';

export async function getUserRoles(userId: string): Promise<string[]> {
  const { data, error } = await supabase
    .from('user_roles')
    .select('role_id, roles(name)')
    .eq('user_id', userId)
    .eq('roles.is_active', true);
  if (error || !data) return [];
  return data.map((row: any) => row.roles?.name).filter(Boolean);
}
