import React from 'react';
import { useCRUD } from '../hooks/useCRUD';
import { DataTable } from '../components/common/DataTable';
import { FormModal } from '../components/common/FormModal';
import ThemedInput from '../components/ui/ThemedInput';
import ThemedSelect from '../components/ui/ThemedSelect'; // Import ThemedSelect
import { SelectItem } from '../components/ui/select'; // Import SelectItem

interface PurchaseOrder {
  id: string;
  po_number: string;
  supplier_name: string;
  supplier_contact: string;
  order_date: string;
  required_date: string;
  status: string;
  total_amount: number;
  currency: string;
  payment_terms: string;
  delivery_terms: string;
  created_by: string;
  approved_by: string;
  notes: string;
}

export default function PurchaseOrders() {
  const {
    data: orders,
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
  } = useCRUD<PurchaseOrder>({
    table: 'purchase_orders',
    columns: 'id, po_number, supplier_name, supplier_contact, order_date, required_date, status, total_amount, currency, payment_terms, delivery_terms, created_by, approved_by, notes',
    rolePermissions: ['admin', 'warehouse_staff']
  });

  const columns = [
    { key: 'po_number' as keyof PurchaseOrder, label: 'PO Number' },
    { key: 'supplier_name' as keyof PurchaseOrder, label: 'Supplier' },
    { key: 'order_date' as keyof PurchaseOrder, label: 'Order Date' },
    { key: 'required_date' as keyof PurchaseOrder, label: 'Required Date' },
    { 
      key: 'total_amount' as keyof PurchaseOrder, 
      label: 'Total Amount',
      render: (value: number, item: PurchaseOrder) => `${item.currency || 'IDR'} ${value?.toLocaleString() || '0'}`
    },
    { 
      key: 'status' as keyof PurchaseOrder, 
      label: 'Status',
      render: (value: string) => {
        const colors = {
          pending: 'text-yellow-600',
          sent: 'text-blue-600',
          acknowledged: 'text-purple-600',
          delivered: 'text-green-600',
          completed: 'text-green-800',
          cancelled: 'text-red-600'
        };
        return <span className={colors[value as keyof typeof colors] || 'text-gray-600'}>{value}</span>;
      }
    },
    { key: 'payment_terms' as keyof PurchaseOrder, label: 'Payment Terms' },
    { key: 'created_by' as keyof PurchaseOrder, label: 'Created By' },
    { key: 'approved_by' as keyof PurchaseOrder, label: 'Approved By' }
  ];

  const statuses = Array.from(new Set(orders.map(o => o.status).filter(Boolean)));
  const suppliers = Array.from(new Set(orders.map(o => o.supplier_name).filter(Boolean)));

  if (loading) return <div>Loading...</div>;

  return (
    <div className="p-4">
      {/* <h1 className="text-2xl font-bold mb-4">Purchase Orders</h1> */}
      
      <DataTable
        data={orders}
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
        addButtonText="Add Purchase Order"
      />

      <FormModal
        isOpen={showForm}
        onClose={closeForm}
        onSubmit={handleSubmit}
        title={`${editing ? 'Edit' : 'Add'} Purchase Order`}
      >
        <ThemedInput
          placeholder="PO Number"
          value={form.po_number || ''}
          onChange={e => setForm(f => ({ ...f, po_number: e.target.value }))}
          required
        />
        <ThemedInput
          placeholder="Supplier Name"
          value={form.supplier_name || ''}
          onChange={e => setForm(f => ({ ...f, supplier_name: e.target.value }))}
          required
        />
        <textarea
          className="border p-2 mb-2 w-full"
          placeholder="Supplier Contact"
          value={form.supplier_contact || ''}
          onChange={e => setForm(f => ({ ...f, supplier_contact: e.target.value }))}
          rows={2}
        />
        <div className="grid grid-cols-2 gap-2">
          <ThemedInput
            placeholder="Order Date"
            type="date"
            value={form.order_date || ''}
            onChange={e => setForm(f => ({ ...f, order_date: e.target.value }))}
            required
          />
          <ThemedInput
            placeholder="Required Date"
            type="date"
            value={form.required_date || ''}
            onChange={e => setForm(f => ({ ...f, required_date: e.target.value }))}
          />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <ThemedInput
            placeholder="Total Amount"
            type="number"
            step="0.01"
            value={form.total_amount || ''}
            onChange={e => setForm(f => ({ ...f, total_amount: Number(e.target.value) }))}
          />
          <ThemedSelect
            value={form.currency || 'IDR'}
            onValueChange={value => setForm(f => ({ ...f, currency: value }))}
            className="mb-2"
            placeholder="Select Currency"
          >
            <SelectItem value="IDR">IDR</SelectItem>
            <SelectItem value="USD">USD</SelectItem>
            <SelectItem value="EUR">EUR</SelectItem>
            <SelectItem value="SGD">SGD</SelectItem>
          </ThemedSelect>
        </div>
        <ThemedInput
          placeholder="Payment Terms"
          value={form.payment_terms || ''}
          onChange={e => setForm(f => ({ ...f, payment_terms: e.target.value }))}
        />
        <ThemedInput
          placeholder="Delivery Terms"
          value={form.delivery_terms || ''}
          onChange={e => setForm(f => ({ ...f, delivery_terms: e.target.value }))}
        />
        <div className="grid grid-cols-2 gap-2">
          <ThemedInput
            placeholder="Created By"
            value={form.created_by || ''}
            onChange={e => setForm(f => ({ ...f, created_by: e.target.value }))}
          />
          <ThemedInput
            placeholder="Approved By"
            value={form.approved_by || ''}
            onChange={e => setForm(f => ({ ...f, approved_by: e.target.value }))}
          />
        </div>
        <ThemedSelect
          value={form.status || 'pending'}
          onValueChange={value => setForm(f => ({ ...f, status: value }))}
          className="mb-2"
          placeholder="Select Status"
        >
          <SelectItem value="pending">Pending</SelectItem>
          <SelectItem value="sent">Sent</SelectItem>
          <SelectItem value="acknowledged">Acknowledged</SelectItem>
          <SelectItem value="delivered">Delivered</SelectItem>
          <SelectItem value="completed">Completed</SelectItem>
          <SelectItem value="cancelled">Cancelled</SelectItem>
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