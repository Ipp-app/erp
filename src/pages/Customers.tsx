import React from 'react';
import { useCRUD } from '@/hooks/useCRUD';
import { DataTable } from '@/components/common/DataTable';
import { FormModal } from '@/components/common/FormModal';
import ThemedInput from '@/components/ui/ThemedInput';


interface Customer {
  id: string;
  customer_code: string;
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
  credit_limit: number;
  tax_id: string;
  customer_type: string;
  status: string;
  sales_representative: string;
}

export default function Customers() {
  const {
    data: customers,
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
  } = useCRUD<Customer>({
    table: 'customers',
    columns: 'id, customer_code, company_name, contact_person, email, phone, address, city, state_province, postal_code, country, payment_terms, credit_limit, tax_id, customer_type, status, sales_representative',
    rolePermissions: ['admin', 'sales_staff']
  });

  const columns = [
    { key: 'customer_code' as keyof Customer, label: 'Code' },
    { key: 'company_name' as keyof Customer, label: 'Company Name' },
    { key: 'contact_person' as keyof Customer, label: 'Contact Person' },
    { key: 'email' as keyof Customer, label: 'Email' },
    { key: 'phone' as keyof Customer, label: 'Phone' },
    { key: 'city' as keyof Customer, label: 'City' },
    { key: 'country' as keyof Customer, label: 'Country' },
    { 
      key: 'credit_limit' as keyof Customer, 
      label: 'Credit Limit',
      render: (value: number) => `$${value?.toLocaleString() || '0'}`
    },
    { key: 'customer_type' as keyof Customer, label: 'Type' },
    { 
      key: 'status' as keyof Customer, 
      label: 'Status',
      render: (value: string) => {
        const colors = {
          active: 'text-green-600',
          inactive: 'text-red-600',
          suspended: 'text-orange-600'
        };
        return <span className={colors[value as keyof typeof colors] || 'text-gray-600'}>{value}</span>;
      }
    }
  ];

  const customerTypes = Array.from(new Set(customers.map(c => c.customer_type).filter(Boolean)));
  const countries = Array.from(new Set(customers.map(c => c.country).filter(Boolean)));

  if (loading) return <div>Loading...</div>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Customers Management</h1>
      <DataTable
        data={customers}
        columns={columns}
        searchable
        filterable
        filterOptions={{ key: 'customer_type', options: customerTypes }}
        paginated
        pageSize={10}
        canEdit={canEdit()}
        onAdd={() => openForm()}
        onEdit={openForm}
        onDelete={handleDelete}
        addButtonText="Add Customer"
      />

      <FormModal
        isOpen={showForm}
        onClose={closeForm}
        onSubmit={handleSubmit}
        title={`${editing ? 'Edit' : 'Add'} Customer`}
      >
        <ThemedInput
          placeholder="Customer Code"
          value={form.customer_code || ''}
          onChange={e => setForm(f => ({ ...f, customer_code: e.target.value }))}
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
        <div className="grid grid-cols-2 gap-2">
          <ThemedInput
            placeholder="Payment Terms"
            value={form.payment_terms || ''}
            onChange={e => setForm(f => ({ ...f, payment_terms: e.target.value }))}
          />
          <ThemedInput
            placeholder="Credit Limit"
            type="number"
            step="0.01"
            value={form.credit_limit || ''}
            onChange={e => setForm(f => ({ ...f, credit_limit: Number(e.target.value) }))}
          />
        </div>
        <ThemedInput
          placeholder="Tax ID"
          value={form.tax_id || ''}
          onChange={e => setForm(f => ({ ...f, tax_id: e.target.value }))}
        />
        <ThemedInput
          placeholder="Sales Representative"
          value={form.sales_representative || ''}
          onChange={e => setForm(f => ({ ...f, sales_representative: e.target.value }))}
        />
        <select
          className="border p-2 mb-2 w-full"
          value={form.customer_type || 'regular'}
          onChange={e => setForm(f => ({ ...f, customer_type: e.target.value }))}
        >
          <option value="regular">Regular</option>
          <option value="premium">Premium</option>
          <option value="vip">VIP</option>
        </select>
        <select
          className="border p-2 mb-2 w-full"
          value={form.status || 'active'}
          onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
        >
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="suspended">Suspended</option>
        </select>
      </FormModal>
    </div>
  );
}