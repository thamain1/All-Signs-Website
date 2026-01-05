import { useState, useEffect } from 'react';
import { Upload, Search, Tag, Archive, Trash2, Eye } from 'lucide-react';
import { uploadMedia, listMedia, updateMediaAsset, archiveMediaAsset, deleteMediaAsset, MediaAsset } from '../../lib/mediaLibrary';

export default function MediaLibrary() {
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [filteredAssets, setFilteredAssets] = useState<MediaAsset[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'active' | 'archived' | 'all'>('active');
  const [uploading, setUploading] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<MediaAsset | null>(null);

  useEffect(() => {
    loadAssets();
  }, []);

  useEffect(() => {
    filterAssets();
  }, [assets, searchTerm, statusFilter]);

  async function loadAssets() {
    const allAssets = await listMedia();
    setAssets(allAssets);
  }

  function filterAssets() {
    let filtered = assets;

    if (statusFilter !== 'all') {
      filtered = filtered.filter(a => a.status === statusFilter);
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(a =>
        a.title.toLowerCase().includes(term) ||
        a.alt_text.toLowerCase().includes(term) ||
        a.tags.some(t => t.toLowerCase().includes(term))
      );
    }

    setFilteredAssets(filtered);
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    setUploading(true);
    try {
      const asset = await uploadMedia({
        file,
        title: file.name,
        alt_text: '',
        tags: []
      });

      if (asset) {
        setAssets([asset, ...assets]);
        alert('Image uploaded successfully!');
      } else {
        alert('Failed to upload image. Please check console for details and ensure you have admin permissions.');
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Upload failed: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }

    setUploading(false);
    e.target.value = '';
  }

  async function handleArchive(asset: MediaAsset) {
    const success = await archiveMediaAsset(asset.id);
    if (success) {
      setAssets(assets.map(a => a.id === asset.id ? { ...a, status: 'archived' as const } : a));
    }
  }

  async function handleDelete(asset: MediaAsset) {
    if (!confirm('Permanently delete this asset? This cannot be undone.')) return;

    const success = await deleteMediaAsset(asset.id);
    if (success) {
      setAssets(assets.filter(a => a.id !== asset.id));
      if (selectedAsset?.id === asset.id) {
        setSelectedAsset(null);
      }
    }
  }

  async function handleUpdateAsset(id: string, updates: Partial<MediaAsset>) {
    const updated = await updateMediaAsset(id, updates);
    if (updated) {
      setAssets(assets.map(a => a.id === id ? updated : a));
      setSelectedAsset(updated);
    }
  }

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Media Library</h1>

          <label className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer transition-colors">
            <Upload className="w-5 h-5" />
            {uploading ? 'Uploading...' : 'Upload Image'}
            <input
              type="file"
              accept="image/*"
              onChange={handleUpload}
              disabled={uploading}
              className="hidden"
            />
          </label>
        </div>

        <div className="mb-6 flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by title, alt text, or tags..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="active">Active</option>
            <option value="archived">Archived</option>
            <option value="all">All</option>
          </select>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {filteredAssets.map(asset => (
                <div
                  key={asset.id}
                  onClick={() => setSelectedAsset(asset)}
                  className={`bg-white rounded-lg shadow-sm overflow-hidden cursor-pointer transition-all hover:shadow-md ${
                    selectedAsset?.id === asset.id ? 'ring-2 ring-blue-500' : ''
                  }`}
                >
                  <div className="aspect-square bg-gray-100 relative">
                    <img
                      src={asset.url}
                      alt={asset.alt_text || asset.title}
                      className="w-full h-full object-cover"
                    />
                    {asset.status === 'archived' && (
                      <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                        <span className="text-white font-medium">Archived</span>
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    <h3 className="font-medium text-sm text-gray-900 truncate">{asset.title}</h3>
                    <p className="text-xs text-gray-500 mt-1">
                      {(asset.byte_size / 1024).toFixed(0)} KB
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {filteredAssets.length === 0 && (
              <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                <p className="text-gray-500">No assets found</p>
              </div>
            )}
          </div>

          <div className="lg:col-span-1">
            {selectedAsset ? (
              <div className="bg-white rounded-lg shadow-sm p-6 sticky top-6">
                <div className="mb-4">
                  <img
                    src={selectedAsset.url}
                    alt={selectedAsset.alt_text}
                    className="w-full rounded-lg"
                  />
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Title
                    </label>
                    <input
                      type="text"
                      value={selectedAsset.title}
                      onChange={(e) => handleUpdateAsset(selectedAsset.id, { title: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Alt Text
                    </label>
                    <textarea
                      value={selectedAsset.alt_text}
                      onChange={(e) => handleUpdateAsset(selectedAsset.id, { alt_text: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tags (comma-separated)
                    </label>
                    <input
                      type="text"
                      value={selectedAsset.tags.join(', ')}
                      onChange={(e) => handleUpdateAsset(selectedAsset.id, {
                        tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean)
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div className="pt-4 border-t border-gray-200 space-y-2">
                    <button
                      onClick={() => copyToClipboard(selectedAsset.id)}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      <Tag className="w-4 h-4" />
                      Copy Asset ID
                    </button>

                    <button
                      onClick={() => copyToClipboard(selectedAsset.url)}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                      Copy URL
                    </button>

                    {selectedAsset.status === 'active' ? (
                      <button
                        onClick={() => handleArchive(selectedAsset)}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 transition-colors"
                      >
                        <Archive className="w-4 h-4" />
                        Archive
                      </button>
                    ) : (
                      <button
                        onClick={() => handleUpdateAsset(selectedAsset.id, { status: 'active' })}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                      >
                        <Archive className="w-4 h-4" />
                        Restore
                      </button>
                    )}

                    <button
                      onClick={() => handleDelete(selectedAsset)}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  </div>

                  <div className="pt-4 border-t border-gray-200 text-xs text-gray-500 space-y-1">
                    <p>Size: {(selectedAsset.byte_size / 1024).toFixed(2)} KB</p>
                    <p>Type: {selectedAsset.mime_type}</p>
                    <p>Created: {new Date(selectedAsset.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm p-12 text-center sticky top-6">
                <p className="text-gray-500">Select an asset to view details</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
