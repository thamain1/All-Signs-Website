import { Link } from 'react-router-dom';
import { FileText, Image, Ruler, Package } from 'lucide-react';

export function Resources() {
  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Resources & Guides</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Everything you need to know about creating, ordering, and installing your signs
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <FileText className="w-10 h-10 text-green-600 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">File Setup Guide</h3>
            <p className="text-gray-600 text-sm mb-4">
              Learn about resolution, bleed, safe areas, and color modes for print-ready files.
            </p>
            <Link to="/file-setup" className="text-green-600 hover:text-green-700 font-semibold text-sm">
              Read More →
            </Link>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm">
            <Image className="w-10 h-10 text-green-600 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Material Guide</h3>
            <p className="text-gray-600 text-sm mb-4">
              Compare materials like vinyl, mesh, PVC, aluminum, and more to choose the right option.
            </p>
            <Link to="/materials" className="text-green-600 hover:text-green-700 font-semibold text-sm">
              Read More →
            </Link>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm">
            <Ruler className="w-10 h-10 text-green-600 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Design Tips</h3>
            <p className="text-gray-600 text-sm mb-4">
              Best practices for creating effective signage that gets noticed and delivers results.
            </p>
            <Link to="/design-tips" className="text-green-600 hover:text-green-700 font-semibold text-sm">
              Read More →
            </Link>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm">
            <Package className="w-10 h-10 text-green-600 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Installation Tips</h3>
            <p className="text-gray-600 text-sm mb-4">
              Step-by-step instructions for installing different types of signs and banners.
            </p>
            <Link to="/installation" className="text-green-600 hover:text-green-700 font-semibold text-sm">
              Read More →
            </Link>
          </div>
        </div>

        <div className="mt-12 bg-white rounded-xl p-8 shadow-sm">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">What file formats do you accept?</h3>
              <p className="text-gray-600">
                We accept PDF, AI, EPS, PSD, and high-resolution JPG or PNG files. PDFs are preferred for best results.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">How long does production take?</h3>
              <p className="text-gray-600">
                Standard production is 3-5 business days. Rush and same-day options are available for many products.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Do you offer design services?</h3>
              <p className="text-gray-600">
                Yes! We offer free design review with every order. Custom design services are also available for an additional fee.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
