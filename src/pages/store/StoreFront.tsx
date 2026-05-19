import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Loader2, ShoppingBag, LogIn, UserPlus, Package } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { StoreSignupInfo, StoreProduct } from '../../types';

export default function StoreFront() {
  const { slug } = useParams<{ slug: string }>();
  const { user, loading: authLoading } = useAuth();

  const [store, setStore] = useState<StoreSignupInfo | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [isMember, setIsMember] = useState(false);
  const [storeProducts, setStoreProducts] = useState<StoreProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [joinError, setJoinError] = useState('');

  useEffect(() => {
    if (!authLoading) loadStore();
  }, [slug, authLoading, user]);

  const loadStore = async () => {
    setLoading(true);

    const { data: raw } = await supabase.rpc('get_store_signup_info', { p_slug: slug });
    const storeData: StoreSignupInfo | null = Array.isArray(raw) ? (raw[0] ?? null) : raw;

    if (!storeData || storeData.status === 'archived') {
      setNotFound(true);
      setLoading(false);
      return;
    }
    setStore(storeData);

    if (!user) {
      setLoading(false);
      return;
    }

    const { data: membership } = await supabase
      .from('store_members')
      .select('id')
      .eq('store_id', storeData.id)
      .eq('user_id', user.id)
      .maybeSingle();

    setIsMember(!!membership);

    if (membership) {
      const { data: products } = await supabase
        .from('store_products')
        .select('*, product:products(*)')
        .eq('store_id', storeData.id)
        .eq('is_active', true)
        .order('display_order');
      setStoreProducts(products || []);
    }

    setLoading(false);
  };

  const handleJoin = async () => {
    if (!store || !user) return;
    setJoining(true);
    setJoinError('');
    const { error } = await supabase.rpc('join_store', { p_store_id: store.id });
    if (error) {
      setJoinError(error.message);
      setJoining(false);
      return;
    }
    await loadStore();
    setJoining(false);
  };

  if (loading || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-green-600" />
      </div>
    );
  }

  if (notFound || !store) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Store Not Found</h1>
          <p className="text-gray-600 mb-4">This store doesn't exist or is no longer available.</p>
          <Link to="/" className="text-green-600 hover:text-green-700 font-medium">← Back to All Signs NC</Link>
        </div>
      </div>
    );
  }

  if (store.status === 'paused') {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: store.primary_color + '15' }}>
        <div className="text-center max-w-md px-4">
          {store.logo_url && <img src={store.logo_url} alt={store.name} className="h-16 mx-auto mb-4 object-contain" />}
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{store.name}</h1>
          <p className="text-gray-600">This store is temporarily unavailable. Please check back soon.</p>
          <Link to="/" className="mt-4 inline-block text-sm text-green-600 hover:text-green-700">
            Powered by All Signs NC
          </Link>
        </div>
      </div>
    );
  }

  // Not logged in → login wall
  if (!user) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: store.primary_color + '12' }}>
        <div className="max-w-lg mx-auto px-4 py-20">
          <div className="text-center mb-8">
            {store.logo_url ? (
              <img src={store.logo_url} alt={store.name} className="h-20 mx-auto mb-4 object-contain" />
            ) : (
              <div
                className="w-20 h-20 rounded-2xl mx-auto mb-4 flex items-center justify-center text-white text-3xl font-bold"
                style={{ backgroundColor: store.primary_color }}
              >
                {store.name[0]}
              </div>
            )}
            <h1 className="text-3xl font-bold text-gray-900">{store.name}</h1>
            {store.welcome_message && (
              <p className="text-gray-600 mt-2 text-sm">{store.welcome_message}</p>
            )}
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
            <ShoppingBag className="w-12 h-12 mx-auto mb-4" style={{ color: store.primary_color }} />
            <h2 className="text-xl font-bold text-gray-900 mb-2">Members Only</h2>
            <p className="text-gray-600 mb-6 text-sm">
              Sign in or create an account to browse the {store.name} store.
            </p>
            <div className="space-y-3">
              <Link
                to={`/store/${slug}/login`}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-white font-semibold hover:opacity-90 transition"
                style={{ backgroundColor: store.primary_color }}
              >
                <LogIn className="w-4 h-4" />
                Sign In
              </Link>
              <Link
                to={`/store/${slug}/join`}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl border-2 font-semibold hover:opacity-90 transition bg-white"
                style={{ borderColor: store.primary_color, color: store.primary_color }}
              >
                <UserPlus className="w-4 h-4" />
                Create Account
              </Link>
            </div>
            <p className="mt-6 text-xs text-gray-400">
              Powered by{' '}
              <a href="/" className="text-green-600 hover:text-green-700">All Signs NC</a>
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Logged in but not a member
  if (!isMember) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: store.primary_color + '12' }}>
        <div className="max-w-lg mx-auto px-4 py-20">
          <div className="text-center mb-8">
            {store.logo_url ? (
              <img src={store.logo_url} alt={store.name} className="h-20 mx-auto mb-4 object-contain" />
            ) : (
              <div
                className="w-20 h-20 rounded-2xl mx-auto mb-4 flex items-center justify-center text-white text-3xl font-bold"
                style={{ backgroundColor: store.primary_color }}
              >
                {store.name[0]}
              </div>
            )}
            <h1 className="text-3xl font-bold text-gray-900">{store.name}</h1>
          </div>
          <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
            <h2 className="text-xl font-bold text-gray-900 mb-2">Join This Store</h2>
            <p className="text-gray-600 mb-2 text-sm">
              Your account is not yet associated with this store.
            </p>
            {store.allowed_email_domains.length > 0 && (
              <p className="text-xs text-gray-500 mb-4">
                Requires email ending in: {store.allowed_email_domains.map(d => `@${d}`).join(', ')}
              </p>
            )}
            {joinError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{joinError}</div>
            )}
            <button
              onClick={handleJoin}
              disabled={joining}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-white font-semibold hover:opacity-90 transition disabled:opacity-50"
              style={{ backgroundColor: store.primary_color }}
            >
              {joining ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
              Join {store.name}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Member — product grid
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="py-8 px-4" style={{ backgroundColor: store.primary_color }}>
        <div className="max-w-6xl mx-auto flex items-center gap-4">
          {store.logo_url && (
            <div className="bg-white rounded-lg p-1.5 flex-shrink-0">
              <img src={store.logo_url} alt={store.name} className="h-8 object-contain" />
            </div>
          )}
          <h1 className="text-2xl font-bold text-white">{store.name}</h1>
        </div>
        {store.welcome_message && (
          <div className="max-w-6xl mx-auto mt-1">
            <p className="text-white/75 text-sm">{store.welcome_message}</p>
          </div>
        )}
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h2 className="text-lg font-bold text-gray-900 mb-5">Available Products</h2>
        {storeProducts.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-300">
            <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-600 text-sm">No products available yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {storeProducts.map(sp => (
              <Link
                key={sp.id}
                to={`/store/${slug}/products/${sp.product?.slug}`}
                className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow group"
              >
                <div className="aspect-square bg-gray-100 overflow-hidden">
                  {sp.mockup_image_url ? (
                    <img src={sp.mockup_image_url} alt={sp.display_name || sp.product?.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  ) : sp.product?.image_urls?.[0] ? (
                    <img src={sp.product.image_urls[0]} alt={sp.product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="w-12 h-12 text-gray-300" />
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900">{sp.display_name || sp.product?.name}</h3>
                  {sp.display_description && (
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">{sp.display_description}</p>
                  )}
                  {sp.custom_unit_price != null && (
                    <p className="mt-2 text-lg font-bold" style={{ color: store.primary_color }}>
                      ${sp.custom_unit_price.toFixed(2)}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}

        <p className="mt-10 text-center text-xs text-gray-400">
          Powered by{' '}
          <a href="/" className="text-green-600 hover:text-green-700">All Signs NC</a>
        </p>
      </div>
    </div>
  );
}
