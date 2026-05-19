import { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { Loader2, Store, ExternalLink, Package } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { BusinessStore, StoreMember } from '../../types';

type MemberStore = StoreMember & { store: BusinessStore };

export default function MyStores() {
  const { user } = useAuth();
  const [memberships, setMemberships] = useState<MemberStore[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) loadMemberships();
  }, [user]);

  const loadMemberships = async () => {
    const { data } = await supabase
      .from('store_members')
      .select('*, store:business_stores(*)')
      .eq('user_id', user!.id)
      .order('created_at', { ascending: false });
    setMemberships((data as MemberStore[]) || []);
    setLoading(false);
  };

  if (!user) return <Navigate to="/login" />;

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link to="/account" className="text-sm text-gray-500 hover:text-gray-700">← My Account</Link>
          <h1 className="text-3xl font-bold text-gray-900 mt-2">My Company Stores</h1>
          <p className="text-gray-600 mt-1">Company merchandise stores you have access to.</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-6 h-6 animate-spin text-green-600" />
          </div>
        ) : memberships.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-16 text-center">
            <Store className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-gray-900 mb-2">No store memberships</h2>
            <p className="text-sm text-gray-600 max-w-sm mx-auto">
              You're not a member of any company store yet. If your company has a store, visit its URL to join.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {memberships.map(({ store, role, id }) => (
              <div key={id} className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                <div className="h-2" style={{ backgroundColor: store.primary_color }} />
                <div className="p-5">
                  <div className="flex items-center gap-3 mb-4">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 border border-gray-100"
                      style={{ backgroundColor: store.primary_color }}
                    >
                      {store.logo_url ? (
                        <img src={store.logo_url} alt={store.name} className="w-full h-full object-contain rounded-xl p-1" />
                      ) : (
                        <Store className="w-5 h-5 text-white" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold text-gray-900 truncate">{store.name}</h3>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        store.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {store.status}
                      </span>
                    </div>
                  </div>

                  {store.welcome_message && (
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">{store.welcome_message}</p>
                  )}

                  <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                    <span className="capitalize">Role: <strong>{role}</strong></span>
                  </div>

                  <div className="flex gap-2">
                    <Link
                      to={`/store/${store.slug}`}
                      className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold text-white hover:opacity-90 transition"
                      style={{ backgroundColor: store.primary_color }}
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      Shop
                    </Link>
                    <Link
                      to={`/account/stores/${store.slug}`}
                      className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium border border-gray-300 hover:bg-gray-50 transition text-gray-700"
                    >
                      <Package className="w-3.5 h-3.5" />
                      My Orders
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
