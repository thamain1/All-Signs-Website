import { Link } from 'react-router-dom';
import { Truck, Shield, Clock, Headphones, Award, Zap } from 'lucide-react';

export function Home() {
  return (
    <div>
      <section className="bg-gradient-to-br from-blue-50 to-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-5xl font-bold text-gray-900 mb-6">
                Professional Signs & Banners,<br />
                <span className="text-blue-600">Delivered Fast</span>
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                High-quality custom signage for businesses and events. Transparent pricing, fast turnaround, and 100% satisfaction guaranteed.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  to="/products/banners"
                  className="bg-blue-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-blue-700 transition"
                >
                  Shop Products
                </Link>
                <Link
                  to="/custom-quote"
                  className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold border-2 border-blue-600 hover:bg-blue-50 transition"
                >
                  Get Custom Quote
                </Link>
              </div>
              <div className="mt-8 flex flex-wrap gap-6 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-blue-600" />
                  <span>Same-day production available</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-blue-600" />
                  <span>100% satisfaction guarantee</span>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="bg-gradient-to-br from-blue-100 to-blue-50 rounded-2xl p-8 aspect-square flex items-center justify-center">
                <div className="text-center">
                  <div className="text-6xl font-bold text-blue-600 mb-4">50%</div>
                  <div className="text-2xl font-semibold text-gray-900">First Order</div>
                  <div className="text-gray-600 mt-2">Use code: WELCOME50</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 bg-white border-y border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <Truck className="w-10 h-10 text-blue-600 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 mb-1">Fast Shipping</h3>
              <p className="text-sm text-gray-600">Quick turnaround times</p>
            </div>
            <div className="text-center">
              <Shield className="w-10 h-10 text-blue-600 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 mb-1">100% Guaranteed</h3>
              <p className="text-sm text-gray-600">Satisfaction or reprint</p>
            </div>
            <div className="text-center">
              <Award className="w-10 h-10 text-blue-600 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 mb-1">Premium Quality</h3>
              <p className="text-sm text-gray-600">Industry-leading materials</p>
            </div>
            <div className="text-center">
              <Headphones className="w-10 h-10 text-blue-600 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 mb-1">Expert Support</h3>
              <p className="text-sm text-gray-600">Design help available</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Shop by Category</h2>
            <p className="text-xl text-gray-600">Find the perfect signage solution for your needs</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Link
              to="/products/banners"
              className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition"
            >
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 h-48 flex items-center justify-center">
                <span className="text-white text-6xl font-bold">Banners</span>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition">
                  Vinyl Banners
                </h3>
                <p className="text-gray-600 text-sm mb-4">Durable outdoor and indoor banners in any size</p>
                <div className="text-blue-600 font-semibold text-sm">Starting at $29.99</div>
              </div>
            </Link>

            <Link
              to="/products/yard-signs"
              className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition"
            >
              <div className="bg-gradient-to-br from-green-500 to-green-600 h-48 flex items-center justify-center">
                <span className="text-white text-6xl font-bold">Signs</span>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition">
                  Yard Signs
                </h3>
                <p className="text-gray-600 text-sm mb-4">Corrugated plastic signs perfect for lawns and events</p>
                <div className="text-blue-600 font-semibold text-sm">Starting at $9.99</div>
              </div>
            </Link>

            <Link
              to="/products/rigid-signs"
              className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition"
            >
              <div className="bg-gradient-to-br from-orange-500 to-orange-600 h-48 flex items-center justify-center">
                <span className="text-white text-6xl font-bold">Rigid</span>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition">
                  Rigid Signs
                </h3>
                <p className="text-gray-600 text-sm mb-4">PVC, aluminum, acrylic, and foam board options</p>
                <div className="text-blue-600 font-semibold text-sm">Starting at $19.99</div>
              </div>
            </Link>

            <Link
              to="/products/decals-stickers"
              className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition"
            >
              <div className="bg-gradient-to-br from-pink-500 to-pink-600 h-48 flex items-center justify-center">
                <span className="text-white text-6xl font-bold">Decals</span>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition">
                  Decals & Stickers
                </h3>
                <p className="text-gray-600 text-sm mb-4">Custom vinyl decals and sticker sheets</p>
                <div className="text-blue-600 font-semibold text-sm">Starting at $4.99</div>
              </div>
            </Link>

            <Link
              to="/products/vehicle-graphics"
              className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition"
            >
              <div className="bg-gradient-to-br from-red-500 to-red-600 h-48 flex items-center justify-center">
                <span className="text-white text-6xl font-bold">Vehicle</span>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition">
                  Vehicle Graphics
                </h3>
                <p className="text-gray-600 text-sm mb-4">Magnets, decals, and lettering for vehicles</p>
                <div className="text-blue-600 font-semibold text-sm">Starting at $14.99</div>
              </div>
            </Link>

            <Link
              to="/products/flags"
              className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition"
            >
              <div className="bg-gradient-to-br from-cyan-500 to-cyan-600 h-48 flex items-center justify-center">
                <span className="text-white text-6xl font-bold">Flags</span>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition">
                  Flags & Feathers
                </h3>
                <p className="text-gray-600 text-sm mb-4">Feather flags, teardrop flags, and more</p>
                <div className="text-blue-600 font-semibold text-sm">Starting at $39.99</div>
              </div>
            </Link>

            <Link
              to="/products/trade-show"
              className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition"
            >
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 h-48 flex items-center justify-center">
                <span className="text-white text-6xl font-bold">Event</span>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition">
                  Trade Show
                </h3>
                <p className="text-gray-600 text-sm mb-4">Retractable banners, backdrops, table covers</p>
                <div className="text-blue-600 font-semibold text-sm">Starting at $79.99</div>
              </div>
            </Link>

            <Link
              to="/products/accessories"
              className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition"
            >
              <div className="bg-gradient-to-br from-gray-500 to-gray-600 h-48 flex items-center justify-center">
                <span className="text-white text-6xl font-bold">Extras</span>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition">
                  Accessories
                </h3>
                <p className="text-gray-600 text-sm mb-4">Stakes, stands, frames, and mounting hardware</p>
                <div className="text-blue-600 font-semibold text-sm">Starting at $2.99</div>
              </div>
            </Link>
          </div>
        </div>
      </section>

      <section className="py-20 bg-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-blue-500 px-4 py-2 rounded-full mb-6">
                <Zap className="w-5 h-5" />
                <span className="font-semibold">Need It Fast?</span>
              </div>
              <h2 className="text-4xl font-bold mb-6">Rush Production Available</h2>
              <p className="text-xl text-blue-100 mb-8">
                We offer expedited production and shipping options for time-sensitive projects. Same-day and next-day production available on select products.
              </p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">✓</div>
                  <span>Same-day production on many products</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">✓</div>
                  <span>Overnight shipping available nationwide</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">✓</div>
                  <span>Clear delivery date estimator on every product</span>
                </li>
              </ul>
              <Link
                to="/shipping"
                className="inline-block bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold hover:bg-blue-50 transition"
              >
                Learn About Turnaround Times
              </Link>
            </div>
            <div className="bg-white rounded-xl p-8 text-gray-900">
              <h3 className="text-2xl font-bold mb-6">Our Guarantee</h3>
              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold text-lg mb-2 flex items-center gap-2">
                    <Shield className="w-5 h-5 text-blue-600" />
                    100% Satisfaction
                  </h4>
                  <p className="text-gray-600">
                    If you're not completely satisfied with your order, we'll make it right with a free reprint or full refund.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-lg mb-2 flex items-center gap-2">
                    <Award className="w-5 h-5 text-blue-600" />
                    Premium Materials
                  </h4>
                  <p className="text-gray-600">
                    We use only the highest quality materials and state-of-the-art printing technology for vibrant, long-lasting results.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-lg mb-2 flex items-center gap-2">
                    <Headphones className="w-5 h-5 text-blue-600" />
                    Design Support
                  </h4>
                  <p className="text-gray-600">
                    Our design team is here to help. Free design review with every order, plus optional design assistance available.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Ready to Get Started?</h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Choose a product category to see instant pricing and configure your perfect sign or banner. Need help? Our team is here for you.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              to="/products/banners"
              className="bg-blue-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-blue-700 transition"
            >
              Browse Products
            </Link>
            <Link
              to="/custom-quote"
              className="bg-gray-100 text-gray-900 px-8 py-4 rounded-lg font-semibold hover:bg-gray-200 transition"
            >
              Get Custom Quote
            </Link>
            <Link
              to="/contact"
              className="bg-gray-100 text-gray-900 px-8 py-4 rounded-lg font-semibold hover:bg-gray-200 transition"
            >
              Contact Support
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
