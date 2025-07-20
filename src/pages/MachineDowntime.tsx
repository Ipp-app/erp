import React, { useEffect, useState } from 'react';
import { useCRUD } from '@/hooks/useCRUD';
import { DataTable } from '@/components/common/DataTable';
import { FormModal } from '@/components/common/FormModal';
import ThemedInput from '@/components/ui/ThemedInput';
import ThemedSelect from '@/components/ui/ThemedSelect';
import { SelectItem } from '@/components/ui/select';
import { supabase } from '@/lib/supabaseClient';

interface MachineDowntime {
  id: string;
  machine_id: string;
  downtime_start: string;
  downtime_end: string;
  duration_minutes: number;
  reason: string;
  action_taken: string;
  reported_by: string;
  status: string;
  notes: string;
  machines?: { name: string; machine_code: string } | null; // Re-added for joining
}

interface Machine {
  id: string;
  name: string;
  machine_code: string;
}

export default function MachineDowntime() {
  const {
    data: downtimes,
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
  } = useCRUD<MachineDowntime>({
    table: 'machine_downtime',
    // Re-adding 'machines(name, machine_code)' to columns
    columns: 'id, machine_id, downtime_start, downtime_end, duration_minutes, reason, action_taken, reported_by, status, notes, machines(name, machine_code)', 
    rolePermissions: ['admin', 'production_manager', 'maintenance_staff']
  });

  const [machines, setMachines] = useState<Machine[]>([]);
  const [loadingMachines, setLoadingMachines] = useState(true);

  useEffect(() => {
    async function fetchMachines() {
      setLoadingMachines(true);
      const { data, error } = await supabase.from('machines').select('id, name, machine_code');
      if (error) {
        console.error('Error fetching machines:', error);
      } else {
        setMachines(data || []);
      }
      setLoadingMachines(false);
    }
    fetchMachines();
  }, []);

  const columns = [
    { 
      key: 'machine_id' as keyof MachineDowntime, 
      label: 'Machine', // Changed label back to 'Machine'
      render: (value: string, item: MachineDowntime) => item.machines?.name || value // Re-added render for machine name
    },
    { 
      key: 'downtime_start' as keyof MachineDowntime, 
      label: 'Start Time',
      render: (value: string) => new Date(value).toLocaleString()
    },
    { 
      key: 'downtime_end' as keyof MachineDowntime, 
      label: 'End Time',
      render: (value: string) => value ? new Date(value).toLocaleString() : '-'
    },
    { 
      key: 'duration_minutes' as keyof MachineDowntime, 
      label: 'Duration (min)',
      render: (value: number) => value?.toLocaleString() || '0'
    },
    { key: 'reason' as keyof MachineDowntime, label: 'Reason' },
    { key: 'reported_by' as keyof MachineDowntime, label: 'Reported By' },
    { 
      key: 'status' as keyof MachineDowntime, 
      label: 'Status',
      render: (value: string) => {
        const colors = {
          active: 'text-red-600',
          resolved: 'text-green-600',
          pending: 'text-yellow-600'
        };
        return <span className={colors[value as keyof typeof colors] || 'text-gray-600'}>{value}</span>;
      }
    }
  ];

  const reasons = Array.from(new Set(downtimes.map(d => d.reason).filter(Boolean)));
  const statuses = Array.from(new Set(downtimes.map(d => d.status).filter(Boolean)));

  if (loading || loadingMachines) return <div>Loading Machine Downtime...</div>;

  return (
    <div className="p-4">
      <DataTable
        data={downtimes}
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
        addButtonText="Add Downtime Record"
      />

      <FormModal
        isOpen={showForm}
        onClose={closeForm}
        onSubmit={handleSubmit}
        title={`${editing ? 'Edit' : 'Add'} Downtime Record`}
      >
        <ThemedSelect
          value={form.machine_id || ''}
          onValueChange={value => setForm(f => ({ ...f, machine_id: value }))}
          className="mb-2"
          placeholder="Select Machine"
        >
          {machines.map(machine => (
            <SelectItem key={machine.id} value={machine.id}>
              {machine.name} ({machine.machine_code})
            </SelectItem>
          ))}
        </ThemedSelect>
        <ThemedInput
          placeholder="Downtime Start"
          type="datetime-local"
          value={form.downtime_start || ''}
          onChange={e => setForm(f => ({ ...f, downtime_start: e.target.value }))}
          required
        />
        <ThemedInput
          placeholder="Downtime End"
          type="datetime-local"
          value={form.downtime_end || ''}
          onChange={e => setForm(f => ({ ...f, downtime_end: e.target.value }))}
        />
        <ThemedInput
          placeholder="Duration (minutes)"
          type="number"
          value={form.duration_minutes || ''}
          onChange={e => setForm(f => ({ ...f, duration_minutes: Number(e.target.value) }))}
        />
        <ThemedInput
          placeholder="Reason"
          value={form.reason || ''}
          onChange={e => setForm(f => ({ ...f, reason: e.target.value }))}
          required
        />
        <textarea
          className="border p-2 mb-2 w-full"
          placeholder="Action Taken"
          value={form.action_taken || ''}
          onChange={e => setForm(f => ({ ...f, action_taken: e.target.value }))}
          rows={2}
        />
        <ThemedInput
          placeholder="Reported By"
          value={form.reported_by || ''}
          onChange={e => setForm(f => ({ ...f, reported_by: e.target.value }))}
        />
        <ThemedSelect
          value={form.status || 'active'}
          onValueChange={value => setForm(f => ({ ...f, status: value }))}
          className="mb-2"
          placeholder="Select Status"
        >
          <SelectItem value="active">Active</SelectItem>
          <SelectItem value="resolved">Resolved</SelectItem>
          <SelectItem value="pending">Pending</SelectItem>
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