import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Loader2, LogIn } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { StoreSignupInfo } from '../../types';

export default function StoreLogin() {
  const { slug } = useParams<{ slug: string }>();
  const { signIn, user } = useAuth();
  const navigate = useNavigate();

  const [store, setStore] = useState<StoreSignupInfo | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [storeLoading, setStoreLoading] = useState(true);

  useEffect(() => {
    if (user) navigate(`/store/${slug}`, { replace: true });
  }, [user, slug, navigate]);

  useEffect(() => {
    const fetchStore = async () => {
      const { data: raw } = await supabase.rpc('get_store_signup_info', { p_slug: slug });
      const storeData: StoreSignupInfo | null = Array.isArray(raw) ? (raw[0] ?? null) : raw;
      setStore(storeData);
      setStoreLoading(false);
    };
    fetchStore();
  }, [slug]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await signIn(email, password);
      navigate(`/store/${slug}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to sign in');
    } finally {
      setLoading(false);
    }
  };

  if (storeLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-green-600" />
      </div>
    );
  }

  const brandColor = store?.primary_color || '#10B981';

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4" style={{ backgroundColor: brandColor + '12' }}>
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          {store?.logo_url ? (
            <img src={store.logo_url} alt={store.name} className="h-16 mx-auto mb-4 object-contain" />
          ) : (
            <div
              className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center text-white text-xl font-bold"
              style={{ backgroundColor: brandColor }}
            >
              {store?.name?.[0] ?? 'S'}
            </div>
          )}
          <h1 className="text-2xl font-bold text-gray-900">{store?.name ?? 'Company Store'}</h1>
          <p className="text-gray-600 mt-1 text-sm">Sign in to access the store</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>
            )}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Work Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-0"
                style={{ '--tw-ring-color': brandColor } as React.CSSProperties}
                placeholder="you@company.com"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                placeholder="Enter your password"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-white font-semibold hover:opacity-90 transition disabled:opacity-50"
              style={{ backgroundColor: brandColor }}
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogIn className="w-4 h-4" />}
              Sign In
            </button>
          </form>

          <div className="mt-5 text-center text-sm">
            <p className="text-gray-600">
              Don't have an account?{' '}
              <Link to={`/store/${slug}/join`} className="font-semibold" style={{ color: brandColor }}>
                Create one
              </Link>
            </p>
          </div>

          <div className="mt-5 pt-4 border-t border-gray-100 text-center">
            <p className="text-xs text-gray-400">
              Powered by{' '}
              <a href="/" className="text-green-600 hover:text-green-700">All Signs NC</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
