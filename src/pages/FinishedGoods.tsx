import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { getUserRoles } from '../lib/roles';
import ThemedButton from '../components/ui/ThemedButton';
import ThemedInput from '../components/ui/ThemedInput';
import ThemedTable from '../components/ui/ThemedTable';

interface FinishedGood {
  id: string;
  batch_number: string;
  quantity: number;
  production_date: string;
  quality_status: string;
  status: string;
}

export default function FinishedGoods() {
  const [goods, setGoods] = useState<FinishedGood[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<FinishedGood | null>(null);
  const [form, setForm] = useState<Partial<FinishedGood>>({});
  const [userRoles, setUserRoles] = useState<string[]>([]);

  useEffect(() => {
    fetchGoods();
    fetchRoles();
  }, []);

  async function fetchGoods() {
    setLoading(true);
    const { data } = await supabase
      .from('finished_goods_inventory')
      .select('id, batch_number, quantity, production_date, quality_status, status');
    setGoods(data || []);
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
    return userRoles.includes('admin') || userRoles.includes('warehouse_staff');
  }

  function openForm(good?: FinishedGood) {
    setEditing(good || null);
    setForm(good || {});
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
      await supabase.from('finished_goods_inventory').update(form).eq('id', editing.id);
    } else {
      await supabase.from('finished_goods_inventory').insert([form]);
    }
    closeForm();
    fetchGoods();
  }

  async function handleDelete(id: string) {
    if (!window.confirm('Delete this record?')) return;
    await supabase.from('finished_goods_inventory').delete().eq('id', id);
    fetchGoods();
  }

  if (loading) return <div>Loading...</div>;

  return (
    <div className="p-4">
      {canEdit() && (
        <ThemedButton style={{ marginBottom: 8 }} onClick={() => openForm()}>Add Finished Good</ThemedButton>
      )}
      <ThemedTable>
        <thead>
          <tr>
            <th>Batch</th>
            <th>Quantity</th>
            <th>Production Date</th>
            <th>Quality Status</th>
            <th>Status</th>
            {canEdit() && <th>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {goods.map((g) => (
            <tr key={g.id}>
              <td>{g.batch_number}</td>
              <td>{g.quantity}</td>
              <td>{g.production_date}</td>
              <td>{g.quality_status}</td>
              <td>{g.status}</td>
              {canEdit() && (
                <td>
                  <ThemedButton variant="secondary" style={{ marginRight: 8, color: '#2563eb', background: 'none', border: 'none' }} onClick={() => openForm(g)}>Edit</ThemedButton>
                  <ThemedButton variant="secondary" style={{ color: '#dc2626', background: 'none', border: 'none' }} onClick={() => handleDelete(g.id)}>Delete</ThemedButton>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </ThemedTable>
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <form className="bg-white p-6 rounded shadow-md min-w-[300px]" onSubmit={handleSubmit}>
            <h2 className="text-lg font-bold mb-2">{editing ? 'Edit' : 'Add'} Finished Good</h2>
            <ThemedInput
              placeholder="Batch Number"
              value={form.batch_number || ''}
              onChange={e => setForm(f => ({ ...f, batch_number: e.target.value }))}
              required
            />
            <ThemedInput
              placeholder="Quantity"
              type="number"
              value={form.quantity || 0}
              onChange={e => setForm(f => ({ ...f, quantity: Number(e.target.value) }))}
            />
            <ThemedInput
              placeholder="Production Date"
              type="date"
              value={form.production_date || ''}
              onChange={e => setForm(f => ({ ...f, production_date: e.target.value }))}
            />
            <ThemedInput
              placeholder="Quality Status"
              value={form.quality_status || ''}
              onChange={e => setForm(f => ({ ...f, quality_status: e.target.value }))}
            />
            <select
              className="border p-2 mb-2 w-full"
              value={form.status || 'available'}
              onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
            >
              <option value="available">Available</option>
              <option value="reserved">Reserved</option>
              <option value="shipped">Shipped</option>
              <option value="damaged">Damaged</option>
            </select>
            <div className="flex justify-end">
              <ThemedButton type="button" variant="outline" style={{ marginRight: 8 }} onClick={closeForm}>Cancel</ThemedButton>
              <ThemedButton type="submit">Save</ThemedButton>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}