import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { Layout } from './components/Layout/Layout';
import { Loader2 } from 'lucide-react';

// Eagerly loaded — small, hit on every visit
import { Home } from './pages/Home';
import { ProductCategory } from './pages/ProductCategory';
import { ProductDetail } from './pages/ProductDetail';
import { Cart } from './pages/Cart';
import { Checkout } from './pages/Checkout';
import { OrderConfirmation } from './pages/OrderConfirmation';
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import { Account } from './pages/Account';
import { Resources } from './pages/Resources';
import { Contact } from './pages/Contact';
import { CustomQuote } from './pages/CustomQuote';
import AdminGuard from './components/AdminGuard';
import MyStores from './pages/account/MyStores';
import MyStoreOrders from './pages/account/MyStoreOrders';
import StoreFront from './pages/store/StoreFront';
import StoreLogin from './pages/store/StoreLogin';
import StoreJoin from './pages/store/StoreJoin';
import StoreProductDetail from './pages/store/StoreProductDetail';

// Lazily loaded — contain Fabric.js / pdf-lib / heavy admin code
const DesignEditor = lazy(() => import('./pages/DesignEditor').then(m => ({ default: m.DesignEditor })));
const TemplateLibrary = lazy(() => import('./pages/TemplateLibrary').then(m => ({ default: m.TemplateLibrary })));
const AccountDesigns = lazy(() => import('./pages/AccountDesigns').then(m => ({ default: m.AccountDesigns })));
const ProofView = lazy(() => import('./pages/ProofView').then(m => ({ default: m.ProofView })));
const AdminDashboard = lazy(() => import('./pages/admin/Dashboard'));
const MediaLibrary = lazy(() => import('./pages/admin/MediaLibrary'));
const ContentSlots = lazy(() => import('./pages/admin/ContentSlots'));
const ProductsAdmin = lazy(() => import('./pages/admin/Products'));
const AdminStores = lazy(() => import('./pages/admin/Stores'));
const StoreDetail = lazy(() => import('./pages/admin/StoreDetail'));

function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-green-600" />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>
          <Layout>
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/" element={<Home />} />

                <Route path="/products/:slug" element={<ProductCategory />} />
                <Route path="/product/:slug" element={<ProductDetail />} />

                <Route path="/cart" element={<Cart />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/order-confirmation/:orderId" element={<OrderConfirmation />} />

                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/account" element={<Account />} />
                <Route path="/account/orders" element={<Account />} />
                <Route path="/account/addresses" element={<Account />} />
                <Route path="/account/profile" element={<Account />} />
                <Route path="/account/stores" element={<MyStores />} />
                <Route path="/account/stores/:slug" element={<MyStoreOrders />} />

                <Route path="/custom-quote" element={<CustomQuote />} />
                <Route path="/resources" element={<Resources />} />
                <Route path="/contact" element={<Contact />} />

                <Route path="/templates" element={<TemplateLibrary />} />
                <Route path="/designs/:designId/edit" element={<DesignEditor />} />
                <Route path="/account/designs" element={<AccountDesigns />} />
                <Route path="/proof/:token" element={<ProofView />} />

                <Route path="/admin" element={<AdminGuard><AdminDashboard /></AdminGuard>} />
                <Route path="/admin/media" element={<AdminGuard><MediaLibrary /></AdminGuard>} />
                <Route path="/admin/content" element={<AdminGuard><ContentSlots /></AdminGuard>} />
                <Route path="/admin/products" element={<AdminGuard><ProductsAdmin /></AdminGuard>} />
                <Route path="/admin/stores" element={<AdminGuard><AdminStores /></AdminGuard>} />
                <Route path="/admin/stores/:slug" element={<AdminGuard><StoreDetail /></AdminGuard>} />

                <Route path="/store/:slug" element={<StoreFront />} />
                <Route path="/store/:slug/login" element={<StoreLogin />} />
                <Route path="/store/:slug/join" element={<StoreJoin />} />
                <Route path="/store/:slug/products/:productSlug" element={<StoreProductDetail />} />

                <Route path="/deals" element={<Home />} />
                <Route path="/track" element={<Home />} />
                <Route path="/shipping" element={<Resources />} />
                <Route path="/returns" element={<Resources />} />
                <Route path="/guarantee" element={<Resources />} />
                <Route path="/file-setup" element={<Resources />} />
                <Route path="/materials" element={<Resources />} />
                <Route path="/design-tips" element={<Resources />} />
                <Route path="/installation" element={<Resources />} />
                <Route path="/about" element={<Contact />} />
                <Route path="/privacy" element={<Resources />} />
                <Route path="/terms" element={<Resources />} />
              </Routes>
            </Suspense>
          </Layout>
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
