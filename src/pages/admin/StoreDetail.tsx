import { useEffect, useRef, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Loader2, Upload, Save, ArrowLeft, Plus, Trash2, Users, Image as ImageIcon } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { BusinessStore, StoreProduct, StoreMember, Product } from '../../types';

const LOGO_BUCKET = 'store-logos';
const MOCKUP_BUCKET = 'store-mockups';

export default function StoreDetail() {
  const { slug } = useParams<{ slug: string }>();
  const [store, setStore] = useState<BusinessStore | null>(null);
  const [storeProducts, setStoreProducts] = useState<StoreProduct[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [members, setMembers] = useState<Array<StoreMember & { email?: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [savingStore, setSavingStore] = useState(false);
  const [tab, setTab] = useState<'settings' | 'products' | 'members'>('settings');

  // Form mirrors of store fields for editing
  const [name, setName] = useState('');
  const [color, setColor] = useState('#10B981');
  const [welcome, setWelcome] = useState('');
  const [domainsText, setDomainsText] = useState('');
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [logoUploading, setLogoUploading] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { if (slug) loadAll(); }, [slug]);

  const loadAll = async () => {
    setLoading(true);
    const { data: s } = await supabase.from('business_stores').select('*').eq('slug', slug).maybeSingle();
    if (!s) { setLoading(false); return; }
    setStore(s);
    setName(s.name);
    setColor(s.primary_color);
    setWelcome(s.welcome_message || '');
    setDomainsText((s.allowed_email_domains || []).join(', '));
    setLogoUrl(s.logo_url);

    const { data: sp } = await supabase
      .from('store_products')
      .select('*, product:products(*)')
      .eq('store_id', s.id)
      .order('display_order');
    setStoreProducts(sp || []);

    const { data: prod } = await supabase
      .from('products')
      .select('*')
      .eq('is_active', true)
      .order('name');
    setAllProducts(prod || []);

    const { data: m } = await supabase
      .from('store_members')
      .select('*')
      .eq('store_id', s.id)
      .order('created_at', { ascending: false });
    setMembers(m || []);

    setLoading(false);
  };

  const saveSettings = async () => {
    if (!store) return;
    setSavingStore(true);
    const domains = domainsText
      .split(/[,;\s\n]+/)
      .map(d => d.trim().toLowerCase().replace(/^@/, ''))
      .filter(Boolean);
    const { error } = await supabase
      .from('business_stores')
      .update({
        name,
        primary_color: color,
        welcome_message: welcome || null,
        allowed_email_domains: domains,
      })
      .eq('id', store.id);
    setSavingStore(false);
    if (!error) await loadAll();
    else alert(error.message);
  };

  const uploadLogo = async (file: File) => {
    if (!store) return;
    setLogoUploading(true);
    try {
      const ext = file.name.split('.').pop() || 'png';
      const path = `${store.id}/${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from(LOGO_BUCKET).upload(path, file, { upsert: false, cacheControl: '3600' });
      if (error) { alert('Upload failed: ' + error.message); return; }
      const { data: { publicUrl } } = supabase.storage.from(LOGO_BUCKET).getPublicUrl(path);
      await supabase.from('business_stores').update({ logo_url: publicUrl, logo_storage_path: path }).eq('id', store.id);
      setLogoUrl(publicUrl);
    } finally {
      setLogoUploading(false);
    }
  };

  const removeMember = async (memberId: string) => {
    if (!confirm('Remove this member from the store?')) return;
    await supabase.from('store_members').delete().eq('id', memberId);
    await loadAll();
  };

  const addStoreProduct = async (productId: string) => {
    if (!store) return;
    await supabase.from('store_products').insert({
      store_id: store.id,
      product_id: productId,
      is_active: true,
      display_order: storeProducts.length,
    });
    await loadAll();
  };

  const updateStoreProduct = async (sp: StoreProduct, patch: Partial<StoreProduct>) => {
    await supabase.from('store_products').update(patch).eq('id', sp.id);
    await loadAll();
  };

  const removeStoreProduct = async (id: string) => {
    if (!confirm('Remove this product from the store?')) return;
    await supabase.from('store_products').delete().eq('id', id);
    await loadAll();
  };

  const uploadMockup = async (sp: StoreProduct, file: File) => {
    if (!store) return;
    const ext = file.name.split('.').pop() || 'png';
    const path = `${store.id}/${sp.id}/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from(MOCKUP_BUCKET).upload(path, file, { upsert: false });
    if (error) { alert('Upload failed: ' + error.message); return; }
    const { data: { publicUrl } } = supabase.storage.from(MOCKUP_BUCKET).getPublicUrl(path);
    await updateStoreProduct(sp, { mockup_image_url: publicUrl });
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-green-600" /></div>;
  if (!store) return <div className="p-8"><Link to="/admin/stores" className="text-blue-600">← Back to stores</Link><p className="mt-4">Store not found.</p></div>;

  const availableToAdd = allProducts.filter(p => !storeProducts.some(sp => sp.product_id === p.id));

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link to="/admin/stores" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800 mb-4">
          <ArrowLeft className="w-3.5 h-3.5" /> All Stores
        </Link>

        <div className="flex items-center gap-3 mb-6">
          <div
            className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 border border-gray-200"
            style={{ backgroundColor: store.primary_color }}
          >
            {logoUrl ? <img src={logoUrl} className="w-full h-full object-contain rounded-lg" /> : <span className="text-white font-bold">{store.name[0]}</span>}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{store.name}</h1>
            <p className="text-sm text-gray-500">/store/{store.slug}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="flex gap-6">
            {(['settings', 'products', 'members'] as const).map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`pb-3 text-sm font-medium border-b-2 transition-colors capitalize ${tab === t ? 'border-green-600 text-green-700' : 'border-transparent text-gray-500 hover:text-gray-800'}`}
              >
                {t} {t === 'products' && `(${storeProducts.length})`} {t === 'members' && `(${members.length})`}
              </button>
            ))}
          </nav>
        </div>

        {/* ── Settings ── */}
        {tab === 'settings' && (
          <div className="bg-white rounded-xl p-6 border border-gray-200 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Logo</label>
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-lg border border-gray-200 flex items-center justify-center bg-gray-50">
                  {logoUrl ? <img src={logoUrl} className="w-full h-full object-contain" /> : <ImageIcon className="w-6 h-6 text-gray-300" />}
                </div>
                <button
                  onClick={() => logoInputRef.current?.click()}
                  disabled={logoUploading}
                  className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
                >
                  {logoUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                  Upload Logo
                </button>
                <input
                  ref={logoInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/svg+xml,image/webp"
                  className="hidden"
                  onChange={e => { const f = e.target.files?.[0]; if (f) uploadLogo(f); }}
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">PNG/SVG with transparent background looks best. Max 5MB.</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Brand Color</label>
              <div className="flex gap-2">
                <input type="color" value={color} onChange={e => setColor(e.target.value)} className="w-12 h-10 rounded cursor-pointer border border-gray-300" />
                <input type="text" value={color} onChange={e => setColor(e.target.value)} className="w-32 px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Welcome Message <span className="text-gray-400 font-normal">(shown on storefront)</span></label>
              <textarea
                value={welcome}
                onChange={e => setWelcome(e.target.value)}
                rows={3}
                placeholder="Welcome to the Acme Corp company store! Order branded gear and we'll ship it to you."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Allowed Email Domains</label>
              <input
                type="text"
                value={domainsText}
                onChange={e => setDomainsText(e.target.value)}
                placeholder="acmecorp.com, acme.io"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
              <p className="mt-1 text-xs text-gray-500">Comma-separated. Only signups matching these domains will be accepted.</p>
            </div>

            <div className="pt-3 border-t border-gray-100">
              <button
                onClick={saveSettings}
                disabled={savingStore}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm disabled:opacity-50"
              >
                {savingStore ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save Changes
              </button>
            </div>
          </div>
        )}

        {/* ── Products ── */}
        {tab === 'products' && (
          <div className="space-y-4">
            <div className="bg-white rounded-xl p-4 border border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-900">Add a product</h3>
                <p className="text-xs text-gray-500">{availableToAdd.length} available</p>
              </div>
              {availableToAdd.length === 0 ? (
                <p className="text-sm text-gray-400 italic">All available products have been added.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  {availableToAdd.map(p => (
                    <button
                      key={p.id}
                      onClick={() => addStoreProduct(p.id)}
                      className="flex items-center gap-2 px-3 py-2 border border-dashed border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 text-sm text-left"
                    >
                      <Plus className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <span className="truncate">{p.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {storeProducts.length === 0 ? (
              <div className="bg-white rounded-xl p-8 text-center text-sm text-gray-500 border border-dashed border-gray-300">
                No products configured yet — add some above.
              </div>
            ) : (
              <div className="space-y-3">
                {storeProducts.map(sp => (
                  <StoreProductCard
                    key={sp.id}
                    sp={sp}
                    onUpdate={patch => updateStoreProduct(sp, patch)}
                    onRemove={() => removeStoreProduct(sp.id)}
                    onUploadMockup={f => uploadMockup(sp, f)}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Members ── */}
        {tab === 'members' && (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            {members.length === 0 ? (
              <div className="p-12 text-center">
                <Users className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                <p className="text-sm text-gray-500">No members yet. They'll appear here once they sign up via the store link.</p>
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr className="text-left text-xs font-semibold uppercase text-gray-500">
                    <th className="px-4 py-3">User</th>
                    <th className="px-4 py-3">Role</th>
                    <th className="px-4 py-3">Joined</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {members.map(m => (
                    <tr key={m.id}>
                      <td className="px-4 py-3 font-mono text-xs text-gray-600">{m.user_id.slice(0, 8)}…</td>
                      <td className="px-4 py-3 capitalize">{m.role}</td>
                      <td className="px-4 py-3 text-gray-500">{new Date(m.created_at).toLocaleDateString()}</td>
                      <td className="px-4 py-3 text-right">
                        <button onClick={() => removeMember(m.id)} className="p-1.5 rounded hover:bg-gray-100 text-red-500">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function StoreProductCard({
  sp,
  onUpdate,
  onRemove,
  onUploadMockup,
}: {
  sp: StoreProduct;
  onUpdate: (patch: Partial<StoreProduct>) => void;
  onRemove: () => void;
  onUploadMockup: (file: File) => void;
}) {
  const [displayName, setDisplayName] = useState(sp.display_name || '');
  const [price, setPrice] = useState(sp.custom_unit_price?.toString() || '');
  const [notes, setNotes] = useState(sp.logo_placement_notes || '');
  const mockupInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="bg-white rounded-xl p-4 border border-gray-200 flex gap-4">
      {/* Mockup thumbnail */}
      <div
        onClick={() => mockupInputRef.current?.click()}
        className="w-28 h-28 rounded-lg border border-gray-200 flex items-center justify-center bg-gray-50 cursor-pointer hover:border-green-500 flex-shrink-0 overflow-hidden"
        title="Click to upload mockup with logo placed"
      >
        {sp.mockup_image_url ? (
          <img src={sp.mockup_image_url} className="w-full h-full object-cover" />
        ) : (
          <div className="text-center text-xs text-gray-400 px-2">
            <Upload className="w-5 h-5 mx-auto mb-1" />
            Upload mockup
          </div>
        )}
        <input ref={mockupInputRef} type="file" accept="image/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) onUploadMockup(f); }} />
      </div>

      {/* Fields */}
      <div className="flex-1 min-w-0 grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="sm:col-span-2">
          <p className="text-xs text-gray-500">{sp.product?.name}</p>
          <input
            type="text"
            placeholder={sp.product?.name || 'Display name override'}
            value={displayName}
            onChange={e => setDisplayName(e.target.value)}
            onBlur={() => onUpdate({ display_name: displayName || null })}
            className="w-full mt-1 px-2 py-1 border border-gray-200 rounded text-sm font-semibold"
          />
        </div>
        <div>
          <label className="text-xs text-gray-500 block mb-1">Store Price (USD)</label>
          <input
            type="number"
            step="0.01"
            placeholder="Use base pricing"
            value={price}
            onChange={e => setPrice(e.target.value)}
            onBlur={() => onUpdate({ custom_unit_price: price ? parseFloat(price) : null })}
            className="w-full px-2 py-1 border border-gray-200 rounded text-sm"
          />
        </div>
        <div>
          <label className="text-xs text-gray-500 block mb-1">Active</label>
          <select
            value={sp.is_active ? 'yes' : 'no'}
            onChange={e => onUpdate({ is_active: e.target.value === 'yes' })}
            className="w-full px-2 py-1 border border-gray-200 rounded text-sm"
          >
            <option value="yes">Visible</option>
            <option value="no">Hidden</option>
          </select>
        </div>
        <div className="sm:col-span-2">
          <label className="text-xs text-gray-500 block mb-1">Logo placement notes <span className="text-gray-400">(internal)</span></label>
          <input
            type="text"
            placeholder="e.g. left chest, 3.5 inch wide"
            value={notes}
            onChange={e => setNotes(e.target.value)}
            onBlur={() => onUpdate({ logo_placement_notes: notes || null })}
            className="w-full px-2 py-1 border border-gray-200 rounded text-sm"
          />
        </div>
      </div>

      <button onClick={onRemove} title="Remove from store" className="self-start p-1.5 rounded hover:bg-gray-100 text-red-500">
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
}
