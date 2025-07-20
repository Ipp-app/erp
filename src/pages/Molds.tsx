import React from 'react';
import { useCRUD } from '@/hooks/useCRUD';
import { DataTable } from '@/components/common/DataTable';
import { FormModal } from '@/components/common/FormModal';
import ThemedInput from '@/components/ui/ThemedInput';
import ThemedSelect from '@/components/ui/ThemedSelect'; // Import ThemedSelect
import { SelectItem } from '@/components/ui/select'; // Import SelectItem


interface Mold {
  id: string;
  mold_code: string;
  name: string;
  mold_type: string;
  number_of_cavities: number;
  material: string;
  weight: number;
  dimensions_length: number;
  dimensions_width: number;
  dimensions_height: number;
  cycle_time_standard: number;
  current_shot_count: number;
  condition_rating: string;
  location: string;
  status: string;
  purchase_date: string;
  purchase_cost: number;
  supplier: string;
  image_url: string;
}

export default function Molds() {
  const {
    data: molds,
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
  } = useCRUD<Mold>({
    table: 'molds',
    columns: 'id, mold_code, name, mold_type, number_of_cavities, material, weight, dimensions_length, dimensions_width, dimensions_height, cycle_time_standard, current_shot_count, condition_rating, location, status, purchase_date, purchase_cost, supplier, image_url',
    rolePermissions: ['admin', 'production_manager']
  });

  const columns = [
    { key: 'mold_code' as keyof Mold, label: 'Code' },
    { key: 'name' as keyof Mold, label: 'Name' },
    { key: 'mold_type' as keyof Mold, label: 'Type' },
    { key: 'number_of_cavities' as keyof Mold, label: 'Cavities' },
    { key: 'material' as keyof Mold, label: 'Material' },
    { 
      key: 'weight' as keyof Mold, 
      label: 'Weight (kg)',
      render: (value: number) => value?.toFixed(2) || '0'
    },
    { 
      key: 'cycle_time_standard' as keyof Mold, 
      label: 'Cycle Time (s)',
      render: (value: number) => value?.toFixed(2) || '0'
    },
    { 
      key: 'current_shot_count' as keyof Mold, 
      label: 'Shot Count',
      render: (value: number) => value?.toLocaleString() || '0'
    },
    { key: 'condition_rating' as keyof Mold, label: 'Condition' },
    { key: 'status' as keyof Mold, label: 'Status' },
    { 
      key: 'image_url' as keyof Mold, 
      label: 'Image',
      render: (value: string) => value ? 
        <img src={value} alt="mold" className="w-12 h-12 object-cover" /> : '-'
    }
  ];

  const moldTypes = Array.from(new Set(molds.map(m => m.mold_type).filter(Boolean)));
  const conditions = Array.from(new Set(molds.map(m => m.condition_rating).filter(Boolean)));

  if (loading) return <div>Loading...</div>;

  return (
    <div className="p-4">
      {/* <h1 className="text-2xl font-bold mb-4">Molds Management</h1> */}
      <DataTable
        data={molds}
        columns={columns}
        searchable
        filterable
        filterOptions={{ key: 'mold_type', options: moldTypes }}
        paginated
        pageSize={10}
        canEdit={canEdit()}
        onAdd={() => openForm()}
        onEdit={openForm}
        onDelete={handleDelete}
        addButtonText="Add Mold"
      />

      <FormModal
        isOpen={showForm}
        onClose={closeForm}
        onSubmit={handleSubmit}
        title={`${editing ? 'Edit' : 'Add'} Mold`}
      >
        <ThemedInput
          placeholder="Mold Code"
          value={form.mold_code || ''}
          onChange={e => setForm(f => ({ ...f, mold_code: e.target.value }))}
          required
        />
        <ThemedInput
          placeholder="Mold Name"
          value={form.name || ''}
          onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
          required
        />
        <ThemedSelect
          value={form.mold_type || ''}
          onValueChange={value => setForm(f => ({ ...f, mold_type: value }))}
          className="mb-2"
          placeholder="Select Type"
        >
          <SelectItem value="single_cavity">Single Cavity</SelectItem>
          <SelectItem value="multi_cavity">Multi Cavity</SelectItem>
          <SelectItem value="family">Family</SelectItem>
          <SelectItem value="stack">Stack</SelectItem>
        </ThemedSelect>
        <ThemedInput
          placeholder="Number of Cavities"
          type="number"
          value={form.number_of_cavities || ''}
          onChange={e => setForm(f => ({ ...f, number_of_cavities: Number(e.target.value) }))}
          required
        />
        <ThemedInput
          placeholder="Material"
          value={form.material || ''}
          onChange={e => setForm(f => ({ ...f, material: e.target.value }))}
        />
        <ThemedInput
          placeholder="Weight (kg)"
          type="number"
          step="0.01"
          value={form.weight || ''}
          onChange={e => setForm(f => ({ ...f, weight: Number(e.target.value) }))}
        />
        <div className="grid grid-cols-3 gap-2">
          <ThemedInput
            placeholder="Length (mm)"
            type="number"
            step="0.01"
            value={form.dimensions_length || ''}
            onChange={e => setForm(f => ({ ...f, dimensions_length: Number(e.target.value) }))}
          />
          <ThemedInput
            placeholder="Width (mm)"
            type="number"
            step="0.01"
            value={form.dimensions_width || ''}
            onChange={e => setForm(f => ({ ...f, dimensions_width: Number(e.target.value) }))}
          />
          <ThemedInput
            placeholder="Height (mm)"
            type="number"
            step="0.01"
            value={form.dimensions_height || ''}
            onChange={e => setForm(f => ({ ...f, dimensions_height: Number(e.target.value) }))}
          />
        </div>
        <ThemedInput
          placeholder="Cycle Time Standard (seconds)"
          type="number"
          step="0.01"
          value={form.cycle_time_standard || ''}
          onChange={e => setForm(f => ({ ...f, cycle_time_standard: Number(e.target.value) }))}
        />
        <ThemedInput
          placeholder="Location"
          value={form.location || ''}
          onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
        />
        <ThemedInput
          placeholder="Purchase Date"
          type="date"
          value={form.purchase_date || ''}
          onChange={e => setForm(f => ({ ...f, purchase_date: e.target.value }))}
        />
        <ThemedInput
          placeholder="Purchase Cost"
          type="number"
          step="0.01"
          value={form.purchase_cost || ''}
          onChange={e => setForm(f => ({ ...f, purchase_cost: Number(e.target.value) }))}
        />
        <ThemedInput
          placeholder="Supplier"
          value={form.supplier || ''}
          onChange={e => setForm(f => ({ ...f, supplier: e.target.value }))}
        />
        <ThemedInput
          placeholder="Image URL"
          value={form.image_url || ''}
          onChange={e => setForm(f => ({ ...f, image_url: e.target.value }))}
        />
        <ThemedSelect
          value={form.condition_rating || 'excellent'}
          onValueChange={value => setForm(f => ({ ...f, condition_rating: value }))}
          className="mb-2"
          placeholder="Select Condition"
        >
          <SelectItem value="excellent">Excellent</SelectItem>
          <SelectItem value="good">Good</SelectItem>
          <SelectItem value="fair">Fair</SelectItem>
          <SelectItem value="poor">Poor</SelectItem>
        </ThemedSelect>
        <ThemedSelect
          value={form.status || 'available'}
          onValueChange={value => setForm(f => ({ ...f, status: value }))}
          className="mb-2"
          placeholder="Select Status"
        >
          <SelectItem value="available">Available</SelectItem>
          <SelectItem value="in_use">In Use</SelectItem>
          <SelectItem value="maintenance">Maintenance</SelectItem>
          <SelectItem value="damaged">Damaged</SelectItem>
          <SelectItem value="retired">Retired</SelectItem>
        </ThemedSelect>
      </FormModal>
    </div>
  );
}