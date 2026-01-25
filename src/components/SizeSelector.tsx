import { useState, useEffect } from 'react';
import { Info, AlertTriangle, Ruler } from 'lucide-react';
import {
  getSizePresetsForCategory,
  type SizePreset,
  type CategorySizePresets,
  LEGIBILITY_GUIDELINE,
} from '../lib/sizePresets';

type SizeSelectorProps = {
  categorySlug: string;
  selectedWidth?: number;
  selectedHeight?: number;
  onSizeChange: (width: number, height: number) => void;
  allowCustomSize?: boolean;
  showLegibilityGuide?: boolean;
};

export default function SizeSelector({
  categorySlug,
  selectedWidth,
  selectedHeight,
  onSizeChange,
  allowCustomSize = true,
  showLegibilityGuide = true,
}: SizeSelectorProps) {
  const [categoryPresets, setCategoryPresets] = useState<CategorySizePresets | null>(null);
  const [selectedPreset, setSelectedPreset] = useState<string>('');
  const [customWidth, setCustomWidth] = useState<string>('');
  const [customHeight, setCustomHeight] = useState<string>('');
  const [isCustom, setIsCustom] = useState(false);
  const [showTooltip, setShowTooltip] = useState<string | null>(null);
  const [viewingDistance, setViewingDistance] = useState<string>('50');

  useEffect(() => {
    const presets = getSizePresetsForCategory(categorySlug);
    if (presets) {
      setCategoryPresets(presets);

      const defaultPreset = presets.presets.find((p) => p.isDefault);
      if (defaultPreset && !selectedWidth && !selectedHeight) {
        setSelectedPreset(`${defaultPreset.width}x${defaultPreset.height}`);
        onSizeChange(defaultPreset.width, defaultPreset.height);
      } else if (selectedWidth && selectedHeight) {
        const matchingPreset = presets.presets.find(
          (p) => p.width === selectedWidth && p.height === selectedHeight
        );
        if (matchingPreset) {
          setSelectedPreset(`${matchingPreset.width}x${matchingPreset.height}`);
        } else {
          setIsCustom(true);
          setCustomWidth(selectedWidth.toString());
          setCustomHeight(selectedHeight.toString());
          setSelectedPreset('custom');
        }
      }
    }
  }, [categorySlug]);

  const handlePresetChange = (presetKey: string) => {
    setSelectedPreset(presetKey);

    if (presetKey === 'custom') {
      setIsCustom(true);
      return;
    }

    setIsCustom(false);
    const [width, height] = presetKey.split('x').map(Number);
    onSizeChange(width, height);
  };

  const handleCustomSizeApply = () => {
    const width = parseFloat(customWidth);
    const height = parseFloat(customHeight);

    if (!isNaN(width) && !isNaN(height) && width > 0 && height > 0) {
      onSizeChange(width, height);
    }
  };

  const getSelectedPresetData = (): SizePreset | null => {
    if (!categoryPresets || !selectedPreset || selectedPreset === 'custom') {
      return null;
    }
    const [width, height] = selectedPreset.split('x').map(Number);
    return categoryPresets.presets.find((p) => p.width === width && p.height === height) || null;
  };

  const calculateLetterHeight = (): string => {
    const distance = parseFloat(viewingDistance);
    if (isNaN(distance) || distance <= 0) return '5';
    return (distance * LEGIBILITY_GUIDELINE.inchesPerFoot).toFixed(1);
  };

  if (!categoryPresets) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <p className="text-sm text-gray-600">No size presets available for this category.</p>
        {allowCustomSize && (
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Width (inches)
              </label>
              <input
                type="number"
                step="0.1"
                value={customWidth}
                onChange={(e) => setCustomWidth(e.target.value)}
                onBlur={handleCustomSizeApply}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Height (inches)
              </label>
              <input
                type="number"
                step="0.1"
                value={customHeight}
                onChange={(e) => setCustomHeight(e.target.value)}
                onBlur={handleCustomSizeApply}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </div>
        )}
      </div>
    );
  }

  const selectedPresetData = getSelectedPresetData();

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-900 mb-2">
          <Ruler className="w-4 h-4 inline mr-2" />
          Size Options
        </label>

        <select
          value={selectedPreset}
          onChange={(e) => handlePresetChange(e.target.value)}
          className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent appearance-none cursor-pointer"
        >
          {categoryPresets.presets.map((preset) => (
            <option key={`${preset.width}x${preset.height}`} value={`${preset.width}x${preset.height}`}>
              {preset.name}
            </option>
          ))}
          {allowCustomSize && <option value="custom">Custom Size</option>}
        </select>
      </div>

      {selectedPresetData && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-start gap-2">
          <Info className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm text-green-900">{selectedPresetData.guidanceText}</p>
          </div>
        </div>
      )}

      {isCustom && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Width (inches)
              </label>
              <input
                type="number"
                step="0.1"
                min="0.1"
                value={customWidth}
                onChange={(e) => setCustomWidth(e.target.value)}
                onBlur={handleCustomSizeApply}
                placeholder="Enter width"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Height (inches)
              </label>
              <input
                type="number"
                step="0.1"
                min="0.1"
                value={customHeight}
                onChange={(e) => setCustomHeight(e.target.value)}
                onBlur={handleCustomSizeApply}
                placeholder="Enter height"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </div>

          {categoryPresets.customSizeWarning && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-start gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-amber-900">{categoryPresets.customSizeWarning}</p>
              </div>
            </div>
          )}
        </div>
      )}

      {showLegibilityGuide && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
          <div className="flex items-start gap-2">
            <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-blue-900 mb-1">Legibility Guide</p>
              <p className="text-sm text-blue-800">{LEGIBILITY_GUIDELINE.text}</p>
              <p className="text-xs text-blue-700 mt-1">Example: {LEGIBILITY_GUIDELINE.example}</p>
            </div>
          </div>

          <div className="pt-3 border-t border-blue-200">
            <label className="block text-sm font-medium text-blue-900 mb-2">
              Calculate for your viewing distance:
            </label>
            <div className="flex items-center gap-3">
              <input
                type="number"
                min="1"
                value={viewingDistance}
                onChange={(e) => setViewingDistance(e.target.value)}
                className="w-24 px-3 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <span className="text-sm text-blue-800">feet away</span>
              <span className="text-sm font-medium text-blue-900">
                = {calculateLetterHeight()}" letter height
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
