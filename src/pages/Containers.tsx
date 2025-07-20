import React from 'react';
import { useCRUD } from '@/hooks/useCRUD';
import { DataTable } from '@/components/common/DataTable';
import { FormModal } from '@/components/common/FormModal';
import ThemedInput from '@/components/ui/ThemedInput';
import ThemedSelect from '@/components/ui/ThemedSelect';
import { SelectItem } from '@/components/ui/select';

interface Container {
  id: string;
  container_code: string;
  container_type: string;
  capacity_unit: string;
  capacity_value: number;
  current_fill_level: number;
  status: string;
  location: string;
  last_cleaned_date: string;
  notes: string;
}

export default function Containers() {
  const {
    data: containers,
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
  } = useCRUD<Container>({
    table: 'containers',
    // Sederhanakan query untuk debugging
    columns: 'id, container_code, status',
    rolePermissions: ['admin', 'warehouse_staff']
  });

  const columns = [
    { key: 'container_code' as keyof Container, label: 'Code' },
    { key: 'container_type' as keyof Container, label: 'Type' },
    { 
      key: 'capacity_value' as keyof Container, 
      label: 'Capacity',
      render: (value: number, item: Container) => `${value?.toLocaleString() || '0'} ${item.capacity_unit || ''}`
    },
    { 
      key: 'current_fill_level' as keyof Container, 
      label: 'Fill Level',
      render: (value: number, item: Container) => {
        const fillPercentage = item.capacity_value > 0 ? (value / item.capacity_value * 100) : 0;
        return `${value?.toLocaleString() || '0'} ${item.capacity_unit || ''} (${fillPercentage.toFixed(1)}%)`;
      }
    },
    { key: 'location' as keyof Container, label: 'Location' },
    { 
      key: 'status' as keyof Container, 
      label: 'Status',
      render: (value: string) => {
        const colors = {
          empty: 'text-gray-600',
          filling: 'text-blue-600',
          full: 'text-green-600',
          in_use: 'text-purple-600',
          maintenance: 'text-orange-600',
          damaged: 'text-red-600'
        };
        return <span className={colors[value as keyof typeof colors] || 'text-gray-600'}>{value}</span>;
      }
    },
    { key: 'last_cleaned_date' as keyof Container, label: 'Last Cleaned' }
  ];

  const containerTypes = Array.from(new Set(containers.map(c => c.container_type).filter(Boolean)));
  const statuses = Array.from(new Set(containers.map(c => c.status).filter(Boolean)));

  if (loading) return <div>Loading Containers...</div>;

  return (
    <div className="p-4">
      <DataTable
        data={containers}
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
        addButtonText="Add Container"
      />

      <FormModal
        isOpen={showForm}
        onClose={closeForm}
        onSubmit={handleSubmit}
        title={`${editing ? 'Edit' : 'Add'} Container`}
      >
        <ThemedInput
          placeholder="Container Code"
          value={form.container_code || ''}
          onChange={e => setForm(f => ({ ...f, container_code: e.target.value }))}
          required
        />
        <ThemedSelect
          value={form.container_type || ''}
          onValueChange={value => setForm(f => ({ ...f, container_type: value }))}
          className="mb-2"
          placeholder="Select Container Type"
        >
          <SelectItem value="bin">Bin</SelectItem>
          <SelectItem value="pallet">Pallet</SelectItem>
          <SelectItem value="drum">Drum</SelectItem>
          <SelectItem value="tank">Tank</SelectItem>
          <SelectItem value="crate">Crate</SelectItem>
        </ThemedSelect>
        <ThemedInput
          placeholder="Capacity Unit"
          value={form.capacity_unit || ''}
          onChange={e => setForm(f => ({ ...f, capacity_unit: e.target.value }))}
          required
        />
        <ThemedInput
          placeholder="Capacity Value"
          type="number"
          step="0.01"
          value={form.capacity_value || ''}
          onChange={e => setForm(f => ({ ...f, capacity_value: Number(e.target.value) }))}
          required
        />
        <ThemedInput
          placeholder="Current Fill Level"
          type="number"
          step="0.01"
          value={form.current_fill_level || ''}
          onChange={e => setForm(f => ({ ...f, current_fill_level: Number(e.target.value) }))}
        />
        <ThemedInput
          placeholder="Location"
          value={form.location || ''}
          onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
        />
        <ThemedInput
          placeholder="Last Cleaned Date"
          type="date"
          value={form.last_cleaned_date || ''}
          onChange={e => setForm(f => ({ ...f, last_cleaned_date: e.target.value }))}
        />
        <ThemedSelect
          value={form.status || 'empty'}
          onValueChange={value => setForm(f => ({ ...f, status: value }))}
          className="mb-2"
          placeholder="Select Status"
        >
          <SelectItem value="empty">Empty</SelectItem>
          <SelectItem value="filling">Filling</SelectItem>
          <SelectItem value="full">Full</SelectItem>
          <SelectItem value="in_use">In Use</SelectItem>
          <SelectItem value="maintenance">Maintenance</SelectItem>
          <SelectItem value="damaged">Damaged</SelectItem>
        </ThemedSelect>
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