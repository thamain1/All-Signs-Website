import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <h3 className="text-white text-lg font-bold mb-4">All Signs NC</h3>
            <p className="text-sm mb-4">
              Your trusted partner for high-quality signs, banners, and custom printing solutions.
            </p>
            <div className="flex gap-4">
              <a href="#" className="hover:text-white transition"><Facebook className="w-5 h-5" /></a>
              <a href="#" className="hover:text-white transition"><Twitter className="w-5 h-5" /></a>
              <a href="#" className="hover:text-white transition"><Instagram className="w-5 h-5" /></a>
              <a href="#" className="hover:text-white transition"><Linkedin className="w-5 h-5" /></a>
            </div>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Products</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/products/banners" className="hover:text-white transition">Banners</Link></li>
              <li><Link to="/products/yard-signs" className="hover:text-white transition">Yard Signs</Link></li>
              <li><Link to="/products/rigid-signs" className="hover:text-white transition">Rigid Signs</Link></li>
              <li><Link to="/products/decals-stickers" className="hover:text-white transition">Decals & Stickers</Link></li>
              <li><Link to="/products/vehicle-graphics" className="hover:text-white transition">Vehicle Graphics</Link></li>
              <li><Link to="/products/flags" className="hover:text-white transition">Flags</Link></li>
              <li><Link to="/products/trade-show" className="hover:text-white transition">Trade Show</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Support</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/contact" className="hover:text-white transition">Contact Us</Link></li>
              <li><Link to="/track" className="hover:text-white transition">Track Order</Link></li>
              <li><Link to="/shipping" className="hover:text-white transition">Shipping & Turnaround</Link></li>
              <li><Link to="/returns" className="hover:text-white transition">Returns & Reprints</Link></li>
              <li><Link to="/file-setup" className="hover:text-white transition">File Setup Guidelines</Link></li>
              <li><Link to="/guarantee" className="hover:text-white transition">Satisfaction Guarantee</Link></li>
              <li><Link to="/resources" className="hover:text-white transition">Resources</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Contact</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2">
                <Phone className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <div>
                  <div>1-800-ALL-SIGN</div>
                  <div className="text-xs text-gray-400">Mon-Fri 8AM-6PM EST</div>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <Mail className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <a href="mailto:support@allsignsnc.com" className="hover:text-white transition">
                  support@allsignsnc.com
                </a>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <div>
                  123 Print Way<br />
                  Charlotte, NC 28202
                </div>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center text-sm">
          <p>&copy; {new Date().getFullYear()} All Signs NC. All rights reserved.</p>
          <div className="flex gap-6 mt-4 md:mt-0">
            <Link to="/privacy" className="hover:text-white transition">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-white transition">Terms of Service</Link>
            <Link to="/about" className="hover:text-white transition">About Us</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
