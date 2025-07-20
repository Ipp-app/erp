import React, { useState } from 'react';
import ThemedButton from '../ui/ThemedButton';
import ThemedInput from '../ui/ThemedInput';
import ThemedTable from '../ui/ThemedTable';
import ThemedSelect from '../ui/ThemedSelect'; // Import ThemedSelect
import { SelectItem } from '../ui/select'; // Import SelectItem

interface Column<T> {
  key: keyof T;
  label: string;
  render?: (value: any, item: T) => React.ReactNode;
}

interface DataTableProps<T extends { id: string }> {
  data: T[];
  columns: Column<T>[];
  loading?: boolean;
  searchable?: boolean;
  filterable?: boolean;
  filterOptions?: { key: keyof T; options: string[] };
  paginated?: boolean;
  pageSize?: number;
  canEdit?: boolean;
  onAdd?: () => void;
  onEdit?: (item: T) => void;
  onDelete?: (id: string) => void;
  addButtonText?: string;
}

export function DataTable<T extends { id: string }>({
  data,
  columns,
  loading = false,
  searchable = false,
  filterable = false,
  filterOptions,
  paginated = false,
  pageSize = 10,
  canEdit = false,
  onAdd,
  onEdit,
  onDelete,
  addButtonText = "Add Item"
}: DataTableProps<T>) {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('__all__'); // Default to the 'all' value
  const [page, setPage] = useState(1);

  // Filter and search logic
  const filteredData = data.filter((item) => {
    const matchesSearch = searchable ? 
      Object.values(item).some(value => 
        String(value).toLowerCase().includes(search.toLowerCase())
      ) : true;
    
    const matchesFilter = filterable && filterOptions ? 
      (filter !== '__all__' ? item[filterOptions.key] === filter : true) : true;
    
    return matchesSearch && matchesFilter;
  });

  // Pagination logic
  const totalPages = paginated ? Math.ceil(filteredData.length / pageSize) : 1;
  const paginatedData = paginated ? 
    filteredData.slice((page - 1) * pageSize, page * pageSize) : filteredData;

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      {/* Controls */}
      <div className="flex gap-2 mb-4">
        {searchable && (
          <ThemedInput
            placeholder="Search..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        )}
        {filterable && filterOptions && (
          <ThemedSelect
            value={filter}
            onValueChange={setFilter}
            placeholder={`All ${filterOptions.key as string}`}
            className="w-auto"
          >
            <SelectItem value="__all__">All {filterOptions.key as string}</SelectItem>
            {filterOptions.options.map((option) => (
              <SelectItem key={option} value={option}>{option}</SelectItem>
            ))}
          </ThemedSelect>
        )}
        {canEdit && onAdd && (
          <ThemedButton style={{ marginLeft: 'auto' }} onClick={onAdd}>
            {addButtonText}
          </ThemedButton>
        )}
      </div>

      {/* Table */}
      <ThemedTable>
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.key as string}>{column.label}</th>
            ))}
            {canEdit && (onEdit || onDelete) && <th>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {paginatedData.map((item) => (
            <tr key={item.id}>
              {columns.map((column) => (
                <td key={column.key as string}>
                  {column.render ? 
                    column.render(item[column.key], item) : 
                    String(item[column.key] || '-')
                  }
                </td>
              ))}
              {canEdit && (onEdit || onDelete) && (
                <td>
                  {onEdit && (
                    <ThemedButton 
                      variant="secondary" 
                      style={{ marginRight: 8, color: '#2563eb', background: 'none', border: 'none' }} 
                      onClick={() => onEdit(item)}
                    >
                      Edit
                    </ThemedButton>
                  )}
                  {onDelete && (
                    <ThemedButton 
                      variant="secondary" 
                      style={{ color: '#dc2626', background: 'none', border: 'none' }} 
                      onClick={() => onDelete(item.id)}
                    >
                      Delete
                    </ThemedButton>
                  )}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </ThemedTable>

      {/* Pagination */}
      {paginated && (
        <div className="flex justify-center items-center gap-2 mt-4">
          <ThemedButton 
            variant="outline" 
            disabled={page === 1} 
            onClick={() => setPage(page - 1)}
          >
            Prev
          </ThemedButton>
          <span>Page {page} of {totalPages}</span>
          <ThemedButton 
            variant="outline" 
            disabled={page === totalPages} 
            onClick={() => setPage(page + 1)}
          >
            Next
          </ThemedButton>
        </div>
      )}
    </div>
  );
}