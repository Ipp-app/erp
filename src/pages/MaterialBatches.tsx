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
  quantity_received: number; // Changed from 'quantity'
  unit_of_measure: string;
  received_date: string;
  expiry_date: string;
  supplier_id: string;
  unit_cost: number;
  // total_cost is a derived field, not stored in DB
  storage_location: string;
  quality_status: string; // Changed from 'status'
  notes: string;
  raw_materials?: { name: string; material_code: string; unit_of_measure: string } | null;
  suppliers?: { company_name: string } | null;
}

// Extend MaterialBatch for form state to include total_cost as a temporary field
interface MaterialBatchForm extends MaterialBatch {
  total_cost?: number;
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
  } = useCRUD<MaterialBatchForm>({ // Use MaterialBatchForm for CRUD operations
    table: 'material_batches',
    columns: 'id, batch_number, material_id, quantity_received, unit_of_measure, received_date, expiry_date, supplier_id, unit_cost, storage_location, quality_status, notes, raw_materials(name, material_code, unit_of_measure), suppliers(company_name)', // Removed total_cost, changed quantity to quantity_received, status to quality_status
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

  // Calculate total_cost whenever quantity_received or unit_cost changes
  useEffect(() => {
    if (form.quantity_received !== undefined && form.unit_cost !== undefined) {
      setForm(f => ({ ...f, total_cost: (f.quantity_received || 0) * (f.unit_cost || 0) }));
    }
  }, [form.quantity_received, form.unit_cost, setForm]);

  const columns = [
    { key: 'batch_number' as keyof MaterialBatch, label: 'Batch Number' },
    { 
      key: 'material_id' as keyof MaterialBatch, 
      label: 'Material',
      render: (value: string, item: MaterialBatch) => item.raw_materials?.name || value
    },
    { 
      key: 'quantity_received' as keyof MaterialBatch, // Changed from 'quantity'
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
      key: 'total_cost' as keyof MaterialBatchForm, // Use MaterialBatchForm for rendering total_cost
      label: 'Total Cost',
      render: (value: number, item: MaterialBatchForm) => `$${((item.quantity_received || 0) * (item.unit_cost || 0))?.toFixed(2) || '0.00'}` // Calculate on the fly for display
    },
    { key: 'storage_location' as keyof MaterialBatch, label: 'Location' },
    { 
      key: 'quality_status' as keyof MaterialBatch, // Changed from 'status'
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

  const statuses = Array.from(new Set(batches.map(b => b.quality_status).filter(Boolean))); // Changed from 'status'
  const materialNames = Array.from(new Set(batches.map(b => b.raw_materials?.name || '').filter(Boolean)));

  if (loading || loadingRelations) return <div>Loading Material Batches...</div>;

  return (
    <div className="p-4">
      <DataTable
        data={batches}
        columns={columns as any} // Cast to any to temporarily bypass complex type inference issues
        searchable
        filterable
        filterOptions={{ key: 'quality_status', options: statuses }} // Changed from 'status'
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
          placeholder="Quantity Received" // Changed from 'Quantity'
          type="number"
          step="0.01"
          value={form.quantity_received || ''} // Changed from 'quantity'
          onChange={e => setForm(f => ({ ...f, quantity_received: Number(e.target.value) }))} // Changed from 'quantity'
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
          disabled // Total cost is calculated automatically
        />
        <ThemedInput
          placeholder="Storage Location"
          value={form.storage_location || ''}
          onChange={e => setForm(f => ({ ...f, storage_location: e.target.value }))}
        />
        <ThemedSelect
          value={form.quality_status || 'in_stock'} // Changed from 'status'
          onValueChange={value => setForm(f => ({ ...f, quality_status: value }))} // Changed from 'status'
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