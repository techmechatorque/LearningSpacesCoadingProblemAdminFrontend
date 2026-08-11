import React, { useState, useEffect } from 'react';
import { getSetters, updateSetterStatus } from '../services/api';
import { Users, Shield, ShieldAlert, CheckCircle, XCircle } from 'lucide-react';

const ManageSetters = () => {
  const [setters, setSetters] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSetters();
  }, []);

  const fetchSetters = async () => {
    try {
      const data = await getSetters();
      setSetters(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (id, field, value) => {
    if (!window.confirm(`Are you sure you want to change ${field} to ${value}?`)) return;
    try {
      await updateSetterStatus(id, { [field]: value });
      fetchSetters();
    } catch (err) {
      alert('Update failed');
    }
  };

  if (loading) return <div className="p-8 text-center text-dark-muted">Loading...</div>;

  return (
    <div className="p-8 animate-fade-in max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center space-x-3">
          <Users className="h-8 w-8 text-brand-primary" />
          <span>Manage Setters</span>
        </h1>
        <p className="text-dark-muted mt-2">Manage problem setter accounts and trust badges.</p>
      </div>

      <div className="bg-dark-card border border-dark-border rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-dark-hover/50 text-dark-muted text-xs uppercase tracking-wider">
                <th className="p-4 pl-6">Setter</th>
                <th className="p-4">Bio</th>
                <th className="p-4">Status</th>
                <th className="p-4">Badge</th>
                <th className="p-4 text-right pr-6">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-border">
              {setters.map((setter) => (
                <tr key={setter._id} className="hover:bg-dark-hover/30 transition-colors">
                  <td className="p-4 pl-6">
                    <div className="flex flex-col">
                      <span className="text-white font-bold">{setter.name}</span>
                      <span className="text-sm text-gray-400">{setter.email}</span>
                    </div>
                  </td>
                  <td className="p-4 text-sm text-gray-400 max-w-xs truncate">
                    {setter.bio || 'No bio provided'}
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      setter.accountStatus === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {setter.accountStatus}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      setter.badge === 'certified' ? 'bg-brand-primary/20 text-brand-primary' : 
                      setter.badge === 'trusted' ? 'bg-blue-500/20 text-blue-400' : 'bg-gray-500/20 text-gray-400'
                    }`}>
                      {setter.badge}
                    </span>
                  </td>
                  <td className="p-4 pr-6">
                    <div className="flex justify-end space-x-2">
                      <select 
                        value={setter.badge}
                        onChange={(e) => handleUpdate(setter._id, 'badge', e.target.value)}
                        className="bg-dark-bg border border-dark-border rounded px-2 py-1 text-xs text-white"
                      >
                        <option value="none">None</option>
                        <option value="trusted">Trusted</option>
                        <option value="certified">Certified</option>
                      </select>
                      
                      <select 
                        value={setter.accountStatus}
                        onChange={(e) => handleUpdate(setter._id, 'accountStatus', e.target.value)}
                        className="bg-dark-bg border border-dark-border rounded px-2 py-1 text-xs text-white"
                      >
                        <option value="pending_approval">Pending</option>
                        <option value="active">Active</option>
                        <option value="suspended">Suspended</option>
                      </select>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ManageSetters;
