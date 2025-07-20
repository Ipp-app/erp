import React from 'react';
import { useCRUD } from '../hooks/useCRUD';
import { DataTable } from '../components/common/DataTable';
import { FormModal } from '../components/common/FormModal';
import ThemedInput from '../components/ui/ThemedInput';
import ThemedSelect from '../components/ui/ThemedSelect'; // Import ThemedSelect
import { SelectItem } from '../components/ui/select'; // Import SelectItem

interface MaintenanceSchedule {
  id: string;
  machine_id: string;
  maintenance_type: string;
  maintenance_item: string;
  description: string;
  frequency_days: number;
  estimated_duration_hours: number;
  last_performed: string;
  next_due_date: string;
  responsible_person: string;
  priority_level: string;
  is_active: boolean;
}

export default function MaintenanceSchedule() {
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
  } = useCRUD<MaintenanceSchedule>({
    table: 'machine_maintenance_schedule',
    columns: 'id, machine_id, maintenance_type, maintenance_item, description, frequency_days, estimated_duration_hours, last_performed, next_due_date, responsible_person, priority_level, is_active',
    rolePermissions: ['admin', 'production_manager']
  });

  const columns = [
    { key: 'machine_id' as keyof MaintenanceSchedule, label: 'Machine ID' },
    { key: 'maintenance_type' as keyof MaintenanceSchedule, label: 'Type' },
    { key: 'maintenance_item' as keyof MaintenanceSchedule, label: 'Item' },
    { 
      key: 'frequency_days' as keyof MaintenanceSchedule, 
      label: 'Frequency',
      render: (value: number) => `${value} days`
    },
    { 
      key: 'estimated_duration_hours' as keyof MaintenanceSchedule, 
      label: 'Duration',
      render: (value: number) => `${value} hours`
    },
    { key: 'last_performed' as keyof MaintenanceSchedule, label: 'Last Performed' },
    { 
      key: 'next_due_date' as keyof MaintenanceSchedule, 
      label: 'Next Due',
      render: (value: string) => {
        const dueDate = new Date(value);
        const today = new Date();
        const isOverdue = dueDate < today;
        const isDueSoon = dueDate <= new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
        
        let className = 'text-green-600';
        if (isOverdue) className = 'text-red-600 font-bold';
        else if (isDueSoon) className = 'text-orange-600 font-bold';
        
        return <span className={className}>{value}</span>;
      }
    },
    { key: 'responsible_person' as keyof MaintenanceSchedule, label: 'Responsible' },
    { 
      key: 'priority_level' as keyof MaintenanceSchedule, 
      label: 'Priority',
      render: (value: string) => {
        const colors = {
          low: 'text-green-600',
          medium: 'text-yellow-600',
          high: 'text-orange-600',
          critical: 'text-red-600'
        };
        return <span className={colors[value as keyof typeof colors] || 'text-gray-600'}>{value}</span>;
      }
    },
    { 
      key: 'is_active' as keyof MaintenanceSchedule, 
      label: 'Status',
      render: (value: boolean) => value ? 'Active' : 'Inactive'
    }
  ];

  const maintenanceTypes = Array.from(new Set(schedules.map(s => s.maintenance_type).filter(Boolean)));
  const priorities = Array.from(new Set(schedules.map(s => s.priority_level).filter(Boolean)));

  if (loading) return <div>Loading...</div>;

  return (
    <div className="p-4">
      {/* <h1 className="text-2xl font-bold mb-4">Maintenance Schedule</h1> */}
      
      <DataTable
        data={schedules}
        columns={columns}
        searchable
        filterable
        filterOptions={{ key: 'maintenance_type', options: maintenanceTypes }}
        paginated
        pageSize={10}
        canEdit={canEdit()}
        onAdd={() => openForm()}
        onEdit={openForm}
        onDelete={handleDelete}
        addButtonText="Add Maintenance Schedule"
      />

      <FormModal
        isOpen={showForm}
        onClose={closeForm}
        onSubmit={handleSubmit}
        title={`${editing ? 'Edit' : 'Add'} Maintenance Schedule`}
      >
        <ThemedInput
          placeholder="Machine ID"
          value={form.machine_id || ''}
          onChange={e => setForm(f => ({ ...f, machine_id: e.target.value }))}
          required
        />
        <ThemedSelect
          value={form.maintenance_type || ''}
          onValueChange={value => setForm(f => ({ ...f, maintenance_type: value }))}
          className="mb-2"
          placeholder="Select Maintenance Type"
        >
          <SelectItem value="">Select Maintenance Type</SelectItem>
          <SelectItem value="daily">Daily</SelectItem>
          <SelectItem value="weekly">Weekly</SelectItem>
          <SelectItem value="monthly">Monthly</SelectItem>
          <SelectItem value="quarterly">Quarterly</SelectItem>
          <SelectItem value="yearly">Yearly</SelectItem>
        </ThemedSelect>
        <ThemedInput
          placeholder="Maintenance Item"
          value={form.maintenance_item || ''}
          onChange={e => setForm(f => ({ ...f, maintenance_item: e.target.value }))}
          required
        />
        <textarea
          className="border p-2 mb-2 w-full"
          placeholder="Description"
          value={form.description || ''}
          onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
          rows={3}
        />
        <div className="grid grid-cols-2 gap-2">
          <ThemedInput
            placeholder="Frequency (days)"
            type="number"
            value={form.frequency_days || ''}
            onChange={e => setForm(f => ({ ...f, frequency_days: Number(e.target.value) }))}
            required
          />
          <ThemedInput
            placeholder="Estimated Duration (hours)"
            type="number"
            step="0.5"
            value={form.estimated_duration_hours || ''}
            onChange={e => setForm(f => ({ ...f, estimated_duration_hours: Number(e.target.value) }))}
          />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <ThemedInput
            placeholder="Last Performed"
            type="date"
            value={form.last_performed || ''}
            onChange={e => setForm(f => ({ ...f, last_performed: e.target.value }))}
          />
          <ThemedInput
            placeholder="Next Due Date"
            type="date"
            value={form.next_due_date || ''}
            onChange={e => setForm(f => ({ ...f, next_due_date: e.target.value }))}
          />
        </div>
        <ThemedInput
          placeholder="Responsible Person"
          value={form.responsible_person || ''}
          onChange={e => setForm(f => ({ ...f, responsible_person: e.target.value }))}
        />
        <ThemedSelect
          value={form.priority_level || 'medium'}
          onValueChange={value => setForm(f => ({ ...f, priority_level: value }))}
          className="mb-2"
          placeholder="Select Priority"
        >
          <SelectItem value="low">Low</SelectItem>
          <SelectItem value="medium">Medium</SelectItem>
          <SelectItem value="high">High</SelectItem>
          <SelectItem value="critical">Critical</SelectItem>
        </ThemedSelect>
        <ThemedSelect
          value={form.is_active ? 'true' : 'false'}
          onValueChange={value => setForm(f => ({ ...f, is_active: value === 'true' }))}
          className="mb-2"
          placeholder="Select Status"
        >
          <SelectItem value="true">Active</SelectItem>
          <SelectItem value="false">Inactive</SelectItem>
        </ThemedSelect>
      </FormModal>
    </div>
  );
}