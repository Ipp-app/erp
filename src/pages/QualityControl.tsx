import React from 'react';
import { useCRUD } from '../hooks/useCRUD';
import { DataTable } from '../components/common/DataTable';
import { FormModal } from '../components/common/FormModal';
import ThemedInput from '../components/ui/ThemedInput';
import ThemedSelect from '../components/ui/ThemedSelect'; // Import ThemedSelect
import { SelectItem } from '../components/ui/select'; // Import SelectItem

interface QualityInspection {
  id: string;
  production_order_id: string;
  inspection_type: string;
  inspection_datetime: string;
  inspector_id: string;
  sample_size: number;
  pass_quantity: number;
  fail_quantity: number;
  overall_result: string;
  action_taken: string;
  notes: string;
}

export default function QualityControl() {
  const {
    data: inspections,
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
  } = useCRUD<QualityInspection>({
    table: 'quality_inspection_reports',
    columns: 'id, production_order_id, inspection_type, inspection_datetime, inspector_id, sample_size, pass_quantity, fail_quantity, overall_result, action_taken, notes',
    rolePermissions: ['admin', 'quality_inspector']
  });

  const columns = [
    { key: 'production_order_id' as keyof QualityInspection, label: 'Production Order' },
    { key: 'inspection_type' as keyof QualityInspection, label: 'Inspection Type' },
    { 
      key: 'inspection_datetime' as keyof QualityInspection, 
      label: 'Date & Time',
      render: (value: string) => new Date(value).toLocaleString()
    },
    { key: 'inspector_id' as keyof QualityInspection, label: 'Inspector' },
    { 
      key: 'sample_size' as keyof QualityInspection, 
      label: 'Sample Size',
      render: (value: number) => value?.toLocaleString() || '0'
    },
    { 
      key: 'pass_quantity' as keyof QualityInspection, 
      label: 'Pass Qty',
      render: (value: number) => value?.toLocaleString() || '0'
    },
    { 
      key: 'fail_quantity' as keyof QualityInspection, 
      label: 'Fail Qty',
      render: (value: number) => value?.toLocaleString() || '0'
    },
    { 
      key: 'pass_quantity' as keyof QualityInspection, 
      label: 'Pass Rate',
      render: (value: number, item: QualityInspection) => {
        const total = item.pass_quantity + item.fail_quantity;
        const rate = total > 0 ? (value / total * 100) : 0;
        return `${rate.toFixed(1)}%`;
      }
    },
    { 
      key: 'overall_result' as keyof QualityInspection, 
      label: 'Result',
      render: (value: string) => {
        const colors = {
          pass: 'text-green-600',
          fail: 'text-red-600',
          conditional_pass: 'text-yellow-600'
        };
        return <span className={colors[value as keyof typeof colors] || 'text-gray-600'}>{value}</span>;
      }
    }
  ];

  const inspectionTypes = Array.from(new Set(inspections.map(i => i.inspection_type).filter(Boolean)));
  const results = Array.from(new Set(inspections.map(i => i.overall_result).filter(Boolean)));

  if (loading) return <div>Loading...</div>;

  return (
    <div className="p-4">
      {/* <h1 className="text-2xl font-bold mb-4">Quality Control Inspections</h1> */}
      
      <DataTable
        data={inspections}
        columns={columns}
        searchable
        filterable
        filterOptions={{ key: 'inspection_type', options: inspectionTypes }}
        paginated
        pageSize={10}
        canEdit={canEdit()}
        onAdd={() => openForm()}
        onEdit={openForm}
        onDelete={handleDelete}
        addButtonText="Add Inspection"
      />

      <FormModal
        isOpen={showForm}
        onClose={closeForm}
        onSubmit={handleSubmit}
        title={`${editing ? 'Edit' : 'Add'} Quality Inspection`}
      >
        <ThemedInput
          placeholder="Production Order ID"
          value={form.production_order_id || ''}
          onChange={e => setForm(f => ({ ...f, production_order_id: e.target.value }))}
          required
        />
        <ThemedSelect
          value={form.inspection_type || '__select__'} // Use a non-empty string for initial value
          onValueChange={value => setForm(f => ({ ...f, inspection_type: value === '__select__' ? '' : value }))}
          className="mb-2"
          placeholder="Select Inspection Type"
        >
          <SelectItem value="__select__">Select Inspection Type</SelectItem> {/* Changed value to non-empty */}
          <SelectItem value="first_piece">First Piece</SelectItem>
          <SelectItem value="hourly">Hourly</SelectItem>
          <SelectItem value="final">Final</SelectItem>
          <SelectItem value="customer_complaint">Customer Complaint</SelectItem>
        </ThemedSelect>
        <ThemedInput
          placeholder="Inspection Date & Time"
          type="datetime-local"
          value={form.inspection_datetime || ''}
          onChange={e => setForm(f => ({ ...f, inspection_datetime: e.target.value }))}
        />
        <ThemedInput
          placeholder="Inspector ID"
          value={form.inspector_id || ''}
          onChange={e => setForm(f => ({ ...f, inspector_id: e.target.value }))}
        />
        <div className="grid grid-cols-3 gap-2">
          <ThemedInput
            placeholder="Sample Size"
            type="number"
            value={form.sample_size || ''}
            onChange={e => setForm(f => ({ ...f, sample_size: Number(e.target.value) }))}
          />
          <ThemedInput
            placeholder="Pass Quantity"
            type="number"
            value={form.pass_quantity || ''}
            onChange={e => setForm(f => ({ ...f, pass_quantity: Number(e.target.value) }))}
          />
          <ThemedInput
            placeholder="Fail Quantity"
            type="number"
            value={form.fail_quantity || ''}
            onChange={e => setForm(f => ({ ...f, fail_quantity: Number(e.target.value) }))}
          />
        </div>
        <ThemedSelect
          value={form.overall_result || 'pass'}
          onValueChange={value => setForm(f => ({ ...f, overall_result: value }))}
          className="mb-2"
          placeholder="Select Overall Result"
        >
          <SelectItem value="pass">Pass</SelectItem>
          <SelectItem value="fail">Fail</SelectItem>
          <SelectItem value="conditional_pass">Conditional Pass</SelectItem>
        </ThemedSelect>
        <textarea
          className="border p-2 mb-2 w-full"
          placeholder="Action Taken"
          value={form.action_taken || ''}
          onChange={e => setForm(f => ({ ...f, action_taken: e.target.value }))}
          rows={2}
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