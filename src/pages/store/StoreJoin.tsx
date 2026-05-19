import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Loader2, UserPlus, Mail } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { StoreSignupInfo } from '../../types';

export default function StoreJoin() {
  const { slug } = useParams<{ slug: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [store, setStore] = useState<StoreSignupInfo | null>(null);
  const [storeLoading, setStoreLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  useEffect(() => {
    const fetchStore = async () => {
      const { data: raw } = await supabase.rpc('get_store_signup_info', { p_slug: slug });
      const storeData: StoreSignupInfo | null = Array.isArray(raw) ? (raw[0] ?? null) : raw;
      setStore(storeData);
      setStoreLoading(false);
    };
    fetchStore();
  }, [slug]);

  // If already logged in and store is loaded, join immediately
  useEffect(() => {
    if (user && store) {
      supabase.rpc('join_store', { p_store_id: store.id }).then(() => {
        navigate(`/store/${slug}`, { replace: true });
      });
    }
  }, [user, store, slug, navigate]);

  const validateDomain = (emailAddr: string): boolean => {
    if (!store || store.allowed_email_domains.length === 0) return true;
    const domain = emailAddr.split('@')[1]?.toLowerCase();
    return store.allowed_email_domains.some(d => d.toLowerCase() === domain);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateDomain(email)) {
      setError(`Your email must end with: ${store!.allowed_email_domains.map(d => `@${d}`).join(', ')}`);
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      const { data: { session }, error: signUpError } = await supabase.auth.signUp({ email, password });
      if (signUpError) {
        setError(signUpError.message);
        return;
      }

      if (session) {
        // Auto-confirmed — join the store and go
        const { error: joinError } = await supabase.rpc('join_store', { p_store_id: store!.id });
        if (joinError) {
          setError(joinError.message);
          return;
        }
        navigate(`/store/${slug}`);
      } else {
        // Email confirmation required — show instructions
        setEmailSent(true);
      }
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

  if (!store) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Store not found.</p>
      </div>
    );
  }

  const brandColor = store.primary_color;

  if (emailSent) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: brandColor + '12' }}>
        <div className="max-w-md w-full text-center">
          <div
            className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center"
            style={{ backgroundColor: brandColor + '20' }}
          >
            <Mail className="w-8 h-8" style={{ color: brandColor }} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Check your email</h2>
          <p className="text-gray-600 mb-2">
            We sent a confirmation link to <strong>{email}</strong>.
          </p>
          <p className="text-gray-500 text-sm">
            After confirming, visit{' '}
            <Link to={`/store/${slug}/login`} style={{ color: brandColor }} className="font-medium">
              the store login
            </Link>{' '}
            to access your {store.name} account.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4" style={{ backgroundColor: brandColor + '12' }}>
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          {store.logo_url ? (
            <img src={store.logo_url} alt={store.name} className="h-16 mx-auto mb-4 object-contain" />
          ) : (
            <div
              className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center text-white text-xl font-bold"
              style={{ backgroundColor: brandColor }}
            >
              {store.name[0]}
            </div>
          )}
          <h1 className="text-2xl font-bold text-gray-900">{store.name}</h1>
          <p className="text-gray-600 mt-1 text-sm">Create your store account</p>
          {store.allowed_email_domains.length > 0 && (
            <p className="text-sm text-gray-500 mt-1">
              Requires: {store.allowed_email_domains.map(d => `@${d}`).join(', ')}
            </p>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
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
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                placeholder={
                  store.allowed_email_domains.length > 0
                    ? `you@${store.allowed_email_domains[0]}`
                    : 'you@company.com'
                }
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
                placeholder="At least 6 characters"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Confirm Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                placeholder="Confirm your password"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-white font-semibold hover:opacity-90 transition disabled:opacity-50"
              style={{ backgroundColor: brandColor }}
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
              Create Account
            </button>
          </form>

          <div className="mt-5 text-center text-sm">
            <p className="text-gray-600">
              Already have an account?{' '}
              <Link to={`/store/${slug}/login`} className="font-semibold" style={{ color: brandColor }}>
                Sign in
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
