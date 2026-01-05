import { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Order } from '../types';
import { Package, MapPin, User as UserIcon } from 'lucide-react';

export function Account() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadOrders();
    }
  }, [user]);

  const loadOrders = async () => {
    const { data } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', user?.id)
      .order('created_at', { ascending: false })
      .limit(5);

    setOrders(data || []);
    setLoading(false);
  };

  if (!user) {
    return <Navigate to="/login" />;
  }

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">My Account</h1>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Link
            to="/account/orders"
            className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition"
          >
            <Package className="w-10 h-10 text-blue-600 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Orders</h3>
            <p className="text-gray-600 text-sm">View and track your orders</p>
          </Link>

          <Link
            to="/account/addresses"
            className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition"
          >
            <MapPin className="w-10 h-10 text-blue-600 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Addresses</h3>
            <p className="text-gray-600 text-sm">Manage shipping addresses</p>
          </Link>

          <Link
            to="/account/profile"
            className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition"
          >
            <UserIcon className="w-10 h-10 text-blue-600 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Profile</h3>
            <p className="text-gray-600 text-sm">Update your information</p>
          </Link>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Recent Orders</h2>
          {loading ? (
            <p className="text-gray-600">Loading orders...</p>
          ) : orders.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600 mb-4">You haven't placed any orders yet.</p>
              <Link
                to="/"
                className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
              >
                Start Shopping
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div key={order.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <Link
                        to={`/account/orders/${order.id}`}
                        className="text-lg font-semibold text-blue-600 hover:text-blue-700"
                      >
                        Order #{order.order_number}
                      </Link>
                      <p className="text-sm text-gray-600">
                        {new Date(order.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-gray-900">
                        ${order.total_amount.toFixed(2)}
                      </p>
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                          order.status === 'delivered'
                            ? 'bg-green-100 text-green-800'
                            : order.status === 'shipped'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {order.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
