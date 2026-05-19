import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { Layout } from './components/Layout/Layout';
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
import { TemplateLibrary } from './pages/TemplateLibrary';
import { DesignEditor } from './pages/DesignEditor';
import { AccountDesigns } from './pages/AccountDesigns';
import { ProofView } from './pages/ProofView';
import AdminGuard from './components/AdminGuard';
import AdminDashboard from './pages/admin/Dashboard';
import MediaLibrary from './pages/admin/MediaLibrary';
import ContentSlots from './pages/admin/ContentSlots';
import ProductsAdmin from './pages/admin/Products';
import AdminStores from './pages/admin/Stores';
import StoreDetail from './pages/admin/StoreDetail';

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>
          <Layout>
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
          </Layout>
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
