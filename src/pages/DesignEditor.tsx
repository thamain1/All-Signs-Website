import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import * as fabric from 'fabric';
import debounce from 'lodash.debounce';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { Design, PreflightCheck } from '../types';
import { exportCanvasToImage, runPreflightChecks, inchesToPixels } from '../lib/designStudio';
import { Loader2, Save, ShoppingCart, Type, Image as ImageIcon, Square, AlertTriangle, Check } from 'lucide-react';

export function DesignEditor() {
  const { designId } = useParams<{ designId: string }>();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const navigate = useNavigate();

  const [design, setDesign] = useState<Design | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [canvas, setCanvas] = useState<fabric.Canvas | null>(null);
  const [preflight, setPreflight] = useState<PreflightCheck | null>(null);
  const [showPreflight, setShowPreflight] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<fabric.Canvas | null>(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    loadDesign();
  }, [designId, user]);

  useEffect(() => {
    if (canvasRef.current && design && !fabricCanvasRef.current) {
      initializeCanvas();
    }

    return () => {
      if (fabricCanvasRef.current) {
        fabricCanvasRef.current.dispose();
        fabricCanvasRef.current = null;
      }
    };
  }, [design]);

  const loadDesign = async () => {
    const { data, error } = await supabase
      .from('designs')
      .select('*')
      .eq('id', designId)
      .maybeSingle();

    if (error || !data) {
      console.error('Error loading design:', error);
      navigate('/account/designs');
      return;
    }

    setDesign(data);
    setLoading(false);
  };

  const initializeCanvas = () => {
    if (!canvasRef.current || !design) return;

    const dpi = 150;
    const widthPx = inchesToPixels(design.width_in + design.bleed_in * 2, dpi);
    const heightPx = inchesToPixels(design.height_in + design.bleed_in * 2, dpi);

    const fabricCanvas = new fabric.Canvas(canvasRef.current, {
      width: Math.min(widthPx, 800),
      height: Math.min(heightPx, 600),
      backgroundColor: '#ffffff',
    });

    if (design.editor_json && design.editor_json.objects) {
      fabricCanvas.loadFromJSON(design.editor_json, () => {
        fabricCanvas.renderAll();
      });
    }

    fabricCanvas.on('object:modified', handleCanvasChange);
    fabricCanvas.on('object:added', handleCanvasChange);
    fabricCanvas.on('object:removed', handleCanvasChange);

    fabricCanvasRef.current = fabricCanvas;
    setCanvas(fabricCanvas);
  };

  const handleCanvasChange = debounce(() => {
    saveDesign();
  }, 3000);

  const saveDesign = async () => {
    if (!fabricCanvasRef.current || !design) return;

    setSaving(true);

    try {
      const editorJson = fabricCanvasRef.current.toJSON();
      const previewImage = await exportCanvasToImage(fabricCanvasRef.current, 0.5);

      const { error } = await supabase
        .from('designs')
        .update({
          editor_json: editorJson,
          preview_png_url: previewImage,
          updated_at: new Date().toISOString(),
        })
        .eq('id', design.id);

      if (!error) {
        setLastSaved(new Date());
      }
    } catch (err) {
      console.error('Save error:', err);
    } finally {
      setSaving(false);
    }
  };

  const addText = () => {
    if (!fabricCanvasRef.current) return;

    const text = new fabric.IText('Double-click to edit', {
      left: 100,
      top: 100,
      fontSize: 32,
      fill: '#000000',
      fontFamily: 'Arial',
    });

    fabricCanvasRef.current.add(text);
    fabricCanvasRef.current.setActiveObject(text);
    fabricCanvasRef.current.renderAll();
  };

  const addRectangle = () => {
    if (!fabricCanvasRef.current) return;

    const rect = new fabric.Rect({
      left: 150,
      top: 150,
      width: 200,
      height: 100,
      fill: '#3B82F6',
    });

    fabricCanvasRef.current.add(rect);
    fabricCanvasRef.current.setActiveObject(rect);
    fabricCanvasRef.current.renderAll();
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0] || !fabricCanvasRef.current) return;

    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onload = (event) => {
      const imgUrl = event.target?.result as string;

      fabric.Image.fromURL(imgUrl, (img) => {
        img.scaleToWidth(300);
        img.set({ left: 100, top: 100 });

        fabricCanvasRef.current?.add(img);
        fabricCanvasRef.current?.setActiveObject(img);
        fabricCanvasRef.current?.renderAll();
      });
    };

    reader.readAsDataURL(file);
  };

  const runPreflight = () => {
    if (!fabricCanvasRef.current || !design) return;

    const result = runPreflightChecks(fabricCanvasRef.current, {
      widthIn: design.width_in,
      heightIn: design.height_in,
      bleedIn: design.bleed_in,
      safeZoneIn: design.safe_zone_in,
    });

    setPreflight(result);
    setShowPreflight(true);
  };

  const handleAddToCart = async () => {
    if (!design || !fabricCanvasRef.current) return;

    runPreflight();

    if (preflight && !preflight.passed) {
      setShowPreflight(true);
      return;
    }

    await saveDesign();

    if (!design.product_id) {
      alert('This design is not linked to a product');
      return;
    }

    const variantSnapshot = design.variant_snapshot || {};

    await addToCart({
      product_id: design.product_id,
      quantity: variantSnapshot.quantity || 1,
      width: design.width_in,
      height: design.height_in,
      selected_options: variantSnapshot.selected_options || {},
      unit_price: variantSnapshot.unit_price || 50,
      total_price: (variantSnapshot.unit_price || 50) * (variantSnapshot.quantity || 1),
      production_speed: variantSnapshot.production_speed || 'standard',
    });

    navigate('/cart');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/account/designs')}
            className="text-gray-600 hover:text-gray-900"
          >
            ← Back
          </button>
          <h1 className="text-xl font-bold text-gray-900">{design?.name}</h1>
          {saving && (
            <span className="text-sm text-gray-500 flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              Saving...
            </span>
          )}
          {lastSaved && !saving && (
            <span className="text-sm text-gray-500 flex items-center gap-2">
              <Check className="w-4 h-4 text-green-600" />
              Saved {lastSaved.toLocaleTimeString()}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={runPreflight}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
          >
            <AlertTriangle className="w-4 h-4" />
            Check Design
          </button>
          <button
            onClick={handleAddToCart}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <ShoppingCart className="w-4 h-4" />
            Add to Cart
          </button>
        </div>
      </div>

      <div className="flex">
        <div className="w-64 bg-white border-r border-gray-200 p-4 space-y-2">
          <h3 className="font-semibold text-gray-900 mb-4">Tools</h3>

          <button
            onClick={addText}
            className="w-full flex items-center gap-3 px-4 py-3 border border-gray-200 rounded-lg hover:bg-gray-50"
          >
            <Type className="w-5 h-5 text-gray-600" />
            <span>Add Text</span>
          </button>

          <label className="w-full flex items-center gap-3 px-4 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
            <ImageIcon className="w-5 h-5 text-gray-600" />
            <span>Add Image</span>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
          </label>

          <button
            onClick={addRectangle}
            className="w-full flex items-center gap-3 px-4 py-3 border border-gray-200 rounded-lg hover:bg-gray-50"
          >
            <Square className="w-5 h-5 text-gray-600" />
            <span>Add Rectangle</span>
          </button>

          <div className="pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              Size: {design?.width_in}" × {design?.height_in}"
            </p>
            <p className="text-sm text-gray-600">
              Bleed: {design?.bleed_in}"
            </p>
            <p className="text-sm text-gray-600">
              Safe Zone: {design?.safe_zone_in}"
            </p>
          </div>
        </div>

        <div className="flex-1 p-8 flex items-center justify-center">
          <div className="bg-white p-4 rounded-lg shadow-lg">
            <canvas ref={canvasRef} />
          </div>
        </div>
      </div>

      {showPreflight && preflight && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-lg w-full max-h-[80vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">
              {preflight.passed ? 'Design Check Passed' : 'Design Check Issues'}
            </h2>

            {preflight.blockers.length > 0 && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <h3 className="font-semibold text-red-900 mb-2">Blockers</h3>
                <ul className="space-y-1">
                  {preflight.blockers.map((msg, i) => (
                    <li key={i} className="text-sm text-red-700">• {msg}</li>
                  ))}
                </ul>
              </div>
            )}

            {preflight.warnings.length > 0 && (
              <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <h3 className="font-semibold text-yellow-900 mb-2">Warnings</h3>
                <ul className="space-y-1">
                  {preflight.warnings.map((msg, i) => (
                    <li key={i} className="text-sm text-yellow-700">• {msg}</li>
                  ))}
                </ul>
              </div>
            )}

            {preflight.passed && (
              <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-900">Your design looks great and is ready to print!</p>
              </div>
            )}

            <div className="flex gap-2">
              <button
                onClick={() => setShowPreflight(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                {preflight.passed ? 'Close' : 'Fix Issues'}
              </button>
              {preflight.passed && (
                <button
                  onClick={handleAddToCart}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Continue to Cart
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
