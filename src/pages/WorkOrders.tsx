import React, { useEffect, useState } from 'react';
import { useCRUD } from '@/hooks/useCRUD';
import { DataTable } from '@/components/common/DataTable';
import { FormModal } from '@/components/common/FormModal';
import ThemedInput from '@/components/ui/ThemedInput';
import ThemedSelect from '@/components/ui/ThemedSelect';
import { SelectItem } from '@/components/ui/select';
import { supabase } from '@/lib/supabaseClient';

interface WorkOrder {
  id: string;
  work_order_number: string;
  order_type: string;
  description: string;
  machine_id: string;
  mold_id: string;
  product_id: string;
  priority_level: string;
  status: string;
  assigned_to: string;
  scheduled_start_date: string;
  scheduled_end_date: string;
  actual_start_date: string;
  actual_end_date: string;
  notes: string;
  machines?: { name: string; machine_code: string } | null;
  molds?: { name: string; mold_code: string } | null;
  products?: { name: string; product_code: string } | null;
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

interface Product {
  id: string;
  name: string;
  product_code: string;
}

export default function WorkOrders() {
  const {
    data: workOrders,
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
  } = useCRUD<WorkOrder>({
    table: 'work_orders',
    // Mengembalikan query ke versi lengkap dengan join
    columns: 'id, work_order_number, order_type, description, machine_id, mold_id, product_id, priority_level, status, assigned_to, scheduled_start_date, scheduled_end_date, actual_start_date, actual_end_date, notes, machines(name, machine_code), molds(name, mold_code), products(name, product_code)',
    rolePermissions: ['admin', 'maintenance_staff', 'production_manager']
  });

  const [machines, setMachines] = useState<Machine[]>([]);
  const [molds, setMolds] = useState<Mold[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingRelations, setLoadingRelations] = useState(true);

  useEffect(() => {
    async function fetchRelations() {
      setLoadingRelations(true);
      const [{ data: machinesData }, { data: moldsData }, { data: productsData }] = await Promise.all([
        supabase.from('machines').select('id, name, machine_code'),
        supabase.from('molds').select('id, name, mold_code'),
        supabase.from('products').select('id, name, product_code')
      ]);

      setMachines(machinesData || []);
      setMolds(moldsData || []);
      setProducts(productsData || []);
      setLoadingRelations(false);
    }
    fetchRelations();
  }, []);

  const columns = [
    { key: 'work_order_number' as keyof WorkOrder, label: 'WO Number' },
    { key: 'order_type' as keyof WorkOrder, label: 'Type' },
    { 
      key: 'machine_id' as keyof WorkOrder, 
      label: 'Machine',
      render: (value: string, item: WorkOrder) => item.machines?.name || value
    },
    { 
      key: 'mold_id' as keyof WorkOrder, 
      label: 'Mold',
      render: (value: string, item: WorkOrder) => item.molds?.name || value
    },
    { 
      key: 'product_id' as keyof WorkOrder, 
      label: 'Product',
      render: (value: string, item: WorkOrder) => item.products?.name || value
    },
    { key: 'priority_level' as keyof WorkOrder, label: 'Priority' },
    { 
      key: 'status' as keyof WorkOrder, 
      label: 'Status',
      render: (value: string) => {
        const colors = {
          pending: 'text-yellow-600',
          in_progress: 'text-blue-600',
          completed: 'text-green-600',
          on_hold: 'text-orange-600',
          cancelled: 'text-red-600'
        };
        return <span className={colors[value as keyof typeof colors] || 'text-gray-600'}>{value}</span>;
      }
    },
    { key: 'assigned_to' as keyof WorkOrder, label: 'Assigned To' },
    { key: 'scheduled_start_date' as keyof WorkOrder, label: 'Scheduled Start' }
  ];

  const orderTypes = Array.from(new Set(workOrders.map(wo => wo.order_type).filter(Boolean)));
  const statuses = Array.from(new Set(workOrders.map(wo => wo.status).filter(Boolean)));

  if (loading || loadingRelations) return <div>Loading Work Orders...</div>;

  return (
    <div className="p-4">
      <DataTable
        data={workOrders}
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
        addButtonText="Add Work Order"
      />

      <FormModal
        isOpen={showForm}
        onClose={closeForm}
        onSubmit={handleSubmit}
        title={`${editing ? 'Edit' : 'Add'} Work Order`}
      >
        <ThemedInput
          placeholder="Work Order Number"
          value={form.work_order_number || ''}
          onChange={e => setForm(f => ({ ...f, work_order_number: e.target.value }))}
          required
        />
        <ThemedSelect
          value={form.order_type || ''}
          onValueChange={value => setForm(f => ({ ...f, order_type: value }))}
          className="mb-2"
          placeholder="Select Order Type"
        >
          <SelectItem value="maintenance">Maintenance</SelectItem>
          <SelectItem value="repair">Repair</SelectItem>
          <SelectItem value="calibration">Calibration</SelectItem>
          <SelectItem value="installation">Installation</SelectItem>
          <SelectItem value="production_setup">Production Setup</SelectItem>
        </ThemedSelect>
        <textarea
          className="border p-2 mb-2 w-full"
          placeholder="Description"
          value={form.description || ''}
          onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
          rows={3}
          required
        />
        <ThemedSelect
          value={form.machine_id || ''}
          onValueChange={value => setForm(f => ({ ...f, machine_id: value }))}
          className="mb-2"
          placeholder="Select Machine (Optional)"
        >
          <SelectItem value="">None</SelectItem>
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
          placeholder="Select Mold (Optional)"
        >
          <SelectItem value="">None</SelectItem>
          {molds.map(mold => (
            <SelectItem key={mold.id} value={mold.id}>
              {mold.name} ({mold.mold_code})
            </SelectItem>
          ))}
        </ThemedSelect>
        <ThemedSelect
          value={form.product_id || ''}
          onValueChange={value => setForm(f => ({ ...f, product_id: value }))}
          className="mb-2"
          placeholder="Select Product (Optional)"
        >
          <SelectItem value="">None</SelectItem>
          {products.map(product => (
            <SelectItem key={product.id} value={product.id}>
              {product.name} ({product.product_code})
            </SelectItem>
          ))}
        </ThemedSelect>
        <ThemedSelect
          value={form.priority_level || 'medium'}
          onValueChange={value => setForm(f => ({ ...f, priority_level: value }))}
          className="mb-2"
          placeholder="Select Priority"
        >
          <SelectItem value="low">Low</SelectItem>
          <SelectItem value="medium">Medium</SelectItem>
          <SelectItem value="high">High</SelectItem>
          <SelectItem value="urgent">Urgent</SelectItem>
        </ThemedSelect>
        <ThemedSelect
          value={form.status || 'pending'}
          onValueChange={value => setForm(f => ({ ...f, status: value }))}
          className="mb-2"
          placeholder="Select Status"
        >
          <SelectItem value="pending">Pending</SelectItem>
          <SelectItem value="in_progress">In Progress</SelectItem>
          <SelectItem value="completed">Completed</SelectItem>
          <SelectItem value="on_hold">On Hold</SelectItem>
          <SelectItem value="cancelled">Cancelled</SelectItem>
        </ThemedSelect>
        <ThemedInput
          placeholder="Assigned To"
          value={form.assigned_to || ''}
          onChange={e => setForm(f => ({ ...f, assigned_to: e.target.value }))}
        />
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
            placeholder="Actual Start Date (Optional)"
            type="date"
            value={form.actual_start_date || ''}
            onChange={e => setForm(f => ({ ...f, actual_start_date: e.target.value }))}
          />
          <ThemedInput
            placeholder="Actual End Date (Optional)"
            type="date"
            value={form.actual_end_date || ''}
            onChange={e => setForm(f => ({ ...f, actual_end_date: e.target.value }))}
          />
        </div>
        <textarea
          className="border p-2 mb-2 w-full"
          placeholder="Notes (Optional)"
          value={form.notes || ''}
          onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
          rows={3}
        />
      </FormModal>
    </div>
  );
}