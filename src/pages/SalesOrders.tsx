import React from 'react';
import { useCRUD } from '../hooks/useCRUD';
import { DataTable } from '../components/common/DataTable';
import { FormModal } from '../components/common/FormModal';
import ThemedInput from '../components/ui/ThemedInput';

interface SalesOrder {
  id: string;
  order_number: string;
  customer_id: string;
  order_date: string;
  required_date: string;
  promised_date: string;
  delivery_date: string;
  status: string;
  total_amount: number;
  currency: string;
  payment_status: string;
  payment_terms: string;
  sales_person: string;
  priority_level: string;
  notes: string;
}

export default function SalesOrders() {
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
  } = useCRUD<SalesOrder>({
    table: 'sales_orders',
    columns: 'id, order_number, customer_id, order_date, required_date, promised_date, delivery_date, status, total_amount, currency, payment_status, payment_terms, sales_person, priority_level, notes',
    rolePermissions: ['admin', 'sales_staff']
  });

  const columns = [
    { key: 'order_number' as keyof SalesOrder, label: 'Order Number' },
    { key: 'customer_id' as keyof SalesOrder, label: 'Customer ID' },
    { key: 'order_date' as keyof SalesOrder, label: 'Order Date' },
    { key: 'required_date' as keyof SalesOrder, label: 'Required Date' },
    { key: 'delivery_date' as keyof SalesOrder, label: 'Delivery Date' },
    { 
      key: 'total_amount' as keyof SalesOrder, 
      label: 'Total Amount',
      render: (value: number, item: SalesOrder) => `${item.currency || 'IDR'} ${value?.toLocaleString() || '0'}`
    },
    { 
      key: 'status' as keyof SalesOrder, 
      label: 'Status',
      render: (value: string) => {
        const colors = {
          pending: 'text-yellow-600',
          confirmed: 'text-blue-600',
          in_production: 'text-purple-600',
          ready_to_ship: 'text-green-600',
          shipped: 'text-gray-600',
          completed: 'text-green-800',
          cancelled: 'text-red-600'
        };
        return <span className={colors[value as keyof typeof colors] || 'text-gray-600'}>{value}</span>;
      }
    },
    { 
      key: 'payment_status' as keyof SalesOrder, 
      label: 'Payment',
      render: (value: string) => {
        const colors = {
          pending: 'text-yellow-600',
          partial: 'text-orange-600',
          paid: 'text-green-600',
          overdue: 'text-red-600'
        };
        return <span className={colors[value as keyof typeof colors] || 'text-gray-600'}>{value}</span>;
      }
    },
    { key: 'priority_level' as keyof SalesOrder, label: 'Priority' },
    { key: 'sales_person' as keyof SalesOrder, label: 'Sales Person' }
  ];

  const statuses = Array.from(new Set(orders.map(o => o.status).filter(Boolean)));
  const priorities = Array.from(new Set(orders.map(o => o.priority_level).filter(Boolean)));

  if (loading) return <div>Loading...</div>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Sales Orders</h1>
      
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
        addButtonText="Add Sales Order"
      />

      <FormModal
        isOpen={showForm}
        onClose={closeForm}
        onSubmit={handleSubmit}
        title={`${editing ? 'Edit' : 'Add'} Sales Order`}
      >
        <ThemedInput
          placeholder="Order Number"
          value={form.order_number || ''}
          onChange={e => setForm(f => ({ ...f, order_number: e.target.value }))}
          required
        />
        <ThemedInput
          placeholder="Customer ID"
          value={form.customer_id || ''}
          onChange={e => setForm(f => ({ ...f, customer_id: e.target.value }))}
          required
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
            placeholder="Promised Date"
            type="date"
            value={form.promised_date || ''}
            onChange={e => setForm(f => ({ ...f, promised_date: e.target.value }))}
          />
          <ThemedInput
            placeholder="Delivery Date"
            type="date"
            value={form.delivery_date || ''}
            onChange={e => setForm(f => ({ ...f, delivery_date: e.target.value }))}
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
          <select
            className="border p-2 mb-2 w-full"
            value={form.currency || 'IDR'}
            onChange={e => setForm(f => ({ ...f, currency: e.target.value }))}
          >
            <option value="IDR">IDR</option>
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
            <option value="SGD">SGD</option>
          </select>
        </div>
        <ThemedInput
          placeholder="Payment Terms"
          value={form.payment_terms || ''}
          onChange={e => setForm(f => ({ ...f, payment_terms: e.target.value }))}
        />
        <ThemedInput
          placeholder="Sales Person"
          value={form.sales_person || ''}
          onChange={e => setForm(f => ({ ...f, sales_person: e.target.value }))}
        />
        <select
          className="border p-2 mb-2 w-full"
          value={form.status || 'pending'}
          onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
        >
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="in_production">In Production</option>
          <option value="ready_to_ship">Ready to Ship</option>
          <option value="shipped">Shipped</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <select
          className="border p-2 mb-2 w-full"
          value={form.payment_status || 'pending'}
          onChange={e => setForm(f => ({ ...f, payment_status: e.target.value }))}
        >
          <option value="pending">Pending</option>
          <option value="partial">Partial</option>
          <option value="paid">Paid</option>
          <option value="overdue">Overdue</option>
        </select>
        <select
          className="border p-2 mb-2 w-full"
          value={form.priority_level || 'medium'}
          onChange={e => setForm(f => ({ ...f, priority_level: e.target.value }))}
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="urgent">Urgent</option>
        </select>
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
