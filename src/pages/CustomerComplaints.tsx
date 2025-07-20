import React, { useEffect, useState } from 'react';
import { useCRUD } from '@/hooks/useCRUD';
import { DataTable } from '@/components/common/DataTable';
import { FormModal } from '@/components/common/FormModal';
import ThemedInput from '@/components/ui/ThemedInput';
import ThemedSelect from '@/components/ui/ThemedSelect';
import { SelectItem } from '@/components/ui/select';
import { supabase } from '@/lib/supabaseClient';

interface CustomerComplaint {
  id: string;
  complaint_number: string;
  customer_id: string;
  product_id: string;
  sales_order_id: string;
  complaint_date: string;
  description: string;
  severity: string;
  status: string;
  resolution_date: string;
  action_taken: string;
  responsible_person: string;
  notes: string;
  customers?: { company_name: string; contact_person: string } | null;
  products?: { name: string; product_code: string } | null;
  sales_orders?: { order_number: string } | null;
}

interface Customer {
  id: string;
  company_name: string;
  contact_person: string;
}

interface Product {
  id: string;
  name: string;
  product_code: string;
}

interface SalesOrder {
  id: string;
  order_number: string;
}

export default function CustomerComplaints() {
  const {
    data: complaints,
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
  } = useCRUD<CustomerComplaint>({
    table: 'customer_complaints',
    // Sederhanakan query untuk debugging
    columns: 'id, complaint_number, status',
    rolePermissions: ['admin', 'sales_staff', 'quality_inspector']
  });

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [salesOrders, setSalesOrders] = useState<SalesOrder[]>([]);
  const [loadingRelations, setLoadingRelations] = useState(true);

  useEffect(() => {
    async function fetchRelations() {
      setLoadingRelations(true);
      const [{ data: customersData }, { data: productsData }, { data: salesOrdersData }] = await Promise.all([
        supabase.from('customers').select('id, company_name, contact_person'),
        supabase.from('products').select('id, name, product_code'),
        supabase.from('sales_orders').select('id, order_number')
      ]);

      setCustomers(customersData || []);
      setProducts(productsData || []);
      setSalesOrders(salesOrdersData || []);
      setLoadingRelations(false);
    }
    fetchRelations();
  }, []);

  const columns = [
    { key: 'complaint_number' as keyof CustomerComplaint, label: 'Complaint No.' },
    { 
      key: 'customer_id' as keyof CustomerComplaint, 
      label: 'Customer',
      render: (value: string, item: CustomerComplaint) => item.customers?.company_name || value
    },
    { 
      key: 'product_id' as keyof CustomerComplaint, 
      label: 'Product',
      render: (value: string, item: CustomerComplaint) => item.products?.name || value
    },
    { key: 'complaint_date' as keyof CustomerComplaint, label: 'Complaint Date' },
    { key: 'severity' as keyof CustomerComplaint, label: 'Severity' },
    { 
      key: 'status' as keyof CustomerComplaint, 
      label: 'Status',
      render: (value: string) => {
        const colors = {
          open: 'text-red-600',
          in_progress: 'text-yellow-600',
          resolved: 'text-green-600',
          closed: 'text-gray-600'
        };
        return <span className={colors[value as keyof typeof colors] || 'text-gray-600'}>{value}</span>;
      }
    },
    { key: 'resolution_date' as keyof CustomerComplaint, label: 'Resolution Date' },
    { key: 'responsible_person' as keyof CustomerComplaint, label: 'Responsible' }
  ];

  const severities = Array.from(new Set(complaints.map(c => c.severity).filter(Boolean)));
  const statuses = Array.from(new Set(complaints.map(c => c.status).filter(Boolean)));

  if (loading || loadingRelations) return <div>Loading Customer Complaints...</div>;

  return (
    <div className="p-4">
      <DataTable
        data={complaints}
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
        addButtonText="Add Complaint"
      />

      <FormModal
        isOpen={showForm}
        onClose={closeForm}
        onSubmit={handleSubmit}
        title={`${editing ? 'Edit' : 'Add'} Customer Complaint`}
      >
        <ThemedInput
          placeholder="Complaint Number"
          value={form.complaint_number || ''}
          onChange={e => setForm(f => ({ ...f, complaint_number: e.target.value }))}
          required
        />
        <ThemedSelect
          value={form.customer_id || ''}
          onValueChange={value => setForm(f => ({ ...f, customer_id: value }))}
          className="mb-2"
          placeholder="Select Customer"
        >
          {customers.map(customer => (
            <SelectItem key={customer.id} value={customer.id}>
              {customer.company_name} ({customer.contact_person})
            </SelectItem>
          ))}
        </ThemedSelect>
        <ThemedSelect
          value={form.product_id || ''}
          onValueChange={value => setForm(f => ({ ...f, product_id: value }))}
          className="mb-2"
          placeholder="Select Product (Optional)"
        >
          <SelectItem value="">None</SelectItem>
          {products.map(product => (
            <SelectItem key={product.id} value={product.id}>
              {product.name} ({product.product_code})
            </SelectItem>
          ))}
        </ThemedSelect>
        <ThemedSelect
          value={form.sales_order_id || ''}
          onValueChange={value => setForm(f => ({ ...f, sales_order_id: value }))}
          className="mb-2"
          placeholder="Select Sales Order (Optional)"
        >
          <SelectItem value="">None</SelectItem>
          {salesOrders.map(order => (
            <SelectItem key={order.id} value={order.id}>
              {order.order_number}
            </SelectItem>
          ))}
        </ThemedSelect>
        <ThemedInput
          placeholder="Complaint Date"
          type="date"
          value={form.complaint_date || ''}
          onChange={e => setForm(f => ({ ...f, complaint_date: e.target.value }))}
          required
        />
        <textarea
          className="border p-2 mb-2 w-full"
          placeholder="Description"
          value={form.description || ''}
          onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
          rows={3}
          required
        />
        <ThemedSelect
          value={form.severity || 'medium'}
          onValueChange={value => setForm(f => ({ ...f, severity: value }))}
          className="mb-2"
          placeholder="Select Severity"
        >
          <SelectItem value="low">Low</SelectItem>
          <SelectItem value="medium">Medium</SelectItem>
          <SelectItem value="high">High</SelectItem>
          <SelectItem value="critical">Critical</SelectItem>
        </ThemedSelect>
        <ThemedSelect
          value={form.status || 'open'}
          onValueChange={value => setForm(f => ({ ...f, status: value }))}
          className="mb-2"
          placeholder="Select Status"
        >
          <SelectItem value="open">Open</SelectItem>
          <SelectItem value="in_progress">In Progress</SelectItem>
          <SelectItem value="resolved">Resolved</SelectItem>
          <SelectItem value="closed">Closed</SelectItem>
        </ThemedSelect>
        <ThemedInput
          placeholder="Resolution Date (Optional)"
          type="date"
          value={form.resolution_date || ''}
          onChange={e => setForm(f => ({ ...f, resolution_date: e.target.value }))}
        />
        <textarea
          className="border p-2 mb-2 w-full"
          placeholder="Action Taken (Optional)"
          value={form.action_taken || ''}
          onChange={e => setForm(f => ({ ...f, action_taken: e.target.value }))}
          rows={2}
        />
        <ThemedInput
          placeholder="Responsible Person (Optional)"
          value={form.responsible_person || ''}
          onChange={e => setForm(f => ({ ...f, responsible_person: e.target.value }))}
        />
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