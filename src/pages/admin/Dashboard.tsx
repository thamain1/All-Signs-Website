import { Link } from 'react-router-dom';
import { Image, FileText, Users, Settings } from 'lucide-react';

export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">Manage your site content and media</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link
            to="/admin/media"
            className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Image className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Media Library</h2>
                <p className="text-gray-600 text-sm mt-1">Upload and manage images</p>
              </div>
            </div>
          </Link>

          <Link
            to="/admin/content"
            className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Content Manager</h2>
                <p className="text-gray-600 text-sm mt-1">Edit site content and text</p>
              </div>
            </div>
          </Link>

          <div className="bg-white rounded-lg shadow-sm p-6 opacity-50">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">User Management</h2>
                <p className="text-gray-600 text-sm mt-1">Coming soon</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 opacity-50">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Settings className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Settings</h2>
                <p className="text-gray-600 text-sm mt-1">Coming soon</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">Getting Started</h3>
          <ul className="space-y-2 text-blue-800">
            <li>1. Upload images to the Media Library</li>
            <li>2. Edit content slots to use your custom images</li>
            <li>3. Preview your changes before publishing</li>
            <li>4. Publish when ready to make changes live</li>
            <li>5. Use version history to rollback if needed</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
