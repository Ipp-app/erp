import React from 'react';
import { useCRUD } from '../hooks/useCRUD';
import { DataTable } from '../components/common/DataTable';
import { FormModal } from '../components/common/FormModal';
import ThemedInput from '../components/ui/ThemedInput';
import ThemedSelect from '../components/ui/ThemedSelect'; // Import ThemedSelect
import { SelectItem } from '../components/ui/select'; // Import SelectItem

interface FinishedGood {
  id: string;
  product_id: string;
  production_order_id: string;
  batch_number: string;
  quantity: number;
  production_date: string;
  expiry_date: string;
  quality_status: string;
  location_id: string;
  unit_cost: number;
  total_cost: number;
  status: string;
  notes: string;
}

export default function FinishedGoods() {
  const {
    data: goods,
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
  } = useCRUD<FinishedGood>({
    table: 'finished_goods_inventory',
    columns: 'id, product_id, production_order_id, batch_number, quantity, production_date, expiry_date, quality_status, location_id, unit_cost, total_cost, status, notes',
    rolePermissions: ['admin', 'warehouse_staff']
  });

  const columns = [
    { key: 'product_id' as keyof FinishedGood, label: 'Product ID' },
    { key: 'batch_number' as keyof FinishedGood, label: 'Batch Number' },
    { 
      key: 'quantity' as keyof FinishedGood, 
      label: 'Quantity',
      render: (value: number) => value?.toLocaleString() || '0'
    },
    { key: 'production_date' as keyof FinishedGood, label: 'Production Date' },
    { key: 'expiry_date' as keyof FinishedGood, label: 'Expiry Date' },
    { 
      key: 'quality_status' as keyof FinishedGood, 
      label: 'Quality Status',
      render: (value: string) => {
        const colors = {
          approved: 'text-green-600',
          quarantine: 'text-yellow-600',
          rejected: 'text-red-600',
          hold: 'text-orange-600'
        };
        return <span className={colors[value as keyof typeof colors] || 'text-gray-600'}>{value}</span>;
      }
    },
    { 
      key: 'unit_cost' as keyof FinishedGood, 
      label: 'Unit Cost',
      render: (value: number) => `$${value?.toFixed(2) || '0.00'}`
    },
    { 
      key: 'total_cost' as keyof FinishedGood, 
      label: 'Total Value',
      render: (value: number) => `$${value?.toFixed(2) || '0.00'}`
    },
    { 
      key: 'status' as keyof FinishedGood, 
      label: 'Status',
      render: (value: string) => {
        const colors = {
          available: 'text-green-600',
          reserved: 'text-blue-600',
          shipped: 'text-gray-600',
          damaged: 'text-red-600'
        };
        return <span className={colors[value as keyof typeof colors] || 'text-gray-600'}>{value}</span>;
      }
    }
  ];

  const qualityStatuses = Array.from(new Set(goods.map(g => g.quality_status).filter(Boolean)));
  const statuses = Array.from(new Set(goods.map(g => g.status).filter(Boolean)));

  if (loading) return <div>Loading...</div>;

  return (
    <div className="p-4">
      {/* <h1 className="text-2xl font-bold mb-4">Finished Goods Inventory</h1> */}
      
      <DataTable
        data={goods}
        columns={columns}
        searchable
        filterable
        filterOptions={{ key: 'quality_status', options: qualityStatuses }}
        paginated
        pageSize={10}
        canEdit={canEdit()}
        onAdd={() => openForm()}
        onEdit={openForm}
        onDelete={handleDelete}
        addButtonText="Add Finished Good"
      />

      <FormModal
        isOpen={showForm}
        onClose={closeForm}
        onSubmit={handleSubmit}
        title={`${editing ? 'Edit' : 'Add'} Finished Good`}
      >
        <ThemedInput
          placeholder="Product ID"
          value={form.product_id || ''}
          onChange={e => setForm(f => ({ ...f, product_id: e.target.value }))}
          required
        />
        <ThemedInput
          placeholder="Production Order ID"
          value={form.production_order_id || ''}
          onChange={e => setForm(f => ({ ...f, production_order_id: e.target.value }))}
        />
        <ThemedInput
          placeholder="Batch Number"
          value={form.batch_number || ''}
          onChange={e => setForm(f => ({ ...f, batch_number: e.target.value }))}
        />
        <ThemedInput
          placeholder="Quantity"
          type="number"
          value={form.quantity || ''}
          onChange={e => setForm(f => ({ ...f, quantity: Number(e.target.value) }))}
          required
        />
        <div className="grid grid-cols-2 gap-2">
          <ThemedInput
            placeholder="Production Date"
            type="date"
            value={form.production_date || ''}
            onChange={e => setForm(f => ({ ...f, production_date: e.target.value }))}
          />
          <ThemedInput
            placeholder="Expiry Date"
            type="date"
            value={form.expiry_date || ''}
            onChange={e => setForm(f => ({ ...f, expiry_date: e.target.value }))}
          />
        </div>
        <ThemedInput
          placeholder="Location ID"
          value={form.location_id || ''}
          onChange={e => setForm(f => ({ ...f, location_id: e.target.value }))}
        />
        <div className="grid grid-cols-2 gap-2">
          <ThemedInput
            placeholder="Unit Cost"
            type="number"
            step="0.01"
            value={form.unit_cost || ''}
            onChange={e => setForm(f => ({ ...f, unit_cost: Number(e.target.value) }))}
          />
          <ThemedInput
            placeholder="Total Cost"
            type="number"
            step="0.01"
            value={form.total_cost || ''}
            onChange={e => setForm(f => ({ ...f, total_cost: Number(e.target.value) }))}
          />
        </div>
        <ThemedSelect
          value={form.quality_status || 'approved'}
          onValueChange={value => setForm(f => ({ ...f, quality_status: value }))}
          className="mb-2"
          placeholder="Select Quality Status"
        >
          <SelectItem value="approved">Approved</SelectItem>
          <SelectItem value="quarantine">Quarantine</SelectItem>
          <SelectItem value="rejected">Rejected</SelectItem>
          <SelectItem value="hold">Hold</SelectItem>
        </ThemedSelect>
        <ThemedSelect
          value={form.status || 'available'}
          onValueChange={value => setForm(f => ({ ...f, status: value }))}
          className="mb-2"
          placeholder="Select Status"
        >
          <SelectItem value="available">Available</SelectItem>
          <SelectItem value="reserved">Reserved</SelectItem>
          <SelectItem value="shipped">Shipped</SelectItem>
          <SelectItem value="damaged">Damaged</SelectItem>
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