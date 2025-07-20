import React, { useEffect, useState } from 'react';
import { useCRUD } from '@/hooks/useCRUD';
import { DataTable } from '@/components/common/DataTable';
import { FormModal } from '@/components/common/FormModal';
import ThemedInput from '@/components/ui/ThemedInput';
import ThemedSelect from '@/components/ui/ThemedSelect';
import { SelectItem } from '@/components/ui/select';
import { supabase } from '@/lib/supabaseClient';

interface DailyProductionSchedule {
  id: string;
  schedule_date: string;
  production_order_id: string;
  machine_id: string;
  mold_id: string; // Keep this for form handling, even if fetched via join
  shift: string;
  planned_quantity: number;
  actual_quantity: number;
  status: string;
  notes: string;
  production_orders?: { order_number: string; product_id: string; molds?: { name: string; mold_code: string } | null } | null; // Nested join for molds
  machines?: { name: string; machine_code: string } | null;
  molds?: { name: string; mold_code: string } | null; // Keep for type consistency if needed for form
}

interface ProductionOrder {
  id: string;
  order_number: string;
  product_id: string;
  mold_id?: string; // Add mold_id to ProductionOrder interface
}

interface Machine {
  id: string;
  name: string;
  machine_code: string;
}

interface Mold {
  id: string;
  name: string;
  mold_code: string;
}

export default function DailyProductionSchedule() {
  const {
    data: schedules,
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
  } = useCRUD<DailyProductionSchedule>({
    table: 'daily_production_schedule',
    // Mengubah query untuk mengambil mold melalui production_orders
    columns: 'id, schedule_date, production_order_id, machine_id, shift, planned_quantity, actual_quantity, status, notes, production_orders(order_number, product_id, molds(name, mold_code)), machines(name, machine_code)', 
    rolePermissions: ['admin', 'production_manager', 'production_staff']
  });

  const [productionOrders, setProductionOrders] = useState<ProductionOrder[]>([]);
  const [machines, setMachines] = useState<Machine[]>([]);
  const [molds, setMolds] = useState<Mold[]>([]);
  const [loadingRelations, setLoadingRelations] = useState(true);

  useEffect(() => {
    async function fetchRelations() {
      setLoadingRelations(true);
      const [{ data: ordersData }, { data: machinesData }, { data: moldsData }] = await Promise.all([
        supabase.from('production_orders').select('id, order_number, product_id, mold_id'), // Fetch mold_id from production_orders
        supabase.from('machines').select('id, name, machine_code'),
        supabase.from('molds').select('id, name, mold_code')
      ]);

      setProductionOrders(ordersData || []);
      setMachines(machinesData || []);
      setMolds(moldsData || []);
      setLoadingRelations(false);
    }
    fetchRelations();
  }, []);

  const columns = [
    { key: 'schedule_date' as keyof DailyProductionSchedule, label: 'Date' },
    { 
      key: 'production_order_id' as keyof DailyProductionSchedule, 
      label: 'Production Order',
      render: (value: string, item: DailyProductionSchedule) => item.production_orders?.order_number || value
    },
    { 
      key: 'machine_id' as keyof DailyProductionSchedule, 
      label: 'Machine',
      render: (value: string, item: DailyProductionSchedule) => item.machines?.name || value
    },
    { 
      key: 'mold_id' as keyof DailyProductionSchedule, // This key is now accessed via nested object
      label: 'Mold',
      render: (value: string, item: DailyProductionSchedule) => item.production_orders?.molds?.name || item.mold_id || value // Access nested mold name
    },
    { key: 'shift' as keyof DailyProductionSchedule, label: 'Shift' },
    { 
      key: 'planned_quantity' as keyof DailyProductionSchedule, 
      label: 'Planned Qty',
      render: (value: number) => value?.toLocaleString() || '0'
    },
    { 
      key: 'actual_quantity' as keyof DailyProductionSchedule, 
      label: 'Actual Qty',
      render: (value: number) => value?.toLocaleString() || '0'
    },
    { 
      key: 'progress' as any, 
      label: 'Progress',
      render: (value: number, item: DailyProductionSchedule) => {
        const progress = item.planned_quantity > 0 ? (item.actual_quantity / item.planned_quantity * 100) : 0;
        return `${progress.toFixed(1)}%`;
      }
    },
    { 
      key: 'status' as keyof DailyProductionSchedule, 
      label: 'Status',
      render: (value: string) => {
        const colors = {
          scheduled: 'text-blue-600',
          in_progress: 'text-yellow-600',
          completed: 'text-green-600',
          on_hold: 'text-orange-600',
          cancelled: 'text-red-600'
        };
        return <span className={colors[value as keyof typeof colors] || 'text-gray-600'}>{value}</span>;
      }
    }
  ];

  const shifts = Array.from(new Set(schedules.map(s => s.shift).filter(Boolean)));
  const statuses = Array.from(new Set(schedules.map(s => s.status).filter(Boolean)));

  if (loading || loadingRelations) return <div>Loading Daily Production Schedule...</div>;

  return (
    <div className="p-4">
      <DataTable
        data={schedules}
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
        addButtonText="Add Schedule Entry"
      />

      <FormModal
        isOpen={showForm}
        onClose={closeForm}
        onSubmit={handleSubmit}
        title={`${editing ? 'Edit' : 'Add'} Schedule Entry`}
      >
        <ThemedInput
          placeholder="Schedule Date"
          type="date"
          value={form.schedule_date || ''}
          onChange={e => setForm(f => ({ ...f, schedule_date: e.target.value }))}
          required
        />
        <ThemedSelect
          value={form.production_order_id || ''}
          onValueChange={value => {
            const selectedOrder = productionOrders.find(order => order.id === value);
            setForm(f => ({ ...f, production_order_id: value, mold_id: selectedOrder?.mold_id || '' }));
          }}
          className="mb-2"
          placeholder="Select Production Order"
        >
          {productionOrders.map(order => (
            <SelectItem key={order.id} value={order.id}>
              {order.order_number} (Product: {order.product_id})
            </SelectItem>
          ))}
        </ThemedSelect>
        <ThemedSelect
          value={form.machine_id || ''}
          onValueChange={value => setForm(f => ({ ...f, machine_id: value }))}
          className="mb-2"
          placeholder="Select Machine"
        >
          {machines.map(machine => (
            <SelectItem key={machine.id} value={machine.id}>
              {machine.name} ({machine.machine_code})
            </SelectItem>
          ))}
        </ThemedSelect>
        <ThemedSelect
          value={form.mold_id || ''}
          onValueChange={value => setForm(f => ({ ...f, mold_id: value }))}
          className="mb-2"
          placeholder="Select Mold"
        >
          {molds.map(mold => (
            <SelectItem key={mold.id} value={mold.id}>
              {mold.name} ({mold.mold_code})
            </SelectItem>
          ))}
        </ThemedSelect>
        <ThemedSelect
          value={form.shift || ''}
          onValueChange={value => setForm(f => ({ ...f, shift: value }))}
          className="mb-2"
          placeholder="Select Shift"
        >
          <SelectItem value="shift_a">Shift A</SelectItem>
          <SelectItem value="shift_b">Shift B</SelectItem>
          <SelectItem value="shift_c">Shift C</SelectItem>
        </ThemedSelect>
        <ThemedInput
          placeholder="Planned Quantity"
          type="number"
          value={form.planned_quantity || ''}
          onChange={e => setForm(f => ({ ...f, planned_quantity: Number(e.target.value) }))}
          required
        />
        <ThemedInput
          placeholder="Actual Quantity"
          type="number"
          value={form.actual_quantity || ''}
          onChange={e => setForm(f => ({ ...f, actual_quantity: Number(e.target.value) }))}
        />
        <ThemedSelect
          value={form.status || 'scheduled'}
          onValueChange={value => setForm(f => ({ ...f, status: value }))}
          className="mb-2"
          placeholder="Select Status"
        >
          <SelectItem value="scheduled">Scheduled</SelectItem>
          <SelectItem value="in_progress">In Progress</SelectItem>
          <SelectItem value="completed">Completed</SelectItem>
          <SelectItem value="on_hold">On Hold</SelectItem>
          <SelectItem value="cancelled">Cancelled</SelectItem>
        </ThemedSelect>
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