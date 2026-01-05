import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Order } from '../types';
import { CheckCircle, Loader2 } from 'lucide-react';

export function OrderConfirmation() {
  const { orderId } = useParams<{ orderId: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrder();
  }, [orderId]);

  const loadOrder = async () => {
    const { data } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .maybeSingle();

    setOrder(data);
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Order Not Found</h1>
        <Link to="/" className="text-blue-600 hover:underline">Return to Home</Link>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl p-8 shadow-sm text-center">
          <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Confirmed!</h1>
          <p className="text-gray-600 mb-8">
            Thank you for your order. We'll send you an email confirmation shortly.
          </p>

          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8">
            <div className="grid md:grid-cols-2 gap-4 text-left">
              <div>
                <div className="text-sm text-gray-600 mb-1">Order Number</div>
                <div className="font-bold text-lg">{order.order_number}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600 mb-1">Total Amount</div>
                <div className="font-bold text-lg text-blue-600">${order.total_amount.toFixed(2)}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600 mb-1">Estimated Production Complete</div>
                <div className="font-semibold">{order.estimated_production_date}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600 mb-1">Estimated Delivery</div>
                <div className="font-semibold">{order.estimated_delivery_date}</div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900 mb-4">What's Next?</h2>
            <div className="text-left space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center flex-shrink-0 text-sm font-semibold">1</div>
                <div>
                  <div className="font-semibold">Upload Your Artwork</div>
                  <div className="text-sm text-gray-600">
                    Upload your print-ready files or request design help in your account dashboard
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center flex-shrink-0 text-sm font-semibold">2</div>
                <div>
                  <div className="font-semibold">Design Review</div>
                  <div className="text-sm text-gray-600">
                    Our team will review your artwork and reach out if any adjustments are needed
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center flex-shrink-0 text-sm font-semibold">3</div>
                <div>
                  <div className="font-semibold">Production & Shipping</div>
                  <div className="text-sm text-gray-600">
                    Once approved, we'll print and ship your order with tracking information
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap gap-4 justify-center">
            <Link
              to="/account/orders"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
            >
              View Order Details
            </Link>
            <Link
              to="/"
              className="bg-gray-100 text-gray-900 px-6 py-3 rounded-lg font-semibold hover:bg-gray-200 transition"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
