import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useCart } from '../contexts/CartContext';
import { Product, ProductOption, PricingRule } from '../types';
import { Loader2, ShoppingCart, Check, Info } from 'lucide-react';
import SizeSelector from '../components/SizeSelector';

export function ProductDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { addToCart } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [options, setOptions] = useState<ProductOption[]>([]);
  const [pricingRules, setPricingRules] = useState<PricingRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);

  const [quantity, setQuantity] = useState(1);
  const [width, setWidth] = useState('24');
  const [height, setHeight] = useState('18');
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  const [productionSpeed, setProductionSpeed] = useState('standard');

  useEffect(() => {
    loadProduct();
  }, [slug]);

  const loadProduct = async () => {
    setLoading(true);

    const { data: productData } = await supabase
      .from('products')
      .select('*')
      .eq('slug', slug)
      .eq('is_active', true)
      .maybeSingle();

    if (productData) {
      setProduct(productData);

      const { data: optionsData } = await supabase
        .from('product_options')
        .select('*')
        .eq('product_id', productData.id)
        .eq('is_active', true)
        .order('display_order');

      setOptions(optionsData || []);

      const defaults: Record<string, string> = {};
      optionsData?.forEach((opt) => {
        if (opt.is_default && !defaults[opt.option_type]) {
          defaults[opt.option_type] = opt.id;
        }
      });
      setSelectedOptions(defaults);

      const { data: pricingData } = await supabase
        .from('pricing_rules')
        .select('*')
        .eq('product_id', productData.id)
        .eq('is_active', true)
        .order('min_quantity');

      setPricingRules(pricingData || []);
    }

    setLoading(false);
  };

  const calculatePrice = () => {
    if (!product || pricingRules.length === 0) return 0;

    const applicableRule = pricingRules
      .filter(rule => quantity >= rule.min_quantity && (!rule.max_quantity || quantity <= rule.max_quantity))
      .sort((a, b) => b.min_quantity - a.min_quantity)[0];

    if (!applicableRule) return 0;

    let price = applicableRule.base_price;

    if (applicableRule.price_per_sqft > 0 && product.allows_custom_size) {
      const sqft = (parseFloat(width) * parseFloat(height)) / 144;
      price = applicableRule.price_per_sqft * sqft;
    }

    options.forEach((opt) => {
      if (selectedOptions[opt.option_type] === opt.id) {
        price += opt.price_modifier;
      }
    });

    if (productionSpeed === 'rush') {
      price *= 1.5;
    } else if (productionSpeed === 'same_day') {
      price *= 2;
    }

    const discount = 1 - (applicableRule.discount_percent / 100);
    return price * discount;
  };

  const handleAddToCart = async () => {
    if (!product) return;

    setAdding(true);
    const unitPrice = calculatePrice();

    await addToCart({
      product_id: product.id,
      quantity,
      width: product.allows_custom_size ? parseFloat(width) : null,
      height: product.allows_custom_size ? parseFloat(height) : null,
      selected_options: selectedOptions,
      unit_price: unitPrice,
      total_price: unitPrice * quantity,
      production_speed: productionSpeed,
    });

    setAdding(false);
  };

  const groupedOptions = options.reduce((acc, opt) => {
    if (!acc[opt.option_type]) acc[opt.option_type] = [];
    acc[opt.option_type].push(opt);
    return acc;
  }, {} as Record<string, ProductOption[]>);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-green-600" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Product Not Found</h1>
        <Link to="/" className="text-green-600 hover:underline">Return to Home</Link>
      </div>
    );
  }

  const unitPrice = calculatePrice();
  const totalPrice = unitPrice * quantity;

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-2 gap-12">
          <div>
            <div className="bg-white rounded-xl p-8 shadow-sm">
              <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg h-96 flex items-center justify-center mb-6">
                {product.image_urls && product.image_urls.length > 0 ? (
                  <img
                    src={product.image_urls[0]}
                    alt={product.name}
                    className="w-full h-full object-cover rounded-lg"
                  />
                ) : (
                  <span className="text-6xl font-bold text-gray-400">{product.name}</span>
                )}
              </div>
              {product.description && (
                <div className="prose max-w-none">
                  <h3 className="text-lg font-semibold mb-2">Product Details</h3>
                  <p className="text-gray-600">{product.description}</p>
                </div>
              )}
            </div>

            <div className="mt-6 bg-green-50 border border-green-200 rounded-xl p-6">
              <h3 className="font-semibold text-green-900 mb-3 flex items-center gap-2">
                <Check className="w-5 h-5" />
                Our Guarantee
              </h3>
              <ul className="space-y-2 text-sm text-green-800">
                <li>100% Satisfaction Guarantee</li>
                <li>Free Design Review</li>
                <li>Premium Quality Materials</li>
                <li>Fast Production Turnaround</li>
              </ul>
            </div>
          </div>

          <div>
            <div className="bg-white rounded-xl p-8 shadow-sm">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
              {product.short_description && (
                <p className="text-gray-600 mb-6">{product.short_description}</p>
              )}

              <div className="space-y-6">
                {product.size_preset_category ? (
                  <SizeSelector
                    categorySlug={product.size_preset_category}
                    selectedWidth={parseFloat(width)}
                    selectedHeight={parseFloat(height)}
                    onSizeChange={(w, h) => {
                      setWidth(w.toString());
                      setHeight(h.toString());
                    }}
                    allowCustomSize={product.allows_custom_size}
                    showLegibilityGuide={true}
                  />
                ) : product.allows_custom_size ? (
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Size (Width x Height in inches)
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <input
                          type="number"
                          value={width}
                          onChange={(e) => setWidth(e.target.value)}
                          min={product.min_width || 1}
                          max={product.max_width || 1000}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent"
                          placeholder="Width"
                        />
                      </div>
                      <div>
                        <input
                          type="number"
                          value={height}
                          onChange={(e) => setHeight(e.target.value)}
                          min={product.min_height || 1}
                          max={product.max_height || 1000}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent"
                          placeholder="Height"
                        />
                      </div>
                    </div>
                  </div>
                ) : null}

                {Object.entries(groupedOptions).map(([type, opts]) => (
                  <div key={type}>
                    <label className="block text-sm font-semibold text-gray-900 mb-2 capitalize">
                      {type.replace('_', ' ')}
                    </label>
                    <div className="space-y-2">
                      {opts.map((opt) => (
                        <label
                          key={opt.id}
                          className={`flex items-center justify-between p-4 border-2 rounded-lg cursor-pointer transition ${
                            selectedOptions[type] === opt.id
                              ? 'border-green-600 bg-green-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <input
                              type="radio"
                              name={type}
                              checked={selectedOptions[type] === opt.id}
                              onChange={() => setSelectedOptions({ ...selectedOptions, [type]: opt.id })}
                              className="text-green-600"
                            />
                            <div>
                              <div className="font-medium text-gray-900">{opt.value}</div>
                              {opt.description && (
                                <div className="text-sm text-gray-600">{opt.description}</div>
                              )}
                            </div>
                          </div>
                          {opt.price_modifier !== 0 && (
                            <div className="text-sm font-medium text-gray-900">
                              {opt.price_modifier > 0 ? '+' : ''}${opt.price_modifier.toFixed(2)}
                            </div>
                          )}
                        </label>
                      ))}
                    </div>
                  </div>
                ))}

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Production Speed
                  </label>
                  <div className="space-y-2">
                    <label className={`flex items-center justify-between p-4 border-2 rounded-lg cursor-pointer transition ${
                      productionSpeed === 'standard' ? 'border-green-600 bg-green-50' : 'border-gray-200'
                    }`}>
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          checked={productionSpeed === 'standard'}
                          onChange={() => setProductionSpeed('standard')}
                          className="text-green-600"
                        />
                        <div>
                          <div className="font-medium">Standard</div>
                          <div className="text-sm text-gray-600">{product.production_days_min}-{product.production_days_max} business days</div>
                        </div>
                      </div>
                    </label>
                    <label className={`flex items-center justify-between p-4 border-2 rounded-lg cursor-pointer transition ${
                      productionSpeed === 'rush' ? 'border-green-600 bg-green-50' : 'border-gray-200'
                    }`}>
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          checked={productionSpeed === 'rush'}
                          onChange={() => setProductionSpeed('rush')}
                          className="text-green-600"
                        />
                        <div>
                          <div className="font-medium">Rush</div>
                          <div className="text-sm text-gray-600">1-2 business days</div>
                        </div>
                      </div>
                      <div className="text-sm font-medium text-gray-900">+50%</div>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Quantity
                  </label>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    min="1"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent"
                  />
                  {pricingRules.length > 0 && (
                    <div className="mt-2 text-sm text-gray-600">
                      <Info className="w-4 h-4 inline mr-1" />
                      Bulk discounts available
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-8 pt-8 border-t border-gray-200">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-gray-600">Unit Price:</span>
                  <span className="text-2xl font-bold text-gray-900">${unitPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center mb-6">
                  <span className="text-gray-900 font-semibold">Total:</span>
                  <span className="text-3xl font-bold text-green-600">${totalPrice.toFixed(2)}</span>
                </div>
                <button
                  onClick={handleAddToCart}
                  disabled={adding}
                  className="w-full bg-green-600 text-white py-4 rounded-lg font-semibold hover:bg-green-700 transition flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {adding ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="w-5 h-5" />
                      Add to Cart
                    </>
                  )}
                </button>
                <p className="text-sm text-gray-600 text-center mt-4">
                  Need design help? We offer free design review with every order.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
