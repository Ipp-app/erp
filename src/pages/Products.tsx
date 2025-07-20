import React from 'react';
import { useCRUD } from '@/hooks/useCRUD';
import { DataTable } from '@/components/common/DataTable';
import { FormModal } from '@/components/common/FormModal';
import ThemedInput from '@/components/ui/ThemedInput';

interface Product {
  id: string;
  product_code: string;
  name: string;
  category: string;
  material_type: string;
  weight_per_piece: number;
  image_url: string;
  status: string;
}

export default function Products() {
  const {
    data: products,
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
  } = useCRUD<Product>({
    table: 'products',
    columns: 'id, product_code, name, category, material_type, weight_per_piece, image_url, status',
    rolePermissions: ['admin', 'production_manager']
  });

  const columns = [
    { key: 'product_code' as keyof Product, label: 'Code' },
    { key: 'name' as keyof Product, label: 'Name' },
    { key: 'category' as keyof Product, label: 'Category' },
    { key: 'material_type' as keyof Product, label: 'Material Type' },
    { key: 'weight_per_piece' as keyof Product, label: 'Weight (g)' },
    { 
      key: 'image_url' as keyof Product, 
      label: 'Image',
      render: (value: string) => value ? 
        <img src={value} alt="product" className="w-12 h-12 object-cover" /> : '-'
    },
    { key: 'status' as keyof Product, label: 'Status' }
  ];

  const categories = Array.from(new Set(products.map(p => p.category).filter(Boolean)));

  if (loading) return <div>Loading...</div>;

  return (
    <div className="p-4">
      {/* <h1 className="text-2xl font-bold mb-4">Products Management</h1> */}
      <DataTable
        data={products}
        columns={columns}
        searchable
        filterable
        filterOptions={{ key: 'category', options: categories }}
        paginated
        pageSize={10}
        canEdit={canEdit()}
        onAdd={() => openForm()}
        onEdit={openForm}
        onDelete={handleDelete}
        addButtonText="Add Product"
      />

      <FormModal
        isOpen={showForm}
        onClose={closeForm}
        onSubmit={handleSubmit}
        title={`${editing ? 'Edit' : 'Add'} Product`}
      >
        <ThemedInput
          placeholder="Product Code"
          value={form.product_code || ''}
          onChange={e => setForm(f => ({ ...f, product_code: e.target.value }))}
          required
        />
        <ThemedInput
          placeholder="Name"
          value={form.name || ''}
          onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
          required
        />
        <ThemedInput
          placeholder="Category"
          value={form.category || ''}
          onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
        />
        <ThemedInput
          placeholder="Material Type"
          value={form.material_type || ''}
          onChange={e => setForm(f => ({ ...f, material_type: e.target.value }))}
        />
        <ThemedInput
          placeholder="Weight per Piece (g)"
          type="number"
          value={form.weight_per_piece || ''}
          onChange={e => setForm(f => ({ ...f, weight_per_piece: Number(e.target.value) }))}
        />
        <ThemedInput
          placeholder="Image URL"
          value={form.image_url || ''}
          onChange={e => setForm(f => ({ ...f, image_url: e.target.value }))}
        />
        <select
          className="border p-2 mb-2 w-full"
          value={form.status || 'active'}
          onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
        >
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </FormModal>
    </div>
  );
}