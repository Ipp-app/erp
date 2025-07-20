import React from 'react';
import { useCRUD } from '@/hooks/useCRUD';
import { DataTable } from '@/components/common/DataTable';
import { FormModal } from '@/components/common/FormModal';
import ThemedInput from '@/components/ui/ThemedInput';


interface Machine {
  id: string;
  machine_code: string;
  name: string;
  machine_type: string;
  brand: string;
  model: string;
  serial_number: string;
  year_manufactured: number;
  tonnage: number;
  shot_size_capacity: number;
  status: string;
  location: string;
  installation_date: string;
  last_maintenance_date: string;
  next_maintenance_date: string;
  total_operating_hours: number;
  total_shots: number;
  hourly_rate: number;
}

export default function Machines() {
  const {
    data: machines,
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
  } = useCRUD<Machine>({
    table: 'machines',
    columns: 'id, machine_code, name, machine_type, brand, model, serial_number, year_manufactured, tonnage, shot_size_capacity, status, location, installation_date, last_maintenance_date, next_maintenance_date, total_operating_hours, total_shots, hourly_rate',
    rolePermissions: ['admin', 'production_manager']
  });

  const columns = [
    { key: 'machine_code' as keyof Machine, label: 'Code' },
    { key: 'name' as keyof Machine, label: 'Name' },
    { key: 'machine_type' as keyof Machine, label: 'Type' },
    { key: 'brand' as keyof Machine, label: 'Brand' },
    { key: 'model' as keyof Machine, label: 'Model' },
    { key: 'tonnage' as keyof Machine, label: 'Tonnage' },
    { key: 'status' as keyof Machine, label: 'Status' },
    { key: 'location' as keyof Machine, label: 'Location' },
    { 
      key: 'total_operating_hours' as keyof Machine, 
      label: 'Operating Hours',
      render: (value: number) => value?.toLocaleString() || '0'
    },
    { 
      key: 'hourly_rate' as keyof Machine, 
      label: 'Rate/Hour',
      render: (value: number) => `$${value || 0}`
    }
  ];

  const machineTypes = Array.from(new Set(machines.map(m => m.machine_type).filter(Boolean)));
  const statuses = Array.from(new Set(machines.map(m => m.status).filter(Boolean)));

  if (loading) return <div>Loading...</div>;

  return (
    <div className="p-4">
      {/* <h1 className="text-2xl font-bold mb-4">Machines Management</h1> */}
      <DataTable
        data={machines}
        columns={columns}
        searchable
        filterable
        filterOptions={{ key: 'machine_type', options: machineTypes }}
        paginated
        pageSize={10}
        canEdit={canEdit()}
        onAdd={() => openForm()}
        onEdit={openForm}
        onDelete={handleDelete}
        addButtonText="Add Machine"
      />

      <FormModal
        isOpen={showForm}
        onClose={closeForm}
        onSubmit={handleSubmit}
        title={`${editing ? 'Edit' : 'Add'} Machine`}
      >
        <ThemedInput
          placeholder="Machine Code"
          value={form.machine_code || ''}
          onChange={e => setForm(f => ({ ...f, machine_code: e.target.value }))}
          required
        />
        <ThemedInput
          placeholder="Machine Name"
          value={form.name || ''}
          onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
          required
        />
        <select
          className="border p-2 mb-2 w-full"
          value={form.machine_type || ''}
          onChange={e => setForm(f => ({ ...f, machine_type: e.target.value }))}
        >
          <option value="">Select Type</option>
          <option value="injection">Injection</option>
          <option value="blow">Blow</option>
          <option value="auxiliary">Auxiliary</option>
        </select>
        <ThemedInput
          placeholder="Brand"
          value={form.brand || ''}
          onChange={e => setForm(f => ({ ...f, brand: e.target.value }))}
        />
        <ThemedInput
          placeholder="Model"
          value={form.model || ''}
          onChange={e => setForm(f => ({ ...f, model: e.target.value }))}
        />
        <ThemedInput
          placeholder="Serial Number"
          value={form.serial_number || ''}
          onChange={e => setForm(f => ({ ...f, serial_number: e.target.value }))}
        />
        <ThemedInput
          placeholder="Year Manufactured"
          type="number"
          value={form.year_manufactured || ''}
          onChange={e => setForm(f => ({ ...f, year_manufactured: Number(e.target.value) }))}
        />
        <ThemedInput
          placeholder="Tonnage"
          type="number"
          value={form.tonnage || ''}
          onChange={e => setForm(f => ({ ...f, tonnage: Number(e.target.value) }))}
        />
        <ThemedInput
          placeholder="Shot Size Capacity (grams)"
          type="number"
          step="0.01"
          value={form.shot_size_capacity || ''}
          onChange={e => setForm(f => ({ ...f, shot_size_capacity: Number(e.target.value) }))}
        />
        <ThemedInput
          placeholder="Location"
          value={form.location || ''}
          onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
        />
        <ThemedInput
          placeholder="Installation Date"
          type="date"
          value={form.installation_date || ''}
          onChange={e => setForm(f => ({ ...f, installation_date: e.target.value }))}
        />
        <ThemedInput
          placeholder="Hourly Rate"
          type="number"
          step="0.01"
          value={form.hourly_rate || ''}
          onChange={e => setForm(f => ({ ...f, hourly_rate: Number(e.target.value) }))}
        />
        <select
          className="border p-2 mb-2 w-full"
          value={form.status || 'active'}
          onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
        >
          <option value="active">Active</option>
          <option value="maintenance">Maintenance</option>
          <option value="breakdown">Breakdown</option>
          <option value="inactive">Inactive</option>
        </select>
      </FormModal>
    </div>
  );
}