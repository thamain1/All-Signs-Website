import { Link } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { Trash2, ShoppingBag } from 'lucide-react';

export function Cart() {
  const { items, itemCount, subtotal, removeFromCart, updateCartItem } = useCart();

  if (itemCount === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <ShoppingBag className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Your Cart is Empty</h1>
          <p className="text-gray-600 mb-8">Start adding some great signage to your cart!</p>
          <Link
            to="/"
            className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            Browse Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Shopping Cart ({itemCount} items)</h1>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <div key={item.id} className="bg-white rounded-xl p-6 shadow-sm">
                <div className="flex gap-6">
                  <div className="w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    {item.product?.image_urls && item.product.image_urls.length > 0 ? (
                      <img
                        src={item.product.image_urls[0]}
                        alt={item.product.name}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <span className="text-2xl font-bold text-gray-400">📦</span>
                    )}
                  </div>

                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {item.product?.name || 'Product'}
                    </h3>
                    {item.width && item.height && (
                      <p className="text-sm text-gray-600">Size: {item.width}" x {item.height}"</p>
                    )}
                    <p className="text-sm text-gray-600 capitalize">
                      Production: {item.production_speed.replace('_', ' ')}
                    </p>
                    {Object.entries(item.selected_options).length > 0 && (
                      <div className="text-sm text-gray-600 mt-1">
                        Options selected
                      </div>
                    )}
                  </div>

                  <div className="text-right">
                    <div className="text-xl font-bold text-gray-900 mb-4">
                      ${item.total_price.toFixed(2)}
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      <label className="text-sm text-gray-600">Qty:</label>
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => {
                          const newQty = Math.max(1, parseInt(e.target.value) || 1);
                          updateCartItem(item.id, {
                            quantity: newQty,
                            total_price: item.unit_price * newQty,
                          });
                        }}
                        min="1"
                        className="w-16 px-2 py-1 border border-gray-300 rounded text-center"
                      />
                    </div>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-red-600 hover:text-red-700 text-sm flex items-center gap-1"
                    >
                      <Trash2 className="w-4 h-4" />
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl p-6 shadow-sm sticky top-24">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Order Summary</h2>
              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-semibold">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-semibold">Calculated at checkout</span>
                </div>
                <div className="border-t border-gray-200 pt-3">
                  <div className="flex justify-between">
                    <span className="text-lg font-semibold text-gray-900">Total</span>
                    <span className="text-2xl font-bold text-blue-600">${subtotal.toFixed(2)}</span>
                  </div>
                </div>
              </div>
              <Link
                to="/checkout"
                className="block w-full bg-blue-600 text-white text-center py-3 rounded-lg font-semibold hover:bg-blue-700 transition mb-3"
              >
                Proceed to Checkout
              </Link>
              <Link
                to="/"
                className="block w-full text-center text-blue-600 hover:text-blue-700 font-medium"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
