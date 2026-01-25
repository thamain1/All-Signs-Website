import { Link, useLocation } from 'react-router-dom';
import { ShoppingCart, User, Search, Menu, Phone, X, ChevronDown } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProductsOpen, setIsProductsOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [mobileProductsOpen, setMobileProductsOpen] = useState(false);
  const accountTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { user, signOut, isAdmin } = useAuth();
  const { itemCount } = useCart();
  const location = useLocation();

  useEffect(() => {
    setIsMenuOpen(false);
    setMobileProductsOpen(false);
  }, [location]);

  useEffect(() => {
    return () => {
      if (accountTimeoutRef.current) {
        clearTimeout(accountTimeoutRef.current);
      }
    };
  }, []);

  const closeMobileMenu = () => {
    setIsMenuOpen(false);
    setMobileProductsOpen(false);
  };

  const handleAccountEnter = () => {
    if (accountTimeoutRef.current) {
      clearTimeout(accountTimeoutRef.current);
      accountTimeoutRef.current = null;
    }
    setIsAccountOpen(true);
  };

  const handleAccountLeave = () => {
    accountTimeoutRef.current = setTimeout(() => {
      setIsAccountOpen(false);
    }, 150);
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="bg-green-600 text-white py-2">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center text-sm">
          <div className="flex items-center gap-2">
            <Phone className="w-4 h-4" />
            <span>1-800-ALL-SIGN</span>
          </div>
          <div className="hidden sm:flex items-center gap-4">
            <span>Fast Turnaround</span>
            <span>•</span>
            <span>100% Satisfaction Guarantee</span>
            <span>•</span>
            <span>Free Design Review</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center">
              <img
                src="/images/allsignslogo.jpg"
                alt="All Signs - Signs, Printing & More"
                className="h-12 w-auto"
              />
            </Link>

            <nav className="hidden lg:flex items-center gap-6">
              <div className="relative">
                <button
                  className="flex items-center gap-1 text-gray-700 hover:text-green-600 font-medium"
                  onMouseEnter={() => setIsProductsOpen(true)}
                  onMouseLeave={() => setIsProductsOpen(false)}
                >
                  Products
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {isProductsOpen && (
                  <div
                    className="absolute top-full left-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg py-2"
                    onMouseEnter={() => setIsProductsOpen(true)}
                    onMouseLeave={() => setIsProductsOpen(false)}
                  >
                    <Link to="/products/banners" className="block px-4 py-2 hover:bg-gray-50">Banners</Link>
                    <Link to="/products/yard-signs" className="block px-4 py-2 hover:bg-gray-50">Yard Signs</Link>
                    <Link to="/products/rigid-signs" className="block px-4 py-2 hover:bg-gray-50">Rigid Signs</Link>
                    <Link to="/products/decals-stickers" className="block px-4 py-2 hover:bg-gray-50">Decals & Stickers</Link>
                    <Link to="/products/vehicle-graphics" className="block px-4 py-2 hover:bg-gray-50">Vehicle Graphics</Link>
                    <Link to="/products/flags" className="block px-4 py-2 hover:bg-gray-50">Flags</Link>
                    <Link to="/products/trade-show" className="block px-4 py-2 hover:bg-gray-50">Trade Show & Events</Link>
                    <Link to="/products/accessories" className="block px-4 py-2 hover:bg-gray-50">Accessories & Hardware</Link>
                  </div>
                )}
              </div>

              <Link to="/templates" className="text-gray-700 hover:text-green-600 font-medium">DIY Tool</Link>
              <Link to="/custom-quote" className="text-gray-700 hover:text-green-600 font-medium">Custom Quote</Link>
              <Link to="/deals" className="text-gray-700 hover:text-green-600 font-medium">Deals</Link>
              <Link to="/resources" className="text-gray-700 hover:text-green-600 font-medium">Resources</Link>
              <Link to="/track" className="text-gray-700 hover:text-green-600 font-medium">Track Order</Link>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <button className="hidden md:flex items-center gap-2 text-gray-700 hover:text-green-600">
              <Search className="w-5 h-5" />
            </button>

            {user ? (
              <div className="relative">
                <button
                  className="flex items-center gap-2 text-gray-700 hover:text-green-600"
                  onMouseEnter={handleAccountEnter}
                  onMouseLeave={handleAccountLeave}
                >
                  <User className="w-5 h-5" />
                </button>
                {isAccountOpen && (
                  <div
                    className="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg py-2"
                    onMouseEnter={handleAccountEnter}
                    onMouseLeave={handleAccountLeave}
                  >
                    <Link to="/account" className="block px-4 py-2 hover:bg-gray-50">My Account</Link>
                    <Link to="/account/orders" className="block px-4 py-2 hover:bg-gray-50">Orders</Link>
                    <Link to="/account/addresses" className="block px-4 py-2 hover:bg-gray-50">Addresses</Link>
                    {isAdmin && (
                      <>
                        <div className="border-t border-gray-200 my-2"></div>
                        <Link to="/admin" className="block px-4 py-2 hover:bg-gray-50 text-green-600 font-medium">Admin Dashboard</Link>
                        <Link to="/admin/media" className="block px-4 py-2 hover:bg-gray-50 text-green-600">Media Library</Link>
                        <Link to="/admin/content" className="block px-4 py-2 hover:bg-gray-50 text-green-600">Content Slots</Link>
                      </>
                    )}
                    <div className="border-t border-gray-200 my-2"></div>
                    <button onClick={signOut} className="block w-full text-left px-4 py-2 hover:bg-gray-50">Sign Out</button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login" className="flex items-center gap-2 text-gray-700 hover:text-green-600">
                <User className="w-5 h-5" />
              </Link>
            )}

            <Link to="/cart" className="relative flex items-center gap-2 text-gray-700 hover:text-green-600">
              <ShoppingCart className="w-5 h-5" />
              {itemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-green-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </Link>

            <button
              className="lg:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>

        {isMenuOpen && (
          <>
            <div
              className="fixed inset-0 bg-black bg-opacity-50 lg:hidden z-40"
              onClick={closeMobileMenu}
            />
            <nav className="fixed top-0 right-0 bottom-0 w-80 bg-white shadow-2xl lg:hidden z-50 overflow-y-auto">
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <span className="text-lg font-bold text-gray-900">Menu</span>
                <button onClick={closeMobileMenu} className="p-2 hover:bg-gray-100 rounded-lg">
                  <X className="w-6 h-6 text-gray-600" />
                </button>
              </div>

              <div className="py-2">
                <div className="px-4 py-2">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Products</h3>
                </div>
                <button
                  onClick={() => setMobileProductsOpen(!mobileProductsOpen)}
                  className="w-full flex items-center justify-between px-4 py-3 text-gray-900 hover:bg-gray-50 font-medium"
                >
                  <span>Browse Products</span>
                  <ChevronDown className={`w-5 h-5 transition-transform ${mobileProductsOpen ? 'rotate-180' : ''}`} />
                </button>
                {mobileProductsOpen && (
                  <div className="bg-gray-50 py-2">
                    <Link to="/products/banners" onClick={closeMobileMenu} className="block px-8 py-2.5 text-gray-700 hover:text-green-600">Banners</Link>
                    <Link to="/products/yard-signs" onClick={closeMobileMenu} className="block px-8 py-2.5 text-gray-700 hover:text-green-600">Yard Signs</Link>
                    <Link to="/products/rigid-signs" onClick={closeMobileMenu} className="block px-8 py-2.5 text-gray-700 hover:text-green-600">Rigid Signs</Link>
                    <Link to="/products/decals-stickers" onClick={closeMobileMenu} className="block px-8 py-2.5 text-gray-700 hover:text-green-600">Decals & Stickers</Link>
                    <Link to="/products/vehicle-graphics" onClick={closeMobileMenu} className="block px-8 py-2.5 text-gray-700 hover:text-green-600">Vehicle Graphics</Link>
                    <Link to="/products/flags" onClick={closeMobileMenu} className="block px-8 py-2.5 text-gray-700 hover:text-green-600">Flags</Link>
                    <Link to="/products/trade-show" onClick={closeMobileMenu} className="block px-8 py-2.5 text-gray-700 hover:text-green-600">Trade Show & Events</Link>
                    <Link to="/products/accessories" onClick={closeMobileMenu} className="block px-8 py-2.5 text-gray-700 hover:text-green-600">Accessories</Link>
                  </div>
                )}

                <div className="border-t border-gray-200 mt-2 pt-2">
                  <div className="px-4 py-2">
                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Services</h3>
                  </div>
                  <Link to="/templates" onClick={closeMobileMenu} className="block px-4 py-3 text-gray-900 hover:bg-gray-50 font-medium">DIY Tool</Link>
                  <Link to="/custom-quote" onClick={closeMobileMenu} className="block px-4 py-3 text-gray-900 hover:bg-gray-50 font-medium">Custom Quote</Link>
                </div>

                <div className="border-t border-gray-200 mt-2 pt-2">
                  <div className="px-4 py-2">
                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Explore</h3>
                  </div>
                  <Link to="/deals" onClick={closeMobileMenu} className="block px-4 py-3 text-gray-900 hover:bg-gray-50">Deals</Link>
                  <Link to="/resources" onClick={closeMobileMenu} className="block px-4 py-3 text-gray-900 hover:bg-gray-50">Resources</Link>
                </div>

                <div className="border-t border-gray-200 mt-2 pt-2">
                  <div className="px-4 py-2">
                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Support</h3>
                  </div>
                  <Link to="/track" onClick={closeMobileMenu} className="block px-4 py-3 text-gray-900 hover:bg-gray-50">Track Order</Link>
                  <Link to="/contact" onClick={closeMobileMenu} className="block px-4 py-3 text-gray-900 hover:bg-gray-50">Contact & Help</Link>
                </div>

                {user && (
                  <>
                    <div className="border-t border-gray-200 mt-2 pt-2">
                      <div className="px-4 py-2">
                        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Account</h3>
                      </div>
                      <Link to="/account" onClick={closeMobileMenu} className="block px-4 py-3 text-gray-900 hover:bg-gray-50">My Account</Link>
                      <Link to="/account/orders" onClick={closeMobileMenu} className="block px-4 py-3 text-gray-900 hover:bg-gray-50">Orders</Link>
                      <Link to="/account/designs" onClick={closeMobileMenu} className="block px-4 py-3 text-gray-900 hover:bg-gray-50">My Designs</Link>
                    </div>
                    {isAdmin && (
                      <div className="border-t border-gray-200 mt-2 pt-2">
                        <div className="px-4 py-2">
                          <h3 className="text-xs font-semibold text-green-600 uppercase tracking-wider">Admin</h3>
                        </div>
                        <Link to="/admin" onClick={closeMobileMenu} className="block px-4 py-3 text-green-600 hover:bg-gray-50 font-medium">Admin Dashboard</Link>
                        <Link to="/admin/media" onClick={closeMobileMenu} className="block px-4 py-3 text-green-600 hover:bg-gray-50">Media Library</Link>
                        <Link to="/admin/content" onClick={closeMobileMenu} className="block px-4 py-3 text-green-600 hover:bg-gray-50">Content Slots</Link>
                      </div>
                    )}
                    <div className="border-t border-gray-200 mt-2 pt-2">
                      <button onClick={() => { signOut(); closeMobileMenu(); }} className="block w-full text-left px-4 py-3 text-red-600 hover:bg-gray-50">Sign Out</button>
                    </div>
                  </>
                )}
              </div>
            </nav>
          </>
        )}
      </div>
    </header>
  );
}
