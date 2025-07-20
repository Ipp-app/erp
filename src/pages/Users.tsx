import React from 'react';
import { useCRUD } from '../hooks/useCRUD';
import { DataTable } from '../components/common/DataTable';
import { FormModal } from '../components/common/FormModal';
import ThemedInput from '../components/ui/ThemedInput';

interface User {
  id: string;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  employee_id: string;
  department: string;
  position: string;
  phone: string;
  is_active: boolean;
  profile_picture_url: string;
}

export default function Users() {
  const {
    data: users,
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
  } = useCRUD<User>({
    table: 'users',
    columns: 'id, username, email, first_name, last_name, employee_id, department, position, phone, is_active, profile_picture_url',
    rolePermissions: ['admin']
  });

  const columns = [
    { key: 'employee_id' as keyof User, label: 'Employee ID' },
    { key: 'username' as keyof User, label: 'Username' },
    { 
      key: 'first_name' as keyof User, 
      label: 'Full Name',
      render: (value: string, item: User) => `${item.first_name} ${item.last_name}`
    },
    { key: 'email' as keyof User, label: 'Email' },
    { key: 'department' as keyof User, label: 'Department' },
    { key: 'position' as keyof User, label: 'Position' },
    { key: 'phone' as keyof User, label: 'Phone' },
    { 
      key: 'is_active' as keyof User, 
      label: 'Status',
      render: (value: boolean) => value ? 'Active' : 'Inactive'
    }
  ];

  const departments = Array.from(new Set(users.map(u => u.department).filter(Boolean)));

  if (loading) return <div>Loading...</div>;

  return (
    <div className="p-4">
      {/* <h1 className="text-2xl font-bold mb-4">Users Management</h1> */}
      <DataTable
        data={users}
        columns={columns}
        searchable
        filterable
        filterOptions={{ key: 'department', options: departments }}
        paginated
        pageSize={10}
        canEdit={canEdit()}
        onAdd={() => openForm()}
        onEdit={openForm}
        onDelete={handleDelete}
        addButtonText="Add User"
      />

      <FormModal
        isOpen={showForm}
        onClose={closeForm}
        onSubmit={handleSubmit}
        title={`${editing ? 'Edit' : 'Add'} User`}
      >
        <ThemedInput
          placeholder="Username"
          value={form.username || ''}
          onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
          required
        />
        <ThemedInput
          placeholder="Email"
          type="email"
          value={form.email || ''}
          onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
          required
        />
        <ThemedInput
          placeholder="First Name"
          value={form.first_name || ''}
          onChange={e => setForm(f => ({ ...f, first_name: e.target.value }))}
          required
        />
        <ThemedInput
          placeholder="Last Name"
          value={form.last_name || ''}
          onChange={e => setForm(f => ({ ...f, last_name: e.target.value }))}
          required
        />
        <ThemedInput
          placeholder="Employee ID"
          value={form.employee_id || ''}
          onChange={e => setForm(f => ({ ...f, employee_id: e.target.value }))}
        />
        <ThemedInput
          placeholder="Department"
          value={form.department || ''}
          onChange={e => setForm(f => ({ ...f, department: e.target.value }))}
        />
        <ThemedInput
          placeholder="Position"
          value={form.position || ''}
          onChange={e => setForm(f => ({ ...f, position: e.target.value }))}
        />
        <ThemedInput
          placeholder="Phone"
          value={form.phone || ''}
          onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
        />
        <ThemedInput
          placeholder="Profile Picture URL"
          value={form.profile_picture_url || ''}
          onChange={e => setForm(f => ({ ...f, profile_picture_url: e.target.value }))}
        />
        <select
          className="border p-2 mb-2 w-full"
          value={form.is_active ? 'true' : 'false'}
          onChange={e => setForm(f => ({ ...f, is_active: e.target.value === 'true' }))}
        >
          <option value="true">Active</option>
          <option value="false">Inactive</option>
        </select>
      </FormModal>
    </div>
  );
}