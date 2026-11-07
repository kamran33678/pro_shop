'use client';

import React, { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { FolderTree, Plus, X } from 'lucide-react';
import { api } from '@/lib/api';

export default function CategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [showModal, setShowModal] = useState(false);

  const fetchCats = async () => {
    try {
      const res = await api.get('/products/categories');
      setCategories(res.data || []);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchCats();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/products/categories', { name, description });
      setName('');
      setDescription('');
      setShowModal(false);
      fetchCats();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Product Categories</h2>
            <p className="text-sm text-slate-500">Organize mobile phones, smartwatches, accessories & spare parts</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-xl transition"
          >
            <Plus className="w-4 h-4" />
            <span>Add Category</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((c) => (
            <div key={c.id} className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-2">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                <FolderTree className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-slate-900">{c.name}</h3>
              <p className="text-xs text-slate-500">{c.description || 'No description added.'}</p>
            </div>
          ))}
        </div>

        {showModal && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
              <div className="flex justify-between items-center pb-2 border-b">
                <h3 className="font-bold text-slate-900">Create Category</h3>
                <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleCreate} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Category Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Description</label>
                  <input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border rounded-xl text-sm"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border rounded-xl text-xs font-semibold">Cancel</button>
                  <button type="submit" className="px-5 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold">Save</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}

