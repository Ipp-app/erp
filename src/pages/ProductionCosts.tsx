import React, { useEffect, useState } from 'react';
import { useCRUD } from '@/hooks/useCRUD';
import { DataTable } from '@/components/common/DataTable';
import { FormModal } from '@/components/common/FormModal';
import ThemedInput from '@/components/ui/ThemedInput';
import ThemedSelect from '@/components/ui/ThemedSelect';
import { SelectItem } from '@/components/ui/select';
import { supabase } from '@/lib/supabaseClient';

interface ProductionCost {
  id: string;
  production_order_id: string;
  cost_date: string;
  material_cost: number;
  labor_cost: number;
  machine_cost: number;
  overhead_cost: number;
  total_cost: number;
  unit_cost: number;
  notes: string;
  production_orders?: { order_number: string; actual_quantity: number } | null; // For joining production order details
}

interface ProductionOrder {
  id: string;
  order_number: string;
  actual_quantity: number;
}

export default function ProductionCosts() {
  const {
    data: costs,
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
  } = useCRUD<ProductionCost>({
    table: 'production_costs',
    // Mengembalikan query ke versi lengkap dengan join
    columns: 'id, production_order_id, cost_date, material_cost, labor_cost, machine_cost, overhead_cost, total_cost, unit_cost, notes, production_orders(order_number, actual_quantity)',
    rolePermissions: ['admin', 'finance_manager']
  });

  const [productionOrders, setProductionOrders] = useState<ProductionOrder[]>([]);
  const [loadingRelations, setLoadingRelations] = useState(true);

  useEffect(() => {
    async function fetchRelations() {
      setLoadingRelations(true);
      const { data, error } = await supabase.from('production_orders').select('id, order_number, actual_quantity');
      if (error) console.error('Error fetching production orders:', error);
      else setProductionOrders(data || []);
      setLoadingRelations(false);
    }
    fetchRelations();
  }, []);

  // Calculate total_cost and unit_cost
  useEffect(() => {
    const material = form.material_cost || 0;
    const labor = form.labor_cost || 0;
    const machine = form.machine_cost || 0;
    const overhead = form.overhead_cost || 0;
    const calculatedTotalCost = material + labor + machine + overhead;
    
    const relatedOrder = productionOrders.find(order => order.id === form.production_order_id);
    const actualQuantity = relatedOrder?.actual_quantity || 0;
    const calculatedUnitCost = actualQuantity > 0 ? calculatedTotalCost / actualQuantity : 0;

    setForm(f => ({ 
      ...f, 
      total_cost: calculatedTotalCost,
      unit_cost: calculatedUnitCost
    }));
  }, [form.material_cost, form.labor_cost, form.machine_cost, form.overhead_cost, form.production_order_id, productionOrders, setForm]);

  const columns = [
    { 
      key: 'production_order_id' as keyof ProductionCost, 
      label: 'Production Order',
      render: (value: string, item: ProductionCost) => item.production_orders?.order_number || value
    },
    { key: 'cost_date' as keyof ProductionCost, label: 'Cost Date' },
    { 
      key: 'material_cost' as keyof ProductionCost, 
      label: 'Material Cost',
      render: (value: number) => `$${value?.toFixed(2) || '0.00'}`
    },
    { 
      key: 'labor_cost' as keyof ProductionCost, 
      label: 'Labor Cost',
      render: (value: number) => `$${value?.toFixed(2) || '0.00'}`
    },
    { 
      key: 'machine_cost' as keyof ProductionCost, 
      label: 'Machine Cost',
      render: (value: number) => `$${value?.toFixed(2) || '0.00'}`
    },
    { 
      key: 'overhead_cost' as keyof ProductionCost, 
      label: 'Overhead Cost',
      render: (value: number) => `$${value?.toFixed(2) || '0.00'}`
    },
    { 
      key: 'total_cost' as keyof ProductionCost, 
      label: 'Total Cost',
      render: (value: number) => `$${value?.toFixed(2) || '0.00'}`
    },
    { 
      key: 'unit_cost' as keyof ProductionCost, 
      label: 'Unit Cost',
      render: (value: number) => `$${value?.toFixed(2) || '0.00'}`
    }
  ];

  if (loading || loadingRelations) return <div>Loading Production Costs...</div>;

  return (
    <div className="p-4">
      <DataTable
        data={costs}
        columns={columns}
        searchable
        paginated
        pageSize={10}
        canEdit={canEdit()}
        onAdd={() => openForm()}
        onEdit={openForm}
        onDelete={handleDelete}
        addButtonText="Add Cost Record"
      />

      <FormModal
        isOpen={showForm}
        onClose={closeForm}
        onSubmit={handleSubmit}
        title={`${editing ? 'Edit' : 'Add'} Production Cost`}
      >
        <ThemedSelect
          value={form.production_order_id || ''}
          onValueChange={value => setForm(f => ({ ...f, production_order_id: value }))}
          className="mb-2"
          placeholder="Select Production Order"
        >
          {productionOrders.map(order => (
            <SelectItem key={order.id} value={order.id}>
              {order.order_number} (Actual Qty: {order.actual_quantity})
            </SelectItem>
          ))}
        </ThemedSelect>
        <ThemedInput
          placeholder="Cost Date"
          type="date"
          value={form.cost_date || ''}
          onChange={e => setForm(f => ({ ...f, cost_date: e.target.value }))}
          required
        />
        <ThemedInput
          placeholder="Material Cost"
          type="number"
          step="0.01"
          value={form.material_cost || ''}
          onChange={e => setForm(f => ({ ...f, material_cost: Number(e.target.value) }))}
        />
        <ThemedInput
          placeholder="Labor Cost"
          type="number"
          step="0.01"
          value={form.labor_cost || ''}
          onChange={e => setForm(f => ({ ...f, labor_cost: Number(e.target.value) }))}
        />
        <ThemedInput
          placeholder="Machine Cost"
          type="number"
          step="0.01"
          value={form.machine_cost || ''}
          onChange={e => setForm(f => ({ ...f, machine_cost: Number(e.target.value) }))}
        />
        <ThemedInput
          placeholder="Overhead Cost"
          type="number"
          step="0.01"
          value={form.overhead_cost || ''}
          onChange={e => setForm(f => ({ ...f, overhead_cost: Number(e.target.value) }))}
        />
        <ThemedInput
          placeholder="Total Cost"
          type="number"
          step="0.01"
          value={form.total_cost || ''}
          disabled // Calculated automatically
        />
        <ThemedInput
          placeholder="Unit Cost"
          type="number"
          step="0.01"
          value={form.unit_cost || ''}
          disabled // Calculated automatically
        />
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