import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { getUserRoles } from '../lib/roles';

interface CRUDOptions {
  table: string;
  columns?: string;
  rolePermissions?: string[];
}

export function useCRUD<T extends { id: string }>(options: CRUDOptions) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRoles, setUserRoles] = useState<string[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<T | null>(null);
  const [form, setForm] = useState<Partial<T>>({});

  useEffect(() => {
    fetchData();
    fetchRoles();
  }, []);

  async function fetchData() {
    setLoading(true);
    const { data: result } = await supabase
      .from(options.table)
      .select(options.columns || '*');
    setData((result as unknown as T[]) || []);
    setLoading(false);
  }

  async function fetchRoles() {
    const user = supabase.auth.getUser ? (await supabase.auth.getUser()).data.user : null;
    if (user) {
      const roles = await getUserRoles(user.id);
      setUserRoles(roles);
    }
  }

  function canEdit() {
    if (!options.rolePermissions) return true;
    return options.rolePermissions.some(role => userRoles.includes(role));
  }

  function openForm(item?: T) {
    setEditing(item || null);
    setForm(item || {});
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditing(null);
    setForm({});
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (editing) {
      await supabase.from(options.table).update(form).eq('id', editing.id);
    } else {
      await supabase.from(options.table).insert([form]);
    }
    closeForm();
    fetchData();
  }

  async function handleDelete(id: string) {
    if (!window.confirm('Delete this item?')) return;
    await supabase.from(options.table).delete().eq('id', id);
    fetchData();
  }

  return {
    data,
    loading,
    userRoles,
    showForm,
    editing,
    form,
    setForm,
    canEdit,
    openForm,
    closeForm,
    handleSubmit,
    handleDelete,
    fetchData
  };
}
