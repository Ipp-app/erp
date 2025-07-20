import React from 'react';
import { useCRUD } from '@/hooks/useCRUD';
import { DataTable } from '@/components/common/DataTable';
import { FormModal } from '@/components/common/FormModal';
import ThemedInput from '@/components/ui/ThemedInput';
import ThemedSelect from '@/components/ui/ThemedSelect';
import { SelectItem } from '@/components/ui/select';

interface Supplier {
  id: string;
  supplier_code: string;
  company_name: string;
  contact_person: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state_province: string;
  postal_code: string;
  country: string;
  payment_terms: string;
  status: string;
  notes: string;
}

export default function Suppliers() {
  const {
    data: suppliers,
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
  } = useCRUD<Supplier>({
    table: 'suppliers',
    columns: 'id, supplier_code, company_name, contact_person, email, phone, address, city, state_province, postal_code, country, payment_terms, status, notes',
    rolePermissions: ['admin', 'purchase_manager']
  });

  const columns = [
    { key: 'supplier_code' as keyof Supplier, label: 'Code' },
    { key: 'company_name' as keyof Supplier, label: 'Company Name' },
    { key: 'contact_person' as keyof Supplier, label: 'Contact Person' },
    { key: 'email' as keyof Supplier, label: 'Email' },
    { key: 'phone' as keyof Supplier, label: 'Phone' },
    { key: 'country' as keyof Supplier, label: 'Country' },
    { key: 'payment_terms' as keyof Supplier, label: 'Payment Terms' },
    { 
      key: 'status' as keyof Supplier, 
      label: 'Status',
      render: (value: string) => {
        const colors = {
          active: 'text-green-600',
          inactive: 'text-red-600',
          on_hold: 'text-orange-600'
        };
        return <span className={colors[value as keyof typeof colors] || 'text-gray-600'}>{value}</span>;
      }
    }
  ];

  const statuses = Array.from(new Set(suppliers.map(s => s.status).filter(Boolean)));
  const countries = Array.from(new Set(suppliers.map(s => s.country).filter(Boolean)));

  if (loading) return <div>Loading...</div>;

  return (
    <div className="p-4">
      <DataTable
        data={suppliers}
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
        addButtonText="Add Supplier"
      />

      <FormModal
        isOpen={showForm}
        onClose={closeForm}
        onSubmit={handleSubmit}
        title={`${editing ? 'Edit' : 'Add'} Supplier`}
      >
        <ThemedInput
          placeholder="Supplier Code"
          value={form.supplier_code || ''}
          onChange={e => setForm(f => ({ ...f, supplier_code: e.target.value }))}
          required
        />
        <ThemedInput
          placeholder="Company Name"
          value={form.company_name || ''}
          onChange={e => setForm(f => ({ ...f, company_name: e.target.value }))}
          required
        />
        <ThemedInput
          placeholder="Contact Person"
          value={form.contact_person || ''}
          onChange={e => setForm(f => ({ ...f, contact_person: e.target.value }))}
        />
        <div className="grid grid-cols-2 gap-2">
          <ThemedInput
            placeholder="Email"
            type="email"
            value={form.email || ''}
            onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
          />
          <ThemedInput
            placeholder="Phone"
            value={form.phone || ''}
            onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
          />
        </div>
        <textarea
          className="w-full p-2 mb-2 bg-transparent border rounded-md focus:outline-none focus:ring-2"
          placeholder="Address"
          value={form.address || ''}
          onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
          rows={2}
        />
        <div className="grid grid-cols-3 gap-2">
          <ThemedInput
            placeholder="City"
            value={form.city || ''}
            onChange={e => setForm(f => ({ ...f, city: e.target.value }))}
          />
          <ThemedInput
            placeholder="State/Province"
            value={form.state_province || ''}
            onChange={e => setForm(f => ({ ...f, state_province: e.target.value }))}
          />
          <ThemedInput
            placeholder="Postal Code"
            value={form.postal_code || ''}
            onChange={e => setForm(f => ({ ...f, postal_code: e.target.value }))}
          />
        </div>
        <ThemedInput
          placeholder="Country"
          value={form.country || ''}
          onChange={e => setForm(f => ({ ...f, country: e.target.value }))}
        />
        <ThemedInput
          placeholder="Payment Terms"
          value={form.payment_terms || ''}
          onChange={e => setForm(f => ({ ...f, payment_terms: e.target.value }))}
        />
        <ThemedSelect
          value={form.status || 'active'}
          onValueChange={value => setForm(f => ({ ...f, status: value }))}
          className="mb-2"
          placeholder="Select Status"
        >
          <SelectItem value="active">Active</SelectItem>
          <SelectItem value="inactive">Inactive</SelectItem>
          <SelectItem value="on_hold">On Hold</SelectItem>
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