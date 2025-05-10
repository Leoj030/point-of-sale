import React, { useEffect, useState } from 'react';
import API from '../api/axios';
import { ApiResponse, FormState, UserWithStatus } from '../types/api';

const emptyForm = { name: '', username: '', password: '', role: 'CASHIER', isActive: true };

const Staff: React.FC = () => {
  const [users, setUsers] = useState<UserWithStatus[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [isEdit, setIsEdit] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await API.get<ApiResponse<UserWithStatus[]>>('/user/list');
      if (res.data.success && res.data.data) {
        setUsers(res.data.data);
      } else {
        setError(res.data.message || 'Failed to fetch users');
      }
    } catch (err) {
      setError('Failed to fetch users: ' + (err instanceof Error ? err.message : String(err)));
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox'
        ? (e.target as HTMLInputElement).checked
        : value
    }));
  };

  const openCreate = () => {
    setForm(emptyForm);
    setIsEdit(false);
    setShowForm(true);
  };

  const openEdit = (user: UserWithStatus) => {
    let isActive = true;
    if (user.status && typeof user.status === 'object') {
      isActive = user.status.name === 'active';
    } else if (typeof user.status === 'string') {
      isActive = user.status.toLowerCase() === 'active';
    }
    setForm({
      _id: user._id,
      name: user.name,
      username: user.username,
      password: '',
      role: user.role.toUpperCase(),
      isActive,
    });
    setIsEdit(true);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this user?')) return;
    try {
      await API.delete(`/user/delete/${id}`);
      fetchUsers();
    } catch {
      alert('Failed to delete user');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isEdit && form._id) {
        const { _id, ...updateData } = form;
        
        if (updateData.password === '') {
          delete updateData.password;
        }
        await API.put<ApiResponse<unknown>>(`/user/update/${_id}`, updateData);
      } else {
        await API.post<ApiResponse<unknown>>('/user/register', form);
      }
      setShowForm(false);
      fetchUsers();
    } catch (err) {
      const msg = err && err.response && err.response.data && err.response.data.message
        ? err.response.data.message
        : err instanceof Error ? err.message : 'Failed to save user';
      alert(msg);
    }
  };

  return (
    <div className='border-4 border-[#f15734] p-4'>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Staff Management</h1>
        <button className="bg-blue-500 text-white px-4 py-2 rounded" onClick={openCreate}>
          Add Staff
        </button>
      </div>
      {loading ? (
        <div>Loading...</div>
      ) : error ? (
        <div className="text-red-500">{error}</div>
      ) : (
        <table className="min-w-full bg-white border rounded shadow">
          <thead>
            <tr>
              <th className="py-2 px-4 border-b">Name</th>
              <th className="py-2 px-4 border-b">Username</th>
              <th className="py-2 px-4 border-b">Role</th>
              <th className="py-2 px-4 border-b">Status</th>
              <th className="py-2 px-4 border-b">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user._id}>
                <td className="py-2 px-4 border-b">{user.name}</td>
                <td className="py-2 px-4 border-b">{user.username}</td>
                <td className="py-2 px-4 border-b">{user.role.toString().toUpperCase()}</td>
                <td className="py-2 px-4 border-b">{typeof user.status === 'object' ? (user.status.name === 'active' ? '✔' : '') : (user.status && user.status.toLowerCase() === 'active' ? '✔' : '')}</td>
                <td className="py-2 px-4 border-b">
                  <button className="text-blue-600 mr-2" onClick={() => openEdit(user)}>
                    Edit
                  </button>
                  <button className="text-red-600" onClick={() => handleDelete(user._id)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <form className="bg-white p-6 rounded shadow w-96 relative" onSubmit={handleSubmit}>
            <h2 className="text-xl font-bold mb-4">{isEdit ? 'Edit User' : 'Add User'}</h2>
            <label className="block mb-2">Name
              <input name="name" value={form.name} onChange={handleInput} className="w-full border rounded px-2 py-1 mt-1" required minLength={2} />
            </label>
            <label className="block mb-2">Username
              <input name="username" value={form.username} onChange={handleInput} className="w-full border rounded px-2 py-1 mt-1" required minLength={2} disabled={isEdit} />
            </label>
            {!isEdit && (
              <label className="block mb-2">Password
                <input name="password" type="password" value={form.password} onChange={handleInput} className="w-full border rounded px-2 py-1 mt-1" required minLength={8} />
              </label>
            )}
            {isEdit && (
              <label className="block mb-2">Password (leave blank to keep current)
                <input name="password" type="password" value={form.password} onChange={handleInput} className="w-full border rounded px-2 py-1 mt-1" minLength={8} />
              </label>
            )}
            <label className="block mb-2">Role
              <select name="role" value={form.role} onChange={handleInput} className="w-full border rounded px-2 py-1 mt-1">
                <option value="ADMIN">Admin</option>
                <option value="CASHIER">Cashier</option>
              </select>
            </label>
            <label className="block mb-4">
              <input type="checkbox" name="isActive" checked={form.isActive} onChange={handleInput} className="mr-2" />
              Active
            </label>
            <div className="flex justify-end gap-2">
              <button type="button" className="px-4 py-2 bg-gray-300 rounded" onClick={() => setShowForm(false)}>Cancel</button>
              <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded">{isEdit ? 'Update' : 'Create'}</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default Staff;
