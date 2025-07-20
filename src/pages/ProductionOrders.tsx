import React from 'react';
import { useCRUD } from '../hooks/useCRUD';
import { DataTable } from '../components/common/DataTable';
import { FormModal } from '../components/common/FormModal';
import ThemedInput from '../components/ui/ThemedInput';

interface ProductionOrder {
  id: string;
  order_number: string;
  product_id: string;
  mold_id: string;
  machine_id: string;
  target_quantity: number;
  actual_quantity: number;
  ng_quantity: number;
  scheduled_start_date: string;
  scheduled_end_date: string;
  actual_start_date: string;
  actual_end_date: string;
  setup_time_minutes: number;
  breakdown_time_minutes: number;
  cycle_time_standard: number;
  cycle_time_actual: number;
  priority_level: string;
  status: string;
  notes: string;
}

export default function ProductionOrders() {
  const {
    data: orders,
    loading,
    showForm,
    editing,
    form,
    setForm,
    canEdit,
    openForm,
    closeForm,
    handleSubmit,
    handleDelete
  } = useCRUD<ProductionOrder>({
    table: 'production_orders',
    columns: 'id, order_number, product_id, mold_id, machine_id, target_quantity, actual_quantity, ng_quantity, scheduled_start_date, scheduled_end_date, actual_start_date, actual_end_date, setup_time_minutes, breakdown_time_minutes, cycle_time_standard, cycle_time_actual, priority_level, status, notes',
    rolePermissions: ['admin', 'production_manager']
  });

  const columns = [
    { key: 'order_number' as keyof ProductionOrder, label: 'Order Number' },
    { key: 'product_id' as keyof ProductionOrder, label: 'Product ID' },
    { key: 'machine_id' as keyof ProductionOrder, label: 'Machine ID' },
    { 
      key: 'target_quantity' as keyof ProductionOrder, 
      label: 'Target Qty',
      render: (value: number) => value?.toLocaleString() || '0'
    },
    { 
      key: 'actual_quantity' as keyof ProductionOrder, 
      label: 'Actual Qty',
      render: (value: number) => value?.toLocaleString() || '0'
    },
    { 
      key: 'ng_quantity' as keyof ProductionOrder, 
      label: 'NG Qty',
      render: (value: number) => value?.toLocaleString() || '0'
    },
    { 
      key: 'progress' as any, 
      label: 'Progress',
      render: (value: number, item: ProductionOrder) => {
        const progress = item.target_quantity > 0 ? (item.actual_quantity / item.target_quantity * 100) : 0;
        return `${progress.toFixed(1)}%`;
      }
    },
    { key: 'scheduled_start_date' as keyof ProductionOrder, label: 'Start Date' },
    { key: 'scheduled_end_date' as keyof ProductionOrder, label: 'End Date' },
    { key: 'priority_level' as keyof ProductionOrder, label: 'Priority' },
    { 
      key: 'status' as keyof ProductionOrder, 
      label: 'Status',
      render: (value: string) => {
        const colors = {
          planned: 'text-blue-600',
          released: 'text-yellow-600',
          in_progress: 'text-green-600',
          completed: 'text-gray-600',
          cancelled: 'text-red-600',
          on_hold: 'text-orange-600'
        };
        return <span className={colors[value as keyof typeof colors] || 'text-gray-600'}>{value}</span>;
      }
    }
  ];

  const statuses = Array.from(new Set(orders.map(o => o.status).filter(Boolean)));
  const priorities = Array.from(new Set(orders.map(o => o.priority_level).filter(Boolean)));

  if (loading) return <div>Loading...</div>;

  return (
    <div className="p-4">
      {/* <h1 className="text-2xl font-bold mb-4">Production Orders</h1> */}
      <DataTable
        data={orders}
        columns={columns}
        searchable
        filterable
        filterOptions={{ key: 'status', options: statuses }}
        paginated
        pageSize={10}
        canEdit={canEdit()}
        onAdd={() => openForm()}
        onEdit={openForm}
        onDelete={handleDelete}
        addButtonText="Add Production Order"
      />

      <FormModal
        isOpen={showForm}
        onClose={closeForm}
        onSubmit={handleSubmit}
        title={`${editing ? 'Edit' : 'Add'} Production Order`}
      >
        <ThemedInput
          placeholder="Order Number"
          value={form.order_number || ''}
          onChange={e => setForm(f => ({ ...f, order_number: e.target.value }))}
          required
        />
        <ThemedInput
          placeholder="Product ID"
          value={form.product_id || ''}
          onChange={e => setForm(f => ({ ...f, product_id: e.target.value }))}
          required
        />
        <ThemedInput
          placeholder="Machine ID"
          value={form.machine_id || ''}
          onChange={e => setForm(f => ({ ...f, machine_id: e.target.value }))}
        />
        <ThemedInput
          placeholder="Mold ID"
          value={form.mold_id || ''}
          onChange={e => setForm(f => ({ ...f, mold_id: e.target.value }))}
        />
        <div className="grid grid-cols-3 gap-2">
          <ThemedInput
            placeholder="Target Quantity"
            type="number"
            value={form.target_quantity || ''}
            onChange={e => setForm(f => ({ ...f, target_quantity: Number(e.target.value) }))}
            required
          />
          <ThemedInput
            placeholder="Actual Quantity"
            type="number"
            value={form.actual_quantity || ''}
            onChange={e => setForm(f => ({ ...f, actual_quantity: Number(e.target.value) }))}
          />
          <ThemedInput
            placeholder="NG Quantity"
            type="number"
            value={form.ng_quantity || ''}
            onChange={e => setForm(f => ({ ...f, ng_quantity: Number(e.target.value) }))}
          />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <ThemedInput
            placeholder="Scheduled Start Date"
            type="date"
            value={form.scheduled_start_date || ''}
            onChange={e => setForm(f => ({ ...f, scheduled_start_date: e.target.value }))}
          />
          <ThemedInput
            placeholder="Scheduled End Date"
            type="date"
            value={form.scheduled_end_date || ''}
            onChange={e => setForm(f => ({ ...f, scheduled_end_date: e.target.value }))}
          />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <ThemedInput
            placeholder="Actual Start Date"
            type="date"
            value={form.actual_start_date || ''}
            onChange={e => setForm(f => ({ ...f, actual_start_date: e.target.value }))}
          />
          <ThemedInput
            placeholder="Actual End Date"
            type="date"
            value={form.actual_end_date || ''}
            onChange={e => setForm(f => ({ ...f, actual_end_date: e.target.value }))}
          />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <ThemedInput
            placeholder="Cycle Time Standard (s)"
            type="number"
            step="0.01"
            value={form.cycle_time_standard || ''}
            onChange={e => setForm(f => ({ ...f, cycle_time_standard: Number(e.target.value) }))}
          />
          <ThemedInput
            placeholder="Cycle Time Actual (s)"
            type="number"
            step="0.01"
            value={form.cycle_time_actual || ''}
            onChange={e => setForm(f => ({ ...f, cycle_time_actual: Number(e.target.value) }))}
          />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <ThemedInput
            placeholder="Setup Time (minutes)"
            type="number"
            value={form.setup_time_minutes || ''}
            onChange={e => setForm(f => ({ ...f, setup_time_minutes: Number(e.target.value) }))}
          />
          <ThemedInput
            placeholder="Breakdown Time (minutes)"
            type="number"
            value={form.breakdown_time_minutes || ''}
            onChange={e => setForm(f => ({ ...f, breakdown_time_minutes: Number(e.target.value) }))}
          />
        </div>
        <select
          className="border p-2 mb-2 w-full"
          value={form.priority_level || 'medium'}
          onChange={e => setForm(f => ({ ...f, priority_level: e.target.value }))}
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="urgent">Urgent</option>
        </select>
        <select
          className="border p-2 mb-2 w-full"
          value={form.status || 'planned'}
          onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
        >
          <option value="planned">Planned</option>
          <option value="released">Released</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
          <option value="on_hold">On Hold</option>
        </select>
        <textarea
          className="border p-2 mb-2 w-full"
          placeholder="Notes"
          value={form.notes || ''}
          onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
          rows={3}
        />
      </FormModal>
    </div>
  );
}