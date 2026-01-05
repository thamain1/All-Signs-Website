import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { supabase } from '../lib/supabase';
import { Loader2, CreditCard, Truck } from 'lucide-react';

export function Checkout() {
  const { user } = useAuth();
  const { items, subtotal, clearCart } = useCart();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    fullName: '',
    company: '',
    address1: '',
    address2: '',
    city: '',
    state: '',
    zipCode: '',
    phone: '',
    shippingMethod: 'ground',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const orderNumber = `ORD-${Date.now()}`;
      const shippingCost = formData.shippingMethod === 'overnight' ? 49.99 : formData.shippingMethod === 'express' ? 24.99 : 9.99;
      const taxAmount = subtotal * 0.07;
      const totalAmount = subtotal + shippingCost + taxAmount;

      const productionDays = 3;
      const shippingDays = formData.shippingMethod === 'overnight' ? 1 : formData.shippingMethod === 'express' ? 2 : 5;
      const estimatedProductionDate = new Date(Date.now() + productionDays * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const estimatedDeliveryDate = new Date(Date.now() + (productionDays + shippingDays) * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          order_number: orderNumber,
          user_id: user?.id,
          status: 'pending',
          subtotal,
          shipping_cost: shippingCost,
          tax_amount: taxAmount,
          total_amount: totalAmount,
          shipping_address: formData,
          shipping_method: formData.shippingMethod,
          estimated_production_date: estimatedProductionDate,
          estimated_delivery_date: estimatedDeliveryDate,
        })
        .select()
        .single();

      if (orderError) throw orderError;

      const orderItems = items.map((item) => ({
        order_id: order.id,
        product_id: item.product_id,
        product_name: item.product?.name || 'Product',
        quantity: item.quantity,
        width: item.width,
        height: item.height,
        selected_options: item.selected_options,
        unit_price: item.unit_price,
        total_price: item.total_price,
        production_speed: item.production_speed,
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      await clearCart();
      navigate(`/order-confirmation/${order.id}`);
    } catch (err: any) {
      setError(err.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (items.length === 0) {
    return <Navigate to="/cart" />;
  }

  const shippingCost = formData.shippingMethod === 'overnight' ? 49.99 : formData.shippingMethod === 'express' ? 24.99 : 9.99;
  const taxAmount = subtotal * 0.07;
  const totalAmount = subtotal + shippingCost + taxAmount;

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}

              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <Truck className="w-6 h-6 text-blue-600" />
                  Shipping Information
                </h2>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Company
                    </label>
                    <input
                      type="text"
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Address Line 1 *
                    </label>
                    <input
                      type="text"
                      value={formData.address1}
                      onChange={(e) => setFormData({ ...formData, address1: e.target.value })}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Address Line 2
                    </label>
                    <input
                      type="text"
                      value={formData.address2}
                      onChange={(e) => setFormData({ ...formData, address2: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      City *
                    </label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      State *
                    </label>
                    <input
                      type="text"
                      value={formData.state}
                      onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      ZIP Code *
                    </label>
                    <input
                      type="text"
                      value={formData.zipCode}
                      onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Phone *
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Shipping Method</h2>
                <div className="space-y-3">
                  <label className={`flex items-center justify-between p-4 border-2 rounded-lg cursor-pointer transition ${
                    formData.shippingMethod === 'ground' ? 'border-blue-600 bg-blue-50' : 'border-gray-200'
                  }`}>
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="shipping"
                        checked={formData.shippingMethod === 'ground'}
                        onChange={() => setFormData({ ...formData, shippingMethod: 'ground' })}
                        className="text-blue-600"
                      />
                      <div>
                        <div className="font-medium">Ground Shipping</div>
                        <div className="text-sm text-gray-600">5-7 business days</div>
                      </div>
                    </div>
                    <div className="font-semibold">$9.99</div>
                  </label>

                  <label className={`flex items-center justify-between p-4 border-2 rounded-lg cursor-pointer transition ${
                    formData.shippingMethod === 'express' ? 'border-blue-600 bg-blue-50' : 'border-gray-200'
                  }`}>
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="shipping"
                        checked={formData.shippingMethod === 'express'}
                        onChange={() => setFormData({ ...formData, shippingMethod: 'express' })}
                        className="text-blue-600"
                      />
                      <div>
                        <div className="font-medium">Express Shipping</div>
                        <div className="text-sm text-gray-600">2-3 business days</div>
                      </div>
                    </div>
                    <div className="font-semibold">$24.99</div>
                  </label>

                  <label className={`flex items-center justify-between p-4 border-2 rounded-lg cursor-pointer transition ${
                    formData.shippingMethod === 'overnight' ? 'border-blue-600 bg-blue-50' : 'border-gray-200'
                  }`}>
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="shipping"
                        checked={formData.shippingMethod === 'overnight'}
                        onChange={() => setFormData({ ...formData, shippingMethod: 'overnight' })}
                        className="text-blue-600"
                      />
                      <div>
                        <div className="font-medium">Overnight Shipping</div>
                        <div className="text-sm text-gray-600">Next business day</div>
                      </div>
                    </div>
                    <div className="font-semibold">$49.99</div>
                  </label>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <CreditCard className="w-6 h-6 text-blue-600" />
                  Payment Information
                </h2>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <p className="text-blue-900 text-sm">
                    Payment processing with Stripe will be integrated in the production version.
                    For now, orders are created without payment.
                  </p>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-4 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Placing Order...
                  </>
                ) : (
                  'Place Order'
                )}
              </button>
            </form>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl p-6 shadow-sm sticky top-24">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Order Summary</h2>
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal ({items.length} items)</span>
                  <span className="font-semibold">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-semibold">${shippingCost.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tax (7%)</span>
                  <span className="font-semibold">${taxAmount.toFixed(2)}</span>
                </div>
                <div className="border-t border-gray-200 pt-3">
                  <div className="flex justify-between">
                    <span className="text-lg font-semibold text-gray-900">Total</span>
                    <span className="text-2xl font-bold text-blue-600">${totalAmount.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
