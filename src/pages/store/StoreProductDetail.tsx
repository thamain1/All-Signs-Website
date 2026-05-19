import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Loader2, ShoppingCart, Check, ArrowLeft, Package } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import { StoreSignupInfo, StoreProduct, ProductOption } from '../../types';

export default function StoreProductDetail() {
  const { slug, productSlug } = useParams<{ slug: string; productSlug: string }>();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const navigate = useNavigate();

  const [store, setStore] = useState<StoreSignupInfo | null>(null);
  const [storeProduct, setStoreProduct] = useState<StoreProduct | null>(null);
  const [options, setOptions] = useState<ProductOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);

  const [quantity, setQuantity] = useState(1);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});

  useEffect(() => {
    loadProduct();
  }, [slug, productSlug]);

  const loadProduct = async () => {
    setLoading(true);

    // Load store
    const { data: rawStore } = await supabase.rpc('get_store_signup_info', { p_slug: slug });
    const storeData: StoreSignupInfo | null = Array.isArray(rawStore) ? (rawStore[0] ?? null) : rawStore;
    if (!storeData || storeData.status !== 'active') {
      setLoading(false);
      return;
    }
    setStore(storeData);

    // Load store product via product slug
    const { data: sp } = await supabase
      .from('store_products')
      .select('*, product:products(*)')
      .eq('store_id', storeData.id)
      .eq('is_active', true)
      .filter('product.slug', 'eq', productSlug)
      .maybeSingle();

    // The .filter on a joined table doesn't work directly in PostgREST
    // Fetch via products table instead
    const { data: productRow } = await supabase
      .from('products')
      .select('id')
      .eq('slug', productSlug)
      .maybeSingle();

    if (productRow) {
      const { data: spData } = await supabase
        .from('store_products')
        .select('*, product:products(*)')
        .eq('store_id', storeData.id)
        .eq('product_id', productRow.id)
        .eq('is_active', true)
        .maybeSingle();

      if (spData) {
        setStoreProduct(spData);

        const { data: opts } = await supabase
          .from('product_options')
          .select('*')
          .eq('product_id', productRow.id)
          .eq('is_active', true)
          .order('display_order');

        setOptions(opts || []);

        // Set defaults
        const defaults: Record<string, string> = {};
        opts?.forEach(opt => {
          if (opt.is_default && !defaults[opt.option_type]) {
            defaults[opt.option_type] = opt.id;
          }
        });
        setSelectedOptions(defaults);
      }
    }

    // suppress unused variable warning from first sp query attempt
    void sp;
    setLoading(false);
  };

  const handleAddToCart = async () => {
    if (!storeProduct?.product || !user || !store) return;
    setAdding(true);

    const unitPrice = storeProduct.custom_unit_price ?? 0;
    const totalPrice = unitPrice * quantity;

    await addToCart({
      product_id: storeProduct.product_id,
      quantity,
      width: null,
      height: null,
      selected_options: selectedOptions,
      unit_price: unitPrice,
      total_price: totalPrice,
      production_speed: 'standard',
      store_id: storeProduct.store_id,
    });

    setAdding(false);
    setAdded(true);
    setTimeout(() => setAdded(false), 2500);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-green-600" />
      </div>
    );
  }

  if (!store || !storeProduct || !storeProduct.product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-xl font-bold text-gray-900 mb-2">Product Not Found</h1>
          <Link to={`/store/${slug}`} className="text-green-600 hover:text-green-700">← Back to store</Link>
        </div>
      </div>
    );
  }

  const product = storeProduct.product;
  const brandColor = store.primary_color;
  const displayName = storeProduct.display_name || product.name;
  const displayDesc = storeProduct.display_description || product.description;
  const heroImage = storeProduct.mockup_image_url || product.image_urls?.[0];

  // Group options by type
  const optionsByType = options.reduce<Record<string, ProductOption[]>>((acc, opt) => {
    if (!acc[opt.option_type]) acc[opt.option_type] = [];
    acc[opt.option_type].push(opt);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Store header strip */}
      <div className="py-4 px-4" style={{ backgroundColor: brandColor }}>
        <div className="max-w-6xl mx-auto flex items-center gap-3">
          <Link to={`/store/${slug}`} className="text-white/80 hover:text-white flex items-center gap-1 text-sm">
            <ArrowLeft className="w-4 h-4" />
            {store.logo_url ? (
              <img src={store.logo_url} alt={store.name} className="h-7 object-contain" style={{ filter: 'brightness(0) invert(1)' }} />
            ) : (
              store.name
            )}
          </Link>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* Image */}
          <div className="aspect-square rounded-2xl overflow-hidden bg-gray-100">
            {heroImage ? (
              <img src={heroImage} alt={displayName} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Package className="w-16 h-16 text-gray-300" />
              </div>
            )}
          </div>

          {/* Info */}
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{displayName}</h1>
            {displayDesc && <p className="text-gray-600 mb-6 text-sm leading-relaxed">{displayDesc}</p>}

            {storeProduct.custom_unit_price != null ? (
              <p className="text-3xl font-bold mb-6" style={{ color: brandColor }}>
                ${storeProduct.custom_unit_price.toFixed(2)}
                <span className="text-base font-normal text-gray-500 ml-2">/ item</span>
              </p>
            ) : (
              <p className="text-gray-500 mb-6 text-sm">Contact us for pricing</p>
            )}

            {/* Options */}
            {Object.entries(optionsByType).map(([type, opts]) => (
              <div key={type} className="mb-5">
                <label className="block text-sm font-semibold text-gray-900 mb-2 capitalize">{type}</label>
                <div className="flex flex-wrap gap-2">
                  {opts.map(opt => (
                    <button
                      key={opt.id}
                      onClick={() => setSelectedOptions(prev => ({ ...prev, [type]: opt.id }))}
                      className={`px-4 py-2 rounded-lg border text-sm font-medium transition ${
                        selectedOptions[type] === opt.id
                          ? 'border-2 text-white'
                          : 'border-gray-300 text-gray-700 hover:border-gray-400 bg-white'
                      }`}
                      style={
                        selectedOptions[type] === opt.id
                          ? { backgroundColor: brandColor, borderColor: brandColor }
                          : {}
                      }
                    >
                      {opt.name}
                      {opt.price_modifier > 0 && ` (+$${opt.price_modifier.toFixed(2)})`}
                    </button>
                  ))}
                </div>
              </div>
            ))}

            {/* Quantity */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-900 mb-2">Quantity</label>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  className="w-10 h-10 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 font-bold text-lg"
                >
                  −
                </button>
                <span className="w-12 text-center font-semibold text-lg">{quantity}</span>
                <button
                  onClick={() => setQuantity(q => q + 1)}
                  className="w-10 h-10 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 font-bold text-lg"
                >
                  +
                </button>
              </div>
            </div>

            {storeProduct.custom_unit_price != null && (
              <p className="text-sm text-gray-500 mb-4">
                Total: <strong className="text-gray-900">${(storeProduct.custom_unit_price * quantity).toFixed(2)}</strong>
              </p>
            )}

            {user ? (
              <button
                onClick={handleAddToCart}
                disabled={adding || added}
                className="w-full flex items-center justify-center gap-2 py-4 rounded-xl text-white font-semibold text-lg hover:opacity-90 transition disabled:opacity-50"
                style={{ backgroundColor: brandColor }}
              >
                {adding ? (
                  <><Loader2 className="w-5 h-5 animate-spin" /> Adding…</>
                ) : added ? (
                  <><Check className="w-5 h-5" /> Added to Cart</>
                ) : (
                  <><ShoppingCart className="w-5 h-5" /> Add to Cart</>
                )}
              </button>
            ) : (
              <Link
                to={`/store/${slug}/login`}
                className="w-full flex items-center justify-center gap-2 py-4 rounded-xl text-white font-semibold text-lg hover:opacity-90 transition"
                style={{ backgroundColor: brandColor }}
              >
                Sign in to Order
              </Link>
            )}

            {storeProduct.logo_placement_notes && (
              <p className="mt-4 text-xs text-gray-500 bg-gray-100 rounded-lg px-3 py-2">
                <strong>Logo placement:</strong> {storeProduct.logo_placement_notes}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
