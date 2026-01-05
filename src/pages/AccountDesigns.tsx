import { useEffect, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { Design } from '../types';
import { Loader2, Edit, Copy, Trash2, ShoppingCart, Plus } from 'lucide-react';

export function AccountDesigns() {
  const { user } = useAuth();
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const [designs, setDesigns] = useState<Design[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadDesigns();
    }
  }, [user]);

  const loadDesigns = async () => {
    const { data } = await supabase
      .from('designs')
      .select('*')
      .eq('user_id', user?.id)
      .order('updated_at', { ascending: false });

    setDesigns(data || []);
    setLoading(false);
  };

  const duplicateDesign = async (design: Design) => {
    const { data, error } = await supabase
      .from('designs')
      .insert({
        user_id: user?.id,
        name: `${design.name} (Copy)`,
        product_id: design.product_id,
        product_type: design.product_type,
        variant_snapshot: design.variant_snapshot,
        width_in: design.width_in,
        height_in: design.height_in,
        bleed_in: design.bleed_in,
        safe_zone_in: design.safe_zone_in,
        editor_json: design.editor_json,
        status: 'draft',
      })
      .select()
      .single();

    if (!error && data) {
      navigate(`/designs/${data.id}/edit`);
    }
  };

  const deleteDesign = async (id: string) => {
    if (!confirm('Are you sure you want to delete this design?')) return;

    const { error } = await supabase.from('designs').delete().eq('id', id);

    if (!error) {
      setDesigns(designs.filter((d) => d.id !== id));
    }
  };

  const reorderDesign = async (design: Design) => {
    if (!design.product_id) {
      alert('This design is not linked to a product');
      return;
    }

    const variantSnapshot = design.variant_snapshot || {};

    await addToCart({
      product_id: design.product_id,
      quantity: variantSnapshot.quantity || 1,
      width: design.width_in,
      height: design.height_in,
      selected_options: variantSnapshot.selected_options || {},
      unit_price: variantSnapshot.unit_price || 50,
      total_price: (variantSnapshot.unit_price || 50) * (variantSnapshot.quantity || 1),
      production_speed: variantSnapshot.production_speed || 'standard',
    });

    navigate('/cart');
  };

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">My Designs</h1>
            <p className="text-gray-600">Manage your saved designs</p>
          </div>
          <Link
            to="/templates"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            New Design
          </Link>
        </div>

        {designs.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl">
            <p className="text-gray-600 mb-4">You haven't created any designs yet.</p>
            <Link
              to="/templates"
              className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700"
            >
              Create Your First Design
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {designs.map((design) => (
              <div key={design.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="bg-gradient-to-br from-gray-100 to-gray-200 h-48 flex items-center justify-center">
                  {design.preview_png_url ? (
                    <img
                      src={design.preview_png_url}
                      alt={design.name}
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <span className="text-4xl font-bold text-gray-400">Preview</span>
                  )}
                </div>

                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-1">{design.name}</h3>
                  <p className="text-sm text-gray-600 mb-3">
                    {design.width_in}" × {design.height_in}" • {design.product_type}
                  </p>
                  <p className="text-xs text-gray-500 mb-4">
                    Updated {new Date(design.updated_at).toLocaleDateString()}
                  </p>

                  <div className="flex gap-2">
                    <Link
                      to={`/designs/${design.id}/edit`}
                      className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm flex items-center justify-center gap-1"
                    >
                      <Edit className="w-4 h-4" />
                      Edit
                    </Link>
                    <button
                      onClick={() => duplicateDesign(design)}
                      className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                      title="Duplicate"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => reorderDesign(design)}
                      className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                      title="Reorder"
                    >
                      <ShoppingCart className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteDesign(design.id)}
                      className="px-3 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
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
