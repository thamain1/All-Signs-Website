import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Product, Category } from '../types';
import { Loader2 } from 'lucide-react';

export function ProductCategory() {
  const { slug } = useParams<{ slug: string }>();
  const [category, setCategory] = useState<Category | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCategoryAndProducts();
  }, [slug]);

  const loadCategoryAndProducts = async () => {
    setLoading(true);

    const { data: categoryData } = await supabase
      .from('product_categories')
      .select('*')
      .eq('slug', slug)
      .maybeSingle();

    if (categoryData) {
      setCategory(categoryData);

      const { data: productsData } = await supabase
        .from('products')
        .select('*')
        .eq('category_id', categoryData.id)
        .eq('is_active', true)
        .order('name');

      setProducts(productsData || []);
    }

    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-green-600" />
      </div>
    );
  }

  if (!category) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Category Not Found</h1>
        <Link to="/" className="text-green-600 hover:underline">Return to Home</Link>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      {category.image_url && (
        <div className="relative h-80 bg-gray-900">
          <img
            src={category.image_url}
            alt={category.name}
            className="w-full h-full object-cover opacity-70"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 to-transparent" />
          <div className="absolute inset-0 flex items-center">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
              <h1 className="text-5xl font-bold text-white mb-4">{category.name}</h1>
              {category.description && (
                <p className="text-xl text-gray-100 max-w-3xl">{category.description}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {!category.image_url && (
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">{category.name}</h1>
            {category.description && (
              <p className="text-xl text-gray-600 max-w-3xl">{category.description}</p>
            )}
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {products.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 mb-4">No products available in this category yet.</p>
            <Link to="/custom-quote" className="text-green-600 hover:underline">
              Request a custom quote instead
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.map((product) => (
              <Link
                key={product.id}
                to={`/product/${product.slug}`}
                className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition group"
              >
                <div className="bg-gradient-to-br from-gray-100 to-gray-200 h-64 flex items-center justify-center">
                  {product.image_urls && product.image_urls.length > 0 ? (
                    <img
                      src={product.image_urls[0]}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-4xl font-bold text-gray-400">{product.name}</span>
                  )}
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-green-600 transition">
                    {product.name}
                  </h3>
                  {product.short_description && (
                    <p className="text-gray-600 text-sm mb-4">{product.short_description}</p>
                  )}
                  <div className="flex justify-between items-center">
                    <span className="text-green-600 font-semibold">Configure & Price</span>
                    <span className="text-sm text-gray-500">
                      {product.production_days_min}-{product.production_days_max} day turnaround
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
