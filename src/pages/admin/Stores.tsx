import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Store, Loader2, Pause, Play, ExternalLink, Pencil, Trash2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { BusinessStore } from '../../types';

interface StoreStats {
  order_count: number;
  revenue: number;
  pending: number;
}

export default function AdminStores() {
  const navigate = useNavigate();
  const [stores, setStores] = useState<BusinessStore[]>([]);
  const [stats, setStats] = useState<Record<string, StoreStats>>({});
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [newSlug, setNewSlug] = useState('');
  const [newDomains, setNewDomains] = useState('');
  const [newColor, setNewColor] = useState('#10B981');
  const [createBusy, setCreateBusy] = useState(false);
  const [createError, setCreateError] = useState('');

  useEffect(() => { loadStores(); }, []);

  const loadStores = async () => {
    setLoading(true);
    const [{ data: storeData }, { data: orderData }] = await Promise.all([
      supabase.from('business_stores').select('*').order('created_at', { ascending: false }),
      supabase.from('orders').select('store_id, total_amount, status').not('store_id', 'is', null),
    ]);
    setStores(storeData || []);

    // Aggregate order stats by store_id client-side
    const agg: Record<string, StoreStats> = {};
    for (const o of (orderData || [])) {
      if (!o.store_id) continue;
      if (!agg[o.store_id]) agg[o.store_id] = { order_count: 0, revenue: 0, pending: 0 };
      agg[o.store_id].order_count++;
      agg[o.store_id].revenue += o.total_amount ?? 0;
      if (['pending', 'processing'].includes(o.status)) agg[o.store_id].pending++;
    }
    setStats(agg);
    setLoading(false);
  };

  const slugify = (s: string) =>
    s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

  const createStore = async () => {
    setCreateError('');
    const slug = (newSlug || slugify(newName));
    if (!newName.trim() || !slug) { setCreateError('Name and slug are required.'); return; }

    const domains = newDomains
      .split(/[,;\s\n]+/)
      .map(d => d.trim().toLowerCase().replace(/^@/, ''))
      .filter(Boolean);

    setCreateBusy(true);
    try {
      const { error } = await supabase
        .from('business_stores')
        .insert({
          name: newName.trim(),
          slug,
          primary_color: newColor,
          allowed_email_domains: domains,
        });
      if (error) { setCreateError(error.message); return; }
      setShowCreate(false);
      setNewName(''); setNewSlug(''); setNewDomains(''); setNewColor('#10B981');
      await loadStores();
    } finally {
      setCreateBusy(false);
    }
  };

  const togglePause = async (store: BusinessStore) => {
    const next = store.status === 'active' ? 'paused' : 'active';
    await supabase.from('business_stores').update({ status: next }).eq('id', store.id);
    await loadStores();
  };

  const deleteStore = async (store: BusinessStore) => {
    if (!confirm(`Archive "${store.name}"? Members will lose access. (Can be reversed.)`)) return;
    await supabase.from('business_stores').update({ status: 'archived' }).eq('id', store.id);
    await loadStores();
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Business Stores</h1>
            <p className="text-gray-600 mt-1">White-label corporate merch shops for partner companies.</p>
          </div>
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <Plus className="w-4 h-4" /> New Store
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-green-600" /></div>
        ) : stores.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center border border-dashed border-gray-300">
            <Store className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-gray-900 mb-1">No stores yet</h2>
            <p className="text-sm text-gray-600 mb-4">Create your first corporate merch store.</p>
            <button onClick={() => setShowCreate(true)} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
              Create a Store
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr className="text-left text-xs font-semibold uppercase text-gray-500">
                  <th className="px-4 py-3">Store</th>
                  <th className="px-4 py-3">URL</th>
                  <th className="px-4 py-3">Domains</th>
                  <th className="px-4 py-3">Orders</th>
                  <th className="px-4 py-3">Revenue</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {stores.map(s => (
                  <tr key={s.id} className={s.status === 'archived' ? 'opacity-50' : ''}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-8 h-8 rounded flex-shrink-0 border border-gray-200 flex items-center justify-center"
                          style={{ backgroundColor: s.primary_color }}
                        >
                          {s.logo_url ? (
                            <img src={s.logo_url} alt="" className="w-full h-full object-contain rounded" />
                          ) : (
                            <Store className="w-4 h-4 text-white" />
                          )}
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">{s.name}</div>
                          <div className="text-xs text-gray-500">{new Date(s.created_at).toLocaleDateString()}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded">/store/{s.slug}</code>
                    </td>
                    <td className="px-4 py-3">
                      {s.allowed_email_domains.length === 0 ? (
                        <span className="text-xs text-orange-600">open</span>
                      ) : (
                        <span className="text-xs text-gray-700">
                          {s.allowed_email_domains.slice(0, 2).join(', ')}
                          {s.allowed_email_domains.length > 2 && ` +${s.allowed_email_domains.length - 2}`}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-700 text-xs">
                      {stats[s.id] ? (
                        <span>
                          <strong>{stats[s.id].order_count}</strong>
                          {stats[s.id].pending > 0 && (
                            <span className="ml-1 text-yellow-600">({stats[s.id].pending} pending)</span>
                          )}
                        </span>
                      ) : <span className="text-gray-400">—</span>}
                    </td>
                    <td className="px-4 py-3 text-xs font-semibold text-gray-900">
                      {stats[s.id] ? `$${stats[s.id].revenue.toFixed(2)}` : <span className="text-gray-400 font-normal">—</span>}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        s.status === 'active' ? 'bg-green-100 text-green-700'
                          : s.status === 'paused' ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {s.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <a
                          href={`/store/${s.slug}`}
                          target="_blank"
                          rel="noreferrer"
                          title="View storefront"
                          className="p-1.5 rounded hover:bg-gray-100 text-gray-500"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                        <button
                          onClick={() => navigate(`/admin/stores/${s.slug}`)}
                          title="Edit"
                          className="p-1.5 rounded hover:bg-gray-100 text-gray-500"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        {s.status !== 'archived' && (
                          <button
                            onClick={() => togglePause(s)}
                            title={s.status === 'active' ? 'Pause' : 'Activate'}
                            className="p-1.5 rounded hover:bg-gray-100 text-gray-500"
                          >
                            {s.status === 'active' ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                          </button>
                        )}
                        <button
                          onClick={() => deleteStore(s)}
                          title="Archive"
                          className="p-1.5 rounded hover:bg-gray-100 text-red-500"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-2xl">
            <h2 className="text-xl font-bold text-gray-900 mb-1">Create New Store</h2>
            <p className="text-sm text-gray-500 mb-5">You can configure products and upload the logo after creation.</p>

            {createError && (
              <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">{createError}</div>
            )}

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Company Name *</label>
                <input
                  type="text"
                  value={newName}
                  onChange={e => { setNewName(e.target.value); if (!newSlug) setNewSlug(slugify(e.target.value)); }}
                  placeholder="Acme Corp"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  URL Slug * <span className="text-gray-400 font-normal">(/store/<strong>{newSlug || 'acme-corp'}</strong>)</span>
                </label>
                <input
                  type="text"
                  value={newSlug}
                  onChange={e => setNewSlug(slugify(e.target.value))}
                  placeholder="acme-corp"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Allowed Email Domains <span className="text-gray-400 font-normal">(comma-separated)</span>
                </label>
                <input
                  type="text"
                  value={newDomains}
                  onChange={e => setNewDomains(e.target.value)}
                  placeholder="acmecorp.com, acme.io"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500"
                />
                <p className="mt-1 text-xs text-gray-500">Only employees with these email domains can sign up. Leave blank to allow any domain.</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Brand Color</label>
                <div className="flex gap-2">
                  <input type="color" value={newColor} onChange={e => setNewColor(e.target.value)} className="w-12 h-10 rounded cursor-pointer border border-gray-300" />
                  <input type="text" value={newColor} onChange={e => setNewColor(e.target.value)} className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-green-500" />
                </div>
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <button onClick={() => setShowCreate(false)} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">
                Cancel
              </button>
              <button
                onClick={createStore}
                disabled={createBusy}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {createBusy && <Loader2 className="w-4 h-4 animate-spin" />}
                Create Store
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
