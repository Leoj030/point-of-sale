import React, { useEffect, useState } from 'react';
import { fetchCategories, createCategory, updateCategory, deleteCategory } from '../api/category';
import { Category } from '../types/order';

const Categories: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '' });
  const [isEdit, setIsEdit] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  const fetchCategoriesData = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await fetchCategories();
      setCategories(data);
    } catch (err) {
      setError('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategoriesData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isEdit && editId) {
        await updateCategory(editId, form);
        setShowForm(false);
        setEditId(null);
      } else {
        await createCategory(form);
        setShowForm(false);
      }
      fetchCategoriesData();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to save category');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return;

    try {
      await deleteCategory(id);
      fetchCategoriesData();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to delete category');
    }
  };

  const handleEdit = (category: Category) => {
    setForm({ name: category.name });
    setEditId(category._id);
    setIsEdit(true);
    setShowForm(true);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Categories</h1>

      <div className="mb-4">
        <button
          onClick={() => {
            setShowForm(true);
            setIsEdit(false);
            setEditId(null);
            setForm({ name: '' });
          }}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Add New Category
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {showForm && (
        <div className="mb-4 p-4 bg-white rounded shadow">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Name</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="mt-1 block w-full border rounded px-3 py-2"
                required
              />
            </div>
            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditId(null);
                }}
                className="bg-gray-500 hover:bg-gray-700 text-white py-2 px-4 rounded"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-blue-500 hover:bg-blue-700 text-white py-2 px-4 rounded"
              >
                {isEdit ? 'Update' : 'Create'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white rounded-lg overflow-hidden">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {categories.map((category) => (
              <tr key={category._id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  {category.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => handleEdit(category)}
                    className="text-blue-600 hover:text-blue-900 mr-4"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(category._id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Categories;
