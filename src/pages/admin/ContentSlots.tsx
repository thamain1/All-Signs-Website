import { useState, useEffect } from 'react';
import { Save, Eye, EyeOff, Upload as UploadIcon, History, RefreshCw } from 'lucide-react';
import { listContentSlots, updateDraftValue, publishAll, listVersions, rollbackToVersion, ContentSlot, ContentVersion } from '../../lib/contentSlots';
import { listMedia, MediaAsset } from '../../lib/mediaLibrary';
import { contentResolver } from '../../lib/contentResolver';

export default function ContentSlots() {
  const [slots, setSlots] = useState<ContentSlot[]>([]);
  const [versions, setVersions] = useState<ContentVersion[]>([]);
  const [mediaAssets, setMediaAssets] = useState<MediaAsset[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<ContentSlot | null>(null);
  const [previewMode, setPreviewMode] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [showVersions, setShowVersions] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const [slotsData, versionsData, assetsData] = await Promise.all([
      listContentSlots(),
      listVersions(),
      listMedia({ status: 'active' })
    ]);

    setSlots(slotsData);
    setVersions(versionsData);
    setMediaAssets(assetsData);
  }

  function handlePreviewToggle() {
    const newMode = !previewMode;
    setPreviewMode(newMode);
    contentResolver.setPreviewMode(newMode);
  }

  async function handleUpdateSlot(slotKey: string, updates: Partial<ContentSlot['draft_value']>) {
    const slot = slots.find(s => s.slot_key === slotKey);
    if (!slot) return;

    const updatedDraft = { ...slot.draft_value, ...updates };

    const success = await updateDraftValue(slotKey, updatedDraft);

    if (success) {
      setSlots(slots.map(s =>
        s.slot_key === slotKey ? { ...s, draft_value: updatedDraft } : s
      ));

      if (selectedSlot?.slot_key === slotKey) {
        setSelectedSlot({ ...selectedSlot, draft_value: updatedDraft });
      }

      contentResolver.clearCache();
    }
  }

  async function handlePublish() {
    const notes = prompt('Enter publish notes (optional):') || '';

    setPublishing(true);
    const success = await publishAll(notes);

    if (success) {
      await loadData();
      contentResolver.clearCache();
      alert('Content published successfully!');
    } else {
      alert('Failed to publish content');
    }

    setPublishing(false);
  }

  async function handleRollback(versionId: string) {
    if (!confirm('Rollback to this version? This will overwrite current draft and published content.')) return;

    const success = await rollbackToVersion(versionId);

    if (success) {
      await loadData();
      contentResolver.clearCache();
      alert('Rollback successful!');
    } else {
      alert('Failed to rollback');
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Content Manager</h1>

          <div className="flex gap-3">
            <button
              onClick={handlePreviewToggle}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                previewMode
                  ? 'bg-purple-600 text-white hover:bg-purple-700'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {previewMode ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
              {previewMode ? 'Preview Draft' : 'Preview Off'}
            </button>

            <button
              onClick={() => setShowVersions(!showVersions)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              <History className="w-5 h-5" />
              Versions
            </button>

            <button
              onClick={handlePublish}
              disabled={publishing}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              <UploadIcon className="w-5 h-5" />
              {publishing ? 'Publishing...' : 'Publish All'}
            </button>
          </div>
        </div>

        {showVersions && (
          <div className="mb-6 bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Version History</h2>

            <div className="space-y-3">
              {versions.map(version => (
                <div
                  key={version.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div>
                    <h3 className="font-medium text-gray-900">Version {version.version}</h3>
                    <p className="text-sm text-gray-500">
                      {new Date(version.published_at).toLocaleString()}
                    </p>
                    {version.notes && (
                      <p className="text-sm text-gray-600 mt-1">{version.notes}</p>
                    )}
                  </div>

                  <button
                    onClick={() => handleRollback(version.id)}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Rollback
                  </button>
                </div>
              ))}

              {versions.length === 0 && (
                <p className="text-gray-500 text-center py-8">No versions yet</p>
              )}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="space-y-4">
              {slots.map(slot => {
                const draftValue = slot.draft_value;
                const publishedValue = slot.published_value;
                const hasChanges = JSON.stringify(draftValue) !== JSON.stringify(publishedValue);

                return (
                  <div
                    key={slot.id}
                    onClick={() => setSelectedSlot(slot)}
                    className={`bg-white rounded-lg shadow-sm p-6 cursor-pointer transition-all hover:shadow-md ${
                      selectedSlot?.id === slot.id ? 'ring-2 ring-green-500' : ''
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-32 h-32 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                        {(draftValue.url || draftValue.fallbackPath) ? (
                          <img
                            src={draftValue.url || draftValue.fallbackPath}
                            alt={draftValue.alt || 'Content image'}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              const img = e.target as HTMLImageElement;
                              if (draftValue.fallbackPath && img.src !== draftValue.fallbackPath) {
                                img.src = draftValue.fallbackPath;
                              }
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                        )}
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold text-gray-900">{slot.slot_key}</h3>
                          {hasChanges && (
                            <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded">
                              Modified
                            </span>
                          )}
                        </div>

                        {draftValue.headline && (
                          <p className="text-sm font-medium text-gray-700 mb-1">
                            {draftValue.headline}
                          </p>
                        )}

                        {draftValue.subhead && (
                          <p className="text-sm text-gray-600 mb-2">{draftValue.subhead}</p>
                        )}

                        <p className="text-xs text-gray-500">{draftValue.alt}</p>

                        <div className="mt-2 flex items-center gap-2">
                          <span className={`px-2 py-1 text-xs font-medium rounded ${
                            draftValue.enabled
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {draftValue.enabled ? 'Enabled' : 'Disabled'}
                          </span>

                          {draftValue.imageAssetId ? (
                            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded">
                              Custom Upload
                            </span>
                          ) : (
                            <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded">
                              Fallback Image
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="lg:col-span-1">
            {selectedSlot ? (
              <div className="bg-white rounded-lg shadow-sm p-6 sticky top-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Edit Slot</h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Slot Key
                    </label>
                    <input
                      type="text"
                      value={selectedSlot.slot_key}
                      disabled
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-600"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Image Source
                    </label>

                    {mediaAssets.length === 0 ? (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-3">
                        <p className="text-sm text-yellow-800 mb-2">No uploaded images available</p>
                        <a
                          href="/admin/media"
                          className="text-sm text-green-600 hover:text-green-700 font-medium"
                        >
                          Go to Media Library to upload images →
                        </a>
                      </div>
                    ) : (
                      <div className="space-y-3 mb-3">
                        <div
                          onClick={() => handleUpdateSlot(selectedSlot.slot_key, {
                            imageAssetId: undefined,
                            url: undefined
                          })}
                          className={`border-2 rounded-lg p-3 cursor-pointer transition-all ${
                            !selectedSlot.draft_value.imageAssetId
                              ? 'border-green-500 bg-green-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-16 h-16 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                              <img
                                src={selectedSlot.draft_value.fallbackPath}
                                alt="Fallback"
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="flex-1">
                              <p className="font-medium text-sm text-gray-900">Fallback Image</p>
                              <p className="text-xs text-gray-500">{selectedSlot.draft_value.fallbackPath}</p>
                            </div>
                            {!selectedSlot.draft_value.imageAssetId && (
                              <div className="w-5 h-5 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              </div>
                            )}
                          </div>
                        </div>

                        {mediaAssets.map(asset => (
                          <div
                            key={asset.id}
                            onClick={() => handleUpdateSlot(selectedSlot.slot_key, {
                              imageAssetId: asset.id,
                              url: asset.url
                            })}
                            className={`border-2 rounded-lg p-3 cursor-pointer transition-all ${
                              selectedSlot.draft_value.imageAssetId === asset.id
                                ? 'border-green-500 bg-green-50'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-16 h-16 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                                <img
                                  src={asset.url}
                                  alt={asset.alt_text || asset.title}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div className="flex-1">
                                <p className="font-medium text-sm text-gray-900">{asset.title}</p>
                                <p className="text-xs text-gray-500">
                                  {(asset.byte_size / 1024).toFixed(0)} KB • Uploaded {new Date(asset.created_at).toLocaleDateString()}
                                </p>
                              </div>
                              {selectedSlot.draft_value.imageAssetId === asset.id && (
                                <div className="w-5 h-5 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                  </svg>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Alt Text
                    </label>
                    <textarea
                      value={selectedSlot.draft_value.alt}
                      onChange={(e) => handleUpdateSlot(selectedSlot.slot_key, { alt: e.target.value })}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Headline
                    </label>
                    <input
                      type="text"
                      value={selectedSlot.draft_value.headline || ''}
                      onChange={(e) => handleUpdateSlot(selectedSlot.slot_key, { headline: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Subheadline
                    </label>
                    <textarea
                      value={selectedSlot.draft_value.subhead || ''}
                      onChange={(e) => handleUpdateSlot(selectedSlot.slot_key, { subhead: e.target.value })}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={selectedSlot.draft_value.enabled}
                        onChange={(e) => handleUpdateSlot(selectedSlot.slot_key, { enabled: e.target.checked })}
                        className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                      />
                      <span className="text-sm font-medium text-gray-700">Enabled</span>
                    </label>
                  </div>

                  <div className="pt-4 border-t border-gray-200">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Image Preview
                    </label>
                    <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden border-2 border-gray-200">
                      <img
                        src={selectedSlot.draft_value.url || selectedSlot.draft_value.fallbackPath}
                        alt={selectedSlot.draft_value.alt}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const img = e.target as HTMLImageElement;
                          img.src = selectedSlot.draft_value.fallbackPath;
                        }}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-2 text-center">
                      This is how the image will appear on the site
                    </p>
                  </div>

                  <div className="text-xs text-gray-500 space-y-1">
                    <p>Last updated: {new Date(selectedSlot.updated_at).toLocaleString()}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm p-12 text-center sticky top-6">
                <p className="text-gray-500">Select a slot to edit</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
