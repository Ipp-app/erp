import React, { useEffect, useState } from 'react';
import { useCRUD } from '@/hooks/useCRUD';
import { DataTable } from '@/components/common/DataTable';
import { FormModal } from '@/components/common/FormModal';
import ThemedInput from '@/components/ui/ThemedInput';
import ThemedSelect from '@/components/ui/ThemedSelect';
import { SelectItem } from '@/components/ui/select';
import { supabase } from '@/lib/supabaseClient';

interface MaterialBatch {
  id: string;
  batch_number: string;
  material_id: string;
  quantity: number;
  unit_of_measure: string;
  received_date: string;
  expiry_date: string;
  supplier_id: string;
  unit_cost: number;
  total_cost: number;
  storage_location: string;
  status: string;
  notes: string;
  raw_materials?: { name: string; material_code: string; unit_of_measure: string } | null; // For joining raw material name
  suppliers?: { company_name: string } | null; // For joining supplier name
}

interface RawMaterial {
  id: string;
  name: string;
  material_code: string;
  unit_of_measure: string;
}

interface Supplier {
  id: string;
  company_name: string;
}

export default function MaterialBatches() {
  const {
    data: batches,
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
  } = useCRUD<MaterialBatch>({
    table: 'material_batches',
    columns: 'id, batch_number, material_id, quantity, unit_of_measure, received_date, expiry_date, supplier_id, unit_cost, total_cost, storage_location, status, notes, raw_materials(name, material_code, unit_of_measure), suppliers(company_name)', // Fetch related data
    rolePermissions: ['admin', 'warehouse_staff']
  });

  const [rawMaterials, setRawMaterials] = useState<RawMaterial[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loadingRelations, setLoadingRelations] = useState(true);

  useEffect(() => {
    async function fetchRelations() {
      setLoadingRelations(true);
      const [{ data: materialsData, error: materialsError }, { data: suppliersData, error: suppliersError }] = await Promise.all([
        supabase.from('raw_materials').select('id, name, material_code, unit_of_measure'),
        supabase.from('suppliers').select('id, company_name')
      ]);

      if (materialsError) console.error('Error fetching raw materials:', materialsError);
      else setRawMaterials(materialsData || []);

      if (suppliersError) console.error('Error fetching suppliers:', suppliersError);
      else setSuppliers(suppliersData || []);

      setLoadingRelations(false);
    }
    fetchRelations();
  }, []);

  // Calculate total_cost whenever quantity or unit_cost changes
  useEffect(() => {
    if (form.quantity !== undefined && form.unit_cost !== undefined) {
      setForm(f => ({ ...f, total_cost: (f.quantity || 0) * (f.unit_cost || 0) }));
    }
  }, [form.quantity, form.unit_cost, setForm]);

  const columns = [
    { key: 'batch_number' as keyof MaterialBatch, label: 'Batch Number' },
    { 
      key: 'material_id' as keyof MaterialBatch, 
      label: 'Material',
      render: (value: string, item: MaterialBatch) => item.raw_materials?.name || value
    },
    { 
      key: 'quantity' as keyof MaterialBatch, 
      label: 'Quantity',
      render: (value: number, item: MaterialBatch) => `${value?.toLocaleString() || '0'} ${item.unit_of_measure || ''}`
    },
    { key: 'received_date' as keyof MaterialBatch, label: 'Received Date' },
    { key: 'expiry_date' as keyof MaterialBatch, label: 'Expiry Date' },
    { 
      key: 'supplier_id' as keyof MaterialBatch, 
      label: 'Supplier',
      render: (value: string, item: MaterialBatch) => item.suppliers?.company_name || value
    },
    { 
      key: 'unit_cost' as keyof MaterialBatch, 
      label: 'Unit Cost',
      render: (value: number) => `$${value?.toFixed(2) || '0.00'}`
    },
    { 
      key: 'total_cost' as keyof MaterialBatch, 
      label: 'Total Cost',
      render: (value: number) => `$${value?.toFixed(2) || '0.00'}`
    },
    { key: 'storage_location' as keyof MaterialBatch, label: 'Location' },
    { 
      key: 'status' as keyof MaterialBatch, 
      label: 'Status',
      render: (value: string) => {
        const colors = {
          in_stock: 'text-green-600',
          consumed: 'text-gray-600',
          expired: 'text-red-600',
          quarantine: 'text-yellow-600'
        };
        return <span className={colors[value as keyof typeof colors] || 'text-gray-600'}>{value}</span>;
      }
    }
  ];

  const statuses = Array.from(new Set(batches.map(b => b.status).filter(Boolean)));
  const materialNames = Array.from(new Set(batches.map(b => b.raw_materials?.name || '').filter(Boolean)));

  if (loading || loadingRelations) return <div>Loading Material Batches...</div>;

  return (
    <div className="p-4">
      <DataTable
        data={batches}
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
        addButtonText="Add Material Batch"
      />

      <FormModal
        isOpen={showForm}
        onClose={closeForm}
        onSubmit={handleSubmit}
        title={`${editing ? 'Edit' : 'Add'} Material Batch`}
      >
        <ThemedInput
          placeholder="Batch Number"
          value={form.batch_number || ''}
          onChange={e => setForm(f => ({ ...f, batch_number: e.target.value }))}
          required
        />
        <ThemedSelect
          value={form.material_id || ''}
          onValueChange={value => {
            const selectedMaterial = rawMaterials.find(m => m.id === value);
            setForm(f => ({ 
              ...f, 
              material_id: value, 
              unit_of_measure: selectedMaterial?.unit_of_measure || '' 
            }));
          }}
          className="mb-2"
          placeholder="Select Raw Material"
        >
          {rawMaterials.map(material => (
            <SelectItem key={material.id} value={material.id}>
              {material.name} ({material.material_code})
            </SelectItem>
          ))}
        </ThemedSelect>
        <ThemedInput
          placeholder="Quantity"
          type="number"
          step="0.01"
          value={form.quantity || ''}
          onChange={e => setForm(f => ({ ...f, quantity: Number(e.target.value) }))}
          required
        />
        <ThemedInput
          placeholder="Unit of Measure"
          value={form.unit_of_measure || ''}
          onChange={e => setForm(f => ({ ...f, unit_of_measure: e.target.value }))}
          disabled // Unit of measure is now derived from selected material
        />
        <div className="grid grid-cols-2 gap-2">
          <ThemedInput
            placeholder="Received Date"
            type="date"
            value={form.received_date || ''}
            onChange={e => setForm(f => ({ ...f, received_date: e.target.value }))}
            required
          />
          <ThemedInput
            placeholder="Expiry Date"
            type="date"
            value={form.expiry_date || ''}
            onChange={e => setForm(f => ({ ...f, expiry_date: e.target.value }))}
          />
        </div>
        <ThemedSelect
          value={form.supplier_id || ''}
          onValueChange={value => setForm(f => ({ ...f, supplier_id: value }))}
          className="mb-2"
          placeholder="Select Supplier"
        >
          {suppliers.map(supplier => (
            <SelectItem key={supplier.id} value={supplier.id}>
              {supplier.company_name}
            </SelectItem>
          ))}
        </ThemedSelect>
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
          disabled // Total cost is calculated automatically
        />
        <ThemedInput
          placeholder="Storage Location"
          value={form.storage_location || ''}
          onChange={e => setForm(f => ({ ...f, storage_location: e.target.value }))}
        />
        <ThemedSelect
          value={form.status || 'in_stock'}
          onValueChange={value => setForm(f => ({ ...f, status: value }))}
          className="mb-2"
          placeholder="Select Status"
        >
          <SelectItem value="in_stock">In Stock</SelectItem>
          <SelectItem value="consumed">Consumed</SelectItem>
          <SelectItem value="expired">Expired</SelectItem>
          <SelectItem value="quarantine">Quarantine</SelectItem>
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