import React from 'react';
import { useCRUD } from '@/hooks/useCRUD';
import { DataTable } from '@/components/common/DataTable';
import { FormModal } from '@/components/common/FormModal';
import ThemedInput from '@/components/ui/ThemedInput';

interface RawMaterial {
  id: string;
  material_code: string;
  name: string;
  description: string;
  category: string;
  material_type: string;
  supplier: string;
  unit_of_measure: string;
  current_stock: number;
  minimum_stock: number;
  maximum_stock: number;
  reorder_point: number;
  reorder_quantity: number;
  unit_cost: number;
  storage_location: string;
  shelf_life_days: number;
  is_active: boolean;
  image_url: string;
}

export default function RawMaterials() {
  const {
    data: materials,
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
  } = useCRUD<RawMaterial>({
    table: 'raw_materials',
    columns: 'id, material_code, name, description, category, material_type, supplier, unit_of_measure, current_stock, minimum_stock, maximum_stock, reorder_point, reorder_quantity, unit_cost, storage_location, shelf_life_days, is_active, image_url',
    rolePermissions: ['admin', 'warehouse_staff']
  });

  const columns = [
    { key: 'material_code' as keyof RawMaterial, label: 'Code' },
    { key: 'name' as keyof RawMaterial, label: 'Name' },
    { key: 'category' as keyof RawMaterial, label: 'Category' },
    { key: 'material_type' as keyof RawMaterial, label: 'Type' },
    { key: 'supplier' as keyof RawMaterial, label: 'Supplier' },
    { 
      key: 'current_stock' as keyof RawMaterial, 
      label: 'Current Stock',
      render: (value: number, item: RawMaterial) => `${value || 0} ${item.unit_of_measure || ''}`
    },
    { 
      key: 'minimum_stock' as keyof RawMaterial, 
      label: 'Min Stock',
      render: (value: number, item: RawMaterial) => `${value || 0} ${item.unit_of_measure || ''}`
    },
    { 
      key: 'unit_cost' as keyof RawMaterial, 
      label: 'Unit Cost',
      render: (value: number) => `$${value?.toFixed(2) || '0.00'}`
    },
    { 
      key: 'stock_status' as any, 
      label: 'Stock Status',
      render: (value: number, item: RawMaterial) => {
        const stockValue = item.current_stock;
        if (stockValue <= (item.minimum_stock * 0.5)) return <span className="text-red-600 font-bold">Critical</span>;
        if (stockValue <= item.minimum_stock) return <span className="text-orange-600 font-bold">Low</span>;
        if (stockValue >= item.maximum_stock) return <span className="text-blue-600 font-bold">Overstock</span>;
        return <span className="text-green-600">Normal</span>;
      }
    },
    { 
      key: 'is_active' as keyof RawMaterial, 
      label: 'Status',
      render: (value: boolean) => value ? 'Active' : 'Inactive'
    }
  ];

  const categories = Array.from(new Set(materials.map(m => m.category).filter(Boolean)));

  if (loading) return <div>Loading...</div>;

  return (
    <div className="p-4">
      {/* <h1 className="text-2xl font-bold mb-4">Raw Materials Management</h1> */}
      
      <DataTable
        data={materials}
        columns={columns}
        searchable
        filterable
        filterOptions={{ key: 'category', options: categories }}
        paginated
        pageSize={10}
        canEdit={canEdit()}
        onAdd={() => openForm()}
        onEdit={openForm}
        onDelete={handleDelete}
        addButtonText="Add Material"
      />

      <FormModal
        isOpen={showForm}
        onClose={closeForm}
        onSubmit={handleSubmit}
        title={`${editing ? 'Edit' : 'Add'} Raw Material`}
      >
        <ThemedInput
          placeholder="Material Code"
          value={form.material_code || ''}
          onChange={e => setForm(f => ({ ...f, material_code: e.target.value }))}
          required
        />
        <ThemedInput
          placeholder="Material Name"
          value={form.name || ''}
          onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
          required
        />
        <ThemedInput
          placeholder="Description"
          value={form.description || ''}
          onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
        />
        <select
          className="w-full p-2 mb-2 bg-transparent border rounded-md focus:outline-none focus:ring-2"
          value={form.category || ''}
          onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
        >
          <option value="">Select Category</option>
          <option value="resin">Resin</option>
          <option value="colorant">Colorant</option>
          <option value="additive">Additive</option>
          <option value="packaging">Packaging</option>
        </select>
        <ThemedInput
          placeholder="Material Type"
          value={form.material_type || ''}
          onChange={e => setForm(f => ({ ...f, material_type: e.target.value }))}
        />
        <ThemedInput
          placeholder="Supplier"
          value={form.supplier || ''}
          onChange={e => setForm(f => ({ ...f, supplier: e.target.value }))}
        />
        <ThemedInput
          placeholder="Unit of Measure"
          value={form.unit_of_measure || ''}
          onChange={e => setForm(f => ({ ...f, unit_of_measure: e.target.value }))}
        />
        <div className="grid grid-cols-2 gap-2">
          <ThemedInput
            placeholder="Current Stock"
            type="number"
            step="0.01"
            value={form.current_stock || ''}
            onChange={e => setForm(f => ({ ...f, current_stock: Number(e.target.value) }))}
          />
          <ThemedInput
            placeholder="Minimum Stock"
            type="number"
            step="0.01"
            value={form.minimum_stock || ''}
            onChange={e => setForm(f => ({ ...f, minimum_stock: Number(e.target.value) }))}
          />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <ThemedInput
            placeholder="Maximum Stock"
            type="number"
            step="0.01"
            value={form.maximum_stock || ''}
            onChange={e => setForm(f => ({ ...f, maximum_stock: Number(e.target.value) }))}
          />
          <ThemedInput
            placeholder="Reorder Point"
            type="number"
            step="0.01"
            value={form.reorder_point || ''}
            onChange={e => setForm(f => ({ ...f, reorder_point: Number(e.target.value) }))}
          />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <ThemedInput
            placeholder="Reorder Quantity"
            type="number"
            step="0.01"
            value={form.reorder_quantity || ''}
            onChange={e => setForm(f => ({ ...f, reorder_quantity: Number(e.target.value) }))}
          />
          <ThemedInput
            placeholder="Unit Cost"
            type="number"
            step="0.01"
            value={form.unit_cost || ''}
            onChange={e => setForm(f => ({ ...f, unit_cost: Number(e.target.value) }))}
          />
        </div>
        <ThemedInput
          placeholder="Storage Location"
          value={form.storage_location || ''}
          onChange={e => setForm(f => ({ ...f, storage_location: e.target.value }))}
        />
        <ThemedInput
          placeholder="Shelf Life (days)"
          type="number"
          value={form.shelf_life_days || ''}
          onChange={e => setForm(f => ({ ...f, shelf_life_days: Number(e.target.value) }))}
        />
        <ThemedInput
          placeholder="Image URL"
          value={form.image_url || ''}
          onChange={e => setForm(f => ({ ...f, image_url: e.target.value }))}
        />
        <select
          className="w-full p-2 mb-2 bg-transparent border rounded-md focus:outline-none focus:ring-2"
          value={form.is_active ? 'true' : 'false'}
          onChange={e => setForm(f => ({ ...f, is_active: e.target.value === 'true' }))}
        >
          <option value="true">Active</option>
          <option value="false">Inactive</option>
        </select>
      </FormModal>
    </div>
  );
}