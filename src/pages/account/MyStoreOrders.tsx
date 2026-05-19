import { useEffect, useState } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { Loader2, Package, ArrowLeft } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Order, StoreSignupInfo } from '../../types';

export default function MyStoreOrders() {
  const { slug } = useParams<{ slug: string }>();
  const { user } = useAuth();

  const [store, setStore] = useState<StoreSignupInfo | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && slug) loadData();
  }, [user, slug]);

  const loadData = async () => {
    setLoading(true);

    const { data: rawStore } = await supabase.rpc('get_store_signup_info', { p_slug: slug });
    const storeData: StoreSignupInfo | null = Array.isArray(rawStore) ? (rawStore[0] ?? null) : rawStore;
    setStore(storeData);

    if (storeData) {
      const { data: orderData } = await supabase
        .from('orders')
        .select('*')
        .eq('store_id', storeData.id)
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false });
      setOrders(orderData || []);
    }

    setLoading(false);
  };

  if (!user) return <Navigate to="/login" />;

  const brandColor = store?.primary_color || '#10B981';

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Link to="/account/stores" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
            <ArrowLeft className="w-3.5 h-3.5" /> My Stores
          </Link>
        </div>

        {store && (
          <div className="flex items-center gap-3 mb-6">
            <div
              className="w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center"
              style={{ backgroundColor: brandColor }}
            >
              {store.logo_url ? (
                <img src={store.logo_url} alt={store.name} className="w-full h-full object-contain rounded-xl p-1" />
              ) : (
                <span className="text-white font-bold text-sm">{store.name[0]}</span>
              )}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{store.name} — My Orders</h1>
              <Link to={`/store/${slug}`} className="text-sm hover:underline" style={{ color: brandColor }}>
                Visit Store →
              </Link>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-6 h-6 animate-spin text-green-600" />
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-16 text-center">
            <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-gray-900 mb-2">No orders yet</h2>
            <p className="text-sm text-gray-600 mb-5">You haven't placed any orders from this store.</p>
            <Link
              to={`/store/${slug}`}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-white font-semibold hover:opacity-90 transition"
              style={{ backgroundColor: brandColor }}
            >
              Shop Now
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900">{orders.length} order{orders.length !== 1 ? 's' : ''}</h2>
            </div>
            <div className="divide-y divide-gray-100">
              {orders.map(order => (
                <div key={order.id} className="px-5 py-4 flex items-center justify-between gap-4">
                  <div>
                    <p className="font-semibold text-gray-900">Order #{order.order_number}</p>
                    <p className="text-sm text-gray-500 mt-0.5">
                      {new Date(order.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      order.status === 'delivered' || order.status === 'shipped'
                        ? 'bg-green-100 text-green-700'
                        : order.status === 'cancelled'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {order.status.replace('_', ' ').toUpperCase()}
                    </span>
                    <p className="font-bold text-gray-900 text-right min-w-[60px]">${order.total_amount.toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
